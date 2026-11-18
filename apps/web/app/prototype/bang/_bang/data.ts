// PROTOTYPE — dữ liệu ticket GIẢ (tên khách bịa, không lấy từ DB). Trường theo spec v2 mục 7.7 (đặc tả CSKH 17/11).
export type TrangThai = 'Mới' | 'Đang xử lý' | 'Chờ' | 'Chờ khách xác nhận' | 'Đóng' | 'Huỷ'
export type UuTien = 'P1' | 'P2' | 'P3' | 'P4'
export type NhomLoi = 'Main' | 'Rò rỉ nước' | 'Chất lượng nước' | 'App' | 'Chưa phân loại'
export type Nguon = 'App' | 'Discord' | 'Sheet' | 'Zalo'

export type Ticket = {
  ma: string
  khach: string
  luuY?: boolean
  may: string
  serial?: string
  nhom: NhomLoi
  uu: UuTien
  tt: TrangThai
  lyDoCho?: 'khách' | 'KT' | 'vật tư' | 'hãng' | 'duyệt'
  chu: string
  viecTiep: string
  nguoiLam: string
  han: string // YYYY-MM-DD HH:mm
  moNgay: number
  nguon: Nguon
  hoiLai: number
  capNhat: string
}

export const HOM_NAY = '2026-11-18'
export const TT_LIST: TrangThai[] = ['Mới', 'Đang xử lý', 'Chờ', 'Chờ khách xác nhận', 'Đóng', 'Huỷ']
export const UU_LIST: UuTien[] = ['P1', 'P2', 'P3', 'P4']
export const NHAN_VIEN = ['Hiệp', 'Hiền', 'Kiều Trang', 'Tuyết Trang', 'anh Như', 'anh Tuấn']
export const LY_DO_CHO = ['khách', 'KT', 'vật tư', 'hãng', 'duyệt'] as const

const t = (x: Omit<Ticket, 'hoiLai' | 'capNhat'> & Partial<Pick<Ticket, 'hoiLai' | 'capNhat'>>): Ticket => ({ hoiLai: 0, capNhat: 'hôm qua', ...x })

export const TICKETS: Ticket[] = [
  t({ ma: 'TK-2611-042', khach: 'Nguyễn Văn An', luuY: true, may: 'CTS20', serial: 'V9L2304A1123', nhom: 'Rò rỉ nước', uu: 'P1', tt: 'Đang xử lý', chu: 'Hiệp', viecTiep: 'Cử KT kiểm tra rò nước đáy máy', nguoiLam: 'anh Như', han: '2026-11-18 11:00', moNgay: 1, nguon: 'Discord', hoiLai: 2, capNhat: '25 phút trước' }),
  t({ ma: 'TK-2611-043', khach: 'Trần Thị Bình', may: 'CTS20', serial: 'V9L2304A0871', nhom: 'Main', uu: 'P2', tt: 'Đang xử lý', chu: 'Kiều Trang', viecTiep: 'Gọi hướng dẫn xử lý màn hình báo E4', nguoiLam: 'Kiều Trang', han: '2026-11-17 17:00', moNgay: 3, nguon: 'App', hoiLai: 1, capNhat: '1 giờ trước' }),
  t({ ma: 'TK-2611-039', khach: 'Công ty TNHH Minh Phát', luuY: true, may: 'CTD50', nhom: 'Main', uu: 'P2', tt: 'Chờ', lyDoCho: 'duyệt', chu: 'Hiền', viecTiep: 'Chờ CEO duyệt miễn phí thay bơm', nguoiLam: 'Hiền', han: '2026-11-16 12:00', moNgay: 6, nguon: 'Zalo', capNhat: '2 ngày trước' }),
  t({ ma: 'TK-2611-040', khach: 'Phạm Thu Hà', may: 'WH15A', serial: 'W15A2210B044', nhom: 'Chất lượng nước', uu: 'P3', tt: 'Chờ', lyDoCho: 'khách', chu: 'Tuyết Trang', viecTiep: 'Chờ khách gửi video vòi nước', nguoiLam: 'Phạm Thu Hà', han: '2026-11-18 17:30', moNgay: 4, nguon: 'App' }),
  t({ ma: 'TK-2611-044', khach: 'Lê Quốc Huy', may: 'CTS10', nhom: 'Chưa phân loại', uu: 'P3', tt: 'Mới', chu: 'Hiệp', viecTiep: 'Gọi khách xác nhận lỗi', nguoiLam: 'Hiệp', han: '2026-11-18 15:00', moNgay: 0, nguon: 'Discord', capNhat: '10 phút trước' }),
  t({ ma: 'TK-2611-045', khach: 'Khách sạn Sen Vàng', luuY: true, may: 'CTD50', serial: 'D50-2306-0192', nhom: 'Rò rỉ nước', uu: 'P1', tt: 'Mới', chu: 'Hiền', viecTiep: 'Báo KT trưởng, xếp lịch trong ngày', nguoiLam: 'Hiền', han: '2026-11-18 10:00', moNgay: 0, nguon: 'Zalo', hoiLai: 1, capNhat: '5 phút trước' }),
  t({ ma: 'TK-2611-031', khach: 'Đỗ Minh Khoa', may: 'CTS20', serial: 'V9L2303A0912', nhom: 'Main', uu: 'P3', tt: 'Chờ', lyDoCho: 'khách', chu: 'Tuyết Trang', viecTiep: 'Chờ khách gửi ảnh đáy máy', nguoiLam: 'Đỗ Minh Khoa', han: '2026-11-18 18:00', moNgay: 9, nguon: 'App', hoiLai: 3 }),
  t({ ma: 'TK-2611-028', khach: 'Vũ Lan Anh', may: 'CTS10', nhom: 'Main', uu: 'P2', tt: 'Chờ', lyDoCho: 'hãng', chu: 'Hiền', viecTiep: 'Chờ hãng trả bo mạch CTS10', nguoiLam: 'Hiền', han: '2026-11-20 12:00', moNgay: 12, nguon: 'Sheet', capNhat: '3 ngày trước' }),
  t({ ma: 'TK-2611-033', khach: 'Hoàng Gia Bảo', may: 'CTS20', serial: 'V9L2305A0333', nhom: 'App', uu: 'P4', tt: 'Đang xử lý', chu: 'Kiều Trang', viecTiep: 'Hướng dẫn kết nối lại wifi qua app', nguoiLam: 'Kiều Trang', han: '2026-11-19 10:00', moNgay: 5, nguon: 'App' }),
  t({ ma: 'TK-2611-035', khach: 'Trường MN Hoa Mai', luuY: true, may: 'CTD50', nhom: 'Chất lượng nước', uu: 'P2', tt: 'Chờ', lyDoCho: 'vật tư', chu: 'Hiệp', viecTiep: 'Chờ lõi RO về kho NX', nguoiLam: 'Hiệp', han: '2026-11-19 09:00', moNgay: 7, nguon: 'Zalo', hoiLai: 1 }),
  t({ ma: 'TK-2611-036', khach: 'Bùi Thanh Tâm', may: 'WH15A', nhom: 'Rò rỉ nước', uu: 'P2', tt: 'Chờ', lyDoCho: 'KT', chu: 'Hiền', viecTiep: 'KT xếp lịch thay van', nguoiLam: 'anh Tuấn', han: '2026-11-18 16:00', moNgay: 5, nguon: 'Discord' }),
  t({ ma: 'TK-2611-030', khach: 'Ngô Đức Long', may: 'CTS20', serial: 'V9L2302A0710', nhom: 'Main', uu: 'P3', tt: 'Chờ khách xác nhận', chu: 'Tuyết Trang', viecTiep: 'Gọi khách xác nhận máy chạy ổn', nguoiLam: 'Tuyết Trang', han: '2026-11-19 15:00', moNgay: 10, nguon: 'App' }),
  t({ ma: 'TK-2611-029', khach: 'Đặng Thu Trang', may: 'CTS10', nhom: 'Chất lượng nước', uu: 'P4', tt: 'Chờ khách xác nhận', chu: 'Kiều Trang', viecTiep: 'Gửi báo cáo sau dịch vụ qua Zalo', nguoiLam: 'Kiều Trang', han: '2026-11-18 14:00', moNgay: 11, nguon: 'Zalo' }),
  t({ ma: 'TK-2611-046', khach: 'Phan Văn Tài', may: 'CTS20', nhom: 'Chưa phân loại', uu: 'P3', tt: 'Mới', chu: 'Kiều Trang', viecTiep: 'Phân loại lỗi, hỏi thêm serial', nguoiLam: 'Kiều Trang', han: '2026-11-18 17:00', moNgay: 0, nguon: 'Discord', capNhat: 'vừa xong' }),
  t({ ma: 'TK-2611-025', khach: 'Mai Hồng Nhung', may: 'WH15A', serial: 'W15A2209B118', nhom: 'Main', uu: 'P3', tt: 'Đang xử lý', chu: 'Hiệp', viecTiep: 'Đặt linh kiện cảm biến nhiệt', nguoiLam: 'Hiệp', han: '2026-11-21 12:00', moNgay: 14, nguon: 'Sheet' }),
  t({ ma: 'TK-2611-037', khach: 'Công ty CP Thành Đạt', may: 'CTD50', serial: 'D50-2304-0077', nhom: 'Rò rỉ nước', uu: 'P2', tt: 'Đang xử lý', chu: 'Hiền', viecTiep: 'KT thay gioăng bình áp', nguoiLam: 'anh Như', han: '2026-11-18 13:30', moNgay: 4, nguon: 'App', hoiLai: 1 }),
  t({ ma: 'TK-2611-020', khach: 'Lý Thị Mai', may: 'CTS10', nhom: 'Main', uu: 'P4', tt: 'Đóng', chu: 'Tuyết Trang', viecTiep: '—', nguoiLam: '—', han: '2026-11-15 12:00', moNgay: 0, nguon: 'App', capNhat: '3 ngày trước' }),
  t({ ma: 'TK-2611-018', khach: 'Trịnh Văn Hùng', may: 'CTS20', nhom: 'Chất lượng nước', uu: 'P3', tt: 'Đóng', chu: 'Hiệp', viecTiep: '—', nguoiLam: '—', han: '2026-11-14 12:00', moNgay: 0, nguon: 'Discord', capNhat: '4 ngày trước' }),
  t({ ma: 'TK-2611-022', khach: 'Cao Minh Tuấn', may: 'WH15A', nhom: 'App', uu: 'P4', tt: 'Huỷ', chu: 'Kiều Trang', viecTiep: '—', nguoiLam: '—', han: '2026-11-15 12:00', moNgay: 0, nguon: 'Zalo', capNhat: '3 ngày trước' }),
  t({ ma: 'TK-2611-038', khach: 'Dương Quỳnh Như', may: 'CTS20', serial: 'V9L2306A0055', nhom: 'Main', uu: 'P3', tt: 'Đang xử lý', chu: 'Tuyết Trang', viecTiep: 'Gửi video hướng dẫn reset máy', nguoiLam: 'Tuyết Trang', han: '2026-11-18 16:30', moNgay: 2, nguon: 'App' }),
  t({ ma: 'TK-2611-041', khach: 'Nhà hàng Bếp Quê', may: 'CTD50', nhom: 'Chất lượng nước', uu: 'P2', tt: 'Mới', chu: 'Hiệp', viecTiep: 'Hẹn lấy mẫu nước kiểm TDS', nguoiLam: 'anh Tuấn', han: '2026-11-19 09:30', moNgay: 1, nguon: 'Zalo' }),
  t({ ma: 'TK-2611-034', khach: 'Tạ Quang Vinh', may: 'CTS10', serial: 'C10-2301-0904', nhom: 'Rò rỉ nước', uu: 'P3', tt: 'Chờ', lyDoCho: 'vật tư', chu: 'Hiền', viecTiep: 'Chờ ống nối 6 ly về kho', nguoiLam: 'Hiền', han: '2026-11-20 10:00', moNgay: 6, nguon: 'App' }),
]

// danh sách khách GIẢ (prototype, không PII): gom từ ticket mẫu; mã KH, khu vực, đuôi SĐT là số bịa.
// Bản thật đọc bảng khách hàng — mỗi dòng phải đủ để phân biệt hai khách trùng/na ná tên.
export type KhachMau = { ten: string; ma: string; loai: 'Cá nhân' | 'Doanh nghiệp'; khu: string; sdt: string; may: string[]; mo: number; luuY: boolean }
const KHU_VUC = ['Q.7', 'Thủ Đức', 'Bình Thạnh', 'Q.1', 'Cầu Giấy', 'Hà Đông', 'Biên Hoà']
export const DS_KHACH: KhachMau[] = [...new Set(TICKETS.map((t) => t.khach))].sort((a, b) => a.localeCompare(b, 'vi')).map((ten, i) => {
  const ts = TICKETS.filter((t) => t.khach === ten)
  return {
    ten, ma: `KH-${String(1001 + i * 7).padStart(5, '0')}`,
    loai: /^(Công ty|Khách sạn|Trường|Nhà hàng)/.test(ten) ? 'Doanh nghiệp' : 'Cá nhân',
    khu: KHU_VUC[i % KHU_VUC.length], sdt: String(1000 + ((i * 2731) % 9000)),
    may: [...new Set(ts.map((t) => (t.serial ? `${t.may} · ${t.serial}` : t.may)))],
    mo: ts.filter((t) => t.tt !== 'Đóng' && t.tt !== 'Huỷ').length, luuY: ts.some((t) => !!t.luuY),
  }
})
