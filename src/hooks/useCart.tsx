import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

// Обновленный интерфейс для товара из MongoDB
export interface CartItem {
  _id: string;
  id?: number; // Оставляем для совместимости
  name: string;
  price: number;
  image: string;
  quantity: number;
  [key: string]: any; // Для других свойств
}

interface State {
  items: CartItem[];
}

interface Actions {
  addItem: (product: any, quantity?: number) => void;
  removeItem: (productId: string | number) => void;
  changeQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
}

const initialState: State = {
  items: [],
};

export const useCart = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        // Используем _id для MongoDB или id для совместимости
        const productId = product._id || product.id;
        console.log('Добавление товара в корзину:', product);
        console.log('ID товара:', productId);
        
        // Проверяем остатки на складе
        const stockQuantity = product.stockQuantity || 0;
        if (stockQuantity <= 0) {
          toast.error(`Товар "${product.name}" отсутствует на складе`);
          return;
        }
        
        const existingItem = currentItems.find((item) => 
          (item._id && item._id === productId) || (item.id && item.id === productId)
        );

        if (existingItem) {
          // Проверяем, не превысим ли мы остатки при увеличении количества
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > stockQuantity) {
            toast.error(`Недостаточно товара "${product.name}" на складе. Доступно: ${stockQuantity}, в корзине уже: ${existingItem.quantity}`);
            return;
          }
          
          console.log('Товар уже в корзине, увеличиваем количество');
          toast.success(`Количество "${product.name}" увеличено в корзине!`);
          set({
            items: currentItems.map((item) =>
              (item._id === productId || item.id === productId)
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          // Проверяем остатки для нового товара
          if (quantity > stockQuantity) {
            toast.error(`Недостаточно товара "${product.name}" на складе. Доступно: ${stockQuantity}, запрошено: ${quantity}`);
            return;
          }
          
          console.log('Добавляем новый товар в корзину');
          toast.success(`"${product.name}" добавлен в корзину!`);
          set({
            items: [...currentItems, { ...product, quantity }],
          });
        }
      },
      removeItem: (productId) => {
        const itemToRemove = get().items.find(item => 
          (item._id && item._id === productId) || (item.id && item.id === productId)
        );
        
        if (itemToRemove) {
          toast.error(`'${itemToRemove.name}' удален из корзины.`);
        }
        
        set({
          items: get().items.filter((item) => 
            !(item._id === productId || item.id === productId)
          ),
        });
      },
      changeQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map((item) =>
            (item._id === productId || item.id === productId)
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearCart: () => {
        set({ items: [] });
        toast.success('Корзина очищена!');
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
