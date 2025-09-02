import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Shield, AlertTriangle, Ban, Heart } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Условия использования</h1>
          <p className="text-xl text-muted-foreground">
            Правила и условия использования сервиса Lovees
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Принятие условий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Используя наш сервис, вы соглашаетесь с данными условиями. 
              Если вы не согласны с какими-либо условиями, пожалуйста, 
              не используйте наш сервис.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Описание сервиса
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Lovees - это сервис знакомств, который:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Помогает найти подходящих партнеров</li>
                <li>Обеспечивает безопасное общение</li>
                <li>Предоставляет инструменты для блокировки и репортов</li>
                <li>Защищает конфиденциальность пользователей</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Требования к пользователям
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Для использования сервиса вы должны:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Быть не младше 18 лет</li>
                <li>Предоставить достоверную информацию</li>
                <li>Соблюдать правила сообщества</li>
                <li>Не нарушать права других пользователей</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Запрещенные действия
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Запрещается:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Создавать фейковые профили</li>
                <li>Размещать неподходящий контент</li>
                <li>Оскорблять или угрожать другим пользователям</li>
                <li>Спамить или рассылать нежелательные сообщения</li>
                <li>Использовать сервис для коммерческих целей</li>
                <li>Нарушать авторские права</li>
                <li>Попытки взлома или нарушения безопасности</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Ответственность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Ограничение ответственности:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Мы не гарантируем успешные знакомства</li>
                <li>Пользователи несут ответственность за свои действия</li>
                <li>Мы не несем ответственности за поведение других пользователей</li>
                <li>Сервис предоставляется "как есть"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Модерация и блокировки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Мы оставляем за собой право:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Модерировать контент и поведение пользователей</li>
                <li>Блокировать нарушителей</li>
                <li>Удалять неподходящий контент</li>
                <li>Приостанавливать или удалять аккаунты</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Изменения условий</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Мы можем изменять данные условия в любое время. 
              Продолжение использования сервиса после изменений 
              означает ваше согласие с новыми условиями.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Контакты</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              По вопросам условий использования обращайтесь: 
              legal@lovees.app
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
