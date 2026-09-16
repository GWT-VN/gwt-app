// Khớp 1 dòng sao kê ↔ hoá đơn/khách/đơn Sales — thuần: không DB, không crypto.
import type { DonHangTom, HoaDonTom, KhachTom, Khop, KetQuaKhop } from './kieu'
import { tuKhoa, timSdt } from './noi-dung'

type DongHoaDonTho = { id: number; direction: 'vao' | 'ra'; ky_hieu: string | null; so_hd: string | null; ten_ban: string | null; ten_mua: string | null; mst_ban: string | null; mst_mua: string | null; tong_thanh_toan: number | null; tien_thue: number | null; ngay_lap: string | null; code: string | null; missing_in_last_upload: boolean }

export function gomHoaDon(lines: DongHoaDonTho[]): HoaDonTom[] {
  const nhom = new Map<string, DongHoaDonTho[]>()
  for (const d of lines) {
    if (d.missing_in_last_upload) continue
    const key = [d.direction, d.ky_hieu, d.so_hd].join('|')
    const arr = nhom.get(key)
    if (arr) arr.push(d)
    else nhom.set(key, [d])
  }
  const ra: HoaDonTom[] = []
  for (const arr of nhom.values()) {
    const first = arr[0]
    const codes = new Set(arr.map((d) => d.code))
    const code = codes.size === 1 && arr[0].code !== null ? arr[0].code : null
    const ngayHopLe = arr.map((d) => d.ngay_lap).filter((n): n is string => n !== null)
    ra.push({
      id: Math.min(...arr.map((d) => d.id)),
      direction: first.direction,
      kyHieu: first.ky_hieu ?? '',
      soHd: first.so_hd ?? '',
      ten: (first.direction === 'vao' ? first.ten_ban : first.ten_mua) ?? '',
      mst: (first.direction === 'vao' ? first.mst_ban : first.mst_mua) ?? null,
      tongTt: Math.round(arr.reduce((s, d) => s + (d.tong_thanh_toan ?? 0), 0)),
      thue: arr.reduce((s, d) => s + (d.tien_thue ?? 0), 0),
      ngay: ngayHopLe.length ? ngayHopLe.sort()[0] : null,
      code,
      lineIds: arr.map((d) => d.id).sort((a, b) => a - b),
    })
  }
  return ra
}

/** Tín hiệu "cứng": số HĐ hoặc MST xuất hiện nguyên trong nội dung — phân định được khi nhiều HĐ trùng tên. */
function tinHieuCung(hd: HoaDonTom, noiDung: string): string | null {
  if (hd.soHd.length >= 3) {
    const re = new RegExp(`(?<!\\d)0*${hd.soHd}(?!\\d)`)
    if (re.test(noiDung)) return `số HĐ ${hd.soHd} trong nội dung`
  }
  if (hd.mst && noiDung.includes(hd.mst)) return `MST ${hd.mst} trong nội dung`
  return null
}

/** Tín hiệu "mềm": tên trùng từ khoá, hoặc (thu) khách nhận diện qua SĐT trùng tên HĐ. */
function tinHieuMem(hd: HoaDonTom, noiDung: string, tenDoiUng: string | null, kh: KhachTom | null): string | null {
  if (kh && [...tuKhoa(kh.ten)].some((t) => tuKhoa(hd.ten).has(t))) return `khách ${kh.ten} qua SĐT`
  if ([...tuKhoa(hd.ten)].some((t) => tuKhoa(`${noiDung} ${tenDoiUng ?? ''}`).has(t))) return `tên NCC/khách trùng từ khoá (${hd.ten})`
  return null
}

function tinHieu(hd: HoaDonTom, noiDung: string, tenDoiUng: string | null, kh: KhachTom | null): string | null {
  return tinHieuCung(hd, noiDung) ?? tinHieuMem(hd, noiDung, tenDoiUng, kh)
}

function toKhop(hd: HoaDonTom, canCu: string): Khop {
  return { hoaDonId: hd.id, soHd: hd.soHd, kyHieu: hd.kyHieu, ten: hd.ten, mst: hd.mst, tongTt: hd.tongTt, code: hd.code, canCu }
}

export function khopSaoKe(
  d: { chieu: 'thu' | 'chi'; soTien: number; noiDung: string; tenDoiUng: string | null },
  hoaDon: HoaDonTom[],
  khach: KhachTom[],
  donHang: DonHangTom[],
): KetQuaKhop {
  const huong = d.chieu === 'chi' ? 'vao' : 'ra'
  const cungHuong = hoaDon.filter((hd) => hd.direction === huong)
  const dungTien = cungHuong.filter((hd) => hd.tongTt === Math.round(d.soTien))
  const soTien = Math.round(d.soTien)

  const sdt = d.chieu === 'thu' ? timSdt(d.noiDung) : null
  const kh = sdt ? (khach.find((k) => k.sdt === sdt) ?? null) : null

  // "chac" = đúng 1 ứng viên có tín hiệu — tín hiệu cứng (số HĐ/MST) ưu tiên tuyệt đối trên tín hiệu
  // mềm (tên) vì nó phân định được khi nhiều HĐ trùng tên NCC/khách.
  const cung = dungTien.map((hd) => ({ hd, sig: tinHieuCung(hd, d.noiDung) })).filter((x): x is { hd: HoaDonTom; sig: string } => x.sig !== null)
  const mem = dungTien.map((hd) => ({ hd, sig: tinHieuMem(hd, d.noiDung, d.tenDoiUng, kh) })).filter((x): x is { hd: HoaDonTom; sig: string } => x.sig !== null)
  const tang = cung.length ? cung : mem
  const chac = tang.length === 1 ? toKhop(tang[0].hd, tang[0].sig) : null

  // đúng tiền: có tín hiệu trước, còn lại ổn định theo id
  const goiY: Khop[] = dungTien
    .map((hd) => ({ hd, sig: tinHieu(hd, d.noiDung, d.tenDoiUng, kh) }))
    .sort((a, b) => (a.sig ? 0 : 1) - (b.sig ? 0 : 1) || a.hd.id - b.hd.id)
    .map((e) => toKhop(e.hd, e.sig ?? 'đúng tiền'))

  // cùng bên, không đúng tiền, có tín hiệu mềm (từ khoá/SĐT) — sắp theo chênh lệch tiền
  const daGom = new Set(dungTien.map((hd) => hd.id))
  for (const e of cungHuong
    .filter((hd) => !daGom.has(hd.id))
    .map((hd) => ({ hd, sig: tinHieuMem(hd, d.noiDung, d.tenDoiUng, kh) }))
    .filter((x): x is { hd: HoaDonTom; sig: string } => x.sig !== null)
    .sort((a, b) => Math.abs(a.hd.tongTt - soTien) - Math.abs(b.hd.tongTt - soTien)))
    goiY.push(toKhop(e.hd, e.sig))

  // đơn Sales cùng khách (chỉ thu) — "khách" ở đây là KhachTom nhận diện qua SĐT (kh), không phải
  // tên NCC/khách trong nội dung; không có kh thì không có gì để đối chiếu → không gợi ý.
  if (d.chieu === 'thu' && kh) {
    const tapTen = tuKhoa(kh.ten)
    for (const dh of donHang) {
      if (goiY.length >= 3) break
      if ([...tuKhoa(dh.tenKhach)].some((t) => tapTen.has(t))) goiY.push({ hoaDonId: 0, soHd: '', kyHieu: '', ten: dh.tenKhach, mst: null, tongTt: dh.tongTt, code: null, canCu: `đơn Sales ${dh.orderCode}` })
    }
  }

  return { chac, goiY: goiY.filter((g) => !chac || g.hoaDonId !== chac.hoaDonId).slice(0, 3), sdt, khach: kh }
}
