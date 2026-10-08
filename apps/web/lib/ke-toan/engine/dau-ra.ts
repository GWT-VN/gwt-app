import { norm } from '../chuan-hoa'
import { taoGoiYMaNoiBo } from './ma-noi-bo'
import type { KetQuaDauRa, Luat, MucCatalog, MucKenh, NhomSP } from './kieu'

/**
 * Cột "Loại" tab đầu ra — nhãn y hệt file NEXIA kế toán làm tay (T5/2026: "POU - Countertop" có dấu cách).
 * CEO 08/10/2026 (feedback file T9): POE = chỉ hệ lọc tổng (Machines > POE); POU = máy để bàn / âm tủ;
 * còn lại — lõi lọc, muối, tủ/khung inox, vòi sen, ống, dịch vụ, vận chuyển — = Others (khớp file T5 làm
 * tay). Thay luật cũ "POU Filters → Undersink" và "POE Filters → POE".
 */
export function nhomSpCua(c: MucCatalog | undefined): NhomSP | '' {
  if (!c || c.ma.startsWith('cp.')) return ''
  const c2 = c.capHai ?? '', c3 = c.capBa ?? ''
  if (c2 === 'POE') return 'POE'
  if (c2 === 'POU') return c3 === 'Undersink' ? 'POU - Undersink' : 'POU - Countertop'
  return 'Others'
}

export function taoEngineDauRa(input: { luat: Luat[]; catalog: MucCatalog[]; kenh: MucKenh[] }) {
  const goiY = taoGoiYMaNoiBo(input.luat.filter((l) => l.active))
  const cat = new Map(input.catalog.map((c) => [c.ma, c]))
  const kenhTheoMst = new Map(input.kenh.filter((k) => k.mst).map((k) => [k.mst!.trim(), k]))
  function phanLoaiRa(tenHang: unknown, mstMua: unknown, tenMua: unknown): KetQuaDauRa {
    const g = goiY(tenHang)
    const c = cat.get(g.ma)
    const mst = String(mstMua ?? '').trim()
    const customerCode = mst ? mst : norm(tenMua).includes('shopee') ? 'KHSP' : 'KHL'
    const k = mst ? kenhTheoMst.get(mst) : undefined
    const channelL1 = customerCode === 'KHSP' ? 'Ecom' : k?.channelL1 ?? ''
    const channelL2 = customerCode === 'KHSP' ? 'Shopee' : k?.channelL2 ?? ''
    return { code: g.ma, codeName: c?.ten ?? '', conf: g.conf, reason: g.canCu, customerCode, productGroup: nhomSpCua(c), channelL1, channelL2, dealerName: channelL1 === 'Đại lý' ? channelL2 : '' }
  }
  return { phanLoaiRa }
}
