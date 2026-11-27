'use client'

// PROTOTYPE vứt đi — dữ liệu + mảnh dùng chung của trang chi tiết ticket bản gọn (ct-gon.tsx). Chỉ ghép component DS;
// ô sửa tại chỗ KHÔNG gọi server (state cục bộ + toast "Prototype — chưa lưu").
import Link from 'next/link'
import type { Ticket, TicketIssue, TicketMuc, TicketNote, MucDo } from '@/app/actions'
import type { DongMay } from '@/lib/loi/kieu'
import type { LanLoi } from '@/lib/loi/lanLoi'
import type { TepNhatKy } from '@/lib/loi/tepNhatKy'
import type { NguoiTicket } from '@/app/ticket/nguoi-actions'
import type { Staff } from '@/lib/nen-tang/nhan-su-luat'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { OSuaNguoi, OSuaNhan, OSuaNhap, OSuaTrangThai, type MucNhan, type MucTrangThai } from '@/components/ui/inline-edit'
import { thongBao } from '@/components/ui/sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import type { MucTimeline } from '@/components/ui/timeline'

export type DuLieuCt = {
  t: Ticket
  ngayBao: string | null
  csTheoDoi: string | null
  nhom: TicketIssue[]
  notes: TicketNote[]
  items: TicketMuc[]
  tenCatalog: Record<string, string>
  lanLoi: LanLoi[]
  dongMay: DongMay[]
  tepNK: TepNhatKy[]
  nguoi: NguoiTicket | null
  staff: Staff[]
  canhBao: string | null
  thieu: { dongMay: boolean; danhMuc: boolean; lanLoi: boolean }
  quyen: { lichKT: boolean; sua: boolean }
  ngayDau: string | null
  ngayCuoi: string | null
  soNgayMo: number | null
}

// ───────────── định dạng ─────────────
export const ngayVN = (d: string | null | undefined) => (d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : '—')
export const cheSdt = (s: string | null) => (s ? `•••${s.replace(/\D/g, '').slice(-4)}` : null)
export const tien = (n: number | null) => (n === null ? '—' : `${n.toLocaleString('vi-VN')} ₫`)
export const chuaLuu = () => thongBao.xong('Prototype — chưa lưu')

export const TT: MucTrangThai[] = [
  { gt: 'Open', nhan: 'Đang mở', color: 'info' },
  { gt: 'Done', nhan: 'Đã xong', color: 'success' },
  { gt: 'Cancel', nhan: 'Đã huỷ' },
]
const KHAN: MucNhan<'1' | '0'>[] = [
  { gt: '1', nhan: <Badge variant="solid" color="danger">Khẩn</Badge>, chu: 'Khẩn' },
  { gt: '0', nhan: <Badge variant="soft">Thường</Badge>, chu: 'Thường' },
]
export const MUC_DO: Record<MucDo, { nhan: string; color: 'danger' | 'warning' | 'secondary'; solid?: boolean }> = {
  an_toan: { nhan: 'An toàn', color: 'danger', solid: true },
  nghiem_trong: { nhan: 'Nghiêm trọng', color: 'danger' },
  thuong: { nhan: 'Thường', color: 'warning' },
  nhe: { nhan: 'Nhẹ', color: 'secondary' },
  khong_loi: { nhan: 'Không phải lỗi', color: 'secondary' },
}

export function DuongDan({ ma }: { ma: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/ticket">Ticket CSKH</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>{ma}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function CanhBao({ d }: { d: DuLieuCt }) {
  const { t } = d
  return (
    <>
      {d.canhBao && (
        <Alert color="warning">
          <AlertDescription>{d.canhBao}</AlertDescription>
        </Alert>
      )}
      {t.may_khong_trong_he_thong && (
        <Alert color="danger" role="note">
          <AlertTitle>Máy không có trong hệ thống</AlertTitle>
          <AlertDescription>
            Ticket gắn serial <span className="tabular-nums">{t.source_serial}</span> nhưng Odoo đang ghi máy là tồn kho dù đã có
            ticket (máy đang ở nhà khách). Gán khách cho serial này trong Odoo rồi export lại.
          </AlertDescription>
        </Alert>
      )}
      {(d.thieu.danhMuc || d.thieu.dongMay || d.thieu.lanLoi) && (
        <Alert color="warning">
          <AlertDescription>
            Chưa tải được {[d.thieu.danhMuc && 'danh mục lỗi', d.thieu.dongMay && 'dòng máy', d.thieu.lanLoi && 'các lần lỗi sau']
              .filter(Boolean)
              .join(', ')}{' '}
            — báo kỹ thuật nếu kéo dài.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

// ───────────── ô sửa tại chỗ (chỉ cục bộ) ─────────────
export function OTrangThai({ d, onDoi }: { d: DuLieuCt; onDoi: (tt: string) => void }) {
  return (
    <OSuaNhap>
      <OSuaTrangThai
        ma={d.t.ticket_code}
        value={{ tt: d.t.state }}
        muc={TT}
        onLuu={(v) => {
          onDoi(v.tt)
          chuaLuu()
        }}
      />
    </OSuaNhap>
  )
}
export function OKhan({ d }: { d: DuLieuCt }) {
  return (
    <OSuaNhap>
      <OSuaNhan ma={d.t.ticket_code} truong="mức khẩn" value={d.t.khan ? '1' : '0'} muc={KHAN} onLuu={chuaLuu} />
    </OSuaNhap>
  )
}
export function ONguoi({ d, loai }: { d: DuLieuCt; loai: 'cs' | 'kt' }) {
  const cs = d.nguoi?.cs.map((x) => ({ gt: x.id, nhan: x.ten })) ?? []
  const kt = d.nguoi ? d.nguoi.kt.map((x) => ({ gt: x.id, nhan: x.ten })) : d.staff.map((s) => ({ gt: s.id, nhan: s.ten }))
  const csId = d.nguoi && d.csTheoDoi ? (d.nguoi.cs.find((x) => x.ten === d.csTheoDoi)?.id ?? null) : null
  const ktId = d.nguoi ? d.nguoi.kt_ho_so : d.t.ky_thuat
  return (
    <OSuaNhap>
      <OSuaNguoi
        ma={d.t.ticket_code}
        truong={loai === 'cs' ? 'CS theo dõi' : 'kỹ thuật'}
        value={loai === 'cs' ? csId : ktId}
        options={loai === 'cs' ? cs : kt}
        onLuu={chuaLuu}
      />
    </OSuaNhap>
  )
}

// ───────────── các lần lỗi ─────────────
export type Lan = {
  so: number
  ngay: string | null
  khach: string | null
  xuLy: string | null
  demo?: boolean
  vatTu: string[]
  /** Linh kiện tháo từ máy khác (CSKH 25/11): serial máy bị tháo + tên vật tư. Chưa có trong DB → chỉ Demo. */
  thaoTu?: string
  ketQua?: { nhan: string; color: 'warning' | 'success' | 'secondary' }
}

const KQ = {
  cho_xu_ly: { nhan: 'Chờ xử lý', color: 'warning' },
  dang_xu_ly: { nhan: 'Đang xử lý', color: 'warning' },
  da_xu_ly: { nhan: 'Đã xử lý', color: 'success' },
  khong_loi: { nhan: 'Không phải lỗi', color: 'secondary' },
} as const

/**
 * Các lần lỗi CŨ → MỚI, gắn vật tư + kết quả (dòng máy) vào lần có mốc ngay trước nó. Ngày = NGÀY KHÁCH BÁO (lần 1:
 * `ngay_bao`, lần sau: `ngay` của lần), không phải ngày nhập. DB local thiếu bảng lần lỗi → thêm 2 lần Demo.
 */
export function dsLan(d: DuLieuCt): Lan[] {
  const ds: Lan[] = [
    { so: 1, ngay: d.ngayDau, khach: d.t.description, xuLy: d.t.last_note, vatTu: [] },
    ...d.lanLoi.map((l) => ({ so: l.lan, ngay: l.ngay ?? l.created_at.slice(0, 10), khach: l.mo_ta, xuLy: l.xu_ly, vatTu: [] })),
  ]
  const moc = [d.t.created_at, ...d.lanLoi.map((l) => l.created_at)].map(Date.parse)
  const cuaLan = (luc: string) => {
    const x = Date.parse(luc)
    let i = 0
    while (i + 1 < moc.length && moc[i + 1] <= x) i++
    return i
  }
  for (const it of d.items)
    ds[cuaLan(it.created_at)].vatTu.push(
      it.loai === 'doi_may' ? `Đổi máy ${it.serial_cu ?? '?'} → ${it.serial_moi ?? '?'}` : (it.catalog_code && d.tenCatalog[it.catalog_code]) || it.mo_ta || 'Chi phí',
    )
  for (const m of d.dongMay) ds[cuaLan(m.created_at)].ketQua = KQ[m.trang_thai]
  if (d.lanLoi.length === 0 && d.thieu.lanLoi)
    ds.push(
      {
        so: 2,
        ngay: '2026-11-22',
        khach: 'Demo — Máy lại rò nước sau 2 ngày, lần này ở khớp nối đầu ra.',
        xuLy: 'Demo — KT thay gioăng khớp nối, chạy thử 30 phút không rò.',
        demo: true,
        vatTu: ['Gioăng khớp nối (Demo)'],
        thaoTu: 'Van điện từ — tháo từ máy serial CTS20-DEMO-0081 (Demo)',
        ketQua: KQ.da_xu_ly,
      },
      { so: 3, ngay: '2026-11-24', khach: 'Demo — Khách báo đèn lọc nháy đỏ.', xuLy: null, demo: true, vatTu: [] },
    )
  return ds
}

// ───────────── nhật ký + chi phí ─────────────
const tepCua = (d: DuLieuCt, noteId: string) =>
  d.tepNK.filter((f) => f.note_id === noteId).map((f) => ({ ten: f.ten, href: f.url ?? undefined }))

/** Ghi chú cũ → mới (listTicketNotes trả mới trước). */
export const mucGhiChu = (d: DuLieuCt, them: MucTimeline[] = []): MucTimeline[] => [
  ...[...d.notes].reverse().map((n) => ({
    id: n.id,
    ai: n.tac_gia ?? 'Không rõ',
    loai: 'ghi chú',
    luc: n.created_at,
    noiDung: <span className="whitespace-pre-line">{n.noi_dung}</span>,
    tep: tepCua(d, n.id),
  })),
  ...them,
]

export function ChiPhi({ d }: { d: DuLieuCt }) {
  if (d.items.length === 0) return <p className="m-0 ds-text-sm text-muted-foreground">Chưa có chi phí hay vật tư.</p>
  const tong = d.items.reduce((s, i) => s + (i.tinh_phi ? (i.so_tien ?? 0) : 0), 0)
  return (
    <TableWrap vien>
      <Table variant="thuong">
        <TableHeader>
          <TableRow>
            <TableHead>Mục</TableHead>
            <TableHead phai>SL</TableHead>
            <TableHead phai>Tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {d.items.map((i) => (
            <TableRow key={i.id}>
              <TableCell>
                {i.loai === 'doi_may' ? (
                  <>
                    Đổi máy <span className="tabular-nums">{i.serial_cu ?? '?'} → {i.serial_moi ?? '?'}</span>
                  </>
                ) : (
                  (i.catalog_code && d.tenCatalog[i.catalog_code]) || i.mo_ta || i.catalog_code
                )}
              </TableCell>
              <TableCell phai className="tabular-nums">
                {i.so_luong ?? '—'}
              </TableCell>
              <TableCell phai className="tabular-nums">
                {i.tinh_phi ? tien(i.so_tien) : <Badge variant="soft">Miễn phí</Badge>}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-medium">Tổng thu khách</TableCell>
            <TableCell />
            <TableCell phai className="font-medium tabular-nums">
              {tien(tong)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableWrap>
  )
}
