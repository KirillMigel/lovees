export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          404 - Страница не найдена
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Запрашиваемая страница не существует.
        </p>
        <a 
          href="/" 
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  )
}
