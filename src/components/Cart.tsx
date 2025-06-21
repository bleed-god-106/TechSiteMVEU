import React from 'react';
import { useCart } from '../hooks/useCart';
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartDrawer } from '../hooks/useCartDrawer';

interface CartProps {
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ onClose }) => {
  const { items, removeItem, changeQuantity, clearCart } = useCart();
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Cart drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={24} />
            Корзина
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-600 mb-6">Ваша корзина пуста</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Перейти к покупкам
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item._id || item.id} className="flex items-center gap-4 border-b pb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium line-clamp-2">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item._id || item.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        aria-label="Удалить товар"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="text-blue-600 font-bold mt-1">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => changeQuantity(item._id || item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                          aria-label="Уменьшить количество"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 py-1 border-x">{item.quantity}</span>
                        <button
                          onClick={() => changeQuantity(item._id || item.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.stockQuantity && item.quantity >= item.stockQuantity}
                          aria-label="Увеличить количество"
                          title={item.stockQuantity && item.quantity >= item.stockQuantity ? `Максимум доступно: ${item.stockQuantity}` : 'Увеличить количество'}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="ml-auto text-gray-700">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    {/* Показываем остатки на складе */}
                    {item.stockQuantity !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.stockQuantity > 0 ? (
                          item.stockQuantity <= 5 ? (
                            <span className="text-orange-600">Осталось: {item.stockQuantity} шт.</span>
                          ) : (
                            <span className="text-green-600">В наличии: {item.stockQuantity} шт.</span>
                          )
                        ) : (
                          <span className="text-red-600">Нет в наличии</span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">Итого:</span>
              <span className="text-2xl font-bold text-blue-600">{total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  clearCart();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Trash2 size={16} />
                <span>Очистить</span>
              </button>
              <Link
                to="/checkout"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Оформить</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
