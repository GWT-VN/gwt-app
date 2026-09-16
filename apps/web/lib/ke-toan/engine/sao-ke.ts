// Engine phân loại dòng sao kê ngân hàng (lát 5) — nội bộ/lãi NH → luật bank_keyword (chi) → mặc định theo chiều.
import { norm } from '../chuan-hoa'
import { laNoiBo, laLaiNganHang } from '../sao-ke/noi-dung'
import type { KetQuaKhop } from '../sao-ke/kieu'
import type { Luat, MucKmcp } from './kieu'

const MST_GWT = '0110530659'

export type KetQuaSaoKe = { code: string | null; codeName: string; partyCode: string | null; hasInvoice: boolean; reason: string; conf: 'cao' | 'trung binh' | 'can gan tay' }

export function taoEngineSaoKe(input: { luat: Luat[]; kmcp: MucKmcp[] }) {
  const luatBank = input.luat.filter((l) => l.kind === 'bank_keyword' && l.active).sort((a, b) => a.priority - b.priority)
  const kmTen = new Map(input.kmcp.map((k) => [k.ma, k.ten]))

  function phanLoai(d: { chieu: 'thu' | 'chi'; noiDung: string; tenDoiUng: string | null; soTien: number }, khop: KetQuaKhop): KetQuaSaoKe {
    if (laNoiBo(d.noiDung)) return { code: 'NOI_BO', codeName: 'Chuyển tiền nội bộ', partyCode: null, hasInvoice: false, reason: 'Nội dung có "nội bộ"', conf: 'cao' }
    if (laLaiNganHang(d.noiDung)) return { code: 'LAI_NH', codeName: 'Lãi ngân hàng', partyCode: null, hasInvoice: false, reason: 'Nội dung có tín hiệu lãi ngân hàng', conf: 'cao' }

    if (d.chieu === 'chi') {
      const n = norm(d.noiDung)
      const luat = luatBank.find((l) => n.includes(l.pattern))
      if (luat) return { code: luat.targetCode, codeName: kmTen.get(luat.targetCode) ?? '', partyCode: khop.chac?.mst ?? null, hasInvoice: !!khop.chac, reason: `Luật diễn giải ngân hàng: chứa "${luat.pattern}"`, conf: 'cao' }
      if (khop.chac?.code) return { code: khop.chac.code, codeName: kmTen.get(khop.chac.code) ?? '', partyCode: khop.chac.mst, hasInvoice: true, reason: `Khớp chắc hoá đơn ${khop.chac.soHd}`, conf: 'trung binh' }
      return { code: null, codeName: '', partyCode: null, hasInvoice: !!khop.chac, reason: 'Không khớp luật/hoá đơn — cần gán tay', conf: 'can gan tay' }
    }

    // thu
    const n = norm(d.noiDung)
    const code = n.includes('hoan tien') ? 'HOAN_TIEN' : 'BAN_HANG'
    const codeName = code === 'HOAN_TIEN' ? 'Hoàn tiền' : 'Bán hàng'
    const mstHd = khop.chac?.mst ?? null
    let partyCode: string | null = null
    if (mstHd && mstHd !== MST_GWT) partyCode = mstHd
    else if (khop.chac && norm(khop.chac.ten).includes('shopee')) partyCode = 'KHSP'
    else if (khop.khach || khop.chac) partyCode = 'KHL'
    const conf = khop.chac ? 'cao' : khop.khach || khop.goiY.length ? 'trung binh' : 'can gan tay'
    return { code, codeName, partyCode, hasInvoice: !!khop.chac, reason: khop.chac ? `Khớp chắc hoá đơn ${khop.chac.soHd}` : khop.khach ? `Khớp khách ${khop.khach.customerCode}` : 'Không khớp — cần gán tay', conf }
  }

  return { phanLoai }
}
