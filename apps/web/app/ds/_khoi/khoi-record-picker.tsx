'use client'

import { useState, type ReactNode } from 'react'
import { OSuaKhach } from '@/components/ui/inline-edit'
import { recordPickerKhung } from '@/components/ui/inline-edit-styles'
import { menuContent } from '@/components/ui/menu-styles'
import { RecordPicker, type BanGhi } from '@/components/ui/record-picker'
import { cn } from '@/lib/utils'
import { BienThe, KhoiHang } from '../_khung/tam'

/**
 * Dữ liệu demo — tên giả trung tính, mã tự đặt, SĐT giả đưa ĐỦ vào để chứng minh component chỉ in •••4 số cuối.
 * Bốn dòng đầu bám preview RecordPicker (mã, loại, khu vực, máy · serial, số ticket mở) để cổng so khớp đo cùng cỡ chữ.
 */
export const KHACH_DEMO: BanGhi[] = [
  { ma: 'KH-01001', ten: 'Bùi Demo Tâm', loai: 'Cá nhân', khuVuc: 'Q.7', sdt: '0900 001 000', may: 'WH15A', phai: '1 ticket mở' },
  { ma: 'KH-01008', ten: 'Cao Demo Tuấn', loai: 'Cá nhân', khuVuc: 'Thủ Đức', sdt: '0900 003 731', may: 'WH15A', phai: 'không ticket mở' },
  { ma: 'KH-01015', ten: 'Công ty Demo Thành Đạt', loai: 'Doanh nghiệp', khuVuc: 'Bình Thạnh', sdt: '0900 006 462', may: 'CTD50 · D50-2304-0077', phai: '1 ticket mở' },
  { ma: 'KH-01022', ten: 'Công ty Demo Minh Phát', loai: 'Doanh nghiệp', khuVuc: 'Q.1', sdt: '0900 009 193', may: 'CTD50', phai: '1 ticket mở', luuY: true },
  { ma: 'KH-01029', ten: 'Công ty Demo An Phát', loai: 'Doanh nghiệp', khuVuc: 'Q.3', sdt: '0900 002 468', may: 'CTD50 · D50-2306-0192', phai: '2 ticket mở' },
  { ma: 'KH-01036', ten: 'Khách sạn Sen Vàng', loai: 'Doanh nghiệp', khuVuc: 'Thủ Đức', sdt: '0900 005 791', may: 'CTD50 · D50-2306-0101', phai: '1 ticket mở', luuY: true },
  { ma: 'KH-01043', ten: 'Đặng Demo Hà', loai: 'Cá nhân', khuVuc: 'Gò Vấp', sdt: '0900 005 502', may: 'WH15A · W15-2201-0003', phai: 'không ticket mở' },
  { ma: 'KH-01050', ten: 'Trường mầm non Demo Hoa Mai', loai: 'Doanh nghiệp', khuVuc: 'Bình Thạnh', sdt: '0900 007 315', may: 'CTD50', phai: 'không ticket mở' },
  { ma: 'KH-01057', ten: 'Nhà hàng Demo Biển Xanh', loai: 'Doanh nghiệp', khuVuc: 'Q.1', sdt: '0900 004 826', may: 'CTD50 · D50-2305-0044', phai: '1 ticket mở' },
  { ma: 'KH-01064', ten: 'Lê Demo An', loai: 'Cá nhân', khuVuc: 'Q.7', sdt: '0900 008 139', may: 'WH15A', phai: 'không ticket mở' },
]

const boQua = () => {}

/** Nhãn mục của preview (`.ds-nhan`, khung trình bày — không phải component): 12/16 500 muted, cách dưới 8. */
function Nhan({ children }: { children: ReactNode }) {
  return <p className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">{children}</p>
}

/** Mặt bảng chọn nằm tĩnh trên trang (preview vẽ `.b-noi` static): khung menu 400px, bỏ z của lớp menu. */
function MatTinh({ so, muc, value, chu }: { so: string; muc: BanGhi[]; value?: string; chu?: string }) {
  return (
    <div data-so={so} role="group" aria-label="Bảng chọn khách (mẫu)" className={cn(menuContent, recordPickerKhung, 'z-auto')}>
      <RecordPicker tinh muc={muc} value={value} onChon={boQua} onTaoMoi={boQua} defaultSearch={chu} />
    </div>
  )
}

/**
 * #record-picker — tái tạo ds/nguon/components/RecordPicker/preview.html: nhãn + bảng chọn khách cỡ thật 400px vẽ tĩnh,
 * 4 khách như preview. Khoá: ds/so-khop/recordpicker.json.
 */
export function KhoiRecordPicker() {
  return (
    <section id="record-picker" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#record-picker">RecordPicker</a>
      </h2>
      <div className="border-none border-current">
        <div className="mb-7 border-none border-current">
          <Nhan>Bảng chọn khách — cỡ thật 400px</Nhan>
          <MatTinh so="khung" muc={KHACH_DEMO.slice(0, 4)} />
        </div>
      </div>
    </section>
  )
}

/** Ô khách bấm được (demo): giữ khách đang chọn, "Tạo khách mới" chỉ báo lại chữ đang gõ. */
function OKhach() {
  const [kh, setKh] = useState<BanGhi | null>(KHACH_DEMO[5])
  const [tao, setTao] = useState('')
  return (
    <div className="flex flex-wrap items-center gap-4 border-none border-current">
      <OSuaKhach ma="TK-2611-045" value={kh} muc={KHACH_DEMO} onLuu={setKh} onTaoMoi={(q) => setTao(q)} />
      <span aria-live="polite" className="text-[12px] leading-[18px] text-muted-foreground">
        {tao && `Mở form tạo khách mới "${tao}" (demo)`}
      </span>
    </div>
  )
}

/** #record-picker dạng hàng (/ds): mở thật từ ô khách · mới mở · đang gõ · không thấy. */
export function KhoiRecordPickerHang() {
  return (
    <KhoiHang neo="record-picker">
      <BienThe
        ten="Mở từ ô khách"
        moTa="Bấm tên khách trong dòng để đổi khách. Gõ thử: an phat, KH-01022, 5502, thu duc. Enter chọn dòng đầu, Esc đóng."
      >
        <OKhach />
      </BienThe>
      <BienThe ten="Mới mở" moTa="Đếm số khách; mỗi dòng đủ để phân biệt: mã, loại, khu vực, đuôi số điện thoại, máy, số ticket mở. Khách đang chọn có dấu ✓.">
        <MatTinh so="hang-mo" muc={KHACH_DEMO} value="KH-01036" />
      </BienThe>
      <BienThe ten="Đang gõ" moTa="Gõ không dấu vẫn khớp; số khớp hiện ngay, Enter chọn dòng đầu. Chân luôn có nút tạo mới mang chữ đang gõ.">
        <MatTinh so="hang-go" muc={KHACH_DEMO} chu="an phat" />
      </BienThe>
      <BienThe ten="Không thấy" moTa="Nói rõ không có khách khớp; tạo khách mới ngay từ chữ đã gõ.">
        <MatTinh so="hang-rong" muc={KHACH_DEMO} chu="Demo Phú Quý" />
      </BienThe>
    </KhoiHang>
  )
}
