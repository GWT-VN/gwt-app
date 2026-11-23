// File THƯỜNG (không 'use client', không icon): bản đồ khu + menu của khung điều hướng v2, tính thuần từ quyền.
// Icon gắn ở client (components/khung/KhungGwt.tsx) — component Phosphor không đi qua ranh giới server.
import type { MaQuyen } from '@/lib/nen-tang/quyen'

export type MucBanDo = { id: string; ten: string; href?: string; con?: MucBanDo[] }
export type IdKhu = 'viec' | 'cskh' | 'sales' | 'kho' | 'wiki' | 'quan-tri' | 'nhan-su' | 'ke-toan'
export type KhuBanDo = { id: IdKhu; ten: string; mau: string; menu: MucBanDo[]; sapCo?: boolean; day?: boolean }

export type DauVaoKhung = {
  /** Quyền vào đúng trang mục menu dẫn tới — cặp (mã, luật cũ) phải khớp chanNeuThieuQuyen() của trang đó. */
  co: (ma: MaQuyen) => boolean
  /** Kỹ thuật viên thuần: khu CSKH chỉ có "Lịch của tôi". */
  chiKyThuat: boolean
  vaoCS: boolean
  vaoSales: boolean
  /** Vai trò "Sửa danh sách người" → mục Danh sách người (khớp chặn ở /danh-sach-nguoi). */
  suaDs: boolean
}

/** (mã quyền, luật cũ) server phải hỏi để dựng menu — dùng chung cho Khung.tsx và _gac của từng trang. */
export const QUYEN_MENU = [
  ['cs.bao_tri.tao_plan', 'QUANLY'], // /bao-tri/map · /bao-tri/len-lich
  ['cs.ky_thuat.ho_so', 'QUANLY'], // /ky-thuat
  ['cs.ky_thuat.xep_lich', 'QUANLY'], // /ky-thuat/lich
  ['cs.yeu_cau.xem', 'QUANLY'], // /duyet
  ['cs.bao_cao.doanh_so', 'ADMIN'], // /doanh-so
  ['he_thong.catalog', 'ADMIN'], // /dong-bo-catalog
  ['he_thong.nhat_ky', 'ADMIN'], // /audit
  ['he_thong.nhan_su.xem', 'ADMIN'], // /nhan-vien
  ['kho.ton.xem', 'NHANVIEN'], // /kho — khớp chanKho() ở app/kho/_gac.ts
  ['kho.so.sua', 'ADMIN'], // /kho/kiem-ke — khớp coTheSuaKho() ở app/kho/_gac.ts
  ['work.luat_tu_sinh', 'QUANLY'], // /work/tu-sinh
] as const

const m = (ten: string, href: string): MucBanDo => ({ id: href, ten, href })
const nhom = (id: string, ten: string, con: MucBanDo[]): MucBanDo[] => (con.length ? [{ id, ten, con }] : [])

/**
 * Khu theo quyền, theo thứ tự trên thanh icon. Menu lấy đủ trang đang chạy của thanh menu cũ (TopNavClient), gom theo nhóm
 * của canvas Claude Design (khung F, CEO duyệt 23/11); nhóm rỗng sau lọc quyền thì bỏ. Không hiện mục "sắp có".
 */
export function lapKhu(v: DauVaoKhung): KhuBanDo[] {
  const { co } = v
  const viec: KhuBanDo = {
    id: 'viec',
    ten: 'Việc',
    mau: '#0e8c9a',
    menu: [m('Việc của tôi', '/work'), m('Bảng team', '/work/team'), ...(co('work.luat_tu_sinh') ? [m('Việc tự sinh', '/work/tu-sinh')] : [])],
  }
  const cskh: KhuBanDo = {
    id: 'cskh',
    ten: 'CSKH',
    mau: '#b5642a',
    menu: v.chiKyThuat
      ? [m('Lịch của tôi', '/ky-thuat/cua-toi')]
      : [
          m('Tổng quan', '/tong-quan'),
          m('Ticket', '/ticket'),
          ...nhom('khach', 'Khách hàng', [
            m('Khách hàng', '/khach-hang'),
            m('Khách cần dọn', '/khach'),
            m('Gộp khách trùng', '/khach/gop'),
            m('Soát kênh khách', '/khach/kenh'),
            m('Kênh / đối tác', '/kenh'),
          ]),
          ...nhom('may', 'Máy & bảo hành', [
            m('Máy đã lắp', '/'),
            m('Kho serial', '/serial'),
            m('Đăng ký BH', '/dang-ky-bh'),
            m('Chờ kích hoạt BH', '/bh-cho-kich-hoat'),
          ]),
          ...nhom('bao-tri', 'Bảo trì & thay lõi', [
            m('Lịch bảo trì', '/bao-tri'),
            m('Lịch thay lõi', '/loi'),
            m('Hồ sơ nước', '/nuoc'),
            ...(co('cs.bao_tri.tao_plan') ? [m('Map khách', '/bao-tri/map'), m('Lên lịch & gói', '/bao-tri/len-lich')] : []),
          ]),
          ...nhom('ky-thuat', 'Kỹ thuật', [
            ...(co('cs.ky_thuat.ho_so') ? [m('Gán lịch kỹ thuật', '/ky-thuat')] : []),
            ...(co('cs.ky_thuat.xep_lich') ? [m('Xem lịch kỹ thuật', '/ky-thuat/lich')] : []),
          ]),
          m('Báo cáo lỗi', '/bao-cao-loi'),
          m('Danh mục lỗi', '/danh-muc-loi'),
          ...(v.suaDs ? [m('Danh sách người', '/danh-sach-nguoi')] : []),
        ],
  }
  const sales: KhuBanDo = {
    id: 'sales',
    ten: 'Sales',
    mau: '#2f7d8a',
    menu: [m('Đơn hàng', '/sales'), m('Khách hàng', '/sales/khach'), m('Khuyến mãi', '/sales/ctkm'), m('Bảng giá & đại lý', '/sales/gia')],
  }
  const kho: KhuBanDo = {
    id: 'kho',
    ten: 'Kho',
    mau: '#5560c9',
    menu: [
      m('Tồn kho', '/kho'),
      m('Nhật ký nhập / xuất', '/kho/nhat-ky'),
      m('Chờ duyệt mã', '/kho/cho-duyet'),
      m('Báo cáo tháng', '/kho/bao-cao'),
      ...(co('kho.so.sua') ? [m('Kiểm kê', '/kho/kiem-ke')] : []),
      m('Lịch sử sửa', '/kho/lich-su-sua'),
    ],
  }
  const wiki: KhuBanDo = {
    id: 'wiki',
    ten: 'Wiki',
    mau: '#8a52b8',
    menu: [m('Trang chủ Wiki', '/wiki'), m('Sản phẩm', '/wiki/san-pham'), m('Marketing', '/wiki/marketing')],
  }
  const quanTri: KhuBanDo = {
    id: 'quan-tri',
    ten: 'Quản trị',
    mau: '#6b7280',
    day: true,
    menu: [
      ...(co('cs.yeu_cau.xem') ? [m('Chờ duyệt', '/duyet')] : []),
      ...(co('cs.bao_cao.doanh_so') ? [m('Doanh số', '/doanh-so')] : []),
      ...(co('he_thong.catalog') ? [m('Đồng bộ catalog', '/dong-bo-catalog')] : []),
      ...(co('he_thong.nhat_ky') ? [m('Nhật ký thao tác', '/audit')] : []),
      ...(co('he_thong.nhan_su.xem') ? [m('Nhân viên', '/nhan-vien')] : []),
    ],
  }
  return [
    viec,
    ...(v.vaoCS ? [cskh] : []),
    ...(v.vaoSales ? [sales] : []),
    ...(co('kho.ton.xem') ? [kho] : []),
    wiki,
    { id: 'nhan-su', ten: 'Nhân sự', mau: '#b0518f', menu: [], sapCo: true },
    { id: 'ke-toan', ten: 'Kế toán', mau: '#3f8a6a', menu: [], sapCo: true },
    ...(quanTri.menu.length ? [quanTri] : []),
  ]
}

// Trang chi tiết → mục cha nào sáng (khi không có mục nào là tiền tố). '/khach/gop' TRƯỚC '/khach/': find() lấy cái khớp đầu.
const CHA: ReadonlyArray<readonly [string, string]> = [
  ['/may/', '/'],
  ['/ticket/', '/ticket'],
  ['/khach/gop', '/khach/gop'],
  ['/khach/moi', '/khach-hang'],
  ['/khach/', '/khach-hang'],
]

const phang = (ds: MucBanDo[]): MucBanDo[] => ds.flatMap((x) => (x.con ? phang(x.con) : [x]))

/**
 * Mục menu ứng với đường dẫn: trùng hẳn → mục đó; không thì bảng CHA (như menu cũ: "/khach/123" là Khách hàng, không phải
 * "Khách cần dọn"); không thì mục có href là tiền tố DÀI NHẤT (theo ranh "/"; bỏ "/" gốc vì mọi đường đều bắt đầu bằng
 * nó). Chỉ ra MỘT mục — "/work/team" không làm sáng cả "/work".
 */
export function mucCuaDuong(pathname: string, ds: MucBanDo[]): MucBanDo | undefined {
  const tat = phang(ds)
  const trung = tat.find((x) => x.href === pathname)
  if (trung) return trung
  const cha = CHA.find(([t]) => pathname.startsWith(t))?.[1]
  const theoCha = cha ? tat.find((x) => x.href === cha) : undefined
  if (theoCha) return theoCha
  return tat
    .filter((x) => x.href && x.href !== '/' && pathname.startsWith(x.href + '/'))
    .sort((a, b) => b.href!.length - a.href!.length)[0]
}

/** Khu chứa trang đang mở; không khu nào có thì CSKH (trang gốc "/" của CSKH) nếu được vào, không thì Việc. */
export function khuCuaDuong(pathname: string, khu: KhuBanDo[]): IdKhu {
  const co = khu.filter((k) => !k.sapCo)
  // Ưu tiên khớp trùng hẳn trên mọi khu trước (vd "/khach" thuộc CSKH, không để tiền tố "/sales/khach" lẫn).
  for (const k of co) if (phang(k.menu).some((x) => x.href === pathname)) return k.id
  for (const k of co) if (mucCuaDuong(pathname, k.menu)) return k.id
  return co.some((k) => k.id === 'cskh') ? 'cskh' : 'viec'
}

/** Gắn `dangO` cho đúng một mục (đệ quy vào nhóm) — đầu vào của `KhungApp.menu`. */
export function danhDauDangO<T extends MucBanDo>(ds: T[], pathname: string): (T & { dangO?: boolean })[] {
  const dang = mucCuaDuong(pathname, ds)
  const gan = (x: MucBanDo): MucBanDo & { dangO?: boolean } =>
    x.con ? { ...x, con: x.con.map(gan) } : { ...x, dangO: x === dang || undefined }
  return ds.map((x) => gan(x) as T & { dangO?: boolean })
}
