import { describe, it, expect } from 'vitest'
import { taoEngineSaoKe } from './sao-ke'
import type { Luat } from './kieu'
const L: Luat[] = [{ kind: 'bank_keyword', pattern: 'facebk', targetCode: 'cp.qc', condition: null, priority: 10, origin: 'app', active: true }, { kind: 'bank_keyword', pattern: 'van chuyen', targetCode: 'DVVC', condition: null, priority: 40, origin: 'app', active: true }]
const KM = [{ ma: 'cp.qc', ten: 'CP quảng cáo', tkNoDefault: '6421' }, { ma: 'DVVC', ten: 'CP vận chuyển', tkNoDefault: '6427' }, { ma: 'cp.vattukho', ten: 'CP vật tư kho', tkNoDefault: '6423' }]
const rong = { chac: null, goiY: [], sdt: null, khach: null }
const hd = { hoaDonId: 1, soHd: '8121', kyHieu: 'C26TXL', ten: 'XUÂN LÀNH', tongTt: 4659560, canCu: 'tên' }
describe('engine sao kê', () => {
  const e = taoEngineSaoKe({ luat: L, kmcp: KM })
  it('nội bộ / lãi trước mọi luật', () => {
    expect(e.phanLoai({ chieu: 'chi', noiDung: 'GWT chuyen tien noi bo tu VCB63 sang VCB21', tenDoiUng: null, soTien: 1 }, rong)).toMatchObject({ code: 'NOI_BO', codeName: 'Chuyển tiền nội bộ', conf: 'cao', hasInvoice: false })
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'INTEREST PAYMENT', tenDoiUng: null, soTien: 1 }, rong).code).toBe('LAI_NH')
  })
  it('chi: luật facebk → cp.qc cao; không luật nhưng khớp chắc → mã HĐ trung bình; không gì → cần gán tay', () => {
    expect(e.phanLoai({ chieu: 'chi', noiDung: 'FACEBK *73DRRVZD42 DUBLI', tenDoiUng: null, soTien: 1 }, rong)).toMatchObject({ code: 'cp.qc', codeName: 'CP quảng cáo', conf: 'cao' })
    expect(e.phanLoai({ chieu: 'chi', noiDung: 'GWT thanh toan vat tu Xuan Lanh', tenDoiUng: null, soTien: 4659560 }, { ...rong, chac: { ...hd, code: 'cp.vattukho', mst: '0311054784' } })).toMatchObject({ code: 'cp.vattukho', conf: 'trung binh', hasInvoice: true, partyCode: '0311054784' })
    expect(e.phanLoai({ chieu: 'chi', noiDung: 'SUPABASE (25 USD)', tenDoiUng: null, soTien: 1 }, rong)).toMatchObject({ code: null, conf: 'can gan tay', hasInvoice: false })
  })
  it('thu: mặc định Bán hàng; MST công ty / KHSP shopee / KHL khách lẻ / null', () => {
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'CK', tenDoiUng: null, soTien: 1 }, { ...rong, chac: { ...hd, mst: '0314937308', code: null, ten: 'CÔNG TY TNHH CLEAN WATER' } })).toMatchObject({ code: 'BAN_HANG', partyCode: '0314937308', conf: 'cao' })
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'CK', tenDoiUng: null, soTien: 1 }, { ...rong, chac: { ...hd, mst: null, code: null, ten: 'Lan anh (shopee)' } }).partyCode).toBe('KHSP')
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'LE NAM HAI 0900000001', tenDoiUng: null, soTien: 1 }, { ...rong, khach: { customerCode: 'KH1', ten: 'Lê Nam Hải', sdt: '0900000001' } })).toMatchObject({ partyCode: 'KHL', conf: 'trung binh' })
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'hoan tien don hang', tenDoiUng: null, soTien: 1 }, rong)).toMatchObject({ code: 'HOAN_TIEN', partyCode: null })
  })
})
