import { Suspense } from 'react'
import { BoLocChon, OTimKiem, PhanTrang } from '@/bang'
import { daCauHinhKho, kho, MOI_TRANG_MAY } from '@/lib/kho/doc'
import { n, TINH_TRANG, TRANG_THAI } from '@/lib/kho/nhan'
import { chanKho } from '../_gac'
import { Bang, KhungKho, LinkMay, LoiKho, Nhan, O, thu } from '../_ui'

export const metadata = { title: 'Danh sách máy · GWT Kho' }
export const dynamic = 'force-dynamic'

type ThamSo = { q?: string; nd?: string; tt?: string; tth?: string; sh?: string; trang?: string }

export default async function KhoMayPage({ searchParams }: { searchParams: Promise<ThamSo> }) {
  await chanKho()
  const sp = await searchParams
  if (!daCauHinhKho()) return <KhungKho tieuDe="Danh sách máy"><LoiKho /></KhungKho>
  const trang = Math.max(1, Number(sp.trang) || 1)
  const k = kho()
  const [r, nd] = await Promise.all([
    thu(() => k.dsMay({ tuKhoa: sp.q, diaDiem: sp.nd, tinhTrang: sp.tt, trangThai: sp.tth, soHuu: sp.sh, trang })),
    thu(() => k.diaDiem()),
  ])
  if (!r.ok) return <KhungKho tieuDe="Danh sách máy"><LoiKho loi={r.loi} /></KhungKho>
  const { tong, dong } = r.v
  const soTrang = Math.max(1, Math.ceil(tong / MOI_TRANG_MAY))

  return (
    <KhungKho tieuDe="Danh sách máy" moTa={`${tong} máy có hồ sơ serial · mới cập nhật trước`}>
      <Suspense fallback={<div className="h-20" />}>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <OTimKiem placeholder="Tìm serial (gõ một phần, bỏ qua dấu cách)…" />
          <div className="flex flex-wrap items-center gap-2">
            <BoLocChon param="nd" nhan="Mọi nơi để" tuyChon={(nd.ok ? nd.v : []).map((d) => ({ giaTri: d.ma, nhan: d.ten }))} />
            <BoLocChon param="tt" nhan="Mọi tình trạng" tuyChon={TINH_TRANG.map((x) => ({ giaTri: x, nhan: n(x) }))} />
            <BoLocChon param="tth" nhan="Mọi trạng thái" tuyChon={TRANG_THAI.map((x) => ({ giaTri: x, nhan: n(x) }))} />
            <BoLocChon param="sh" nhan="Mọi sở hữu" tuyChon={['cong_ty', 'khach', 'da_thanh_ly'].map((x) => ({ giaTri: x, nhan: n(x) }))} />
          </div>
        </div>
      </Suspense>

      <Bang dau={['Serial', 'Model', 'Tình trạng', 'Trạng thái', 'Nơi để', 'Sở hữu', 'Phụ trách', 'Phiếu gần nhất', 'Cập nhật']} trong={!dong.length}>
        {dong.map((m) => (
          <tr key={m.id} className="hover:bg-slate-50">
            <O><LinkMay serial={m.serial} /></O>
            <O><div className="font-medium">{m.internal_code}</div><div className="text-xs text-slate-500">{m.ten_model ?? ''}</div></O>
            <O><Nhan ma={m.tinh_trang} /></O>
            <O><Nhan ma={m.trang_thai} /></O>
            <O><div>{m.dia_diem_ten}</div><div className="text-xs text-slate-500">{m.trong_kho ? 'trong kho' : 'ngoài kho'}{m.dia_diem_chi_tiet ? ` · ${m.dia_diem_chi_tiet}` : ''}</div></O>
            <O>{n(m.so_huu)}</O>
            <O>{m.nguoi_phu_trach ?? ''}</O>
            <O cls="font-mono text-xs">{m.ma_gd_gan_nhat ?? ''}</O>
            <O cls="whitespace-nowrap text-xs text-slate-500">{m.cap_nhat}</O>
          </tr>
        ))}
      </Bang>
      <Suspense fallback={null}><PhanTrang trang={trang} soTrang={soTrang} /></Suspense>
    </KhungKho>
  )
}
