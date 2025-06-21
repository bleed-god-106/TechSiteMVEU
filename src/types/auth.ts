export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  avatar?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female';
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      region?: string;
    };
  };
}

export interface UserProfileUpdate {
  name?: string;
  avatar?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female';
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      region?: string;
    };
  };
}

export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
  };
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalEmployees: number;
  totalNews: number;
  totalAdvantages: number;
  totalUsers: number;
  totalOrders: number;
  monthlyRevenue: number;
  todayVisitors: number;
}
