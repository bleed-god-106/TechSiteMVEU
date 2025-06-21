const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tech-site-craft';

// Настройки
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());

let db;
const client = new MongoClient(MONGO_URI); // Определяем client здесь

// Функция для создания slug из названия
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[а-я]/g, (char) => {
      const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// API Routes

// Отделы
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await db.collection('departments').find({}).sort({ name: 1 }).toArray();
    res.json(departments.map(dept => ({
      ...dept,
      _id: dept._id.toString()
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Сотрудники
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await db.collection('employees').find({}).sort({ lastName: 1, firstName: 1 }).toArray();
    
    // Получаем информацию об отделах
    const employeesWithDepartments = await Promise.all(
      employees.map(async (emp) => {
        let department = undefined;
        if (emp.departmentId) {
          const dept = await db.collection('departments').findOne({ _id: emp.departmentId });
          if (dept) {
            department = {
              _id: dept._id.toString(),
              name: dept.name,
              description: dept.description,
              createdAt: dept.createdAt
            };
          }
        }
        
        return {
          ...emp,
          _id: emp._id.toString(),
          departmentId: emp.departmentId?.toString(),
          userId: emp.userId?.toString(),
          department,
          // Обеспечиваем обратную совместимость
          name: emp.displayName || `${emp.lastName} ${emp.firstName}${emp.middleName ? ` ${emp.middleName}` : ''}`,
          email: emp.workEmail || emp.personalEmail,
          phone: emp.workPhone || emp.personalPhone,
          image: emp.avatar
        };
      })
    );
    
    res.json(employeesWithDepartments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создание сотрудника с автоматическим созданием аккаунта
app.post('/api/employees', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }

    const { 
      firstName, 
      lastName, 
      middleName,
      position, 
      departmentId,
      employeeId,
      personalPhone,
      workPhone,
      personalEmail,
      workEmail,
      address,
      hireDate,
      birthDate,
      education,
      skills,
      experience,
      salary,
      emergencyContact,
      avatar,
      bio,
      notes,
      createAccount = true,
      accountRole = 'admin',
      accountPassword,
      permissions = []
    } = req.body;

    // Валидация обязательных полей
    if (!firstName || !lastName || !position) {
      return res.status(400).json({ error: 'Имя, фамилия и должность обязательны' });
    }

    // Проверяем email для создания аккаунта
    const email = workEmail || personalEmail;
    if (createAccount && !email) {
      return res.status(400).json({ error: 'Email (рабочий или личный) обязателен для создания аккаунта' });
    }

    // Проверяем уникальность табельного номера
    if (employeeId) {
      const existingEmployee = await db.collection('employees').findOne({ employeeId });
      if (existingEmployee) {
        return res.status(400).json({ error: 'Сотрудник с таким табельным номером уже существует' });
      }
    }

    let userId = null;
    
    let generatedPassword = null;
    
    // Создаем аккаунт пользователя, если нужно
    if (createAccount && email) {
      // Проверяем, что пользователь с таким email не существует
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }

      // Генерируем пароль, если не указан
      const password = accountPassword || generatePassword();
      generatedPassword = password; // Сохраняем для ответа
      const hashedPassword = await bcrypt.hash(password, 12);

      const fullName = `${firstName} ${lastName}${middleName ? ` ${middleName}` : ''}`;
      
      const userData = {
        name: fullName,
        email,
        password: hashedPassword,
        role: accountRole,
        permissions: permissions || [],
        createdAt: new Date(),
        profile: {
          firstName,
          lastName,
          middleName: middleName || '',
          phone: personalPhone || workPhone || '',
          position: position,
          department: departmentId ? departmentId : null,
          employeeId: employeeId || '',
          avatar: avatar || ''
        }
      };

      const userResult = await db.collection('users').insertOne(userData);
      userId = userResult.insertedId.toString();

      console.log(`👤 Создан аккаунт пользователя для сотрудника ${fullName}:`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔑 Пароль: ${password}`);
      console.log(`   👑 Роль: ${accountRole}`);
      console.log(`   🔐 Права: ${permissions.join(', ') || 'Базовые'}`);
    }

    // Создаем сотрудника
    const employeeData = {
      firstName,
      lastName,
      middleName: middleName || null,
      displayName: `${lastName} ${firstName}${middleName ? ` ${middleName}` : ''}`,
      position,
      departmentId: departmentId ? new ObjectId(departmentId) : null,
      employeeId: employeeId || null,
      
      // Контакты
      personalPhone: personalPhone || null,
      workPhone: workPhone || null,
      personalEmail: personalEmail || null,
      workEmail: workEmail || null,
      
      // Адрес
      address: address || null,
      
      // Профессиональная информация
      hireDate: hireDate ? new Date(hireDate) : null,
      birthDate: birthDate ? new Date(birthDate) : null,
      education: education || null,
      skills: skills || [],
      experience: experience || null,
      salary: salary || null,
      
      // Экстренный контакт
      emergencyContact: emergencyContact || null,
      
      // Файлы
      avatar: avatar || '/placeholder-avatar.jpg',
      resume: null,
      documents: [],
      
      // Дополнительная информация
      bio: bio || null,
      notes: notes || null,
      
      // Системные поля
      userId: userId ? new ObjectId(userId) : null,
      isActive: true,
      createdAt: new Date()
    };

    const result = await db.collection('employees').insertOne(employeeData);
    const employee = await db.collection('employees').findOne({ _id: result.insertedId });

    // Получаем информацию об отделе
    let department = undefined;
    if (employee.departmentId) {
      const dept = await db.collection('departments').findOne({ _id: employee.departmentId });
      if (dept) {
        department = {
          _id: dept._id.toString(),
          name: dept.name,
          description: dept.description,
          createdAt: dept.createdAt
        };
      }
    }

    const responseData = {
      ...employee,
      _id: employee._id.toString(),
      departmentId: employee.departmentId?.toString(),
      userId: employee.userId?.toString(),
      department
    };

    // Добавляем информацию о созданном аккаунте в ответ
    if (createAccount && email && generatedPassword) {
      responseData.accountCreated = {
        email,
        password: generatedPassword,
        role: accountRole,
        message: 'Аккаунт успешно создан'
      };
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Ошибка создания сотрудника:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление сотрудника
app.put('/api/employees/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Обновляем поля со временем изменения
    updateData.updatedAt = new Date();
    
    // Обрабатываем departmentId
    if (updateData.departmentId) {
      updateData.departmentId = new ObjectId(updateData.departmentId);
    }

    // Удаляем поля, которые не должны обновляться напрямую
    delete updateData._id;
    delete updateData.createdAt;

    const result = await db.collection('employees').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    const employee = await db.collection('employees').findOne({ _id: new ObjectId(id) });
    
    // Получаем информацию об отделе
    let department = undefined;
    if (employee.departmentId) {
      const dept = await db.collection('departments').findOne({ _id: employee.departmentId });
      if (dept) {
        department = {
          _id: dept._id.toString(),
          name: dept.name,
          description: dept.description,
          createdAt: dept.createdAt
        };
      }
    }

    res.json({
      ...employee,
      _id: employee._id.toString(),
      departmentId: employee.departmentId?.toString(),
      userId: employee.userId?.toString(),
      department
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удаление сотрудника
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }

    const { id } = req.params;
    
    // Получаем информацию о сотруднике перед удалением
    const employee = await db.collection('employees').findOne({ _id: new ObjectId(id) });
    if (!employee) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    // Удаляем связанный аккаунт пользователя, если есть
    if (employee.userId) {
      await db.collection('users').deleteOne({ _id: employee.userId });
      console.log(`👤 Удален аккаунт пользователя для сотрудника ${employee.name}`);
    }

    // Удаляем сотрудника
    const result = await db.collection('employees').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    res.json({ 
      message: 'Сотрудник успешно удален',
      deletedEmployee: {
        _id: employee._id.toString(),
        name: employee.name,
        email: employee.email
      },
      accountDeleted: !!employee.userId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Функция генерации пароля
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Категории продуктов
app.get('/api/product-categories', async (req, res) => {
  try {
    const categories = await db.collection('productcategories').find({}).sort({ name: 1 }).toArray();
    res.json(categories.map(cat => ({
      ...cat,
      _id: cat._id.toString()
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Продукты
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.collection('products').find({}).sort({ name: 1 }).toArray();
    
    // Получаем информацию о категориях и рейтингах
    const productsWithCategories = await Promise.all(
      products.map(async (prod) => {
        let category = undefined;
        if (prod.categoryId) {
          const cat = await db.collection('productcategories').findOne({ _id: prod.categoryId });
          if (cat) {
            category = {
              _id: cat._id.toString(),
              name: cat.name,
              slug: cat.slug,
              createdAt: cat.createdAt
            };
          }
        }

        // Получаем отзывы для этого товара из коллекции reviews
        const reviews = await db.collection('reviews').find({ productId: prod._id }).toArray();
        
        // Вычисляем рейтинг на основе отзывов
        let averageRating = 0;
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          averageRating = totalRating / reviews.length;
        }
        
        return {
          ...prod,
          _id: prod._id.toString(),
          categoryId: prod.categoryId?.toString(),
          category,
          rating: averageRating,
          reviewCount: reviews.length,
          // Убираем старые отзывы из документа товара
          reviews: undefined
        };
      })
    );
    
    res.json(productsWithCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Админ: Все продукты (включая неактивные)
app.get('/api/admin/products', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }

    console.log('🔍 Загрузка товаров для админ-панели управления чатами');
    
    const products = await db.collection('products').find({}).sort({ name: 1 }).toArray();
    
    // Получаем информацию о категориях и рейтингах
    const productsWithCategories = await Promise.all(
      products.map(async (prod) => {
        let category = undefined;
        if (prod.categoryId) {
          const cat = await db.collection('productcategories').findOne({ _id: prod.categoryId });
          if (cat) {
            category = {
              _id: cat._id.toString(),
              name: cat.name,
              slug: cat.slug,
              createdAt: cat.createdAt
            };
          }
        }

        // Получаем отзывы для этого товара из коллекции reviews
        const reviews = await db.collection('reviews').find({ productId: prod._id }).toArray();
        
        // Вычисляем рейтинг на основе отзывов
        let averageRating = 0;
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          averageRating = totalRating / reviews.length;
        }
        
        return {
          ...prod,
          _id: prod._id.toString(),
          categoryId: prod.categoryId?.toString(),
          category,
          rating: averageRating,
          reviewCount: reviews.length,
          // Убираем старые отзывы из документа товара
          reviews: undefined
        };
      })
    );
    
    console.log(`📦 Загружено ${productsWithCategories.length} товаров для админ-панели чатов`);
    res.json(productsWithCategories);
  } catch (error) {
    console.error('❌ Ошибка загрузки товаров для админа:', error);
    res.status(500).json({ error: error.message });
  }
});

// Новости
app.get('/api/news', async (req, res) => {
  try {
    const publishedOnly = req.query.published === 'true';
    const filter = publishedOnly ? { published: true } : {};
    const news = await db.collection('news').find(filter).sort({ createdAt: -1 }).toArray();
    
    res.json(news.map(item => ({
      ...item,
      _id: item._id.toString()
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Категории товаров
app.get('/api/product-categories', async (req, res) => {
  try {
    const categories = await db.collection('productcategories').find({}).sort({ name: 1 }).toArray();
    
    res.json(categories.map(category => ({
      _id: category._id.toString(),
      name: category.name,
      description: category.description,
      slug: category.slug,
      createdAt: category.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Аутентификация
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: email === 'test@admin.com' ? 'admin' : 'user',
      createdAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(userData);
    const user = await db.collection('users').findOne({ _id: result.insertedId });
    
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Проверка токена
app.get('/api/auth/me', async (req, res) => {
  try {
    console.log('Получен запрос /api/auth/me');
    console.log('Headers:', req.headers.authorization);
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('Токен не предоставлен');
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    console.log('Проверяем токен:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Токен декодирован:', decoded);
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      console.log('Пользователь не найден для ID:', decoded.userId);
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    console.log('Пользователь найден:', user.email);
    res.json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      profile: user.profile || {}
    });
  } catch (error) {
    console.log('Ошибка проверки токена:', error.message);
    res.status(401).json({ error: 'Неверный токен' });
  }
});

// Обновление профиля пользователя
app.put('/api/auth/profile', async (req, res) => {
  try {
    console.log('Получен запрос на обновление профиля:', JSON.stringify(req.body, null, 2));
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    const { name, avatar, profile } = req.body;
    
    // Валидация данных
    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      return res.status(400).json({ error: 'Имя должно содержать минимум 2 символа' });
    }
    
    // Исправленная валидация телефона для нового формата +7 (999) 999-99-99
    if (profile?.phone && profile.phone.trim() !== '') {
      // Убираем все пробелы, скобки и дефисы для проверки
      const cleanPhone = profile.phone.replace(/[\s\-\(\)]/g, '');
      // Проверяем, что это российский номер в формате +7xxxxxxxxxx (11 цифр)
      if (!/^\+7\d{10}$/.test(cleanPhone)) {
        return res.status(400).json({ error: 'Неверный формат телефона. Используйте формат +7 (999) 999-99-99' });
      }
    }
    
    if (profile?.dateOfBirth && isNaN(Date.parse(profile.dateOfBirth))) {
      return res.status(400).json({ error: 'Неверный формат даты рождения' });
    }
    
    // Валидация аватара (если передан)
    if (avatar && typeof avatar === 'string') {
      // Проверяем, что это корректный base64 изображения
      if (!avatar.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Неверный формат изображения' });
      }
      
      // Проверяем размер (приблизительно 5MB in base64)
      if (avatar.length > 7000000) { // ~5MB in base64
        return res.status(400).json({ error: 'Изображение слишком большое (максимум 5MB)' });
      }
    }
    
    // Подготавливаем данные для обновления
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name && name.trim() !== user.name) {
      updateData.name = name.trim();
    }
    
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }
    
    if (profile) {
      // Объединяем существующий профиль с новыми данными
      updateData.profile = {
        ...user.profile,
        ...profile,
        // Если передан address, объединяем его с существующим
        address: profile.address ? {
          ...user.profile?.address,
          ...profile.address
        } : user.profile?.address
      };
    }
    
    // Обновляем пользователя в базе данных
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    console.log(`Пользователь ${req.params.id} обновлен`);
    res.json({ message: 'Пользователь обновлен' });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: error.message });
  }
});

// Пользователи (только для админов)
app.get('/api/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray();
    
    res.json(users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создание заказа
app.post('/api/orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    const { items, deliveryInfo, total } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Товары не указаны' });
    }
    
    // Проверяем наличие товаров и резервируем их (без транзакций)
    const processedItems = [];
    
    // Проверяем и обновляем остатки товаров
    for (const item of items) {
      const product = await db.collection('products').findOne({ _id: new ObjectId(item.productId) });
      
      if (!product) {
        return res.status(400).json({ error: `Товар с ID ${item.productId} не найден` });
      }
      
      if (product.isActive === false) {
        return res.status(400).json({ error: `Товар "${product.name}" неактивен и недоступен для заказа` });
      }
      
      const currentStock = product.stockQuantity || 0;
      if (currentStock < item.quantity) {
        return res.status(400).json({ error: `Недостаточно товара "${product.name}" на складе. Доступно: ${currentStock}, запрошено: ${item.quantity}` });
      }
      
      // Обновляем остатки товара
      const newStock = currentStock - item.quantity;
      
      // НЕ деактивируем товар автоматически - только обновляем остатки
      await db.collection('products').updateOne(
        { _id: new ObjectId(item.productId) },
        { 
          $set: { 
            stockQuantity: newStock,
            updatedAt: new Date()
          }
        }
      );
      
      const stockStatus = newStock <= 0 ? ' (НЕТ В НАЛИЧИИ)' : newStock <= (product.minStockLevel || 5) ? ' (СКОРО ЗАКОНЧИТСЯ)' : '';
      console.log(`📦 Товар "${product.name}": остаток ${currentStock} → ${newStock}${stockStatus}`);
      
      processedItems.push({
        productId: item.productId,
        productName: product.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      });
    }
    
    // Генерируем номер заказа
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const orderData = {
      orderNumber,
      userId: user._id,
      userInfo: {
        name: user.name,
        email: user.email
      },
      items: processedItems,
      deliveryInfo: {
        type: deliveryInfo.type, // 'pickup' или 'delivery'
        phone: deliveryInfo.phone,
        address: deliveryInfo.address || null
      },
      total,
      status: 'pending', // pending, confirmed, processing, shipped, delivered, cancelled
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('orders').insertOne(orderData);
    
    console.log('✅ Создан новый заказ:', orderNumber, 'для пользователя:', user.email);
    
    res.json({
      _id: result.insertedId.toString(),
      orderNumber: orderNumber,
      status: 'pending',
      total: total,
      createdAt: orderData.createdAt
    });
    
  } catch (error) {
    console.error('❌ Ошибка создания заказа:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получение заказов пользователя
app.get('/api/orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    const orders = await db.collection('orders')
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(orders.map(order => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      items: order.items,
      deliveryInfo: order.deliveryInfo,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение всех заказов (только для админов)
app.get('/api/orders/all', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(orders.map(order => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      userInfo: order.userInfo,
      items: order.items,
      deliveryInfo: order.deliveryInfo,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление статуса заказа (только для админов)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Неверный статус заказа' });
    }

    // Получаем заказ без транзакций
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    // Если заказ отменяется, возвращаем товары на склад
    if (status === 'cancelled' && order.status !== 'cancelled') {
      console.log(`🔄 Отмена заказа ${order.orderNumber} - возвращаем товары на склад`);
      
      for (const item of order.items) {
        const product = await db.collection('products').findOne({ _id: new ObjectId(item.productId) });
        
        if (product) {
          const newStock = (product.stockQuantity || 0) + item.quantity;
          
          // НЕ реактивируем товар автоматически - только возвращаем остатки
          await db.collection('products').updateOne(
            { _id: new ObjectId(item.productId) },
            { 
              $set: { 
                stockQuantity: newStock,
                updatedAt: new Date()
              }
            }
          );
          
          const stockStatus = newStock <= 0 ? ' (НЕТ В НАЛИЧИИ)' : newStock <= (product.minStockLevel || 5) ? ' (СКОРО ЗАКОНЧИТСЯ)' : '';
          console.log(`📦 Товар "${product.name}": возвращено ${item.quantity} шт., остаток: ${newStock}${stockStatus}`);
        }
      }
    }
    
    // Обновляем статус заказа
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    console.log(`✅ Статус заказа ${order.orderNumber} изменен на: ${status}`);
    res.json({ message: 'Статус заказа обновлен' });
    
  } catch (error) {
    console.error('❌ Ошибка обновления статуса заказа:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление заказа (только для админов)
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }

    // Получаем заказ перед удалением
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    // Если заказ не был отменен, возвращаем товары на склад
    if (order.status !== 'cancelled') {
      console.log(`🔄 Удаление заказа ${order.orderNumber} - возвращаем товары на склад`);
      
      for (const item of order.items) {
        const product = await db.collection('products').findOne({ _id: new ObjectId(item.productId) });
        
        if (product) {
          const newStock = (product.stockQuantity || 0) + item.quantity;
          
          await db.collection('products').updateOne(
            { _id: new ObjectId(item.productId) },
            { 
              $set: { 
                stockQuantity: newStock,
                updatedAt: new Date()
              }
            }
          );
          
          const stockStatus = newStock <= 0 ? ' (НЕТ В НАЛИЧИИ)' : newStock <= (product.minStockLevel || 5) ? ' (СКОРО ЗАКОНЧИТСЯ)' : '';
          console.log(`📦 Товар "${product.name}": возвращено ${item.quantity} шт., остаток: ${newStock}${stockStatus}`);
        }
      }
    }
    
    // Удаляем заказ
    const result = await db.collection('orders').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    console.log(`🗑️ Заказ ${order.orderNumber} удален`);
    res.json({ message: 'Заказ удален', orderNumber: order.orderNumber });
    
  } catch (error) {
    console.error('❌ Ошибка удаления заказа:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление пользователя (только для админов)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    // Нельзя удалить самого себя
    if (req.params.id === currentUser._id.toString()) {
      return res.status(400).json({ error: 'Нельзя удалить собственный аккаунт' });
    }
    
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    console.log(`Пользователь ${req.params.id} удален`);
    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Изменение роли пользователя (только для админов)
app.put('/api/users/:id/role', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const { role } = req.body;
    const validRoles = ['admin', 'user'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Неверная роль пользователя' });
    }
    
    // Нельзя изменить роль самого себя
    if (req.params.id === currentUser._id.toString()) {
      return res.status(400).json({ error: 'Нельзя изменить собственную роль' });
    }
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          role: role,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    console.log(`Роль пользователя ${req.params.id} изменена на ${role}`);
    res.json({ message: 'Роль пользователя обновлена', role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление данных пользователя (только для админов)
app.put('/api/users/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const { name, email, profile } = req.body;
    
    // Проверяем уникальность email, если он изменился
    if (email) {
      const existingUser = await db.collection('users').findOne({ 
        email: email,
        _id: { $ne: new ObjectId(req.params.id) }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }
    }
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profile) updateData.profile = profile;
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    console.log(`Пользователь ${req.params.id} обновлен`);
    res.json({ message: 'Пользователь обновлен' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить заказы пользователя (только для админов)
app.get('/api/users/:id/orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const { id } = req.params;
    
    const orders = await db.collection('orders')
      .find({ userId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(orders.map(order => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      items: order.items,
      deliveryInfo: order.deliveryInfo,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    })));
  } catch (error) {
    console.error('Ошибка получения заказов пользователя:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить отзывы пользователя (только для админов)
app.get('/api/users/:id/reviews', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const { id } = req.params;
    
    // Получаем пользователя
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Получаем отзывы пользователя
    const reviews = await db.collection('reviews').find({
      $or: [
        { userName: user.name },
        { userEmail: user.email }
      ]
    }).sort({ date: -1 }).toArray();
    
    // Добавляем информацию о товарах
    const reviewsWithProducts = await Promise.all(
      reviews.map(async (review) => {
        const product = await db.collection('products').findOne({ _id: review.productId });
        const productName = product ? product.name : 'Неизвестный товар';
        const productSlug = product ? createSlug(product.name) : 'unknown';
        
        return {
          _id: review._id.toString(),
          productId: review.productId.toString(),
          productName,
          productSlug,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          orderNumber: review.orderNumber
        };
      })
    );
    
    res.json(reviewsWithProducts);
  } catch (error) {
    console.error('Ошибка получения отзывов пользователя:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создание товара (только для админов)
app.post('/api/products', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const {
      name,
      price,
      originalPrice,
      discount,
      categoryId,
      imageUrl,
      images,
      description,
      shortDescription,
      features,
      specifications,
      tags,
      brand,
      productModel,
      sku,
      weight,
      dimensions,
      stockQuantity,
      minStockLevel,
      isActive,
      isFeatured,
      seo
    } = req.body;
    
    // Валидация обязательных полей
    if (!name || !price) {
      return res.status(400).json({ error: 'Название и цена обязательны' });
    }
    
    // Проверяем уникальность SKU если указан
    if (sku) {
      const existingSku = await db.collection('products').findOne({ sku });
      if (existingSku) {
        return res.status(400).json({ error: 'Товар с таким SKU уже существует' });
      }
    }
    
    const productData = {
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discount: discount || undefined,
      categoryId: categoryId ? new ObjectId(categoryId) : undefined,
      imageUrl: imageUrl || '/placeholder-product.jpg',
      images: images || [],
      description: description || '',
      shortDescription: shortDescription || '',
      features: features || [],
      specifications: specifications || {},
      tags: tags || [],
      brand: brand || '',
      productModel: productModel || '',
      sku: sku || undefined,
      weight: weight ? Number(weight) : undefined,
      dimensions: dimensions || undefined,
      inStock: true,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
      minStockLevel: minStockLevel ? Number(minStockLevel) : 5,
      isActive: isActive !== false,
      isFeatured: isFeatured === true,
      seo: seo || {},
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('products').insertOne(productData);
    const newProduct = await db.collection('products').findOne({ _id: result.insertedId });
    
    console.log(`Товар "${name}" создан администратором ${currentUser.name}`);
    res.json({
      ...newProduct,
      _id: newProduct._id.toString(),
      categoryId: newProduct.categoryId?.toString()
    });
  } catch (error) {
    console.error('Ошибка создания товара:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление товара (только для админов)
app.put('/api/products/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    // Улучшенная обработка JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT Error:', jwtError.message);
      return res.status(401).json({ error: 'Неверный токен авторизации' });
    }
    
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const productId = req.params.id;
    const updateData = { ...req.body };
    
    // Проверяем существование товара
    const existingProduct = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Проверяем уникальность SKU если он изменился
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const existingSku = await db.collection('products').findOne({ 
        sku: updateData.sku,
        _id: { $ne: new ObjectId(productId) }
      });
      if (existingSku) {
        return res.status(400).json({ error: 'Товар с таким SKU уже существует' });
      }
    }
    
    // Подготавливаем данные для обновления
    const cleanUpdateData = {};
    
    // Копируем только определенные поля
    const allowedFields = [
      'name', 'price', 'originalPrice', 'discount', 'categoryId', 'imageUrl', 'images',
      'description', 'shortDescription', 'features', 'specifications', 'tags',
      'brand', 'productModel', 'sku', 'weight', 'dimensions', 'inStock',
      'stockQuantity', 'minStockLevel', 'isActive', 'isFeatured', 'seo'
    ];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'price' || field === 'originalPrice' || field === 'weight' || field === 'stockQuantity' || field === 'minStockLevel') {
          cleanUpdateData[field] = Number(updateData[field]);
        } else if (field === 'categoryId' && updateData[field]) {
          cleanUpdateData[field] = new ObjectId(updateData[field]);
        } else {
          cleanUpdateData[field] = updateData[field];
        }
      }
    });
    
    cleanUpdateData.updatedAt = new Date();
    
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: cleanUpdateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const updatedProduct = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    
    console.log(`Товар ${productId} обновлен администратором ${currentUser.name}`);
    res.json({
      ...updatedProduct,
      _id: updatedProduct._id.toString(),
      categoryId: updatedProduct.categoryId?.toString()
    });
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление товара (только для админов)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    // Улучшенная обработка JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT Error:', jwtError.message);
      return res.status(401).json({ error: 'Неверный токен авторизации' });
    }
    
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const productId = req.params.id;
    
    // Проверяем существование товара
    const existingProduct = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Удаляем товар
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Также удаляем все отзывы к этому товару
    await db.collection('reviews').deleteMany({ productId: new ObjectId(productId) });
    
    console.log(`Товар ${productId} удален администратором ${currentUser.name}`);
    res.json({ message: 'Товар удален' });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получение товара по id
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ error: 'Not found' });

    // Получаем информацию о категории
    let category = undefined;
    if (product.categoryId) {
      const cat = await db.collection('productcategories').findOne({ _id: product.categoryId });
      if (cat) {
        category = {
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          createdAt: cat.createdAt
        };
      }
    }

    // Получаем отзывы из отдельной коллекции
    const reviews = await db.collection('reviews').find({ productId: new ObjectId(id) }).toArray();
    
    // Вычисляем рейтинг на основе отзывов из коллекции reviews
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      averageRating = totalRating / reviews.length;
    }

    const safeProduct = {
      ...product,
      rating: averageRating,
      reviewCount: reviews.length,
      _id: product._id.toString(),
      categoryId: product.categoryId?.toString(),
      category,
      // Убираем старые отзывы из документа товара
      reviews: undefined
    };

    res.json(safeProduct);
  } catch (error) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// Получить отзывы пользователя по товарам из заказов
app.get('/api/user/product-reviews', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Получаем все отзывы пользователя с информацией о заказах
    const reviews = await db.collection('reviews').find({ 
      $or: [
        { userName: currentUser.name },
        { userEmail: currentUser.email }
      ]
    }).sort({ date: -1 }).toArray();
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить отзывы по товару с пагинацией и статистикой
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Получаем отзывы с пагинацией используя агрегацию для подтягивания данных пользователей
    const reviews = await db.collection('reviews').aggregate([
      { $match: { productId: new ObjectId(productId) } },
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          let: { 
            reviewUserName: '$userName',
            reviewUserEmail: '$userEmail'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$name', '$$reviewUserName'] },
                    { $eq: ['$email', '$$reviewUserEmail'] }
                  ]
                }
              }
            }
          ],
          as: 'userInfo'
        }
      },
      {
        $addFields: {
          userAvatar: { $arrayElemAt: ['$userInfo.avatar', 0] }
        }
      },
      {
        $project: {
          userInfo: 0 // Убираем полную информацию о пользователе, оставляем только аватар
        }
      }
    ]).toArray();
    
    // Получаем общее количество отзывов
    const totalReviews = await db.collection('reviews').countDocuments({ productId: new ObjectId(productId) });
    
    // Вычисляем статистику рейтингов
    const ratingStats = await db.collection('reviews').aggregate([
      { $match: { productId: new ObjectId(productId) } },
      { $group: { 
        _id: '$rating', 
        count: { $sum: 1 } 
      }},
      { $sort: { _id: -1 } }
    ]).toArray();
    
    // Вычисляем средний рейтинг
    const avgRating = await db.collection('reviews').aggregate([
      { $match: { productId: new ObjectId(productId) } },
      { $group: { 
        _id: null, 
        avgRating: { $avg: '$rating' },
        totalCount: { $sum: 1 }
      }}
    ]).toArray();
    
    // Форматируем ответ
    res.json({
      reviews: reviews.map(review => ({
        ...review,
        _id: review._id.toString(),
        productId: review.productId.toString(),
        userId: review.userId?.toString(),
        orderId: review.orderId?.toString()
      })),
      pagination: {
        page,
        limit,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit)
      },
      stats: {
        averageRating: avgRating[0]?.avgRating || 0,
        totalReviews: avgRating[0]?.totalCount || 0,
        ratingDistribution: ratingStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить отзыв к товару из конкретного заказа
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;
    const { userName, userEmail, rating, text, orderId, orderNumber } = req.body;
    
    // Валидация обязательных полей
    if (!userName || !text || !orderId) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Валидация рейтинга (должен быть числом от 1 до 5)
    const validRating = Number(rating);
    if (!validRating || validRating < 1 || validRating > 5) {
      return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
    }

    // Валидация текста отзыва
    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Комментарий не может быть пустым' });
    }

    if (text.trim().length < 10) {
      return res.status(400).json({ error: 'Отзыв должен содержать минимум 10 символов' });
    }

    // Проверяем, не оставлял ли пользователь уже отзыв на этот товар из этого заказа
    const existingReview = await db.collection('reviews').findOne({
      productId: new ObjectId(productId),
      orderId: new ObjectId(orderId),
      $or: [
        { userName: userName },
        { userEmail: userEmail }
      ]
    });

    if (existingReview) {
      return res.status(400).json({ error: 'Вы уже оставили отзыв на этот товар из данного заказа' });
    }

    // Получаем информацию о том, сколько раз пользователь заказывал этот товар до текущего заказа
    const userOrders = await db.collection('orders').find({
      $or: [
        { 'deliveryInfo.phone': { $exists: true } },
        { userEmail: userEmail }
      ],
      'items.productId': productId,
      createdAt: { $lte: new Date() }
    }).sort({ createdAt: 1 }).toArray();

    // Находим номер текущего заказа в списке заказов с этим товаром
    let orderIndex = 1;
    for (let i = 0; i < userOrders.length; i++) {
      const order = userOrders[i];
      if (order._id.toString() === orderId) {
        orderIndex = i + 1;
        break;
      }
    }

    const review = {
      productId: new ObjectId(productId),
      orderId: new ObjectId(orderId),
      orderNumber: orderNumber,
      userName,
      userEmail: userEmail || null,
      rating: validRating, // Используем проверенный рейтинг
      text: text.trim(), // Убираем лишние пробелы
      date: new Date(),
      orderIndex: orderIndex // Какой по счету заказ этого товара
    };
    
    await db.collection('reviews').insertOne(review);
    res.json({ message: 'Отзыв добавлен', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить отзыв (только для админов)
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const reviewId = req.params.id;
    const result = await db.collection('reviews').deleteOne({ _id: new ObjectId(reviewId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }
    
    console.log(`Отзыв ${reviewId} удален администратором ${currentUser.name}`);
    res.json({ message: 'Отзыв удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Статистика для админ-панели
app.get('/api/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    // Получаем расширенную статистику
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalEmployees,
      totalNews,
      totalDepartments,
      totalReviews,
      deliveredOrders,
      weeklyOrders,
      weeklyUserRegistrations,
      orderStatusStats,
      deliveryStats,
      topProducts,
      recentOrders
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('orders').countDocuments(),
      db.collection('products').countDocuments(),
      db.collection('employees').countDocuments(),
      db.collection('news').countDocuments(),
      db.collection('departments').countDocuments(),
      db.collection('reviews').countDocuments(),
      db.collection('orders').countDocuments({ status: 'delivered' }),
      
      // Заказы за последние 7 дней
      db.collection('orders').aggregate([
        {
          $match: {
            createdAt: { 
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$createdAt" 
              }
            },
            count: { $sum: 1 },
            revenue: { 
              $sum: { 
                $cond: [
                  { $eq: ["$status", "delivered"] },
                  "$total",
                  0
                ]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray(),
      
      // Регистрации пользователей за последние 7 дней
      db.collection('users').aggregate([
        {
          $match: {
            createdAt: { 
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$createdAt" 
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray(),
      
      // Статистика по статусам заказов
      db.collection('orders').aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Статистика по типам доставки
      db.collection('orders').aggregate([
        {
          $group: {
            _id: "$deliveryInfo.type",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),
      
      // Топ товаров по продажам
      db.collection('orders').aggregate([
        { $match: { status: 'delivered' } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            productName: { $first: "$items.productName" },
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.total" }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Заказы за последние 30 дней
      db.collection('orders').countDocuments({
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        }
      })
    ]);
    
    // Подсчитываем финансовые метрики
    const [totalRevenue, monthlyRevenue, avgOrderValue] = await Promise.all([
      // Общая выручка
      db.collection('orders').aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]).toArray(),
      
      // Выручка за последний месяц
      db.collection('orders').aggregate([
        { 
          $match: { 
            status: 'delivered',
            createdAt: { 
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
            }
          } 
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]).toArray(),
      
      // Средний чек
      db.collection('orders').aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, avg: { $avg: '$total' } } }
      ]).toArray()
    ]);
    
    // Подсчитываем средний размер корзины
    const avgCartSize = await db.collection('orders').aggregate([
      {
        $group: {
          _id: null,
          avg: { 
            $avg: { 
              $sum: "$items.quantity" 
            } 
          }
        }
      }
    ]).toArray();
    
    const stats = {
      // Основные метрики
      totalUsers,
      totalOrders,
      totalProducts,
      totalEmployees,
      totalNews,
      totalDepartments,
      totalReviews,
      totalCategories: await db.collection('productcategories').countDocuments(),
      
      // Финансовые метрики
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      avgOrderValue: avgOrderValue[0]?.avg || 0,
      recentOrders,
      
      // Аналитика
      deliveredOrders,
      weeklyOrders,
      weeklyUserRegistrations,
      orderStatusStats,
      deliveryStats,
      topProducts,
      avgCartSize: avgCartSize[0]?.avg || 0,
      todayVisitors: Math.floor(Math.random() * 100) + 50, // Заглушка для посетителей
      lastUpdated: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: error.message });
  }
});

// Универсальный поиск для админ-панели
app.get('/api/admin/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    
    const { query, category } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ 
        users: [], 
        orders: [], 
        products: [], 
        employees: [],
        news: []
      });
    }
    
    const searchRegex = new RegExp(query, 'i');
    let results = {
      users: [],
      orders: [],
      products: [],
      employees: [],
      news: []
    };
    
    // Поиск пользователей
    if (!category || category === 'users') {
      const users = await db.collection('users').find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).limit(20).toArray();
      
      results.users = users.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        type: 'user'
      }));
    }
    
    // Поиск заказов - улучшенная логика с поддержкой символа #
    if (!category || category === 'orders') {
      // Убираем символ # из запроса если он есть
      const cleanQuery = query.replace(/^#/, '');
      const searchRegex = new RegExp(cleanQuery, 'i');
      
      const orders = await db.collection('orders').find({
        $or: [
          { orderNumber: searchRegex },
          { 'userInfo.name': searchRegex },
          { 'userInfo.email': searchRegex },
          { 'deliveryInfo.phone': searchRegex }
        ]
      }).limit(20).toArray();
      
      results.orders = orders.map(order => ({
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        userInfo: order.userInfo,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        type: 'order'
      }));
    }
    
    // Поиск товаров
    if (!category || category === 'products') {
      const products = await db.collection('products').find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }).limit(20).toArray();
      
      results.products = products.map(product => ({
        _id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId?.toString(),
        image: product.image || product.imageUrl,
        type: 'product'
      }));
    }
    
    // Поиск сотрудников
    if (!category || category === 'employees') {
      const employees = await db.collection('employees').find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { middleName: searchRegex },
          { displayName: searchRegex },
          { position: searchRegex },
          { personalEmail: searchRegex },
          { workEmail: searchRegex },
          { employeeId: searchRegex }
        ]
      }).limit(20).toArray();
      
      results.employees = employees.map(employee => ({
        _id: employee._id.toString(),
        name: employee.displayName || `${employee.lastName} ${employee.firstName}${employee.middleName ? ` ${employee.middleName}` : ''}`,
        position: employee.position,
        departmentId: employee.departmentId?.toString(),
        email: employee.workEmail || employee.personalEmail,
        phone: employee.workPhone || employee.personalPhone,
        employeeId: employee.employeeId,
        type: 'employee'
      }));
    }
    
    // Поиск новостей
    if (!category || category === 'news') {
      const news = await db.collection('news').find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { summary: searchRegex }
        ]
      }).limit(20).toArray();
      
      results.news = news.map(item => ({
        _id: item._id.toString(),
        title: item.title,
        summary: item.summary,
        published: item.published,
        createdAt: item.createdAt,
        type: 'news'
      }));
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API для комментариев к новостям
app.get('/api/news/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    const comments = await db.collection('comments').find({
      newsId: id,
      isApproved: true
    }).sort({ createdAt: -1 }).toArray();
    
    res.json(comments.map(comment => ({
      ...comment,
      _id: comment._id.toString()
    })));
  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/news/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { author, email, content } = req.body;
    
    if (!author || !email || !content) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    if (content.length < 10) {
      return res.status(400).json({ error: 'Комментарий должен содержать минимум 10 символов' });
    }
    
    const comment = {
      newsId: id,
      author: author.trim(),
      email: email.trim().toLowerCase(),
      content: content.trim(),
      createdAt: new Date(),
      isApproved: false // требует модерации
    };
    
    const result = await db.collection('comments').insertOne(comment);
    
    res.status(201).json({
      message: 'Комментарий отправлен на модерацию',
      commentId: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Ошибка создания комментария:', error);
    res.status(500).json({ error: error.message });
  }
});

// API для контактных сообщений (Contact Form 7)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Обязательные поля: имя, email, тема, сообщение' });
    }
    
    const contactMessage = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date(),
      isRead: false
    };
    
    const result = await db.collection('contact_messages').insertOne(contactMessage);
    
    console.log(`📧 Новое сообщение от ${name} (${email}): ${subject}`);
    
    res.status(201).json({
      message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.',
      messageId: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    res.status(500).json({ error: error.message });
  }
});

// API для управления контактными сообщениями (только для админов)
app.get('/api/admin/contact-messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const messages = await db.collection('contact_messages')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(messages.map(msg => ({
      ...msg,
      _id: msg._id.toString()
    })));
  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    res.status(500).json({ error: error.message });
  }
});

// Отметить сообщение как прочитанное
app.put('/api/admin/contact-messages/:id/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const { id } = req.params;
    
    await db.collection('contact_messages').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isRead: true } }
    );
    
    res.json({ message: 'Сообщение отмечено как прочитанное' });
  } catch (error) {
    console.error('Ошибка обновления сообщения:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить контактное сообщение
app.delete('/api/admin/contact-messages/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const { id } = req.params;
    
    await db.collection('contact_messages').deleteOne({ _id: new ObjectId(id) });
    
    console.log(`🗑️ Контактное сообщение ${id} удалено администратором ${currentUser.name}`);
    
    res.json({ message: 'Сообщение удалено' });
  } catch (error) {
    console.error('Ошибка удаления сообщения:', error);
    res.status(500).json({ error: error.message });
  }
});

// API для управления комментариями (только для админов)
app.get('/api/admin/comments', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const comments = await db.collection('comments')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Получаем информацию о новостях для каждого комментария
    const commentsWithNews = await Promise.all(comments.map(async (comment) => {
      const news = await db.collection('news').findOne({ _id: new ObjectId(comment.newsId) });
      return {
        ...comment,
        _id: comment._id.toString(),
        newsTitle: news ? news.title : 'Новость не найдена'
      };
    }));
    
    res.json(commentsWithNews);
  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    res.status(500).json({ error: error.message });
  }
});

// Одобрить комментарий
app.put('/api/admin/comments/:id/approve', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const { id } = req.params;
    
    await db.collection('comments').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isApproved: true } }
    );
    
    res.json({ message: 'Комментарий одобрен' });
  } catch (error) {
    console.error('Ошибка одобрения комментария:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить комментарий
app.delete('/api/admin/comments/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const { id } = req.params;
    
    await db.collection('comments').deleteOne({ _id: new ObjectId(id) });
    
    res.json({ message: 'Комментарий удален' });
  } catch (error) {
    console.error('Ошибка удаления комментария:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ЧАТ-СИСТЕМА =====

// Начать новый чат
app.post('/api/chat/start', async (req, res) => {
  try {
    const { userId, guestName, guestEmail, message } = req.body;
    
    console.log('🔍 Создание чата с данными:', {
      userId,
      guestName, 
      guestEmail,
      message,
      messageLength: message ? message.length : 0
    });
    
    // Проверяем что сообщение не пустое
    if (!message || !message.trim()) {
      console.log('❌ Отклоняем создание чата: пустое сообщение');
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }
    
    const trimmedMessage = message.trim();
    
    const chatSession = {
      userId: userId || null,
      guestName: guestName || null,
      guestEmail: guestEmail || null,
      status: 'waiting',
      messages: [
        {
          type: 'system',
          content: 'Добро пожаловать в службу поддержки BT-Tech! Ваше сообщение получено. Консультант ответит в ближайшее время.',
          timestamp: new Date().toISOString()
        },
        {
          type: 'user',
          content: trimmedMessage,
          timestamp: new Date().toISOString(),
          author: userId ? 'Пользователь' : guestName
        }
      ],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      surveyCompleted: false
    };
    
    const result = await db.collection('chat_sessions').insertOne(chatSession);
    
    console.log(`💬 Новый чат создан: ${result.insertedId} от ${userId ? 'пользователя' : guestName}`);
    console.log(`📝 Первое сообщение: "${trimmedMessage}"`);
    
    res.status(201).json({
      ...chatSession,
      _id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('❌ Ошибка создания чата:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить чат-сессию
app.get('/api/chat/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await db.collection('chat_sessions').findOne({ _id: new ObjectId(id) });
    
    if (!session) {
      return res.status(404).json({ error: 'Чат не найден' });
    }
    
    res.json({
      ...session,
      _id: session._id.toString()
    });
  } catch (error) {
    console.error('Ошибка получения чата:', error);
    res.status(500).json({ error: error.message });
  }
});

// Отправить сообщение в чат
app.post('/api/chat/:id/message', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    console.log(`🔍 Отправка сообщения в чат ${id}:`, {
      content,
      contentLength: content ? content.length : 0,
      hasToken: !!token
    });
    
    // Проверяем что сообщение не пустое
    if (!content || !content.trim()) {
      console.log('❌ Отклоняем отправку: пустое сообщение');
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }
    
    let isAdmin = false;
    let author = 'Гость';
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
        if (user) {
          isAdmin = user.role === 'admin';
          author = user.name;
        }
      } catch (err) {
        console.log('⚠️ Ошибка токена:', err.message);
        // Игнорируем ошибки токена для гостей
      }
    }
    
    const trimmedContent = content.trim();
    
    const newMessage = {
      type: isAdmin ? 'admin' : 'user',
      content: trimmedContent,
      timestamp: new Date().toISOString(),
      author
    };
    
    console.log(`📝 Создаем сообщение:`, newMessage);
    
    await db.collection('chat_sessions').updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { messages: newMessage },
        $set: { 
          lastActivity: new Date().toISOString(),
          status: isAdmin ? 'active' : 'waiting'
        }
      }
    );
    
    const updatedSession = await db.collection('chat_sessions').findOne({ _id: new ObjectId(id) });
    
    console.log(`✅ Сообщение добавлено в чат ${id} от ${isAdmin ? 'админа' : 'пользователя'}: "${trimmedContent}"`);
    
    res.json({
      ...updatedSession,
      _id: updatedSession._id.toString()
    });
  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error);
    res.status(500).json({ error: error.message });
  }
});

// Отправить результаты опроса
app.post('/api/chat/:id/survey', async (req, res) => {
  try {
    const { id } = req.params;
    const surveyData = req.body;
    
    // Получаем данные чата
    const chatSession = await db.collection('chat_sessions').findOne({ _id: new ObjectId(id) });
    if (!chatSession) {
      return res.status(404).json({ error: 'Чат не найден' });
    }
    
    // Обновляем чат с результатами опроса
    await db.collection('chat_sessions').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          surveyCompleted: true,
          surveyData,
          lastActivity: new Date().toISOString(),
          status: 'closed' // Автоматически закрываем чат после опроса
        }
      }
    );
    
    // Создаем сообщение с результатами опроса для админов
    const getSurveyEmoji = (rating) => {
      if (rating >= 4) return '😊';
      if (rating >= 3) return '😐';
      return '😞';
    };
    
    const getAverageRating = () => {
      const { satisfaction, helpfulness, recommendation } = surveyData;
      return Math.round((satisfaction + helpfulness + recommendation) / 3 * 10) / 10;
    };
    
    const averageRating = getAverageRating();
    const userName = chatSession.guestName || chatSession.userId || 'Гость';
    
    let surveyMessage = `📊 **ОБРАТНАЯ СВЯЗЬ ОТ ${userName.toUpperCase()}**\n\n`;
    surveyMessage += `🎯 **Общая оценка: ${averageRating}/5** ${getSurveyEmoji(averageRating)}\n\n`;
    surveyMessage += `📈 **Детальные оценки:**\n`;
    surveyMessage += `• Удовлетворенность: ${surveyData.satisfaction}/5 ${getSurveyEmoji(surveyData.satisfaction)}\n`;
    surveyMessage += `• Полезность: ${surveyData.helpfulness}/5 ${getSurveyEmoji(surveyData.helpfulness)}\n`;
    surveyMessage += `• Рекомендация: ${surveyData.recommendation}/5 ${getSurveyEmoji(surveyData.recommendation)}\n`;
    
    if (surveyData.feedback && surveyData.feedback.trim()) {
      surveyMessage += `\n💬 **Комментарий:**\n"${surveyData.feedback.trim()}"`;
    }
    
    surveyMessage += `\n\n📞 **Контакт:** ${chatSession.guestEmail || 'Не указан'}`;
    surveyMessage += `\n🕒 **Дата:** ${new Date().toLocaleString('ru-RU')}`;
    
    // Добавляем системное сообщение с результатами опроса
    const surveySystemMessage = {
      type: 'system',
      content: surveyMessage,
      timestamp: new Date().toISOString(),
      author: 'Система оценки',
      isRead: false
    };
    
    await db.collection('chat_sessions').updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { messages: surveySystemMessage }
      }
    );
    
    console.log(`📊 Опрос завершен для чата ${id}:`, {
      userName,
      averageRating,
      satisfaction: surveyData.satisfaction,
      helpfulness: surveyData.helpfulness,
      recommendation: surveyData.recommendation,
      hasFeedback: !!surveyData.feedback
    });
    
    res.json({ 
      message: 'Спасибо за вашу оценку! Ваш отзыв поможет нам улучшить качество обслуживания.',
      averageRating,
      chatClosed: true
    });
  } catch (error) {
    console.error('Ошибка сохранения опроса:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить все чаты для админов
app.get('/api/admin/chats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const chats = await db.collection('chat_sessions')
      .find({})
      .sort({ lastActivity: -1 })
      .toArray();
    
    res.json(chats.map(chat => ({
      ...chat,
      _id: chat._id.toString()
    })));
  } catch (error) {
    console.error('Ошибка получения чатов:', error);
    res.status(500).json({ error: error.message });
  }
});

// Закрыть чат
app.put('/api/admin/chats/:id/close', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    const { id } = req.params;
    
    await db.collection('chat_sessions').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'closed', lastActivity: new Date().toISOString() } }
    );
    
    res.json({ message: 'Чат закрыт' });
  } catch (error) {
    console.error('Ошибка закрытия чата:', error);
    res.status(500).json({ error: error.message });
  }
});

// Проверка статуса API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API сервер работает', 
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health',
      'GET /api/admin/products', 
      'GET /api/admin/chats',
      'POST /api/chat'
    ]
  });
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    
    // Получаем новость перед удалением
    const news = await db.collection('news').findOne({ _id: new ObjectId(id) });
    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    
    // Удаляем новость
    const result = await db.collection('news').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    
    console.log(`🗑️ Новость ${news.title} удалена администратором ${currentUser.name}`);
    res.json({ message: 'Новость удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление новости
app.put('/api/news/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    const { title, content, summary, imageUrl, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Заголовок и содержание обязательны' });
    }

    const updateData = {
      title,
      content,
      summary: summary || content.substring(0, 200) + '...',
      imageUrl: imageUrl || '/placeholder-news.jpg',
      published,
      updatedAt: new Date()
    };
    
    const result = await db.collection('news').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    const updatedNews = await db.collection('news').findOne({ _id: new ObjectId(id) });
    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Комментарии к новостям
app.get('/api/news/:newsId/comments', async (req, res) => {
  try {
    const { newsId } = req.params;
    
    const comments = await db.collection('comments').find({
      newsId: newsId,
      isApproved: true
    }).sort({ createdAt: -1 }).toArray();
    
    res.json(comments.map(comment => ({
      ...comment,
      _id: comment._id.toString()
    })));
  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Неверный ID новости' });
    }
    const news = await db.collection('news').findOne({ _id: new ObjectId(id) });
    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    res.json({
      ...news,
      _id: news._id.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Категории товаров
app.get('/api/product-categories', async (req, res) => {
  try {
    const categories = await db.collection('productcategories').find({}).sort({ name: 1 }).toArray();
    
    res.json(categories.map(category => ({
      _id: category._id.toString(),
      name: category.name,
      description: category.description,
      slug: category.slug,
      createdAt: category.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Функция для запуска сервера ПОСЛЕ определения всех маршрутов
async function run() {
  try {
    await client.connect();
    db = client.db("tech-site-craft");
    console.log("✅ Подключение к MongoDB установлено");
    
    const http = require('http');
    const server = http.createServer(app);
    const initWebSocket = require('./ws');
    
    initWebSocket(server, db);

    server.listen(PORT, () => {
      console.log(`🚀 API server and WebSocket running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Ошибка подключения к MongoDB:", err);
    process.exit(1);
  }
}

// Вызываем запуск в самом конце файла
run().catch(console.dir);