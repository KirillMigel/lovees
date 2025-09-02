import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Database, Lock, Trash2, Download } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Политика конфиденциальности</h1>
          <p className="text-xl text-muted-foreground">
            Как мы собираем, используем и защищаем ваши данные
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Какие данные мы собираем
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Личная информация:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Имя, возраст, пол</li>
                <li>Email адрес</li>
                <li>Город и местоположение</li>
                <li>Биография и интересы</li>
                <li>Фотографии профиля</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Данные активности:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Свайпы и предпочтения</li>
                <li>Матчи и сообщения</li>
                <li>Репорты и блокировки</li>
                <li>Время использования приложения</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Как мы используем ваши данные
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Основные цели:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Предоставление сервиса знакомств</li>
                <li>Подбор подходящих кандидатов</li>
                <li>Обеспечение безопасности пользователей</li>
                <li>Улучшение качества сервиса</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Мы НЕ используем ваши данные для:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Продажи третьим лицам</li>
                <li>Рекламы без вашего согласия</li>
                <li>Создания профилей для других сервисов</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Защита данных
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Меры безопасности:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Шифрование данных в покое и при передаче</li>
                <li>Регулярные обновления безопасности</li>
                <li>Ограниченный доступ к данным</li>
                <li>Мониторинг подозрительной активности</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Ваши права
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Вы имеете право:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Получить копию всех ваших данных</li>
                <li>Исправить неточную информацию</li>
                <li>Удалить свой аккаунт и данные</li>
                <li>Ограничить обработку данных</li>
                <li>Подать жалобу в надзорные органы</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Удаление данных
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground">
                При удалении аккаунта мы удаляем все ваши личные данные, включая:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Профиль и фотографии</li>
                <li>Свайпы и матчи</li>
                <li>Сообщения</li>
                <li>Репорты и блокировки</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Контакты</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Если у вас есть вопросы о политике конфиденциальности, 
              свяжитесь с нами по адресу: privacy@lovees.app
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
