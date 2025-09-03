# Lovees App

Современное приложение знакомств на Next.js с аутентификацией, чатом и реалтайм функциями.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lovees"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (опционально)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Pusher (для реалтайм чата)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"

# UploadThing (для загрузки фото)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
S3_PUBLIC_URL="https://your-cdn-domain.com"
```

### 3. Настройка базы данных

```bash
# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev

# (Опционально) Заполнение тестовыми данными
npx prisma db seed
```

### 4. Запуск приложения

```bash
# Режим разработки
npm run dev

# Сборка для продакшена
npm run build
npm start
```

## 🔐 Аутентификация

### Регистрация тестового пользователя

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Вход в систему

Откройте в браузере: `http://localhost:3000/api/auth/signin?callbackUrl=%2F`

Или используйте стандартную страницу NextAuth: `http://localhost:3000/api/auth/signin`

## 📱 Основные функции

- ✅ **Аутентификация**: Credentials + Google OAuth
- ✅ **Профили пользователей**: Фото, интересы, геолокация
- ✅ **Поиск и свайпы**: Алгоритм подбора по предпочтениям
- ✅ **Реалтайм чат**: Pusher для мгновенных сообщений
- ✅ **Мэтчи**: Взаимные лайки создают мэтчи
- ✅ **Безопасность**: Rate limiting, репорты, блокировки
- ✅ **Темная тема**: Переключение светлой/темной темы

## 🛠 Технологии

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: PostgreSQL
- **Аутентификация**: NextAuth.js
- **Реалтайм**: Pusher
- **Файлы**: UploadThing
- **UI**: shadcn/ui, Framer Motion

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API роуты
│   │   ├── auth/          # NextAuth
│   │   ├── browse/        # Поиск кандидатов
│   │   ├── swipe/         # Свайпы
│   │   ├── matches/       # Мэтчи
│   │   ├── messages/      # Сообщения
│   │   └── ...
│   ├── browse/            # Страница поиска
│   ├── matches/           # Список мэтчей
│   ├── chat/              # Чат
│   └── settings/          # Настройки
├── components/            # React компоненты
│   ├── ui/               # UI примитивы
│   └── ...
├── lib/                  # Утилиты и конфигурация
│   ├── auth.ts           # NextAuth конфиг
│   ├── prisma.ts         # Prisma клиент
│   ├── pusher.ts         # Pusher сервер
│   └── ...
└── prisma/               # Схема базы данных
    └── schema.prisma
```

## 🔧 Команды разработки

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Линтинг
npm run lint
npm run lint:fix

# Форматирование
npm run format

# Тесты
npm run test
npm run test:ui

# E2E тесты
npm run test:e2e
```

## 📊 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `GET /api/auth/signin` - Вход
- `GET /api/auth/signout` - Выход

### Пользователи
- `GET /api/me` - Профиль пользователя
- `PATCH /api/me` - Обновление профиля
- `POST /api/me/photos` - Загрузка фото

### Поиск и свайпы
- `GET /api/browse` - Кандидаты для свайпа
- `POST /api/swipe` - Свайп (LEFT/RIGHT/SUPER)
- `GET /api/matches` - Список мэтчей

### Сообщения
- `GET /api/messages?matchId=...` - История сообщений
- `POST /api/messages` - Отправка сообщения
- `POST /api/messages/read` - Отметка как прочитанные

### Безопасность
- `POST /api/report` - Жалоба на пользователя
- `POST /api/block` - Блокировка пользователя
- `DELETE /api/block` - Разблокировка

## 🚀 Деплой

### Vercel

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в Vercel Dashboard
3. Деплой автоматически запустится

### База данных

Рекомендуется использовать:
- **Neon** (PostgreSQL)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)

### Файлы

Для загрузки фото используйте:
- **UploadThing**
- **Cloudflare R2**
- **AWS S3**

## 📝 Лицензия

MIT License

## 🤝 Поддержка

По вопросам и предложениям создавайте Issues в репозитории.