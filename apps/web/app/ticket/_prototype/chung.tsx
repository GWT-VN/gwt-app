'use client'

// PROTOTYPE vứt đi — phần chung 3 phương án danh sách ticket (/ticket?variant=A|B|C). Không gọi mutation thật.
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Ticket } from '@/app/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { thongBao } from '@/components/ui/sonner'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type DuLieuTicket = {
  rows: Ticket[]
  tong: number
  trang: number
  soTrang: number
  loaiList: string[]
  dsLoi: { code: string; ten: string }[]
  /** DB local gần như trống → có thêm ticket Demo trong bộ nhớ. */
  demo?: boolean
}

export const PHUONG_AN = [
  { ma: 'A', ten: 'Hàng đợi như Việc' },
  { ma: 'B', ten: 'Bảng dày' },
  { ma: 'C', ten: 'Hộp thư chia đôi' },
]

export const chuaLuu = () => thongBao.xong('Prototype — chưa lưu')

/** SĐT che, chỉ giữ 4 số cuối (không PII trên màn demo). */
export const cheSdt = (s: string | null) => (s ? `•••${s.replace(/\D/g, '').slice(-4)}` : null)

/** dd/mm từ ISO (ngày giờ VN). */
export const ngayNgan = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }) : '—'

export const tenKhach = (t: Ticket) => t.customer_name ?? 'Chưa gắn khách'

/** "Máy · lỗi": dòng máy đầu tiên (ticket_may), không có thì tên máy. */
export const mayLoi = (t: Ticket) => t.dong_may?.[0]?.nhan ?? t.product_name ?? '—'

const TT: Record<Ticket['state'], { nhan: string; color: 'info' | 'success' | 'secondary' }> = {
  Open: { nhan: 'Đang mở', color: 'info' },
  Done: { nhan: 'Đã xong', color: 'success' },
  Cancel: { nhan: 'Đã huỷ', color: 'secondary' },
}

export function NhanTrangThai({ t }: { t: Ticket }) {
  return (
    <Badge variant="soft" color={TT[t.state].color}>
      {TT[t.state].nhan}
    </Badge>
  )
}

export function NhanKhan() {
  return (
    <Badge variant="soft" color="danger">
      Khẩn
    </Badge>
  )
}

/** Ghi tham số URL (giữ `variant` + mọi tham số khác, đổi lọc → bỏ `trang`). */
export function useDatUrl() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  return (sua: Record<string, string | null>, giuTrang = false) => {
    const p = new URLSearchParams(sp.toString())
    if (!giuTrang) p.delete('trang')
    for (const [k, v] of Object.entries(sua)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    router.replace(`${pathname}?${p}`, { scroll: false })
  }
}

/** Tab hàng đợi ↔ tham số server có sẵn (state / khan / mine). */
type Tab = 'mo' | 'khan' | 'cua-toi' | 'xong' | 'tat-ca'
const TAB: { v: Tab; ten: string; url: Record<string, string | null> }[] = [
  { v: 'mo', ten: 'Đang mở', url: { state: 'Open', khan: null, mine: null } },
  { v: 'khan', ten: 'Khẩn', url: { state: null, khan: '1', mine: null } },
  { v: 'cua-toi', ten: 'Của tôi', url: { state: null, khan: null, mine: '1' } },
  { v: 'xong', ten: 'Đã xong', url: { state: 'Done', khan: null, mine: null } },
  { v: 'tat-ca', ten: 'Tất cả', url: { state: null, khan: null, mine: null } },
]

export function TabTicket({ tong }: { tong: number }) {
  const sp = useSearchParams()
  const dat = useDatUrl()
  const tab: Tab =
    sp.get('khan') === '1' ? 'khan' : sp.get('mine') === '1' ? 'cua-toi' : sp.get('state') === 'Open' ? 'mo' : sp.get('state') === 'Done' ? 'xong' : 'tat-ca'
  return (
    <Tabs value={tab} onValueChange={(v) => dat({ ...TAB.find((t) => t.v === v)!.url, xem: null, chon: null })}>
      <TabsList variant="pill" aria-label="Hàng đợi ticket">
        {TAB.map((t) => (
          <TabsTrigger key={t.v} value={t.v}>
            {t.ten}
            {/* Server chỉ đếm tab đang mở — ponytail: đếm mọi tab cần 4 truy vấn đếm, thêm khi chốt PA. */}
            {t.v === tab && <TabsCount color={t.v === 'khan' && tong ? 'danger' : undefined}>{tong}</TabsCount>}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export function NutTaoTicket() {
  return (
    <Button asChild>
      <Link href="/tao-ticket">Tạo ticket</Link>
    </Button>
  )
}

/** Nội dung đọc nhanh một ticket — dùng ở thẻ Xem nhanh (A) và khung đọc (C). Chỉ đọc, dữ liệu sẵn trong dòng. */
export function DocTicket({ t, them }: { t: Ticket; them?: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 border-none border-current">
      <div className="flex flex-wrap items-center gap-2 border-none border-current">
        <NhanTrangThai t={t} />
        {t.khan && <NhanKhan />}
        {t.ticket_type && (
          <Badge variant="soft" color="secondary">
            {t.ticket_type}
          </Badge>
        )}
      </div>
      <PropertyList>
        <PropertyRow nhan="Khách">{t.customer_name}</PropertyRow>
        <PropertyRow nhan="SĐT">{cheSdt(t.primary_phone)}</PropertyRow>
        <PropertyRow nhan="Tỉnh/TP">{t.province}</PropertyRow>
        <PropertyRow nhan="Máy">{t.product_name}</PropertyRow>
        <PropertyRow nhan="Serial">{t.source_serial && <span className="tabular-nums">{t.source_serial}</span>}</PropertyRow>
        <PropertyRow nhan="Bảo hành">
          {t.serial && (t.warranty_activated ? (t.con_han_may ? 'Còn hạn' : 'Hết hạn') : 'Chưa kích hoạt')}
        </PropertyRow>
        <PropertyRow nhan="CS nhận việc">{t.cs_ten}</PropertyRow>
        <PropertyRow nhan="Kỹ thuật">{t.ky_thuat_ten}</PropertyRow>
        <PropertyRow nhan="Ngày tạo">{ngayNgan(t.created_at)}</PropertyRow>
      </PropertyList>
      <PropertyList tieuDe="Nội dung" layout="stack">
        <PropertyRow nhan="Khách báo">{t.description}</PropertyRow>
        <PropertyRow nhan="Ghi chú cuối">{t.last_note}</PropertyRow>
      </PropertyList>
      <div className="flex flex-wrap gap-2 border-none border-current">
        <Button asChild variant="outline" size="sm">
          <Link href={`/ticket/${encodeURIComponent(t.ticket_code)}`}>Mở trang chi tiết</Link>
        </Button>
        {them}
      </div>
    </div>
  )
}

/** Dòng mô tả phương án đầu màn: Badge Prototype + "bấm gì để thấy". */
export function DauPrototype({ ma, cach, demo }: { ma: string; cach: string; demo?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-none border-current pb-4">
      <Badge variant="soft" color="warning">
        Prototype {ma}
      </Badge>
      <span className="ds-text-sm text-muted-foreground">{cach}</span>
      {demo && (
        <>
          <Badge variant="soft" color="info">
            + ticket Demo
          </Badge>
          <span className="ds-text-sm text-muted-foreground">
            DB local gần như trống nên có thêm 12 ticket Demo trong bộ nhớ (ô Loại/Lỗi/Ngày không lọc Demo; Demo không mở
            được trang chi tiết).
          </span>
        </>
      )}
    </div>
  )
}
