import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  _id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

const DepartmentSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema); 