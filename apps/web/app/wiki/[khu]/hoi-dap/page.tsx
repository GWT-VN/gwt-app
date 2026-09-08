import Link from 'next/link'
import { notFound } from 'next/navigation'
import Markdown from '@/components/marketing/Markdown'
import { Icon } from '@/lib/marketing/icons'
import { HANG } from '@/lib/wiki/kieu'
import { KHU } from '@/lib/wiki/nav'
import { hoiDapCuaKhu } from '@/lib/wiki-ingest/doc'

// Trang ĐỘNG duy nhất của wiki (ngoài Marketing): đọc Q&A đã duyệt từ DB mỗi request.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ khu: string }> }) {
  const { khu } = await params
  const meta = KHU.find((k) => k.ma === khu)
  return { title: meta ? `Hỏi–đáp từ training · ${meta.ten} · Wiki GWT` : 'Wiki GWT' }
}

/**
 * Q&A từ Discord training đã qua cửa duyệt, theo khu. Khu Sản phẩm không có trang này
 * (Q&A sản phẩm phải vào PKB). Mọi Q&A ở đây là hạng D — nội bộ, chưa truy nguồn chính hãng.
 */
export default async function TrangHoiDap({ params }: { params: Promise<{ khu: string }> }) {
  const { khu } = await params
  const meta = KHU.find((k) => k.ma === khu && k.href && k.ma !== 'san-pham' && k.ma !== 'marketing')
  if (!meta) notFound()
  const ds = await hoiDapCuaKhu(khu)

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow"><Link href={`/wiki/${khu}`}>{meta.ten}</Link> · Từ Discord training</div>
        <h1>Hỏi–đáp đã duyệt</h1>
        <p>Câu hỏi thật của nhân viên/CTV trên Discord và câu trả lời đã được người duyệt xác nhận. Mới nhất ở trên.</p>
      </div>

      <div className="notice" style={{ marginBottom: 20 }}>
        <Icon.warn />
        <div>
          Toàn bộ mục này là <b>hạng D</b> — {HANG.D}. Đọc để hiểu cách xử lý, <b>⛔ không trích số cho khách</b>;
          số nói với khách phải truy được về mã <span className="chip mono">F-xxx</span> trong PKB của máy.
        </div>
      </div>

      {ds.length === 0 ? (
        <div className="card"><p>Chưa có Q&amp;A nào được duyệt cho khu này.</p></div>
      ) : (
        <div className="grid" style={{ gap: 12 }}>
          {ds.map((q) => (
            <article className="card" key={q.id} id={`q${q.id}`}>
              <h3 style={{ marginTop: 0 }}>{q.question}</h3>
              <Markdown>{q.answer}</Markdown>
              <div className="wiki-the-meta" style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="chip hang-D" title={HANG.D}>Hạng D</span>
                <span className="text-xs text-slate-500">{q.answered_by ?? 'Không rõ người trả lời'}{q.answered_at ? ` · ${new Date(q.answered_at).toLocaleDateString('vi-VN')}` : ''}</span>
                <a className="text-xs underline" href={q.jump_link} target="_blank" rel="noreferrer">nguồn Discord ↗</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
