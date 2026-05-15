import { ImageResponse } from '@vercel/og';
import { supabase } from '../../../../utils/supabase';

export const runtime = 'edge';

export async function GET(
  request: Request,
  // params を Promise 型に変更
  { params }: { params: Promise<{ id: string }> }
) {
  // params を await して id を取得
  const { id: boxId } = await params;

  // 1. 箱の情報（質問内容）を取得
  const { data: box } = await supabase
    .from('boxes')
    .select('*')
    .eq('id', boxId)
    .single();

  if (!box) return new Response('Not Found', { status: 404 });

  // 2. 全回答データを取得
  const { data: responses } = await supabase
    .from('responses')
    .select('answers')
    .eq('id', boxId);

  const totalCount = responses?.length || 0;
  const questions = box.questions || [];

  // --- 集計ロジック ---
  const stats = questions.map((q: any) => {
    const counts: Record<string, number> = {};
    q.opts.forEach((opt: string) => (counts[opt] = 0));

    responses?.forEach((r: any) => {
      const answer = r.answers[q.id];
      if (answer && counts[answer] !== undefined) {
        counts[answer]++;
      }
    });

    const topOption = q.opts.reduce((a: string, b: string) => 
      (counts[a] >= counts[b] ? a : b)
    , q.opts[0]);

    return {
      question: q.q,
      counts,
      topOption,
      options: q.opts.map((opt: string) => ({
        label: opt,
        count: counts[opt],
        percent: totalCount > 0 ? Math.round((counts[opt] / totalCount) * 100) : 0
      }))
    };
  });

  const getTitle = () => {
    if (totalCount === 0) return "まだ回答がありません";
    const part1 = stats[0]?.topOption || "";
    const part2 = stats[1]?.topOption || "";
    
    const mapping: Record<string, string> = {
      "話しやすそう": "気さくな", "クール": "孤高の", "怖そう": "覇王級の",
      "赤": "情熱家", "青": "知性派", "黄色": "ムードメーカー",
      "芸能人/アイドル": "スター", "先生/公務員": "リーダー", "社長/起業家": "カリスマ"
    };

    const title1 = mapping[part1] || part1;
    const title2 = mapping[part2] || part2;
    return `${title1}${title2}`;
  };

  const catchyTitle = getTitle();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a',
          padding: '40px',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', width: '100%', height: '100%',
          backgroundColor: 'white', borderRadius: '40px', padding: '50px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: '200px', height: '200px', borderRadius: '100px', backgroundColor: '#f1f5f9' }} />

          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>
              周りから見たあなたは...
            </div>
            <div style={{ fontSize: '64px', fontWeight: '900', color: '#1e293b', letterSpacing: '-2px' }}>
              「{catchyTitle}」
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flexGrow: 1 }}>
            {stats.slice(0, 2).map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#475569', marginBottom: '12px' }}>{s.question}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {s.options.map((opt: any, j: number) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{ width: '120px', fontSize: '16px', color: '#64748b' }}>{opt.label}</div>
                      <div style={{ flexGrow: 1, height: '24px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', overflow: 'hidden', margin: '0 15px' }}>
                        <div style={{ width: `${opt.percent}%`, height: '100%', backgroundColor: i === 0 ? '#3b82f6' : '#ec4899', borderRadius: '12px' }} />
                      </div>
                      <div style={{ width: '50px', fontSize: '18px', fontWeight: 'bold', color: '#1e293b', textAlign: 'right' }}>{opt.percent}%</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#94a3b8' }}>
              Total: <span style={{ color: '#3b82f6' }}>{totalCount}</span> responses
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#cbd5e1' }}>Anonymous Box</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}