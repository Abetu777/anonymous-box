'use client'
import { useEffect, useState } from 'react'
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
      // ✅ params.id (URLのID) を boxテーブルの 'id' カラムと照合する
      const boxId = params.id as string
      
      const { data, error } = await supabase
        .from('boxes')
        .select('*')
        .eq('id', boxId) // 'user_id' ではなく 'id' で検索！
        .single()
      
      if (data) {
        setBox(data)
        // この箱に対する現在の回答数を取得
        const { count } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('box_id', data.id)
        setTotalResponses(count || 0)
      } else {
        console.error("Box not found:", error)
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
      // 送信直後にカウントを1増やす
      setTotalResponses(prev => prev + 1)
    }
  }

  // 𝕏 への引用投稿リンク
  const shareResponse = () => {
    const shareUrl = `${window.location.origin}/share/${box.id}?v=${totalResponses}`;
    const text = `匿名で回答を送ったよ！今の集計結果はこんな感じ✨`;
    window.open(`https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!box) return <div className="p-10 text-center font-bold text-slate-400 tracking-widest">箱を探しています...</div>

  // --- 送信完了後の表示（みんなの解答まとめ） ---
  if (isSubmitted) return (
    <div className="max-w-md mx-auto p-6 font-sans min-h-screen bg-white text-slate-900 text-center">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-blue-600 mb-2">送信完了！</h1>
        <p className="text-slate-600 font-bold">あなたの回答が届きました。</p>
      </div>

      {/* 修正した動的グラフ画像を表示 */}
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
          𝕏 に結果をシェアして報告
        </button>

        <Link 
          href="/"
          className="block w-full bg-white text-slate-900 border-2 border-slate-900 font-black py-4 rounded-xl hover:bg-slate-50 transition"
        >
          自分も「匿名箱」を作る
        </Link>
      </div>
    </div>
  )

  // --- 通常の回答入力画面 ---
  return (
    <div className="max-w-md mx-auto p-6 font-sans min-h-screen bg-white text-slate-900">
      <h1 className="text-2xl font-black mb-8 text-center border-b-4 border-blue-600 pb-2 inline-block">
        匿名のメッセージ箱
      </h1>
      
      <div className="space-y-10">
        {box.questions.map((q: any, index: number) => (
          <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-sm">
            <p className="text-lg font-black mb-4 flex items-start gap-2 text-slate-800">
              <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mt-1 shrink-0 font-bold">{index + 1}</span>
              {q.q}
            </p>
            
            <div className="space-y-3">
              {q.opts.map((opt: string) => (
                <label key={opt} className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[q.id] === opt ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-white bg-white hover:border-slate-200'}`}>
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
          <label className="block text-lg font-black mb-3 text-slate-800">自由記述メッセージ <span className="text-sm font-normal text-slate-400">(任意)</span></label>
          <textarea 
            className="w-full border-2 border-slate-200 p-4 rounded-xl h-32 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
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