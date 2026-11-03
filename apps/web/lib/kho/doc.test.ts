import { describe, expect, it } from 'vitest'
import { taoKho, HAM_DOC, MOI_TRANG } from './doc'
import { nhanCanhBao, nhanTrangThai, linkTinDiscord } from './nhan'

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

describe('lib/kho/doc — sổ số lượng kho v2, CHỈ hàm đọc đã cấp cho kho_app_doc', () => {
  it('danh sách hàm đọc: đúng 5 hàm sổ, không có hàm ghi', () => {
    expect([...HAM_DOC].sort()).toEqual(['wh_app_bao_cao', 'wh_app_cho_duyet', 'wh_app_nhat_ky', 'wh_app_the_kho', 'wh_app_ton'])
    for (const f of HAM_DOC) expect(f).not.toMatch(/ghi|approve|reject|kiemke|_ap$/)
  })

  it('tham số đi qua placeholder ($1), không ghép chuỗi vào SQL', async () => {
    const { q, goi } = gia({ wh_app_nhat_ky: { tong: 0, dong: [] } })
    await taoKho(q).nhatKy({ tuKhoa: "x'; drop table wh_master; --" })
    expect(goi[0].sql).toBe('select public.wh_app_nhat_ky($1::jsonb) r')
    expect(JSON.parse(goi[0].ts[0] as string)).toMatchObject({ tu_khoa: "x'; drop table wh_master; --" })
  })

  it('nhatKy: bộ lọc trang → tham số hàm, bỏ ô trống, phân trang', async () => {
    const { q, goi } = gia({ wh_app_nhat_ky: { tong: 250, dong: [{ id: 1 }] } })
    const r = await taoKho(q).nhatKy({ kho: 'NX', loai: 'Xuất', trangThai: '', tuNgay: '2026-11-01', trang: 3 })
    expect(JSON.parse(goi[0].ts[0] as string)).toEqual({ kho: 'NX', loai: 'Xuất', tu_ngay: '2026-11-01', gioi_han: MOI_TRANG, bo_qua: 2 * MOI_TRANG })
    expect(r.tong).toBe(250)
  })

  it('ton: số dạng chuỗi (numeric của Postgres) → number; tổng hợp số mã / sắp hết / âm', async () => {
    const { q } = gia({ wh_app_ton: { kho: 'NX', cho_duyet: 3, ghi_gan_nhat: '2026-11-03T10:00:00Z', dong: [
      { internal_code: 'A', ten: 'Aa', danh_muc: 'POU', don_vi: 'Cái', tong_nhap: '6', tong_xuat: '3', dieu_chinh: '-1', ton: '2', ton_toi_thieu: '5', cap_nhat: '2026-11-02', canh_bao: 'sap_het' },
      { internal_code: 'B', ten: 'Bb', danh_muc: 'POU', don_vi: null, tong_nhap: '1', tong_xuat: '2', dieu_chinh: '0', ton: '-1', ton_toi_thieu: null, cap_nhat: '2026-11-02', canh_bao: 'am' },
    ] } })
    const r = await taoKho(q).ton()
    expect(r.dong[0].ton).toBe(2); expect(r.dong[0].dieu_chinh).toBe(-1); expect(r.dong[1].ton_toi_thieu).toBeNull()
    expect(r.tom).toEqual({ soMa: 2, sapHet: 1, am: 1, choDuyet: 3 })
  })

  it('theKho: mã rỗng → không gọi DB', async () => {
    const { q, goi } = gia({})
    expect(await taoKho(q).theKho('  ')).toBeNull()
    expect(goi).toHaveLength(0)
  })

  it('lỗi DB: không lộ chuỗi kết nối ra ngoài', async () => {
    const q = async () => { throw new Error('connect ECONNREFUSED postgres://kho_app_doc:matkhau@db.x.supabase.co:6543/postgres') }
    await expect(taoKho(q).choDuyet()).rejects.toThrow(/^Chưa đọc được dữ liệu kho/)
    await expect(taoKho(q).choDuyet()).rejects.not.toThrow(/matkhau/)
  })
})

describe('lib/kho/nhan', () => {
  it('trạng thái dòng sổ, cảnh báo tồn, link tin Discord kho NX', () => {
    expect(nhanTrangThai('approved')).toBe('đã vào sổ')
    expect(nhanTrangThai('need_review')).toBe('chờ duyệt mã')
    expect(nhanCanhBao('sap_het')).toBe('Sắp hết')
    expect(nhanCanhBao(null)).toBe('')
    expect(linkTinDiscord('1500000000000000001')).toMatch(/discord\.com\/channels\/\d+\/1484056527173062737\/1500000000000000001$/)
    expect(linkTinDiscord('seed-x')).toBeNull()
  })
})
