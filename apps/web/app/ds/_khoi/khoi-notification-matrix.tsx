'use client'

import { useState } from 'react'
import {
  NotificationMatrix,
  type GiaTriMaTran,
  type KenhThongBao,
  type LoaiThongBao,
} from '@/components/ui/notification-matrix'
import { BienThe, KhoiHang } from '../_khung/tam'

/*
 * Demo dùng chung cho `KhoiNotificationMatrix` (/ds/tron, cổng so khớp) và `KhoiNotificationMatrixHang` (/ds) — dữ liệu
 * y preview (loại thông báo, tên kênh minh hoạ). Khối client: giữ giá trị ô. `data-so` = khoá so khớp.
 */

const KENH_DISCORD = ['#viec', '#cskh', '#sales', '#kho', '#quan-tri', '#chung'] as const

const KENH: KenhThongBao[] = [
  { id: 'app', ten: 'Trong app' },
  { id: 'rieng', ten: 'Discord · tin riêng' },
  { id: 'kenh', ten: 'Discord · kênh', luaChon: KENH_DISCORD },
]

const LOAI: LoaiThongBao[] = [
  { id: 'giao', khu: 'Việc', ten: 'Được giao việc', guiCho: 'Người được giao' },
  { id: 'han', khu: 'Việc', ten: 'Sắp tới hạn', guiCho: 'Người đang phải làm' },
  { id: 'quahan', khu: 'Việc', ten: 'Quá hạn', guiCho: 'Người làm và người giao' },
  { id: 'nhac', khu: 'Việc', ten: 'Được @nhắc', guiCho: 'Người được nhắc' },
  { id: 'xong', khu: 'Việc', ten: 'Việc mình giao / việc chặn mình đã xong', guiCho: 'Người giao, người đang chờ' },
  { id: 'gio', khu: 'Việc', ten: 'Nhắc việc theo giờ', guiCho: 'Người đặt nhắc' },
  { id: 'gap', khu: 'CSKH', ten: 'Ticket Gấp chưa ai nhận', guiCho: 'Cả khu CSKH' },
  { id: 'lau', khu: 'CSKH', ten: 'Ticket mở quá 7 ngày', guiCho: 'Chủ ticket' },
  { id: 'bot', khu: 'CSKH', ten: 'Bắp tạo ticket, chờ người nhận', guiCho: 'Cả khu CSKH' },
  { id: 'ho', khu: 'Sales', ten: 'Đơn HO mới', guiCho: 'Cả khu Sales' },
  { id: 'vtp', khu: 'Sales', ten: 'VTP giao đến / giao thành công', guiCho: 'Người tạo đơn' },
  { id: 'ctkm', khu: 'Sales', ten: 'CTKM chờ duyệt', guiCho: 'Người duyệt' },
  { id: 'kho', khu: 'Kho', ten: 'Kho sắp hết', guiCho: 'Cả khu Kho' },
  { id: 'nv', khu: 'Quản trị', ten: 'Nhân viên mới chờ duyệt', guiCho: 'Quản trị' },
  { id: 'tin', khu: 'Chung', ten: 'Tin tổng hợp 8h / 17h', guiCho: 'Mọi người' },
]

const b = (bat: boolean) => ({ bat })
const k = (bat: boolean, chon: string) => ({ bat, chon })
const GIA_TRI: GiaTriMaTran = {
  giao: { app: b(true), rieng: b(true) },
  han: { app: b(true), rieng: b(true) },
  quahan: { app: b(true), rieng: b(true), kenh: k(false, '#viec') },
  nhac: { app: b(true), rieng: b(true) },
  xong: { app: b(true), rieng: b(false) },
  gio: { app: b(true), rieng: b(true) },
  gap: { app: b(true), kenh: k(true, '#cskh') },
  lau: { app: b(true), rieng: b(false), kenh: k(true, '#cskh') },
  bot: { app: b(true), kenh: k(true, '#cskh') },
  ho: { app: b(true), kenh: k(true, '#sales') },
  vtp: { app: b(true), rieng: b(false), kenh: k(true, '#sales') },
  ctkm: { app: b(true), rieng: b(true) },
  kho: { app: b(true), kenh: k(true, '#kho') },
  nv: { app: b(true), rieng: b(true) },
  tin: { kenh: k(true, '#chung') },
}

function Demo({ loai = LOAI, loi = false }: { loai?: LoaiThongBao[]; loi?: boolean }) {
  const [gt, setGt] = useState(GIA_TRI)
  return (
    <NotificationMatrix
      loai={loai}
      kenh={KENH}
      giaTri={gt}
      onDoi={setGt}
      onLuu={loi ? () => new Promise((_, tuChoi) => setTimeout(() => tuChoi(new Error('demo')), 400)) : undefined}
    />
  )
}

/** #notification-matrix — tái tạo ds/nguon/components/NotificationMatrix/preview.html (khung rộng tối đa 1000). */
export function KhoiNotificationMatrix() {
  return (
    <section id="notification-matrix" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#notification-matrix">NotificationMatrix</a>
      </h2>
      <div className="max-w-[1000px] border-none border-current">
        <Demo />
      </div>
    </section>
  )
}

/** #notification-matrix dạng hàng cho /ds. */
export function KhoiNotificationMatrixHang() {
  return (
    <KhoiHang neo="notification-matrix">
      <BienThe
        ten="Bấm là lưu"
        moTa="Hàng là loại thông báo theo khu, cột là kênh nhận. Bấm ô là lưu ngay, dòng dưới bảng báo đã lưu gì. Bỏ tick kênh Discord thì ô chọn kênh tắt. Ô gạch ngang là không áp dụng."
      >
        <div className="max-w-[1000px] border-none border-current">
          <Demo />
        </div>
      </BienThe>
      <BienThe ten="Lưu lỗi" moTa="Mạng lỗi thì ô trả về như cũ và dòng dưới bảng báo chưa lưu được.">
        <div className="max-w-[1000px] border-none border-current">
          <Demo loai={LOAI.filter((l) => l.khu === 'CSKH')} loi />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
