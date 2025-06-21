const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Конфигурация подключения
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-site-craft';

async function initSampleData() {
  let client;
  
  try {
    console.log('🔗 Подключение к MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log('✅ Подключение установлено');

    // Очистка существующих данных (опционально)
    console.log('🧹 Очистка существующих коллекций...');
    const collections = ['users', 'departments', 'employees', 'productcategories', 'products', 'news', 'orders', 'reviews', 'comments', 'contactmessages', 'chats', 'chat_sessions'];
    
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).deleteMany({});
        console.log(`   ✓ ${collectionName} очищена`);
      } catch (error) {
        console.log(`   - ${collectionName} не существует или уже пуста`);
      }
    }

    // 1. Создание администратора
    console.log('\n👤 Создание администратора...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      name: 'Admin',
      email: 'test@admin.com',
      password: adminPassword,
      role: 'admin',
      profile: {
        firstName: 'Администратор',
        lastName: 'Системы',
        position: 'Системный администратор',
        department: 'IT отдел'
      },
      createdAt: new Date()
    };
    
    const userResult = await db.collection('users').insertOne(adminUser);
    console.log('   ✓ Администратор создан:', adminUser.email);

    // 2. Создание отделов
    console.log('\n🏢 Создание отделов...');
    const departments = [
      { name: 'IT отдел', description: 'Информационные технологии и техническая поддержка' },
      { name: 'Отдел продаж', description: 'Продажи и работа с клиентами' },
      { name: 'Сервисный центр', description: 'Ремонт и обслуживание техники' },
      { name: 'Склад', description: 'Управление складскими запасами' },
      { name: 'Администрация', description: 'Административное управление' }
    ];
    
    const departmentResults = await db.collection('departments').insertMany(
      departments.map(dept => ({ ...dept, createdAt: new Date() }))
    );
    console.log(`   ✓ Создано отделов: ${departments.length}`);

    // 3. Создание сотрудников
    console.log('\n👥 Создание сотрудников...');
    const departmentIds = Object.values(departmentResults.insertedIds);
    const employees = [
      {
        firstName: 'Иван',
        lastName: 'Петров',
        middleName: 'Сергеевич',
        position: 'Менеджер по продажам',
        departmentId: departmentIds[1],
        personalPhone: '+7 (999) 123-45-67',
        workEmail: 'i.petrov@techsite.ru',
        hireDate: new Date('2023-01-15'),
        isActive: true,
        createdAt: new Date()
      },
      {
        firstName: 'Анна',
        lastName: 'Сидорова',
        middleName: 'Александровна',
        position: 'Специалист сервисного центра',
        departmentId: departmentIds[2],
        personalPhone: '+7 (999) 234-56-78',
        workEmail: 'a.sidorova@techsite.ru',
        hireDate: new Date('2023-03-10'),
        isActive: true,
        createdAt: new Date()
      },
      {
        firstName: 'Михаил',
        lastName: 'Козлов',
        position: 'Кладовщик',
        departmentId: departmentIds[3],
        personalPhone: '+7 (999) 345-67-89',
        workEmail: 'm.kozlov@techsite.ru',
        hireDate: new Date('2023-02-20'),
        isActive: true,
        createdAt: new Date()
      }
    ];
    
    await db.collection('employees').insertMany(employees);
    console.log(`   ✓ Создано сотрудников: ${employees.length}`);

    // 4. Создание категорий товаров
    console.log('\n📂 Создание категорий товаров...');
    const categories = [
      { name: 'Стиральные машины', slug: 'washing-machines' },
      { name: 'Холодильники', slug: 'refrigerators' },
      { name: 'Посудомоечные машины', slug: 'dishwashers' },
      { name: 'Плиты и варочные панели', slug: 'stoves-cooktops' },
      { name: 'Микроволновые печи', slug: 'microwaves' },
      { name: 'Мелкая бытовая техника', slug: 'small-appliances' }
    ];
    
    const categoryResults = await db.collection('productcategories').insertMany(
      categories.map(cat => ({ ...cat, createdAt: new Date() }))
    );
    console.log(`   ✓ Создано категорий: ${categories.length}`);

    // 5. Создание товаров
    console.log('\n🛍️ Создание товаров...');
    const categoryIds = Object.values(categoryResults.insertedIds);
    const products = [
      {
        name: 'Стиральная машина Samsung WW80T4540TE',
        price: 45990,
        originalPrice: 52990,
        discount: {
          type: 'percentage',
          value: 13,
          isActive: true
        },
        categoryId: categoryIds[0],
        imageUrl: '/images/products/samsung-washing.jpg',
        description: 'Стиральная машина с инверторным двигателем и технологией EcoBubble',
        shortDescription: 'Энергоэффективная стиральная машина на 8 кг',
        features: ['Инверторный двигатель', 'EcoBubble', 'Класс A+++', '8 кг загрузки'],
        specifications: {
          'Загрузка': '8 кг',
          'Скорость отжима': '1400 об/мин',
          'Класс энергопотребления': 'A+++',
          'Размеры': '60x55x85 см'
        },
        brand: 'Samsung',
        model: 'WW80T4540TE',
        sku: 'SAM-WM-001',
        inStock: true,
        stockQuantity: 15,
        isActive: true,
        isFeatured: true,
        rating: 4.5,
        reviewCount: 23,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Холодильник LG GA-B459SQCL',
        price: 89990,
        categoryId: categoryIds[1],
        imageUrl: '/images/products/lg-fridge.jpg',
        description: 'Двухкамерный холодильник с технологией No Frost',
        shortDescription: 'Просторный холодильник с системой No Frost',
        features: ['No Frost', 'Инверторный компрессор', 'LED подсветка', 'Зона свежести'],
        specifications: {
          'Объем': '384 л',
          'Тип': 'Двухкамерный',
          'Система охлаждения': 'No Frost',
          'Размеры': '59.5x68.2x200.7 см'
        },
        brand: 'LG',
        model: 'GA-B459SQCL',
        sku: 'LG-RF-001',
        inStock: true,
        stockQuantity: 8,
        isActive: true,
        isFeatured: true,
        rating: 4.7,
        reviewCount: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Посудомоечная машина Bosch SMS25AW03E',
        price: 32990,
        categoryId: categoryIds[2],
        imageUrl: '/images/products/bosch-dishwasher.jpg',
        description: 'Отдельностоящая посудомоечная машина на 12 комплектов',
        shortDescription: 'Экономичная посудомойка от Bosch',
        features: ['12 комплектов', 'Класс A+', '5 программ', 'Защита от протечек'],
        specifications: {
          'Вместимость': '12 комплектов',
          'Класс энергопотребления': 'A+',
          'Программы': '5',
          'Размеры': '60x60x85 см'
        },
        brand: 'Bosch',
        model: 'SMS25AW03E',
        sku: 'BSH-DW-001',
        inStock: true,
        stockQuantity: 12,
        isActive: true,
        isFeatured: false,
        rating: 4.3,
        reviewCount: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Электрическая плита Electrolux EKC54952OX',
        price: 54990,
        categoryId: categoryIds[3],
        imageUrl: '/images/products/electrolux-stove.jpg',
        description: 'Электрическая плита с духовкой и грилем',
        shortDescription: 'Многофункциональная электрическая плита',
        features: ['Духовка 72л', 'Гриль', 'Таймер', 'Стеклокерамическая поверхность'],
        specifications: {
          'Объем духовки': '72 л',
          'Тип варочной поверхности': 'Стеклокерамика',
          'Количество конфорок': '4',
          'Размеры': '60x60x85 см'
        },
        brand: 'Electrolux',
        model: 'EKC54952OX',
        sku: 'ELX-ST-001',
        inStock: true,
        stockQuantity: 6,
        isActive: true,
        isFeatured: false,
        rating: 4.2,
        reviewCount: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const productResults = await db.collection('products').insertMany(products);
    console.log(`   ✓ Создано товаров: ${products.length}`);

    // 6. Создание новостей
    console.log('\n📰 Создание новостей...');
    const news = [
      {
        title: 'Новое поступление техники Samsung',
        excerpt: 'В наш магазин поступила новая партия бытовой техники Samsung с улучшенными характеристиками.',
        content: 'Мы рады сообщить о поступлении новой коллекции бытовой техники Samsung. В ассортименте представлены стиральные машины, холодильники и другая техника с передовыми технологиями.',
        imageUrl: '/images/news/samsung-news.jpg',
        published: true,
        createdAt: new Date()
      },
      {
        title: 'Скидки до 20% на технику LG',
        excerpt: 'Специальное предложение на всю технику LG действует до конца месяца.',
        content: 'Не упустите возможность приобрести качественную технику LG со скидкой до 20%. Акция действует на холодильники, стиральные машины и мелкую бытовую технику.',
        imageUrl: '/images/news/lg-sale.jpg',
        published: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // вчера
      },
      {
        title: 'Расширение сервисного центра',
        excerpt: 'Мы открыли новый сервисный центр для более быстрого обслуживания клиентов.',
        content: 'В связи с растущим количеством клиентов мы расширили наш сервисный центр. Теперь ремонт техники будет происходить еще быстрее и качественнее.',
        imageUrl: '/images/news/service-center.jpg',
        published: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // неделю назад
      }
    ];
    
    const newsResults = await db.collection('news').insertMany(news);
    console.log(`   ✓ Создано новостей: ${news.length}`);

    // 7. Создание тестового заказа
    console.log('\n📦 Создание тестового заказа...');
    const productIds = Object.values(productResults.insertedIds);
    const testOrder = {
      userId: userResult.insertedId,
      total: 45990,
      status: 'delivered',
      shippingAddress: {
        street: 'ул. Ленина, 123',
        city: 'Москва',
        postalCode: '123456',
        country: 'Россия'
      },
      items: [
        {
          productId: productIds[0],
          quantity: 1,
          price: 45990
        }
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 дней назад
    };
    
    const orderResult = await db.collection('orders').insertOne(testOrder);
    console.log('   ✓ Создан тестовый заказ');

    // 8. Создание отзывов
    console.log('\n⭐ Создание отзывов...');
    const reviews = [
      {
        productId: productIds[0],
        userId: userResult.insertedId,
        orderId: orderResult.insertedId,
        userName: 'Иван Петров',
        userEmail: 'ivan@example.com',
        rating: 5,
        text: 'Отличная стиральная машина! Стирает очень качественно и тихо работает. Рекомендую!',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isVerifiedPurchase: true,
        helpfulCount: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: productIds[1],
        userName: 'Мария Сидорова',
        userEmail: 'maria@example.com',
        rating: 4,
        text: 'Хороший холодильник, просторный и экономичный. Единственный минус - немного шумный.',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isVerifiedPurchase: false,
        helpfulCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('reviews').insertMany(reviews);
    console.log(`   ✓ Создано отзывов: ${reviews.length}`);

    // 9. Создание комментариев к новостям
    console.log('\n💬 Создание комментариев...');
    const newsIds = Object.values(newsResults.insertedIds);
    const comments = [
      {
        newsId: newsIds[0].toString(),
        author: 'Алексей',
        email: 'alexey@example.com',
        content: 'Отличные новости! Давно ждал новую технику Samsung.',
        createdAt: new Date(),
        isApproved: true
      },
      {
        newsId: newsIds[1].toString(),
        author: 'Елена',
        email: 'elena@example.com',
        content: 'Супер акция! Успела купить холодильник со скидкой.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
        isApproved: true
      }
    ];
    
    await db.collection('comments').insertMany(comments);
    console.log(`   ✓ Создано комментариев: ${comments.length}`);

    // 10. Создание сообщений обратной связи
    console.log('\n📧 Создание сообщений обратной связи...');
    const contactMessages = [
      {
        name: 'Дмитрий Волков',
        email: 'dmitry@example.com',
        phone: '+7 (999) 456-78-90',
        subject: 'Вопрос по доставке',
        message: 'Здравствуйте! Подскажите, возможна ли доставка в Подмосковье?',
        createdAt: new Date(),
        isRead: false
      },
      {
        name: 'Ольга Петрова',
        email: 'olga@example.com',
        phone: '+7 (999) 567-89-01',
        subject: 'Гарантийное обслуживание',
        message: 'У меня вопрос по гарантийному обслуживанию стиральной машины.',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 часов назад
        isRead: true,
        response: 'Здравствуйте! Гарантийное обслуживание осуществляется в нашем сервисном центре.',
        respondedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        respondedBy: 'Анна Сидорова'
      }
    ];
    
    await db.collection('contactmessages').insertMany(contactMessages);
    console.log(`   ✓ Создано сообщений: ${contactMessages.length}`);

    // 11. Создание тестовых чатов
    console.log('\n💬 Создание тестовых чатов...');
    
    // Создаем сессии чатов
    const chatSessions = [
      {
        userId: userResult.insertedId.toString(),
        userName: 'Admin',
        userEmail: 'test@admin.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const chatSessionResults = await db.collection('chat_sessions').insertMany(chatSessions);
    
    // Создаем сообщения чатов
    const chats = [
      {
        sessionId: Object.values(chatSessionResults.insertedIds)[0].toString(),
        userId: userResult.insertedId.toString(),
        userName: 'Admin',
        message: 'Добро пожаловать в техподдержку!',
        timestamp: new Date(),
        isFromAdmin: true
      }
    ];
    
    await db.collection('chats').insertMany(chats);
    console.log(`   ✓ Создано чат-сессий: ${chatSessions.length}`);
    console.log(`   ✓ Создано сообщений чата: ${chats.length}`);

    console.log('\n🎉 Инициализация завершена успешно!');
    console.log('\n📋 Данные для входа:');
    console.log('   Email: test@admin.com');
    console.log('   Пароль: admin123');
    console.log('   Роль: admin');
    
    console.log('\n📊 Созданные коллекции:');
    console.log(`   👤 Пользователи: 1`);
    console.log(`   🏢 Отделы: ${departments.length}`);
    console.log(`   👥 Сотрудники: ${employees.length}`);
    console.log(`   📂 Категории: ${categories.length}`);
    console.log(`   🛍️ Товары: ${products.length}`);
    console.log(`   📰 Новости: ${news.length}`);
    console.log(`   📦 Заказы: 1`);
    console.log(`   ⭐ Отзывы: ${reviews.length}`);
    console.log(`   💬 Комментарии: ${comments.length}`);
    console.log(`   📧 Сообщения: ${contactMessages.length}`);
    console.log(`   💬 Чат-сессии: ${chatSessions.length}`);

  } catch (error) {
    console.error('❌ Ошибка при инициализации данных:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔒 Соединение с MongoDB закрыто');
    }
  }
}

// Запуск скрипта
if (require.main === module) {
  initSampleData()
    .then(() => {
      console.log('\n✅ Скрипт выполнен успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка выполнения скрипта:', error);
      process.exit(1);
    });
}

module.exports = { initSampleData };