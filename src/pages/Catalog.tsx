import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { ExtendedProduct } from '../types';
import { 
  Filter, 
  Grid, 
  List, 
  ShoppingCart,
  Search,
  SlidersHorizontal,
  Package,
  X,
  ChevronDown,
  ArrowUpDown,
  Check,
  Tag,
  Star,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface Category {
  _id: string;
  name: string;
  slug?: string;
  count?: number;
}

const Catalog = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  
  // Состояния данных
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния фильтрации и сортировки
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [showOnlyWithDiscount, setShowOnlyWithDiscount] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const { addItem } = useCart();
  
  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/product-categories')
        ]);
        
        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        
        const productsData: ExtendedProduct[] = await productsResponse.json();
        const categoriesData: Category[] = await categoriesResponse.json();
        
        setProducts(productsData);
        setCategories([
          { _id: 'all', name: 'Все товары', slug: 'all', count: productsData.length },
          ...categoriesData.map(cat => ({
            ...cat,
            count: productsData.filter(p => p.categoryId === cat._id || p.category?._id === cat._id).length
          }))
        ]);
        
        // Устанавливаем максимальную цену на основе данных
        const maxPrice = Math.max(...productsData.map(p => p.price));
        setPriceRange([0, maxPrice]);
        
        setError(null);
      } catch (error: any) {
        console.error('Ошибка загрузки каталога:', error);
        setError('Не удалось загрузить каталог товаров');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Получаем уникальные бренды
  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  // Функция расчета финальной цены
  const calculateFinalPrice = (product: ExtendedProduct) => {
    if (!product.discount || !product.discount.isActive) {
      return product.price;
    }

    const now = new Date();
    if (product.discount.startDate && now < new Date(product.discount.startDate)) {
      return product.price;
    }
    if (product.discount.endDate && now > new Date(product.discount.endDate)) {
      return product.price;
    }

    if (product.discount.type === 'percentage') {
      return product.price * (1 - product.discount.value / 100);
    } else {
      return Math.max(0, product.price - product.discount.value);
    }
  };

  // Фильтрация и сортировка товаров
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
    
    // ВАЖНО: Показываем только АКТИВНЫЕ товары в каталоге
    filtered = filtered.filter(p => p.isActive !== false);
    
    // Фильтрация по категории
    if (category && category !== 'all') {
      filtered = filtered.filter(p => 
        p.categoryId === category || 
        p.category?._id === category ||
        p.category?.slug === category
      );
    }
    
    // Фильтрация по поиску
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.shortDescription?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.name.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Фильтрация по цене (с учетом скидок)
    filtered = filtered.filter(p => {
      const finalPrice = calculateFinalPrice(p);
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });
    
    // Фильтрация по брендам
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => 
        p.brand && selectedBrands.includes(p.brand)
      );
    }
    
    // Фильтрация по наличию
    if (showOnlyInStock) {
      filtered = filtered.filter(p => 
        p.stockQuantity && p.stockQuantity > 0
      );
    }
    
    // Фильтрация рекомендуемых
    if (showOnlyFeatured) {
      filtered = filtered.filter(p => p.isFeatured);
    }
    
    // Фильтрация со скидкой
    if (showOnlyWithDiscount) {
      filtered = filtered.filter(p => 
        p.discount?.isActive && calculateFinalPrice(p) < p.price
      );
    }
    
    // Фильтрация по рейтингу
    if (minRating > 0) {
      filtered = filtered.filter(p => 
        p.rating && p.rating >= minRating
      );
    }
    
    // Сортировка
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return calculateFinalPrice(a) - calculateFinalPrice(b);
        case 'price-desc':
          return calculateFinalPrice(b) - calculateFinalPrice(a);
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [category, sortBy, priceRange, searchQuery, products, selectedBrands, showOnlyInStock, showOnlyFeatured, showOnlyWithDiscount, minRating]);

  // Получение текущей категории
  const currentCategory = useMemo(() => {
    return categories.find(cat => 
      cat.slug === category || 
      cat._id === category
    ) || categories[0];
  }, [categories, category]);

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  // SEO данные
  const seoData = {
    title: `${currentCategory?.name || 'Каталог'} - BT-Tech`,
    keywords: `${currentCategory?.name?.toLowerCase() || 'каталог'}, бытовая техника, интернет магазин, купить, цены`,
    description: `Купить ${currentCategory?.name?.toLowerCase() || 'бытовую технику'} в интернет-магазине BT-Tech. Широкий выбор, гарантия качества, быстрая доставка.`
  };

  // Компонент загрузки
  if (loading) {
    return (
      <Layout seo={seoData}>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Загрузка каталога</h2>
              <p className="text-gray-600">Пожалуйста, подождите...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Компонент ошибки
  if (error) {
    return (
      <Layout seo={seoData}>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-4">{error}</h2>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout seo={seoData}>
      {/* Хлебные крошки и заголовок */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm mb-2">
            <Link to="/" className="text-gray-500 hover:text-blue-600">
              Главная
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/catalog" className="text-gray-500 hover:text-blue-600">
              Каталог
            </Link>
            {category && category !== 'all' && currentCategory && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-700">{currentCategory.name}</span>
              </>
            )}
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">
              {currentCategory?.name || 'Каталог товаров'}
            </h1>
            <div className="text-sm text-gray-500">
              Найдено товаров: {filteredAndSortedProducts.length}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Боковая панель с фильтрами */}
          <div className="lg:w-1/4">
            <div className="sticky top-4 space-y-6">
              {/* Поиск */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Search size={18} className="mr-2" />
                  Поиск
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Категории */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Package size={18} className="mr-2" />
                  Категории
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/catalog/${cat.slug || cat._id}`}
                      className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors ${
                        (category === cat.slug || category === cat._id || (!category && cat._id === 'all'))
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-700'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-sm text-gray-500">({cat.count || 0})</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Фильтры */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Filter size={18} className="mr-2" />
                  Фильтры
                </h3>

                {/* Быстрые фильтры */}
                <div className="space-y-3 mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showOnlyInStock}
                      onChange={(e) => setShowOnlyInStock(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Только в наличии</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showOnlyFeatured}
                      onChange={(e) => setShowOnlyFeatured(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      Хиты продаж
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showOnlyWithDiscount}
                      onChange={(e) => setShowOnlyWithDiscount(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm flex items-center">
                      <Tag size={14} className="mr-1" />
                      Со скидкой
                    </span>
                  </label>
                </div>

                {/* Фильтр по цене */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Цена: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(...products.map(p => p.price))}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max={Math.max(...products.map(p => p.price))}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Фильтр по рейтингу */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Минимальный рейтинг
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                        className={`p-1 ${minRating >= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star size={16} className="fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Фильтр по брендам */}
                {availableBrands.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Бренды
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableBrands.map((brand) => (
                        <label key={brand} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand]);
                              } else {
                                setSelectedBrands(selectedBrands.filter(b => b !== brand));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Кнопка сброса фильтров */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange([0, Math.max(...products.map(p => p.price))]);
                    setSelectedBrands([]);
                    setShowOnlyInStock(false);
                    setShowOnlyFeatured(false);
                    setShowOnlyWithDiscount(false);
                    setMinRating(0);
                  }}
                  className="w-full mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="lg:w-3/4">
            {/* Панель управления */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <span className="text-sm text-gray-600">
                  Показано {filteredAndSortedProducts.length} из {products.length} товаров
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Сортировка */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">По названию (А-Я)</option>
                  <option value="name-desc">По названию (Я-А)</option>
                  <option value="price-asc">По цене (возрастание)</option>
                  <option value="price-desc">По цене (убывание)</option>
                  <option value="rating-desc">По рейтингу</option>
                  <option value="newest">Сначала новые</option>
                  <option value="featured">Сначала хиты</option>
                </select>

                {/* Переключение вида */}
                <div className="flex border border-gray-300 rounded overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="Сетка"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="Список"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Товары */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Товары не найдены
                </h3>
                <p className="text-gray-600 mb-4">
                  Попробуйте изменить фильтры или поисковый запрос
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange([0, Math.max(...products.map(p => p.price))]);
                    setSelectedBrands([]);
                    setShowOnlyInStock(false);
                    setShowOnlyFeatured(false);
                    setShowOnlyWithDiscount(false);
                    setMinRating(0);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredAndSortedProducts.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCard key={product._id} product={product} />
                  ) : (
                    <div key={product._id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
                      <img
                        src={product.imageUrl || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.shortDescription}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(calculateFinalPrice(product))}
                          </span>
                          <div className="flex space-x-2">
                            <Link
                              to={`/catalog/product/${product._id}`}
                              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
                            >
                              <Eye size={16} />
                            </Link>
                            <button
                              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                              onClick={() => addItem({
                                id: parseInt(product._id),
                                name: product.name,
                                price: Math.round(calculateFinalPrice(product)),
                                image: product.imageUrl || '/placeholder-product.jpg',
                                category: product.category?.name || 'Без категории',
                                description: product.description || '',
                                features: product.features || [],
                                inStock: (product.stockQuantity || 0) > 0,
                                rating: product.rating,
                                reviewCount: product.reviewCount
                              })}
                            >
                              <ShoppingCart size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;
