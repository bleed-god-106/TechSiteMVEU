import { useState, useEffect } from 'react';
import { dataService } from '../services/supabaseData';
import { Package, Calendar, Phone, MapPin, CreditCard, Clock, CheckCircle, XCircle, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

interface DeliveryInfo {
  type: 'pickup' | 'delivery';
  phone: string;
  address?: {
    city: string;
    street: string;
    postalCode: string;
  } | null;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  deliveryInfo: DeliveryInfo;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewStates, setReviewStates] = useState<any>({}); // orderId-productId -> { open: bool, rating: number, text: string }
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState<string | null>(null); // orderId-productId
  const [userReviews, setUserReviews] = useState<Record<string, any>>({}); // orderId-productId -> review
  const [reviewErrors, setReviewErrors] = useState<{[key: string]: string}>({}); // orderId-productId -> error message

  useEffect(() => {
    // Загружаем заказы только после того, как пользователь загружен
    if (!isLoading && user) {
      loadOrders();
    } else if (!isLoading && !user) {
      // Если пользователь не авторизован, устанавливаем ошибку
      setError('Необходимо войти в систему для просмотра заказов');
      setLoading(false);
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (!user || !orders.length) return;
    loadUserReviews();
  }, [user, orders]);

  const loadUserReviews = async () => {
    try {
      const reviews = await dataService.getUserProductReviews();
      const reviewsMap: Record<string, any> = {};
      
      reviews.forEach((review: any) => {
        const key = `${review.orderId}-${review.productId}`;
        reviewsMap[key] = review;
      });
      
      setUserReviews(reviewsMap);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await dataService.getUserOrders();
      setOrders(ordersData);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки заказов:', err);
      setError(err.message || 'Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: 'Ожидает подтверждения', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
      confirmed: { label: 'Подтвержден', icon: CheckCircle, color: 'text-blue-600 bg-blue-100' },
      processing: { label: 'В обработке', icon: Package, color: 'text-purple-600 bg-purple-100' },
      shipped: { label: 'Отправлен', icon: Truck, color: 'text-indigo-600 bg-indigo-100' },
      delivered: { label: 'Доставлен', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
      cancelled: { label: 'Отменен', icon: XCircle, color: 'text-red-600 bg-red-100' }
    };
    return statusMap[status] || statusMap.pending;
  };

  const handleOpenReview = (reviewKey: string) => {
    setReviewStates((prev: any) => ({
      ...prev,
      [reviewKey]: { open: true, rating: 5, text: '' }
    }));
    // Очищаем ошибки при открытии нового диалога
    setReviewErrors((prev) => ({
      ...prev,
      [reviewKey]: ''
    }));
  };

  const handleCloseReview = (reviewKey: string) => {
    setReviewStates((prev: any) => ({
      ...prev,
      [reviewKey]: { ...prev[reviewKey], open: false }
    }));
  };

  const handleReviewChange = (reviewKey: string, field: 'rating' | 'text', value: any) => {
    setReviewStates((prev: any) => ({
      ...prev,
      [reviewKey]: { ...prev[reviewKey], [field]: value }
    }));
    
    // Очищаем ошибку при изменении текста
    if (field === 'text') {
      setReviewErrors((prev) => ({
        ...prev,
        [reviewKey]: ''
      }));
    }
  };

  const validateReview = (reviewKey: string, text: string): string => {
    if (!text.trim()) {
      return 'Пожалуйста, напишите комментарий к отзыву';
    }
    
    if (text.trim().length < 10) {
      return 'Отзыв должен содержать минимум 10 символов';
    }
    
    return '';
  };

  const handleSubmitReview = async (reviewKey: string) => {
    if (!user) return;
    
    // Извлекаем orderId и productId из ключа
    const [orderId, productId] = reviewKey.split('-');
    const order = orders.find(o => o._id === orderId);
    
    if (!order) {
      toast({ title: 'Ошибка', description: 'Заказ не найден', variant: 'destructive' });
      return;
    }

    // Получаем рейтинг и текст, используя значения по умолчанию если они не установлены
    const rating = reviewStates[reviewKey]?.rating ?? 5; // По умолчанию 5 звезд
    const text = reviewStates[reviewKey]?.text || '';
    
    // Валидация
    const validationError = validateReview(reviewKey, text);
    if (validationError) {
      setReviewErrors((prev) => ({
        ...prev,
        [reviewKey]: validationError
      }));
      return;
    }
    
    try {
      await dataService.addProductReview(productId, {
        userName: user.name,
        userEmail: user.email,
        rating,
        text: text.trim(),
        orderId: orderId,
        orderNumber: order.orderNumber
      });
      
      // Обновляем локальное состояние
      setUserReviews((prev) => ({ 
        ...prev, 
        [reviewKey]: { 
          rating, 
          text: text.trim(), 
          userName: user.name, 
          userEmail: user.email,
          date: new Date(),
          orderId,
          productId,
          orderNumber: order.orderNumber
        } 
      }));
      
      // Очищаем состояние отзыва и ошибки
      setReviewErrors((prev) => ({
        ...prev,
        [reviewKey]: ''
      }));
      
      // Уведомляем о необходимости обновить отзывы на странице товара
      localStorage.setItem('reviewsUpdated', Date.now().toString());
      
      toast({ 
        title: 'Спасибо за отзыв!', 
        description: 'Ваш отзыв успешно отправлен и появится на странице товара.' 
      });
    } catch (error: any) {
      // Устанавливаем ошибку для конкретного отзыва
      setReviewErrors((prev) => ({
        ...prev,
        [reviewKey]: error.message || 'Не удалось отправить отзыв'
      }));
    }
  };

  // Показываем загрузку пока идет авторизация или загрузка заказов
  if (isLoading || loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Package className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">История заказов</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {isLoading ? 'Проверка авторизации...' : 'Загрузка заказов...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Package className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">История заказов</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          {user && (
            <button
              onClick={loadOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Попробовать снова
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">История заказов</h2>
        </div>
        <div className="text-sm text-gray-600">
          Всего заказов: {orders.length}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-4">У вас пока нет заказов</p>
          <a
            href="/catalog"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Перейти в каталог
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Заказ #{order.orderNumber}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium ${statusInfo.color} self-start sm:self-auto`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusInfo.label}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4 text-gray-900">Товары:</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                          <div className="flex flex-col space-y-2">
                            {/* Информация о товаре */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.productName}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {formatPrice(item.price)} × {item.quantity}
                                </div>
                              </div>
                              <div className="font-semibold text-gray-900 ml-4">
                                {formatPrice(item.total)}
                              </div>
                            </div>
                            
                            {/* Отзыв или кнопка отзыва */}
                            <div className="mt-3">
                              {userReviews[`${order._id}-${item.productId}`] ? (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    {user?.avatar ? (
                                      <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="flex-shrink-0 w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                                      />
                                    ) : (
                                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">
                                        {userReviews[`${order._id}-${item.productId}`].userName?.[0] || 'U'}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center">
                                          {[1,2,3,4,5].map(star => (
                                            <svg key={star} className="w-4 h-4" fill={star <= (userReviews[`${order._id}-${item.productId}`].rating || 0) ? '#facc15' : '#e5e7eb'} viewBox="0 0 24 24">
                                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                            </svg>
                                          ))}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {userReviews[`${order._id}-${item.productId}`].date ? new Date(userReviews[`${order._id}-${item.productId}`].date).toLocaleDateString('ru-RU') : ''}
                                        </span>
                                        {userReviews[`${order._id}-${item.productId}`].orderIndex && (
                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {userReviews[`${order._id}-${item.productId}`].orderIndex}-й заказ
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-700 leading-relaxed break-words">
                                        {userReviews[`${order._id}-${item.productId}`].text}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-start">
                                  <Dialog open={openDialog === `${order._id}-${item.productId}`} onOpenChange={open => setOpenDialog(open ? `${order._id}-${item.productId}` : null)}>
                                    <DialogTrigger asChild>
                                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Оставить отзыв
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle className="text-lg">Оставить отзыв</DialogTitle>
                                        <p className="text-sm text-gray-600 mt-1">{item.productName}</p>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">Оценка:</label>
                                          <div className="flex items-center gap-1">
                                            {[1,2,3,4,5].map(star => (
                                              <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleReviewChange(`${order._id}-${item.productId}`, 'rating', star)}
                                                className="focus:outline-none hover:scale-110 transition-transform"
                                              >
                                                <svg className="w-6 h-6" fill={star <= (reviewStates[`${order._id}-${item.productId}`]?.rating || 5) ? '#facc15' : '#e5e7eb'} viewBox="0 0 24 24">
                                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                                </svg>
                                              </button>
                                            ))}
                                            <span className="ml-2 text-sm text-gray-600">
                                              {reviewStates[`${order._id}-${item.productId}`]?.rating || 5} из 5
                                            </span>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Комментарий:
                                            <span className="text-red-500 ml-1">*</span>
                                          </label>
                                          <textarea
                                            value={reviewStates[`${order._id}-${item.productId}`]?.text || ''}
                                            onChange={e => handleReviewChange(`${order._id}-${item.productId}`, 'text', e.target.value)}
                                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                                              reviewErrors[`${order._id}-${item.productId}`] 
                                                ? 'border-red-300 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                            rows={3}
                                            maxLength={300}
                                            placeholder="Поделитесь своими впечатлениями о товаре... (минимум 10 символов)"
                                          />
                                          <div className="flex justify-between items-start mt-1">
                                            <div className="text-xs text-gray-500">
                                              {(reviewStates[`${order._id}-${item.productId}`]?.text || '').length}/300 символов
                                              {(reviewStates[`${order._id}-${item.productId}`]?.text || '').length < 10 && (
                                                <span className="text-amber-600 ml-2">
                                                  (осталось {10 - (reviewStates[`${order._id}-${item.productId}`]?.text || '').length})
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {/* Отображение ошибки валидации */}
                                          {reviewErrors[`${order._id}-${item.productId}`] && (
                                            <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                              <span className="text-sm text-red-700">
                                                {reviewErrors[`${order._id}-${item.productId}`]}
                                              </span>
                                            </div>
                                          )}
                                          
                                          {/* Требования к отзыву */}
                                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="text-xs text-blue-700">
                                              <strong>Требования к отзыву:</strong>
                                              <ul className="mt-1 space-y-1">
                                                <li className="flex items-center gap-1">
                                                  {(reviewStates[`${order._id}-${item.productId}`]?.text || '').length >= 10 ? (
                                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                                  ) : (
                                                    <div className="w-3 h-3 border border-gray-400 rounded-full" />
                                                  )}
                                                  Минимум 10 символов
                                                </li>
                                                <li className="flex items-center gap-1">
                                                  {(reviewStates[`${order._id}-${item.productId}`]?.text || '').trim() ? (
                                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                                  ) : (
                                                    <div className="w-3 h-3 border border-gray-400 rounded-full" />
                                                  )}
                                                  Содержательный комментарий
                                                </li>
                                              </ul>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                            Отмена
                                          </button>
                                        </DialogClose>
                                        <button
                                          onClick={async () => { 
                                            const success = await handleSubmitReview(`${order._id}-${item.productId}`);
                                            // Закрываем диалог только при успешной отправке
                                            if (!reviewErrors[`${order._id}-${item.productId}`]) {
                                              setOpenDialog(null); 
                                            }
                                          }}
                                          disabled={!reviewStates[`${order._id}-${item.productId}`]?.text?.trim() || 
                                                   (reviewStates[`${order._id}-${item.productId}`]?.text?.trim().length || 0) < 10}
                                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            !reviewStates[`${order._id}-${item.productId}`]?.text?.trim() || 
                                            (reviewStates[`${order._id}-${item.productId}`]?.text?.trim().length || 0) < 10
                                              ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                              : 'text-white bg-blue-600 hover:bg-blue-700'
                                          }`}
                                        >
                                          Отправить отзыв
                                        </button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4 text-gray-900">Информация о доставке:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{order.deliveryInfo.phone}</span>
                      </div>
                      
                      {order.deliveryInfo.type === 'delivery' && order.deliveryInfo.address ? (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <div>Доставка по адресу:</div>
                            <div className="text-sm text-gray-600">
                              {order.deliveryInfo.address.city}, {order.deliveryInfo.address.street}
                              {order.deliveryInfo.address.postalCode && `, ${order.deliveryInfo.address.postalCode}`}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Самовывоз из офиса</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    ID заказа: {order._id.slice(-8)}
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-lg font-semibold text-gray-900">
                      Итого: {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 