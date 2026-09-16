import type { DongSaoKe, SaoKe } from '../sao-ke/kieu'
export type MucChu = { trang: number; x: number; y: number; chu: string }
// Cột Nợ trên file thật hiện số ÂM ('-500,000,000') — lấy trị tuyệt đối, no/co/soDu trong DongSaoKe luôn không âm.
const so = (s: string) => Math.abs(Math.round(Number(String(s).replace(/,/g, '')))) || 0
const laSo = (s: string) => /^-?[\d,]+$/.test(s)
const ngayIso = (s: string) => { const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(s); if (m) return `${m[3]}-${m[2]}-${m[1]}`; const n = /(\d{4})-(\d{2})-(\d{2})/.exec(s); return n ? n[0] : '' }
/** Gom mục chữ thành dòng: cùng trang, |Δy| ≤ 3, sắp theo x. */
function gomDong(items: MucChu[]): { trang: number; y: number; muc: MucChu[] }[] {
  const dong: { trang: number; y: number; muc: MucChu[] }[] = []
  for (const m of [...items].sort((a, b) => a.trang - b.trang || a.y - b.y || a.x - b.x)) {
    const d = dong.at(-1)
    if (d && d.trang === m.trang && Math.abs(d.y - m.y) <= 3) d.muc.push(m); else dong.push({ trang: m.trang, y: m.y, muc: [m] })
  }
  for (const d of dong) d.muc.sort((a, b) => a.x - b.x)
  return dong
}
const chuoiDong = (muc: MucChu[]) => muc.map((m) => m.chu).join(' ').replace(/\s+/g, ' ')
/** Nhãn header TCB xếp 2-3 tầng (tiếng Việt + dịch tiếng Anh trên dòng riêng, cách nhau ~6-12px) — vượt ngưỡng
 * gộp dòng ±3 dùng cho thân bảng, nên dò header riêng: lấy 'Nợ/' làm neo rồi gom mọi mục trong ±15 quanh y đó.
 * Export để script sinh fixture tái dùng (loại bỏ đúng dải header khi che PII, không đoán y cứng). */
export function hangHeader(items: MucChu[], trang: number): { yMax: number; muc: MucChu[] } | null {
  const trPage = items.filter((m) => m.trang === trang)
  const neo = trPage.find((m) => m.chu.startsWith('Nợ/'))
  if (!neo) return null
  const muc = trPage.filter((m) => Math.abs(m.y - neo.y) <= 15)
  return { yMax: Math.max(...muc.map((m) => m.y)), muc }
}
/** Biên cột lấy từ header trang 1. pdfjs gộp nhãn header thành 1 mục ('Nợ/ Debit' thay vì 'Nợ/' rời) nên so khớp bằng
 * tiền tố, không so bằng chính xác (khác giả định pdfplumber ban đầu — xem ghi chú controller trong report).
 * soCt lấy từ neo 'Số bút toán' (không hard-code 160/220 như trước) — biên dưới trừ 12, biên trên là điểm bắt
 * đầu cột kế 'Ngân hàng đối ứng' trừ 8, cho ra dải sát với dữ liệu thật quan sát được (~162–221). */
function bienCot(items: MucChu[]): { yHeader: number; soCt: number; soCtHet: number; ten: number; dienGiai: number; no: number; co: number; phi: number; soDu: number } {
  const hdr = hangHeader(items, 1)
  if (!hdr) throw new Error('File không đúng khuôn TCB: không thấy hàng header Nợ/ Có/.')
  const x = (tienTo: string) => { const m = hdr.muc.find((m) => m.chu.startsWith(tienTo)); if (!m) throw new Error(`File không đúng khuôn TCB: thiếu cột ${tienTo}`); return m.x }
  return {
    yHeader: hdr.yMax,
    soCt: x('Số bút toán') - 12,
    soCtHet: x('Ngân hàng đối ứng') - 8,
    ten: x('Tên tài khoản đối ứng') - 4,
    dienGiai: x('Diễn giải') - 22,
    no: x('Nợ/') - 2,
    co: x('Có/') - 2,
    phi: x('Phí') - 5,
    soDu: x('Số dư/') - 7,
  }
}
export function saoKeTuMucChu(items: MucChu[]): SaoKe {
  const dong = gomDong(items)
  const b = bienCot(items)
  const tieuDe = dong.filter((d) => d.trang === 1 && d.y < b.yHeader).map((d) => chuoiDong(d.muc)).join('\n')
  const lay = (re: RegExp) => { const m = re.exec(tieuDe); return m ? m[1] : null }
  const tu = lay(/From:\s*(\d{4}-\d{2}-\d{2})/), den = lay(/To:\s*(\d{4}-\d{2}-\d{2})/)
  const soDuDau = lay(/Opening balance\s+([\d,]+)/), soDuCuoi = lay(/Closing balance\s+([\d,]+)/), tongNo = lay(/Total debits\s+([\d,]+)/), tongCo = lay(/Total credits\s+([\d,]+)/)
  const soTrang = Math.max(...items.map((m) => m.trang))
  const yHdrTrang = new Map<number, number>()
  for (let p = 1; p <= soTrang; p++) { const h = hangHeader(items, p); if (h) yHdrTrang.set(p, h.yMax) }
  const than = dong.filter((d) => { const yh = yHdrTrang.get(d.trang); return yh != null && d.y > yh })  // chỉ thân bảng, dưới header đúng trang

  // Neo = dòng có ô đầu là STT (1-3 chữ số, x<45). Dòng diễn giải/tên nhiều dòng đôi khi in Ở TRÊN (y nhỏ
  // hơn) chính dòng STT của nó (khối diễn giải cao hơn khối STT/số tiền) — không thể dùng mô hình "dòng đang
  // mở tuần tự" (nó sẽ gán nhầm dòng-trên vào giao dịch TRƯỚC). Thay bằng 2 lượt: (1) xác định mọi neo trên
  // từng trang; (2) mỗi dòng thân bảng (kể cả chính dòng neo) gán vào neo GẦN NHẤT theo |Δy| CÙNG TRANG — hoà
  // thì chọn neo ở dưới/sau (y lớn hơn). Số tiền/ngày/số dư CHỈ đọc từ đúng dòng neo, không đọc từ dòng nối.
  type Neo = { trang: number; y: number; d: (typeof than)[number] }
  const neo: Neo[] = []
  for (const d of than) { const dau = d.muc[0]; if (dau.x < 45 && /^\d{1,3}$/.test(dau.chu)) neo.push({ trang: d.trang, y: d.y, d }) }

  type Hien = DongSaoKe & { tenMuc: { y: number; chu: string }[]; dgMuc: { y: number; chu: string }[] }
  const hien: Hien[] = neo.map((_, i) => ({ rowOrder: i + 1, ngay: '', soCt: '', no: 0, co: 0, soDu: null, noiDung: '', tenDoiUng: null, raw: [], tenMuc: [], dgMuc: [] }))

  for (const d of than) {
    const ungVien = neo.filter((n) => n.trang === d.trang)
    if (!ungVien.length) continue
    let gan = ungVien[0], khoangCach = Math.abs(d.y - gan.y)
    for (const n of ungVien) { const kc = Math.abs(d.y - n.y); if (kc < khoangCach || (kc === khoangCach && n.y > gan.y)) { gan = n; khoangCach = kc } }
    const h = hien[neo.indexOf(gan)]
    if (d === gan.d) {                                                                        // chính dòng neo — đọc ngày/số CT/tiền/số dư
      for (const m of d.muc.slice(1)) {
        // Vùng x<b.ten có 2 cột ngày ('Ngày KH thực hiện' rồi 'Ngày giao dịch' xa hơn) — lấy ngày cuối cùng
        // gặp được (ghi đè) để ra đúng 'Ngày giao dịch', không phải ngày khách yêu cầu.
        if (m.x < b.ten) { if (ngayIso(m.chu)) h.ngay = ngayIso(m.chu); else if (m.x >= b.soCt && m.x < b.soCtHet) h.soCt += m.chu }
        else if (m.x < b.dienGiai) h.tenMuc.push({ y: d.y, chu: m.chu })
        else if (m.x < b.no) h.dgMuc.push({ y: d.y, chu: m.chu })
        else if (m.x < b.co) { if (laSo(m.chu)) h.no = so(m.chu) }
        else if (m.x < b.phi) { if (laSo(m.chu)) h.co = so(m.chu) }
        else if (m.x >= b.soDu) { if (laSo(m.chu)) h.soDu = so(m.chu) }
      }
      h.raw = d.muc.map((m) => m.chu)
    } else {                                                                                  // dòng nối (diễn giải/tên dài) — chỉ nhận chữ trong vùng tên/diễn giải
      for (const m of d.muc) { if (m.x >= b.ten && m.x < b.dienGiai) h.tenMuc.push({ y: d.y, chu: m.chu }); else if (m.x >= b.dienGiai && m.x < b.no) h.dgMuc.push({ y: d.y, chu: m.chu }) }
    }
  }
  for (const h of hien) {
    h.tenMuc.sort((a, z) => a.y - z.y); h.dgMuc.sort((a, z) => a.y - z.y)
    h.noiDung = h.dgMuc.map((m) => m.chu).join(' ').replace(/\s+/g, ' ').trim().replace(/(?<!\d)(0\d{2}) (\d{3}) (\d{4})(?!\d)/g, '$1$2$3')
    h.tenDoiUng = h.tenMuc.map((m) => m.chu).join(' ').replace(/\s+/g, ' ').trim() || null
  }
  const ra: DongSaoKe[] = hien.map((h) => ({ rowOrder: h.rowOrder, ngay: h.ngay, soCt: h.soCt, no: h.no, co: h.co, soDu: h.soDu, noiDung: h.noiDung, tenDoiUng: h.tenDoiUng, raw: h.raw }))
  return { taiKhoan: 'TCB', tu, den, soDuDau: soDuDau ? so(soDuDau) : null, soDuCuoi: soDuCuoi ? so(soDuCuoi) : null, tongNo: tongNo ? so(tongNo) : null, tongCo: tongCo ? so(tongCo) : null,
    headers: ['Số thứ tự', 'Ngày KH thực hiện', 'Ngày giao dịch', 'Số bút toán', 'Ngân hàng đối ứng', 'Tài khoản đối ứng', 'Tên tài khoản đối ứng', 'Diễn giải', 'Nợ', 'Có', 'Phí - Lãi', 'Thuế', 'Số dư'], dong: ra }
}
export async function mucChuTuPdf(buf: ArrayBuffer | Uint8Array): Promise<MucChu[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  // pdfjs từ chối Buffer (subclass Uint8Array) — Node readFileSync trả Buffer, nên phải ép về Uint8Array thuần.
  const data = buf.constructor === Uint8Array ? buf : new Uint8Array(buf)
  // pdfjs-dist 6.3.289 đã bỏ 'isEvalSupported' khỏi DocumentInitParameters (lỗi kiểu tsc) — bỏ luôn, không cần nữa.
  const doc = await pdfjs.getDocument({ data, useWorkerFetch: false, disableFontFace: true }).promise
  const ra: MucChu[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    // Trang TCB xoay 90° (page.rotate=90) — transform[4]/[5] thô là toạ độ user-space CHƯA xoay.
    // Phải nhân với vp.transform (đã áp rotate) để ra x/y đúng chiều trang đã xoay; viewport-space y đã tăng
    // xuống dưới sẵn nên không trừ từ height nữa.
    const vp = page.getViewport({ scale: 1 })
    const tc = await page.getTextContent()
    for (const it of tc.items) {
      if (!('str' in it) || !it.str.trim()) continue
      const c = pdfjs.Util.transform(vp.transform, it.transform)
      ra.push({ trang: p, x: Math.round(c[4]), y: Math.round(c[5]), chu: it.str.trim() })
    }
  }
  return ra
}
export async function docTcbPdf(buf: ArrayBuffer | Uint8Array): Promise<SaoKe> { return saoKeTuMucChu(await mucChuTuPdf(buf)) }
