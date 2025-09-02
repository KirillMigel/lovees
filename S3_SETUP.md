# Настройка S3-совместимого хранилища

## Cloudflare R2 (Рекомендуется)

1. Создайте аккаунт в Cloudflare
2. Перейдите в R2 Object Storage
3. Создайте bucket
4. Получите API токены:
   - Account ID
   - Access Key ID
   - Secret Access Key

## Переменные окружения

Добавьте в `.env.local`:

```env
# S3 / Cloudflare R2
S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_ACCESS_KEY="your-r2-access-key"
S3_SECRET_KEY="your-r2-secret-key"
S3_BUCKET="your-bucket-name"
S3_PUBLIC_URL="https://your-custom-domain.com"
```

## Настройка CDN домена (опционально)

1. В Cloudflare R2 настройте Custom Domain
2. Используйте этот домен в `S3_PUBLIC_URL`

## AWS S3

Если используете AWS S3:

```env
S3_ENDPOINT="https://s3.amazonaws.com"
S3_REGION="us-east-1"
S3_ACCESS_KEY="your-aws-access-key"
S3_SECRET_KEY="your-aws-secret-key"
S3_BUCKET="your-bucket-name"
S3_PUBLIC_URL="https://your-bucket-name.s3.amazonaws.com"
```

## Функции

- ✅ Presigned URL для безопасной загрузки
- ✅ Валидация файлов (JPEG, PNG, WebP, ≤5MB)
- ✅ Автоматическое создание превью (1080px ширина)
- ✅ Ограничение до 6 фото на пользователя
- ✅ Next.js Image оптимизация
- ✅ CDN поддержка
- ✅ Удаление файлов из S3 при удалении из БД
