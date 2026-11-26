import Link from 'next/link'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import type { ReactNode } from 'react'
import { linkTinDiscord, nhanTrangThai, tenKho } from '@/lib/kho/nhan'
import { TuLamMoi } from './_tu-lam-moi'
import { hienNgay } from '@/lib/dinh-dang-ngay'

/** Google Sheet theo dõi sổ kho NX (cùng dữ liệu) — đổi Sheet thì sửa ở gwt-discord-bot/admin/kho/nx-chay.mjs (SHEET_NX) VÀ ở đây. */
export const LINK_SHEET_KHO = 'https://docs.google.com/spreadsheets/d/1etncdbnKDQg2jIsJjc556pvT1HI0HTrKnMbNDeRr4d0'

export function KhungKho({ tieuDe, moTa, phai, children, kho = 'NX' }: { tieuDe: string; moTa?: ReactNode; phai?: ReactNode; children: ReactNode; kho?: string }) {
  return (
    <ManV2>
      <CauHinhBangDs>
        <TrangDuLieu className="max-w-[1200px] space-y-4">
          <PageHeader
            tieuDe={tieuDe}
            meta={[tenKho(kho), ...(moTa ? [moTa] : [])]}
            hanhDong={<Button asChild variant="outline"><a href={LINK_SHEET_KHO} target="_blank" rel="noreferrer">Mở Google Sheet ↗</a></Button>}
          />
          <div className="flex flex-wrap items-center gap-2">
            <TuLamMoi />
            {phai}
          </div>
          <Alert color="info">
            <AlertDescription>
              Bắp ghi sổ từ tin nhắn Discord kho và cập nhật khoảng mỗi 20 giây. Người có quyền Sửa sổ kho có thể sửa, huỷ dòng, duyệt mã và kiểm kê.
              Mọi thay đổi được ghi vào <Link href="/kho/lich-su-sua" className="underline">Lịch sử sửa</Link>.
            </AlertDescription>
          </Alert>
          {children}
        </TrangDuLieu>
      </CauHinhBangDs>
    </ManV2>
  )
}

export function TrangThai({ ma }: { ma: string | null | undefined }) {
  if (!ma) return null
  const color = ma === 'need_review' ? 'warning' : ma === 'rejected' ? 'secondary' : 'success'
  return <Badge variant="soft" color={color}>{nhanTrangThai(ma)}</Badge>
}

export function Bang({ dau, children, trong, phai = [] }: { dau: ReactNode[]; children: ReactNode; trong?: boolean; phai?: number[] }) {
  return (
    <TableWrap vien>
      {trong ? <EmptyState kieu="loc" capTieuDe={2} tieuDe="Chưa có dữ liệu." /> : (
        <Table variant="thuong">
          <TableHeader>
            <TableRow>{dau.map((d, i) => <TableHead key={i} scope="col" phai={phai.includes(i)}>{d}</TableHead>)}</TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      )}
    </TableWrap>
  )
}

export const O = ({ children, cls = '' }: { children?: ReactNode; cls?: string }) => <TableCell className={`align-top py-2 ${cls}`}>{children}</TableCell>

export function TheSo({ nhan, so, phu, mau = '' }: { nhan: string; so: number | string; phu?: ReactNode; mau?: string }) {
  return (
    <Card className="space-y-1">
      <div className="text-xs text-muted-foreground">{nhan}</div>
      <div className={`text-2xl font-semibold tabular-nums ${mau}`}>{so}</div>
      {phu && <div className="text-xs text-muted-foreground">{phu}</div>}
    </Card>
  )
}


export function LinkMa({ ma, kho = 'NX' }: { ma: string | null; kho?: string }) {
  if (!ma) return <span className="text-muted-foreground">—</span>
  return <Link href={`/kho/ma/${encodeURIComponent(ma)}${kho !== 'NX' ? `?kho=${kho}` : ''}`} className="font-mono text-[13px] text-(--color-text-info) hover:underline">{ma}</Link>
}

export function LinkTin({ id }: { id: string | null }) {
  const u = linkTinDiscord(id)
  return u ? <a href={u} target="_blank" rel="noreferrer" className="text-xs text-(--color-text-info) underline">tin ↗</a> : null
}

/** "sửa tay · <người> · <ngày>" — dòng đã sửa tay (app / Sheet), bot không ghi đè. */
export function NhanSuaTay({ luc, boi }: { luc: string | null; boi: string | null }) {
  if (!luc) return null
  const ten = (boi ?? '').split('@')[0] || '?'
  return <div className="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground" title={`Sửa tay bởi ${boi ?? '?'} lúc ${ngayVN(luc)} — bot không ghi đè dòng này`}>sửa tay · {ten} · {ngayVN(luc)}</div>
}

/** Số đẹp: 1.234; số âm có dấu. */
export const sl = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(n)

/**
 * Chứng từ kho GIỮ NĂM (không theo mặc định dd/MM của app): 2026-11-03 → 03/11/26; ISO có giờ → 03/11/26 14:30 (giờ VN).
 * `hienNgay` kiểu 'gio' — ngày thuần tự ra dạng ngắn.
 */
export const ngayVN = (x: string | null | undefined): string => hienNgay(x, 'gio')

/** Khi chưa đặt KHO_DB_URL / DB lỗi: báo rõ thay vì trang trắng. */
export function LoiKho({ loi }: { loi?: string }) {
  if (loi) console.error('[kho] Chưa đọc được sổ kho', loi)
  return (
    <Alert color="warning">
      <AlertTitle>Chưa đọc được sổ kho</AlertTitle>
      <AlertDescription>
        Thử tải lại trang sau ít phút. Trong lúc chờ, xem bảng theo dõi trên <a className="underline" href={LINK_SHEET_KHO} target="_blank" rel="noreferrer">Google Sheet</a>.
      </AlertDescription>
    </Alert>
  )
}


/** Gọi đọc kho; lỗi → trả {loi} để trang hiện LoiKho thay vì vỡ. */
export async function thu<T>(fn: () => Promise<T>): Promise<{ ok: true; v: T } | { ok: false; loi: string }> {
  try { return { ok: true, v: await fn() } } catch (e) { return { ok: false, loi: String((e as Error)?.message ?? e) } }
}

/** ?kho= hợp lệ (NX/HCM), mặc định NX. */
export const khoTu = (x?: string) => (x === 'HCM' ? 'HCM' : 'NX')
