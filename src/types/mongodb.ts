// Типы данных для MongoDB

export interface Department {
  _id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Employee {
  _id: string;
  // Основная информация
  firstName: string;
  lastName: string;
  middleName?: string;
  displayName: string;
  
  // Должность и отдел
  position: string;
  departmentId?: string;
  employeeId?: string; // Табельный номер
  
  // Контактная информация
  personalPhone?: string;
  workPhone?: string;
  personalEmail?: string;
  workEmail?: string;
  
  // Адрес
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  
  // Профессиональная информация
  hireDate?: Date;
  birthDate?: Date;
  education?: string;
  skills?: string[];
  experience?: string;
  salary?: number;
  
  // Контакт для экстренных случаев
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  
  // Файлы и документы
  avatar?: string;
  resume?: string;
  documents?: string[];
  
  // Дополнительная информация
  bio?: string;
  notes?: string;
  
  // Системные поля
  userId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  department?: Department;
  
  // Дополнительные поля для ответа API
  accountCreated?: {
    email: string;
    password: string;
    role: string;
    message: string;
  };
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  description?: string;
  inStock: boolean;
  createdAt: Date;
  category?: ProductCategory;
}

export interface News {
  _id: string;
  title: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  createdAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'manager' | 'employee';
  permissions?: string[];
  profile?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    position?: string;
    department?: string;
    bio?: string;
    avatar?: string;
    employeeId?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  _id: string;
  userId: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  createdAt: Date;
  user?: User;
}

// Типы для создания новых записей (без _id и createdAt)
export interface CreateDepartment {
  name: string;
  description?: string;
}

export interface CreateEmployee {
  // Основная информация
  firstName: string;
  lastName: string;
  middleName?: string;
  
  // Должность и отдел
  position: string;
  departmentId?: string;
  employeeId?: string;
  
  // Контактная информация
  personalPhone?: string;
  workPhone?: string;
  personalEmail?: string;
  workEmail?: string;
  
  // Адрес
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  
  // Профессиональная информация
  hireDate?: Date;
  birthDate?: Date;
  education?: string;
  skills?: string[];
  experience?: string;
  salary?: number;
  
  // Контакт для экстренных случаев
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  
  // Файлы и документы
  avatar?: string;
  resume?: string;
  documents?: string[];
  
  // Дополнительная информация
  bio?: string;
  notes?: string;
  
  // Опции для создания аккаунта
  createAccount?: boolean;
  accountRole?: 'user' | 'admin' | 'manager' | 'employee';
  accountPassword?: string;
  permissions?: string[];
}

export interface CreateProductCategory {
  name: string;
  slug: string;
}

export interface CreateProduct {
  name: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  description?: string;
  inStock?: boolean;
}

export interface CreateNews {
  title: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  published?: boolean;
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin' | 'manager' | 'employee';
  permissions?: string[];
  profile?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    position?: string;
    department?: string;
    bio?: string;
    avatar?: string;
    employeeId?: string;
  };
}

export interface CreateOrder {
  userId: string;
  total: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
} 