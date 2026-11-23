'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { KhungChon, OChonDong, OChonTatCa, PhanTrang, ThanhDaChon, TieuDeCotSapXep, useDaChon, type ThamSoLoc } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { GIAO_DIEN_DS } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { oTick } from '@/components/ui/table-styles'
import { cn } from '@/lib/utils'
import { BienThe, KhoiHang } from '../_khung/tam'
import { docDemo, NGHIA, Nhan, nhanLoai, TEN_COT, VE } from './khoi-filter-bar'

const TRANG_THAI = ['Mới', 'Đang xử lý', 'Chờ khách', 'Đã xong']
const NGUOI = ['NV Demo An', 'NV Demo Bình']

/** Thao tác hàng loạt (demo — không ghi gì): Button DS ghost sm, menu bật lên trên. Kết quả báo qua `bao`. */
function ThaoTac({ bao }: { bao: (chu: string) => void }) {
  const { soDong } = useDaChon()
  const menu = (nut: string, muc: string[], cau: (x: string) => string) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {nut}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start">
        {muc.map((x) => (
          <DropdownMenuItem key={x} onSelect={() => bao(cau(x))}>
            {x}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
  return (
    <>
      {menu('Đổi trạng thái', TRANG_THAI, (x) => `Đã đổi ${soDong} ticket sang “${x}” (demo — chưa ghi gì).`)}
      {menu('Gán chủ', NGUOI, (x) => `Đã gán ${soDong} ticket cho ${x} (demo — chưa ghi gì).`)}
      <Button variant="ghost" size="sm" onClick={() => bao(`Đang xuất ${soDong} ticket ra Excel (demo — chưa ghi gì).`)}>
        Xuất Excel
      </Button>
    </>
  )
}

// Khối trần (/ds/tron, so khớp): thanh đứng TĨNH trong dòng như preview (preview ép style position static…).
const THANH_TINH = cn(GIAO_DIEN_DS.chon_thanh, 'static inline-flex translate-x-0 max-w-none transition-none')
const CAN_O_CHON = {
  chon_oTh: cn(GIAO_DIEN_DS.chon_oTh, oTick),
  chon_oTd: cn(GIAO_DIEN_DS.chon_oTd, oTick),
}
const TAT_CA = VE.map((r) => r.ma)
const layHet = async () => TAT_CA

/** Một trạng thái mẫu: chỉ hàng tiêu đề có ô "chọn hết trang" (`khoa` = khoá của trang đó) + thanh. */
function Mau({ so, nhan, khoa, tieuDe }: { so: string; nhan: string; khoa: string[]; tieuDe: string }) {
  return (
    <div data-so={so} className="mb-7 border-none border-current">
      <Nhan>{nhan}</Nhan>
      <KhungChon khoaTrang={khoa} tong={TAT_CA.length} bat thamSo={{}} layTatCaKhoa={layHet}>
        <table className="border-separate border-spacing-0">
          <thead>
            <tr>
              <OChonTatCa nhan="ticket" />
              <th className={GIAO_DIEN_DS.tieuDe_o}>{tieuDe}</th>
            </tr>
          </thead>
        </table>
        <ThanhDaChon nhan="ticket">
          <ThaoTac bao={() => {}} />
        </ThanhDaChon>
      </KhungChon>
    </div>
  )
}

/**
 * #bulk-action-bar — tái tạo ds/nguon/components/BulkActionBar/preview.html bằng `KhungChon` + `OChonTatCa` +
 * `ThanhDaChon` THẬT của bang/ (giao diện DS qua `CauHinhBangDs`). Thanh chỉ hiện khi đã chọn ≥ 1 dòng → hai mẫu cần bấm
 * thật: (a) chọn hết trang 1 (15/19) → mời "Chọn tất cả 19…"; (b) trang 2 (4 dòng): chọn hết trang rồi bấm mời → 19,
 * "(gồm cả dòng ở trang khác)". Cổng so khớp bấm bằng `buoc` (ds/so-khop/bulkactionbar.json).
 */
export function KhoiBulkActionBar() {
  return (
    <section id="bulk-action-bar" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#bulk-action-bar">BulkActionBar</a>
      </h2>
      <div className="flex flex-col items-start gap-2 border-none border-current">
        <CauHinhBangDs giaoDien={{ ...CAN_O_CHON, chon_thanh: THANH_TINH }}>
          <Mau
            so="a"
            nhan='Bấm ô đầu cột: chọn hết trang 1 — mời "Chọn tất cả 19 ticket khớp bộ lọc"'
            khoa={TAT_CA.slice(0, 15)}
            tieuDe="Trang 1 (15 ticket)"
          />
          <Mau
            so="b"
            nhan='Trang 2: chọn hết trang rồi bấm "Chọn tất cả 19…" — nói rõ "(gồm cả dòng ở trang khác)"'
            khoa={TAT_CA.slice(15)}
            tieuDe="Trang 2 (4 ticket)"
          />
        </CauHinhBangDs>
      </div>
    </section>
  )
}

const td = 'h-(--control-size-xl) px-(--control-gutter-md) border-b border-(--border) whitespace-nowrap'

/** Bấm thử: bảng 10 dòng/trang cùng tham số URL với FilterBar/Pagination; thanh nổi THẬT ở đáy màn. */
function BangThu() {
  const sp = useSearchParams()
  const d = docDemo(sp)
  const [ketQua, setKetQua] = useState('')
  const layTatCa = async (t: ThamSoLoc) =>
    docDemo(new URLSearchParams(Object.entries(t).filter((e): e is [string, string] => !!e[1])), 1000).trangRows.map((r) => r.ma)
  return (
    <KhungChon khoaTrang={d.trangRows.map((r) => r.ma)} tong={d.tong} bat thamSo={d.thamSo} layTatCaKhoa={layTatCa}>
      <div className="overflow-x-auto rounded-(--radius-xl) border border-(--border)">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <OChonTatCa nhan="ticket" />
              <th className={GIAO_DIEN_DS.tieuDe_o}>{TEN_COT.ma}</th>
              <th className={GIAO_DIEN_DS.tieuDe_o}>Loại lỗi</th>
              <TieuDeCotSapXep cot="han" nhan={TEN_COT.han} chieuMacDinh="desc" />
            </tr>
          </thead>
          <tbody>
            {d.trangRows.map((r) => (
              <tr key={r.ma}>
                <OChonDong khoa={r.ma} moTa={`ticket ${r.ma}`} />
                <td className={cn(td, 'tabular-nums')}>{r.ma}</td>
                <td className={td}>{nhanLoai(r.loai)}</td>
                <td className={cn(td, 'tabular-nums')}>{r.han.split('-').reverse().join('/')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PhanTrang trang={d.trang} soTrang={d.soTrang} tong={d.tong} moiTrang={10} nhan="ticket" />
      <ThanhDaChon nhan="ticket">
        <ThaoTac bao={setKetQua} />
      </ThanhDaChon>
      <p aria-live="polite" className="m-0 min-h-[18px] text-[12px] leading-[18px] text-muted-foreground">
        {ketQua}
      </p>
    </KhungChon>
  )
}

/** #bulk-action-bar dạng hàng (/ds). */
export function KhoiBulkActionBarHang() {
  return (
    <KhoiHang neo="bulk-action-bar">
      <CauHinhBangDs giaoDien={CAN_O_CHON} tenCot={TEN_COT} nghiaSapXep={NGHIA}>
        <BienThe
          ten="Bấm thử"
          moTa="Tick ô đầu cột: chọn hết trang → thanh nổi ở đáy màn mời chọn cả 19. Sang trang 2 thanh vẫn nói “gồm cả dòng ở trang khác”. Esc hoặc ✕ bỏ hết; đổi lọc ở FilterBar cũng bỏ hết."
        >
          <Suspense>
            <BangThu />
          </Suspense>
        </BienThe>
      </CauHinhBangDs>
    </KhoiHang>
  )
}
