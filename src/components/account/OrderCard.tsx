
import React from 'react';
import { Order } from '../../types/auth';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'processing':
        return <Package className="text-blue-500" size={16} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={16} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'cancelled':
        return <CheckCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap = {
      pending: 'Ожидает обработки',
      processing: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    };
    return statusMap[status];
  };

  return (
    <div className="account-order border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
        <div>
          <h3 className="font-medium">Заказ #{order.id}</h3>
          <p className="text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
          </p>
        </div>
        <div className="flex items-center mt-2 sm:mt-0">
          {getStatusIcon(order.status)}
          <span className="ml-2 text-sm font-medium">
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {order.products.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-600">
                {item.quantity} шт. × {item.price.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Адрес доставки: {order.shippingAddress.city}, {order.shippingAddress.street}
        </div>
        <div className="text-lg font-semibold text-blue-600">
          {order.total.toLocaleString('ru-RU')} ₽
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
