// Báo cáo lỗi theo 4 nhóm (18/11/2026, chị Trang + CEO): nhóm → máy (SKU) → ticket; máy → nhóm → serial.
// Hàm thuần trên các dòng v_loi_ca (mỗi dòng = 1 máy trong 1 ticket).
import type { DongCa } from './tanSuat'

export type CaBaoCao = DongCa & { state: string }

export const NHOM_CHINH = [
  { code: 'MAIN', ten: 'Main', mo: 'phần cứng, điện, bơm, làm lạnh' },
  { code: 'RO-RI-NUOC', ten: 'Rò rỉ nước', mo: 'rò đáy, vòi, cổng nối, tia nước' },
  { code: 'CHAT-LUONG-NUOC', ten: 'Chất lượng nước', mo: 'mùi lạ, cặn, vượt chuẩn' },
  { code: 'APP', ten: 'App', mo: 'Wifi, app' },
] as const
export const KHONG_PHAI_LOI = 'KHONG-PHAI-LOI'
const LA_CHINH = new Set<string>(NHOM_CHINH.map((n) => n.code))
export const laLoiChinh = (c: Pick<CaBaoCao, 'nhom'>) => c.nhom != null && LA_CHINH.has(c.nhom)
export const tenNhom = (code: string) => NHOM_CHINH.find((n) => n.code === code)?.ten ?? code

/** Khoảng tháng (YYYY-MM, gồm 2 đầu); ticket đã huỷ bỏ trừ khi gomHuy. */
export function locBaoCao<T extends CaBaoCao>(ca: T[], f: { tu: string; den: string; gomHuy?: boolean }): T[] {
  return ca.filter((c) => c.thang >= f.tu && c.thang <= f.den && (f.gomHuy || c.state !== 'Cancel'))
}

const soMay = (a: CaBaoCao[]) => new Set(a.filter((c) => c.may).map((c) => c.may)).size
const soTicket = (a: CaBaoCao[]) => new Set(a.map((c) => c.ticket_code)).size
const soMo = (a: CaBaoCao[]) => new Set(a.filter((c) => c.state === 'Open').map((c) => c.ticket_code)).size
function gom<T>(a: T[], k: (x: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>()
  for (const x of a) m.set(k(x), [...(m.get(k(x)) ?? []), x])
  return m
}
const conCua = (a: CaBaoCao[]) => [...gom(a, (c) => c.loi_ten)].map(([ten, r]) => ({ ten, so: soTicket(r) })).sort((x, y) => y.so - x.so)

export type TomTatNhom = { code: string; ten: string; mo: string; ticket: number; may: number; dangMo: number; con: { ten: string; so: number }[] }

/** 4 ô nhóm (luôn đủ 4, theo thứ tự) + số ticket "không phải lỗi" / chưa phân loại. */
export function tomTatNhom(ca: CaBaoCao[]): { nhom: TomTatNhom[]; khongPhaiLoi: number; chuaPhanLoai: number } {
  return {
    nhom: NHOM_CHINH.map((n) => {
      const a = ca.filter((c) => c.nhom === n.code)
      return { code: n.code, ten: n.ten, mo: n.mo, ticket: soTicket(a), may: soMay(a), dangMo: soMo(a), con: conCua(a) }
    }),
    khongPhaiLoi: soTicket(ca.filter((c) => c.nhom === KHONG_PHAI_LOI)),
    chuaPhanLoai: soTicket(ca.filter((c) => !c.nhom || (!LA_CHINH.has(c.nhom) && c.nhom !== KHONG_PHAI_LOI))),
  }
}

/** Các máy (SKU) trong một nhóm, nhiều ticket trước. */
export function theoSku(ca: CaBaoCao[]) {
  return [...gom(ca, (c) => c.internal_code)]
    .map(([sku, r]) => ({ sku, ticket: soTicket(r), may: soMay(r), dangMo: soMo(r), con: conCua(r) }))
    .sort((x, y) => y.ticket - x.ticket || x.sku.localeCompare(y.sku))
}

/** Bảng máy: máy đang chạy, máy từng lỗi, tỷ lệ, ticket, theo nhóm — chỉ lỗi thuộc 4 nhóm chính. */
export function theoMay(ca: CaBaoCao[], dangChay: Record<string, number>) {
  const loi = ca.filter(laLoiChinh)
  return [...gom(loi, (c) => c.internal_code)]
    .map(([sku, r]) => {
      const chay = dangChay[sku] ?? 0
      const mayLoi = soMay(r)
      const theoNhom: Record<string, number> = {}
      for (const [n, x] of gom(r, (c) => c.nhom!)) theoNhom[n] = soTicket(x)
      return { sku, dangChay: chay, mayLoi, tyLe: chay ? mayLoi / chay : null, ticket: soTicket(r), dangMo: soMo(r), theoNhom }
    })
    .sort((x, y) => y.ticket - x.ticket || x.sku.localeCompare(y.sku))
}

/** Serial trong (máy × nhóm): số lần báo, các ticket (mới nhất trước), trạng thái lần mới nhất. */
export function theoSerial(ca: CaBaoCao[]) {
  return [...gom(ca, (c) => c.may ?? '')]
    .map(([serial, r]) => {
      const s = [...r].sort((x, y) => y.ngay_bao.localeCompare(x.ngay_bao))
      return {
        serial: serial || null, lan: soTicket(r), ticket: [...new Set(s.map((c) => c.ticket_code))],
        loi: [...new Set(s.map((c) => c.loi_ten))], moiNhat: { state: s[0].state, ngay: s[0].ngay_bao },
      }
    })
    .sort((x, y) => y.lan - x.lan || y.moiNhat.ngay.localeCompare(x.moiNhat.ngay))
}
