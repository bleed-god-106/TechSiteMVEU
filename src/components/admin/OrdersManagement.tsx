import { useState, useEffect, useRef } from 'react';
import { dataService } from '../../services/supabaseData';
import { Package, Calendar, Phone, MapPin, CreditCard, Clock, CheckCircle, XCircle, Truck, User, Mail, Edit, Search, Trash2 } from 'lucide-react';
import ConfirmDialog from '../ui/confirm-dialog';

// Простая заглушка для toast
const toast = ({ title, description, variant }: any) => {
  if (variant === 'destructive') {
    alert(`Ошибка: ${description}`);
  } else {
    alert(`${title}: ${description}`);
  }
};

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

interface UserInfo {
  name: string;
  email: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userInfo: UserInfo;
  items: OrderItem[];
  deliveryInfo: DeliveryInfo;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersManagementProps {
  highlightedItem?: { id: string; type: string } | null;
}

export default function OrdersManagement({ highlightedItem }: OrdersManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; number: string } | null>(null);

  // Реф для подсветки
  const highlightedOrderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  // Эффект для фильтрации заказов при изменении поискового запроса
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
    } else {
      // Убираем символ # из запроса если он есть
      const cleanQuery = searchQuery.replace(/^#/, '').toLowerCase();
      const filtered = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(cleanQuery) ||
        order.userInfo.name.toLowerCase().includes(cleanQuery) ||
        order.userInfo.email.toLowerCase().includes(cleanQuery) ||
        order.deliveryInfo.phone.includes(cleanQuery)
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  // Эффект для скролла к выделенному элементу
  useEffect(() => {
    if (highlightedItem && highlightedItem.type === 'order' && highlightedOrderRef.current) {
      highlightedOrderRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightedItem, filteredOrders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await dataService.getAllOrders();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
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

  const getTotalRevenue = () => {
    // Считаем выручку только с доставленных заказов
    return orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await dataService.updateOrderStatus(orderId, newStatus);
      
      // Обновляем локальное состояние
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
      
      toast({
        title: "Статус обновлен",
        description: `Статус заказа изменен на "${getStatusInfo(newStatus).label}"`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить статус заказа",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    setOrderToDelete({ id: orderId, number: orderNumber });
    setShowDeleteDialog(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      setDeletingOrderId(orderToDelete.id);
      await dataService.deleteOrder(orderToDelete.id);
      
      // Удаляем заказ из локального состояния
      setOrders(orders.filter(order => order._id !== orderToDelete.id));
      
      toast({
        title: "Заказ удален",
        description: `Заказ #${orderToDelete.number} успешно удален. Товары возвращены на склад.`,
      });
      
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить заказ",
        variant: "destructive",
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  const cancelDeleteOrder = () => {
    setShowDeleteDialog(false);
    setOrderToDelete(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Package className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление заказами</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Package className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление заказами</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">Управление заказами</h2>
        </div>
        <div className="text-sm text-gray-600">
          Всего заказов: {orders.length}
          {searchQuery && ` | Найдено: ${filteredOrders.length}`}
        </div>
      </div>

      {/* Поиск заказов */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск по номеру заказа, имени клиента, email или телефону (можно с # и без)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Найдено заказов: {filteredOrders.length} из {orders.length}
          </div>
        )}
      </div>

      {/* Статистика - показываем для всех заказов, а не только отфильтрованных */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <div className="text-sm text-yellow-600">Ожидают</div>
              <div className="text-lg font-semibold">
                {orders.filter(o => o.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <div className="text-sm text-blue-600">Подтверждены</div>
              <div className="text-lg font-semibold">
                {orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Truck className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <div className="text-sm text-green-600">Доставлены</div>
              <div className="text-lg font-semibold">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <div className="text-sm text-purple-600">Выручка (доставленные)</div>
              <div className="text-lg font-semibold">
                {formatPrice(getTotalRevenue())}
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">
            {searchQuery ? 'Заказы по вашему запросу не найдены' : 'Заказы не найдены'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Очистить поиск
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const isHighlighted = highlightedItem?.id === order._id && highlightedItem?.type === 'order';

            return (
              <div 
                key={order._id} 
                ref={isHighlighted ? highlightedOrderRef : null}
                className={`border border-gray-200 rounded-lg p-4 transition-colors duration-500 ${
                  isHighlighted ? 'bg-yellow-100 animate-pulse' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold">#{order.orderNumber}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{order.userInfo.name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {order.userInfo.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusInfo.label}
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="pending">Ожидает подтверждения</option>
                        <option value="confirmed">Подтвержден</option>
                        <option value="processing">В обработке</option>
                        <option value="shipped">Отправлен</option>
                        <option value="delivered">Доставлен</option>
                        <option value="cancelled">Отменен</option>
                      </select>
                      <button
                        onClick={() => handleDeleteOrder(order._id, order.orderNumber)}
                        disabled={deletingOrderId === order._id}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Удалить заказ навсегда"
                      >
                        {deletingOrderId === order._id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Товары:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-gray-600">
                            {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.total)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Доставка:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                        <span>{order.deliveryInfo.phone}</span>
                      </div>
                      
                      {order.deliveryInfo.type === 'delivery' && order.deliveryInfo.address ? (
                        <div className="flex items-start">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                          <div>
                            <div>Доставка:</div>
                            <div className="text-gray-600">
                              {order.deliveryInfo.address.city}, {order.deliveryInfo.address.street}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          <span>Самовывоз</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Итого:</div>
                      <div className="text-lg font-semibold">{formatPrice(order.total)}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {order._id.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={cancelDeleteOrder}
        onConfirm={confirmDeleteOrder}
        title="Удаление заказа"
        message={`Вы уверены, что хотите удалить заказ #${orderToDelete?.number}?`}
        details={[
          'Заказ будет полностью удален из базы данных',
          'Товары будут возвращены на склад',
          'Статистика будет автоматически пересчитана',
          'Данные нельзя будет восстановить'
        ]}
        confirmText="Удалить заказ"
        cancelText="Отмена"
        type="danger"
        loading={!!deletingOrderId}
      />
    </div>
  );
} 