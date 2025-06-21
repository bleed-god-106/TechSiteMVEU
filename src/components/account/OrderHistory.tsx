
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Order } from '../../types/auth';
import OrderCard from './OrderCard';

interface OrderHistoryProps {
  orders: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">История заказов</h2>
      
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">У вас пока нет заказов</h3>
          <p className="text-gray-600 mb-4">Посетите наш каталог и выберите товары</p>
          <Link
            to="/catalog"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
