# BT-Tech - Интернет-магазин бытовой техники

Современный интернет-магазин бытовой техники с админ-панелью, системой чатов и полным функционалом электронной коммерции.

## 🚀 Особенности

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + MongoDB
- **Чат-система**: WebSocket (Socket.io) с админ-панелью
- **Авторизация**: JWT токены
- **UI**: Tailwind CSS + shadcn/ui компоненты
- **Карты**: Интеграция с Яндекс.Картами

## 📋 Функциональность

### Для покупателей:
- 🛍️ Каталог товаров с фильтрацией и поиском
- 🛒 Корзина и оформление заказов
- 👤 Личный кабинет с историей заказов
- 💬 Система онлайн-чата с поддержкой
- ⭐ Отзывы и рейтинги товаров
- 📍 Интеграция с картами для доставки

### Для администраторов:
- 📊 Панель аналитики с графиками
- 📦 Управление товарами и категориями
- 👥 Управление пользователями и сотрудниками
- 💬 Система управления чатами
- 📰 Управление новостями
- 📋 Управление заказами

### Система чатов:
- 💬 Реальное время через WebSocket
- 🤖 Быстрые ответы для консультантов
- 📦 Отправка товаров и заказов в чат
- 📊 Система оценки качества обслуживания
- 📱 Адаптивный дизайн

## 🛠️ Технологический стек

### Frontend:
- React 18.3.1
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Socket.io-client
- Recharts (графики)
- Lucide React (иконки)

### Backend:
- Node.js
- Express.js
- MongoDB
- Socket.io
- JWT
- bcryptjs
- Multer (загрузка файлов)

## 📦 Установка и запуск

### Предварительные требования:
- Node.js 18+ 
- MongoDB 6+
- npm или yarn

### 1. Клонирование репозитория:
```bash
git clone https://github.com/ваш-username/bt-tech.git
cd bt-tech
```

### 2. Установка зависимостей:

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

### 3. Настройка MongoDB:

**Запуск MongoDB:**
```bash
# Windows
mongod

# macOS (через Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Инициализация базы данных:**
```bash
node scripts/init-sample-data.js
```

### 4. Настройка переменных окружения:

Создайте файл `.env` в корне проекта:
```env
VITE_API_URL=http://localhost:3001
VITE_YANDEX_MAPS_API_KEY=your-yandex-maps-api-key
```

Создайте файл `server/.env`:
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/tech-site-craft
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 5. Запуск проекта:

**Разработка (два терминала):**

Терминал 1 - Backend:
```bash
cd server
npm start
```

Терминал 2 - Frontend:
```bash
npm run dev
```

**Или одной командой (Windows):**
```bash
start-all.bat
```

### 6. Доступ к приложению:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Админ-панель**: http://localhost:8080/admin

## 👤 Тестовые аккаунты

### Администратор:
- **Email**: admin@bt-tech.ru
- **Пароль**: admin123

### Пользователь:
- **Email**: user@example.com
- **Пароль**: user123

## 📁 Структура проекта

```
bt-tech/
├── public/                 # Статические файлы
│   ├── images/            # Изображения
│   └── favicon.ico
├── src/                   # Frontend исходники
│   ├── components/        # React компоненты
│   │   ├── admin/        # Админ-панель
│   │   ├── ui/           # UI компоненты
│   │   └── ...
│   ├── pages/            # Страницы
│   ├── hooks/            # React хуки
│   ├── services/         # API сервисы
│   ├── types/            # TypeScript типы
│   └── styles/           # Стили
├── server/               # Backend
│   ├── index.js          # Основной сервер
│   ├── ws.js             # WebSocket сервер
│   └── package.json
├── scripts/              # Скрипты
│   └── init-sample-data.js
└── docs/                 # Документация
```

## 🗄️ База данных

### Коллекции MongoDB:

1. **users** - Пользователи системы
2. **products** - Товары
3. **productcategories** - Категории товаров
4. **orders** - Заказы
5. **reviews** - Отзывы
6. **news** - Новости
7. **employees** - Сотрудники
8. **departments** - Отделы
9. **chat_sessions** - Чат-сессии
10. **comments** - Комментарии к новостям

## 🚀 Деплой

### 1. Подготовка к деплою:

**Сборка frontend:**
```bash
npm run build
```

**Настройка production переменных:**
```env
# .env.production
VITE_API_URL=https://your-domain.com/api
VITE_YANDEX_MAPS_API_KEY=your-production-api-key
```

### 2. Деплой на VPS/VDS:

**Установка на сервер:**
```bash
# Клонирование на сервер
git clone https://github.com/ваш-username/bt-tech.git
cd bt-tech

# Установка зависимостей
npm install
cd server && npm install && cd ..

# Сборка
npm run build

# Настройка PM2 для автозапуска
npm install -g pm2
pm2 start server/index.js --name "bt-tech-api"
pm2 startup
pm2 save
```

**Nginx конфигурация:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/bt-tech/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Деплой на Vercel/Netlify:

**Vercel (Frontend):**
```bash
npm install -g vercel
vercel --prod
```

**Railway/Render (Backend):**
- Подключите GitHub репозиторий
- Настройте переменные окружения
- Укажите команду запуска: `cd server && npm start`

### 4. Деплой базы данных:

**MongoDB Atlas:**
1. Создайте кластер на https://cloud.mongodb.com
2. Настройте сетевой доступ
3. Обновите MONGO_URI в переменных окружения

## 🔧 Разработка

### Полезные команды:

```bash
# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Предварительный просмотр сборки
npm run preview

# Линтинг
npm run lint

# Инициализация базы данных
node scripts/init-sample-data.js

# Проверка API
curl http://localhost:3001/api/health
```

### Добавление новых компонентов:

```bash
# Добавление нового UI компонента
npx shadcn-ui@latest add button

# Создание нового API эндпоинта
# Добавьте в server/index.js
```

## 🐛 Устранение неполадок

### Частые проблемы:

1. **MongoDB не подключается:**
   - Проверьте запущен ли MongoDB
   - Проверьте MONGO_URI в .env

2. **WebSocket не работает:**
   - Проверьте порт 3001
   - Убедитесь что сервер запущен

3. **Ошибки CORS:**
   - Проверьте настройки CORS в server/index.js

4. **Проблемы с авторизацией:**
   - Проверьте JWT_SECRET
   - Очистите localStorage в браузере

## 📄 Лицензия

MIT License - смотрите файл [LICENSE](LICENSE) для деталей.

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в GitHub

## 🔄 Обновления

Чтобы получить последние обновления:
```bash
git pull origin main
npm install
cd server && npm install && cd ..
```

---

**МВЕК. Работа выполнена студентом 3 курса группы ЭдИС-223/21, Шереметов Вячеслав Викторович.** 
