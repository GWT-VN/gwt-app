import { describe, expect, it } from 'vitest'
import { HAM_GHI, NGUON_APP, doiLoiGhi, taoKhoGhi, type KetNoi } from './ghi'
import { HAM_DOC } from './doc'

/**
 * Kết nối giả: ghi lại MỌI câu lệnh (kể cả begin/commit/rollback) + tham số, trả kết quả dựng sẵn theo tên hàm.
 * `hong` = tên hàm sẽ ném lỗi (mô phỏng raise exception của DB).
 */
function gia(traVe: Record<string, unknown>, hong?: { fn: string; loi: Error & { code?: string } }) {
  const lenh: { sql: string; ts: unknown[] }[] = []
  const traLai: (Error | undefined)[] = []
  let soLanLay = 0
  const lay = async (): Promise<KetNoi> => {
    soLanLay++
    return {
      q: async (sql, ts) => {
        lenh.push({ sql, ts })
        const fn = /public\.(wh_[a-z_]+)\(/.exec(sql)?.[1] ?? ''
        if (hong && fn === hong.fn) throw hong.loi
        return [{ r: traVe[fn] }]
      },
      tra: (loi) => { traLai.push(loi) },
    }
  }
  const sqls = () => lenh.map((l) => l.sql)
  const thamSo = (i = 1) => JSON.parse(lenh[i].ts[0] as string)
  return { lay, lenh, sqls, thamSo, traLai, soLanLay: () => soLanLay }
}

const loiDB = (message: string, code: string) => Object.assign(new Error(message), { code })

describe('lib/kho/ghi — ghi sổ kho qua 5 hàm wh_* trong giao dịch READ WRITE', () => {
  it('danh sách hàm ghi: đúng 5 hàm, không lẫn với hàm đọc', () => {
    expect([...HAM_GHI].sort()).toEqual(['wh_bo_qua_dong', 'wh_duyet_dong', 'wh_huy_dong', 'wh_kiem_ke', 'wh_sua_dong'])
    for (const f of HAM_GHI) expect(HAM_DOC.has(f as never)).toBe(false)
  })

  it('suaDong: BEGIN READ WRITE → hàm qua placeholder → COMMIT; nguon app + email; trả kết nối', async () => {
    const g = gia({ wh_sua_dong: { doi: 2, id: 42 } })
    const r = await taoKhoGhi(g.lay, { nguoi: ' ai@gwt.vn ' }).suaDong(42, { qty: '5', internal_code: ' abc-1 ' }, 'nhắn nhầm')
    expect(r).toEqual({ doi: 2, id: 42 })
    expect(g.sqls()).toEqual(['begin read write', 'select public.wh_sua_dong($1::jsonb) r', 'commit'])
    expect(g.thamSo()).toEqual({ id: 42, sua: { qty: 5, internal_code: 'ABC-1' }, ly_do: 'nhắn nhầm', nguon: NGUON_APP, nguoi: 'ai@gwt.vn' })
    expect(g.traLai).toEqual([undefined])
  })

  it('tham số đi qua placeholder, không ghép chuỗi vào SQL', async () => {
    const g = gia({ wh_sua_dong: { doi: 1, id: 1 } })
    await taoKhoGhi(g.lay, { nguoi: 'ai@gwt.vn' }).suaDong(1, { note: "x'); drop table wh_master; --" })
    expect(g.sqls()[1]).toBe('select public.wh_sua_dong($1::jsonb) r')
    expect(g.thamSo().sua.note).toBe("x'); drop table wh_master; --")
  })

  it('lỗi nghiệp vụ (raise exception, P0001): ROLLBACK, trả kết nối, hiện NGUYÊN câu tiếng Việt', async () => {
    const g = gia({}, { fn: 'wh_huy_dong', loi: loiDB('Dòng #9 đã huỷ / bỏ qua rồi', 'P0001') })
    await expect(taoKhoGhi(g.lay, { nguoi: 'ai@gwt.vn' }).huyDong(9, 'trùng')).rejects.toThrow(/^Dòng #9 đã huỷ \/ bỏ qua rồi$/)
    expect(g.sqls()).toEqual(['begin read write', 'select public.wh_huy_dong($1::jsonb) r', 'rollback'])
    expect(g.traLai).toEqual([undefined])
  })

  it('lỗi hạ tầng: che chuỗi kết nối; rollback cũng hỏng → huỷ kết nối khỏi pool', async () => {
    const lenh: string[] = []
    const traLai: (Error | undefined)[] = []
    const lay = async (): Promise<KetNoi> => ({
      q: async (sql) => { lenh.push(sql); if (sql !== 'begin read write') throw new Error('connect ECONNRESET postgres://kho_app_doc:matkhau@x:6543/postgres'); return [] },
      tra: (loi) => { traLai.push(loi) },
    })
    const p = taoKhoGhi(lay, { nguoi: 'ai@gwt.vn' }).boQuaDong(3)
    await expect(p).rejects.toThrow(/^Chưa ghi được sổ kho/)
    await expect(taoKhoGhi(lay, { nguoi: 'ai@gwt.vn' }).boQuaDong(3)).rejects.not.toThrow(/matkhau/)
    expect(lenh.slice(0, 3)).toEqual(['begin read write', 'select public.wh_bo_qua_dong($1::jsonb) r', 'rollback'])
    expect(traLai[0]).toBeInstanceOf(Error)
  })

  it('kiểm dữ liệu TRƯỚC khi mở kết nối: không người sửa, id hỏng, huỷ thiếu lý do, sửa rỗng → không chạm DB', async () => {
    const g = gia({})
    await expect(taoKhoGhi(g.lay, { nguoi: '  ' }).boQuaDong(1)).rejects.toThrow(/Thiếu người sửa/)
    await expect(taoKhoGhi(g.lay, { nguoi: 'a@gwt.vn' }).boQuaDong('1; drop')).rejects.toThrow(/Mã dòng sổ không hợp lệ/)
    await expect(taoKhoGhi(g.lay, { nguoi: 'a@gwt.vn' }).huyDong(1, '   ')).rejects.toThrow(/cần ghi lý do/)
    await expect(taoKhoGhi(g.lay, { nguoi: 'a@gwt.vn' }).suaDong(1, {})).rejects.toThrow(/Chưa đổi gì/)
    await expect(taoKhoGhi(g.lay, { nguoi: 'a@gwt.vn' }).duyetDong(1, ' ')).rejects.toThrow(/Chưa chọn mã/)
    expect(g.soLanLay()).toBe(0)
  })

  it('duyetDong: mã viết hoa, có raw_norm thì gửi; không có thì bỏ khoá', async () => {
    const g = gia({ wh_duyet_dong: { id: 5, ma: 'LOI-RO-3' } })
    const kg = taoKhoGhi(g.lay, { nguoi: 'ai@gwt.vn' })
    expect(await kg.duyetDong(5, 'loi-ro-3', 'loi loc ro so 3')).toEqual({ id: 5, ma: 'LOI-RO-3' })
    expect(g.thamSo()).toEqual({ id: 5, ma: 'LOI-RO-3', raw_norm: 'loi loc ro so 3', nguon: 'app', nguoi: 'ai@gwt.vn' })
    await kg.duyetDong(5, 'LOI-RO-3')
    expect(g.thamSo(4)).not.toHaveProperty('raw_norm')
  })

  it('kiemKe: bỏ ô trống, số "1,5" → 1.5, kho mặc định NX; kết quả numeric → number', async () => {
    const g = gia({ wh_kiem_ke: [{ internal_code: 'A', ton_truoc: '3', so_dem: '1.5', chenh: '-1.5', id: 77 }, { internal_code: 'B', ton_truoc: '2', so_dem: '2', chenh: '0', id: null }] })
    const r = await taoKhoGhi(g.lay, { nguoi: 'ai@gwt.vn' }).kiemKe([{ internal_code: 'a', so_dem: '1,5' }, { internal_code: 'C', so_dem: '' }, { internal_code: 'b', so_dem: 2 }])
    expect(g.thamSo()).toEqual({ kho: 'NX', items: [{ internal_code: 'A', so_dem: 1.5 }, { internal_code: 'B', so_dem: 2 }], nguon: 'app', nguoi: 'ai@gwt.vn' })
    expect(r).toEqual([{ internal_code: 'A', ton_truoc: 3, so_dem: 1.5, chenh: -1.5, id: 77 }, { internal_code: 'B', ton_truoc: 2, so_dem: 2, chenh: 0, id: null }])
  })

  it('doiLoiGhi: thiếu hàm (chưa áp migration) / thiếu quyền EXECUTE → câu dễ hiểu', () => {
    expect(doiLoiGhi(loiDB('function public.wh_sua_dong(jsonb) does not exist', '42883')).message).toMatch(/chưa áp migration/)
    expect(doiLoiGhi(loiDB('permission denied for function wh_sua_dong', '42501')).message).toMatch(/chưa được cấp quyền ghi/)
  })
})
