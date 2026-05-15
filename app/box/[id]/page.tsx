'use client'
import { useEffect, useState, ReactElement } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import Link from 'next/link'

export default function GuestPage() {
  const params = useParams()
  const [box, setBox] = useState<any>(null)
  const [answers, setAnswers] = useState<any>({})
  const [message, setMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [totalResponses, setTotalResponses] = useState(0)

  useEffect(() => {
    const fetchBox = async () => {
      const boxId = params.id as string
      
      // 箱の情報を取得（URLのIDが box.id である前提に統一）
      const { data } = await supabase
        .from('boxes')
        .select('*')
        .eq('id', boxId)
        .single()
      
      if (data) {
        setBox(data)
        // 現在の回答数も取得しておく（シェア用）
        const { count } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('box_id', data.id)
        setTotalResponses(count || 0)
      }
    }
    fetchBox()
  }, [params.id])

  const handleSubmit = async () => {
    if (!box) return

    const { error } = await supabase.from('responses').insert({
      box_id: box.id,
      answers: answers,
      message: message
    })

    if (error) {
      alert("送信に失敗しました: " + error.message)
    } else {
      setIsSubmitted(true)
      // 送信直後の最新カウントを反映
      setTotalResponses(prev => prev + 1)
    }
  }

  // 𝕏 への引用シェアロジック
  const shareResponse = () => {
    const shareUrl = `${window.location.origin}/share/${box.id}?v=${totalResponses}`;
    const text = `匿名で回答を送ったよ！今の集計結果はこんな感じみたい✨`;
    // 𝕏のWeb Intentを使用して投稿画面を開く
    window.open(`https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!box) return <div className="p-10 text-center text-slate-500 font-bold">箱を探しています...</div>

  // --- 送信完了後の画面 ---
  if (isSubmitted) return (
    <div className="max-w-md mx-auto p-6 font-sans min-h-screen bg-white text-slate-900 text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-blue-600 mb-2">送信完了！</h1>
        <p className="text-slate-600 font-bold">あなたの回答が届きました。</p>
      </div>

      {/* みんなの結果（グラフ画像）を表示 */}
      <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-4 mb-8 shadow-sm">
        <p className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Current Results</p>
        <img 
          src={`/api/og/${box.id}?v=${totalResponses}`} 
          alt="Current Statistics"
          className="w-full rounded-xl border border-slate-200 shadow-md"
        />
        <p className="mt-3 text-sm text-slate-500 font-bold">合計回答数: {totalResponses}件</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={shareResponse}
          className="w-full bg-black text-white font-black py-4 rounded-xl shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          𝕏 で結果を引用ポストする
        </button>

        <Link 
          href="/"
          className="block w-full bg-white text-slate-900 border-2 border-slate-900 font-black py-4 rounded-xl hover:bg-slate-50 transition"
        >
          自分も「匿名箱」を作る
        </Link>
      </div>
      
      <p className="mt-10 text-xs text-slate-400 font-bold">&copy; Anonymous Box</p>
    </div>
  )

  // --- 入力画面 ---
  return (
    <div className="max-w-md mx-auto p-6 font-sans min-h-screen bg-white text-slate-900">
      <h1 className="text-2xl font-black mb-8 text-center border-b-4 border-blue-600 pb-2 inline-block">
        匿名のメッセージ箱
      </h1>
      
      <div className="space-y-10">
        {box.questions.map((q: any, index: number) => (
          <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-sm">
            <p className="text-lg font-black mb-4 flex items-start gap-2">
              <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mt-1 shrink-0">{index + 1}</span>
              {q.q}
            </p>
            
            <div className="space-y-3">
              {q.opts.map((opt: string) => (
                <label key={opt} className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[q.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-white bg-white hover:border-slate-200'}`}>
                  <input 
                    type="radio" 
                    name={`question-${q.id}`} 
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="font-bold text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
          <label className="block text-lg font-black mb-3">自由記述メッセージ <span className="text-sm font-normal text-slate-400">(任意)</span></label>
          <textarea 
            className="w-full border-2 border-slate-200 p-4 rounded-xl h-32 focus:border-blue-500 outline-none transition-all font-medium"
            placeholder="ホストに伝えたいことを自由に書いてください"
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-black text-xl py-5 rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all mb-10"
        >
          匿名で送信して結果を見る
        </button>
      </div>
    </div>
  )
}