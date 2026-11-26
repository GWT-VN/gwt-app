// PROTOTYPE vứt đi — ticket Demo (không PII) khi DB local chưa có ticket nào. Chỉ dùng trong bộ nhớ, không ghi DB.
import type { Ticket } from '@/app/actions'

const ngay = (truoc: number, gio = 9) => {
  const d = new Date()
  d.setDate(d.getDate() - truoc)
  d.setHours(gio, 0, 0, 0)
  return d.toISOString()
}

type Mau = [ma: string, khach: string, may: string, loi: string, state: Ticket['state'], khan: boolean, loai: string, truoc: number, cs: string | null, kt: string | null]

const MAU: Mau[] = [
  ['DEMO-1001', 'Công ty Demo An Phát', 'Máy lọc nước GE CTS20', 'CTS20 · Báo lỗi E3', 'Open', true, 'Bảo hành', 0, 'CS Demo Lan', 'KT Demo Hùng'],
  ['DEMO-1002', 'Nhà hàng Demo Sen Vàng', 'Máy lọc nước GE GN610', 'GN610 · Không ra nước nóng', 'Open', true, 'Sửa chữa', 1, 'CS Demo Mai', null],
  ['DEMO-1003', 'Trường Demo Bình Minh', 'Máy lọc nước GE GN620', 'GN620 · Rò nước dưới tủ', 'Open', false, 'Bảo hành', 1, 'CS Demo Lan', 'KT Demo Nam'],
  ['DEMO-1004', 'Anh Demo Khoa', 'Máy lọc nước GE CTS20', 'CTS20 · Nước có mùi', 'Open', false, 'Tư vấn', 2, null, null],
  ['DEMO-1005', 'Khách sạn Demo Cát Tường', 'Máy lọc nước GE GN610', 'GN610 · Kêu to khi chạy', 'Open', false, 'Sửa chữa', 3, 'CS Demo Mai', 'KT Demo Hùng'],
  ['DEMO-1006', 'Chị Demo Hạnh', 'Máy lọc nước GE CTS10 (màu trắng)', 'CTS10 · Thay lõi định kỳ', 'Open', false, 'Thay lõi', 4, 'CS Demo Lan', null],
  ['DEMO-1007', 'Văn phòng Demo Đông Á', 'Máy lọc nước GE GN620', 'GN620 · Áp yếu', 'Open', false, 'Bảo hành', 6, 'CS Demo Mai', 'KT Demo Nam'],
  ['DEMO-1008', 'Công ty Demo Hoà Bình', 'Máy lọc nước GE CTS20', 'CTS20 · Lắp đặt mới', 'Done', false, 'Lắp đặt', 7, 'CS Demo Lan', 'KT Demo Hùng'],
  ['DEMO-1009', 'Anh Demo Tuấn', 'Máy lọc nước GE GN610', 'GN610 · Báo lỗi E1', 'Done', false, 'Bảo hành', 9, 'CS Demo Mai', 'KT Demo Nam'],
  ['DEMO-1010', 'Quán cà phê Demo Mộc', 'Máy lọc nước GE CTS10 (màu trắng)', 'CTS10 · Hỏi giá lõi', 'Done', false, 'Tư vấn', 12, 'CS Demo Lan', null],
  ['DEMO-1011', 'Chị Demo Vy', 'Máy lọc nước GE CTS20', 'CTS20 · Khách đổi ý', 'Cancel', false, 'Sửa chữa', 15, 'CS Demo Mai', null],
  ['DEMO-1012', 'Phòng khám Demo An Tâm', 'Máy lọc nước GE GN620', 'GN620 · Báo lỗi E3', 'Open', false, 'Bảo hành', 5, null, null],
]

export const TICKET_DEMO: Ticket[] = MAU.map(([ma, khach, may, loi, state, khan, loai, truoc, cs, kt], i) => ({
  ticket_code: ma,
  state,
  ticket_type: loai,
  description: `Demo: khách báo "${loi.split(' · ')[1]}" — nội dung minh hoạ, không phải dữ liệu thật.`,
  last_note: i % 3 === 0 ? null : 'Demo: đã gọi khách, hẹn kỹ thuật qua kiểm tra.',
  khan,
  province: ['TP.HCM', 'Hà Nội', 'Đà Nẵng'][i % 3],
  created_at: ngay(truoc + 1),
  serial: `DEMO-SN-${2400 + i}`,
  source_serial: `DEMO-SN-${2400 + i}`,
  product_name: may,
  internal_code: null,
  may_khong_trong_he_thong: false,
  customer_id: null,
  customer_name: khach,
  primary_phone: `0900000${String(100 + i)}`,
  warranty_activated: i % 4 !== 3,
  warranty_full_end: null,
  con_han_may: i % 5 !== 4,
  con_han_loi: null,
  cs_phu_trach: cs,
  ky_thuat: kt,
  cs_ten: cs,
  ky_thuat_ten: kt,
  hoat_dong_cuoi: ngay(truoc, 10 + (i % 6)),
  moi: truoc === 0,
  dong_may: [
    { nhan: loi, serial: `DEMO-SN-${2400 + i}`, chuaPhanLoai: false, loi_code: `DEMO-LOI-${i}`, loi_ten: loi.split(' · ')[1], internal_code: loi.split(' · ')[0] },
  ],
}))

/** Lọc Demo theo đúng tham số tab của server (state / khan / mine) + từ khoá, để tab trong prototype có hiệu lực. */
export function locDemo(sp: { state?: string; khan?: string; mine?: string; q?: string }) {
  const q = sp.q?.toLocaleLowerCase('vi')
  return TICKET_DEMO.filter(
    (t) =>
      (sp.khan === '1' ? t.khan && t.state === 'Open' : sp.state ? t.state === sp.state : true) &&
      (sp.mine !== '1' || t.cs_ten === 'CS Demo Lan') &&
      (!q || `${t.ticket_code} ${t.customer_name} ${t.product_name} ${t.description}`.toLocaleLowerCase('vi').includes(q)),
  ).sort((a, b) => Number(b.khan) - Number(a.khan) || b.hoat_dong_cuoi!.localeCompare(a.hoat_dong_cuoi!))
}

/** "Của tôi" / "Tôi" của ticket Demo (Demo không gắn người thật đang đăng nhập). */
export const TOI_DEMO = 'CS Demo Lan'
