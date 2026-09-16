// Kiểu dữ liệu cho sao kê ngân hàng (lát 5) — đọc file sao kê, khớp hoá đơn/đơn hàng theo dòng.

export type TaiKhoan = 'VCB21' | 'VCB63' | 'TCB'

export type DongSaoKe = {
  rowOrder: number
  ngay: string // 'YYYY-MM-DD'
  soCt: string
  no: number
  co: number
  soDu: number | null
  noiDung: string
  tenDoiUng: string | null
  raw: (string | number | null)[]
}

export type SaoKe = {
  taiKhoan: TaiKhoan
  tu: string | null
  den: string | null
  soDuDau: number | null
  soDuCuoi: number | null
  tongNo: number | null
  tongCo: number | null
  headers: string[]
  dong: DongSaoKe[]
  /** Số TK trên chính file sao kê (VCB: ô "Số tài khoản/ Account number"; TCB: "Account number" ở tiêu đề) —
   *  chặn upload nhầm file của tài khoản khác. null = khuôn lạ không đọc được, không chặn (gate khác đã bắt). */
  soTaiKhoan: string | null
}

export type HoaDonTom = {
  id: number
  direction: 'vao' | 'ra'
  kyHieu: string
  soHd: string
  ten: string
  mst: string | null
  tongTt: number
  thue: number
  ngay: string | null
  code: string | null
  lineIds: number[]
}

export type KhachTom = { customerCode: string; ten: string; sdt: string | null }

export type DonHangTom = { orderCode: string; tenKhach: string; tongTt: number; ngay: string | null }

// mst/code chép từ HoaDonTom để engine điền partyCode/mã; hoaDonId = 0 khi là đơn Sales (chỉ hiện)
export type Khop = { hoaDonId: number; soHd: string; kyHieu: string; ten: string; mst: string | null; tongTt: number; code: string | null; canCu: string }

export type KetQuaKhop = { chac: Khop | null; goiY: Khop[]; sdt: string | null; khach: KhachTom | null }
