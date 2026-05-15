'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<any[]>([]) 
  const [boxId, setBoxId] = useState<string>('') // 箱のIDを管理

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        const { data: box } = await supabase.from('boxes').select('*').eq('user_id', user.id).single()

        if (!box) {
          // 箱がない場合は作成
          const { data: newBox } = await supabase.from('boxes').insert({
            user_id: user.id,
            questions: [
              { id: 1, q: "第一印象は？", opts: ["話しやすそう", "クール", "怖そう"] },
              { id: 2, q: "私のイメージカラーは？", opts: ["赤", "青", "黄色"] }
            ]
          }).select().single()
          if (newBox) setBoxId(newBox.id)
        } else {
          setBoxId(box.id)
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

  // ① 募集用（フォロワーに回答をお願いする）
  const shareRecruitment = () => {
    const shareUrl = `${window.location.origin}/box/${boxId}`;
    const text = `匿名で私にメッセージや投票を送ってください！待ってます✨ #匿名箱`;
    window.open(`https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // ② 結果用（現在の集計グラフをシェアする）
  const shareResults = () => {
    // 設計書に基づき /share/ フォルダのパス、かつパラメータに回答数を付与
    const shareUrl = `${window.location.origin}/share/${boxId}?v=${responses.length}`;
    const text = `${responses.length}人が回答してくれた私の集計結果はこちら！`;
    window.open(`https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div className="p-10">読み込み中...</div>

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">管理画面</h1>
      <p className="mb-6">ようこそ、{user?.email} さん</p>
      
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-6">
        {/* 募集セクション */}
        <div>
          <h2 className="font-bold text-blue-800 mb-2">1. 回答を募集する</h2>
          <code className="bg-white p-2 rounded block border mb-3 text-sm">
            {window.location.origin}/box/{boxId}
          </code>
          <button 
            onClick={shareRecruitment}
            className="w-full bg-black text-white font-bold py-3 rounded-full hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            𝕏 で募集を投稿する
          </button>
        </div>

        <hr className="border-blue-200" />

        {/* 結果セクション */}
        <div>
          <h2 className="font-bold text-blue-800 mb-2">2. 結果をシェアする</h2>
          <p className="text-sm text-gray-600 mb-3">現在の合計回答数: <span className="font-bold text-blue-600">{responses.length}</span> 件</p>
          <button 
            onClick={shareResults}
            className="w-full bg-white text-black border-2 border-black font-bold py-3 rounded-full hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            𝕏 に現在の結果をシェア
          </button>
        </div>
      </div>

      <button 
        onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
        className="mt-12 text-red-500 underline text-sm"
      >
        ログアウト
      </button>
    </div>
  )
}