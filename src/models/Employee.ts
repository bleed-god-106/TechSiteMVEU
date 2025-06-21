import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  _id: string;
  // Основная информация
  firstName: string;
  lastName: string;
  middleName?: string;
  displayName: string; // Автоматически генерируется из ФИО
  
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
  userId?: string; // Связь с аккаунтом пользователя
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const EmployeeSchema: Schema = new Schema({
  // Основная информация
  firstName: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  middleName: {
    type: String,
    maxlength: 50,
    trim: true
  },
  displayName: {
    type: String,
    maxlength: 150
  },
  
  // Должность и отдел
  position: {
    type: String,
    required: true,
    maxlength: 100
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: false
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    maxlength: 20
  },
  
  // Контактная информация
  personalPhone: {
    type: String,
    maxlength: 20
  },
  workPhone: {
    type: String,
    maxlength: 20
  },
  personalEmail: {
    type: String,
    maxlength: 100,
    lowercase: true
  },
  workEmail: {
    type: String,
    maxlength: 100,
    lowercase: true
  },
  
  // Адрес
  address: {
    street: { type: String, maxlength: 200 },
    city: { type: String, maxlength: 100 },
    region: { type: String, maxlength: 100 },
    postalCode: { type: String, maxlength: 20 },
    country: { type: String, maxlength: 100, default: 'Россия' }
  },
  
  // Профессиональная информация
  hireDate: {
    type: Date
  },
  birthDate: {
    type: Date
  },
  education: {
    type: String,
    maxlength: 500
  },
  skills: [{
    type: String,
    maxlength: 100
  }],
  experience: {
    type: String,
    maxlength: 1000
  },
  salary: {
    type: Number,
    min: 0
  },
  
  // Контакт для экстренных случаев
  emergencyContact: {
    name: { type: String, maxlength: 100 },
    relationship: { type: String, maxlength: 50 },
    phone: { type: String, maxlength: 20 }
  },
  
  // Файлы и документы
  avatar: {
    type: String,
    maxlength: 500
  },
  resume: {
    type: String,
    maxlength: 500
  },
  documents: [{
    type: String,
    maxlength: 500
  }],
  
  // Дополнительная информация
  bio: {
    type: String,
    maxlength: 1000
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  
  // Системные поля
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Middleware для автоматического создания displayName
EmployeeSchema.pre('save', function(next) {
  if (this.firstName && this.lastName) {
    this.displayName = `${this.lastName} ${this.firstName}${this.middleName ? ` ${this.middleName}` : ''}`;
  }
  next();
});

// Индексы для быстрого поиска
EmployeeSchema.index({ firstName: 1, lastName: 1 });
EmployeeSchema.index({ departmentId: 1 });
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ 'workEmail': 1 }, { sparse: true });

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema); 