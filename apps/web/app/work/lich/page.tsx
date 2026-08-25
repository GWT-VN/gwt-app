import Link from 'next/link'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { coQuyenHienNut } from '@/lib/nen-tang/kiem-quyen'
import { lichThang, nenTang } from '../actions'
import { LichThang } from '@/components/work/LichThang'

export const metadata = { title: 'Lịch việc · GWT Work' }

/**
 * Lịch & sắp tới — cùng dữ liệu khu Việc, vẽ theo thời gian, chồng thêm số
 * chuyến kỹ thuật mỗi ngày để thấy ngày nào kín người.
 *
 * Tháng và phạm vi nằm trên ĐƯỜNG DẪN (`?thang=`, `?tatca=`) chứ không giữ trong
 * state: để gửi link "xem tháng 9 giúp tôi" cho người khác là họ mở ra đúng chỗ,
 * và bấm Back cũng về đúng tháng vừa xem.
 */
export default async function LichPage({
  searchParams,
}: {
  searchParams: Promise<{ thang?: string; tatca?: string }>
}) {
  await requireNhanSu()
  const sp = await searchParams
  const thangHopLe = typeof sp.thang === 'string' && /^\d{4}-\d{2}$/.test(sp.thang)
  const chiToi = sp.tatca !== '1'

  const [nt, thayTuSinh] = await Promise.all([
    nenTang(),
    coQuyenHienNut('work.luat_tu_sinh', 'QUANLY'),
  ])
  // Tháng mặc định lấy theo lượt gọi đầu (RPC trả `hom_nay` theo giờ VN), nên
  // không phụ thuộc đồng hồ máy chủ.
  const du = await lichThang(
    thangHopLe ? sp.thang! : new Date().toISOString().slice(0, 7),
    chiToi,
  )

  return (
    <main data-khu="work" className="min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-5 sm:px-6 space-y-5 khung-trang">
        <header>
          <nav className="flex gap-3 mb-2" style={{ fontSize: 12.5 }} aria-label="Khu Việc">
            <Link href="/work" style={{ color: 'var(--accent-ink)' }}>Việc của tôi</Link>
            <Link href="/work/team" style={{ color: 'var(--accent-ink)' }}>Bảng team</Link>
            <span style={{ color: 'var(--faint)' }}>Lịch</span>
            {thayTuSinh && (
              <Link href="/work/tu-sinh" style={{ color: 'var(--accent-ink)' }}>Việc tự sinh</Link>
            )}
          </nav>
          <h1 style={{ fontSize: 20, fontWeight: 670, letterSpacing: '-.02em', margin: 0 }}>Lịch việc</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            Việc xếp theo hạn. Ô 🔧 là số chuyến kỹ thuật hôm đó — để thấy ngày nào đã kín người.
          </p>
        </header>

        <LichThang du={du} nenTang={nt} chiToi={chiToi} />
      </div>
    </main>
  )
}
