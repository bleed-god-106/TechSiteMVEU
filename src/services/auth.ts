
import { User, Order, DashboardStats } from '../types/auth';

// Имитация localStorage как MongoDB
const USERS_KEY = 'bt_tech_users';
const ORDERS_KEY = 'bt_tech_orders';
const CURRENT_USER_KEY = 'bt_tech_current_user';

// Mock данные
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Админ Системы',
    email: 'admin@bt-tech.ru',
    role: 'admin',
    createdAt: '2024-01-01',
    avatar: '/api/placeholder/100/100'
  },
  {
    id: '2',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    role: 'user',
    createdAt: '2024-05-15',
    avatar: '/api/placeholder/100/100'
  }
];

const mockOrders: Order[] = [
  {
    id: 'order_1',
    userId: '2',
    products: [
      {
        productId: 1,
        name: 'Холодильник Samsung RB37J5220SA',
        price: 45900,
        quantity: 1,
        image: '/api/placeholder/100/100'
      }
    ],
    total: 45900,
    status: 'delivered',
    createdAt: '2024-06-01',
    shippingAddress: {
      street: 'ул. Примерная, 123',
      city: 'Москва',
      postalCode: '123456'
    }
  },
  {
    id: 'order_2',
    userId: '2',
    products: [
      {
        productId: 7,
        name: 'Стиральная машина Samsung WW70J5210FW',
        price: 32900,
        quantity: 1,
        image: '/api/placeholder/100/100'
      }
    ],
    total: 32900,
    status: 'processing',
    createdAt: '2024-06-10',
    shippingAddress: {
      street: 'ул. Примерная, 123',
      city: 'Москва',
      postalCode: '123456'
    }
  }
];

// Инициализация данных
const initData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders));
  }
};

export const authService = {
  // Инициализация
  init: () => {
    initData();
  },

  // Авторизация
  login: (email: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email === email);
    
    if (user && password === 'password') { // Простая проверка для демо
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  // Регистрация
  register: (name: string, email: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return null; // Пользователь уже существует
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  // Получить текущего пользователя
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Выход
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Получить заказы пользователя
  getUserOrders: (userId: string): Order[] => {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    return orders.filter((order: Order) => order.userId === userId);
  },

  // Получить статистику для админ-панели
  getDashboardStats: (): DashboardStats => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    
    return {
      totalProducts: 24, // из products.ts
      totalEmployees: 15, // из employees.ts
      totalNews: 6, // из news.ts
      totalAdvantages: 15, // из advantages.ts
      totalUsers: users.length,
      totalOrders: orders.length,
      monthlyRevenue: orders.reduce((sum: number, order: Order) => sum + order.total, 0),
      todayVisitors: Math.floor(Math.random() * 200) + 50 // Фейковые посетители
    };
  }
};
