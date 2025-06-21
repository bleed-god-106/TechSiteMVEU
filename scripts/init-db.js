import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Получаем путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Функция для загрузки переменных окружения из .env файла
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
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

const env = loadEnv();
const MONGODB_URI = env.VITE_MONGODB_URI || process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/tech-site-craft';

console.log('Используется MongoDB URI:', MONGODB_URI);

async function initializeMongoDB() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Подключение к MongoDB установлено');
    
    const db = client.db();
    
    // Очищаем существующие коллекции
    const collections = ['departments', 'productcategories', 'employees', 'products', 'news', 'users', 'reviews'];
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).drop();
      } catch (error) {
        // Коллекция может не существовать, это нормально
      }
    }
    
    // Создаем отделы
    const departments = await db.collection('departments').insertMany([
      { name: 'Отдел продаж', description: 'Консультации и продажи бытовой техники', createdAt: new Date() },
      { name: 'Сервисный центр', description: 'Техническое обслуживание и ремонт', createdAt: new Date() },
      { name: 'Отдел доставки', description: 'Доставка и установка техники', createdAt: new Date() },
      { name: 'Администрация', description: 'Управление и координация работы', createdAt: new Date() },
      { name: 'Бухгалтерия', description: 'Финансовый учет и отчетность', createdAt: new Date() },
      { name: 'IT отдел', description: 'Поддержка технических систем', createdAt: new Date() },
      { name: 'Маркетинг', description: 'Реклама и продвижение продукции', createdAt: new Date() }
    ]);
    
    console.log('Отделы созданы:', departments.insertedCount);
    
    // Создаем категории продуктов
    const categories = await db.collection('productcategories').insertMany([
      { name: 'Холодильники', slug: 'refrigerators', createdAt: new Date() },
      { name: 'Стиральные машины', slug: 'washing-machines', createdAt: new Date() },
      { name: 'Телевизоры', slug: 'televisions', createdAt: new Date() },
      { name: 'Микроволновые печи', slug: 'microwaves', createdAt: new Date() },
      { name: 'Пылесосы', slug: 'vacuum-cleaners', createdAt: new Date() },
      { name: 'Кондиционеры', slug: 'air-conditioners', createdAt: new Date() }
    ]);
    
    console.log('Категории продуктов созданы:', categories.insertedCount);
    
    // Получаем ID отделов для сотрудников
    const departmentsList = await db.collection('departments').find({}).toArray();
    const salesDeptId = departmentsList.find(d => d.name === 'Отдел продаж')?._id;
    const serviceDeptId = departmentsList.find(d => d.name === 'Сервисный центр')?._id;
    
    // Создаем сотрудников
    const employees = await db.collection('employees').insertMany([
      {
        name: 'Иван Петров',
        position: 'Менеджер по продажам',
        departmentId: salesDeptId,
        phone: '+7 (495) 123-45-67',
        email: 'ivan.petrov@techsite.ru',
        experienceYears: 5,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        createdAt: new Date()
      },
      {
        name: 'Мария Сидорова',
        position: 'Старший консультант',
        departmentId: salesDeptId,
        phone: '+7 (495) 123-45-68',
        email: 'maria.sidorova@techsite.ru',
        experienceYears: 3,
        imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        createdAt: new Date()
      },
      {
        name: 'Алексей Козлов',
        position: 'Мастер по ремонту',
        departmentId: serviceDeptId,
        phone: '+7 (495) 123-45-69',
        email: 'alexey.kozlov@techsite.ru',
        experienceYears: 8,
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        createdAt: new Date()
      }
    ]);
    
    console.log('Сотрудники созданы:', employees.insertedCount);
    
    // Получаем ID категорий для продуктов
    const categoriesList = await db.collection('productcategories').find({}).toArray();
    const fridgeCatId = categoriesList.find(c => c.slug === 'refrigerators')?._id;
    const washingCatId = categoriesList.find(c => c.slug === 'washing-machines')?._id;
    const tvCatId = categoriesList.find(c => c.slug === 'televisions')?._id;
    const vacuumCatId = categoriesList.find(c => c.slug === 'vacuum-cleaners')?._id;
    
    // Создаем продукты без отзывов
    const products = await db.collection('products').insertMany([
      {
        name: 'Холодильник Samsung RB37J5000SA',
        price: 45990,
        categoryId: fridgeCatId,
        description: 'Двухкамерный холодильник с технологией No Frost',
        imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=300&fit=crop',
        inStock: true,
        features: ['No Frost', 'Двухкамерный', 'Энергокласс A++'],
        createdAt: new Date()
      },
      {
        name: 'Стиральная машина LG F2J6HS0W',
        price: 32990,
        categoryId: washingCatId,
        description: 'Стиральная машина с прямым приводом, 7 кг',
        imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300&h=300&fit=crop',
        inStock: true,
        features: ['Прямой привод', '7 кг', 'Инверторный мотор'],
        createdAt: new Date()
      },
      {
        name: 'Телевизор Sony KD-55X80J',
        price: 89990,
        categoryId: tvCatId,
        description: '55" 4K HDR LED Smart TV с Android TV',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
        inStock: true,
        features: ['4K HDR', '55 дюймов', 'Android TV', 'Smart TV'],
        createdAt: new Date()
      },
      {
        name: 'Пылесос Samsung VS20T7532T1',
        price: 24990,
        oldPrice: 29990,
        categoryId: vacuumCatId,
        description: 'Беспроводной вертикальный пылесос с циклонным фильтром. Мощность всасывания 200 Вт, время работы до 60 минут.',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
        inStock: true,
        features: ['Беспроводной', '200 Вт', 'До 60 мин работы', 'Циклонный фильтр'],
        createdAt: new Date()
      },
      {
        name: 'Телевизор LG OLED65C1RLA',
        price: 149990,
        oldPrice: 169990,
        categoryId: tvCatId,
        description: 'OLED-телевизор с диагональю 65 дюймов, разрешением 4K UHD и процессором α9 4-го поколения.',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
        inStock: true,
        features: ['OLED', '65 дюймов', '4K UHD', 'α9 процессор', 'WebOS'],
        createdAt: new Date()
      }
    ]);
    
    console.log('Продукты созданы:', products.insertedCount);

    // Получаем созданные товары для создания отзывов
    const productsList = await db.collection('products').find({}).toArray();
    const sonyTV = productsList.find(p => p.name.includes('Sony'));
    const lgTV = productsList.find(p => p.name.includes('LG OLED'));
    const vacuum = productsList.find(p => p.name.includes('Пылесос'));
    const fridge = productsList.find(p => p.name.includes('Холодильник'));
    const washing = productsList.find(p => p.name.includes('Стиральная'));

    // Создаем отзывы в отдельной коллекции
    const reviews = [];
    
    // Отзывы для телевизора Sony
    if (sonyTV) {
      reviews.push(
        {
          productId: sonyTV._id,
          userName: 'Иван Петров',
          rating: 5,
          text: 'Отличный телевизор! Картинка четкая, звук хороший.',
          date: new Date('2023-11-15')
        },
        {
          productId: sonyTV._id,
          userName: 'Мария Сидорова',
          rating: 4,
          text: 'Хорошее качество изображения, но пульт мог бы быть лучше.',
          date: new Date('2023-11-20')
        }
      );
    }

    // Отзывы для телевизора LG OLED
    if (lgTV) {
      reviews.push(
        {
          productId: lgTV._id,
          userName: 'Дмитрий',
          rating: 4,
          text: 'Пользуюсь уже месяц, полностью удовлетворен.',
          date: new Date('2023-11-10')
        },
        {
          productId: lgTV._id,
          userName: 'Елена',
          rating: 5,
          text: 'Превосходное качество изображения, очень доволен покупкой.',
          date: new Date('2023-11-25')
        },
        {
          productId: lgTV._id,
          userName: 'Мария',
          rating: 3,
          text: 'Немного шумит при работе, но в целом доволен.',
          date: new Date('2023-11-18')
        }
      );
    }

    // Отзывы для пылесоса Samsung
    if (vacuum) {
      reviews.push(
        {
          productId: vacuum._id,
          userName: 'Алексей',
          rating: 5,
          text: 'Доставили быстро, товар соответствует описанию.',
          date: new Date('2023-10-20')
        },
        {
          productId: vacuum._id,
          userName: 'Мария',
          rating: 3,
          text: 'Качество сборки на высоте, функционал радует.',
          date: new Date('2023-11-05')
        },
        {
          productId: vacuum._id,
          userName: 'Елена',
          rating: 4,
          text: 'Пользуюсь уже месяц, полностью удовлетворен.',
          date: new Date('2023-11-12')
        }
      );
    }

    // Отзывы для холодильника
    if (fridge) {
      reviews.push(
        {
          productId: fridge._id,
          userName: 'Анна Козлова',
          rating: 5,
          text: 'Отличный холодильник! Тихий, вместительный.',
          date: new Date('2023-10-30')
        }
      );
    }

    // Отзывы для стиральной машины
    if (washing) {
      reviews.push(
        {
          productId: washing._id,
          userName: 'Сергей Иванов',
          rating: 4,
          text: 'Хорошая стиральная машина, стирает качественно.',
          date: new Date('2023-11-08')
        }
      );
    }

    // Вставляем отзывы в коллекцию
    if (reviews.length > 0) {
      const reviewsResult = await db.collection('reviews').insertMany(reviews);
      console.log('Отзывы созданы:', reviewsResult.insertedCount);
    }
    
    // Создаем новости
    const news = await db.collection('news').insertMany([
      {
        title: 'Новое поступление холодильников Samsung',
        excerpt: 'В наш магазин поступили новые модели холодильников Samsung с улучшенной энергоэффективностью.',
        content: 'Мы рады сообщить о поступлении новых моделей холодильников Samsung. Все модели оснащены современными технологиями энергосбережения и имеют класс энергопотребления A++.',
        imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=400&fit=crop',
        published: true,
        createdAt: new Date()
      },
      {
        title: 'Скидки на стиральные машины до 30%',
        excerpt: 'Специальное предложение на стиральные машины ведущих брендов.',
        content: 'В течение всего месяца действуют специальные скидки на стиральные машины. Скидки достигают 30% на модели LG, Samsung и Bosch.',
        imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=400&fit=crop',
        published: true,
        createdAt: new Date()
      }
    ]);
    
    console.log('Новости созданы:', news.insertedCount);
    
    // Создаем тестового пользователя-администратора
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await db.collection('users').insertOne({
      name: 'Администратор',
      email: 'test@admin.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log('Администратор создан:', adminUser.insertedId);
    
    console.log('Инициализация MongoDB завершена успешно!');
    return true;
    
  } catch (error) {
    console.error('Ошибка при инициализации MongoDB:', error);
    return false;
  } finally {
    await client.close();
  }
}

// Запускаем инициализацию
initializeMongoDB()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Критическая ошибка:', error);
    process.exit(1);
  }); 