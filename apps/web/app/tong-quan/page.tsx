import Link from 'next/link'
import { redirect } from 'next/navigation'
import { coTheVaoCS, laChiKyThuatVien } from '@/lib/nen-tang/gac-cong'
import { requireStaff } from '@/lib/nen-tang/phien'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { listKhachChoDuyet } from '@/app/actions'
import { soLieuTongQuan, type SoLieuTongQuan } from './actions'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'

export const metadata = { title: 'Tổng quan · GWT CSKH' }
export const dynamic = 'force-dynamic'

/**
 * Bốn ô số mở đầu khu CSKH. Trước đây vào CSKH là rơi thẳng vào bảng 2.400 máy —
 * đúng dữ liệu nhưng không trả lời câu "hôm nay tôi phải làm gì".
 *
 * Mỗi ô là một LINK sang đúng trang đang đếm, để con số không thành ngõ cụt.
 */
const O: { khoa: keyof SoLieuTongQuan; nhan: string; href: string }[] = [
  { khoa: 'bhChoDuyet', nhan: 'BH chờ duyệt', href: '/dang-ky-bh' },
  { khoa: 'ticketMo', nhan: 'Ticket đang mở', href: '/ticket?state=Open' },
  { khoa: 'baoTriCanLam', nhan: 'Bảo trì cần làm', href: '/bao-tri' },
  { khoa: 'canDon', nhan: 'Data cần dọn', href: '/khach' },
]

export default async function TongQuanPage() {
  await requireStaff()
  if (await laChiKyThuatVien()) redirect('/ky-thuat/cua-toi')
  if (!(await coTheVaoCS())) redirect('/work')

  // Xem chú thích trong ./actions.ts: đọc hàng chờ duyệt mà không có quyền là bị
  // đá khỏi trang, chứ không phải chỉ thiếu dữ liệu.
  const quyen = await hoiQuyen({ duyetKhach: ['cs.khach.duyet_cho', 'QUANLY'] })
  const [so, choDuyet] = await Promise.all([
    soLieuTongQuan(),
    quyen.duyetKhach ? listKhachChoDuyet() : Promise.resolve(null),
  ])

  return (
    <ManV2>
      <TrangDuLieu className="max-w-6xl">
        <div className="min-w-0 space-y-4">
          <PageHeader tieuDe="Tổng quan CSKH" meta={["Việc cần chạm hôm nay"]} />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {O.filter((o) => so[o.khoa] !== null).map((o) => (
              <StatCard key={o.khoa} nhan={o.nhan} giaTri={so[o.khoa]} href={o.href} />
            ))}
          </div>

          {choDuyet !== null && (
          <section className="rounded-(--radius-xl) border border-border bg-card  overflow-hidden">
            <h2 className="px-4 py-3 border-b border-border text-sm font-semibold text-foreground">
              Bảo hành chờ duyệt ({choDuyet.length})
            </h2>
            {choDuyet.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Không có hồ sơ nào chờ duyệt.</p>
            ) : (
              <ul className="divide-y divide-border">
                {choDuyet.slice(0, 5).map((k) => (
                  <li key={k.id} className="px-4 py-3 text-sm text-foreground">
                    <span className="font-medium">{k.full_name}</span>
                    {k.primary_phone && (
                      <span className="tabular-nums text-xs text-muted-foreground"> · {k.primary_phone}</span>
                    )}
                    {k.province && <span className="text-xs text-muted-foreground"> · {k.province}</span>}
                  </li>
                ))}
              </ul>
            )}
            <div className="px-4 py-2.5 border-t border-border bg-muted">
              <Link
                href="/dang-ky-bh"
                prefetch={false}
                className="text-sm font-medium text-[#0a6771] hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
          </section>
          )}
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
