import mongoose, { Document, Schema } from 'mongoose';

export interface IProductCategory extends Document {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

const ProductCategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.ProductCategory || mongoose.model<IProductCategory>('ProductCategory', ProductCategorySchema); 