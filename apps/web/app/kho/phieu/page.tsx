import { Suspense } from 'react'
import { BoLocChon, LocNgay, OTimKiem, PhanTrang } from '@/bang'
import { daCauHinhKho, kho, MOI_TRANG_PHIEU } from '@/lib/kho/doc'
import { LOAI_PHIEU, n, nhanLoaiPhieu } from '@/lib/kho/nhan'
import { chanKho } from '../_gac'
import { KhungKho, LinkMay, LoiKho, Nhan, ngayVN, thu } from '../_ui'

export const metadata = { title: 'Phiếu nhập / xuất · GWT Kho' }
export const dynamic = 'force-dynamic'

type ThamSo = { q?: string; loai?: string; ngtu?: string; ngden?: string; trang?: string }

export default async function KhoPhieuPage({ searchParams }: { searchParams: Promise<ThamSo> }) {
  await chanKho()
  const sp = await searchParams
  if (!daCauHinhKho()) return <KhungKho tieuDe="Phiếu nhập / xuất"><LoiKho /></KhungKho>
  const trang = Math.max(1, Number(sp.trang) || 1)
  const r = await thu(() => kho().dsPhieu({ tuKhoa: sp.q, loai: sp.loai, tuNgay: sp.ngtu, denNgay: sp.ngden, trang }))
  if (!r.ok) return <KhungKho tieuDe="Phiếu nhập / xuất"><LoiKho loi={r.loi} /></KhungKho>
  const { tong, dong } = r.v

  return (
    <KhungKho tieuDe="Phiếu nhập / xuất" moTa={`${tong} phiếu đã xác nhận · mới nhất trước (giống tab "Giao dịch" trên Sheet)`}>
      <Suspense fallback={<div className="h-20" />}>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <OTimKiem placeholder="Tìm theo serial…" />
          <div className="flex flex-wrap items-center gap-2">
            <BoLocChon param="loai" nhan="Mọi loại phiếu" tuyChon={LOAI_PHIEU.map((x) => ({ giaTri: x, nhan: n(x) }))} />
            <LocNgay nhan="Ngày nghiệp vụ" />
          </div>
        </div>
      </Suspense>

      {!dong.length && <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">Chưa có phiếu nào khớp.</div>}
      <div className="space-y-3">
        {dong.map((p) => (
          <article key={p.ma} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <b className="text-slate-900">{nhanLoaiPhieu(p.loai, p.muc_dich)}</b>
                <span className="text-sm text-slate-600">{p.tu ?? '—'} → {p.den ?? (['ban', 'tang'].includes(p.muc_dich ?? '') ? 'Khách' : '—')}{p.den_chi_tiet ? ` (${p.den_chi_tiet})` : ''}</span>
              </div>
              <div className="text-xs text-slate-500">
                Ngày {ngayVN(p.ngay)} · ghi {ngayVN(p.ghi_nhan_luc)} · <span className="font-mono">{p.ma}</span>
              </div>
            </div>
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {p.may.map((m, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 py-1">
                  <LinkMay serial={m.serial} />
                  <span className="text-slate-600">{m.internal_code}</span>
                  {m.tinh_trang_truoc && m.tinh_trang_truoc !== m.tinh_trang_sau ? <><Nhan ma={m.tinh_trang_truoc} /><span className="text-slate-400">→</span></> : null}
                  <Nhan ma={m.tinh_trang_sau} />
                  {m.trang_thai_sau && <Nhan ma={m.trang_thai_sau} />}
                  {m.serial_truoc && m.serial_truoc !== m.serial && <span className="text-xs text-slate-500">(serial cũ {m.serial_truoc})</span>}
                </li>
              ))}
              {!p.may.length && <li className="py-1 text-xs text-slate-400">Không có máy theo serial trong phiếu này.</li>}
            </ul>
            <div className="mt-2 text-xs text-slate-500">
              Đề xuất: <b className="font-medium text-slate-700">{p.de_xuat ?? '—'}</b> · Xác nhận: <b className="font-medium text-slate-700">{p.xac_nhan ?? '—'}</b>
              {[p.nguoi_giao && `giao: ${p.nguoi_giao}`, p.nguoi_nhan && `nhận: ${p.nguoi_nhan}`, p.nguoi_phu_trach && `phụ trách: ${p.nguoi_phu_trach}`].filter(Boolean).map((x) => ` · ${x}`)}
              {p.nguon ? <> · <a href={p.nguon} target="_blank" rel="noreferrer" className="text-indigo-700 underline">tin Discord</a></> : null}
            </div>
            {(p.ghi_chu || p.ly_do) && <div className="mt-1 text-xs text-slate-600">{[p.ghi_chu, p.ly_do && `Lý do: ${p.ly_do}`].filter(Boolean).join(' · ')}</div>}
          </article>
        ))}
      </div>
      <Suspense fallback={null}><PhanTrang trang={trang} soTrang={Math.max(1, Math.ceil(tong / MOI_TRANG_PHIEU))} /></Suspense>
    </KhungKho>
  )
}
