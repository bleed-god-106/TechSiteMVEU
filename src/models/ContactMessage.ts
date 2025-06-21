export interface ContactMessage {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  response?: string;
  respondedAt?: Date;
  respondedBy?: string;
} 