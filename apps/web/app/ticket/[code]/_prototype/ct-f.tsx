'use client'

// PROTOTYPE vứt đi — PA F "Đối chiếu từng lần": mỗi lần lỗi là MỘT HÀNG hai cột ngang nhau — trái "Khách báo" (ngày, mô
// tả), phải "Xử lý" (người, cách xử lý, kết quả, vật tư). Trục "Lần 1, 2…" bám bên lề để nhảy (từ md). Lần chưa có xử
// lý = ô trống mời ghi. Nhật ký trao đổi thu gọn ở dưới. Dưới md mỗi lần xếp dọc, không có trục.
import { CaretDown, Plus } from '@phosphor-icons/react/ssr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DetailHeading } from '@/components/ui/detail-layout'
import { PageHeader } from '@/components/ui/page-header'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { thongBao } from '@/components/ui/sonner'
import { Timeline } from '@/components/ui/timeline'
import { cacLan, CanhBao, DuongDan, HangThuocTinh, meta, mucGhiChu, ngayVN, NutLichKT, tieuDe, useGhiChuMoi, type DuLieuCt } from './chung'

type Lan = ReturnType<typeof cacLan>[number] & {
  demo?: boolean
  vatTu: string[]
  ketQua?: { nhan: string; color: 'warning' | 'success' | 'secondary' }
}

const KQ = {
  dang_xu_ly: { nhan: 'Đang xử lý', color: 'warning' },
  da_xu_ly: { nhan: 'Đã xử lý', color: 'success' },
  khong_loi: { nhan: 'Không phải lỗi', color: 'secondary' },
} as const

/** Gắn vật tư + kết quả (dòng máy) vào lần có mốc ngay trước nó. DB local thiếu bảng lần lỗi → thêm 2 lần Demo để thấy bố cục. */
function dsLan(d: DuLieuCt): Lan[] {
  const goc = cacLan(d)
  const moc = [d.t.created_at, ...d.lanLoi.map((l) => l.created_at)].map(Date.parse)
  const cuaLan = (luc: string) => {
    const x = Date.parse(luc)
    let i = 0
    while (i + 1 < moc.length && moc[i + 1] <= x) i++
    return i
  }
  const ds: Lan[] = goc.map((l) => ({ ...l, vatTu: [] }))
  for (const it of d.items)
    ds[cuaLan(it.created_at)].vatTu.push(
      it.loai === 'doi_may' ? `Đổi máy ${it.serial_cu ?? '?'} → ${it.serial_moi ?? '?'}` : (it.catalog_code && d.tenCatalog[it.catalog_code]) || it.mo_ta || 'Chi phí',
    )
  for (const m of d.dongMay) ds[cuaLan(m.created_at)].ketQua = KQ[m.trang_thai]
  if (d.lanLoi.length === 0 && d.thieu.lanLoi)
    ds.push(
      { so: 2, ngay: '2026-11-22', khach: 'Demo — Máy lại rò nước sau 2 ngày, lần này ở khớp nối đầu ra.', xuLy: 'Demo — KT thay gioăng khớp nối, chạy thử 30 phút không rò.', demo: true, vatTu: ['Gioăng khớp nối (Demo)'], ketQua: KQ.da_xu_ly },
      { so: 3, ngay: '2026-11-24', khach: 'Demo — Khách báo đèn lọc nháy đỏ.', xuLy: null, demo: true, vatTu: [] },
    )
  return ds
}

function OKhachBao({ lan }: { lan: Lan }) {
  return (
    <Card className="flex min-w-0 flex-col gap-3">
      <CardHeader>
        <CardTitle>Khách báo</CardTitle>
        <CardDescription className="tabular-nums">Ngày {ngayVN(lan.ngay)}</CardDescription>
      </CardHeader>
      <p className="m-0 ds-text-sm whitespace-pre-line">{lan.khach ?? '—'}</p>
    </Card>
  )
}

function OXuLy({ lan, nguoi }: { lan: Lan; nguoi: string }) {
  if (!lan.xuLy)
    return (
      <Card className="flex min-w-0 flex-col items-start justify-center gap-3 border-dashed bg-transparent">
        <CardHeader>
          <CardTitle>Xử lý</CardTitle>
          <CardDescription>Chưa ghi xử lý cho lần {lan.so}.</CardDescription>
        </CardHeader>
        <Button variant="outline" size="sm" onClick={() => thongBao.xong('Prototype — chưa lưu')}>
          <Plus aria-hidden="true" />
          Ghi xử lý
        </Button>
      </Card>
    )
  return (
    <Card className="flex min-w-0 flex-col gap-3">
      <CardHeader>
        <CardTitle>Xử lý</CardTitle>
        <CardDescription>{nguoi}</CardDescription>
      </CardHeader>
      <p className="m-0 ds-text-sm whitespace-pre-line">{lan.xuLy}</p>
      <PropertyList>
        <PropertyRow nhan="Kết quả">
          {lan.ketQua && (
            <Badge variant="soft" color={lan.ketQua.color}>
              {lan.ketQua.nhan}
            </Badge>
          )}
        </PropertyRow>
        <PropertyRow nhan="Vật tư">{lan.vatTu.length > 0 && lan.vatTu.join(', ')}</PropertyRow>
      </PropertyList>
    </Card>
  )
}

export function CtF({ d }: { d: DuLieuCt }) {
  const { t } = d
  const ds = dsLan(d)
  const nguoi = t.ky_thuat_ten ?? t.cs_ten ?? 'CSKH'
  const { moi, composer } = useGhiChuMoi()
  const nk = mucGhiChu(d, moi)
  return (
    <div className="flex flex-col gap-6 border-none border-current">
      <PageHeader duongDan={<DuongDan ma={t.ticket_code} />} tieuDe={tieuDe(d)} meta={meta(d)} hanhDong={<NutLichKT d={d} />} />
      <HangThuocTinh d={d} khachMay />
      <CanhBao d={d} />

      <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
        {/* Trục số lần — bám khi cuộn, chỉ từ md. */}
        <nav aria-label="Các lần lỗi" className="hidden flex-col gap-1 self-start border-none border-current md:sticky md:top-4 md:flex">
          {ds.map((l) => (
            <Button key={l.so} asChild variant="ghost" size="sm" className="justify-start">
              <a href={`#f-lan-${l.so}`}>
                Lần {l.so}
                {!l.xuLy && (
                  <Badge variant="soft" color="warning">
                    Chờ
                  </Badge>
                )}
              </a>
            </Button>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-8 border-none border-current">
          {ds.map((l) => (
            <section key={l.so} id={`f-lan-${l.so}`} aria-labelledby={`f-lan-${l.so}-td`} className="scroll-mt-4 border-none border-current">
              <div className="mb-3 flex items-center gap-2 border-none border-current">
                <DetailHeading id={`f-lan-${l.so}-td`}>Lần {l.so}</DetailHeading>
                {l.demo && <Badge variant="soft">Demo</Badge>}
              </div>
              {/* Hai ô cao bằng nhau, ngang hàng; dưới md xếp dọc. */}
              <div className="grid gap-4 md:grid-cols-2">
                <OKhachBao lan={l} />
                <OXuLy lan={l} nguoi={nguoi} />
              </div>
            </section>
          ))}

          <Collapsible className="group/nk flex flex-col gap-3 border-none border-current">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="self-start">
                <CaretDown aria-hidden="true" className="group-data-[state=open]/nk:rotate-180" />
                Nhật ký trao đổi · {nk.length}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-3">
              {nk.length > 0 && <Timeline muc={nk} hien={6} aria-label="Nhật ký trao đổi" />}
              {composer}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
