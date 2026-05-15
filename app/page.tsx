import { createClient } from '@supabase/supabase-js'

export default async function TestPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // boxesテーブルからデータを取ろうとしてみる（まだ0件なはず）
  const { data, error } = await supabase.from('boxes').select('*')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">フェーズ1 接続テスト</h1>
      {error ? (
        <p className="text-red-500">接続失敗: {error.message}</p>
      ) : (
        <p className="text-green-500">接続成功！ 現在の箱の数: {data.length}個</p>
      )}
    </div>
  )
}