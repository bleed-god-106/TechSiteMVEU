# Руководство по деплою BT-Tech

## Подготовка к деплою

### 1. Проверка готовности проекта

```bash
# Проверка сборки frontend
npm run build

# Проверка backend
cd server
npm test  # если есть тесты
npm start

# Проверка подключения к MongoDB
node -e "console.log('MongoDB URI:', process.env.MONGO_URI || 'mongodb://localhost:27017/tech-site-craft')"
```

### 2. Создание production переменных окружения

Создайте файл `.env.production`:
```env
VITE_API_URL=https://your-domain.com/api
VITE_YANDEX_MAPS_API_KEY=your-production-api-key
```

Создайте файл `server/.env.production`:
```env
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tech-site-craft
JWT_SECRET=your-super-secret-production-jwt-key-min-32-chars
CORS_ORIGIN=https://your-domain.com
```

## Деплой на VPS/VDS (Ubuntu)

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Запуск MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Установка Nginx
sudo apt install -y nginx

# Установка PM2
sudo npm install -g pm2
```

### 2. Клонирование и настройка проекта

```bash
# Клонирование репозитория
cd /var/www
sudo git clone https://github.com/ваш-username/bt-tech.git
sudo chown -R $USER:$USER bt-tech
cd bt-tech

# Установка зависимостей
npm install
cd server && npm install && cd ..

# Копирование production переменных
cp .env.production .env
cp server/.env.production server/.env

# Сборка frontend
npm run build

# Инициализация базы данных
node scripts/init-sample-data.js
```

### 3. Настройка PM2

Создайте файл `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'bt-tech-api',
    script: 'server/index.js',
    cwd: '/var/www/bt-tech',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/bt-tech-error.log',
    out_file: '/var/log/pm2/bt-tech-out.log',
    log_file: '/var/log/pm2/bt-tech-combined.log'
  }]
};
```

Запуск приложения:
```bash
# Создание директории для логов
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Запуск через PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 4. Настройка Nginx

Создайте файл `/etc/nginx/sites-available/bt-tech`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Размер загружаемых файлов
    client_max_body_size 10M;
    
    # Логи
    access_log /var/log/nginx/bt-tech.access.log;
    error_log /var/log/nginx/bt-tech.error.log;

    # Frontend (статические файлы)
    location / {
        root /var/www/bt-tech/dist;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API проксирование
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket для чатов
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

Активация конфигурации:
```bash
# Создание симлинка
sudo ln -s /etc/nginx/sites-available/bt-tech /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавить строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Деплой на облачные платформы

### 1. Vercel (Frontend)

Создайте файл `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-url.com/api",
    "VITE_YANDEX_MAPS_API_KEY": "@yandex-maps-api-key"
  }
}
```

Деплой:
```bash
npm install -g vercel
vercel --prod
```

### 2. Railway (Backend)

Создайте файл `railway.toml`:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd server && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

Переменные окружения в Railway:
- `NODE_ENV=production`
- `PORT=3001`
- `MONGO_URI=mongodb+srv://...`
- `JWT_SECRET=your-secret`

### 3. Render (Backend)

Создайте файл `render.yaml`:
```yaml
services:
  - type: web
    name: bt-tech-api
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        fromDatabase:
          name: bt-tech-db
          property: connectionString
```

### 4. MongoDB Atlas

1. Создайте аккаунт на https://cloud.mongodb.com
2. Создайте новый кластер
3. Настройте сетевой доступ (добавьте IP сервера)
4. Создайте пользователя базы данных
5. Получите строку подключения
6. Обновите `MONGO_URI` в переменных окружения

## Docker деплой

### 1. Dockerfile для backend

Создайте `server/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копирование package.json
COPY package*.json ./
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

EXPOSE 3001

USER node

CMD ["npm", "start"]
```

### 2. Dockerfile для frontend

Создайте `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

Создайте `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: bt-tech-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - bt-tech-network

  backend:
    build: ./server
    container_name: bt-tech-api
    environment:
      NODE_ENV: production
      MONGO_URI: mongodb://admin:password123@mongodb:27017/tech-site-craft?authSource=admin
      JWT_SECRET: your-super-secret-jwt-key
    ports:
      - "3001:3001"
    depends_on:
      - mongodb
    networks:
      - bt-tech-network

  frontend:
    build: .
    container_name: bt-tech-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - bt-tech-network

volumes:
  mongodb_data:

networks:
  bt-tech-network:
    driver: bridge
```

Запуск:
```bash
docker-compose up -d
```

## Мониторинг и обслуживание

### 1. Логирование

```bash
# Просмотр логов PM2
pm2 logs bt-tech-api

# Просмотр логов Nginx
sudo tail -f /var/log/nginx/bt-tech.access.log
sudo tail -f /var/log/nginx/bt-tech.error.log

# Просмотр логов MongoDB
sudo tail -f /var/log/mongodb/mongod.log
```

### 2. Мониторинг производительности

```bash
# Статус PM2
pm2 status
pm2 monit

# Использование ресурсов
htop
df -h
free -h

# Статус сервисов
sudo systemctl status nginx
sudo systemctl status mongod
```

### 3. Резервное копирование

Создайте скрипт `backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/backups/bt-tech"
DATE=$(date +%Y%m%d_%H%M%S)

# Создание директории
mkdir -p $BACKUP_DIR

# Резервная копия MongoDB
mongodump --out $BACKUP_DIR/mongo_$DATE

# Резервная копия файлов
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/bt-tech

# Удаление старых копий (старше 7 дней)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Резервная копия создана: $DATE"
```

Добавьте в crontab:
```bash
sudo crontab -e
# Добавить:
0 2 * * * /path/to/backup.sh
```

### 4. Обновление приложения

Создайте скрипт `deploy.sh`:
```bash
#!/bin/bash

cd /var/www/bt-tech

# Остановка приложения
pm2 stop bt-tech-api

# Получение обновлений
git pull origin main

# Установка зависимостей
npm install
cd server && npm install && cd ..

# Сборка frontend
npm run build

# Запуск приложения
pm2 start bt-tech-api

echo "Деплой завершен успешно"
```

## Проверка деплоя

### 1. Проверка доступности

```bash
# Проверка API
curl https://your-domain.com/api/health

# Проверка frontend
curl -I https://your-domain.com

# Проверка WebSocket
wscat -c wss://your-domain.com/socket.io/?EIO=4&transport=websocket
```

### 2. Проверка производительности

```bash
# Нагрузочное тестирование
npm install -g artillery
artillery quick --count 10 --num 10 https://your-domain.com

# Проверка скорости загрузки
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com
```

### 3. Проверка безопасности

```bash
# Проверка SSL
curl -I https://your-domain.com
openssl s_client -connect your-domain.com:443

# Проверка заголовков безопасности
curl -I https://your-domain.com | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection)"
```

## Устранение проблем

### Частые проблемы:

1. **502 Bad Gateway**
   - Проверьте статус PM2: `pm2 status`
   - Проверьте логи: `pm2 logs`
   - Перезапустите приложение: `pm2 restart bt-tech-api`

2. **MongoDB подключение**
   - Проверьте статус: `sudo systemctl status mongod`
   - Проверьте строку подключения в `.env`
   - Проверьте логи: `sudo tail -f /var/log/mongodb/mongod.log`

3. **SSL проблемы**
   - Обновите сертификат: `sudo certbot renew`
   - Проверьте конфигурацию Nginx: `sudo nginx -t`

4. **Медленная работа**
   - Проверьте использование ресурсов: `htop`
   - Оптимизируйте MongoDB: создайте индексы
   - Настройте кэширование в Nginx

## Заключение

После успешного деплоя ваше приложение будет доступно по адресу вашего домена. Не забудьте:

1. Настроить мониторинг
2. Настроить резервное копирование
3. Обновить DNS записи
4. Настроить уведомления об ошибках
5. Провести нагрузочное тестирование 