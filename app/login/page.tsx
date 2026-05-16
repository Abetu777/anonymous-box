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

  const handleTwitterLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'twitter', // twitterを指定
    options: {
      redirectTo: `${window.location.origin}/dashboard` // ログイン後はダッシュボードへ
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
            {/* Googleボタン */}
            <button 
              onClick={handleGoogleLogin} 
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 border-2 border-slate-200 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {/* (GoogleアイコンのSVGはそのまま維持してください) */}
              Google アカウントでログイン
            </button>

            {/* 𝕏 (Twitter) ボタンの有効化！ */}
            <button 
              onClick={handleTwitterLogin} 
              className="w-full flex items-center justify-center gap-3 bg-black hover:bg-slate-900 text-white font-bold py-3 px-4 border-2 border-slate-900 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {/* 𝕏のシンプルなロゴマーク */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              𝕏 (Twitter) でログイン
            </button>
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