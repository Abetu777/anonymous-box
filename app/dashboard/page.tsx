'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [responses, setResponses] = useState<any[]>([]) 
  const [boxId, setBoxId] = useState<string>('')
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        
        // 【デバッグ修正】 single() ではなく、まずは全件取得を試みる（複数ある場合のクラッシュ防止）
        const { data: boxes, error } = await supabase
          .from('boxes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }); // 最新のものを上に

        // 箱が1つも存在しない場合（初回ログイン時）のみ新規作成する
        if (!boxes || boxes.length === 0) {
          const defaultQuestions = [
            { id: Date.now(), q: "第一印象は？", opts: ["話しやすそう", "クール", "怖そう"] },
            { id: Date.now() + 1, q: "私のイメージカラーは？", opts: ["赤", "青", "黄色"] },
            { id: Date.now() + 2, q: "私に似合いそうな職業は？", opts: ["芸能人/アイドル", "先生/公務員", "社長/起業家"] } // route.tsxの仕様とタイポを修正
          ]
          const { data: newBox } = await supabase
            .from('boxes')
            .insert({ user_id: user.id, questions: defaultQuestions })
            .select()
            .single()
            
          if (newBox) { 
            setBoxId(newBox.id); 
            setQuestions(newBox.questions); 
          }
        } else {
          // 【マシュマロ化】すでに箱がある場合は、一番古い、または最新の「1つの固定の箱」を常に使い続ける
          const activeBox = boxes[0];
          setBoxId(activeBox.id);
          setQuestions(activeBox.questions || []);
          
          // 固定された箱IDに紐づく回答データを取得
          const { data: resData } = await supabase
            .from('responses')
            .select('*')
            .eq('box_id', activeBox.id)
          setResponses(resData || [])
        }
      } else { 
        window.location.href = '/login' 
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const addQuestion = () => { setQuestions([...questions, { id: Date.now(), q: "", opts: ["", "", ""] }]); };
  const removeQuestion = (id: number) => { setQuestions(questions.filter(q => q.id !== id)); };
  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('boxes').update({ questions: questions }).eq('id', boxId);
    if (error) { alert("保存に失敗しました"); } else { alert("質問設定を保存しました！"); }
    setIsSaving(false);
  };

  const shareRecruitment = () => {
    const shareUrl = `${window.location.origin}/box/${boxId}`;
    const text = `匿名で私にメッセージや投票を送ってください！待ってます✨ #匿名箱`;
    window.open(`https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareResults = () => {
    const shareUrl = `${window.location.origin}/share/${boxId}?v=${responses.length}`;
    const text = `${responses.length}人が回答してくれた私の集計結果はこちら！ #匿名箱`;
    window.open(`https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">
        読み込み中...
      </div>
    )
  }

  return (
    // 【視認性修正】最外殻に bg-slate-900 を明示的に指定し、ライトモードでの白飛びを完全に防止
    <div className="min-h-screen bg-slate-900 w-full text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-2xl mx-auto p-6 pb-20">
        <h1 className="text-3xl font-black mb-2 text-white tracking-tight">管理画面</h1>
        <p className="mb-8 text-slate-400 font-medium text-sm">{user?.email} さんとしてログイン中</p>
        
        {/* 質問設定セクション */}
        <section className="mb-10 bg-white p-6 rounded-2xl border-2 border-slate-700 shadow-2xl text-slate-900">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
            ⚙️ 質問項目の設定
          </h2>
          
          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 relative">
                <button 
                  onClick={() => removeQuestion(q.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600 font-bold text-xs bg-white px-2 py-1 rounded border border-slate-200 shadow-sm transition-colors"
                >
                  ✕ 削除
                </button>
                
                <div className="mb-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">質問文 {idx + 1}</label>
                  <input 
                    type="text"
                    value={q.q}
                    onChange={(e) => updateQuestion(q.id, 'q', e.target.value)}
                    placeholder="例：私の第一印象は？"
                    className="w-full mt-2 p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    選択肢 <span className="text-xs font-normal text-slate-400">(空欄で自由記述)</span>
                  </label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
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
                        className="p-3 border-2 border-slate-200 rounded-lg text-sm bg-white text-slate-900 font-semibold focus:border-blue-400 outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addQuestion}
            className="w-full mt-6 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            ＋ 質問を新しく追加する
          </button>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full mt-8 py-4 rounded-xl font-black text-lg shadow-lg transition-all cursor-pointer ${isSaving ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]'}`}
          >
            {isSaving ? '保存中...' : '設定を保存して適用する'}
          </button>
        </section>

        {/* シェアセクション */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6 shadow-2xl政">
          <div>
            <h2 className="font-black text-white text-base mb-3 flex items-center gap-2">📣 回答を募集する</h2>
            <button onClick={shareRecruitment} className="w-full bg-[#1d9bf0] text-white font-black py-4 rounded-xl hover:brightness-110 transition shadow-md cursor-pointer active:scale-[0.98]">
               𝕏 で募集ポストを作成
            </button>
          </div>
          <div className="pt-6 border-t border-slate-700">
            <h2 className="font-black text-white text-base mb-1 flex items-center gap-2">📊 集集結果を見る</h2>
            <p className="text-sm text-slate-400 mb-4">現在の回答数: <span className="text-blue-400 font-bold text-lg">{responses.length}</span> 件</p>
            <button onClick={shareResults} className="w-full bg-white text-slate-900 font-black py-4 rounded-xl hover:bg-slate-100 transition shadow-md border-b-4 border-slate-300 cursor-pointer active:scale-[0.98]">
               𝕏 に現在の結果をシェア
            </button>
          </div>
        </div>

        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
          className="mt-16 block mx-auto text-slate-500 hover:text-red-400 underline text-sm font-medium transition-colors cursor-pointer"
        >
          ログアウトする
        </button>
      </div>
    </div>
  )
}