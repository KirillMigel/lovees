# Деплой Lovees App

## 🚀 Быстрый старт

### 1. Подготовка базы данных

#### Neon (Рекомендуется)
1. Перейдите на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте `DATABASE_URL` из Dashboard
4. Выполните миграции:
```bash
npx prisma migrate deploy
```

#### Render (Альтернатива)
1. Перейдите на [render.com](https://render.com)
2. Создайте новый PostgreSQL сервис
3. Скопируйте `DATABASE_URL` из Dashboard
4. Выполните миграции:
```bash
npx prisma migrate deploy
```

### 2. Настройка Cloudflare R2

1. Перейдите в [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Выберите R2 Object Storage
3. Создайте новый bucket
4. Получите API токены:
   - Account ID
   - Access Key ID
   - Secret Access Key
5. Настройте Custom Domain (опционально)

### 3. Настройка Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 credentials
5. Добавьте домены в authorized origins:
   - `http://localhost:3000` (для разработки)
   - `https://your-app.vercel.app` (для продакшена)

### 4. Настройка Sentry (Опционально)

1. Перейдите на [sentry.io](https://sentry.io)
2. Создайте новый проект (Next.js)
3. Получите DSN и токены
4. Настройте релизы (опционально)

## 🌐 Деплой на Vercel

### Автоматический деплой

1. **Подключите GitHub репозиторий к Vercel:**
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Импортируйте ваш GitHub репозиторий
   - Выберите `lovees-app` как корневую папку

2. **Настройте переменные окружения в Vercel:**
   ```bash
   # Основные
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-super-secret-key-here
   DATABASE_URL=postgresql://user:pass@host:port/db
   
   # S3 / Cloudflare R2
   S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_ACCESS_KEY=your-r2-access-key
   S3_SECRET_KEY=your-r2-secret-key
   S3_BUCKET=your-bucket-name
   S3_PUBLIC_URL=https://your-custom-domain.com
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Sentry (опционально)
   SENTRY_DSN=https://your-sentry-dsn
   SENTRY_AUTH_TOKEN=your-sentry-auth-token
   SENTRY_ORG=your-sentry-org
   SENTRY_PROJECT=your-sentry-project
   ```

3. **Деплой:**
   - Vercel автоматически деплоит при каждом push в main
   - Или нажмите "Deploy" в Vercel Dashboard

### Ручной деплой

```bash
# Установите Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Деплой
vercel

# Продакшен деплой
vercel --prod
```

## 🏠 Локальная разработка

### 1. Клонирование и установка

```bash
git clone https://github.com/your-username/lovees-app.git
cd lovees-app
npm install
```

### 2. Настройка переменных окружения

Создайте `.env.local`:
```bash
cp .env.example .env.local
```

Заполните переменные:
```env
# База данных
DATABASE_URL="postgresql://user:password@localhost:5432/lovees"

# NextAuth
NEXTAUTH_SECRET="your-local-secret"
NEXTAUTH_URL="http://localhost:3000"

# S3 / Cloudflare R2
S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_ACCESS_KEY="your-r2-access-key"
S3_SECRET_KEY="your-r2-secret-key"
S3_BUCKET="your-bucket-name"
S3_PUBLIC_URL="https://your-custom-domain.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Sentry (опционально)
SENTRY_DSN="https://your-sentry-dsn"
```

### 3. Настройка базы данных

```bash
# Генерация Prisma клиента
npm run prisma:generate

# Выполнение миграций
npm run prisma:migrate

# (Опционально) Заполнение тестовыми данными
npm run prisma:studio
```

### 4. Запуск

```bash
# Режим разработки
npm run dev

# Сборка
npm run build
npm start
```

## 🧪 Тестирование

### Unit тесты
```bash
npm run test
npm run test:coverage
```

### E2E тесты
```bash
# Установка браузеров
npx playwright install

# Запуск тестов
npm run test:e2e
```

## 📊 Мониторинг

### Sentry
- Автоматический сбор ошибок
- Performance мониторинг
- Релизы и деплои

### Метрики
- Онлайн пользователи: `/api/metrics/online`
- Автоматическое отслеживание активности
- Heartbeat каждые 2 минуты

## 🔧 Полезные команды

```bash
# Разработка
npm run dev              # Запуск dev сервера
npm run build           # Сборка
npm run start           # Запуск продакшена

# База данных
npm run prisma:studio   # Prisma Studio
npm run prisma:migrate  # Миграции
npm run prisma:reset    # Сброс БД

# Тестирование
npm run test            # Unit тесты
npm run test:e2e        # E2E тесты
npm run lint            # Линтинг
npm run format          # Форматирование

# Деплой
vercel                  # Деплой на Vercel
vercel --prod          # Продакшен деплой
```

## 🚨 Troubleshooting

### Проблемы с базой данных
- Проверьте `DATABASE_URL`
- Убедитесь, что миграции выполнены
- Проверьте подключение к БД

### Проблемы с S3/R2
- Проверьте credentials
- Убедитесь, что bucket существует
- Проверьте CORS настройки

### Проблемы с OAuth
- Проверьте домены в Google Console
- Убедитесь, что `NEXTAUTH_URL` правильный
- Проверьте client ID и secret

### Проблемы с Vercel
- Проверьте переменные окружения
- Убедитесь, что сборка проходит локально
- Проверьте логи в Vercel Dashboard

## 📝 Checklist деплоя

- [ ] База данных настроена и миграции выполнены
- [ ] Cloudflare R2 настроен и доступен
- [ ] Google OAuth настроен
- [ ] Sentry настроен (опционально)
- [ ] Все переменные окружения добавлены в Vercel
- [ ] Домен добавлен в Google OAuth
- [ ] Тесты проходят
- [ ] Сборка проходит без ошибок
- [ ] Деплой на Vercel успешен
- [ ] Приложение работает в продакшене
