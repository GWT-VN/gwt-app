'use client'

import { createContext, useContext, type ComponentType, type ReactElement, type ReactNode } from 'react'
import { GIAO_DIEN_MAC_DINH, type GiaoDienBang } from './giaoDien'

/**
 * Cấu hình dùng chung cho cả bộ bảng: giao diện + cách gọi tên cột.
 *
 * Vì sao cần: nhãn cột và nghĩa của từng chiều sắp xếp là chuyện CỦA TỪNG DỰ ÁN
 * (dự án này gọi "Hạn thay lõi", dự án khác gọi "Ngày hết hạn"). Nhét chúng vào
 * component là mỗi lần tái sử dụng lại phải sửa trong lõi.
 *
 * KHÔNG bắt buộc bọc: không có <CauHinhBang> thì rơi về mặc định, chạy bình
 * thường, chỉ là chip sắp xếp nói chung chung "tăng dần/giảm dần".
 */

export type NghiaChieu = { asc: string; desc: string }

/**
 * Ô chọn thay cho `<select>` của BoLocChon / LocNgay — bộ giao diện (vd DS) bơm vào qua `OChon`. Giá trị '' = "không
 * lọc" (mục `nhanTatCa`); không có `nhanTatCa` thì không có mục đó (chế độ của LocNgay luôn có giá trị).
 */
export type PropsOChon = {
  value: string
  onValueChange: (v: string) => void
  muc: { giaTri: string; nhan: string }[]
  nhanTatCa?: string
  'aria-label': string
}

/**
 * Biểu tượng thay chữ trơn. Thiếu khoá nào thì dùng chữ cũ của khoá đó (×, ↑/↓, ← Trước / Sau →, "Bỏ chọn").
 * Có icon thì nút chỉ còn icon + `aria-label` (tên đọc giữ nguyên nghĩa).
 */
export type BieuTuong = Partial<Record<'boLoc' | 'boChon' | 'len' | 'xuong' | 'truoc' | 'sau', ReactNode>>

/** Gợi ý khi rê / focus nút icon (tooltip). `noiDung` là mô tả THÊM, không lặp tên nút. */
export type PropsGoiY = { noiDung: string; children: ReactElement }

export type CauHinh = {
  giaoDien: GiaoDienBang
  /** Tên cột hiện cho người dùng: { install_date: 'Ngày lắp' } */
  tenCot: Record<string, string>
  /** Nghĩa từng chiều: { install_date: { asc: 'lắp lâu nhất trước', desc: '…' } } */
  nghiaSapXep: Record<string, NghiaChieu>
  /** Không bơm → `<select>` gốc (màn cũ không đổi). */
  OChon?: ComponentType<PropsOChon>
  bieuTuong: BieuTuong
  GoiY?: ComponentType<PropsGoiY>
  /** Esc (ngoài ô gõ / menu / hộp đang mở) bỏ HẾT lựa chọn dòng. Mặc định tắt — màn cũ không đổi. */
  escBoChon: boolean
}

const MAC_DINH: CauHinh = {
  giaoDien: GIAO_DIEN_MAC_DINH,
  tenCot: {},
  nghiaSapXep: {},
  bieuTuong: {},
  escBoChon: false,
}

const Ctx = createContext<CauHinh>(MAC_DINH)

export function CauHinhBang({
  giaoDien,
  tenCot,
  nghiaSapXep,
  OChon,
  bieuTuong,
  GoiY,
  escBoChon,
  children,
}: Partial<CauHinh> & { children: ReactNode }) {
  return (
    <Ctx.Provider
      value={{
        // Gộp chứ không thay thế: chỉ muốn đổi 2 lớp CSS thì truyền 2 khoá,
        // không phải chép lại cả bảng giao diện.
        giaoDien: { ...GIAO_DIEN_MAC_DINH, ...giaoDien },
        tenCot: tenCot ?? {},
        nghiaSapXep: nghiaSapXep ?? {},
        OChon,
        bieuTuong: bieuTuong ?? {},
        GoiY,
        escBoChon: escBoChon ?? false,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useCauHinh(): CauHinh {
  return useContext(Ctx)
}

/** Lớp CSS — dùng trong mọi component của bộ bảng. */
export function useGiaoDien(): GiaoDienBang {
  return useContext(Ctx).giaoDien
}

/** Nhãn cột; không khai báo thì trả về chính tên cột trong DB. */
export function useTenCot(cot: string, duPhong?: string): string {
  return useContext(Ctx).tenCot[cot] ?? duPhong ?? cot
}

/** Bọc nút trong GoiY (tooltip) nếu bộ giao diện có bơm; không thì trả nguyên nút. */
export function BocGoiY({ noiDung, children }: PropsGoiY) {
  const { GoiY } = useContext(Ctx)
  return GoiY ? <GoiY noiDung={noiDung}>{children}</GoiY> : children
}
