import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Tag, TrendingUp } from 'lucide-react';
import { ExtendedProduct } from '../types';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: ExtendedProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  // Вычисляем финальную цену с учетом скидки
  const calculateFinalPrice = () => {
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

  const finalPrice = calculateFinalPrice();
  const hasDiscount = product.discount?.isActive && finalPrice < product.price;

  // Проверяем статус остатков
  const getStockStatus = () => {
    if (!product.stockQuantity || product.stockQuantity === 0) {
      return { text: 'Нет в наличии', className: 'bg-red-500' };
    }
    if (product.stockQuantity <= (product.minStockLevel || 5)) {
      return { text: 'Скоро закончится', className: 'bg-orange-500' };
    }
    return { text: 'В наличии', className: 'bg-green-500' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={product.imageUrl || (product.images && product.images[0]) || '/placeholder-product.jpg'} 
          alt={product.name}
          title={product.name}
          className="w-full h-48 object-cover"
        />
        
        {/* Статус товара */}
        <span className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded ${stockStatus.className}`}>
          {stockStatus.text}
        </span>
        
        {/* Скидка */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center">
            <Tag size={12} className="mr-1" />
            {product.discount?.type === 'percentage' 
              ? `-${product.discount.value}%` 
              : `-${product.discount?.value}₽`
            }
          </div>
        )}
        
        {/* Рекомендуемый товар */}
        {product.isFeatured && (
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center">
            <TrendingUp size={12} className="mr-1" />
            Хит
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Бренд и категория */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
          <span>{product.brand || 'Без бренда'}</span>
          <span>{product.category?.name || 'Без категории'}</span>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.shortDescription || product.description}
        </p>
        
        {/* Характеристики */}
        {product.features && product.features.length > 0 && (
          <div className="mb-3">
            <ul className="text-sm text-gray-500">
              {product.features.slice(0, 2).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Рейтинг */}
        {(product.rating && product.rating > 0) || (product.reviewCount && product.reviewCount > 0) ? (
          <div className="flex items-center mb-3">
            <div className="flex items-center mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    product.rating && product.rating > 0 && star <= Math.round(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviewCount || 0})
            </span>
          </div>
        ) : null}
        
        {/* Цена */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {Math.round(finalPrice).toLocaleString('ru-RU')} ₽
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {product.price.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Link
              to={`/catalog/product/${product._id}`}
              className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
              title="Подробнее"
            >
              <Eye size={16} />
            </Link>
            <button
              className={`p-2 rounded-lg transition-colors ${
                product.stockQuantity && product.stockQuantity > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={product.stockQuantity && product.stockQuantity > 0 ? 'В корзину' : 'Нет в наличии'}
              onClick={() => {
                if (product.stockQuantity && product.stockQuantity > 0) {
                  addItem({
                    _id: product._id,
                    id: product._id,
                    name: product.name,
                    price: Math.round(finalPrice),
                    image: product.imageUrl || (product.images && product.images[0]) || '/placeholder-product.jpg',
                    imageUrl: product.imageUrl || (product.images && product.images[0]) || '/placeholder-product.jpg',
                    category: product.category?.name || 'Без категории',
                    description: product.description || '',
                    features: product.features || [],
                    inStock: product.stockQuantity > 0,
                    stockQuantity: product.stockQuantity,
                    rating: product.rating,
                    reviewCount: product.reviewCount
                  });
                }
              }}
              disabled={!product.stockQuantity || product.stockQuantity === 0}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
        
        {/* Остаток на складе */}
        {product.stockQuantity !== undefined && (
          <div className="mt-2 text-xs text-gray-500">
            Остаток: {product.stockQuantity} шт.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
