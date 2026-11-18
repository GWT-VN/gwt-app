// File cho CHUYÊN GIA kiểm tra / sửa / duyệt phương án xử lý (chị Trang 18/11).
// Trang "Danh mục lỗi" và "Gán ticket" theo ĐÚNG khuôn nút "Nhập từ Sheet" (COT_DANH_MUC / COT_GAN_TICKET) →
// chuyên gia sửa xong, quản lý nhập lại là cập nhật danh mục. Cột thêm (số ticket, ví dụ…) bộ đọc bỏ qua.
// File có thể ra ngoài công ty: không có tên / SĐT khách; nội dung tự do được che SĐT + email.
import * as XLSX from 'xlsx'
import { COT_DANH_MUC, COT_GAN_TICKET } from './danhMucNhap'
import { boMauMaMay } from './kiemDauVao'
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
const duyetRa = (t: LoiDanhMuc['trang_thai']) => (t === 'da_duyet' ? 'x' : t === 'ngung' ? 'ngung' : '')
const lanRa = (l: DongTicketXuat['lan']) =>
  l.map((x) => `Lần ${x.lan}: ${gon(x.mo_ta, 200) || '—'}${x.xu_ly ? ` → ${gon(x.xu_ly, 200)}` : ''}`).join('\n')

const HUONG_DAN: string[][] = [
  ['File kiểm tra phương án xử lý lỗi — GWT'],
  [''],
  ['Trang "Danh mục lỗi" — mỗi dòng một mã lỗi:'],
  ['• Sửa cột "Phương án xử lý chuẩn" (CS thấy và bấm Xác nhận trên ticket). Có thể sửa "Dấu hiệu", "Các cách ghi" (cách khách / CS hay gõ, cách nhau bằng ;).'],
  ['• Cột "Duyệt": x = duyệt dùng · ngung = thôi dùng · để trống = chưa duyệt (khi nhập lại, mã đã có giữ nguyên trạng thái cũ).'],
  ['• Ghi nhận xét vào "Ý kiến chuyên gia". KHÔNG sửa cột "Mã" (là khoá để nhập lại).'],
  ['• Các cột bên phải (Số ticket, Ví dụ ticket, CS đã xử lý khác…) chỉ để tham khảo.'],
  [''],
  ['Trang "Gán ticket" — mỗi dòng một máy trong một ticket thật:'],
  ['• Nếu ticket bị gắn sai mã lỗi: sửa cột "Mã lỗi" thành mã đúng (lấy ở trang Danh mục lỗi) và ghi x vào "Duyệt".'],
  ['• Dòng không đánh x sẽ không thay đổi gì.'],
  [''],
  ['Xong: gửi lại file cho quản lý CSKH → app GWT › CSKH › Ticket & lỗi › Danh mục lỗi › "Nhập từ Sheet" (xem trước rồi mới ghi).'],
  ['Nội dung ticket đã che SĐT / email, không có tên khách.'],
]

/** Tạo file .xlsx (Buffer) gồm Hướng dẫn · Danh mục lỗi · Gán ticket. */
export function taoFileChuyenGia(d: DuLieuChuyenGia): Buffer {
  const tenNhom = new Map(d.nhom.map((n) => [n.code, n.ten]))
  const theoMa = new Map<string, DongTicketXuat[]>()
  for (const t of d.dongTicket) theoMa.set(t.loi_code, [...(theoMa.get(t.loi_code) ?? []), t])

  const danhMuc = d.danhMuc.map((l) => {
    const ds = theoMa.get(l.code) ?? []
    const csSua = [...new Set(ds.filter((t) => t.huong_xu_ly_nguon === 'cs' && t.huong_xu_ly?.trim())
      .map((t) => `${t.ticket_code}: ${gon(t.huong_xu_ly, 250)}`))]
    const dong: Record<string, string | number> = {
      'Mã': l.code,
      'Nhóm': l.nhom ?? '',
      'Tên chuẩn': l.ten,
      'Các cách ghi': l.aliases.join('; '),
      'Mã máy áp dụng': l.ma_may.map(boMauMaMay).join('; '),
      'Dấu hiệu': l.dau_hieu ?? '',
      'Phương án xử lý chuẩn': l.huong_xu_ly ?? '',
      'Nguồn': l.nguon ?? '',
      'Ví dụ ticket': ds.slice(0, SO_VI_DU).map((t) => `${t.ticket_code}: ${gon(t.mo_ta, 200)}`).join('\n'),
      'Duyệt': duyetRa(l.trang_thai),
      'Ghi chú chị Hiền': '',
      'Ý kiến chuyên gia': '',
      'Tên nhóm': l.nhom ? tenNhom.get(l.nhom) ?? l.nhom : '',
      'Số ticket': ds.length,
      'CS đã xử lý khác phương án (tham khảo)': csSua.slice(0, 5).join('\n'),
    }
    return dong
  })

  const ganTicket = d.dongTicket.map((t) => ({
    'Mã ticket': t.ticket_code,
    'Mã lỗi': t.loi_code,
    'Duyệt': '',
    'Máy': t.internal_code ?? '',
    'Trạng thái': TT_DONG[t.trang_thai] ?? t.trang_thai,
    'Khách báo': gon(t.mo_ta),
    'Các lần lỗi': lanRa(t.lan),
    'Hướng xử lý trên ticket': gon(t.huong_xu_ly),
  }))

  const wb = XLSX.utils.book_new()
  const hd = XLSX.utils.aoa_to_sheet([...HUONG_DAN, [''], [`Xuất ngày ${d.ngayXuat} · ${d.danhMuc.length} mã lỗi · ${d.dongTicket.length} dòng ticket`]])
  hd['!cols'] = [{ wch: 140 }]
  XLSX.utils.book_append_sheet(wb, hd, 'Hướng dẫn')

  const cotDm = [...COT_DANH_MUC, 'Ý kiến chuyên gia', 'Tên nhóm', 'Số ticket', 'CS đã xử lý khác phương án (tham khảo)']
  const dm = XLSX.utils.json_to_sheet(danhMuc, { header: cotDm })
  dm['!cols'] = cotDm.map((c) => ({ wch: /Phương án|Ví dụ|CS đã|Dấu hiệu|Ý kiến/.test(c) ? 50 : /Tên|cách ghi/.test(c) ? 30 : 14 }))
  XLSX.utils.book_append_sheet(wb, dm, 'Danh mục lỗi')

  const cotGan = [...COT_GAN_TICKET, 'Máy', 'Trạng thái', 'Khách báo', 'Các lần lỗi', 'Hướng xử lý trên ticket']
  const gan = XLSX.utils.json_to_sheet(ganTicket, { header: cotGan })
  gan['!cols'] = cotGan.map((c) => ({ wch: /Khách báo|Các lần|Hướng/.test(c) ? 55 : 16 }))
  XLSX.utils.book_append_sheet(wb, gan, 'Gán ticket')

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
