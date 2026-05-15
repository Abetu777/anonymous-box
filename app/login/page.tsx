'use client'
import { useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) alert(error.message)
    else alert('ログインメールを送りました！メールを確認してください。')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">ホストログイン</h1>
      <input 
        type="email" 
        placeholder="メールアドレス" 
        className="border p-2 rounded mb-4 w-64"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin} className="bg-black text-white px-6 py-2 rounded">
        ログインメールを送る
      </button>
    </div>
  )
}