export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Lovees App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Добро пожаловать в приложение знакомств!
        </p>
        <div className="space-y-4">
          <a 
            href="/api/ok" 
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Проверить API
          </a>
          <div className="text-sm text-gray-500">
            Статус: Работает на Vercel! 🚀
          </div>
        </div>
      </div>
    </div>
  )
}