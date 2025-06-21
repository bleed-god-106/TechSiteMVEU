import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  _id: string;
  title: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  createdAt: Date;
}

const NewsSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  excerpt: {
    type: String,
    required: false
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  published: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.News || mongoose.model<INews>('News', NewsSchema); 