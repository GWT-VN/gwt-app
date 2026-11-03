import { describe, expect, it } from 'vitest'
import { taoKho, HAM_DOC } from './doc'
import { n, nhanLoaiPhieu } from './nhan'

/** Bộ truy vấn giả: ghi lại câu SQL + tham số, trả kết quả dựng sẵn theo tên hàm. */
function gia(traVe: Record<string, unknown>) {
  const goi: { sql: string; ts: unknown[] }[] = []
  const q = async (sql: string, ts: unknown[]) => {
    goi.push({ sql, ts })
    const fn = /public\.(wh_[a-z_]+)\(/.exec(sql)?.[1] ?? ''
    return [{ r: traVe[fn] }]
  }
  return { q, goi }
}

describe('lib/kho/doc — chỉ gọi hàm ĐỌC đã cấp cho kho_app_doc', () => {
  it('danh sách hàm đọc khớp đúng quyền đã cấp ở DB (không có hàm ghi)', () => {
    expect([...HAM_DOC].sort()).toEqual([
      'wh_dia_diem_ds', 'wh_doi_chieu_so', 'wh_ds_giao_dich', 'wh_ds_kiem_ke', 'wh_ds_may', 'wh_kiem_ke_doi_chieu',
      'wh_may_can_xu_ly', 'wh_ton_serial', 'wh_tong_hop_sheet', 'wh_tra_serial',
    ])
    for (const f of HAM_DOC) expect(f).not.toMatch(/ghi|_ap$|cap_quyen|cau_hinh|dong_bo_xong/)
  })

  it('tham số đi qua placeholder ($1), không ghép chuỗi vào SQL', async () => {
    const { q, goi } = gia({ wh_ds_may: { tong: 0, dong: [] } })
    await taoKho(q).dsMay({ tuKhoa: "x'; drop table wh_may; --" })
    expect(goi[0].sql).toBe('select public.wh_ds_may($1::jsonb) r')
    expect(JSON.parse(goi[0].ts[0] as string)).toMatchObject({ tu_khoa: "x'; drop table wh_may; --" })
  })

  it('dsMay: chuyển bộ lọc trang sang tham số hàm, bỏ ô trống, phân trang 100/trang', async () => {
    const { q, goi } = gia({ wh_ds_may: { tong: 3, dong: [{ id: 1 }] } })
    const r = await taoKho(q).dsMay({ diaDiem: 'KHO_NX', tinhTrang: '', trang: 3 })
    expect(JSON.parse(goi[0].ts[0] as string)).toEqual({ dia_diem: 'KHO_NX', gioi_han: 100, bo_qua: 200 })
    expect(r).toEqual({ tong: 3, dong: [{ id: 1 }] })
  })

  it('tonKho: gộp dòng tồn theo model, tính tổng trong kho / ngoài kho', async () => {
    const { q } = gia({
      wh_tong_hop_sheet: {
        ton: [
          { internal_code: 'CTD50NG', ten: 'CTD50', dia_diem: 'KHO_NX', dia_diem_ten: 'Kho Nguyễn Xiển', loai_dia_diem: 'kho', tinh_trang: 'moi', so_luong: 2, serials: ['A', 'B'] },
          { internal_code: 'CTD50NG', ten: 'CTD50', dia_diem: 'KHO_NX', dia_diem_ten: 'Kho Nguyễn Xiển', loai_dia_diem: 'kho', tinh_trang: 'chua_dinh_danh', so_luong: 6, serials: [] },
          { internal_code: 'CTD50NG', ten: 'CTD50', dia_diem: 'X', dia_diem_ten: 'Cơ sở X', loai_dia_diem: 'kiem_dinh', tinh_trang: 'moi', so_luong: 1, serials: ['C'] },
        ],
        can_xu_ly: [], doi_soat: [],
      },
    })
    const r = await taoKho(q).tonKho()
    expect(r.theoModel).toEqual([{ internal_code: 'CTD50NG', ten: 'CTD50', trongKho: 8, ngoaiKho: 1, chuaSerial: 6, tong: 9 }])
    expect(r.dong).toHaveLength(3)
  })

  it('traSerial rỗng → không gọi DB', async () => {
    const { q, goi } = gia({})
    expect(await taoKho(q).traSerial('  ')).toEqual({ tim_thay: false, serial: '' })
    expect(goi).toHaveLength(0)
  })

  it('lỗi DB: không lộ chuỗi kết nối ra ngoài', async () => {
    const q = async () => { throw new Error('connect ECONNREFUSED postgres://kho_app_doc:matkhau@db.x.supabase.co:6543/postgres') }
    await expect(taoKho(q).dsKiemKe()).rejects.toThrow(/^Chưa đọc được dữ liệu kho/)
    await expect(taoKho(q).dsKiemKe()).rejects.not.toThrow(/matkhau/)
  })
})

describe('lib/kho/nhan — nhãn tiếng Việt như Sheet', () => {
  it('mã → nhãn; mã lạ giữ nguyên; trống → chuỗi rỗng', () => {
    expect(n('da_qua_su_dung')).toBe('đã qua sử dụng')
    expect(n('chua_dinh_danh')).toBe('chưa định danh (chưa có serial)')
    expect(n('ma_la')).toBe('ma_la')
    expect(n(null)).toBe('')
    expect(nhanLoaiPhieu('nhap', 'hang_moi')).toBe('Nhập kho — hàng mới')
    expect(nhanLoaiPhieu('dieu_chuyen', 'dieu_chuyen')).toBe('Điều chuyển')
  })
})
