import Link from 'next/link'
import { redirect } from 'next/navigation'
import { coTheDuyetWiki } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { KHU } from '@/lib/wiki/nav'
import { danhSachDeXuat, lanQuet, type TrangThai } from './actions'
import { DongDeXuat } from './DongDeXuat'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Đề xuất từ training · Wiki GWT' }

const TAB: { ma: TrangThai; ten: string }[] = [
  { ma: 'pending', ten: 'Chờ duyệt' },
  { ma: 'approved', ten: 'Đã duyệt' },
  { ma: 'rejected', ten: 'Đã từ chối' },
]

/** Cửa duyệt Q&A từ Discord training (spec wiki-training-ingest §6). Chỉ admin|ceo. */
export default async function TrangDeXuat({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireNhanSu()
  if (!(await coTheDuyetWiki())) redirect('/wiki?loi=khong_du_quyen')
  const { tab = 'pending' } = await searchParams
  const status: TrangThai = TAB.some((t) => t.ma === tab) ? (tab as TrangThai) : 'pending'
  const [rows, quet] = await Promise.all([danhSachDeXuat(status), lanQuet()])
  const tenKhu = (ma: string) => KHU.find((k) => k.ma === ma)?.ten ?? ma

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Wiki nội bộ · Từ Discord training</div>
        <h1>Đề xuất Q&amp;A chờ duyệt</h1>
        <p>Routine quét 3 kênh training mỗi sáng, lọc thành hỏi–đáp. Duyệt xong mới hiện ở trang “Hỏi–đáp đã duyệt” của khu. Q&amp;A về sản phẩm không duyệt ở đây — đưa vào PKB.</p>
      </div>

      <div className="notice" style={{ marginBottom: 16 }}>
        <span aria-hidden="true">🕒</span>
        <div>
          <b>Lần quét cuối:</b>{' '}
          {quet.length === 0 ? 'chưa có lần quét nào (routine chưa chạy).' : quet.map((q) => (
            <span key={q.channel_id} className="chip mono" style={{ marginRight: 6 }} title={`watermark ${q.last_message_id}`}>
              {q.channel_id} · {q.run ? `${new Date(q.run.at).toLocaleString('vi-VN')} · +${q.run.inserted} / trùng ${q.run.skipped} / PII ${q.run.rejected}` : 'chưa có run'}
            </span>
          ))}
        </div>
      </div>

      <nav className="flex gap-2 text-sm" style={{ marginBottom: 16 }}>
        {TAB.map((t) => (
          <Link key={t.ma} href={`/wiki/de-xuat?tab=${t.ma}`} className={`rounded px-3 py-1 ${status === t.ma ? 'bg-[#0e8c9a] text-white' : 'border bg-white'}`}>{t.ten}</Link>
        ))}
        <span className="chip" style={{ marginLeft: 'auto' }}>{rows.length} dòng</span>
      </nav>

      {rows.length === 0 ? (
        <div className="card"><p>Không có đề xuất nào ở tab này.</p></div>
      ) : (
        <div className="grid" style={{ gap: 12 }}>
          {rows.map((r) => <DongDeXuat key={r.id} row={r} tenKhu={tenKhu(r.khu)} />)}
        </div>
      )}
    </section>
  )
}
