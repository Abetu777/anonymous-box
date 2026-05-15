import { ImageResponse } from '@vercel/og';
import { supabase } from '../../../../utils/supabase';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boxId } = await params;
  console.log("Starting OGP generation for ID:", boxId);

  try {
    // 1. 箱の情報（質問内容）を取得
    const { data: box, error: boxError } = await supabase
      .from('boxes')
      .select('*')
      .eq('id', boxId)
      .single();

    if (boxError || !box) {
      console.error("Supabase Box Error:", boxError);
      return new Response('Box Not Found', { status: 404 });
    }

    // 2. 全回答データを取得
    const { data: responses, error: resError } = await supabase
      .from('responses')
      .select('answers')
      .eq('box_id', boxId);

    if (resError) {
      console.error("Supabase Responses Error:", resError);
    }

    const totalCount = responses?.length || 0;
    const questions = box.questions || [];

    // --- 集計ロジック ---
    const stats = questions.map((q: any) => {
      const counts: Record<string, number> = {};
      q.opts.forEach((opt: string) => (counts[opt] = 0));

      responses?.forEach((r: any) => {
        // オプショナルチェイニング (?.) を追加してエラーを回避
        const answer = r.answers?.[q.id];
        if (answer && counts[answer] !== undefined) {
          counts[answer]++;
        }
      });

      const topOption = q.opts.reduce((a: string, b: string) => 
        (counts[a] >= counts[b] ? a : b)
      , q.opts[0]);

      return {
        question: q.q,
        topOption,
        options: q.opts.map((opt: string) => ({
          label: opt,
          percent: totalCount > 0 ? Math.round((counts[opt] / totalCount) * 100) : 0
        }))
      };
    });

    const getTitle = () => {
      if (totalCount === 0) return "まだ回答がありません";
      const part1 = stats[0]?.topOption || "謎の";
      const part2 = stats[1]?.topOption || "通行人";
      
      const mapping: Record<string, string> = {
        "話しやすそう": "気さくな", "クール": "孤高の", "怖そう": "覇王級の",
        "赤": "情熱家", "青": "知性派", "黄色": "ムードメーカー",
        "芸能人/アイドル": "スター", "先生/公務員": "リーダー", "社長/起業家": "カリスマ"
      };

      return `${mapping[part1] || part1}${mapping[part2] || part2}`;
    };

    const catchyTitle = getTitle();

    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: 'white', borderRadius: '40px', padding: '50px', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#64748b' }}>周りから見たあなたは...</div>
              <div style={{ fontSize: '64px', fontWeight: '900', color: '#1e293b' }}>「{catchyTitle}」</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flexGrow: 1 }}>
              {stats.slice(0, 2).map((s: any, i: number) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#475569', marginBottom: '10px' }}>{s.question}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {s.options.map((opt: any, j: number) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div style={{ width: '120px', fontSize: '16px', color: '#64748b' }}>{opt.label}</div>
                        <div style={{ flexGrow: 1, height: '24px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', margin: '0 15px' }}>
                          <div style={{ width: `${opt.percent}%`, height: '100%', backgroundColor: i === 0 ? '#3b82f6' : '#ec4899' }} />
                        </div>
                        <div style={{ width: '50px', fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{opt.percent}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#94a3b8' }}>Total: {totalCount} responses</div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e: any) {
    console.error("OGP API Fatal Error:", e);
    return new Response(`Internal Server Error: ${e.message}`, { status: 500 });
  }
}