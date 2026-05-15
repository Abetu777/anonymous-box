import { Metadata } from 'next'
import { supabase } from '../../../utils/supabase'
import Link from 'next/link'

interface Props {
  params: { id: string }
  searchParams: { v?: string }
}

// 1. 動的メタデータ生成 (𝕏のクローラー向け)
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const boxId = params.id
  const version = searchParams.v || Date.now().toString()

  // 箱の情報を取得
  const { data: box } = await supabase
    .from('boxes')
    .select('questions')
    .eq('id', boxId)
    .single()

  // 回答数を取得
  const { count } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('box_id', boxId)

  const title = `匿名投票の結果発表！`
  const description = `${count || 0}人が回答してくれた集計結果をチェックしよう。`
  
  // 動的OGP画像のURL (api/og/[id]/route.tsx を叩く)
  const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/og/${boxId}?v=${version}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

// 2. ページ本体 (リンクをクリックしたユーザー向け)
export default async function SharePage({ params }: Props) {
  const boxId = params.id

  // データの再取得
  const { data: box } = await supabase
    .from('boxes')
    .select('*')
    .eq('id', boxId)
    .single()

  const { count } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('box_id', boxId)

  if (!box) {
    return <div className="p-10 text-center">箱が見つかりませんでした。</div>
  }

  return (
    <div className="max-w-xl mx-auto p-6 min-h-screen font-sans text-slate-900 bg-white">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-black mb-2">集計結果ページ</h1>
        <p className="text-slate-500 font-bold">現在の回答数: {count}件</p>
      </header>

      <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-6 mb-8 shadow-sm">
        <p className="text-center text-slate-600 mb-4">
          𝕏 のタイムライン上では、ここに最新の<br />
          <strong>「グラフ付き画像」</strong>が表示されています。
        </p>
        
        {/* ブラウザで見ているユーザーにも簡易的な結果を表示する場合、ここにロジックを追加可能 */}
        <div className="flex justify-center">
            <div className="bg-white border-2 border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Preview</p>
                <img 
                    src={`/api/og/${boxId}?v=${Date.now()}`} 
                    alt="Current Stats" 
                    className="w-full rounded-lg shadow-sm border border-slate-100"
                />
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <Link 
          href={`/box/${boxId}`}
          className="block w-full bg-blue-600 text-white text-center font-black py-4 rounded-xl hover:bg-blue-700 transition shadow-lg"
        >
          自分もこの人に回答を送る
        </Link>
        
        <Link 
          href="/"
          className="block w-full bg-white text-slate-900 border-2 border-slate-900 text-center font-black py-4 rounded-xl hover:bg-slate-50 transition"
        >
          自分も「匿名箱」を作る
        </Link>
      </div>

      <footer className="mt-12 text-center text-slate-400 text-xs font-bold">
        &copy; Anonymous Box 2024
      </footer>
    </div>
  )
}