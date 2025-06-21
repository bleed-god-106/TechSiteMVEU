import React, { useState, useEffect, useRef } from 'react';
import { ExtendedProduct, ProductDiscount } from '../../types';
import { Package, Plus, Edit, Trash2, Save, X, Tag, Star, Image, Info, Settings, Calendar, DollarSign, ExternalLink, FileText, AlertCircle, CheckCircle, Folder, RefreshCw, List, Ruler } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';

// Простая заглушка для toast
const toast = ({ title, description, variant }: any) => {
  if (variant === 'destructive') {
    alert(`Ошибка: ${description}`);
  } else {
    alert(`${title}: ${description}`);
  }
};

interface Category {
  _id: string;
  name: string;
}

interface ProductsManagementProps {
  highlightedItem?: { id: string; type: string } | null;
}

export default function ProductsManagementFull({ highlightedItem }: ProductsManagementProps) {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Основные поля формы
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    imageUrl: '',
    images: [] as string[],
    features: [] as string[],
    specifications: {} as { [key: string]: string },
    tags: [] as string[],
    brand: '',
    productModel: '',
    sku: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    stockQuantity: '',
    minStockLevel: '',
    isActive: true,
    isFeatured: false,
    seo: { title: '', description: '', keywords: [] }
  });

  // Поля скидки
  const [discountData, setDiscountData] = useState<ProductDiscount>({
    type: 'percentage',
    value: 0,
    startDate: undefined,
    endDate: undefined,
    isActive: false
  });

  const highlightedProductRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (highlightedItem && highlightedItem.type === 'product' && highlightedProductRef.current) {
      highlightedProductRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightedItem, products]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Для загрузки товаров токен не нужен, но для категорий может потребоваться
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/product-categories')
      ]);

      if (!productsResponse.ok || !categoriesResponse.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();
      
      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      imageUrl: '',
      images: [],
      features: [],
      specifications: {},
      tags: [],
      brand: '',
      productModel: '',
      sku: '',
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      stockQuantity: '',
      minStockLevel: '',
      isActive: true,
      isFeatured: false,
      seo: { title: '', description: '', keywords: [] }
    });
    setDiscountData({
      type: 'percentage',
      value: 0,
      startDate: undefined,
      endDate: undefined,
      isActive: false
    });
    setEditingProduct(null);
    setShowAddForm(false);
    setActiveTab('basic');
  };

  const handleEdit = (product: ExtendedProduct) => {
    setEditingProduct(product._id);
    setFormData({
      name: product.name,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      categoryId: product.categoryId || '',
      imageUrl: product.imageUrl || '',
      images: product.images || [],
      features: product.features || [],
      specifications: product.specifications || {},
      tags: product.tags || [],
      brand: product.brand || '',
      productModel: product.productModel || '',
      sku: product.sku || '',
      weight: product.weight?.toString() || '',
      dimensions: {
        length: product.dimensions?.length?.toString() || '',
        width: product.dimensions?.width?.toString() || '',
        height: product.dimensions?.height?.toString() || ''
      },
      stockQuantity: product.stockQuantity?.toString() || '',
      minStockLevel: product.minStockLevel?.toString() || '',
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured === true,
      seo: product.seo || { title: '', description: '', keywords: [] }
    });
    
    // Исправляем проблему с датами - проверяем тип и конвертируем строки в Date
    if (product.discount) {
      setDiscountData({
        isActive: product.discount.isActive || false,
        type: product.discount.type || 'percentage',
        value: product.discount.value || 0,
        startDate: product.discount.startDate ? 
          (product.discount.startDate instanceof Date ? 
            product.discount.startDate : 
            new Date(product.discount.startDate)) : 
          undefined,
        endDate: product.discount.endDate ? 
          (product.discount.endDate instanceof Date ? 
            product.discount.endDate : 
            new Date(product.discount.endDate)) : 
          undefined
      });
    } else {
      setDiscountData({
        isActive: false,
        type: 'percentage',
        value: 0,
        startDate: undefined,
        endDate: undefined
      });
    }
    
    setShowAddForm(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.price) {
        toast({
          title: "Ошибка",
          description: "Название и цена обязательны",
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Ошибка",
          description: "Необходима авторизация",
          variant: "destructive",
        });
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: discountData.isActive ? discountData : undefined,
        categoryId: formData.categoryId || undefined,
        imageUrl: formData.imageUrl || '/placeholder-product.jpg',
        images: formData.images,
        features: formData.features,
        specifications: formData.specifications,
        tags: formData.tags,
        brand: formData.brand,
        model: formData.productModel,
        sku: formData.sku || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) ? {
          length: parseFloat(formData.dimensions.length) || 0,
          width: parseFloat(formData.dimensions.width) || 0,
          height: parseFloat(formData.dimensions.height) || 0
        } : undefined,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : 0,
        minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : 5,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        seo: formData.seo
      };

      const url = editingProduct ? `/api/products/${editingProduct}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      console.log('Отправка запроса:', { method, url, token: token ? 'есть' : 'нет' });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Ошибка ответа сервера:', error);
        throw new Error(error.error || 'Ошибка сохранения товара');
      }

      toast({
        title: editingProduct ? "Товар обновлен" : "Товар создан",
        description: editingProduct ? "Товар успешно обновлен" : "Новый товар успешно создан",
      });

      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Ошибка сохранения товара:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить товар",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${productName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Ошибка",
          description: "Необходима авторизация",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка удаления товара');
      }

      setProducts(products.filter(p => p._id !== productId));
      toast({
        title: "Товар удален",
        description: `Товар "${productName}" был удален`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить товар",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Package className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление товарами</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление товарами</h2>
          <Badge variant="secondary" className="ml-2">
            {products.length} товаров
          </Badge>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={loadData}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            title="Обновить список товаров"
          >
            <RefreshCw size={16} className="mr-2" />
            Обновить
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2" size={16} />
            Добавить товар
          </Button>
        </div>
      </div>

      {/* Быстрые фильтры и статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 rounded-lg p-4 border border-blue-200/50 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Всего товаров</p>
              <p className="text-2xl font-bold text-blue-800">{products.length}</p>
            </div>
            <Package className="text-blue-600/70" size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50/80 to-green-100/60 rounded-lg p-4 border border-green-200/50 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Активных</p>
              <p className="text-2xl font-bold text-green-800">
                {products.filter(p => p.isActive !== false).length}
              </p>
            </div>
            <CheckCircle className="text-green-600/70" size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50/80 to-yellow-100/60 rounded-lg p-4 border border-yellow-200/50 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Со скидкой</p>
              <p className="text-2xl font-bold text-yellow-800">
                {products.filter(p => p.discount?.isActive).length}
              </p>
            </div>
            <Tag className="text-yellow-600/70" size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50/80 to-red-100/60 rounded-lg p-4 border border-red-200/50 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Заканчивается</p>
              <p className="text-2xl font-bold text-red-800">
                {products.filter(p => p.stockQuantity && p.stockQuantity < (p.minStockLevel || 5)).length}
              </p>
            </div>
            <AlertCircle className="text-red-600/70" size={32} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Товары не найдены</h3>
            <p className="text-gray-500 mb-6">Начните с добавления первого товара в каталог</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2" size={16} />
              Добавить первый товар
            </Button>
          </div>
        ) : (
          products.map((product) => {
            const isHighlighted = highlightedItem?.id === product._id && highlightedItem?.type === 'product';
            const finalPrice = calculateFinalPrice(product);
            const hasDiscount = product.discount?.isActive && finalPrice < product.price;
            const stockStatus = product.stockQuantity === 0 ? 'out' : 
                              product.stockQuantity && product.stockQuantity < (product.minStockLevel || 5) ? 'low' : 'good';
            
            // Генерируем slug для ссылки на товар
            const productSlug = product.name.toLowerCase()
              .replace(/[^а-яё\w\s]/gi, '')
              .replace(/\s+/g, '-')
              .substring(0, 50);

            return (
              <div
                key={product._id}
                ref={isHighlighted ? highlightedProductRef : undefined}
                className={`border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isHighlighted ? 'bg-yellow-50 border-yellow-300 shadow-lg' : 
                  'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Заголовок карточки */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-800 hover:text-blue-600 transition-colors">
                          <a 
                            href={`/catalog/product/${product._id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:underline"
                            title="Открыть страницу товара"
                          >
                            {product.name}
                            <ExternalLink size={16} className="text-blue-500" />
                          </a>
                        </h3>
                      </div>
                      
                      {/* Статусные бейджи */}
                      <div className="flex flex-wrap gap-2">
                        {product.isFeatured && (
                          <Badge className="bg-gradient-to-r from-yellow-400/80 to-orange-400/80 text-white border-0 shadow-sm backdrop-blur-sm">
                            <Star size={12} className="mr-1 fill-current" />
                            Рекомендуемый
                          </Badge>
                        )}
                        
                        {!product.isActive ? (
                          <Badge className="bg-gradient-to-r from-red-500/90 to-red-600/90 text-white border-0 shadow-md">
                            <AlertCircle size={12} className="mr-1" />
                            Неактивен
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-green-500/80 to-green-600/80 text-white border-0 shadow-sm">
                            <CheckCircle size={12} className="mr-1" />
                            Активен
                          </Badge>
                        )}
                        
                        {hasDiscount && (
                          <Badge 
                            className="bg-gradient-to-r from-emerald-500/85 to-teal-500/85 text-white border-0 shadow-sm cursor-help backdrop-blur-sm hover:from-emerald-600/90 hover:to-teal-600/90 transition-all duration-200"
                            title={`Скидка действует ${product.discount?.startDate ? 'с ' + new Date(product.discount.startDate).toLocaleDateString() : ''} ${product.discount?.endDate ? 'до ' + new Date(product.discount.endDate).toLocaleDateString() : ''}`}
                          >
                            <Tag size={12} className="mr-1" />
                            {product.discount?.type === 'percentage' ? 
                              `Скидка ${product.discount.value}%` : 
                              `Скидка ${product.discount?.value}₽`
                            }
                          </Badge>
                        )}
                        
                        {/* Статус склада */}
                        <Badge className={`border-0 shadow-sm backdrop-blur-sm transition-all duration-200 ${
                          stockStatus === 'out' ? 'bg-gradient-to-r from-red-500/90 to-red-600/90 text-white' :
                          stockStatus === 'low' ? 'bg-gradient-to-r from-orange-500/85 to-yellow-500/85 text-white hover:from-orange-600/90 hover:to-yellow-600/90' :
                          'bg-gradient-to-r from-green-500/80 to-green-600/80 text-white hover:from-green-600/85 hover:to-green-700/85'
                        }`}>
                          <Package size={12} className="mr-1" />
                          {stockStatus === 'out' ? 'Нет в наличии' :
                           stockStatus === 'low' ? 'Заканчивается' :
                           'В наличии'}
                        </Badge>
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                        title="Редактировать товар"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product._id, product.name)}
                        className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
                        title="Удалить товар"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Основная информация */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                    {/* Цена */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="font-semibold text-gray-700">Цена</span>
                      </div>
                      {hasDiscount ? (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {formatPrice(finalPrice)}
                          </div>
                          <div className="text-xs text-green-600">
                            Экономия: {formatPrice(product.price - finalPrice)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-gray-800">
                          {formatPrice(product.price)}
                        </div>
                      )}
                    </div>
                    
                    {/* Категория */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Folder size={16} className="text-blue-600" />
                        <span className="font-semibold text-gray-700">Категория</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {product.category?.name || 'Без категории'}
                      </div>
                    </div>
                    
                    {/* Остаток */}
                    <div className={`rounded-lg p-4 ${
                      stockStatus === 'out' ? 'bg-red-50' :
                      stockStatus === 'low' ? 'bg-orange-50' :
                      'bg-green-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Package size={16} className={
                          stockStatus === 'out' ? 'text-red-600' :
                          stockStatus === 'low' ? 'text-orange-600' :
                          'text-green-600'
                        } />
                        <span className="font-semibold text-gray-700">Остаток</span>
                      </div>
                      <div className={`text-lg font-bold ${
                        stockStatus === 'out' ? 'text-red-600' :
                        stockStatus === 'low' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {product.stockQuantity || 0} шт.
                      </div>
                      {product.minStockLevel && (
                        <div className="text-xs text-gray-500 mt-1">
                          Мин. остаток: {product.minStockLevel} шт.
                        </div>
                      )}
                    </div>

                    {/* Дополнительная информация */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info size={16} className="text-purple-600" />
                        <span className="font-semibold text-gray-700">Детали</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {product.brand && (
                          <div>Бренд: <span className="font-medium">{product.brand}</span></div>
                        )}
                        {product.sku && (
                          <div>Артикул: <span className="font-medium">{product.sku}</span></div>
                        )}
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500 fill-current" />
                            <span>{product.rating}</span>
                            {product.reviewCount && (
                              <span className="text-gray-400">({product.reviewCount})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Краткое описание */}
                  {product.shortDescription && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-gray-600" />
                        <span className="font-semibold text-gray-700">Описание</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>
                  )}

                  {/* Характеристики */}
                  {product.features && product.features.length > 0 && (
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Settings size={16} className="text-indigo-600" />
                        <span className="font-semibold text-gray-700">Особенности</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.features.slice(0, 6).map((feature, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            {feature}
                          </Badge>
                        ))}
                        {product.features.length > 6 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-indigo-100 border-indigo-300 text-indigo-700"
                          >
                            +{product.features.length - 6} еще
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Полноэкранное модальное окно для создания/редактирования товара */}
      {(showAddForm || editingProduct !== null) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-[1600px] min-h-screen bg-white rounded-lg shadow-2xl flex flex-col my-4">
            {/* Заголовок - фиксированный */}
            <div className="flex-shrink-0 px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package size={24} className="text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
                  </h2>
                </div>
                <button 
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Контент с вкладками */}
            <div className="flex-1 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                {/* Вкладки - фиксированные */}
                <div className="flex-shrink-0 px-8 py-4 bg-gray-50/50 border-b">
                  <TabsList className="grid w-full grid-cols-5 h-14 bg-white shadow-sm">
                    <TabsTrigger value="basic" className="text-sm font-medium py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">📝</span>
                        <span>Основное</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="text-sm font-medium py-3 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">💰</span>
                        <span>Цены/Скидки</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="details" className="text-sm font-medium py-3 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">🔧</span>
                        <span>Детали</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="text-sm font-medium py-3 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">📦</span>
                        <span>Склад</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="text-sm font-medium py-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">🔍</span>
                        <span>SEO</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Контент вкладок - прокручиваемый */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  <TabsContent value="basic" className="mt-0 space-y-8">
                    {/* Основная информация */}
                    <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-lg p-6 border border-blue-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Package size={18} className="text-blue-600" />
                        <h4 className="font-semibold text-gray-800">Основная информация</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                            <span className="text-red-500">*</span>
                            Название товара
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Введите название товара"
                            className="h-10"
                            required
                          />
                          <p className="text-xs text-gray-500">Максимум 200 символов</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium">Категория</Label>
                          <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category._id} value={category._id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Описания */}
                    <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-lg p-6 border border-green-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText size={18} className="text-green-600" />
                        <h4 className="font-semibold text-gray-800">Описания товара</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="shortDescription" className="text-sm font-medium">Краткое описание</Label>
                          <Textarea
                            id="shortDescription"
                            value={formData.shortDescription}
                            onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                            placeholder="Краткое описание для карточек товара"
                            rows={2}
                            className="resize-none"
                            maxLength={500}
                          />
                          <p className="text-xs text-gray-500">Максимум 500 символов. Отображается в каталоге.</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium">Полное описание</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Подробное описание товара с характеристиками"
                            rows={4}
                            className="resize-none"
                          />
                          <p className="text-xs text-gray-500">Подробное описание для страницы товара.</p>
                        </div>
                      </div>
                    </div>

                    {/* Изображения и настройки */}
                    <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-lg p-6 border border-purple-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Image size={18} className="text-purple-600" />
                        <h4 className="font-semibold text-gray-800">Изображения и настройки</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl" className="text-sm font-medium">URL главного изображения</Label>
                          <Input
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                            className="h-10"
                          />
                          <p className="text-xs text-gray-500">Основное изображение товара для каталога.</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Дополнительные изображения</Label>
                          <Textarea
                            value={formData.images.join('\n')}
                            onChange={(e) => setFormData({...formData, images: e.target.value.split('\n').filter(url => url.trim())})}
                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;Каждый URL с новой строки"
                            rows={3}
                            className="resize-none"
                          />
                          <p className="text-xs text-gray-500">Дополнительные изображения для галереи товара.</p>
                        </div>

                        <div className="flex items-center justify-center space-x-12 pt-4 border-t border-purple-200/50">
                          <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 border border-green-200/50">
                            <Switch
                              checked={formData.isActive}
                              onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                            />
                            <div>
                              <Label className="text-sm font-medium text-green-700">Активен</Label>
                              <p className="text-xs text-gray-500">
                                {formData.isActive ? '✅ Товар виден покупателям' : '❌ Товар скрыт'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 border border-yellow-200/50">
                            <Switch
                              checked={formData.isFeatured}
                              onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})}
                            />
                            <div>
                              <Label className="text-sm font-medium text-yellow-700">Рекомендуемый</Label>
                              <p className="text-xs text-gray-500">
                                {formData.isFeatured ? '⭐ Отображается в рекомендуемых' : 'Обычный товар'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="mt-0 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-medium">Цена *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0.00"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice" className="text-sm font-medium">Оригинальная цена</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                          placeholder="0.00"
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-6 space-y-6 bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Tag className="text-blue-600" size={20} />
                          <h4 className="font-semibold text-lg text-gray-800">Настройки скидки</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {discountData.isActive ? 'Включена' : 'Выключена'}
                          </span>
                          <Switch
                            checked={discountData.isActive}
                            onCheckedChange={(checked) => setDiscountData({...discountData, isActive: checked})}
                          />
                        </div>
                      </div>

                      {discountData.isActive && (
                        <div className="space-y-6 bg-white rounded-lg p-4 border border-blue-200/50">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Settings size={14} className="text-blue-600" />
                                Тип скидки
                              </Label>
                              <Select 
                                value={discountData.type} 
                                onValueChange={(value: 'percentage' | 'fixed') => setDiscountData({...discountData, type: value})}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">
                                    <div className="flex items-center gap-2">
                                      <span>📊</span>
                                      Процент (%)
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="fixed">
                                    <div className="flex items-center gap-2">
                                      <span>💰</span>
                                      Фиксированная сумма (₽)
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <DollarSign size={14} className="text-green-600" />
                                Размер скидки
                              </Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={discountData.value}
                                  onChange={(e) => setDiscountData({...discountData, value: parseFloat(e.target.value) || 0})}
                                  placeholder={discountData.type === 'percentage' ? '10' : '100'}
                                  className="h-10 pr-8"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                  {discountData.type === 'percentage' ? '%' : '₽'}
                                </span>
                              </div>
                              {discountData.value > 0 && formData.price && (
                                <p className="text-xs text-green-600">
                                  Цена со скидкой: {discountData.type === 'percentage' 
                                    ? `${(parseFloat(formData.price) * (1 - discountData.value / 100)).toFixed(2)} ₽`
                                    : `${(parseFloat(formData.price) - discountData.value).toFixed(2)} ₽`
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar size={16} className="text-blue-600" />
                              <h5 className="font-medium text-gray-700">Период действия скидки</h5>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Дата начала - упрощенная версия */}
                              <div className="space-y-3 bg-green-50/50 rounded-lg p-4 border border-green-200/50">
                                <Label className="text-sm font-medium text-green-700 flex items-center gap-2">
                                  <span>🟢</span>
                                  Дата и время начала
                                </Label>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs text-gray-600">Дата</Label>
                                      <Input
                                        type="date"
                                        value={discountData.startDate ? 
                                          (discountData.startDate instanceof Date ? 
                                            discountData.startDate.toISOString().split('T')[0] : 
                                            new Date(discountData.startDate).toISOString().split('T')[0]) : 
                                          ''}
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            const currentTime = discountData.startDate ? 
                                              (discountData.startDate instanceof Date ? 
                                                discountData.startDate.toTimeString().split(' ')[0] : 
                                                new Date(discountData.startDate).toTimeString().split(' ')[0]) : 
                                              '00:00:00';
                                            const newDateTime = new Date(`${e.target.value}T${currentTime}`);
                                            setDiscountData({...discountData, startDate: newDateTime});
                                          } else {
                                            setDiscountData({...discountData, startDate: undefined});
                                          }
                                        }}
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-600">Время</Label>
                                      <Input
                                        type="time"
                                        value={discountData.startDate ? 
                                          (discountData.startDate instanceof Date ? 
                                            discountData.startDate.toTimeString().split(' ')[0].slice(0, 5) : 
                                            new Date(discountData.startDate).toTimeString().split(' ')[0].slice(0, 5)) : 
                                          ''}
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            const currentDate = discountData.startDate ? 
                                              (discountData.startDate instanceof Date ? 
                                                discountData.startDate.toISOString().split('T')[0] : 
                                                new Date(discountData.startDate).toISOString().split('T')[0]) : 
                                              new Date().toISOString().split('T')[0];
                                            const newDateTime = new Date(`${currentDate}T${e.target.value}:00`);
                                            setDiscountData({...discountData, startDate: newDateTime});
                                          }
                                        }}
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Текстовый ввод для удобства */}
                                  <div>
                                    <Label className="text-xs text-gray-600">Или введите вручную (дд.мм.гггг чч:мм)</Label>
                                    <Input
                                      type="text"
                                      placeholder="18.05.2025 22:00"
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Парсим формат дд.мм.гггг чч:мм
                                        const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/);
                                        if (match) {
                                          const [, day, month, year, hour, minute] = match;
                                          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
                                          if (!isNaN(date.getTime())) {
                                            setDiscountData({...discountData, startDate: date});
                                          }
                                        }
                                      }}
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setDiscountData({...discountData, startDate: new Date()})}
                                      className="text-xs h-7 px-2 text-green-600 border-green-300 hover:bg-green-50"
                                    >
                                      Сейчас
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setDiscountData({...discountData, startDate: undefined})}
                                      className="text-xs h-7 px-2 text-gray-500 hover:bg-gray-50"
                                    >
                                      Очистить
                                    </Button>
                                  </div>
                                  
                                  {discountData.startDate && (
                                    <div className="bg-white rounded p-2 border border-green-200">
                                      <p className="text-xs text-green-600 font-medium">
                                        Скидка начнется: {(discountData.startDate instanceof Date ? 
                                          discountData.startDate : 
                                          new Date(discountData.startDate)).toLocaleString('ru-RU')}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Дата окончания - упрощенная версия */}
                              <div className="space-y-3 bg-red-50/50 rounded-lg p-4 border border-red-200/50">
                                <Label className="text-sm font-medium text-red-700 flex items-center gap-2">
                                  <span>🔴</span>
                                  Дата и время окончания
                                </Label>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs text-gray-600">Дата</Label>
                                      <Input
                                        type="date"
                                        value={discountData.endDate ? 
                                          (discountData.endDate instanceof Date ? 
                                            discountData.endDate.toISOString().split('T')[0] : 
                                            new Date(discountData.endDate).toISOString().split('T')[0]) : 
                                          ''}
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            const currentTime = discountData.endDate ? 
                                              (discountData.endDate instanceof Date ? 
                                                discountData.endDate.toTimeString().split(' ')[0] : 
                                                new Date(discountData.endDate).toTimeString().split(' ')[0]) : 
                                              '23:59:59';
                                            const newDateTime = new Date(`${e.target.value}T${currentTime}`);
                                            setDiscountData({...discountData, endDate: newDateTime});
                                          } else {
                                            setDiscountData({...discountData, endDate: undefined});
                                          }
                                        }}
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-600">Время</Label>
                                      <Input
                                        type="time"
                                        value={discountData.endDate ? 
                                          (discountData.endDate instanceof Date ? 
                                            discountData.endDate.toTimeString().split(' ')[0].slice(0, 5) : 
                                            new Date(discountData.endDate).toTimeString().split(' ')[0].slice(0, 5)) : 
                                          ''}
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            const currentDate = discountData.endDate ? 
                                              (discountData.endDate instanceof Date ? 
                                                discountData.endDate.toISOString().split('T')[0] : 
                                                new Date(discountData.endDate).toISOString().split('T')[0]) : 
                                              new Date().toISOString().split('T')[0];
                                            const newDateTime = new Date(`${currentDate}T${e.target.value}:00`);
                                            setDiscountData({...discountData, endDate: newDateTime});
                                          }
                                        }}
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Текстовый ввод для удобства */}
                                  <div>
                                    <Label className="text-xs text-gray-600">Или введите вручную (дд.мм.гггг чч:мм)</Label>
                                    <Input
                                      type="text"
                                      placeholder="22.06.2025 12:02"
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Парсим формат дд.мм.гггг чч:мм
                                        const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/);
                                        if (match) {
                                          const [, day, month, year, hour, minute] = match;
                                          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
                                          if (!isNaN(date.getTime())) {
                                            setDiscountData({...discountData, endDate: date});
                                          }
                                        }
                                      }}
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const date = new Date();
                                        date.setDate(date.getDate() + 7);
                                        date.setHours(23, 59, 59);
                                        setDiscountData({...discountData, endDate: date});
                                      }}
                                      className="text-xs h-7 px-2 text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                      +7 дней
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setDiscountData({...discountData, endDate: undefined})}
                                      className="text-xs h-7 px-2 text-gray-500 hover:bg-gray-50"
                                    >
                                      Очистить
                                    </Button>
                                  </div>
                                  
                                  {discountData.endDate && (
                                    <div className="bg-white rounded p-2 border border-red-200">
                                      <p className="text-xs text-red-600 font-medium">
                                        Скидка закончится: {(discountData.endDate instanceof Date ? 
                                          discountData.endDate : 
                                          new Date(discountData.endDate)).toLocaleString('ru-RU')}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-0 space-y-6">
                    {/* Идентификация товара */}
                    <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-lg p-6 border border-blue-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Tag size={18} className="text-blue-600" />
                        <h4 className="font-semibold text-gray-800">Идентификация товара</h4>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="brand" className="text-sm font-medium">Бренд</Label>
                          <Input
                            id="brand"
                            value={formData.brand}
                            onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            placeholder="Samsung, Apple, LG..."
                            className="h-10"
                          />
                          <p className="text-xs text-gray-500">Производитель товара</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="productModel" className="text-sm font-medium">Модель</Label>
                          <Input
                            id="productModel"
                            value={formData.productModel}
                            onChange={(e) => setFormData({...formData, productModel: e.target.value})}
                            placeholder="Galaxy S24, iPhone 15..."
                            className="h-10"
                          />
                          <p className="text-xs text-gray-500">Модель товара</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sku" className="text-sm font-medium">Артикул (SKU)</Label>
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({...formData, sku: e.target.value})}
                            placeholder="SKU-12345"
                            className="h-10"
                          />
                          <p className="text-xs text-gray-500">Уникальный артикул</p>
                        </div>
                      </div>
                    </div>

                    {/* Характеристики */}
                    <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-lg p-6 border border-green-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <List size={18} className="text-green-600" />
                        <h4 className="font-semibold text-gray-800">Характеристики и теги</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Основные характеристики</Label>
                          <Textarea
                            value={formData.features.join('\n')}
                            onChange={(e) => setFormData({...formData, features: e.target.value.split('\n').filter(f => f.trim())})}
                            placeholder="Диагональ экрана: 6.1 дюйма&#10;Объем памяти: 128 ГБ&#10;Камера: 48 МП&#10;Каждая характеристика с новой строки"
                            rows={5}
                            className="resize-none"
                          />
                          <p className="text-xs text-gray-500">Основные характеристики товара. Каждая с новой строки.</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Теги для поиска</Label>
                          <Input
                            value={formData.tags.join(', ')}
                            onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                            placeholder="смартфон, телефон, мобильный, андроид"
                            className="h-10"
                          />
                          <p className="text-xs text-gray-500">Теги через запятую для улучшения поиска.</p>
                        </div>
                      </div>
                    </div>

                    {/* Технические характеристики */}
                    <div className="bg-gradient-to-br from-orange-50/50 to-red-50/30 rounded-lg p-6 border border-orange-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings size={18} className="text-orange-600" />
                        <h4 className="font-semibold text-gray-800">Технические характеристики</h4>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Детальные спецификации</Label>
                        <Textarea
                          value={Object.entries(formData.specifications).map(([key, value]) => `${key}: ${value}`).join('\n')}
                          onChange={(e) => {
                            const specs: { [key: string]: string } = {};
                            e.target.value.split('\n').forEach(line => {
                              const [key, ...valueParts] = line.split(':');
                              if (key && valueParts.length > 0) {
                                specs[key.trim()] = valueParts.join(':').trim();
                              }
                            });
                            setFormData({...formData, specifications: specs});
                          }}
                          placeholder="Процессор: Apple A17 Pro&#10;Оперативная память: 8 ГБ&#10;Операционная система: iOS 17&#10;Формат: ключ: значение"
                          rows={6}
                          className="resize-none"
                        />
                        <p className="text-xs text-gray-500">Детальные технические характеристики в формате "ключ: значение".</p>
                      </div>
                    </div>

                    {/* Физические параметры */}
                    <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-lg p-6 border border-purple-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Ruler size={18} className="text-purple-600" />
                        <h4 className="font-semibold text-gray-800">Физические параметры</h4>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight" className="text-sm font-medium">Вес (г)</Label>
                          <Input
                            id="weight"
                            type="number"
                            value={formData.weight}
                            onChange={(e) => setFormData({...formData, weight: e.target.value})}
                            placeholder="0"
                            className="h-10"
                            min="0"
                          />
                          <p className="text-xs text-gray-500">Вес в граммах</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="length" className="text-sm font-medium">Длина (см)</Label>
                          <Input
                            id="length"
                            type="number"
                            value={formData.dimensions.length}
                            onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, length: e.target.value}})}
                            placeholder="0"
                            className="h-10"
                            min="0"
                            step="0.1"
                          />
                          <p className="text-xs text-gray-500">Длина в см</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="width" className="text-sm font-medium">Ширина (см)</Label>
                          <Input
                            id="width"
                            type="number"
                            value={formData.dimensions.width}
                            onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, width: e.target.value}})}
                            placeholder="0"
                            className="h-10"
                            min="0"
                            step="0.1"
                          />
                          <p className="text-xs text-gray-500">Ширина в см</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height" className="text-sm font-medium">Высота (см)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={formData.dimensions.height}
                            onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, height: e.target.value}})}
                            placeholder="0"
                            className="h-10"
                            min="0"
                            step="0.1"
                          />
                          <p className="text-xs text-gray-500">Высота в см</p>
                        </div>
                      </div>
                      
                      {(formData.weight || formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200/50">
                          <p className="text-sm text-gray-600">
                            📦 Параметры упаковки: {formData.weight && `${formData.weight}г`} 
                            {(formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) && 
                              ` • ${formData.dimensions.length || 0}×${formData.dimensions.width || 0}×${formData.dimensions.height || 0} см`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="inventory" className="mt-0 space-y-6">
                    {/* Складские остатки */}
                    <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-lg p-6 border border-green-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Package size={18} className="text-green-600" />
                        <h4 className="font-semibold text-gray-800">Складские остатки</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="stockQuantity" className="text-sm font-medium">Количество на складе</Label>
                          <Input
                            id="stockQuantity"
                            type="number"
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                            placeholder="0"
                            className="h-10"
                            min="0"
                          />
                          <p className="text-xs text-gray-500">Текущее количество товара на складе</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minStockLevel" className="text-sm font-medium">Минимальный остаток</Label>
                          <Input
                            id="minStockLevel"
                            type="number"
                            value={formData.minStockLevel}
                            onChange={(e) => setFormData({...formData, minStockLevel: e.target.value})}
                            placeholder="5"
                            className="h-10"
                            min="0"
                          />
                          <p className="text-xs text-gray-500">Уровень для предупреждения о нехватке</p>
                        </div>
                      </div>

                      {/* Индикатор статуса склада */}
                      {formData.stockQuantity && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-green-200/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {parseInt(formData.stockQuantity) === 0 ? (
                                <>
                                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                  <span className="font-medium text-red-700">Нет в наличии</span>
                                </>
                              ) : parseInt(formData.stockQuantity) <= parseInt(formData.minStockLevel || '5') ? (
                                <>
                                  <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                                  <span className="font-medium text-yellow-700">Заканчивается</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                  <span className="font-medium text-green-700">В наличии</span>
                                </>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Остаток: <span className="font-semibold">{formData.stockQuantity} шт.</span>
                              </p>
                              {parseInt(formData.stockQuantity) <= parseInt(formData.minStockLevel || '5') && parseInt(formData.stockQuantity) > 0 && (
                                <p className="text-xs text-yellow-600">
                                  ⚠️ Ниже минимального уровня ({formData.minStockLevel || '5'} шт.)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Автоматическое управление */}
                    <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-lg p-6 border border-blue-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings size={18} className="text-blue-600" />
                        <h4 className="font-semibold text-gray-800">Автоматическое управление</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200/50">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-800 mb-1">Автоматическая деактивация</h5>
                              <p className="text-sm text-gray-600">
                                Товар автоматически становится неактивным при нулевом остатке на складе
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-green-200/50">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <RefreshCw size={16} className="text-green-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-800 mb-1">Автоматическая реактивация</h5>
                              <p className="text-sm text-gray-600">
                                При пополнении склада товар может автоматически стать активным
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-orange-200/50">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertCircle size={16} className="text-orange-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-800 mb-1">Контроль остатков</h5>
                              <p className="text-sm text-gray-600">
                                Система отслеживает остатки и предупреждает о низком уровне запасов
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="mt-0 space-y-6">
                    {/* SEO основы */}
                    <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/30 rounded-lg p-6 border border-purple-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings size={18} className="text-purple-600" />
                        <h4 className="font-semibold text-gray-800">Поисковая оптимизация (SEO)</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="seoTitle" className="text-sm font-medium">SEO заголовок</Label>
                          <Input
                            id="seoTitle"
                            value={formData.seo.title}
                            onChange={(e) => setFormData({...formData, seo: {...formData.seo, title: e.target.value}})}
                            placeholder="Купить [название товара] - лучшая цена в интернет-магазине"
                            className="h-10"
                            maxLength={60}
                          />
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">Заголовок страницы в поисковых результатах</p>
                            <span className={`text-xs ${formData.seo.title.length > 60 ? 'text-red-500' : formData.seo.title.length > 50 ? 'text-yellow-500' : 'text-gray-400'}`}>
                              {formData.seo.title.length}/60
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seoDescription" className="text-sm font-medium">SEO описание</Label>
                          <Textarea
                            id="seoDescription"
                            value={formData.seo.description}
                            onChange={(e) => setFormData({...formData, seo: {...formData.seo, description: e.target.value}})}
                            placeholder="Подробное описание товара с ключевыми словами. Указывайте основные характеристики, преимущества и причины для покупки."
                            rows={4}
                            className="resize-none"
                            maxLength={160}
                          />
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">Описание страницы в поисковых результатах</p>
                            <span className={`text-xs ${formData.seo.description.length > 160 ? 'text-red-500' : formData.seo.description.length > 140 ? 'text-yellow-500' : 'text-gray-400'}`}>
                              {formData.seo.description.length}/160
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">SEO ключевые слова</Label>
                          <Input
                            value={formData.seo.keywords.join(', ')}
                            onChange={(e) => setFormData({...formData, seo: {...formData.seo, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)}})}
                            placeholder="смартфон, телефон, купить смартфон, мобильный телефон"
                            className="h-10"
                          />
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">Ключевые слова через запятую для поисковых систем</p>
                            <span className="text-xs text-gray-400">
                              {formData.seo.keywords.length} слов
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SEO рекомендации */}
                    <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-lg p-6 border border-green-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Info size={18} className="text-green-600" />
                        <h4 className="font-semibold text-gray-800">Рекомендации по SEO</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-600 text-sm font-bold">1</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800 text-sm">Заголовок (Title)</h5>
                            <p className="text-xs text-gray-600">
                              Включите название товара, бренд и ключевое слово "купить". Оптимальная длина: 50-60 символов.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-sm font-bold">2</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800 text-sm">Описание (Description)</h5>
                            <p className="text-xs text-gray-600">
                              Опишите основные характеристики и преимущества. Максимум 160 символов.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-purple-600 text-sm font-bold">3</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800 text-sm">Ключевые слова</h5>
                            <p className="text-xs text-gray-600">
                              Используйте релевантные слова, по которым ищут ваш товар. Избегайте переспама.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Автоматические предложения */}
                    {formData.name && (
                      <div className="bg-gradient-to-br from-yellow-50/50 to-orange-50/30 rounded-lg p-6 border border-yellow-200/30">
                        <div className="flex items-center gap-2 mb-4">
                          <Star size={18} className="text-yellow-600" />
                          <h4 className="font-semibold text-gray-800">Автоматические предложения</h4>
                        </div>
                        
                        <div className="space-y-3">
                          {!formData.seo.title && (
                            <div className="bg-white rounded-lg p-3 border border-yellow-200/50">
                              <p className="text-sm text-gray-700 mb-2">💡 Предлагаемый SEO заголовок:</p>
                              <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded px-3 py-2">
                                Купить {formData.name} {formData.brand ? `${formData.brand} ` : ''}
                                {formData.productModel ? `${formData.productModel} ` : ''}
                                - лучшая цена
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 h-7 text-xs"
                                onClick={() => setFormData({
                                  ...formData, 
                                  seo: {
                                    ...formData.seo, 
                                    title: `Купить ${formData.name} ${formData.brand ? `${formData.brand} ` : ''}${formData.productModel ? `${formData.productModel} ` : ''}- лучшая цена`.slice(0, 60)
                                  }
                                })}
                              >
                                Использовать
                              </Button>
                            </div>
                          )}
                          
                          {!formData.seo.description && formData.shortDescription && (
                            <div className="bg-white rounded-lg p-3 border border-yellow-200/50">
                              <p className="text-sm text-gray-700 mb-2">💡 Предлагаемое SEO описание:</p>
                              <p className="text-sm font-medium text-gray-800 bg-gray-50 rounded px-3 py-2">
                                {formData.shortDescription.slice(0, 160)}
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 h-7 text-xs"
                                onClick={() => setFormData({
                                  ...formData, 
                                  seo: {
                                    ...formData.seo, 
                                    description: formData.shortDescription.slice(0, 160)
                                  }
                                })}
                              >
                                Использовать
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Кнопки действий - фиксированные внизу */}
            <div className="flex-shrink-0 flex justify-between items-center gap-4 px-6 py-4 border-t bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info size={16} />
                <span>Поля отмеченные <span className="text-red-500 font-medium">*</span> обязательны для заполнения</span>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={resetForm} 
                  className="h-11 px-6 border-gray-300 hover:bg-gray-100"
                >
                  <X className="mr-2" size={16} />
                  Отмена
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={!formData.name || !formData.price}
                >
                  <Save className="mr-2" size={16} />
                  {editingProduct ? 'Обновить товар' : 'Создать товар'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 