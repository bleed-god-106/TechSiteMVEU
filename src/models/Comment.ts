export interface Comment {
  _id?: string;
  newsId: string;
  author: string;
  email: string;
  content: string;
  createdAt: Date;
  isApproved: boolean;
  parentId?: string; // для ответов на комментарии
} 