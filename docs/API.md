# API Документация BT-Tech

## Базовая информация

- **Base URL**: `http://localhost:3001/api`
- **Авторизация**: JWT токен в заголовке `Authorization: Bearer <token>`
- **Формат данных**: JSON

## Аутентификация

### POST /auth/register
Регистрация нового пользователя

**Тело запроса:**
```json
{
  "name": "Иван Петров",
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "message": "Пользователь создан успешно",
  "user": {
    "_id": "...",
    "name": "Иван Петров",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

### POST /auth/login
Вход в систему

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "message": "Вход выполнен успешно",
  "user": {
    "_id": "...",
    "name": "Иван Петров",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

### GET /auth/me
Получение информации о текущем пользователе (требует авторизации)

**Ответ:**
```json
{
  "_id": "...",
  "name": "Иван Петров",
  "email": "user@example.com",
  "role": "user",
  "profile": {
    "firstName": "Иван",
    "lastName": "Петров",
    "phone": "+7 (999) 123-45-67"
  }
}
```

## Товары

### GET /products
Получение списка активных товаров

**Параметры запроса:**
- `search` - поиск по названию
- `category` - ID категории
- `brand` - бренд товара
- `minPrice` - минимальная цена
- `maxPrice` - максимальная цена
- `featured` - только рекомендуемые (true/false)
- `page` - номер страницы (по умолчанию 1)
- `limit` - количество товаров на странице (по умолчанию 20)

**Ответ:**
```json
{
  "products": [
    {
      "_id": "...",
      "name": "Телевизор Samsung UE55AU7100U",
      "price": 89990,
      "originalPrice": 99990,
      "images": ["/images/products/samsung-tv.jpg"],
      "brand": "Samsung",
      "stockQuantity": 15,
      "rating": 4.5,
      "reviewCount": 12,
      "discount": {
        "type": "percentage",
        "value": 10,
        "isActive": true
      }
    }
  ],
  "total": 8,
  "page": 1,
  "totalPages": 1
}
```

### GET /products/:id
Получение детальной информации о товаре

**Ответ:**
```json
{
  "_id": "...",
  "name": "Телевизор Samsung UE55AU7100U",
  "description": "Современный телевизор Samsung...",
  "price": 89990,
  "originalPrice": 99990,
  "images": ["/images/products/samsung-tv.jpg"],
  "specifications": {
    "Диагональ": "55\"",
    "Разрешение": "3840x2160"
  },
  "reviews": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "Отличный телевизор!",
      "user": {
        "name": "Иван Петров"
      }
    }
  ]
}
```

### POST /products (Только для админов)
Создание нового товара

**Тело запроса:**
```json
{
  "name": "Новый товар",
  "description": "Описание товара",
  "price": 50000,
  "category": "category_id",
  "brand": "Samsung",
  "stockQuantity": 10
}
```

### PUT /products/:id (Только для админов)
Обновление товара

### DELETE /products/:id (Только для админов)
Удаление товара

## Заказы

### GET /orders/my
Получение заказов текущего пользователя (требует авторизации)

**Ответ:**
```json
[
  {
    "_id": "...",
    "orderNumber": "ORD-2024-001",
    "status": "delivered",
    "totalAmount": 89990,
    "items": [
      {
        "productId": "...",
        "productName": "Телевизор Samsung",
        "quantity": 1,
        "price": 89990
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### POST /orders
Создание нового заказа (требует авторизации)

**Тело запроса:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 1
    }
  ],
  "customerInfo": {
    "firstName": "Иван",
    "lastName": "Петров",
    "phone": "+7 (999) 123-45-67",
    "email": "user@example.com"
  },
  "deliveryInfo": {
    "type": "delivery",
    "address": {
      "city": "Москва",
      "street": "Ленинская улица, 25"
    }
  },
  "paymentMethod": "card"
}
```

### GET /admin/orders (Только для админов)
Получение всех заказов

### PUT /admin/orders/:id/status (Только для админов)
Изменение статуса заказа

**Тело запроса:**
```json
{
  "status": "processing"
}
```

### DELETE /orders/:id (Только для админов)
Удаление заказа

## Отзывы

### GET /reviews/product/:productId
Получение отзывов для товара

**Ответ:**
```json
[
  {
    "_id": "...",
    "rating": 5,
    "comment": "Отличный товар!",
    "user": {
      "name": "Иван Петров"
    },
    "isVerified": true,
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

### POST /reviews (требует авторизации)
Создание отзыва

**Тело запроса:**
```json
{
  "productId": "product_id",
  "rating": 5,
  "comment": "Отличный товар!"
}
```

## Пользователи (Админ)

### GET /admin/users (Только для админов)
Получение списка пользователей

### PUT /users/:id/role (Только для админов)
Изменение роли пользователя

**Тело запроса:**
```json
{
  "role": "admin"
}
```

### GET /users/:id/orders (Только для админов)
Получение заказов пользователя

### GET /users/:id/reviews (Только для админов)
Получение отзывов пользователя

## Сотрудники

### GET /employees
Получение списка сотрудников

### POST /employees (Только для админов)
Создание сотрудника

**Тело запроса:**
```json
{
  "firstName": "Анна",
  "lastName": "Смирнова",
  "position": "Консультант",
  "departmentId": "department_id",
  "personalEmail": "anna@example.com",
  "personalPhone": "+7 (999) 111-22-33"
}
```

### PUT /employees/:id (Только для админов)
Обновление сотрудника

### DELETE /employees/:id (Только для админов)
Удаление сотрудника

## Новости

### GET /news
Получение опубликованных новостей

**Параметры запроса:**
- `page` - номер страницы
- `limit` - количество новостей на странице
- `category` - категория новостей

### GET /news/:slug
Получение новости по slug

### POST /admin/news (Только для админов)
Создание новости

**Тело запроса:**
```json
{
  "title": "Заголовок новости",
  "content": "Содержимое новости",
  "excerpt": "Краткое описание",
  "category": "Новинки",
  "tags": ["тег1", "тег2"],
  "isPublished": true
}
```

### PUT /admin/news/:id (Только для админов)
Обновление новости

### DELETE /admin/news/:id (Только для админов)
Удаление новости

## Чат-система

### POST /chat/start
Начало новой чат-сессии

**Тело запроса:**
```json
{
  "name": "Иван Петров",
  "email": "user@example.com",
  "phone": "+7 (999) 123-45-67",
  "subject": "Вопрос о товаре"
}
```

**Ответ:**
```json
{
  "sessionId": "chat_1642678900_abc123",
  "message": "Чат-сессия создана"
}
```

### POST /chat/:sessionId/message
Отправка сообщения в чат

**Тело запроса:**
```json
{
  "content": "Текст сообщения",
  "sender": "user"
}
```

### GET /chat/:sessionId/messages
Получение сообщений чата

### POST /chat/:sessionId/survey
Отправка опроса качества обслуживания

**Тело запроса:**
```json
{
  "rating": 5,
  "helpfulness": 5,
  "recommendation": 5,
  "comment": "Отличная консультация!"
}
```

### GET /admin/chats (Только для админов)
Получение всех чат-сессий

### POST /admin/chats/:sessionId/close (Только для админов)
Закрытие чат-сессии

## Поиск (Админ)

### GET /admin/search (Только для админов)
Умный поиск по всем данным

**Параметры запроса:**
- `q` - поисковый запрос
- `category` - категория поиска (users, products, orders, employees, news)

**Ответ:**
```json
{
  "results": [
    {
      "type": "user",
      "id": "...",
      "title": "Иван Петров",
      "description": "user@example.com",
      "relevance": 0.95
    }
  ],
  "total": 1
}
```

## Аналитика (Админ)

### GET /stats (Только для админов)
Получение статистики для админ-панели

**Ответ:**
```json
{
  "totalUsers": 150,
  "totalOrders": 45,
  "totalProducts": 8,
  "totalRevenue": 2500000,
  "totalDepartments": 3,
  "totalEmployees": 12,
  "totalReviews": 28,
  "totalCategories": 3,
  "monthlyRevenue": 450000,
  "avgOrderValue": 55556,
  "avgCartSize": 1.2,
  "orderStatusStats": {
    "pending": 5,
    "confirmed": 8,
    "processing": 12,
    "shipped": 15,
    "delivered": 35,
    "cancelled": 3
  },
  "weeklyOrders": [
    {
      "date": "2024-01-15",
      "orders": 5,
      "revenue": 125000
    }
  ],
  "topProducts": [
    {
      "productName": "Телевизор Samsung",
      "totalSold": 15,
      "totalRevenue": 1349850
    }
  ]
}
```

## WebSocket События

### Подключение
```javascript
const socket = io('http://localhost:3001');
```

### События чата
- `join_session` - присоединение к чат-сессии
- `new_message` - новое сообщение
- `message_sent` - сообщение отправлено
- `session_closed` - сессия закрыта

### Пример использования
```javascript
// Присоединение к чат-сессии
socket.emit('join_session', { sessionId: 'chat_123' });

// Отправка сообщения
socket.emit('new_message', {
  sessionId: 'chat_123',
  content: 'Привет!',
  sender: 'user'
});

// Получение нового сообщения
socket.on('message_sent', (message) => {
  console.log('Новое сообщение:', message);
});
```

## Коды ошибок

- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `409` - Конфликт (например, email уже существует)
- `422` - Ошибка валидации
- `500` - Внутренняя ошибка сервера

## Примеры ошибок

```json
{
  "error": "Validation Error",
  "message": "Email уже существует",
  "details": {
    "field": "email",
    "code": "DUPLICATE_EMAIL"
  }
}
```

## Лимиты и ограничения

- Максимальный размер файла: 10MB
- Лимит запросов: 100 запросов в минуту на IP
- Максимальная длина сообщения в чате: 1000 символов
- Максимальное количество товаров в заказе: 20 