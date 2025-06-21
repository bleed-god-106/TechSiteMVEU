import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User as UserType, CreateUser } from '@/types/mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/tech-site-craft';
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

let client: MongoClient | null = null;

async function getDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db();
}

export const mongodbAuthService = {
  // Регистрация
  async signUp(name: string, email: string, password: string): Promise<{ user: UserType; token: string }> {
    const db = await getDatabase();
    
    // Проверяем, существует ли пользователь
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: email === 'test@admin.com' ? 'admin' : 'user',
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(userData);
    const user = await db.collection('users').findOne({ _id: result.insertedId });
    
    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user!._id.toString(), email: user!.email, role: user!.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse: UserType = {
      _id: user!._id.toString(),
      name: user!.name,
      email: user!.email,
      password: user!.password,
      role: user!.role,
      createdAt: user!.createdAt
    };

    return { user: userResponse, token };
  },

  // Вход в систему
  async signIn(email: string, password: string): Promise<{ user: UserType; token: string }> {
    const db = await getDatabase();
    
    // Находим пользователя
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Неверный email или пароль');
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse: UserType = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt
    };

    return { user: userResponse, token };
  },

  // Проверка токена
  async verifyToken(token: string): Promise<UserType | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const db = await getDatabase();
      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
      
      if (!user) {
        return null;
      }

      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        createdAt: user.createdAt
      };
    } catch (error) {
      return null;
    }
  },

  // Получить пользователя по ID
  async getUserById(userId: string): Promise<UserType | null> {
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return null;
    }

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt
    };
  },

  // Проверка роли администратора
  isAdmin(user: UserType): boolean {
    return user.role === 'admin' || user.email === 'test@admin.com';
  },

  // Создание токена для пользователя
  createToken(user: UserType): string {
    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
}; 