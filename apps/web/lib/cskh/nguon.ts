/**
 * Nguồn dữ liệu CSKH v2: 'md' = GWT-Masterdata (`customer_care.*`), 'st' = GWT-SalesTracking như trước. Chỉ đúng
 * `CSKH_NGUON=md` mới bật MD — trống / gõ sai đều về 'st' (app chạy y như cũ). Đọc env server → chỉ gọi phía server.
 */
export const cskhNguon = (): 'md' | 'st' => (process.env.CSKH_NGUON === 'md' ? 'md' : 'st')
