// PROTOTYPE — dữ liệu GIẢ (tên theo brief mục 8 + vài tên bịa thêm). Không đọc DB.

export type Khu = { id: string; ten: string; mau: string; soGap?: number; sapCo?: boolean }
export type Trang = { ten: string; dem?: number; con?: string[] }

export const KHU: Khu[] = [
  { id: 'viec', ten: 'Việc', mau: '#0e8c9a', soGap: 4 },
  { id: 'cskh', ten: 'CSKH', mau: '#b5642a', soGap: 3 },
  { id: 'sales', ten: 'Sales', mau: '#2f7d8a' },
  { id: 'kho', ten: 'Kho', mau: '#5560c9', soGap: 2 },
  { id: 'wiki', ten: 'Wiki', mau: '#8a52b8' },
]
export const KHU_SAP_CO: Khu[] = [
  { id: 'nhan-su', ten: 'Nhân sự', mau: '#b0518f', sapCo: true },
  { id: 'ke-toan', ten: 'Kế toán', mau: '#3f8a6a', sapCo: true },
]

export const TRANG_CSKH: Trang[] = [
  { ten: 'Việc hôm nay', dem: 11 },
  { ten: 'Ticket & lỗi', con: ['Danh sách ticket', 'Tạo ticket', 'Báo cáo lỗi', 'Danh mục lỗi'] },
  { ten: 'Khách hàng', con: ['Danh sách khách', 'Gộp khách trùng', 'Kênh / đối tác'] },
  { ten: 'Bảo hành', con: ['Máy đã lắp', 'Chờ kích hoạt', 'Kho serial'] },
  { ten: 'Bảo trì', con: ['Lịch bảo trì', 'Lịch thay lõi', 'Gắn gói vào khách'] },
  { ten: 'Kỹ thuật', con: ['Điều phối tuần', 'Hồ sơ KTV'] },
]

// Phương án D/E: panel menu phẳng theo khu (kiểu ảnh mẫu người dùng gửi 18/11).
export type MucPanel = { ten: string; icon: string; dem?: number }
export const PANEL_THEO_KHU: Record<string, { tao?: string; muc: MucPanel[]; daLuu: string[] }> = {
  viec: {
    tao: 'Tạo việc',
    muc: [
      { ten: 'Việc của tôi', icon: 'check', dem: 4 }, { ten: 'Bảng team', icon: 'users' },
      { ten: 'Nghiệm thu Task AI', icon: 'badge' }, { ten: 'Tổng kết tháng', icon: 'chart' }, { ten: 'Việc tự sinh', icon: 'repeat' },
    ],
    daLuu: ['Gấp', 'Lâu không đụng'],
  },
  cskh: {
    tao: 'Tạo ticket',
    muc: [
      { ten: 'Việc hôm nay', icon: 'today', dem: 11 }, { ten: 'Ticket', icon: 'ticket' }, { ten: 'Khách hàng', icon: 'users' },
      { ten: 'Máy & bảo hành', icon: 'shield' }, { ten: 'Bảo trì & thay lõi', icon: 'calendar' }, { ten: 'Kỹ thuật', icon: 'wrench' },
      { ten: 'Báo cáo lỗi', icon: 'chart' }, { ten: 'Danh mục lỗi', icon: 'book' },
    ],
    daLuu: ['Ticket mở quá 7 ngày', 'Thiếu serial', 'Ticket của tôi'],
  },
  sales: {
    tao: 'Tạo đơn',
    muc: [
      { ten: 'Đơn hàng', icon: 'cart' }, { ten: 'Khách hàng', icon: 'users' }, { ten: 'Khuyến mãi', icon: 'badge' },
      { ten: 'Bảng giá & đại lý', icon: 'chart' }, { ten: 'Đơn Hannah Olala', icon: 'inbox' },
    ],
    daLuu: ['Đơn chờ cọc', 'Đơn POE tháng này'],
  },
  kho: {
    tao: 'Ghi nhập / xuất',
    muc: [
      { ten: 'Tồn kho', icon: 'package', dem: 2 }, { ten: 'Nhật ký nhập/xuất', icon: 'repeat' }, { ten: 'Chờ duyệt mã', icon: 'inbox' },
      { ten: 'Kiểm kê', icon: 'check' }, { ten: 'Báo cáo tháng', icon: 'chart' },
    ],
    daLuu: ['Sắp hết hàng'],
  },
  wiki: {
    muc: ['Sản phẩm', 'Marketing video', 'Kho video', 'Kiến thức nền', 'Công việc chung', 'Sales', 'CSKH', 'Vận hành', 'Tài chính'].map((t) => ({ ten: t, icon: 'book' })),
    daLuu: [],
  },
}
export const GAN_DAY = [
  { loai: 'ticket', ten: 'TK-2611-042 · Nguyễn Văn An' },
  { loai: 'khach', ten: 'Công ty TNHH Minh Phát' },
  { loai: 'ticket', ten: 'TK-2611-043 · Trần Thị Bình' },
  { loai: 'don', ten: 'Đơn 261118-E004' },
  { loai: 'may', ten: 'Serial V9L2304A1123' },
]

export type Dong = {
  ma: string
  khach: string
  viec: string
  han: string
  chu: string
  luuYDo?: boolean
  nguon?: 'App' | 'Discord'
  treHan?: boolean
}
export type Khoi = { id: string; ten: string; mo: string; tone: 'danger' | 'warning' | 'info' | 'secondary'; dong: Dong[] }

export const VIEC_HOM_NAY: Khoi[] = [
  {
    id: 'khan', ten: 'Ca khẩn', mo: 'ticket Khẩn đang mở', tone: 'danger',
    dong: [{ ma: 'TK-2611-042', khach: 'Nguyễn Văn An', viec: 'Rò nước đáy máy CTS20 — cử KT trong ngày', han: '11:00', chu: 'Hiệp', luuYDo: true, nguon: 'Discord' }],
  },
  {
    id: 'qua-han', ten: 'Việc tiếp theo quá hạn', mo: 'hạn đã qua', tone: 'danger',
    dong: [
      { ma: 'TK-2611-043', khach: 'Trần Thị Bình', viec: 'Gọi hướng dẫn xử lý màn hình báo E4', han: '17/11', chu: 'Kiều Trang', treHan: true },
      { ma: 'TK-2611-039', khach: 'Công ty TNHH Minh Phát', viec: 'Gửi báo giá thay bơm tăng áp', han: '16/11', chu: 'Hiền', treHan: true, luuYDo: true },
    ],
  },
  {
    id: 'loi-hua', ten: 'Lời hứa đến hạn', mo: 'đã hứa với khách hôm nay', tone: 'warning',
    dong: [
      { ma: 'TK-2611-042', khach: 'Nguyễn Văn An', viec: 'Gọi lại báo giá linh kiện trước 16h', han: '16:00', chu: 'Hiệp' },
      { ma: 'TK-2611-040', khach: 'Phạm Thu Hà', viec: 'Gửi video hướng dẫn thay lõi PP', han: '17:30', chu: 'Tuyết Trang' },
    ],
  },
  {
    id: 'lich-kt', ten: 'Lịch kỹ thuật hôm nay', mo: 'phiếu việc KTV', tone: 'info',
    dong: [
      { ma: '09:00', khach: 'Trần Thị Bình', viec: 'Bảo trì · bộ lọc tổng WH15A (lần 2/4)', han: '', chu: 'anh Như' },
      { ma: '13:30', khach: 'Phạm Thu Hà', viec: 'Lắp máy · CTS20 + kích hoạt bảo hành', han: '', chu: 'anh Tuấn' },
      { ma: '15:00', khach: 'Công ty TNHH Minh Phát', viec: 'Thay lõi · 3 máy CTD50', han: '', chu: 'anh Như' },
    ],
  },
  {
    id: 'cho', ten: 'Việc "Chờ" tới ngày xem lại', mo: 'chờ khách / vật tư / hãng', tone: 'secondary',
    dong: [
      { ma: 'TK-2611-031', khach: 'Đỗ Minh Khoa', viec: 'Chờ khách gửi ảnh đáy máy', han: 'hôm nay', chu: 'Tuyết Trang' },
      { ma: 'TK-2611-028', khach: 'Vũ Lan Anh', viec: 'Chờ hãng trả bo mạch CTS10', han: 'hôm nay', chu: 'Hiền' },
    ],
  },
  {
    id: 'ban-giao', ten: 'Bàn giao ca', mo: 'tạo ca tối, chưa ai nhận', tone: 'secondary',
    dong: [{ ma: 'TK-2611-045', khach: 'Lê Quốc Huy', viec: 'Báo nước có mùi lạ sau khi thay lõi (21:40 tối qua)', han: '—', chu: 'Chưa ai nhận', nguon: 'Discord' }],
  },
]

// Hội thoại mẫu với agent "Bắp" — kịch bản cứng, không gọi AI.
export type Tin = { ai: 'nguoi' | 'bap'; noiDung: string; the?: 'nhac' | 'tom-tat' }
export const GOI_Y_BAP = ['Tóm tắt ca khẩn', 'Nhắc việc theo giờ', 'Việc của tôi', 'Tạo ticket']

export function traLoiMau(cau: string): Tin {
  const c = cau.toLowerCase()
  if (c.includes('nhắc')) return { ai: 'bap', noiDung: 'Mình sẽ tạo lời nhắc này. Kiểm lại 4 ý trước khi xác nhận:', the: 'nhac' }
  if (c.includes('khẩn') || c.includes('tóm tắt')) return { ai: 'bap', noiDung: 'Ca khẩn đang mở:', the: 'tom-tat' }
  if (c.includes('của tôi')) return { ai: 'bap', noiDung: 'Bạn có 2 việc cần gấp (TK-2611-042 cử KT trước 11:00, gọi lại anh An trước 16:00) và 1 việc để lâu: TK-2611-031 chưa cập nhật 6 ngày.' }
  if (c.includes('ticket')) return { ai: 'bap', noiDung: 'Khách nào? Gõ SĐT hoặc tên — mình sẽ bật Thẻ lưu ý khách trước khi tạo.' }
  return { ai: 'bap', noiDung: '(Prototype) Bắp chưa nối AI — đây là câu trả lời mẫu cho: "' + cau + '".' }
}
