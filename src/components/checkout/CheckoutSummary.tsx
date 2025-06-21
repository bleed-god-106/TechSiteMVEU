import React from 'react';
import { CartItem } from '@/hooks/useCart';

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ items, total }) => {
  return (
    <>
      <ul>
        {items.map((item) => (
          <li key={`checkout-item-${item._id || item.id}`} className="mb-3 flex items-center">
            <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover mr-3" />
            <span className="flex-1">{item.name}</span>
            <span className="mx-2">x{item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
          </li>
        ))}
      </ul>
      <div className="font-bold text-xl">Итого: {total.toLocaleString('ru-RU')} ₽</div>
    </>
  );
};

export default CheckoutSummary;
