import { ImageResponse } from '@vercel/og';
import { supabase } from '../../../../utils/supabase';

export const runtime = 'edge'; // 高速動作させるために必須

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
// 1. DBから回答数を取得 (params.id ではなく id を使う)
  const { data: box } = await supabase.from('boxes').select('id').eq('user_id', id).single();
  const { count } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('box_id', box?.id);

  // 2. 画像のデザイン（HTML/CSS）を記述
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#eff6ff', // 薄い青
          backgroundImage: 'radial-gradient(circle at 25px 25px, #bfdbfe 2%, transparent 0%)',
          backgroundSize: '50px 50px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', padding: '40px 60px', borderRadius: '30px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af', marginBottom: '20px' }}>
            私の箱の集計結果
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '100px', fontWeight: 'black', color: '#2563eb' }}>{count || 0}</span>
            <span style={{ fontSize: '40px', color: '#64748b' }}>人が回答中！</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}