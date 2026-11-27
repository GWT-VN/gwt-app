import { TableRow } from '@/components/ui/table'
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
  sua: 'bg-(--color-background-info-surface) text-(--color-text-info)', huy: 'bg-(--color-background-danger-surface) text-destructive', duyet: 'bg-(--color-background-success-surface) text-(--color-text-success-surface)',
  bo_qua: 'bg-muted text-muted-foreground', kiem_ke: 'bg-(--color-background-warning-surface) text-(--color-text-warning-surface)',
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
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
          <BoLocChon param="nguon" nhan="Mọi nguồn" tuyChon={NGUON_SUA} />
          <BoLocChon param="hd" nhan="Mọi hành động" tuyChon={HANH_DONG_SUA} />
        </div>
      </Suspense>

      <Bang dau={['Lúc', 'Hành động', 'Nguồn', 'Người', 'Dòng / mã', 'Thay đổi', 'Lý do']} trong={!dong.length} dangLoc={!!(nguon || hanhDong)}>
        {dong.map((d) => {
          const doi = moTaDoi(d.truoc, d.sau)
          return (
            <TableRow key={d.id}>
              <O cls="whitespace-nowrap text-xs text-muted-foreground">{ngayVN(d.luc)}</O>
              <O><span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${MAU_HANH_DONG[d.hanh_dong] ?? 'bg-muted text-muted-foreground'}`}>{nhanHanhDong(d.hanh_dong)}</span></O>
              <O cls="whitespace-nowrap">{nhanNguon(d.nguon)}</O>
              <O cls="whitespace-nowrap text-xs" ><span title={d.nguoi ?? ''}>{(d.nguoi ?? '').split('@')[0] || '—'}</span></O>
              <O>
                <div className="flex flex-wrap items-center gap-x-2">
                  <LinkMa ma={d.internal_code} />
                  {d.dong_id && <span className="text-xs text-muted-foreground">dòng #{d.dong_id}</span>}
                  <LinkTin id={d.discord_msg_id} />
                </div>
                {(d.raw_name || d.loai) && (
                  <div className="text-xs text-muted-foreground">
                    {d.loai && <span className={`font-medium ${mauLoai(d.loai)}`}>{d.loai}</span>}{d.ngay && ` · ${ngayVN(d.ngay)}`}{d.raw_name && ` · ${d.raw_name}`}
                  </div>
                )}
              </O>
              <O cls="text-xs">
                {doi.length ? <ul className="space-y-0.5">{doi.map((x, i) => <li key={i}>{x}</li>)}</ul> : <span className="text-muted-foreground">—</span>}
              </O>
              <O cls="max-w-[240px] text-xs text-muted-foreground">{d.ly_do && d.ly_do !== d.hanh_dong ? d.ly_do : ''}</O>
            </TableRow>
          )
        })}
      </Bang>
      <Suspense fallback={null}><PhanTrang trang={trang} soTrang={Math.max(1, Math.ceil(tong / MOI_TRANG))} /></Suspense>
    </KhungKho>
  )
}
