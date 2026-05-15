import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 font-sans text-gray-900">
      <main className="max-w-2xl text-center">
        {/* ロゴ・タイトルエリア */}
        <div className="mb-8 inline-block p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
          <span className="text-4xl">📬</span>
        </div>
        
        <h1 className="text-5xl font-black mb-6 tracking-tight">
          Anonymous <span className="text-blue-600">Box</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          あなたの印象を匿名で集めよう。<br />
          X (Twitter) でシェアして、フォロワーからの意外な本音を聞いてみませんか？
        </p>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/login" 
            className="w-full sm:w-auto bg-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition-all"
          >
            自分の箱を作る（無料）
          </Link>
          
          <Link 
            href="/login" 
            className="text-gray-500 font-medium hover:text-blue-600 transition-colors"
          >
            ホストログイン
          </Link>
        </div>

        {/* プレビュー画像的なエリア */}
        <div className="mt-16 p-2 bg-gray-100 rounded-3xl border border-gray-200 shadow-inner">
          <div className="bg-white rounded-2xl p-6 text-left shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">👤</div>
              <div className="h-4 w-32 bg-gray-100 rounded"></div>
            </div>
            <p className="text-gray-400 italic">「いつも冷静だけど、実は熱い人だと思ってます！」</p>
          </div>
        </div>
      </main>

      <footer className="mt-20 text-sm text-gray-400">
        &copy; 2026 Anonymous Box MVP. Built with Next.js & Supabase.
      </footer>
    </div>
  )
}