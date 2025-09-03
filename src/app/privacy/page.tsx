import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-foreground">
            Lovees
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Политика конфиденциальности
          </h1>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Сбор информации</h2>
              <p className="text-muted-foreground">
                Мы собираем информацию, которую вы предоставляете при регистрации и использовании нашего сервиса, 
                включая профильную информацию, фотографии, предпочтения и сообщения.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Использование информации</h2>
              <p className="text-muted-foreground">
                Ваша информация используется для предоставления услуг знакомств, улучшения пользовательского опыта 
                и обеспечения безопасности платформы.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Защита данных</h2>
              <p className="text-muted-foreground">
                Мы применяем современные методы шифрования и безопасности для защиты ваших личных данных 
                от несанкционированного доступа.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Обмен информацией</h2>
              <p className="text-muted-foreground">
                Мы не продаем и не передаем вашу личную информацию третьим лицам без вашего согласия, 
                за исключением случаев, предусмотренных законом.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Ваши права</h2>
              <p className="text-muted-foreground">
                Вы имеете право на доступ, исправление, удаление ваших данных и отзыв согласия 
                на обработку персональных данных в любое время.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Контакты</h2>
              <p className="text-muted-foreground">
                По вопросам конфиденциальности обращайтесь по адресу: privacy@lovees.app
              </p>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Последнее обновление:</strong> {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}