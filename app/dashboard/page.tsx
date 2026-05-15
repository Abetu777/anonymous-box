'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [responses, setResponses] = useState<any[]>([]) 
  const [boxId, setBoxId] = useState<string>('')
  
  // 質問項目の状態管理
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        const { data: box } = await supabase.from('boxes').select('*').eq('user_id', user.id).single()

        if (!box) {
          // 初期質問テンプレート
          const defaultQuestions = [
            { id: Date.now(), q: "第一印象は？", opts: ["話しやすそう", "クール", "怖そう"] },
            { id: Date.now() + 1, q: "私のイメージカラーは？", opts: ["赤", "青", "黄色"] }
          ]
          const { data: newBox } = await supabase.from('boxes').insert({
            user_id: user.id,
            questions: defaultQuestions
          }).select().single()
          
          if (newBox) {
            setBoxId(newBox.id)
            setQuestions(newBox.questions)
          }
        } else {
          setBoxId(box.id)
          setQuestions(box.questions || []) // 保存されている質問をセット
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

  // --- 質問操作ロジック ---
  const addQuestion = () => {
    const newQ = { id: Date.now(), q: "", opts: ["", "", ""] };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('boxes')
      .update({ questions: questions }) // JSONBカラムを更新
      .eq('id', boxId);
    
    if (error) {
      alert("保存に失敗しました");
    } else {
      alert("質問設定を保存しました！");
    }
    setIsSaving(false);
  };

  // --- シェアロジック ---
  const shareRecruitment = () => {
    const shareUrl = `${window.location.origin}/box/${boxId}`;
    const text = `匿名で私にメッセージや投票を送ってください！待ってます✨ #匿名箱`;
    window.open(`https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareResults = () => {
    const shareUrl = `${window.location.origin}/share/${boxId}?v=${responses.length}`;
    const text = `${responses.length}人が回答してくれた私の集計結果はこちら！`;
    window.open(`https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div className="p-10 text-center">読み込み中...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-2">管理画面</h1>
      <p className="mb-8 text-gray-600">{user?.email} さんとしてログイン中</p>
      
      {/* 質問設定セクション */}
      <section className="mb-10 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          ⚙️ 質問項目の設定
        </h2>
        
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
              <button 
                onClick={() => removeQuestion(q.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                ✕ 削除
              </button>
              
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-500 uppercase">質問文 {idx + 1}</label>
                <input 
                  type="text"
                  value={q.q}
                  onChange={(e) => updateQuestion(q.id, 'q', e.target.value)}
                  placeholder="例：私の第一印象は？"
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">選択肢（空欄にすると自由記述）</label>
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {q.opts.map((opt: string, optIdx: number) => (
                    <input 
                      key={optIdx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...q.opts];
                        newOpts[optIdx] = e.target.value;
                        updateQuestion(q.id, 'opts', newOpts);
                      }}
                      placeholder={`選択肢 ${optIdx + 1}`}
                      className="p-2 border rounded text-sm bg-white"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addQuestion}
          className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition"
        >
          ＋ 質問を追加する
        </button>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full mt-6 py-3 rounded-full font-bold text-white transition ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSaving ? '保存中...' : '質問設定を保存する'}
        </button>
      </section>

      {/* シェアセクション */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-6">
        <div>
          <h2 className="font-bold text-blue-800 mb-2">1. 回答を募集する</h2>
          <button onClick={shareRecruitment} className="w-full bg-black text-white font-bold py-3 rounded-full hover:bg-gray-800 transition">
            𝕏 で募集を投稿する
          </button>
        </div>
        <hr className="border-blue-200" />
        <div>
          <h2 className="font-bold text-blue-800 mb-2">2. 結果をシェアする</h2>
          <p className="text-sm text-gray-600 mb-3">回答数: <span className="font-bold text-blue-600">{responses.length}</span> 件</p>
          <button onClick={shareResults} className="w-full bg-white text-black border-2 border-black font-bold py-3 rounded-full hover:bg-gray-100 transition">
            𝕏 に現在の結果をシェア
          </button>
        </div>
      </div>

      <button 
        onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
        className="mt-12 block mx-auto text-red-500 underline text-sm"
      >
        ログアウト
      </button>
    </div>
  )
}