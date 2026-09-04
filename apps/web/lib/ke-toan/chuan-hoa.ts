import { createHash } from 'node:crypto'

/**
 * Chuẩn hoá chuỗi cho khu Kế toán — port 1:1 từ tool Python cũ (engine.norm / nexia.sd / nexia._hard).
 * Giữ đúng hai biến thể vì luật & lịch sử được chuẩn hoá bằng hai hàm khác nhau:
 *   norm() → luật NCC/từ khoá (đ→d)      sd() → tên hàng/catalog (giữ đ)
 */
function boDauNFD(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '')
}

function gop(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

export function norm(s: unknown): string {
  const t = boDauNFD(String(s ?? '').toLowerCase()).replace(/đ/g, 'd').replace(/Đ/g, 'D')
  return gop(t)
}

export function sd(s: unknown): string {
  return gop(boDauNFD(String(s ?? '')).toLowerCase())
}

export function hard(s: unknown): string {
  return sd(s).replace(/[^a-z0-9]/g, '')
}

export function boNgoac(s: string): string {
  return s.replace(/\(.*?\)/g, '').trim()
}

export function boTuNgoac(s: string): string {
  return s.replace(/\([\s\S]*$/, '').trim()
}

/**
 * Khoá TỰ NHIÊN của 1 dòng hoá đơn — không kèm `lan`. Dùng riêng để ĐẾM số lần xuất hiện của
 * cùng 1 khoá tự nhiên trong file (xem `ganKhoaDong` ở `nhap/khoa-dong.ts`); không dùng thẳng
 * làm line_key vì file NEXIA thật có thể liệt kê CÙNG một dòng nhiều lần trong 1 hoá đơn (vd 1
 * món ăn gọi 4 lần) — 2 dòng như vậy có khoá tự nhiên giống hệt nhau.
 */
export function khoaTuNhien(
  direction: 'vao' | 'ra',
  kyHieu: string,
  soHd: string,
  tenHang: string,
  thanhTien: number,
): string {
  return [direction, kyHieu.trim(), soHd.trim(), sd(tenHang), String(Math.round(thanhTien))].join('|')
}

/**
 * line_key = sha1(khoá tự nhiên | lan). `lan` là số thứ tự xuất hiện (0, 1, 2…) của cùng khoá tự
 * nhiên trong file — LUÔN có mặt trong chuỗi băm, kể cả `lan = 0`, để 1 dòng đơn lẻ (lan mặc
 * định) và dòng đầu tiên của 1 nhóm trùng cho cùng 1 khoá (ổn định khi upload lại cùng file).
 */
export function khoaDong(
  direction: 'vao' | 'ra',
  kyHieu: string,
  soHd: string,
  tenHang: string,
  thanhTien: number,
  lan = 0,
): string {
  const chuoi = khoaTuNhien(direction, kyHieu, soHd, tenHang, thanhTien) + '|' + String(lan)
  return createHash('sha1').update(chuoi, 'utf8').digest('hex')
}
