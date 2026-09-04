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

export function khoaDong(
  direction: 'vao' | 'ra',
  kyHieu: string,
  soHd: string,
  tenHang: string,
  thanhTien: number,
): string {
  const chuoi = [direction, kyHieu.trim(), soHd.trim(), sd(tenHang), String(Math.round(thanhTien))].join('|')
  return createHash('sha1').update(chuoi, 'utf8').digest('hex')
}
