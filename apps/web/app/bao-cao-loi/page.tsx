import { Suspense } from 'react'
import { duLieuTanSuat } from '@/app/ticket/loi-actions'
import { DauTrang } from '@/components/DauTrang'
import { BoLocGoiY } from '@/bang'
import { BangTanSuat } from '@/components/loi/BangTanSuat'
import { tinhTanSuat } from '@/lib/loi/tanSuat'
import { chuanThang, danhSachThang, khoangMacDinh, locCa } from '@/lib/loi/tanSuatTrang'

type SP = { tu?: string; den?: string; nhom?: string; may?: string; loi?: string }
const mot = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export default async function BaoCaoLoiPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const mac = khoangMacDinh(new Date())
  const tu = chuanThang(mot(sp.tu)) ?? mac.tu
  const den = chuanThang(mot(sp.den)) ?? mac.den
  const nhom = mot(sp.nhom), may = mot(sp.may), loi = mot(sp.loi)

  const { ca, ban, nhap } = await duLieuTanSuat() // gate cs.ticket.xem nằm trong action
  const nhomCo = new Map<string, string>(), mayCo = new Set<string>(), loiCo = new Map<string, string>()
  for (const c of ca) {
    if (c.nhom) nhomCo.set(c.nhom, c.nhom_ten ?? c.nhom)
    mayCo.add(c.internal_code); loiCo.set(c.loi_code, c.loi_ten)
  }
  const thang = danhSachThang(tu, den)
  const rows = thang.length ? tinhTanSuat(locCa(ca, { nhom, may, loi }), ban, nhap, { tu: thang[0], den: thang[thang.length - 1] }) : []
  const tong = rows.reduce((s, r) => s + r.so_ca, 0)

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        <DauTrang tieuDe="Báo cáo lỗi" phuDe={`${tong} ca · ${rows.length} dòng · ${tu} đến ${den}`} />
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-slate-600">Từ tháng
            <input type="month" name="tu" defaultValue={tu} className="block rounded-lg border border-slate-300 px-2 py-1 text-sm" />
          </label>
          <label className="text-sm text-slate-600">Đến tháng
            <input type="month" name="den" defaultValue={den} className="block rounded-lg border border-slate-300 px-2 py-1 text-sm" />
          </label>
          {nhom && <input type="hidden" name="nhom" value={nhom} />}
          {may && <input type="hidden" name="may" value={may} />}
          {loi && <input type="hidden" name="loi" value={loi} />}
          <button type="submit" className="rounded-lg bg-slate-800 text-white text-sm px-3 py-1.5">Xem</button>
        </form>
        <div className="flex flex-wrap gap-3">
          <Suspense><BoLocGoiY param="nhom" nhan="Nhóm lỗi" tuyChon={[...nhomCo].map(([giaTri, n]) => ({ giaTri, nhan: n }))} /></Suspense>
          <Suspense><BoLocGoiY param="may" nhan="Model" tuyChon={[...mayCo].sort().map((g) => ({ giaTri: g, nhan: g }))} /></Suspense>
          <Suspense><BoLocGoiY param="loi" nhan="Loại lỗi" tuyChon={[...loiCo].map(([giaTri, n]) => ({ giaTri, nhan: n }))} /></Suspense>
        </div>
        <BangTanSuat rows={rows} thang={thang} />
      </div>
    </main>
  )
}
