export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          3K評価システム
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          労働環境における3K指数評価アプリケーション
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/dashboard"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">ダッシュボード</h2>
            <p className="text-gray-600">評価の概要と進捗を確認</p>
          </a>
          <a
            href="/evaluation/physical"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">肉体因子評価</h2>
            <p className="text-gray-600">身体的負荷の評価</p>
          </a>
          <a
            href="/evaluation/mental"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">精神因子評価</h2>
            <p className="text-gray-600">心理的ストレスの評価</p>
          </a>
        </div>
      </div>
    </div>
  );
}