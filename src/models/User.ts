import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    position?: string;
    department?: string;
    bio?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    firstName: { type: String, maxlength: 50 },
    lastName: { type: String, maxlength: 50 },
    phone: { type: String, maxlength: 20 },
    position: { type: String, maxlength: 100 },
    department: { type: String, maxlength: 100 },
    bio: { type: String, maxlength: 500 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 