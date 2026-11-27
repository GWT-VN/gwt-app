// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md
'use client'

import { createContext, useContext, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Alert, AlertActions, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'
import { EmptyState } from './empty-state'
import { Skeleton, VungDoc } from './skeleton'
import * as s from './table-styles'
import type { BenTha } from './use-cot-bang'

/**
 * Table — khung shadcn (`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`,
 * `TableCaption`; `Table` tự bọc `div[data-slot=table-container]` cuộn ngang như shadcn), giá
 * trị từ `.b-bang*` của ds/nguon/bundle.css (bảng Token trong README Table): header 36 dính đầu 12/18 muted kẻ alpha-08 ·
 * dòng 44 kẻ alpha-05, hover alpha-02, chọn info-soft · `layout="fixed"` = `.b-bang-c` (colgroup giữ đúng độ rộng đã kéo,
 * đệm ngang 6). Phần GWT thêm: `TableWrap` = khung tự cuộn HAI chiều (tiêu đề dính đầu trong khung), thanh cuộn ẩn
 * (`vien` = khung có viền `.ui-table-wrap`) — `Table` nằm trong `TableWrap` thì KHÔNG bọc thêm container (hai lớp cuộn
 * làm tiêu đề dính theo lớp trong, mất dính).
 * Không chép của shadcn: kẻ viền trên `tr` (DS kẻ trên ô, `border-separate` — tiêu đề dính giữ được vạch);
 * `pr-0`/`translate-y` cho ô có checkbox (ô chọn dòng dùng `cotChon` của DS).
 * Tiêu đề cột lọc/sắp + kéo đổi chỗ + co dãn: `TieuDeCot` / `KeoCot` (tieu-de-cot.tsx), trạng thái cột: `useCotBang`.
 * `variant="thuong"` = vẻ `.ui-table` (bảng thường: NotificationMatrix…) — con đọc qua context.
 * Ô chọn dòng: `KhungChon`/`OChonTatCa`/`OChonDong` của bang/ trong `CauHinhBangDs giaoDien={CHON_BANG}`.
 */

/** Trạng thái kéo cột (nội bộ Table ↔ TieuDeCot): cột đang kéo + vạch thả, để ô thân bảng vẽ theo suốt chiều cao. */
export const KeoCtx = createContext<{
  keo: string | null
  tren: { id: string; ben: BenTha } | null
  ketThuc: { current: number }
} | null>(null)

/** `data-keo` (cột nguồn mờ) / `data-tren` (vạch thả trái|phải) cho ô thuộc cột `cot`. */
export function useOKeo(cot?: string): { 'data-keo'?: ''; 'data-tren'?: BenTha } {
  const c = useContext(KeoCtx)
  if (!c?.keo || !cot) return {}
  if (c.keo === cot) return { 'data-keo': '' }
  return c.tren?.id === cot ? { 'data-tren': c.tren.ben } : {}
}

/** Đang nằm trong `TableWrap` → `Table` không bọc container riêng. */
const TrongKhung = createContext(false)

export function TableWrap({ vien, luoi, className, ...props }: ComponentProps<'div'> & { vien?: boolean; luoi?: boolean }) {
  return (
    <TrongKhung.Provider value>
      <div
        data-slot="table-wrap"
        data-luoi={luoi ? '' : undefined}
        className={cn(s.tableWrap, vien && s.tableWrapVien, luoi && s.tableWrapLuoi, className)}
        {...props}
      />
    </TrongKhung.Provider>
  )
}

/** Vẻ bảng: `du-lieu` = `.b-bang` (dạng xem Bảng, mặc định) · `thuong` = `.ui-table` (bảng thường của artifact). */
type VeBang = 'du-lieu' | 'thuong'
const VeCtx = createContext<VeBang>('du-lieu')

export function Table({
  layout = 'auto',
  variant = 'du-lieu',
  className,
  ...props
}: ComponentProps<'table'> & { layout?: 'auto' | 'fixed'; variant?: VeBang }) {
  const bang = (
    <table
      data-slot="table"
      data-layout={layout}
      data-variant={variant}
      className={cn(variant === 'thuong' ? s.tableThuong : s.table, layout === 'fixed' && s.tableFixed, className)}
      {...props}
    />
  )
  return (
    <VeCtx.Provider value={variant}>
      {useContext(TrongKhung) ? bang : <div data-slot="table-container" className={s.tableContainer}>{bang}</div>}
    </VeCtx.Provider>
  )
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('border-none border-current', className)} {...props} />
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('border-none border-current', className)} {...props} />
}

export function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return <tfoot data-slot="table-footer" className={cn('border-none border-current [&_td]:bg-muted', className)} {...props} />
}

/**
 * `chon` → `data-state="selected"`, nền info-soft (ô chọn là checkbox của dòng — trạng thái đọc qua nó, không aria-selected).
 * `conTro` → `data-con-tro`: dòng đang trỏ (phím tắt theo dòng áp vào nó), nền alpha-04; dòng focus phím có vòng ring lùi
 * vào. Roving `tabIndex` (0 cho dòng trỏ, −1 cho dòng khác) do màn đặt. `ContextMenuTrigger asChild` gắn
 * `data-state=open|closed` lên dòng → `chon` thắng (NGUON: trigger asChild đè `data-state`).
 */
export function TableRow({
  chon,
  conTro,
  className,
  'data-state': dataState,
  ...props
}: ComponentProps<'tr'> & { chon?: boolean; conTro?: boolean; 'data-state'?: string }) {
  return (
    <tr
      data-slot="table-row"
      data-con-tro={conTro ? '' : undefined}
      className={cn('border-none border-current', useContext(VeCtx) === 'thuong' ? s.trThuong : s.tr, className)}
      {...props}
      data-state={chon ? 'selected' : dataState}
    />
  )
}

/** `<th>` tĩnh (cột không menu, không kéo — vd ô chọn, cột đệm). Cột lọc/sắp/kéo được dùng `TieuDeCot`. */
export function TableHead({ phai, className, ...props }: ComponentProps<'th'> & { phai?: boolean }) {
  const ve = useContext(VeCtx)
  return <th data-slot="table-head" className={cn(ve === 'thuong' ? s.thThuong : s.th, phai && s.phai, className)} {...props} />
}

/**
 * `cot` = id cột → ô vẽ theo lúc kéo đổi chỗ (nền mờ cột nguồn, vạch thả suốt chiều cao). `phai` = số / hạn căn phải.
 * `ghim` = ô của cột ghim trái (`laGhim(cot, viTri)` — cùng điều kiện `TieuDeCot` dùng cho tiêu đề), xem `oGhim`.
 */
export function TableCell({
  cot,
  phai,
  ghim,
  className,
  ...props
}: ComponentProps<'td'> & { cot?: string; phai?: boolean; ghim?: boolean }) {
  const ve = useContext(VeCtx)
  return (
    <td
      data-slot="table-cell"
      data-cot={cot}
      data-ghim={ghim ? '' : undefined}
      {...useOKeo(cot)}
      className={cn(ve === 'thuong' ? s.tdThuong : cn(s.td, s.oKeo), phai && s.phai, ghim && s.oGhim, className)}
      {...props}
    />
  )
}

/** `TableCaption` (shadcn): chú thích dưới bảng, cách trên 16, chữ 14/20 muted (`caption-side: bottom` ở `table`). */
export function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return <caption data-slot="table-caption" className={cn(s.caption, className)} {...props} />
}

/**
 * BangTrangThai — 4 trạng thái bắt buộc của README Table; không `trangThai` → hiện `children` (bảng).
 * - `tai`: khung `aria-busy` + header thật (`cot`) + `soDong` dòng skeleton; câu `nhanTai` đọc qua `VungDoc` NGOÀI khung;
 * - `rongLoc`: gợi ý bỏ điều kiện (`moTa`) + "Xoá bộ lọc" (`onXoaLoc`);
 * - `rongThat`: nói cách tạo bản ghi đầu (`moTa`) + `hanhDong` (nút tạo, nếu có quyền);
 * - `loi`: Alert danger + "Thử lại" (`onThuLai`), GIỮ dữ liệu cũ (`children`) và nói rõ có thể đã cũ.
 */
export function BangTrangThai({
  trangThai,
  cot = [],
  soDong = 3,
  tieuDe,
  moTa,
  onXoaLoc,
  onThuLai,
  hanhDong,
  nhanTai = 'Đang tải danh sách',
  className,
  children,
}: {
  trangThai?: 'tai' | 'rongLoc' | 'rongThat' | 'loi'
  /** Cột header khi đang tải; `so` = cột số (skeleton căn phải). */
  cot?: { ten: string; so?: boolean }[]
  soDong?: number
  tieuDe?: ReactNode
  moTa?: ReactNode
  onXoaLoc?: () => void
  onThuLai?: () => void
  hanhDong?: ReactNode
  nhanTai?: string
  className?: string
  children?: ReactNode
}) {
  if (trangThai === 'tai')
    return (
      <>
        {/* Câu "Đang tải…" đọc ở vùng status NGOÀI khung busy — trình đọc hoãn mọi thay đổi trong vùng aria-busy. */}
        <VungDoc chu={nhanTai} />
        <TableWrap vien aria-busy="true" className={className}>
          <Table>
            <TableHeader>
              <TableRow>
                {cot.map((c) => (
                  <TableHead key={c.ten} phai={c.so}>
                    {c.ten}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody aria-hidden="true">
              {Array.from({ length: soDong }, (_, i) => (
                <TableRow key={i} className="hover:[&>td]:bg-transparent">
                  {cot.map((c) => (
                    <TableCell key={c.ten} phai={c.so}>
                      <Skeleton width={c.so ? '1/2' : (['2/3', '1/2', '3/4'] as const)[i % 3]} className={c.so ? 'ml-auto' : undefined} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </>
    )
  if (trangThai === 'rongLoc' || trangThai === 'rongThat')
    return (
      <TableWrap vien className={className}>
        <EmptyState
          kieu={trangThai === 'rongLoc' ? 'loc' : 'that'}
          tieuDe={tieuDe ?? (trangThai === 'rongLoc' ? 'Không có dòng nào khớp bộ lọc' : 'Chưa có dữ liệu')}
          moTa={moTa}
        >
          {trangThai === 'rongLoc'
            ? onXoaLoc && (
                <Button variant="outline" size="sm" onClick={onXoaLoc}>
                  Xoá bộ lọc
                </Button>
              )
            : hanhDong}
        </EmptyState>
      </TableWrap>
    )
  if (trangThai === 'loi')
    return (
      <div className={cn('flex flex-col gap-3 border-none border-current', className)}>
        <Alert color="danger">
          <AlertTitle>{tieuDe ?? 'Không tải được danh sách'}</AlertTitle>
          <AlertDescription>
            {moTa ?? 'Mất kết nối máy chủ.'}
            {children ? ' Dữ liệu đang hiển thị có thể đã cũ.' : null}
          </AlertDescription>
          {onThuLai && (
            <AlertActions>
              <Button variant="outline" size="sm" onClick={onThuLai}>
                Thử lại
              </Button>
            </AlertActions>
          )}
        </Alert>
        {children}
      </div>
    )
  return <>{children}</>
}
