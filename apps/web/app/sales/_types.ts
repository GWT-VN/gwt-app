// Kiểu dùng chung cho form ghi + server action khu Sales.

export type CatalogPick = {
  internal_code: string
  name: string
  category_l1: string | null
  category_l2: string | null
  ma_cu: string | null // mã cũ (search)
  ma_doitac: string | null // mã đối tác/kho (search)
  /** VAT theo mã — form tự điền khi chọn sản phẩm. null = chưa xếp loại (mục chi phí). */
  vat_pct: number | null
  vat_loai: 'VAT' | 'KCT' | 'KAD' | null
}

export type ChannelOpt = {
  id: number
  channel_l1: string | null
  channel_l2: string | null
}

export type NewOrderItem = {
  internal_code: string
  product_name: string
  category_l1: string | null
  category_l2: string | null
  quantity: number
  unit_price_vat: number
  is_gift: boolean
  vat_pct: number | null
  vat_loai: 'VAT' | 'KCT' | 'KAD' | null
  note: string | null
  /**
   * Dòng quà này do chương trình khuyến mãi nào sinh ra. `null` = nhân viên tự thêm.
   * Cần để tính chi phí chương trình, và để phân biệt quà theo chính sách với quà
   * nhân viên tự tặng — hai thứ chịu trách nhiệm khác nhau.
   */
  ctkm_id?: string | null
}

export type NewOrderInput = {
  customer_code: string | null
  phone: string | null
  customer_name: string | null
  address: string | null
  province: string | null
  order_date: string // YYYY-MM-DD
  channel_id: number | null
  partner_order_code: string | null
  status: string | null
  payment_status: string | null
  payment_method: string | null
  shipping_code: string | null
  install_date: string | null // YYYY-MM-DD
  note: string | null

  // ── Cột Sheet còn thiếu, bổ sung 22/08 để nhập được đơn thật trên app ──────
  /** Chi tiết kênh — ô chữ tự do, Sheet vẫn dùng cho ghi chú nguồn đơn. */
  channel_detail: string | null
  qua_tang: string | null
  su_dung_qua_tang: string | null
  tracking_url: string | null
  kich_hoat_bh: boolean
  email: string | null
  /** POE gọi "Tiền cọc đã thu", POU gọi "Số tiền đã cọc" — cùng một thứ. */
  tien_coc: number | null

  // POU
  gui_hdsd: boolean
  xuat_hoa_don: boolean
  da_doi_soat: boolean
  ngay_doi_soat: string | null

  // POE
  so_hd: string | null
  ten_goi_khach: string | null
  ten_folder: string | null
  ten_khach_theo_doi: string | null
  tien_se_thu: number | null
  bien_ban_xac_nhan: boolean
  bao_cao_lap_dat: boolean
  tien_do_lap_dat: string | null
  ngay_hoan_thanh_lap: string | null
  tu_dien: string | null
  version: string | null
  nghe_nghiep: string | null
  ngay_sinh: string | null
  gioi_tinh: string | null
  do_tuoi: string | null
  loai_nha: string | null
  tinh_trang_nha: string | null
  cong_ty_xuat_hd: string | null
  mst: string | null
  dia_chi_xuat_hd: string | null

  items: NewOrderItem[]
}

/** Giá trị mặc định cho các ô mới — dùng chung cho form và cho đơn cũ chưa có cột. */
export const DON_MAC_DINH = {
  channel_detail: null, qua_tang: null, su_dung_qua_tang: null, tracking_url: null,
  kich_hoat_bh: false, email: null, tien_coc: null,
  gui_hdsd: false, xuat_hoa_don: false, da_doi_soat: false, ngay_doi_soat: null,
  so_hd: null, ten_goi_khach: null, ten_folder: null, ten_khach_theo_doi: null,
  tien_se_thu: null, bien_ban_xac_nhan: false, bao_cao_lap_dat: false,
  tien_do_lap_dat: null, ngay_hoan_thanh_lap: null, tu_dien: null, version: null,
  nghe_nghiep: null, ngay_sinh: null, gioi_tinh: null, do_tuoi: null,
  loai_nha: null, tinh_trang_nha: null, cong_ty_xuat_hd: null, mst: null,
  dia_chi_xuat_hd: null,
} as const

/** Ô chỉ có nghĩa với một loại đơn — form ẩn bớt cho đỡ rối. */
export const O_THEO_TAB = {
  POE: ['so_hd', 'ten_goi_khach', 'ten_folder', 'ten_khach_theo_doi', 'tien_se_thu',
        'bien_ban_xac_nhan', 'bao_cao_lap_dat', 'tien_do_lap_dat', 'ngay_hoan_thanh_lap',
        'tu_dien', 'version', 'nghe_nghiep', 'ngay_sinh', 'gioi_tinh', 'do_tuoi',
        'loai_nha', 'tinh_trang_nha', 'cong_ty_xuat_hd', 'mst', 'dia_chi_xuat_hd'],
  POU: ['gui_hdsd', 'xuat_hoa_don', 'da_doi_soat', 'ngay_doi_soat', 'email'],
} as const

export type OrderFormInitial = NewOrderInput

export type CustomerInput = {
  name: string | null
  phone: string | null
  address: string | null
  province: string | null
  company_invoice: string | null
  tax_code: string | null
  note: string | null
  /** id trong dim_channel. Khách lẻ hưởng khuyến mãi theo kênh này. */
  channel_id: number | null
  email: string | null
  ngay_sinh: string | null
  dia_chi_cty: string | null
  sdt_cty: string | null
  email_cty: string | null
  nguoi_dai_dien: string | null
  chuc_vu_dai_dien: string | null
  /** email nhân viên trong `staff` — chọn từ danh sách, không gõ tay. */
  sales_owner: string | null
}

/**
 * Cột `customers` mà Apps Script GHI ĐÈ mỗi lần dựng lại DM_KHACH.
 * Sửa mấy ô này trong app là mất công — lần sync sau Sheet ghi lại từ đơn.
 * Đo từ `Code.gs:customersPayload` ngày 22/08/2026.
 * Bỏ được sau chặng B của `docs/sales/LO-TRINH-BO-APPSCRIPT.md`.
 */
export const O_SHEET_GIU = [
  'name', 'phone', 'address', 'province', 'company_invoice', 'tax_code', 'note',
] as const satisfies readonly (keyof CustomerInput)[]

export type CustomerHit = {
  customer_code: string
  name: string | null
  phone: string | null
  phone_chuan: string | null
  province: string | null
  province_moi: string | null
}

/**
 * Lựa chọn dropdown — CHÉP ĐÚNG hằng `TTHANG` / `TTTIEN` trong
 * `Sales Tracking/apps-script/Code.gs:120-122`, là nguồn chân lý của Google Sheet.
 *
 * ⚠️ Lệch hai danh sách này là lọc ra thiếu đơn mà không ai biết. Bản cũ (6 tình trạng
 * hàng / 4 thanh toán) thiếu 'Chuẩn bị hàng', 'Đã giao chờ lắp', 'Hoàn hàng', 'Đã cọc',
 * và ghi 'Hoàn thành' trong khi dữ liệu thật là 'Hoàn thành (Không lắp)'.
 * Đo prod 21/08: 'Hoàn thành (Không lắp)' 280 dòng · 'Đã giao chờ lắp' 53 · 'Đã cọc' 61.
 * Sửa danh mục ở Sheet thì phải sửa cả ở đây.
 */
export const FULFILL_OPTS = ['Mới', 'Xác nhận', 'Chuẩn bị hàng', 'Đang giao', 'Đã giao chờ lắp',
  'Đã lắp đặt', 'Hoàn thành (Không lắp)', 'Hoàn hàng', 'Huỷ'] as const
export const PAYMENT_OPTS = ['Chờ cọc', 'Đã cọc', 'Chờ đối soát', 'Còn nợ', 'Đã thu đủ'] as const
export const PAYMETHOD_OPTS = ['', 'Chuyển khoản', 'COD', 'Tiền mặt'] as const

/**
 * Lựa chọn VAT. Mỗi mục mang HAI thứ: thuế suất (`pct`, dạng PHÂN SỐ) và LOẠI (`loai`).
 *
 * Vì sao phải có `loai` riêng: `0%`, `KCT`, `KAD` đều ra tiền thuế **bằng 0** nhưng là
 * BA nhóm khác nhau khi in hoá đơn và gom báo cáo — CEO chốt 21/08/2026:
 *   VAT = chịu thuế (0 / 8 / 10%)
 *   KCT = KHÔNG CHỊU THUẾ  — muối (MUOIAD, MUOIDUC, MUOIRE)
 *   KAD = KHÔNG ÁP DỤNG    — bình gas sparkling (GASDEN*, GASXANH*)
 * Cột `vat_pct` là SỐ nên không chứa được chữ; đó là lý do sinh ra cột `vat_loai`.
 *
 * ⚠️ Thuế suất lưu PHÂN SỐ (0.08), khớp Google Sheet. Không có mức 5%.
 */
export type VatLoai = 'VAT' | 'KCT' | 'KAD'

export type VatOpt = { ma: string; nhan: string; pct: number | null; loai: VatLoai | null }

export const VAT_OPTS: VatOpt[] = [
  { ma: '', nhan: '—', pct: null, loai: null },
  { ma: 'VAT:0', nhan: '0%', pct: 0, loai: 'VAT' },
  { ma: 'VAT:0.08', nhan: '8%', pct: 0.08, loai: 'VAT' },
  { ma: 'VAT:0.1', nhan: '10%', pct: 0.1, loai: 'VAT' },
  { ma: 'KCT', nhan: 'KCT', pct: 0, loai: 'KCT' },
  { ma: 'KAD', nhan: 'KAD', pct: 0, loai: 'KAD' },
]

/** Khoá dropdown từ cặp (pct, loai) đang lưu. */
export function maVat(pct: number | null | undefined, loai: VatLoai | null | undefined): string {
  if (loai === 'KCT' || loai === 'KAD') return loai
  if (pct == null) return ''
  const p = Number(pct) > 1 ? Number(pct) / 100 : Number(pct)
  return VAT_OPTS.find((v) => v.loai === 'VAT' && v.pct === p)?.ma ?? ''
}

/** Nhãn hiển thị cho một dòng đơn: 'KCT' · 'KAD' · '8%' · '—'. */
export function nhanVat(pct: number | null | undefined, loai: VatLoai | null | undefined): string {
  if (loai === 'KCT' || loai === 'KAD') return loai
  if (pct == null) return '—'
  const p = Number(pct) > 1 ? Number(pct) / 100 : Number(pct)
  return `${Math.round(p * 100)}%`
}

/**
 * Nhãn tiếng Việt cho 31 ô Sheet bổ sung — dùng cho TRANG XEM đơn.
 *
 * CEO 24/08: *"ko biết có lưu hay ko vì ko hiển thị lại, trừ ghi chú các ô khác ko thấy
 * (chỉ có ấn vào sửa thì thấy)"*. Đúng: trang chi tiết đơn chỉ hiện Ghi chú, 30 ô còn lại
 * chỉ nhìn được khi bấm Sửa. Ô đã lưu mà không xem lại được thì với người dùng nó **y hệt
 * như chưa lưu** — và không ai kiểm tra được app có ghi đúng không.
 *
 * Nhãn để ở đây (cạnh `DON_MAC_DINH`) để form nhập và trang xem gọi cùng một danh sách,
 * thêm ô mới là hai nơi cùng biết.
 */
export const NHAN_O_SHEET: Record<string, string> = {
  channel_detail: 'Chi tiết kênh',
  qua_tang: 'Quà tặng đi kèm',
  su_dung_qua_tang: 'Sử dụng quà tặng',
  tracking_url: 'Link tracking',
  kich_hoat_bh: 'Kích hoạt bảo hành',
  email: 'Email khách',
  tien_coc: 'Số tiền đã cọc',
  gui_hdsd: 'Gửi HDSD',
  xuat_hoa_don: 'Xuất hoá đơn',
  da_doi_soat: 'Đã đối soát',
  ngay_doi_soat: 'Ngày nhận đối soát',
  so_hd: 'Số HĐ',
  ten_goi_khach: 'Tên gọi khách',
  ten_folder: 'Tên folder',
  ten_khach_theo_doi: 'Tên khách theo dõi',
  tien_se_thu: 'Tiền sẽ thu',
  bien_ban_xac_nhan: 'Biên bản xác nhận',
  bao_cao_lap_dat: 'Báo cáo lắp đặt',
  tien_do_lap_dat: 'Tiến độ lắp đặt',
  ngay_hoan_thanh_lap: 'Ngày hoàn thành lắp',
  tu_dien: 'Tủ điện',
  version: 'Version',
  nghe_nghiep: 'Nghề nghiệp',
  ngay_sinh: 'Ngày sinh',
  gioi_tinh: 'Giới tính',
  do_tuoi: 'Độ tuổi',
  loai_nha: 'Loại nhà',
  tinh_trang_nha: 'Tình trạng nhà',
  cong_ty_xuat_hd: 'Công ty xuất HĐ',
  mst: 'MST',
  dia_chi_xuat_hd: 'Địa chỉ xuất HĐ',
}

/** Ô nào thuộc khối nào trên TRANG XEM — cùng thứ tự với form nhập cho đỡ lạc mắt. */
export const KHOI_O_SHEET: Array<{ ten: string; o: string[] }> = [
  { ten: 'Quà tặng', o: ['qua_tang', 'su_dung_qua_tang'] },
  { ten: 'Theo dõi sau bán', o: ['email', 'kich_hoat_bh', 'gui_hdsd', 'xuat_hoa_don', 'da_doi_soat', 'ngay_doi_soat'] },
  { ten: 'Tiền', o: ['tien_coc', 'tien_se_thu'] },
  { ten: 'Hồ sơ & lắp đặt (POE)', o: ['so_hd', 'ten_goi_khach', 'ten_folder', 'ten_khach_theo_doi', 'tien_do_lap_dat', 'ngay_hoan_thanh_lap', 'tu_dien', 'bien_ban_xac_nhan', 'bao_cao_lap_dat'] },
  { ten: 'Khảo sát tại thời điểm lắp', o: ['version', 'nghe_nghiep', 'ngay_sinh', 'gioi_tinh', 'do_tuoi', 'loai_nha', 'tinh_trang_nha'] },
  { ten: 'Xuất hoá đơn cho công ty', o: ['cong_ty_xuat_hd', 'mst', 'dia_chi_xuat_hd'] },
]

/** Ô nào là ô TICK — trang xem phải hiện ✓/— chứ không phải chữ "true"/"false". */
export const O_TICK = new Set([
  'kich_hoat_bh', 'gui_hdsd', 'xuat_hoa_don', 'da_doi_soat', 'bien_ban_xac_nhan', 'bao_cao_lap_dat',
])

/** Ô nào là TIỀN — trang xem phải định dạng 1.234.567 đ. */
export const O_TIEN = new Set(['tien_coc', 'tien_se_thu'])

/** Ô nào là NGÀY. */
export const O_NGAY = new Set(['ngay_doi_soat', 'ngay_hoan_thanh_lap', 'ngay_sinh'])
