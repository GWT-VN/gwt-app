/**
 * Kiểm tệp trước khi tải + hiện dung lượng — hàm THUẦN (không React, không 'use client'): FileUpload dùng ở client,
 * server action dùng lại để kiểm lần nữa trước khi ghi Storage.
 */

const MB = 1024 * 1024
const so1 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 })

/** "242 KB", "2,3 MB" — KB làm tròn, tối thiểu 1; MB một số lẻ dấu phẩy (vi-VN). */
export function kichThuocDoc(byte: number): string {
  return byte < MB ? `${Math.max(1, Math.round(byte / 1024))} KB` : `${so1.format(byte / MB)} MB`
}

/** Tên đọc được của từng mẫu `accept` (câu lỗi sai loại) — cả đuôi lẫn MIME đầy đủ. Mẫu lạ → `tenMau`. */
const TEN_LOAI: Record<string, string> = {
  'image/*': 'ảnh',
  'video/*': 'video',
  'audio/*': 'âm thanh',
  '.pdf': 'PDF',
  'application/pdf': 'PDF',
  '.xlsx': 'Excel',
  '.xls': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-excel': 'Excel',
  '.csv': 'CSV',
  'text/csv': 'CSV',
  '.docx': 'Word',
  '.doc': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/msword': 'Word',
  '.pptx': 'PowerPoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  '.zip': 'ZIP',
  'application/zip': 'ZIP',
}

/** Mẫu ngoài bảng: `.duoi` → DUOI; MIME → phần sau dấu gạch chéo bỏ tiền tố x-/vnd., viết hoa (`image/png` → "ảnh PNG"). */
function tenMau(m: string) {
  if (TEN_LOAI[m]) return TEN_LOAI[m]
  if (!m.includes('/')) return m.replace(/^\./, '').toUpperCase()
  const [loai, phu] = m.split('/')
  const ten = phu.replace(/^(x-|vnd\.)/, '').toUpperCase()
  const nhom = TEN_LOAI[`${loai}/*`]
  return nhom ? `${nhom} ${ten}` : ten
}

/** Một mẫu `accept` khớp tệp? `.duoi` theo tên (không phân biệt hoa thường), `loai/*` theo đầu MIME, còn lại MIME đúng. */
function khopMau(tep: File, mau: string) {
  if (mau.startsWith('.')) return tep.name.toLowerCase().endsWith(mau)
  if (mau.endsWith('/*')) return tep.type.toLowerCase().startsWith(mau.slice(0, -1))
  return tep.type.toLowerCase() === mau
}

/**
 * Kiểm một tệp trước khi tải. Loại trước dung lượng (tệp sai loại thì nén lại cũng vô ích).
 * Trả câu lỗi nói cách sửa ("Quá 10 MB — nén lại hoặc chọn tệp khác", "Chỉ nhận ảnh, PDF, Excel, Word"), hợp lệ → null.
 */
export function kiemTep(tep: File, { accept, toiDaMB }: { accept?: string; toiDaMB: number }): string | null {
  const mau = (accept ?? '').split(',').map((m) => m.trim().toLowerCase()).filter(Boolean)
  if (mau.length && !mau.some((m) => khopMau(tep, m)))
    return `Chỉ nhận ${[...new Set(mau.map(tenMau))].join(', ')}`
  if (tep.size > toiDaMB * MB) return `Quá ${toiDaMB} MB — nén lại hoặc chọn tệp khác`
  return null
}
