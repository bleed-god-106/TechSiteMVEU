import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Функция для загрузки переменных окружения из .env файла
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', 'server', '.env');
    const envFile = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
    
    return envVars;
  } catch (error) {
    console.log('Файл .env не найден, используем значения по умолчанию');
    return {};
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = loadEnv();
const MONGODB_URI = env.VITE_MONGODB_URI || process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/tech-site-craft';

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Подключение к MongoDB установлено для создания админа.');
    
    const db = client.db();
    const usersCollection = db.collection('users');

    const adminEmail = 'test@admin.com';
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Администратор уже существует.');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await usersCollection.insertOne({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      name: 'Admin',
      createdAt: new Date(),
    });

    console.log('Пользователь-администратор успешно создан.');

  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
  } finally {
    await client.close();
    console.log('Соединение с MongoDB закрыто.');
  }
}

createAdminUser(); 