import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import ReviewsSection from '../components/ReviewsSection';
import { ExtendedProduct } from '../types';
import { ArrowLeft, ShoppingCart, Star, Check, Tag, TrendingUp, Package } from 'lucide-react';
import { useCart } from '../hooks/useCart';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const { addItem } = useCart();
  
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
  
  // Загрузка данных о товаре
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Загружаем товар напрямую через API
        const productResponse = await fetch(`/api/products/${id}`);
        if (!productResponse.ok) {
          throw new Error('Товар не найден');
        }
        
        const productData: ExtendedProduct = await productResponse.json();
        setProduct(productData);
        
        // Загружаем все товары для поиска похожих
        const allProductsResponse = await fetch('/api/products');
        if (allProductsResponse.ok) {
          const allProducts: ExtendedProduct[] = await allProductsResponse.json();
          const related = allProducts
            .filter(p => p.categoryId === productData.categoryId && p._id !== productData._id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Ошибка при загрузке товара:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProductData();
    }
  }, [id]);
  
  // Отладка: выводим товар в консоль при открытии страницы
  useEffect(() => {
    if (product) {
      console.log('[ProductDetail] Товар:', product);
      if (!('rating' in product)) {
        console.warn('[ProductDetail] Нет поля rating у товара!');
      }
    }
  }, [product]);
  
  // Компонент загрузки
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Загрузка информации о товаре</h2>
          <p className="text-gray-600">Пожалуйста, подождите...</p>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <Link to="/catalog" className="text-blue-600 hover:text-blue-700">
            ← Вернуться в каталог
          </Link>
        </div>
      </Layout>
    );
  }

  const finalPrice = calculateFinalPrice(product);
  const hasDiscount = product.discount?.isActive && finalPrice < product.price;

  const seoData = {
    title: `${product.name} - Купить в BT-Tech`,
    keywords: `${product.name}, ${product.category?.name?.toLowerCase() || 'товар'}, купить, цена, характеристики`,
    description: `${product.name} - ${product.description}. Цена ${Math.round(finalPrice).toLocaleString('ru-RU')} ₽. Гарантия, доставка. Купить в BT-Tech.`
  };

  // Обработчик добавления в корзину
  const handleAddToCart = () => {
    if (product.stockQuantity && product.stockQuantity > 0) {
      addItem({
        id: parseInt(product._id),
        name: product.name,
        price: Math.round(finalPrice),
        image: product.imageUrl || (product.images && product.images[0]) || '/placeholder-product.jpg',
        category: product.category?.name || 'Без категории',
        description: product.description || '',
        features: product.features || [],
        inStock: product.stockQuantity > 0,
        rating: product.rating,
        reviewCount: product.reviewCount
      }, quantity);
    }
  };

  // Проверяем статус остатков
  const getStockStatus = () => {
    if (!product.stockQuantity || product.stockQuantity === 0) {
      return { text: 'Нет в наличии', className: 'bg-red-100 text-red-800' };
    }
    if (product.stockQuantity < (product.minStockLevel || 5)) {
      return { text: 'Мало на складе', className: 'bg-orange-100 text-orange-800' };
    }
    return { text: 'В наличии', className: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus();

  return (
    <Layout seo={seoData}>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link to="/" className="text-gray-500 hover:text-blue-600">Главная</Link>
            <span className="text-gray-400">/</span>
            <Link to="/catalog" className="text-gray-500 hover:text-blue-600">Каталог</Link>
            {product.category && (
              <>
                <span className="text-gray-400">/</span>
                <Link 
                  to={`/catalog/${product.category.slug || product.category._id}`} 
                  className="text-gray-500 hover:text-blue-600"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">{product.name}</span>
          </nav>
          
          <Link
            to="/catalog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Вернуться в каталог
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
              {/* Скидка */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full flex items-center z-10">
                  <Tag size={14} className="mr-1" />
                  {product.discount?.type === 'percentage' 
                    ? `-${product.discount.value}%` 
                    : `-${product.discount?.value}₽`
                  }
                </div>
              )}
              
              {/* Рекомендуемый товар */}
              {product.isFeatured && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white text-sm px-3 py-1 rounded-full flex items-center z-10">
                  <TrendingUp size={14} className="mr-1" />
                  Хит
                </div>
              )}
              
              <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white opacity-60"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-50 via-transparent to-transparent opacity-60"></div>
                <img
                  src={product.imageUrl || (product.images && product.images[0]) || '/placeholder-product.jpg'}
                  alt={product.name}
                  title={product.name}
                  className="max-w-full max-h-full object-contain relative z-10 p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Бренд и категория */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>{product.brand || 'Без бренда'}</span>
              <span>{product.category?.name || 'Без категории'}</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            {/* Артикул */}
            {product.sku && (
              <div className="text-sm text-gray-500 mb-2">
                Артикул: {product.sku}
              </div>
            )}
            
            {/* Рейтинг и наличие */}
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={
                      typeof product.rating === 'number' && product.rating > 0 && star <= Math.round(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  ({product.reviewCount || 0} отзывов)
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.className}`}>
                {stockStatus.text}
              </span>
            </div>

            {/* Цена */}
            <div className="mb-6">
              {hasDiscount ? (
                <div className="flex items-center space-x-3">
                  <span className="text-lg text-gray-400 line-through">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-4xl font-bold text-red-600">
                    {Math.round(finalPrice).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-bold text-blue-600">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>

            {/* Краткое описание */}
            {product.shortDescription && (
              <div className="mb-6">
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>
            )}

            {/* Основные характеристики */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Основные характеристики:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Остаток на складе */}
            {product.stockQuantity !== undefined && (
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Остаток на складе: <span className="font-medium">{product.stockQuantity} шт.</span>
                  </span>
                </div>
              </div>
            )}

            {/* Количество и кнопка добавления в корзину */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-50"
                  disabled={product.stockQuantity ? quantity >= product.stockQuantity : false}
                >
                  +
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!product.stockQuantity || product.stockQuantity === 0}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-colors ${
                  product.stockQuantity && product.stockQuantity > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={20} />
                <span>
                  {product.stockQuantity && product.stockQuantity > 0 
                    ? 'Добавить в корзину' 
                    : 'Нет в наличии'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'description', label: 'Описание' },
                { id: 'specifications', label: 'Характеристики' },
                { id: 'delivery', label: 'Доставка и оплата' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Описание товара</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>
                <p className="text-gray-700 leading-relaxed">
                  Этот товар отличается высоким качеством исполнения и надежностью. 
                  Современные технологии и продуманный дизайн делают его отличным выбором для дома. 
                  Производитель предоставляет официальную гарантию и качественное сервисное обслуживание.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Технические характеристики</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features && product.features.map((feature: string, index: number) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Характеристика {index + 1}:</span>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Доставка и оплата</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3">Способы доставки:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Курьерская доставка по Москве — 500 ₽</li>
                      <li>• Самовывоз из магазина — бесплатно</li>
                      <li>• Доставка по России — от 300 ₽</li>
                      <li>• Экспресс-доставка — от 800 ₽</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Способы оплаты:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Наличными при получении</li>
                      <li>• Банковской картой при получении</li>
                      <li>• Онлайн-оплата на сайте</li>
                      <li>• Безналичный расчет (для юр. лиц)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <ReviewsSection
            productId={product._id}
            productName={product.name}
            refreshTrigger={refreshReviews}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Похожие товары</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <Link to={`/product/${relatedProduct._id}`}>
                    <div className="relative h-[180px] flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white opacity-60"></div>
                      <img
                        src={relatedProduct.imageUrl || (relatedProduct.images && relatedProduct.images[0]) || '/placeholder-product.jpg'}
                        alt={relatedProduct.name}
                        className="max-w-full max-h-full object-contain relative z-10 p-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      <Link 
                        to={`/product/${relatedProduct._id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {relatedProduct.name}
                      </Link>
                    </h3>
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {relatedProduct.price.toLocaleString('ru-RU')} ₽
                    </div>
                    <button
                      onClick={() => addItem(relatedProduct)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart size={16} />
                      <span>В корзину</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
