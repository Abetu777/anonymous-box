'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../utils/supabase'

export default function GuestPage() {
  const params = useParams()
  const [box, setBox] = useState<any>(null)
  const [answers, setAnswers] = useState<any>({})
  const [message, setMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const fetchBox = async () => {
      // URLのIDを使って、そのホストの「箱」を取得
      // user_id で検索するように変更（管理画面のURLと合わせるため）
      const { data } = await supabase
        .from('boxes')
        .select('*')
        .eq('user_id', params.id)
        .single()
      setBox(data)
    }
    fetchBox()
  }, [params.id])

  const handleSubmit = async () => {
    if (!box) return

    const { error } = await supabase.from('responses').insert({
      box_id: box.id,
      answers: answers, // JSONB形式
      message: message
    })

    if (error) {
      alert("送信に失敗しました: " + error.message)
    } else {
      setIsSubmitted(true)
    }
  }

  if (!box) return <div className="p-10 text-center">箱を探しています...</div>
  if (isSubmitted) return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">送信完了！</h1>
      <p>あなたの回答がホストに届きました。</p>
      {/* ここに将来的に広告を貼ります */}
    </div>
  )

  return (
    <div className="max-w-md mx-auto p-6 font-sans">
      <h1 className="text-xl font-bold mb-6 text-center">匿名のメッセージ箱</h1>
      
      {box.questions.map((q: any, index: number) => (
        <div key={q.id} className="mb-8 p-4 border rounded-lg bg-gray-50">
          <p className="font-bold mb-3">{index + 1}. {q.q}</p>
          <div className="space-y-2">
            {q.opts.map((opt: string) => (
              <label key={opt} className="flex items-center space-x-3 p-2 bg-white border rounded cursor-pointer hover:bg-blue-50">
                <input 
                  type="radio" 
                  name={`question-${q.id}`} 
                  value={opt}
                  onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                  className="w-4 h-4"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="mb-8">
        <label className="block font-bold mb-2">自由記述メッセージ（任意）</label>
        <textarea 
          className="w-full border p-3 rounded-lg h-32"
          placeholder="ホストに伝えたいことを自由に書いてください"
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button 
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        匿名で送信する
      </button>
    </div>
  )
}