// Rút gọn nội dung dòng sao kê + tín hiệu (SĐT, nội bộ, lãi ngân hàng, từ khoá tên) — lát 5.
// server-side only: norm() ở chuan-hoa.ts cùng file import node:crypto — KHÔNG import file này từ client component.
import type { TaiKhoan } from './kieu'
import { norm } from '../chuan-hoa'

const TU_CHUNG = new Set(['cong', 'ty', 'tnhh', 'co', 'phan', 'thuong', 'mai', 'dich', 'vu', 'san', 'xuat', 'viet', 'nam', 'quoc', 'te', 'chi', 'nhanh', 'tap', 'doan', 'tong', 'va', 'cp', 'mtv', 'thanh', 'toan', 'gwt'])
// Cụm nhiều từ bỏ TRƯỚC khi tách token — tách theo từng từ đơn (TU_CHUNG) sẽ nuốt luôn tên riêng
// trùng chữ (vd 'dung' là stop-word của "XÂY DỰNG" nhưng cũng là tên "Dũng" — không được loại tên
// riêng). Sắp dài→ngắn để cụm dài khớp trước khi cụm con của nó (không cụm nào hiện là con của cụm
// khác trong danh sách này nên thứ tự không đổi kết quả, giữ quy ước cho an toàn khi thêm cụm mới).
const CUM_CHUNG = ['trach nhiem huu han', 'xay dung', 'thuong mai', 'dich vu', 'san xuat', 'co phan', 'quoc te', 'viet nam', 'chi nhanh', 'tap doan'].sort((a, b) => b.length - a.length)

export function rutGonNoiDung(noiDung: string, taiKhoan: TaiKhoan): string {
  let s = String(noiDung ?? '')
  const dg = s.indexOf('DG:')
  if (dg >= 0) s = s.slice(dg + 3).split('.')[0] // VCB21 UHHT: "DG:FACEBK *X   DUBLI.5,270,776.00VND"
  else if (/^SHGD:/.test(s) && s.includes('Remark:')) s = s.slice(s.indexOf('Remark:') + 7)
  else s = s.replace(/^(IBBIZ|MBBIZ)\.?\d+\.(?:[0-9A-Z]+\.)?/, '') // "IBBIZ6076649616.017669.GWT…" | "IBBIZ.6076650534.6219BFTVGLLB472I.GWT…"
  void taiKhoan
  return s.replace(/\s+/g, ' ').trim()
}

export function timSdt(s: string): string | null {
  // 10 số bắt đầu 0, cho phép 1 khoảng trắng/dấu chấm xen giữa các chữ số (091278 8899 | 0912.788.899)
  // Cũng khớp MST 10 số bắt đầu 0 — không dùng hàm này để suy khách lẻ (dễ nhầm MST thành SĐT).
  const m = /(?<!\d)0(?:[ .]?\d){9}(?!\d)/.exec(String(s ?? ''))
  return m ? m[0].replace(/\D/g, '') : null
}

export function laNoiBo(noiDung: string): boolean {
  const n = norm(noiDung)
  return n.includes('noi bo') || n.includes('noibo')
}

export function laLaiNganHang(noiDung: string): boolean {
  const n = norm(noiDung)
  return n.includes('interest') || n.includes('tra lai so du') || n.includes('lai tien gui')
}

export function tuKhoa(ten: unknown): Set<string> {
  let s = norm(ten)
  for (const cum of CUM_CHUNG) s = s.replace(new RegExp(`\\b${cum}\\b`, 'g'), ' ')
  return new Set(s.split(/\s+/).filter((t) => t.length >= 3 && !TU_CHUNG.has(t)))
}
