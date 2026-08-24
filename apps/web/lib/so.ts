/**
 * Đọc SỐ người dùng gõ — chấp CẢ dấu chấm và dấu phẩy thập phân.
 *
 * CEO hỏi 24/08/2026: *"Điền giá trị thập phân là 7.9 hay 7,9 (tốt nhất cả 2 đều được?
 * hoặc chỉ cho 1 và chặn cái còn lại)"*. Chốt: **cả hai**, vì bàn phím điện thoại tiếng
 * Việt mặc định ra dấu phẩy còn máy tính hay ra dấu chấm — bắt kỹ thuật nhớ đúng một
 * kiểu thì chắc chắn có ca gõ kiểu kia.
 *
 * Vì sao không để nguyên như cũ: `Number('7,9')` = `NaN`, mà cả hai màn ghi kết quả đo
 * đều đổi `NaN` thành `undefined` rồi lưu `null` — tức là **nuốt thầm số đo**. Kỹ thuật
 * gõ 7,9 xong thấy form đóng, tưởng đã lưu; mở lại thì ô trống, không một câu báo lỗi.
 * Nay gõ sai thì BÁO ra màn hình, không nuốt.
 *
 * Quy ước khi có CẢ hai dấu (`1.234,5` / `1,234.5`): dấu đứng SAU CÙNG là dấu thập phân,
 * dấu kia là phân cách nghìn. Chỉ có MỘT dấu thì luôn là dấu thập phân — mấy ô đang dùng
 * hàm này là chỉ tiêu nước (TDS · pH · độ cứng · Clo dư), không ai gõ phân cách nghìn ở đó.
 */

export type KetQuaDocSo =
  /** `so === undefined` = người dùng bỏ TRỐNG ô, hợp lệ. */
  | { ok: true; so: number | undefined }
  | { ok: false; loi: string }

/** Câu báo dùng chung — nói luôn kiểu gõ đúng thay vì chỉ chê sai. */
const loiCuPhap = (raw: string) => `“${raw}” không phải số — gõ kiểu 7.9 hoặc 7,9.`

export function docSo(raw: string | null | undefined): KetQuaDocSo {
  const t = (raw ?? '').trim()
  if (!t) return { ok: true, so: undefined }

  // Bỏ khoảng trắng BÊN TRONG ("1 234,5" — kiểu gõ tay hay gặp).
  const s = t.replace(/\s+/g, '')
  const viCham = s.lastIndexOf('.')
  const viPhay = s.lastIndexOf(',')

  let chuan: string
  if (viCham >= 0 && viPhay >= 0) {
    const thapPhan = viCham > viPhay ? '.' : ','
    const nghin = thapPhan === '.' ? ',' : '.'
    chuan = s.split(nghin).join('').replace(thapPhan, '.')
  } else {
    chuan = s.replace(',', '.')
  }

  // Chặn tại đây thay vì tin `Number()`: `Number('')`=0, `Number('0x1f')`=31,
  // `Number('1e5')`=100000 — không phải thứ ai gõ vào ô chỉ tiêu nước.
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(chuan)) return { ok: false, loi: loiCuPhap(t) }

  const n = Number(chuan)
  if (!Number.isFinite(n)) return { ok: false, loi: loiCuPhap(t) }
  return { ok: true, so: n }
}

/**
 * Đọc cả một bộ ô số. Trả lỗi ĐẦU TIÊN gặp phải — form chỉ có một dòng báo lỗi,
 * kể ra cả bốn ô sai cùng lúc thì dài mà cũng không giúp gõ lại nhanh hơn.
 */
export function docBoSo<K extends string>(
  o: Partial<Record<K, string>>
): { ok: true; so: Partial<Record<K, number>> } | { ok: false; loi: string } {
  const so: Partial<Record<K, number>> = {}
  for (const k of Object.keys(o) as K[]) {
    const r = docSo(o[k])
    if (!r.ok) return r
    if (r.so !== undefined) so[k] = r.so
  }
  return { ok: true, so }
}
