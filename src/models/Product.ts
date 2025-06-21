import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number; // Оригинальная цена до скидки
  discount?: {
    type: 'percentage' | 'fixed'; // Тип скидки: процент или фиксированная сумма
    value: number; // Значение скидки
    startDate?: Date; // Дата начала скидки
    endDate?: Date; // Дата окончания скидки
    isActive: boolean; // Активна ли скидка
  };
  categoryId?: string;
  imageUrl?: string;
  images?: string[]; // Дополнительные изображения
  description?: string;
  shortDescription?: string; // Краткое описание
  features?: string[]; // Характеристики товара
  specifications?: { // Технические характеристики
    [key: string]: string;
  };
  tags?: string[]; // Теги для поиска
  brand?: string; // Бренд
  model?: string; // Модель
  sku?: string; // Артикул
  weight?: number; // Вес в граммах
  dimensions?: { // Размеры
    length: number;
    width: number;
    height: number;
  };
  inStock: boolean;
  stockQuantity?: number; // Количество на складе
  minStockLevel?: number; // Минимальный уровень запасов
  isActive: boolean; // Активен ли товар
  isFeatured: boolean; // Рекомендуемый товар
  seo?: { // SEO данные
    title?: string;
    description?: string;
    keywords?: string[];
  };
  rating?: number; // Средний рейтинг
  reviewCount?: number; // Количество отзывов
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 200
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      min: 0
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  images: [{
    type: String
  }],
  description: {
    type: String,
    required: false
  },
  shortDescription: {
    type: String,
    maxlength: 500
  },
  features: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  tags: [{
    type: String
  }],
  brand: String,
  model: String,
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 5,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware для автоматического обновления updatedAt
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Виртуальное поле для вычисления финальной цены с учетом скидки
ProductSchema.virtual('finalPrice').get(function() {
  if (!this.discount || !this.discount.isActive) {
    return this.price;
  }

  // Проверяем даты действия скидки
  const now = new Date();
  if (this.discount.startDate && now < this.discount.startDate) {
    return this.price;
  }
  if (this.discount.endDate && now > this.discount.endDate) {
    return this.price;
  }

  if (this.discount.type === 'percentage') {
    return this.price * (1 - this.discount.value / 100);
  } else {
    return Math.max(0, this.price - this.discount.value);
  }
});

// Виртуальное поле для проверки наличия активной скидки
ProductSchema.virtual('hasActiveDiscount').get(function() {
  if (!this.discount || !this.discount.isActive) {
    return false;
  }

  const now = new Date();
  if (this.discount.startDate && now < this.discount.startDate) {
    return false;
  }
  if (this.discount.endDate && now > this.discount.endDate) {
    return false;
  }

  return true;
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema); 