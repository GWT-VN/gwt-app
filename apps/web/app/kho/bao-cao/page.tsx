import Link from 'next/link'
import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { chanKho } from '../_gac'
import { Bang, KhungKho, LinkMa, LoiKho, O, khoTu, sl, thu } from '../_ui'

export const metadata = { title: 'Báo cáo tháng · GWT Kho' }
export const dynamic = 'force-dynamic'

const thangNay = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()).slice(0, 7)
function lechThang(t: string, d: number) {
  const [y, m] = t.split('-').map(Number)
  const x = new Date(Date.UTC(y, m - 1 + d, 1))
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}`
}

export default async function KhoBaoCaoPage({ searchParams }: { searchParams: Promise<{ kho?: string; thang?: string }> }) {
  await chanKho()
  const sp = await searchParams
  const k = khoTu(sp.kho)
  const thang = /^\d{4}-\d{2}$/.test(sp.thang ?? '') ? sp.thang! : thangNay()
  const tieuDe = `Báo cáo tháng ${thang.slice(5)}/${thang.slice(0, 4)}`
  if (!daCauHinhKho()) return <KhungKho tieuDe={tieuDe} kho={k}><LoiKho /></KhungKho>
  const r = await thu(() => kho().baoCao(thang, k))
  if (!r.ok) return <KhungKho tieuDe={tieuDe} kho={k}><LoiKho loi={r.loi} /></KhungKho>
  const ds = r.v.filter((d) => d.dau_ky || d.nhap || d.xuat || d.dieu_chinh || d.cuoi_ky)
  const tong = (f: (d: (typeof ds)[number]) => number) => ds.reduce((s, d) => s + f(d), 0)
  const qs = (t: string) => `?thang=${t}${k !== 'NX' ? `&kho=${k}` : ''}`
  const nut = 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50'

  return (
    <KhungKho tieuDe={tieuDe} kho={k} moTa="Đầu kỳ + nhập − xuất + điều chỉnh = cuối kỳ · chỉ dòng sổ đã duyệt mã"
      phai={<><Link href={qs(lechThang(thang, -1))} className={nut}>← Tháng trước</Link>{thang < thangNay() && <Link href={qs(lechThang(thang, 1))} className={nut}>Tháng sau →</Link>}</>}>
      <Bang dau={['Mã', 'Tên', 'ĐVT', 'Đầu kỳ', 'Nhập', 'Xuất', 'Điều chỉnh', 'Cuối kỳ']} trong={!ds.length} phai={[3, 4, 5, 6, 7]}>
        {ds.map((d) => (
          <tr key={d.internal_code} className="hover:bg-slate-50">
            <O><LinkMa ma={d.internal_code} kho={k} /></O>
            <O>{d.ten ?? ''}</O>
            <O cls="text-slate-500">{d.don_vi ?? ''}</O>
            <O cls="text-right">{sl(d.dau_ky)}</O>
            <O cls="text-right text-emerald-700">{d.nhap ? sl(d.nhap) : ''}</O>
            <O cls="text-right text-red-700">{d.xuat ? sl(d.xuat) : ''}</O>
            <O cls="text-right text-indigo-700">{d.dieu_chinh ? sl(d.dieu_chinh) : ''}</O>
            <O cls={`text-right font-semibold ${d.cuoi_ky < 0 ? 'text-red-700' : ''}`}>{sl(d.cuoi_ky)}</O>
          </tr>
        ))}
        {ds.length > 0 && (
          <tr className="bg-slate-50 font-semibold">
            <O>Tổng</O><O /><O />
            <O cls="text-right">{sl(tong((d) => d.dau_ky))}</O><O cls="text-right">{sl(tong((d) => d.nhap))}</O>
            <O cls="text-right">{sl(tong((d) => d.xuat))}</O><O cls="text-right">{sl(tong((d) => d.dieu_chinh))}</O>
            <O cls="text-right">{sl(tong((d) => d.cuoi_ky))}</O>
          </tr>
        )}
      </Bang>
    </KhungKho>
  )
}
