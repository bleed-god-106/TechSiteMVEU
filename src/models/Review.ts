import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  productId: string;
  userId?: string;
  orderId?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  text: string;
  date: Date;
  orderIndex?: number; // Номер заказа для этого товара
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  userName: {
    type: String,
    required: true,
    maxlength: 100
  },
  userEmail: {
    type: String,
    required: false
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    default: Date.now
  },
  orderIndex: {
    type: Number,
    required: false,
    default: 1
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Создаем составной индекс для быстрого поиска отзывов по товару
ReviewSchema.index({ productId: 1, date: -1 });

// Создаем уникальный индекс для предотвращения дублирования отзывов в рамках одного заказа
ReviewSchema.index({ orderId: 1, productId: 1 }, { unique: true, sparse: true });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema); 