
// Схемы базы данных MongoDB
export const DATABASE_SCHEMAS = {
  // Названия коллекций MongoDB
  COLLECTIONS: {
    DEPARTMENTS: 'departments',
    EMPLOYEES: 'employees',
    PRODUCT_CATEGORIES: 'productcategories',
    PRODUCTS: 'products',
    NEWS: 'news',
    ORDERS: 'orders',
    USERS: 'users'
  },

  // Схемы данных MongoDB
  DEPARTMENT: {
    _id: 'ObjectId',
    name: 'string',
    description: 'string',
    createdAt: 'Date'
  },

  EMPLOYEE: {
    _id: 'ObjectId',
    name: 'string',
    position: 'string',
    departmentId: 'ObjectId',
    phone: 'string',
    email: 'string',
    imageUrl: 'string',
    experienceYears: 'number',
    createdAt: 'Date'
  },

  PRODUCT_CATEGORY: {
    _id: 'ObjectId',
    name: 'string',
    slug: 'string',
    createdAt: 'Date'
  },

  PRODUCT: {
    _id: 'ObjectId',
    name: 'string',
    price: 'number',
    categoryId: 'ObjectId',
    imageUrl: 'string',
    description: 'string',
    inStock: 'boolean',
    createdAt: 'Date'
  },

  NEWS: {
    _id: 'ObjectId',
    title: 'string',
    excerpt: 'string',
    content: 'string',
    imageUrl: 'string',
    published: 'boolean',
    createdAt: 'Date'
  },

  USER: {
    _id: 'ObjectId',
    name: 'string',
    email: 'string',
    password: 'string',
    role: 'enum: user|admin',
    createdAt: 'Date'
  },

  ORDER: {
    _id: 'ObjectId',
    userId: 'ObjectId',
    total: 'number',
    status: 'enum: pending|processing|shipped|delivered|cancelled',
    shippingAddress: 'object',
    items: 'array',
    createdAt: 'Date'
  }
} as const;

// Статусы заказов
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

// Роли пользователей
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;
