# Система репортов и блокировок

## Функции

### ✅ Репорты
- **API**: `POST /api/report {reportedId, reason, description?}`
- **Причины**: SPAM, INAPPROPRIATE_CONTENT, HARASSMENT, FAKE_PROFILE, UNDERAGE, OTHER
- **Валидация**: нельзя жаловаться на себя, дубликаты запрещены
- **Компонент**: `<ReportButton />` для UI

### ✅ Блокировки
- **API**: `POST /api/block {blockedId}` и `DELETE /api/block {blockedId}`
- **Модель**: `Block` с уникальным ограничением `(userId, blockedId)`
- **Автоматическое удаление**: матчи и сообщения при блокировке
- **Компонент**: `<BlockButton />` для UI

### ✅ Фильтрация
- **Browse API**: исключает заблокированных пользователей
- **Matches API**: скрывает матчи с заблокированными
- **Чат**: заблокированные не видны в списке матчей

### ✅ Админ-панель
- **Страница**: `/admin/reports` (только для ADMIN роли)
- **Функции**: просмотр репортов, бан пользователей, отклонение жалоб
- **API**: `GET /api/admin/reports`, `POST /api/admin/reports/[id]`

## База данных

### Новые поля в User:
```sql
role UserRole @default(USER) -- USER или ADMIN
```

### Новая модель Block:
```sql
model Block {
  id        String   @id @default(cuid())
  userId    String   -- Кто заблокировал
  blockedId String   -- Кого заблокировали
  createdAt DateTime @default(now())
  
  user    User @relation("BlockerUser", fields: [userId], references: [id])
  blocked User @relation("BlockedUser", fields: [blockedId], references: [id])
  
  @@unique([userId, blockedId])
  @@index([userId])
  @@index([blockedId])
}
```

## Безопасность

- **Middleware**: защита админ-страниц по роли
- **API**: проверка роли ADMIN для админ-функций
- **Валидация**: Zod схемы для всех входных данных
- **Авторизация**: NextAuth сессии для всех операций

## Использование

### В компонентах:
```tsx
import { ReportButton } from "@/components/report-button"
import { BlockButton } from "@/components/block-button"

// В карточке пользователя
<ReportButton 
  reportedUserId={user.id} 
  reportedUserName={user.name}
  onReported={() => refreshData()}
/>

<BlockButton 
  blockedUserId={user.id} 
  blockedUserName={user.name}
  onBlocked={() => refreshData()}
/>
```

### Создание админа:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## API Endpoints

- `POST /api/report` - отправить жалобу
- `POST /api/block` - заблокировать пользователя
- `DELETE /api/block` - разблокировать пользователя
- `GET /api/admin/reports` - получить список репортов (ADMIN)
- `POST /api/admin/reports/[id]` - действие с репортом (ADMIN)
