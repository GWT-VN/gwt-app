// File cho CHUYÊN GIA DUYỆT PHƯƠNG ÁN XỬ LÝ (chị Trang 18/11): "Hướng xử lý đề xuất" trên ticket chỉ hiện sau khi
// chuyên gia duyệt. Vòng: Xuất → chuyên gia đánh x / bỏ, sửa phương án, ghi ý kiến → "Nhập phương án đã duyệt".
// File có thể ra ngoài công ty: không có tên / SĐT khách; nội dung tự do che SĐT + email.
import * as XLSX from 'xlsx'
import { boDau } from '../../bang/timkiem'
import type { LoiDanhMuc, TrangThaiDong } from './kieu'

export type DongTicketXuat = {
  ticket_code: string; loi_code: string; internal_code: string | null; trang_thai: TrangThaiDong
  mo_ta: string | null; huong_xu_ly: string | null; huong_xu_ly_nguon: 'danh_muc' | 'cs' | null
  lan: { lan: number; mo_ta: string | null; xu_ly: string | null }[]
}
export type DuLieuChuyenGia = {
  danhMuc: LoiDanhMuc[]
  nhom: { code: string; ten: string }[]
  dongTicket: DongTicketXuat[]
  ngayXuat: string
}

export const TRANG_PA = 'Phương án xử lý'
export const COT_PA = [
  'Mã lỗi', 'Nhóm', 'Tên lỗi', 'Dấu hiệu', 'Số ticket', 'Ví dụ khách báo', 'CS đã xử lý thực tế',
  'Phương án đề xuất', 'Đang hiện trên ticket', 'Chuyên gia duyệt', 'Phương án chuyên gia sửa', 'Ý kiến chuyên gia',
] as const

const SO_VI_DU = 3
const TT_DONG: Record<TrangThaiDong, string> = { dang_xu_ly: 'Đang xử lý', da_xu_ly: 'Đã xử lý', khong_loi: 'Không phải lỗi' }

/** Che SĐT Việt Nam (liền / có cách / chấm / +84) và email trong văn bản tự do. Không đụng serial, số tiền, ngày. */
export function cheThongTin(s: string | null | undefined): string {
  return (s ?? '')
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]')
    .replace(/(?<![\w])(?:\+84|84|0)(?:[\s.-]?\d){8,10}(?![\w])/g, '[SĐT]')
}

const gon = (s: string | null | undefined, n = 400) => {
  const t = cheThongTin(s).replace(/\s+/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n)}…` : t
}
const lanRa = (l: DongTicketXuat['lan']) =>
  l.map((x) => `Lần ${x.lan}: ${gon(x.mo_ta, 200) || '—'}${x.xu_ly ? ` → ${gon(x.xu_ly, 200)}` : ''}`).join('\n')

const HUONG_DAN: string[][] = [
  ['Duyệt phương án xử lý lỗi — GWT'],
  [''],
  ['"Hướng xử lý đề xuất" chỉ hiện cho CS trên ticket SAU KHI được duyệt trong file này.'],
  [''],
  ['Trang "Phương án xử lý" — mỗi dòng một loại lỗi. Chuyên gia điền 3 cột cuối:'],
  ['• "Chuyên gia duyệt": x = duyệt (hiện cho CS) · bỏ = không dùng (thôi hiện) · để trống = chưa xem, giữ nguyên.'],
  ['• "Phương án chuyên gia sửa": viết lại phương án nếu cần (kèm x). Để trống = duyệt đúng "Phương án đề xuất".'],
  ['• "Ý kiến chuyên gia": nhận xét, lý do bỏ…'],
  ['• Không sửa cột "Mã lỗi". Các cột còn lại (dấu hiệu, ví dụ khách báo, CS đã xử lý thực tế…) để tham khảo.'],
  [''],
  ['Trang "Ticket tham khảo": từng ticket thật — khách báo gì, các lần lỗi, CS đã xử lý thế nào.'],
  [''],
  ['Xong: gửi file cho quản lý CSKH → app GWT › CSKH › Ticket & lỗi › Danh mục lỗi › "Nhập phương án đã duyệt" (xem trước rồi mới ghi).'],
  ['Nội dung ticket đã che SĐT / email, không có tên khách.'],
]

/** Tạo file .xlsx (Buffer): Hướng dẫn · Phương án xử lý · Ticket tham khảo. */
export function taoFileChuyenGia(d: DuLieuChuyenGia): Buffer {
  const tenNhom = new Map(d.nhom.map((n) => [n.code, n.ten]))
  const theoMa = new Map<string, DongTicketXuat[]>()
  for (const t of d.dongTicket) theoMa.set(t.loi_code, [...(theoMa.get(t.loi_code) ?? []), t])

  const pa = d.danhMuc.filter((l) => l.trang_thai !== 'ngung').map((l) => {
    const ds = theoMa.get(l.code) ?? []
    const thucTe = [...new Set(ds.flatMap((t) => [
      ...(t.huong_xu_ly_nguon === 'cs' && t.huong_xu_ly?.trim() ? [`${t.ticket_code}: ${gon(t.huong_xu_ly, 250)}`] : []),
      ...t.lan.filter((x) => x.xu_ly?.trim()).map((x) => `${t.ticket_code} lần ${x.lan}: ${gon(x.xu_ly, 200)}`),
    ]))]
    const dong: Record<(typeof COT_PA)[number], string | number> = {
      'Mã lỗi': l.code,
      'Nhóm': l.nhom ? tenNhom.get(l.nhom) ?? l.nhom : '',
      'Tên lỗi': l.ten,
      'Dấu hiệu': l.dau_hieu ?? '',
      'Số ticket': ds.length,
      'Ví dụ khách báo': ds.slice(0, SO_VI_DU).map((t) => `${t.ticket_code}: ${gon(t.mo_ta, 200)}`).join('\n'),
      'CS đã xử lý thực tế': thucTe.slice(0, 6).join('\n'),
      'Phương án đề xuất': l.huong_xu_ly ?? '',
      'Đang hiện trên ticket': l.huong_duyet ? 'Có' : l.huong_xu_ly?.trim() ? 'Chưa — chờ duyệt' : 'Chưa có phương án',
      'Chuyên gia duyệt': '',
      'Phương án chuyên gia sửa': '',
      'Ý kiến chuyên gia': '',
    }
    return dong
  })

  const ticket = d.dongTicket.map((t) => ({
    'Mã ticket': t.ticket_code,
    'Mã lỗi': t.loi_code,
    'Máy': t.internal_code ?? '',
    'Trạng thái': TT_DONG[t.trang_thai] ?? t.trang_thai,
    'Khách báo': gon(t.mo_ta),
    'Các lần lỗi': lanRa(t.lan),
    'Hướng xử lý CS đã ghi': gon(t.huong_xu_ly),
  }))

  const wb = XLSX.utils.book_new()
  const hd = XLSX.utils.aoa_to_sheet([...HUONG_DAN, [''], [`Xuất ngày ${d.ngayXuat} · ${pa.length} loại lỗi · ${d.dongTicket.length} dòng ticket`]])
  hd['!cols'] = [{ wch: 140 }]
  XLSX.utils.book_append_sheet(wb, hd, 'Hướng dẫn')

  const ws = XLSX.utils.json_to_sheet(pa, { header: [...COT_PA] })
  ws['!cols'] = COT_PA.map((c) => ({ wch: /Phương án|Ví dụ|thực tế|Ý kiến|Dấu hiệu/.test(c) ? 50 : /Tên lỗi/.test(c) ? 30 : 16 }))
  XLSX.utils.book_append_sheet(wb, ws, TRANG_PA)

  const cotT = ['Mã ticket', 'Mã lỗi', 'Máy', 'Trạng thái', 'Khách báo', 'Các lần lỗi', 'Hướng xử lý CS đã ghi']
  const wt = XLSX.utils.json_to_sheet(ticket, { header: cotT })
  wt['!cols'] = cotT.map((c) => ({ wch: /Khách báo|Các lần|Hướng/.test(c) ? 55 : 16 }))
  XLSX.utils.book_append_sheet(wb, wt, 'Ticket tham khảo')

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

// ───────────────────────── Nhập file chuyên gia đã duyệt ─────────────────────────

export type KetQuaDocDuyet = {
  duyet: { code: string; huong_xu_ly: string; y_kien: string | null }[]
  boDuyet: { code: string; y_kien: string | null }[]
  loi: { dong: number; loi: string }[]
  chuaDanhDau: number
}

const o = (r: Record<string, unknown>, k: string) => String(r[k] ?? '').trim()

function yKienDuyet(s: string): 'duyet' | 'bo' | 'trong' | 'la' {
  const k = boDau(s).toLowerCase().replace(/\s+/g, ' ').trim()
  if (!k) return 'trong'
  if (['x', 'ok', 'co', 'duyet', 'da duyet', 'dong y', '1', 'true'].includes(k)) return 'duyet'
  if (['bo', 'khong', 'ko', 'k', 'sai', 'khong duyet', 'loai', '0', 'false'].includes(k)) return 'bo'
  return 'la'
}

/**
 * Đọc trang "Phương án xử lý" chuyên gia gửi lại. `coSan`: mã lỗi trong DB → phương án hiện tại.
 * x → duyệt (bản chuyên gia sửa nếu có, không thì "Phương án đề xuất" trong file); bỏ → thôi hiện; trống → không đổi.
 */
export function docFileDuyet(
  rows: Record<string, unknown>[],
  coSan: ReadonlyMap<string, { huong_xu_ly: string | null; huong_duyet?: boolean }>,
): KetQuaDocDuyet {
  const kq: KetQuaDocDuyet = { duyet: [], boDuyet: [], loi: [], chuaDanhDau: 0 }
  const daGap = new Set<string>()
  rows.forEach((r, i) => {
    const dong = i + 2
    const code = o(r, 'Mã lỗi').toUpperCase()
    if (!code) return
    const y = yKienDuyet(o(r, 'Chuyên gia duyệt'))
    const sua = o(r, 'Phương án chuyên gia sửa').replace(/[ \t]+/g, ' ')
    const yKien = o(r, 'Ý kiến chuyên gia') || null
    if (!coSan.has(code)) { kq.loi.push({ dong, loi: `Mã "${code}" không có trong danh mục lỗi.` }); return }
    if (daGap.has(code)) { kq.loi.push({ dong, loi: `${code}: trùng dòng.` }); return }
    daGap.add(code)
    if (y === 'la') { kq.loi.push({ dong, loi: `${code}: cột "Chuyên gia duyệt" chỉ nhận x / bỏ / để trống.` }); return }
    if (y === 'trong') { if (sua || yKien) kq.chuaDanhDau++; return }
    if (y === 'bo') { kq.boDuyet.push({ code, y_kien: yKien }); return }
    const nd = sua || o(r, 'Phương án đề xuất')
    if (!nd) { kq.loi.push({ dong, loi: `${code}: duyệt nhưng chưa có phương án.` }); return }
    kq.duyet.push({ code, huong_xu_ly: nd, y_kien: yKien })
  })
  return kq
}
