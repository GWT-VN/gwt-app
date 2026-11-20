import { boDau } from '@/bang/timkiem'

/** Chữ gõ khớp (không dấu, không phân biệt hoa thường) một trong các chuỗi. Ô trống = khớp hết. */
export function khop(q: string, ...chu: string[]): boolean {
  const s = boDau(q.trim())
  return !s || chu.some((c) => boDau(c).includes(s))
}

/**
 * Lọc mục lục /ds theo chữ gõ: trang theo tên + từ khoá (tên tiếng Anh như artifact: "colors", "spacing"…); nhóm
 * component khớp tên nhóm → giữ cả nhóm, không thì chỉ giữ component khớp tên; nhóm rỗng bị bỏ.
 */
export function locMucLuc<T extends { ten: string; tuKhoa?: string }, M extends { ten: string }, N extends { ten: string; muc: M[] }>(
  trang: T[],
  nhom: N[],
  q: string,
): { trang: T[]; nhom: N[] } {
  return {
    trang: trang.filter((t) => khop(q, t.ten, t.tuKhoa ?? '')),
    nhom: nhom
      .map((n) => (khop(q, n.ten) ? n : { ...n, muc: n.muc.filter((m) => khop(q, m.ten)) }))
      .filter((n) => n.muc.length > 0),
  }
}
