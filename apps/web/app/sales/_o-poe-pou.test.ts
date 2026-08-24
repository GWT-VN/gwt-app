import { describe, it, expect } from 'vitest'
import { oSheetBoSung } from './_calc'
import { DON_MAC_DINH } from './_types'
import type { NewOrderInput } from './_types'

/**
 * "Điền vào các ô POE / POU thì có LƯU không?" — CEO hỏi 24/08/2026.
 *
 * Bài test này trả lời phần app kiểm soát được: mọi ô trên form có ra đúng một cột khi
 * ghi xuống, đúng kiểu dữ liệu, và không ô nào bị rơi giữa đường.
 *
 * `COT_SALES_ORDERS` là danh sách cột THẬT của `public.sales_orders` trên production,
 * đọc ngày 24/08/2026. Nó ở đây để bắt CA HỎNG NGUY HIỂM NHẤT: ai đó thêm một ô vào form
 * mà quên chạy migration. Lúc đó Postgres từ chối cả câu insert -> **mất trắng cả đơn**,
 * chứ không phải mất mỗi ô đó. Test đỏ ở đây rẻ hơn nhiều so với phát hiện lúc lên đơn.
 */
const COT_SALES_ORDERS = new Set([
  'channel_detail', 'qua_tang', 'su_dung_qua_tang', 'tracking_url', 'kich_hoat_bh', 'email',
  'tien_coc', 'gui_hdsd', 'xuat_hoa_don', 'da_doi_soat', 'ngay_doi_soat',
  'so_hd', 'ten_goi_khach', 'ten_folder', 'ten_khach_theo_doi', 'tien_se_thu',
  'bien_ban_xac_nhan', 'bao_cao_lap_dat', 'tien_do_lap_dat', 'ngay_hoan_thanh_lap', 'tu_dien',
  'version', 'nghe_nghiep', 'ngay_sinh', 'gioi_tinh', 'do_tuoi', 'loai_nha', 'tinh_trang_nha',
  'cong_ty_xuat_hd', 'mst', 'dia_chi_xuat_hd',
])

/** Phần khung của một đơn — không phải thứ bài test này quan tâm, chỉ để đủ kiểu. */
const KHUNG = {
  ...DON_MAC_DINH,
  customer_code: null, phone: null, customer_name: null, address: null, province: null,
  channel_id: null, partner_order_code: null, status: null, payment_status: null,
  payment_method: null, shipping_code: null, install_date: null, note: null,
  order_date: '2026-08-24',
  items: [],
}

const DAY_DU: NewOrderInput = {
  ...KHUNG,
  // POU
  email: 'a@b.vn', gui_hdsd: true, xuat_hoa_don: true, da_doi_soat: true, ngay_doi_soat: '2026-08-20',
  kich_hoat_bh: true,
  // chung
  channel_detail: 'Shop A', qua_tang: '02 lõi PCF', su_dung_qua_tang: '01 lõi PCF (27/6)',
  tracking_url: 'https://vtp/abc', tien_coc: 5_000_000,
  // POE
  so_hd: 'HD-2026-01', ten_goi_khach: 'anh Ba', ten_folder: 'BA-2026', ten_khach_theo_doi: 'Ba SG',
  tien_se_thu: 12_000_000, bien_ban_xac_nhan: true, bao_cao_lap_dat: true,
  tien_do_lap_dat: 'Đã lắp 50%', ngay_hoan_thanh_lap: '2026-09-01', tu_dien: 'Tủ ngoài trời',
  version: 'V3', nghe_nghiep: 'Kỹ sư', ngay_sinh: '1985-04-02', gioi_tinh: 'Nam',
  do_tuoi: '40-50', loai_nha: 'Nhà phố', tinh_trang_nha: 'Đang ở',
  cong_ty_xuat_hd: 'CTY TNHH X', mst: '0101234567', dia_chi_xuat_hd: '12 Lê Lợi',
}

describe('oSheetBoSung — ô POE/POU có xuống DB không', () => {
  it('mọi ô đều ra đúng một cột CÓ THẬT trong sales_orders', () => {
    const ra = oSheetBoSung(DAY_DU)
    const thua = Object.keys(ra).filter((k) => !COT_SALES_ORDERS.has(k))
    expect(thua, 'ô này chưa có cột trong DB — insert sẽ hỏng CẢ ĐƠN, phải chạy migration').toEqual([])
    expect(Object.keys(ra).length).toBe(COT_SALES_ORDERS.size)
  })

  it('giữ nguyên giá trị đã điền, không nuốt ô nào', () => {
    const ra = oSheetBoSung(DAY_DU) as Record<string, unknown>
    expect(ra.so_hd).toBe('HD-2026-01')
    expect(ra.nghe_nghiep).toBe('Kỹ sư')
    expect(ra.tu_dien).toBe('Tủ ngoài trời')
    expect(ra.dia_chi_xuat_hd).toBe('12 Lê Lợi')
    expect(ra.tien_se_thu).toBe(12_000_000)
    expect(ra.tien_coc).toBe(5_000_000)
    expect(ra.ngay_hoan_thanh_lap).toBe('2026-09-01')
    expect(ra.ngay_doi_soat).toBe('2026-08-20')
    // Ô tick phải ra boolean thật, không phải chuỗi 'true' — cột DB là boolean.
    for (const k of ['gui_hdsd', 'xuat_hoa_don', 'da_doi_soat', 'bien_ban_xac_nhan', 'bao_cao_lap_dat', 'kich_hoat_bh']) {
      expect(typeof ra[k], k).toBe('boolean')
      expect(ra[k], k).toBe(true)
    }
    // Không ô chữ nào đã điền mà xuống DB thành null.
    const rong = Object.entries(ra).filter(([, v]) => v == null).map(([k]) => k)
    expect(rong, 'ô đã điền nhưng xuống DB thành null').toEqual([])
  })

  it('ô để trống xuống null chứ không phải chuỗi rỗng hay số 0', () => {
    const ra = oSheetBoSung({ ...KHUNG }) as Record<string, unknown>
    expect(ra.so_hd).toBeNull()
    expect(ra.ngay_sinh).toBeNull()
    // Ngày rỗng phải là null: chuỗi '' đẩy vào cột date là Postgres ném lỗi, hỏng cả đơn.
    expect(ra.ngay_doi_soat).toBeNull()
    expect(ra.ngay_hoan_thanh_lap).toBeNull()
    // Tiền để trống là CHƯA BIẾT, không phải 0 đồng — 0 đọc ra là "khách không nợ gì".
    expect(ra.tien_coc).toBeNull()
    expect(ra.tien_se_thu).toBeNull()
    // Ô tick không đụng tới vẫn phải là false, không undefined (cột NOT NULL).
    expect(ra.gui_hdsd).toBe(false)
  })

  it('khoảng trắng thừa bị cắt, ô toàn khoảng trắng thành null', () => {
    const ra = oSheetBoSung({ ...KHUNG, so_hd: '  HD-9  ', tu_dien: '   ' }) as Record<string, unknown>
    expect(ra.so_hd).toBe('HD-9')
    expect(ra.tu_dien).toBeNull()
  })
})
