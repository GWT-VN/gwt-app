import Link from 'next/link'
import { Suspense } from 'react'
import { BoLocChon, OTimKiem } from '@/bang'
import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { KHO, nhanCanhBao, tenKho } from '@/lib/kho/nhan'
import { DA_CHOT_DAU_KY, ngayLuiVN, tomTatKho } from '@/lib/kho/tom-tat'
import { chanKho } from './_gac'
import { Bang, KhungKho, LinkMa, LoiKho, O, TheSo, khoTu, ngayVN, sl, thu } from './_ui'

export const metadata = { title: 'Tồn kho · GWT Kho' }
export const dynamic = 'force-dynamic'

type ThamSo = { kho?: string; q?: string; dm?: string; cb?: string }

export default async function KhoTonPage({ searchParams }: { searchParams: Promise<ThamSo> }) {
  await chanKho()
  const sp = await searchParams
  const k = khoTu(sp.kho)
  if (!daCauHinhKho()) return <KhungKho tieuDe="Tồn kho" kho={k}><LoiKho /></KhungKho>
  const r = await thu(() => kho().ton(k))
  if (!r.ok) return <KhungKho tieuDe="Tồn kho" kho={k}><LoiKho loi={r.loi} /></KhungKho>
  const { dong, tom, ghiGanNhat } = r.v
  // Tóm tắt cho CEO: nhật ký 30 ngày (đã duyệt) — vài trang là đủ; lỗi thì bỏ khung tóm tắt, bảng tồn vẫn hiện.
  const tuNgay = ngayLuiVN(30)
  const nk = await thu(async () => {
    const ra = []
    for (let trang = 1; trang <= 10; trang++) { const p = await kho().nhatKy({ kho: k, trangThai: 'approved', tuNgay, trang }); ra.push(...p.dong); if (ra.length >= p.tong) break }
    return ra
  })
  const tt = nk.ok ? tomTatKho({ ton: dong, nhatKy: nk.v, choDuyet: tom.choDuyet, daChot: DA_CHOT_DAU_KY[k] ?? false, tenKho: tenKho(k) }) : null

  const q = (sp.q ?? '').trim().toLowerCase()
  const loc = dong.filter((d) => (!q || d.internal_code.toLowerCase().includes(q) || (d.ten ?? '').toLowerCase().includes(q))
    && (!sp.dm || d.danh_muc === sp.dm) && (!sp.cb || (sp.cb === 'co' ? !!d.canh_bao : d.canh_bao === sp.cb)))
  const danhMuc = [...new Set(dong.map((d) => d.danh_muc).filter(Boolean))].sort().map((x) => ({ giaTri: x!, nhan: x! }))

  return (
    <KhungKho tieuDe="Tồn kho" kho={k} moTa={`Tính từ các dòng sổ đã duyệt mã · bot ghi gần nhất ${ngayVN(ghiGanNhat)}`}>
      {tt && (
        <section className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">Tóm tắt</h2>
          {tt.canhBao && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">⚠️ {tt.canhBao}</p>}
          <ul className="list-disc space-y-1 pl-5 text-[15px] text-slate-800">{tt.cau.map((c) => <li key={c}>{c}</li>)}</ul>
          <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-sm text-slate-600">
            <span>Nhập 7 ngày: <b>{tt.nhap7.lan}</b> lần · {sl(tt.nhap7.sl)} đơn vị</span>
            <span>Xuất 7 ngày: <b>{tt.xuat7.lan}</b> lần · {sl(tt.xuat7.sl)} đơn vị</span>
            {tt.topXuat30.length > 0 && <span>Xuất nhiều nhất 30 ngày: {tt.topXuat30.map((x) => `${x.ten} (${sl(x.sl)})`).join(' · ')}</span>}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TheSo nhan="Số mã có tồn / phát sinh" so={tom.soMa} />
        <TheSo nhan="Sắp hết (dưới tồn tối thiểu)" so={tom.sapHet} mau={tom.sapHet ? 'text-amber-700' : ''} />
        <TheSo nhan="Tồn âm (cần kiểm lại)" so={tom.am} mau={tom.am ? 'text-red-700' : ''} />
        <TheSo nhan="Dòng chờ duyệt mã" so={tom.choDuyet} mau={tom.choDuyet ? 'text-amber-700' : ''}
          phu={tom.choDuyet ? <Link href={`/kho/cho-duyet${k !== 'NX' ? `?kho=${k}` : ''}`} className="text-indigo-700 underline">xem — chưa tính vào tồn</Link> : 'không có'} />
      </div>

      <Suspense fallback={<div className="h-20" />}>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <OTimKiem placeholder="Tìm mã / tên hàng…" />
          <div className="flex flex-wrap items-center gap-2">
            <BoLocChon param="kho" nhan="Kho Nguyễn Xiển" tuyChon={KHO.filter((x) => x.ma !== 'NX').map((x) => ({ giaTri: x.ma, nhan: x.ten }))} />
            <BoLocChon param="dm" nhan="Mọi danh mục" tuyChon={danhMuc} />
            <BoLocChon param="cb" nhan="Mọi tình trạng tồn" tuyChon={[{ giaTri: 'co', nhan: 'Có cảnh báo' }, { giaTri: 'sap_het', nhan: 'Sắp hết' }, { giaTri: 'am', nhan: 'Tồn âm' }]} />
          </div>
        </div>
      </Suspense>

      <Bang dau={['Mã', 'Tên', 'Danh mục', 'ĐVT', 'Nhập', 'Xuất', 'Điều chỉnh', 'Tồn', 'Tối thiểu', 'Cảnh báo', 'Phát sinh gần nhất']} trong={!loc.length} phai={[4, 5, 6, 7, 8]}>
        {loc.map((d) => (
          <tr key={d.internal_code} className="hover:bg-slate-50">
            <O><LinkMa ma={d.internal_code} kho={k} /></O>
            <O>{d.ten ?? ''}</O>
            <O cls="text-slate-500">{d.danh_muc ?? ''}</O>
            <O cls="text-slate-500">{d.don_vi ?? ''}</O>
            <O cls="text-right">{sl(d.tong_nhap)}</O>
            <O cls="text-right">{sl(d.tong_xuat)}</O>
            <O cls="text-right text-slate-500">{d.dieu_chinh ? sl(d.dieu_chinh) : ''}</O>
            <O cls={`text-right font-semibold ${d.ton < 0 ? 'text-red-700' : ''}`}>{sl(d.ton)}</O>
            <O cls="text-right text-slate-500">{d.ton_toi_thieu ?? ''}</O>
            <O>{d.canh_bao && <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${d.canh_bao === 'am' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>{nhanCanhBao(d.canh_bao)}</span>}</O>
            <O cls="whitespace-nowrap text-xs text-slate-500">{ngayVN(d.cap_nhat)}</O>
          </tr>
        ))}
      </Bang>
    </KhungKho>
  )
}
