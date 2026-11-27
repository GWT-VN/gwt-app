// Tab của BH chờ kích hoạt (khuôn Ticket F — docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). File THƯỜNG (server + client).

/** Tham số URL thuộc "bộ lọc" của tab: tìm + nguồn (view v_bh_cho_kich_hoat; `cho_serial` = máy kích hoạt bằng mã tạm). */
export const KHOA_LOC_BH = ['q', 'nguon']

/** Tab cố định = hàng nút nguồn cũ (cùng tham số `nguon`, link cũ giữ nguyên nghĩa). */
export const TAB_BH = [
  { v: 'tat-ca', ten: 'Tất cả', loc: '' },
  { v: 'da-lap', ten: 'Đã lắp — bấm là xong', loc: 'nguon=da_lap_chua_kich_hoat' },
  { v: 'don-ban', ten: 'Đơn bán — cần điền serial', loc: 'nguon=don_sales_chua_gan_may' },
  // 18/11: đã kích hoạt BH khi chưa có serial (mã tạm TAM…) — còn phải bổ sung serial thật.
  { v: 'cho-serial', ten: 'Đã kích hoạt — chờ bổ sung serial', loc: 'nguon=cho_serial' },
]
