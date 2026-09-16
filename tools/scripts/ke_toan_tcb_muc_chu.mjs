// Sinh apps/web/lib/ke-toan/__fixtures__/tcb-t8-muc-chu.json từ Sao kê TCB.pdf thật — CHE PII: chuỗi ≥7 chữ số → '#', SĐT → 0900000nnn,
// tên tài khoản đối ứng (cột x 360–428), tên viết HOA ≥2 từ (bất kỳ đâu, không phải công ty) và tên viết
// Hoa-đầu-từ trong dải tên (360–428)/diễn giải (428–545) → 'KH-n' (cùng tên → cùng n, không phân biệt hoa
// thường), địa chỉ/ID khách hàng ở phần đầu → 'X'.
import { readFileSync, writeFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { mucChuTuPdf, hangHeader } from '../../apps/web/lib/ke-toan/doc-file/tcb-pdf.ts'
const src = globSync('data/ke-toan/B*/B*/Sao k*/2026.08/Sao kê TCB.pdf')[0]
const items = await mucChuTuPdf(readFileSync(src))
// Loại trừ MỌI THỨ Ở TRÊN header mỗi trang khỏi vùng che theo Hoa-đầu-từ — không chỉ dải header hẹp mà cả
// khối tiêu đề trang 1 phía trên nó ('From:'/'To:' ở x=364/435 tình cờ trùng dải cột Tên 360–428, che nhầm
// làm mất luôn kỳ sao kê — đã bắt được qua test 'header: kỳ...' đỏ). Dùng đúng ranh giới 'thân bảng' như
// saoKeTuMucChu (y > yMax header của đúng trang), tái dùng logic dò header trong tcb-pdf.ts.
const soTrang = Math.max(...items.map((m) => m.trang))
const hdrYMax = new Map()
for (let p = 1; p <= soTrang; p++) { const h = hangHeader(items, p); if (h) hdrYMax.set(p, h.yMax) }
const duoiHeader = (m) => { const yh = hdrYMax.get(m.trang); return yh != null && m.y > yh }
const sdt = new Map(), ten = new Map()
const CTY = /\b(CONG TY|CTY|TNHH|CO PHAN|CP|JSC|BANK|NGAN HANG|GENERAL|TECHCOMBANK|VIETCOMBANK|ZALO|SHOPEE|CTD50|CTS20|GE)\b/i
const themTen = (s) => { const k = s.toLowerCase(); return ten.get(k) ?? (ten.set(k, `KH-${ten.size + 1}`), ten.get(k)) }
// Thực tế đo trên file thật: SĐT trong diễn giải đôi khi có 1 khoảng trắng chèn giữa dãy số (vd '091278 8899',
// khác giả định 3-3-4 ban đầu) — regex chấp nhận khoảng trắng tuỳ ý giữa các chữ số, nối liền khi che.
const SDT = /(?<!\d)0(?: ?\d){9}(?!\d)/g
// Tên viết HOA ≥2 từ (vd hộp tóm tắt lặp lại theo trang, hoặc lẫn trong diễn giải kiểu 'chuyen tien...tu
// NGUYEN KIEU UYEN toi...') — áp dụng bất kỳ đâu trong file (không chỉ dải tên/diễn giải) vì hộp tóm tắt nằm
// ở toạ độ khác cột chính.
// \b (ASCII) coi ký tự có dấu tiếng Việt (Â, Ư, Ệ…) là KHÔNG PHẢI word char → cắt nhầm giữa từ có dấu
// (vd tên ngân hàng 'NGÂN HÀNG KỸ THƯƠNG VIỆT NAM' bị băm nát). Dùng \p{L} (Unicode) thay \b để biên đúng chữ cái.
// {1,8} (không phải {1,3}): tên ngân hàng tiếng Anh dài ('VIETNAM TECHNOLOGICAL AND COMMERCIAL JOINT STOCK
// BANK') phải khớp trọn trong 1 lần thì từ khoá 'BANK' mới nằm trong chuỗi khớp để CTY loại trừ — khớp cụt còn
// 4 từ đầu (thiếu BANK) thì bị che nhầm.
// Từ THỨ 2 trở đi cho phép 1 ký tự (không bắt buộc {2,} như từ đầu): đo được thật dàn trang TCB thỉnh thoảng
// tách RỜI 1 chữ cái khỏi tên ('NGUYEN THI D UONG' = '...THI DUONG' vỡ 'D' khỏi 'UONG'; 'PHAM THI THAN H
// THUY' = '...THANH THUY' vỡ 'H' khỏi 'THAN') — không biết chắc chữ lẻ thuộc về từ trước hay từ sau, nên che
// TRỌN cả cụm (kể cả chữ lẻ) làm 1 khối thay vì đoán, còn hơn để lọt 1 mảnh tên trần.
const TEN_HOA = /(?<!\p{L})[A-Z]{2,}(?: [A-Z]{1,}){1,8}(?!\p{L})/gu
// Tên viết Hoa-đầu-từ ("Nguyen Ngat", "Dao Thi Phuong Dung", "Dalton") lẫn trong diễn giải — thường KHÔNG
// viết HOA toàn bộ nên TEN_HOA ở trên không bắt được. Cho phép từ ĐẦU tiên viết thường (vd "phung Khanh
// Quyen") nếu có ít nhất 1 từ Hoa-đầu-từ theo sau. Chỉ áp trong dải tên (360–428)/diễn giải (428–545) và
// NGOÀI dải header (nhãn cột tiếng Anh như 'Description', 'Remitter's account' cũng Hoa-đầu-từ).
const TEN_THUONG = /\b(?:[a-z]+(?= [A-Z][a-z]+\b)|[A-Z][a-z]+)(?: [A-Z][a-z]+){0,3}\b/g
const che = (m) => {
  let s = m.chu
    .replace(SDT, (p) => { const k = p.replace(/ /g, ''); return sdt.get(k) ?? (sdt.set(k, `0900000${String(sdt.size + 1).padStart(3, '0')}`), sdt.get(k)) })
    // Placeholder SĐT '0900000nnn' cũng dài ≥7 số — chừa lại, không băm đè thành dấu #.
    .replace(/\d{7,}/g, (p) => (/^0900000\d{3}$/.test(p) ? p : '#'.repeat(p.length)))
  if (m.x >= 360 && m.x < 428 && m.y > 320 && !CTY.test(s)) s = themTen(s)
  s = s.replace(TEN_HOA, (p) => (CTY.test(p) ? p : themTen(p)))
  if (m.x >= 360 && m.x < 545 && duoiHeader(m)) s = s.replace(TEN_THUONG, (p) => (CTY.test(p) ? p : themTen(p)))
  if (m.trang === 1 && m.y < 300 && /Address|Địa chỉ|Customer ID|khách hàng/.test(s)) s = 'X'
  return { ...m, chu: s }
}
const daChe = items.map(che)

// Vá nối biên: pdfjs đôi khi cắt tên NGANG GIỮA CHỮ giữa 2 mục kế tiếp nhau THEO Y trong cùng cột diễn giải/tên
// (đo được thật: dòng 'LY HOANG KIE' rồi dòng NGAY SAU 'U LINH toi...' — mất chữ 'KIEU', phần trước bị che
// nhưng 'LINH' đứng lẻ 1 từ sau khi mất chữ đầu 'K' nên cả quy tắc HOA (≥2 từ) lẫn Hoa-đầu-từ (cần chữ thường
// theo sau) đều không khớp). Đây là 2 dòng chữ KHÁC NHAU trong đoạn diễn giải nhiều dòng (cách nhau ~7px,
// không cùng 'dòng' theo nghĩa toạ độ y ±3 của gomDong), không phải 2 mục cùng hàng ngang. Dò theo TRÌNH TỰ
// y tăng dần trong cùng trang+cột: dòng TRƯỚC đã bị che (kết thúc bằng KH-n hoặc dấu #) và cách dòng SAU
// không quá 1 dòng chữ (~10px) → từ HOA đứng đầu dòng sau (bỏ 1 ký tự lẻ nếu có, tàn dư chữ bị cắt) rất có
// thể là phần còn sót của tên, che nốt.
const KET_THUC_CHE = /(?:KH-\d+|#+)$/
const trongBand = (m) => m.x >= 360 && m.x < 545 && duoiHeader(m)
const theoCot = daChe.filter(trongBand).sort((a, b) => a.trang - b.trang || a.y - b.y)
for (let i = 1; i < theoCot.length; i++) {
  const truoc = theoCot[i - 1], sau = theoCot[i]
  if (truoc.trang !== sau.trang || sau.y - truoc.y > 10 || !KET_THUC_CHE.test(truoc.chu)) continue
  if (/^KH-\d/.test(sau.chu)) continue                       // dòng sau đã tự che được (vd TEN_HOA) — đừng khớp lại chữ 'KH' trong placeholder của chính mình
  const m = /^[A-Z]?\s?([A-Z]{2,})\b/.exec(sau.chu)
  if (m && !CTY.test(m[1])) sau.chu = sau.chu.slice(m[0].length).replace(/^/, themTen(m[1]))
}

writeFileSync('apps/web/lib/ke-toan/__fixtures__/tcb-t8-muc-chu.json', JSON.stringify({ items: daChe }))
console.log('mục chữ:', items.length)
