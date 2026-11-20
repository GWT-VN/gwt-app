'use client'

import { Suspense, useState } from 'react'
import { BoLocChon, OTimKiem } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { Button } from '@/components/ui/button'
import { CaiDatHienThi, CongCuXem, DataViewToolbar } from '@/components/ui/data-view-toolbar'
import type { CotBang } from '@/components/ui/use-cot-bang'
import type { DangXem } from '@/components/ui/data-view-styles'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { thongBao } from '@/components/ui/toast'
import { XemNhanh } from '@/components/ui/xem-nhanh'
import { cn } from '@/lib/utils'
import { BienThe, KhoiHang } from '../_khung/tam'
import { LOAI, Nhan } from './khoi-filter-bar'

/*
 * Dữ liệu demo (không PII) y preview DataViewToolbar: màn Ticket, 6 tab, 12 cột (4 cột ẩn sẵn → "Cột hiển thị 8").
 */
const TAB = [
  { v: 'mo', ten: 'Đang mở', so: 19 },
  { v: 'cua-toi', ten: 'Của tôi', so: 5 },
  { v: 'qua-han', ten: 'Quá hạn', so: 2, canhBao: true },
  { v: 'cho', ten: 'Đang chờ', so: 7 },
  { v: 'dong', ten: 'Đã đóng', so: 3 },
  { v: 'tat-ca', ten: 'Tất cả', so: 22 },
]
const COT: CotBang[] = [
  { id: 'uu', ten: 'Ưu tiên', kieu: 'sap', rong: 88, nghia: { tang: 'Gấp nhất trước', giam: 'Ít gấp nhất trước' } },
  { id: 'loai', ten: 'Loại lỗi', kieu: 'loc', rong: 140 },
  { id: 'ma', ten: 'Mã', kieu: 'sap', rong: 96, khoa: true, nghia: { tang: 'Cũ nhất trước', giam: 'Mới nhất trước' } },
  { id: 'khach', ten: 'Khách', kieu: 'loc', rong: 200 },
  { id: 'may', ten: 'Máy · serial', kieu: 'thuong', rong: 160 },
  { id: 'tt', ten: 'Trạng thái', kieu: 'loc', rong: 120 },
  { id: 'viec', ten: 'Việc tiếp theo', kieu: 'thuong', rong: 200 },
  { id: 'lam', ten: 'Người làm', kieu: 'loc', rong: 120 },
  { id: 'han', ten: 'Hạn', kieu: 'sap', rong: 100, nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' } },
  { id: 'chu', ten: 'Chủ', kieu: 'loc', rong: 120 },
  { id: 'mo', ten: 'Mở', kieu: 'sap', rong: 72, nghia: { tang: 'Mở ít ngày nhất trước', giam: 'Mở lâu nhất trước' } },
  { id: 'nguon', ten: 'Nguồn', kieu: 'loc', rong: 100 },
]
const AN = ['may', 'lam', 'mo', 'nguon']
const NHOM = [
  { giaTri: 'tt', nhan: 'Trạng thái' },
  { giaTri: 'chu', nhan: 'Chủ ticket' },
  { giaTri: 'loai', nhan: 'Loại lỗi' },
]
const VE = ['T-101', 'T-102', 'T-103', 'T-104', 'T-105']

/** State một màn demo: dạng xem, xem nhanh (mặc định tắt), cột ẩn, sắp, nhóm, tab. */
function useMan() {
  const [dangXem, onDoiXem] = useState<DangXem>('bang')
  const [xemNhanh, onXemNhanh] = useState(false)
  const [cotAn, onCotAn] = useState(AN)
  const [sapXep, onSapXep] = useState({ cot: 'uu', tang: true })
  const [nhom, setNhom] = useState('')
  const [tab, setTab] = useState('mo')
  const caiDat = (
    <CaiDatHienThi
      dangXem={dangXem}
      onDoiXem={onDoiXem}
      cot={COT}
      cotAn={cotAn}
      onCotAn={onCotAn}
      loc={{
        so: 0,
        noiDung: (
          <div className="px-2 py-1.5 border-none border-current">
            <Suspense>
              <BoLocChon param="loai" nhan="Loại lỗi" tuyChon={LOAI} />
            </Suspense>
          </div>
        ),
      }}
      sapXep={sapXep}
      onSapXep={onSapXep}
      nhom={{ tuyChon: NHOM, giaTri: nhom, onDoi: setNhom }}
      onSaoChepLink={() => thongBao.xong('Đã sao chép link view (demo — giữ bộ lọc, cột, sắp xếp)')}
      onLuuView={(chung) => thongBao.xong(chung ? 'Đã lưu view chung (demo)' : 'Đã lưu view “Của tôi” (demo)')}
      luuChung
      onXuatExcel={() => thongBao.xong('Đang xuất 19 ticket (demo)…')}
    />
  )
  return { congCu: { dangXem, onDoiXem, xemNhanh, onXemNhanh, caiDat }, tab, setTab }
}

function Day({ capTieuDe }: { capTieuDe?: 'h1' | 'h2' }) {
  const { congCu, tab, setTab } = useMan()
  return (
    <CauHinhBangDs>
      <DataViewToolbar
        tieuDe="Ticket"
        capTieuDe={capTieuDe}
        dem={{ thay: 19, tong: 22 }}
        timKiem={
          <Suspense>
            <OTimKiem placeholder="Tìm mã, khách, serial…" />
          </Suspense>
        }
        nutChinh={<Button>Tạo ticket</Button>}
        tabs={
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList variant="pill" aria-label="Nhóm ticket">
              {TAB.map((t) => (
                <TabsTrigger key={t.v} value={t.v}>
                  {t.ten} <TabsCount color={t.canhBao ? 'danger' : undefined}>{t.so}</TabsCount>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
        {...congCu}
      />
    </CauHinhBangDs>
  )
}

function CongCu() {
  const { congCu } = useMan()
  return (
    <CauHinhBangDs>
      <CongCuXem {...congCu} />
    </CauHinhBangDs>
  )
}

/** Bấm thử xem nhanh: bật nút thẻ xem nhanh rồi bấm một dòng → thẻ bên phải (↑↓ lướt, Esc đóng); tắt → "mở trang". */
function ThuXemNhanh() {
  const { congCu } = useMan()
  const [ma, setMa] = useState<string | null>(null)
  const i = ma ? VE.indexOf(ma) : -1
  return (
    <CauHinhBangDs>
      <div className="flex flex-col gap-3 border-none border-current">
        <div className="flex justify-end border-none border-current">
          <CongCuXem
            {...congCu}
            onXemNhanh={(b) => {
              congCu.onXemNhanh(b)
              if (!b) setMa(null)
            }}
          />
        </div>
        <XemNhanh
          className="h-[320px] overflow-hidden rounded-(--radius-xl) [box-shadow:var(--shadow-hairline)]"
          the={ma ? { ma, phu: 'Công ty Demo An Phát · dữ liệu demo' } : null}
          onDong={() => setMa(null)}
          onTruoc={i > 0 ? () => setMa(VE[i - 1]) : undefined}
          onSau={i >= 0 && i < VE.length - 1 ? () => setMa(VE[i + 1]) : undefined}
        >
          <ul className="m-0 list-none p-2 border-none border-current">
            {VE.map((v) => (
              <li key={v} className="border-none border-current">
                <button
                  type="button"
                  aria-current={v === ma || undefined}
                  onClick={() => (congCu.xemNhanh ? setMa(v) : thongBao.xong(`Mở trang ${v} (demo)`))}
                  className={cn(
                    'flex h-10 w-full items-center gap-3 rounded-(--radius-lg) px-3 text-left text-[14px] leading-[20px]',
                    'cursor-pointer border-none border-current bg-transparent hover:bg-(--alpha-05) aria-current:bg-(--alpha-05)',
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                  )}
                >
                  <span className="text-[12px] leading-[18px] text-(--color-text-tertiary) tabular-nums">{v}</span>
                  Công ty Demo An Phát
                </button>
              </li>
            ))}
          </ul>
        </XemNhanh>
      </div>
    </CauHinhBangDs>
  )
}

/**
 * #data-view-toolbar — tái tạo ds/nguon/components/DataViewToolbar/preview.html: (1) đầu trang + hàng tab + công cụ
 * trong khổ 1100 cuộn ngang; (2) cụm công cụ cỡ thật, đệm 0 0 36 56 như style inline của preview (chừa chỗ tooltip).
 * Hai menu tĩnh của preview (trang gốc + trang con "Cột hiển thị") ở đây mở bằng bấm ⚙ thật — cổng so khớp đo bằng `buoc`.
 */
export function KhoiDataViewToolbar() {
  return (
    <section id="data-view-toolbar" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#data-view-toolbar">DataViewToolbar</a>
      </h2>
      <div className="border-none border-current">
        <div data-so="muc-day" className="mb-7 border-none border-current">
          <Nhan>Đầu trang + hàng tab + thanh công cụ (khổ 1100px, cuộn ngang nếu ô hẹp)</Nhan>
          <div className="overflow-x-auto pb-1.5 border-none border-current">
            <div className="w-[1100px] border-none border-current">
              <Day capTieuDe="h2" />
            </div>
          </div>
        </div>
        <div data-so="muc-congcu" className="mb-7 border-none border-current">
          <Nhan>Thanh công cụ — cỡ thật (rê hoặc Tab vào nút để thấy chú thích)</Nhan>
          <div className="pt-0 pr-0 pb-9 pl-14 border-none border-current">
            <CongCu />
          </div>
        </div>
      </div>
    </section>
  )
}

/** #data-view-toolbar dạng hàng (/ds). */
export function KhoiDataViewToolbarHang() {
  return (
    <KhoiHang neo="data-view-toolbar">
      <BienThe
        ten="Đầu trang + tab + công cụ"
        moTa="Tiêu đề, số đang thấy, ô tìm, nút chính; hàng tab bên trái; bên phải là nút cài đặt, ba nút dạng xem, nút thẻ xem nhanh. Đổi dạng xem giữ nguyên tab đang chọn."
      >
        <Day capTieuDe="h2" />
      </BienThe>
      <BienThe
        ten="Cài đặt hiển thị"
        moTa="Bấm nút bánh răng: Bố cục, Cột hiển thị, Lọc, Sắp xếp, Nhóm theo — mỗi dòng mở trang con có nút ← quay lại. Sắp xếp chỉ có cột có thứ tự, mỗi lựa chọn nói nghĩa bằng lời. Điện thoại: hiện như tấm đáy."
      >
        <CongCu />
      </BienThe>
      <BienThe
        ten="Thẻ xem nhanh"
        moTa="Mặc định tắt: bấm dòng là mở trang. Bật nút thẻ xem nhanh rồi bấm dòng → thẻ bên phải, danh sách nhường chỗ; ↑ ↓ lướt, Esc đóng."
      >
        <ThuXemNhanh />
      </BienThe>
    </KhoiHang>
  )
}
