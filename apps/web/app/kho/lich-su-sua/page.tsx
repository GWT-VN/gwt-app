import { Suspense } from 'react'
import { BoLocChon, PhanTrang } from '@/bang'
import { daCauHinhKho, kho, MOI_TRANG } from '@/lib/kho/doc'
import { mauLoai } from '@/lib/kho/nhan'
import { HANH_DONG_SUA, NGUON_SUA, moTaDoi, nhanHanhDong, nhanNguon } from '@/lib/kho/sua'
import { chanKho } from '../_gac'
import { Bang, KhungKho, LinkMa, LinkTin, LoiKho, O, ngayVN, thu } from '../_ui'

export const metadata = { title: 'Lịch sử sửa · GWT Kho' }
export const dynamic = 'force-dynamic'

type ThamSo = { nguon?: string; hd?: string; trang?: string }

const MAU_HANH_DONG: Record<string, string> = {
  sua: 'bg-indigo-50 text-indigo-700', huy: 'bg-red-50 text-red-700', duyet: 'bg-emerald-50 text-emerald-700',
  bo_qua: 'bg-slate-100 text-slate-600', kiem_ke: 'bg-amber-50 text-amber-800',
}

export default async function KhoLichSuSuaPage({ searchParams }: { searchParams: Promise<ThamSo> }) {
  await chanKho()
  const sp = await searchParams
  if (!daCauHinhKho()) return <KhungKho tieuDe="Lịch sử sửa"><LoiKho /></KhungKho>
  const trang = Math.max(1, Number(sp.trang) || 1)
  const nguon = NGUON_SUA.some((x) => x.giaTri === sp.nguon) ? sp.nguon : undefined
  const hanhDong = HANH_DONG_SUA.some((x) => x.giaTri === sp.hd) ? sp.hd : undefined
  const r = await thu(() => kho().lichSuSua({ nguon, hanhDong, trang }))
  if (!r.ok) return <KhungKho tieuDe="Lịch sử sửa"><LoiKho loi={r.loi} /></KhungKho>
  const { tong, dong } = r.v

  return (
    <KhungKho tieuDe="Lịch sử sửa" moTa={`${tong} lần sửa sổ (app / Google Sheet / Portal) · mới nhất trước · dòng bot ghi từ Discord không nằm ở đây`}>
      <Suspense fallback={<div className="h-12" />}>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <BoLocChon param="nguon" nhan="Mọi nguồn" tuyChon={NGUON_SUA} />
          <BoLocChon param="hd" nhan="Mọi hành động" tuyChon={HANH_DONG_SUA} />
        </div>
      </Suspense>

      <Bang dau={['Lúc', 'Hành động', 'Nguồn', 'Người', 'Dòng / mã', 'Thay đổi', 'Lý do']} trong={!dong.length}>
        {dong.map((d) => {
          const doi = moTaDoi(d.truoc, d.sau)
          return (
            <tr key={d.id} className="hover:bg-slate-50">
              <O cls="whitespace-nowrap text-xs text-slate-600">{ngayVN(d.luc)}</O>
              <O><span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${MAU_HANH_DONG[d.hanh_dong] ?? 'bg-slate-100 text-slate-600'}`}>{nhanHanhDong(d.hanh_dong)}</span></O>
              <O cls="whitespace-nowrap">{nhanNguon(d.nguon)}</O>
              <O cls="whitespace-nowrap text-xs" ><span title={d.nguoi ?? ''}>{(d.nguoi ?? '').split('@')[0] || '—'}</span></O>
              <O>
                <div className="flex flex-wrap items-center gap-x-2">
                  <LinkMa ma={d.internal_code} />
                  {d.dong_id && <span className="text-xs text-slate-400">dòng #{d.dong_id}</span>}
                  <LinkTin id={d.discord_msg_id} />
                </div>
                {(d.raw_name || d.loai) && (
                  <div className="text-xs text-slate-500">
                    {d.loai && <span className={`font-medium ${mauLoai(d.loai)}`}>{d.loai}</span>}{d.ngay && ` · ${ngayVN(d.ngay)}`}{d.raw_name && ` · ${d.raw_name}`}
                  </div>
                )}
              </O>
              <O cls="text-xs">
                {doi.length ? <ul className="space-y-0.5">{doi.map((x, i) => <li key={i}>{x}</li>)}</ul> : <span className="text-slate-400">—</span>}
              </O>
              <O cls="max-w-[240px] text-xs text-slate-600">{d.ly_do && d.ly_do !== d.hanh_dong ? d.ly_do : ''}</O>
            </tr>
          )
        })}
      </Bang>
      <Suspense fallback={null}><PhanTrang trang={trang} soTrang={Math.max(1, Math.ceil(tong / MOI_TRANG))} /></Suspense>
    </KhungKho>
  )
}
