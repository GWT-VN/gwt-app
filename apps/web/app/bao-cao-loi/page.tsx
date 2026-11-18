import { Suspense } from 'react'
import Link from 'next/link'
import { duLieuTanSuat, soMayDangChay } from '@/app/ticket/loi-actions'
import { DauTrang } from '@/components/DauTrang'
import { BoLocGoiY } from '@/bang'
import { BangTanSuat } from '@/components/loi/BangTanSuat'
import { TheoMay, TheoNhom } from '@/components/loi/BaoCaoNhom'
import { tinhTanSuat } from '@/lib/loi/tanSuat'
import { chuanThang, danhSachThang, khoangMacDinh, locCa } from '@/lib/loi/tanSuatTrang'
import { locBaoCao, NHOM_CHINH, type CaBaoCao } from '@/lib/loi/baoCaoNhom'
import { docAnToan } from '@/lib/loi/anToan'

type SP = { tab?: string; tu?: string; den?: string; huy?: string; nhom?: string; may?: string; loi?: string; n?: string; s?: string; m?: string; mn?: string }
const mot = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''
const TABS = [
  { key: 'nhom', nhan: 'Theo nhóm lỗi' },
  { key: 'may', nhan: 'Theo máy (SKU)' },
  { key: 'thang', nhan: 'Theo tháng' },
] as const

export default async function BaoCaoLoiPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const tab = (TABS.find((t) => t.key === mot(sp.tab))?.key ?? 'nhom') as (typeof TABS)[number]['key']
  const [{ ca, ban, nhap }, { data: dangChay }] = await Promise.all([
    duLieuTanSuat(), // gate cs.ticket.xem nằm trong action
    docAnToan('soMayDangChay', () => soMayDangChay(), {} as Record<string, number>),
  ])
  const caBC = ca as CaBaoCao[]

  // Theo nhóm / theo máy: mặc định toàn bộ dữ liệu; Theo tháng: 6 tháng gần nhất như trước.
  const mac = khoangMacDinh(new Date())
  const dauTien = caBC.reduce((m, c) => (c.thang < m ? c.thang : m), mac.tu)
  const tu = chuanThang(mot(sp.tu)) ?? (tab === 'thang' ? mac.tu : dauTien)
  const den = chuanThang(mot(sp.den)) ?? mac.den
  const gomHuy = mot(sp.huy) === '1'

  const giu: Record<string, string> = { tab, tu, den, ...(gomHuy ? { huy: '1' } : {}) }
  for (const k of ['n', 's', 'm', 'mn'] as const) if (mot(sp[k])) giu[k] = mot(sp[k])
  const href = (doi: Record<string, string | null>) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries({ ...giu, ...doi })) if (v) q.set(k, v)
    return `/bao-cao-loi?${q.toString()}`
  }

  const loc = locBaoCao(caBC, { tu, den, gomHuy })
  const nhomCo = new Map<string, string>(), mayCo = new Set<string>(), loiCo = new Map<string, string>()
  for (const c of ca) {
    if (c.nhom) nhomCo.set(c.nhom, c.nhom_ten ?? c.nhom)
    mayCo.add(c.internal_code); loiCo.set(c.loi_code, c.loi_ten)
  }
  const thang = danhSachThang(tu, den)
  const nhom = mot(sp.nhom), may = mot(sp.may), loi = mot(sp.loi)
  const rows = tab === 'thang' && thang.length ? tinhTanSuat(locCa(ca, { nhom, may, loi }), ban, nhap, { tu: thang[0], den: thang[thang.length - 1] }) : []
  const soLoi = new Set(loc.filter((c) => NHOM_CHINH.some((g) => g.code === c.nhom)).map((c) => c.ticket_code)).size
  const n = mot(sp.n) || null

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        <DauTrang tieuDe="Báo cáo lỗi" phuDe={tab === 'thang'
          ? `${rows.reduce((s, r) => s + r.so_ca, 0)} ca · ${rows.length} dòng · ${tu} đến ${den}`
          : `${soLoi} ticket lỗi · ${tu} đến ${den}${gomHuy ? ' · gồm ticket đã huỷ' : ''}`} />

        <nav className="flex gap-1 border-b border-slate-200 overflow-x-auto" aria-label="Cách xem">
          {TABS.map((t) => (
            <Link key={t.key} href={`/bao-cao-loi?tab=${t.key}`} prefetch={false} aria-current={tab === t.key ? 'page' : undefined}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${tab === t.key ? 'border-teal-600 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {t.nhan}
            </Link>
          ))}
        </nav>

        <form method="get" className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="tab" value={tab} />
          <label className="text-sm text-slate-600">Từ tháng
            <input type="month" name="tu" defaultValue={tu} className="block rounded-lg border border-slate-300 px-2 py-1 text-sm" />
          </label>
          <label className="text-sm text-slate-600">Đến tháng
            <input type="month" name="den" defaultValue={den} className="block rounded-lg border border-slate-300 px-2 py-1 text-sm" />
          </label>
          {tab !== 'thang' && (
            <label className="flex items-center gap-1.5 text-sm text-slate-600 pb-1">
              <input type="checkbox" name="huy" value="1" defaultChecked={gomHuy} /> Gồm ticket đã huỷ
            </label>
          )}
          {tab === 'thang' && nhom && <input type="hidden" name="nhom" value={nhom} />}
          {tab === 'thang' && may && <input type="hidden" name="may" value={may} />}
          {tab === 'thang' && loi && <input type="hidden" name="loi" value={loi} />}
          {tab === 'nhom' && n && <input type="hidden" name="n" value={n} />}
          <button type="submit" className="rounded-lg bg-slate-800 text-white text-sm px-3 py-1.5">Xem</button>
        </form>

        {tab === 'nhom' && <TheoNhom ca={loc} n={n} s={mot(sp.s) || null} href={href} />}
        {tab === 'may' && <TheoMay ca={loc} dangChay={dangChay} m={mot(sp.m) || null} mn={mot(sp.mn) || null} href={href} />}
        {tab === 'thang' && (
          <>
            <div className="flex flex-wrap gap-3">
              <Suspense><BoLocGoiY param="nhom" nhan="Nhóm lỗi" tuyChon={[...nhomCo].map(([giaTri, ten]) => ({ giaTri, nhan: ten }))} /></Suspense>
              <Suspense><BoLocGoiY param="may" nhan="Model" tuyChon={[...mayCo].sort().map((g) => ({ giaTri: g, nhan: g }))} /></Suspense>
              <Suspense><BoLocGoiY param="loi" nhan="Loại lỗi" tuyChon={[...loiCo].map(([giaTri, ten]) => ({ giaTri, nhan: ten }))} /></Suspense>
            </div>
            <BangTanSuat rows={rows} thang={thang} />
          </>
        )}
      </div>
    </main>
  )
}
