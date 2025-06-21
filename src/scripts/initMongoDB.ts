import connectToDatabase from '../lib/mongodb.js';
import Department from '../models/Department.js';
import ProductCategory from '../models/ProductCategory.js';
import Employee from '../models/Employee.js';
import Product from '../models/Product.js';
import News from '../models/News.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export async function initializeMongoDB() {
  try {
    await connectToDatabase();
    console.log('Подключение к MongoDB установлено');

    // Очищаем существующие данные (только для инициализации)
    await Department.deleteMany({});
    await ProductCategory.deleteMany({});
    await Employee.deleteMany({});
    await Product.deleteMany({});
    await News.deleteMany({});
    await User.deleteMany({});

    // Создаем отделы
    const departments = await Department.insertMany([
      { name: 'Отдел продаж', description: 'Консультации и продажи бытовой техники' },
      { name: 'Сервисный центр', description: 'Техническое обслуживание и ремонт' },
      { name: 'Отдел доставки', description: 'Доставка и установка техники' },
      { name: 'Администрация', description: 'Управление и координация работы' },
      { name: 'Бухгалтерия', description: 'Финансовый учет и отчетность' },
      { name: 'IT отдел', description: 'Поддержка технических систем' },
      { name: 'Маркетинг', description: 'Реклама и продвижение продукции' }
    ]);

    console.log('Отделы созданы:', departments.length);

    // Создаем категории продуктов
    const categories = await ProductCategory.insertMany([
      { name: 'Холодильники', slug: 'refrigerators' },
      { name: 'Стиральные машины', slug: 'washing-machines' },
      { name: 'Телевизоры', slug: 'televisions' },
      { name: 'Микроволновые печи', slug: 'microwaves' },
      { name: 'Пылесосы', slug: 'vacuum-cleaners' },
      { name: 'Кондиционеры', slug: 'air-conditioners' }
    ]);

    console.log('Категории продуктов созданы:', categories.length);

    // Создаем сотрудников
    const employees = await Employee.insertMany([
      {
        name: 'Иван Петров',
        position: 'Менеджер по продажам',
        departmentId: departments[0]._id,
        phone: '+7 (495) 123-45-67',
        email: 'ivan.petrov@techsite.ru',
        experienceYears: 5,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Мария Сидорова',
        position: 'Старший консультант',
        departmentId: departments[0]._id,
        phone: '+7 (495) 123-45-68',
        email: 'maria.sidorova@techsite.ru',
        experienceYears: 3,
        imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Алексей Козлов',
        position: 'Мастер по ремонту',
        departmentId: departments[1]._id,
        phone: '+7 (495) 123-45-69',
        email: 'alexey.kozlov@techsite.ru',
        experienceYears: 8,
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    ]);

    console.log('Сотрудники созданы:', employees.length);

    // Создаем продукты
    const products = await Product.insertMany([
      {
        name: 'Холодильник Samsung RB37J5000SA',
        price: 45990,
        categoryId: categories[0]._id,
        description: 'Двухкамерный холодильник с технологией No Frost',
        imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=300&fit=crop',
        inStock: true
      },
      {
        name: 'Стиральная машина LG F2J6HS0W',
        price: 32990,
        categoryId: categories[1]._id,
        description: 'Стиральная машина с прямым приводом, 7 кг',
        imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300&h=300&fit=crop',
        inStock: true
      },
      {
        name: 'Телевизор Sony KD-55X80J',
        price: 89990,
        categoryId: categories[2]._id,
        description: '55" 4K HDR LED Smart TV с Android TV',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
        inStock: true
      }
    ]);

    console.log('Продукты созданы:', products.length);

    // Создаем новости
    const news = await News.insertMany([
      {
        title: 'Новое поступление холодильников Samsung',
        excerpt: 'В наш магазин поступили новые модели холодильников Samsung с улучшенной энергоэффективностью.',
        content: 'Мы рады сообщить о поступлении новых моделей холодильников Samsung. Все модели оснащены современными технологиями энергосбережения и имеют класс энергопотребления A++.',
        imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=400&fit=crop',
        published: true
      },
      {
        title: 'Скидки на стиральные машины до 30%',
        excerpt: 'Специальное предложение на стиральные машины ведущих брендов.',
        content: 'В течение всего месяца действуют специальные скидки на стиральные машины. Скидки достигают 30% на модели LG, Samsung и Bosch.',
        imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=400&fit=crop',
        published: true
      }
    ]);

    console.log('Новости созданы:', news.length);

    // Создаем тестового пользователя-администратора
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'Администратор',
      email: 'test@admin.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Администратор создан:', adminUser.email);

    console.log('Инициализация MongoDB завершена успешно!');
    return true;
  } catch (error) {
    console.error('Ошибка при инициализации MongoDB:', error);
    return false;
  }
}

// Запускаем инициализацию при выполнении скрипта
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeMongoDB()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Критическая ошибка:', error);
      process.exit(1);
    });
} 