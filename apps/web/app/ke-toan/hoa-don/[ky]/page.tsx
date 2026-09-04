import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { coTheVaoKeToan } from '@/lib/nen-tang/gac-cong'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { BoLocChon, OTimKiem, ThanhDangLoc, boDau } from '@/bang'
import { dongCuaKy } from '../../actions'
import { FormUpload } from './FormUpload'

export const dynamic = 'force-dynamic'
type ThamSo = { q?: string; tc?: string; tab?: string }
const TC_OPTS = [{ giaTri: 'cao', nhan: 'Cao' }, { giaTri: 'trung binh', nhan: 'Trung bình' }, { giaTri: 'can review', nhan: 'Cần review' }, { giaTri: 'khong ro', nhan: 'Không rõ' }]
const MAU_TC: Record<string, string> = { 'can review': 'bg-amber-50', 'khong ro': 'bg-amber-100' }

export default async function KyPage({ params, searchParams }: { params: Promise<{ ky: string }>; searchParams: Promise<ThamSo> }) {
  await requireNhanSu()
  if (!(await coTheVaoKeToan())) redirect('/?loi=khong_du_quyen')
  const { ky } = await params
  const { q = '', tc, tab = 'vao' } = await searchParams
  const direction = tab === 'ra' ? 'ra' : 'vao'
  const { period, dong } = await dongCuaKy(ky, direction)
  if (!period) redirect('/ke-toan')
  const qd = boDau(q)
  const rows = dong.filter((d) => (!tc || d.engine_conf === tc || (tc === 'khong ro' && !d.code))
    && (!qd || boDau(`${d.ten_ban ?? ''} ${d.ten_hang ?? ''} ${d.so_hd ?? ''}`).includes(qd)))
  const dieuKien = [
    q ? { nhan: 'Tìm', giaTri: q } : null,
    tc ? { nhan: 'Độ tin cậy', giaTri: TC_OPTS.find((o) => o.giaTri === tc)?.nhan ?? tc } : null,
  ].filter(Boolean) as { nhan: string; giaTri: string }[]
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1320px] space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><Link href="/ke-toan" className="text-sm text-slate-500">← Kỳ</Link>
            <h1 className="text-xl font-semibold">Kỳ {period.ky} · {period.status === 'da_gui' ? 'Đã gửi kế toán' : 'Đang xử lý'}</h1></div>
          <a href={`/ke-toan/hoa-don/${period.ky}/xuat`} className="rounded border border-[#3f8a6a] px-3 py-1 text-[#3f8a6a]">Tải Excel _DAXULY</a>
        </header>
        <FormUpload ky={period.ky} />
        <nav className="flex gap-2 text-sm">
          <Link href={`/ke-toan/hoa-don/${period.ky}?tab=vao`} className={`rounded px-3 py-1 ${direction === 'vao' ? 'bg-[#3f8a6a] text-white' : 'bg-white border'}`}>HĐ đầu vào ({period.so_dong_vao})</Link>
          <Link href={`/ke-toan/hoa-don/${period.ky}?tab=ra`} className={`rounded px-3 py-1 ${direction === 'ra' ? 'bg-[#3f8a6a] text-white' : 'bg-white border'}`}>HĐ đầu ra ({period.so_dong_ra}) — lát 3</Link>
        </nav>
        <Suspense fallback={<div className="h-16" />}>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <OTimKiem placeholder="Tìm NCC / tên hàng / số HĐ…" />
            {direction === 'vao' ? <BoLocChon param="tc" nhan="Độ tin cậy" tuyChon={TC_OPTS} /> : null}
          </div>
        </Suspense>
        <ThanhDangLoc dieuKien={dieuKien} hienThi={rows.length} tong={dong.length} nhan="dòng" />
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-left"><tr>
              <th className="p-2">#</th><th className="p-2">Số HĐ</th><th className="p-2">Ngày</th><th className="p-2">Người bán</th><th className="p-2">Tên hàng</th>
              <th className="p-2 text-right">Thành tiền</th><th className="p-2">Mã</th><th className="p-2">Tên mã</th><th className="p-2">TK Nợ</th><th className="p-2">TK Có</th><th className="p-2">1331</th>
              <th className="p-2">Độ tin cậy</th><th className="p-2">Căn cứ</th></tr></thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className={`border-t ${MAU_TC[d.engine_conf ?? ''] ?? (!d.code ? 'bg-amber-100' : '')}`}>
                  <td className="p-2 text-slate-400">{d.row_order}</td><td className="p-2">{d.ky_hieu} {d.so_hd}</td><td className="p-2">{d.ngay_lap}</td>
                  <td className="p-2 max-w-[220px] truncate" title={d.ten_ban ?? ''}>{d.ten_ban}</td>
                  <td className="p-2 max-w-[280px] truncate" title={d.ten_hang ?? ''}>{d.ten_hang}</td>
                  <td className="p-2 text-right tabular-nums">{d.thanh_tien?.toLocaleString('vi-VN')}</td>
                  <td className="p-2 font-medium">{d.code}</td><td className="p-2">{d.code_name}</td><td className="p-2">{d.tk_no}</td><td className="p-2">{d.tk_co}</td><td className="p-2">{d.vat_1331}</td>
                  <td className="p-2">{d.engine_conf}</td><td className="p-2 max-w-[260px] truncate text-slate-500" title={d.engine_reason ?? ''}>{d.engine_reason}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
