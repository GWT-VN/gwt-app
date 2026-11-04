import { Suspense } from 'react'
import { BoLocChon, LocNgay, OTimKiem, PhanTrang } from '@/bang'
import { daCauHinhKho, kho, MOI_TRANG } from '@/lib/kho/doc'
import { KHO, LOAI, mauLoai } from '@/lib/kho/nhan'
import { chanKho, coTheSuaKho } from '../_gac'
import { KhuSuaKho, NutSuaDong } from '../_sua'
import { Bang, KhungKho, LinkMa, LinkTin, LoiKho, NhanSuaTay, O, TrangThai, khoTu, ngayVN, sl, thu } from '../_ui'

export const metadata = { title: 'Nhật ký kho · GWT Kho' }
export const dynamic = 'force-dynamic'

type ThamSo = { kho?: string; q?: string; loai?: string; tt?: string; ngtu?: string; ngden?: string; trang?: string }

export default async function KhoNhatKyPage({ searchParams }: { searchParams: Promise<ThamSo> }) {
  await chanKho()
  const sp = await searchParams
  const k = khoTu(sp.kho)
  if (!daCauHinhKho()) return <KhungKho tieuDe="Nhật ký nhập / xuất" kho={k}><LoiKho /></KhungKho>
  const trang = Math.max(1, Number(sp.trang) || 1)
  const sua = await coTheSuaKho()
  const [r, dm] = await Promise.all([
    thu(() => kho().nhatKy({ kho: k, tuKhoa: sp.q, loai: sp.loai, trangThai: sp.tt, tuNgay: sp.ngtu, denNgay: sp.ngden, trang })),
    sua ? thu(() => kho().danhMuc()) : null,
  ])
  if (!r.ok) return <KhungKho tieuDe="Nhật ký nhập / xuất" kho={k}><LoiKho loi={r.loi} /></KhungKho>
  const { tong, dong } = r.v
  const danhMuc = dm?.ok ? dm.v : []

  return (
    <KhungKho tieuDe="Nhật ký nhập / xuất" kho={k} moTa={`${tong} dòng sổ · mới nhất trước · "Điều chỉnh" = chênh lệch sau kiểm kê`}>
      <Suspense fallback={<div className="h-20" />}>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <OTimKiem placeholder="Tìm tên trong tin / mã / tên hàng…" />
          <div className="flex flex-wrap items-center gap-2">
            <BoLocChon param="kho" nhan="Kho Nguyễn Xiển" tuyChon={KHO.filter((x) => x.ma !== 'NX').map((x) => ({ giaTri: x.ma, nhan: x.ten }))} />
            <BoLocChon param="loai" nhan="Nhập / xuất / điều chỉnh" tuyChon={LOAI.map((x) => ({ giaTri: x, nhan: x }))} />
            <BoLocChon param="tt" nhan="Mọi trạng thái" tuyChon={[{ giaTri: 'approved', nhan: 'Đã vào sổ' }, { giaTri: 'need_review', nhan: 'Chờ duyệt mã' }, { giaTri: 'rejected', nhan: 'Bỏ qua' }]} />
            <LocNgay nhan="Ngày nghiệp vụ" />
          </div>
        </div>
      </Suspense>

      {dm && !dm.ok && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Chưa tải được danh mục mã ({dm.loi}) — ô chọn mã khi sửa sẽ trống.</p>}
      <KhuSuaKho danhMuc={danhMuc}>
      <Bang dau={['Ngày', 'Loại', 'Mã', 'Tên ghi trong tin', 'SL', 'Lý do / cho ai', 'Ghi chú', 'Người nhắn', 'Trạng thái', '', ...(sua ? [''] : [])]} trong={!dong.length} phai={[4]}>
        {dong.map((d) => (
          <tr key={d.id} className="hover:bg-slate-50">
            <O cls="whitespace-nowrap">{ngayVN(d.ngay)}</O>
            <O cls={`font-medium ${mauLoai(d.loai)}`}>{d.loai}</O>
            <O><LinkMa ma={d.internal_code} kho={k} />{d.ten && <div className="text-xs text-slate-500">{d.ten}</div>}</O>
            <O>{d.raw_name}</O>
            <O cls="text-right font-semibold">{sl(d.qty)}</O>
            <O cls="max-w-[220px] text-slate-600">{d.purpose ?? ''}</O>
            <O cls="max-w-[220px] text-xs text-slate-500">{d.note ?? ''}</O>
            <O cls="whitespace-nowrap">{d.keeper ?? ''}</O>
            <O><TrangThai ma={d.trang_thai} /><NhanSuaTay luc={d.sua_tay_luc} boi={d.sua_tay_boi} /></O>
            <O><LinkTin id={d.discord_msg_id} /></O>
            {sua && <O><NutSuaDong dong={{ id: d.id, ngay: d.ngay, loai: d.loai, internal_code: d.internal_code, raw_name: d.raw_name, qty: d.qty,
              purpose: d.purpose, note: d.note, trang_thai: d.trang_thai }} /></O>}
          </tr>
        ))}
      </Bang>
      </KhuSuaKho>
      <Suspense fallback={null}><PhanTrang trang={trang} soTrang={Math.max(1, Math.ceil(tong / MOI_TRANG))} /></Suspense>
    </KhungKho>
  )
}
