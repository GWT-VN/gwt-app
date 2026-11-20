'use client'

import { Suspense, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { BoLocChon, hrefBoLoc, ThanhDangLoc } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { buttonVariants } from '@/components/ui/button-variants'
import { SavedView } from '@/components/ui/saved-view'
import { cn } from '@/lib/utils'
import { BienThe, KhoiHang } from '../_khung/tam'

/*
 * Dữ liệu demo dùng chung ba khối Task 6 (FilterBar, Pagination, BulkActionBar) — 19 ticket giả, không PII. Ba khối /ds
 * cùng đọc một bộ tham số URL (`loai`, `cot`/`chieu`, `trang`) như một màn danh sách thật: lọc ở FilterBar thì phân
 * trang + bảng chọn dòng cũng đổi theo.
 */
export const LOAI = [
  { giaTri: 'ro-ri', nhan: 'Rò rỉ nước' },
  { giaTri: 'bao-loi', nhan: 'Báo lỗi E1' },
  { giaTri: 'keu-to', nhan: 'Kêu to' },
]
export const TEN_COT = { han: 'Hạn', ma: 'Mã' }
export const NGHIA = { han: { asc: 'sớm nhất trước', desc: 'muộn nhất trước' } }
export const VE = Array.from({ length: 19 }, (_, i) => ({
  ma: `T-${101 + i}`,
  loai: i % 4 === 0 ? 'ro-ri' : i % 2 ? 'bao-loi' : 'keu-to',
  han: `2026-11-${String(21 + ((i * 7) % 9)).padStart(2, '0')}`,
}))
export const nhanLoai = (gt: string) => LOAI.find((l) => l.giaTri === gt)?.nhan ?? gt

/** "Máy chủ" giả: lọc + sắp (khoá phụ `ma`) + cắt trang từ tham số URL — y hàm liệt kê thật của bang/. */
export function docDemo(sp: URLSearchParams, moi = 10) {
  const loai = LOAI.some((l) => l.giaTri === sp.get('loai')) ? sp.get('loai')! : ''
  const sapHan = sp.get('cot') === 'han'
  const tang = sp.get('chieu') === 'asc'
  const rows = VE.filter((r) => !loai || r.loai === loai)
  if (sapHan) rows.sort((a, b) => (a.han === b.han ? (a.ma < b.ma ? -1 : 1) : (a.han < b.han ? -1 : 1) * (tang ? 1 : -1)))
  const tong = rows.length
  const soTrang = Math.max(1, Math.ceil(tong / moi))
  const trang = Math.min(soTrang, Math.max(1, Number(sp.get('trang')) || 1))
  return {
    loai,
    tong,
    trang,
    soTrang,
    trangRows: rows.slice((trang - 1) * moi, trang * moi),
    // Đang thứ tự mặc định (Mã tăng) → không truyền chip sắp xếp (README FilterBar: mặc định thì ẩn chip).
    sapXep: sapHan ? { cot: 'han', tang, macDinh: false } : undefined,
    thamSo: { loai: loai || undefined, cot: sapHan ? 'han' : undefined, chieu: sapHan ? (tang ? 'asc' : 'desc') : undefined },
  }
}

/** Nhãn mục của preview (`.ds-nhan`, khung trình bày — không phải component): 12/16 500 muted, cách dưới 8. */
export function Nhan({ children }: { children: ReactNode }) {
  return <p className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">{children}</p>
}

/** Nút "Lưu bộ lọc" (SavedView, Task 8) cho khe `phai` — demo: lưu xong chỉ báo toast, không ghi đâu. */
const boQua = () => {}
function LuuLoc({ dieuKien, query }: { dieuKien: { nhan: string; giaTri: string }[]; query: string }) {
  return <SavedView dieuKien={dieuKien} query={query} khu="CSKH" onLuu={boQua} />
}

/** Mẫu y preview: lọc "Loại lỗi: Rò rỉ nước" + sắp theo Hạn giảm dần, 5 ticket. */
function MauTinh() {
  const path = usePathname()
  return (
    <ThanhDangLoc
      phai={<LuuLoc dieuKien={[{ nhan: 'Loại lỗi', giaTri: 'Rò rỉ nước' }]} query="loai=ro-ri&cot=han&chieu=desc" />}
      dieuKien={[{ nhan: 'Loại lỗi', giaTri: 'Rò rỉ nước', href: hrefBoLoc(path, { loai: 'ro-ri', cot: 'han', chieu: 'desc' }, 'loai') }]}
      hienThi={5}
      tong={5}
      nhan="ticket"
      sapXep={{ cot: 'han', tang: false, macDinh: false }}
    />
  )
}

/** Bấm thử: ô lọc (Select DS qua khe OChon) + nút sắp theo hạn → URL đổi → hàng chip đọc lại. */
function ThuThat() {
  const sp = useSearchParams()
  const path = usePathname()
  const d = docDemo(sp)
  const tham = Object.fromEntries(sp)
  const sapHan = new URLSearchParams(sp)
  sapHan.set('cot', 'han')
  sapHan.set('chieu', sp.get('cot') === 'han' && sp.get('chieu') === 'desc' ? 'asc' : 'desc')
  sapHan.delete('trang')
  return (
    <div className="flex flex-col gap-3 border-none border-current">
      <div className="flex flex-wrap items-center gap-2 border-none border-current">
        <BoLocChon param="loai" nhan="Loại lỗi" tuyChon={LOAI} />
        <Link href={`${path}?${sapHan}`} scroll={false} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          {sp.get('cot') === 'han' ? 'Đảo chiều hạn' : 'Sắp theo hạn'}
        </Link>
      </div>
      <ThanhDangLoc
        phai={d.loai ? <LuuLoc dieuKien={[{ nhan: 'Loại lỗi', giaTri: nhanLoai(d.loai) }]} query={sp.toString()} /> : undefined}
        dieuKien={d.loai ? [{ nhan: 'Loại lỗi', giaTri: nhanLoai(d.loai), href: hrefBoLoc(path, tham, 'loai') }] : []}
        hienThi={d.trangRows.length}
        tong={d.tong}
        nhan="ticket"
        sapXep={d.sapXep}
      />
    </div>
  )
}

/**
 * #filter-bar — tái tạo ds/nguon/components/FilterBar/preview.html bằng `ThanhDangLoc` + `ChipSapXep` THẬT của bang/
 * với giao diện DS (`CauHinhBangDs`); nút "Lưu bộ lọc" = SavedView (Task 8) cắm vào khe `phai`.
 */
export function KhoiFilterBar() {
  return (
    <section id="filter-bar" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#filter-bar">FilterBar</a>
      </h2>
      <div className="max-w-[1100px] border-none border-current">
        <div className="mb-7 border-none border-current">
          <Nhan>Đang lọc &quot;Loại lỗi&quot; + sắp theo Hạn giảm dần — mỗi chip có × bỏ riêng</Nhan>
          <CauHinhBangDs tenCot={TEN_COT} nghiaSapXep={NGHIA}>
            <MauTinh />
          </CauHinhBangDs>
        </div>
      </div>
    </section>
  )
}

/** #filter-bar dạng hàng (/ds). */
export function KhoiFilterBarHang() {
  return (
    <KhoiHang neo="filter-bar">
      <CauHinhBangDs tenCot={TEN_COT} nghiaSapXep={NGHIA}>
        <BienThe ten="Đang lọc + sắp xếp" moTa="Mỗi điều kiện một chip, × bỏ riêng chip đó. Chip sắp xếp nói nghĩa bằng lời.">
          <MauTinh />
        </BienThe>
        <BienThe
          ten="Bấm thử"
          moTa="Chọn Loại lỗi, bấm Sắp theo hạn, rồi bấm × trên chip. Đổi lọc thì về trang 1 và bỏ chọn dòng ở bảng dưới."
        >
          <Suspense>
            <ThuThat />
          </Suspense>
        </BienThe>
        <BienThe ten="Chưa lọc gì" moTa="Chỉ còn số dòng. Màn nào muốn ẩn hẳn hàng thì tự ẩn.">
          <ThanhDangLoc dieuKien={[]} hienThi={10} tong={19} nhan="ticket" />
        </BienThe>
      </CauHinhBangDs>
    </KhoiHang>
  )
}
