# Настройка внешних сервисов

## 🗄️ База данных

### Neon (Рекомендуется)

1. **Регистрация:**
   - Перейдите на [neon.tech](https://neon.tech)
   - Зарегистрируйтесь или войдите

2. **Создание проекта:**
   - Нажмите "Create Project"
   - Выберите регион (ближайший к вашим пользователям)
   - Введите название проекта: `lovees-app`

3. **Получение DATABASE_URL:**
   - В Dashboard найдите "Connection Details"
   - Скопируйте "Connection string"
   - Формат: `postgresql://username:password@hostname/database?sslmode=require`

4. **Выполнение миграций:**
   ```bash
   # Установите DATABASE_URL в .env.local
   DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
   
   # Выполните миграции
   npm run prisma:migrate
   ```

### Render (Альтернатива)

1. **Регистрация:**
   - Перейдите на [render.com](https://render.com)
   - Зарегистрируйтесь

2. **Создание PostgreSQL:**
   - Нажмите "New +" → "PostgreSQL"
   - Выберите план (Free tier доступен)
   - Введите название: `lovees-db`

3. **Получение DATABASE_URL:**
   - В Dashboard найдите "External Database URL"
   - Скопируйте URL

## ☁️ Файловое хранилище

### Cloudflare R2

1. **Регистрация:**
   - Перейдите на [dash.cloudflare.com](https://dash.cloudflare.com)
   - Зарегистрируйтесь или войдите

2. **Создание R2 bucket:**
   - Выберите "R2 Object Storage"
   - Нажмите "Create bucket"
   - Введите название: `lovees-photos`
   - Выберите регион

3. **Получение API токенов:**
   - Перейдите в "Manage R2 API tokens"
   - Нажмите "Create API token"
   - Выберите "Custom token"
   - Настройте права доступа:
     - Zone: `Zone:Read`
     - Account: `Cloudflare R2:Edit`
   - Скопируйте:
     - Account ID
     - Access Key ID
     - Secret Access Key

4. **Настройка Custom Domain (опционально):**
   - В настройках bucket найдите "Custom Domains"
   - Добавьте ваш домен (например: `cdn.yourdomain.com`)
   - Настройте DNS записи

5. **Переменные окружения:**
   ```env
   S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   S3_REGION="auto"
   S3_ACCESS_KEY="your-access-key-id"
   S3_SECRET_KEY="your-secret-access-key"
   S3_BUCKET="lovees-photos"
   S3_PUBLIC_URL="https://cdn.yourdomain.com"  # или https://your-bucket.r2.cloudflarestorage.com
   ```

## 🔐 OAuth аутентификация

### Google OAuth

1. **Создание проекта:**
   - Перейдите в [Google Cloud Console](https://console.cloud.google.com)
   - Создайте новый проект или выберите существующий

2. **Включение API:**
   - Перейдите в "APIs & Services" → "Library"
   - Найдите и включите "Google+ API"

3. **Создание OAuth credentials:**
   - Перейдите в "APIs & Services" → "Credentials"
   - Нажмите "Create Credentials" → "OAuth 2.0 Client IDs"
   - Выберите "Web application"
   - Добавьте authorized origins:
     - `http://localhost:3000` (для разработки)
     - `https://your-app.vercel.app` (для продакшена)
   - Добавьте authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-app.vercel.app/api/auth/callback/google`

4. **Получение credentials:**
   - Скопируйте Client ID и Client Secret

5. **Переменные окружения:**
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

## 📊 Мониторинг ошибок

### Sentry (Опционально)

1. **Регистрация:**
   - Перейдите на [sentry.io](https://sentry.io)
   - Зарегистрируйтесь

2. **Создание проекта:**
   - Нажмите "Create Project"
   - Выберите "Next.js"
   - Введите название: `lovees-app`

3. **Получение DSN:**
   - Скопируйте DSN из настроек проекта

4. **Настройка релизов (опционально):**
   - Перейдите в "Settings" → "Projects" → "Releases"
   - Создайте Auth Token
   - Настройте интеграцию с Vercel

5. **Переменные окружения:**
   ```env
   SENTRY_DSN="https://your-sentry-dsn"
   SENTRY_AUTH_TOKEN="your-sentry-auth-token"
   SENTRY_ORG="your-sentry-org"
   SENTRY_PROJECT="your-sentry-project"
   ```

## 🚀 Деплой

### Vercel

1. **Подключение репозитория:**
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Импортируйте ваш GitHub репозиторий
   - Выберите `lovees-app` как корневую папку

2. **Настройка переменных окружения:**
   - В настройках проекта найдите "Environment Variables"
   - Добавьте все переменные из `.env.local`
   - Убедитесь, что `NEXTAUTH_URL` указывает на ваш Vercel домен

3. **Деплой:**
   - Vercel автоматически деплоит при push в main
   - Или нажмите "Deploy" вручную

## ✅ Checklist

- [ ] База данных создана и миграции выполнены
- [ ] R2 bucket создан и настроен
- [ ] Google OAuth настроен
- [ ] Sentry настроен (опционально)
- [ ] Все переменные окружения добавлены в Vercel
- [ ] Домены добавлены в Google OAuth
- [ ] Приложение деплоится без ошибок
- [ ] Все функции работают в продакшене

## 🔗 Полезные ссылки

- [Neon Documentation](https://neon.tech/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Documentation](https://vercel.com/docs)
