'use client'
import { useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  // 【追加】Googleログイン用の処理
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // ログイン完了後に自動で管理画面（dashboard）へリダイレクト
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) alert(error.message)
  }

  // メールログイン用の処理
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsEmailLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    })
    
    setIsEmailLoading(false)
    if (error) {
      alert(error.message)
    } else {
      alert('ログインメールを送りました！メールボックスのリンクをクリックしてダッシュボードに入ってください。')
    }
  }

  return (
    // 【共通修正】最外殻に bg-slate-900 を指定し、白飛びを防止してダッシュボードと統一感を持たせる
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 font-sans selection:bg-blue-500/30">
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border-2 border-slate-700 shadow-2xl text-slate-900">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">ホストログイン</h1>
          <p className="text-slate-500 text-sm font-medium">自分の匿名投票・メッセージ箱を管理しよう</p>
        </div>

        {/* -------------------- オプション1: ソーシャルログイン -------------------- */}
        <div className="space-y-3 mb-6">
          <button 
            onClick={handleGoogleLogin} 
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 border-2 border-slate-200 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            {/* GoogleのGマークを模した簡易アイコン */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.4 1.74l3.24-3.24C17.67 1.63 15.02 1 12 1 7.37 1 3.4 3.65 1.48 7.52l3.86 3C6.27 7.6 8.87 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.48 12.25c0-.82-.07-1.62-.2-2.4H12v4.56h6.48c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-2 3.68-4.94 3.68-8.61z"/>
              <path fill="#FBBC05" d="M5.34 10.52A7.16 7.16 0 0 1 5 12c0 .52.04 1.03.12 1.54l-3.86 3A11.91 11.91 0 0 1 1 12c0-1.66.34-3.24.96-4.68l3.38 3.2z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.92 1.1-3.13 0-5.73-2.56-6.66-5.48l-3.86 3C3.4 20.35 7.37 23 12 23z"/>
            </svg>
            Google アカウントでログイン
          </button>

          {/* 将来的に𝕏ログインを有効化する際は、ここのコメントアウトを外して設定するだけ！ */}
          {/* <button 
            disabled 
            className="w-full flex items-center justify-center gap-3 bg-slate-100 text-slate-400 font-bold py-3 px-4 border-2 border-dashed border-slate-200 rounded-xl cursor-not-allowed"
          >
            𝕏 (Twitter) でログイン (準備中)
          </button>
          */}
        </div>

        {/* 区切り線 */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="mx-4 text-xs font-black text-slate-400 uppercase tracking-wider">または</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* -------------------- オプション2: メールログイン -------------------- */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
              メールアドレスでログイン
            </label>
            <input 
              type="email" 
              required
              placeholder="example@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 font-medium placeholder-slate-400 bg-slate-50"
            />
          </div>

          <button 
            type="submit"
            disabled={isEmailLoading}
            className={`w-full py-3 rounded-xl font-black text-base shadow-md transition-all cursor-pointer ${isEmailLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.98]'}`}
          >
            {isEmailLoading ? '送信中...' : 'ログインメールを送る'}
          </button>
        </form>

      </div>
      
      {/* フッター（LP等への戻りリンクの余白） */}
      <a href="/" className="mt-8 text-slate-500 hover:text-slate-400 text-xs font-medium underline transition-colors">
        ← トップページに戻る
      </a>
    </div>
  )
}