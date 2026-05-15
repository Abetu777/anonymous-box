'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function Dashboard() {
  // 【エリア2：状態管理】
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<any[]>([]) 

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        const { data: box } = await supabase.from('boxes').select('*').eq('user_id', user.id).single()

        if (!box) {
          await supabase.from('boxes').insert({
            user_id: user.id,
            questions: [
              { id: 1, q: "第一印象は？", opts: ["話しやすそう", "クール", "怖そう"] },
              { id: 2, q: "私のイメージカラーは？", opts: ["赤", "青", "黄色"] }
            ]
          })
        } else {
          const { data: resData } = await supabase
            .from('responses')
            .select('*')
            .eq('box_id', box.id)
          setResponses(resData || [])
        }
      } else {
        window.location.href = '/login'
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  // 【エリア3：動作の関数】
  const shareToX = () => {
    // 募集URLに「回答数」のパラメータ（?v=数字）を付けて、Xに飛ばす
    const shareUrl = `${window.location.origin}/box/${user?.id}?v=${responses.length}`;
    const text = `${responses.length}人が回答してくれた私の印象はこちら！ #匿名箱`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div className="p-10">読み込み中...</div>

  // 【エリア4：見た目 (return)】
  return (
    <div className="max-w-2xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">管理画面</h1>
      <p className="mb-6">ようこそ、{user?.email} さん</p>
      
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="font-bold text-blue-800 mb-2">あなたの募集URL</h2>
        <code className="bg-white p-2 rounded block border mb-4">
          {window.location.origin}/box/{user?.id}
        </code>

        {/* 【追加：𝕏 シェアボタン】 */}
        <button 
          onClick={shareToX}
          className="w-full bg-black text-white font-bold py-3 rounded-full hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          𝕏 に結果を投稿する
        </button>
      </div>

      {/* 【追加：簡易的な統計表示】 */}
      <div className="mt-8">
        <p className="text-gray-600">現在の合計回答数: <span className="font-bold text-xl text-blue-600">{responses.length}</span> 件</p>
      </div>

      <button 
        onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
        className="mt-8 text-red-500 underline text-sm"
      >
        ログアウト
      </button>
    </div>
  )
}