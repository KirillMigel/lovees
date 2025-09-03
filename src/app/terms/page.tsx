import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function TermsPage() {
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
            Условия использования
          </h1>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Принятие условий</h2>
              <p className="text-muted-foreground">
                Используя наш сервис, вы соглашаетесь с данными условиями использования. 
                Если вы не согласны с какими-либо условиями, пожалуйста, не используйте наш сервис.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Описание сервиса</h2>
              <p className="text-muted-foreground">
                Lovees — это платформа для знакомств, которая позволяет пользователям создавать профили, 
                искать потенциальных партнеров и общаться с ними.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Обязанности пользователей</h2>
              <div className="text-muted-foreground space-y-2">
                <p>Пользователи обязуются:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Предоставлять достоверную информацию</li>
                  <li>Соблюдать правила сообщества</li>
                  <li>Не нарушать права других пользователей</li>
                  <li>Не использовать сервис для незаконных целей</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Запрещенный контент</h2>
              <div className="text-muted-foreground space-y-2">
                <p>Запрещается размещение:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Непристойного или оскорбительного контента</li>
                  <li>Ложной или вводящей в заблуждение информации</li>
                  <li>Контента, нарушающего авторские права</li>
                  <li>Спама или нежелательных сообщений</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Безопасность</h2>
              <p className="text-muted-foreground">
                Мы прилагаем все усилия для обеспечения безопасности платформы, но не можем гарантировать 
                абсолютную безопасность. Пользователи используют сервис на свой страх и риск.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Ограничение ответственности</h2>
              <p className="text-muted-foreground">
                Мы не несем ответственности за действия пользователей, ущерб, причиненный в результате 
                использования сервиса, или за отношения между пользователями.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Изменения условий</h2>
              <p className="text-muted-foreground">
                Мы оставляем за собой право изменять данные условия в любое время. 
                Продолжение использования сервиса после изменений означает согласие с новыми условиями.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Контакты</h2>
              <p className="text-muted-foreground">
                По вопросам условий использования обращайтесь по адресу: legal@lovees.app
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