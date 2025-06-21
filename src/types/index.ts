// Типы данных для проекта
export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  description: string;
  features: string[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  image: string;
}

export interface NewsPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  image: string;
  excerpt: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface Advantage {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface SEOFields {
  title: string;
  keywords: string;
  description: string;
}

// Аналитика в реальном времени
export interface AnalyticsStats {
  // Основные метрики
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;
  totalNews?: number;
  totalEmployees?: number;
  totalDepartments?: number;
  totalCategories?: number;
  
  // Финансовые метрики
  totalRevenue: number;
  monthlyRevenue: number;
  avgOrderValue: number;
  recentOrders: number;
  
  // Аналитика в реальном времени
  todayVisitors: number;
  orderStatusStats?: Array<{ _id: string; count: number; statusRu?: string }>;
  topProducts?: Array<{ _id: string; productName: string; totalSold: number; totalRevenue: number }>;
  weeklyUserRegistrations?: Array<{ _id: string; count: number }>;
  weeklyOrders?: Array<{ _id: string; count: number; revenue: number }>;
  deliveryStats?: Array<{ _id: string; count: number; typeRu?: string }>;
  avgCartSize?: number;
  lastUpdated: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export interface ProductDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProductSpecifications {
  [key: string]: string;
}

export interface ExtendedProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: ProductDiscount;
  categoryId?: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  shortDescription?: string;
  features?: string[];
  specifications?: ProductSpecifications;
  tags?: string[];
  brand?: string;
  productModel?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  inStock: boolean;
  stockQuantity?: number;
  minStockLevel?: number;
  isActive: boolean;
  isFeatured: boolean;
  seo?: ProductSEO;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  finalPrice?: number;
  hasActiveDiscount?: boolean;
  category?: {
    _id: string;
    name: string;
    slug?: string;
  };
}

// Existing exports...
export type { UserData, Order, Product, Category, Employee, Department, News, Review, OrderItem, DeliveryInfo };
