/**
 * Hàm THUẦN cho khuyến mãi + chiết khấu đại lý. Không đụng DB, không React — test được.
 *
 * Ba khái niệm tách bạch, đừng trộn:
 *  · CHIẾT KHẤU ĐẠI LÝ — theo BẬC của đối tác (NPP / Đại lý / Giới thiệu), theo mã SP,
 *    có hiệu lực theo thời gian.
 *  · KHUYẾN MÃI KHÁCH LẺ — theo KÊNH của đơn, theo khoảng ngày.
 *  · Khách đã có bậc thì KHÔNG ăn khuyến mãi khách lẻ (CEO chốt 21/08/2026).
 */

export type KieuGiam = 'PCT' | 'TIEN' | 'CON'
export type Bac = 'NPP' | 'DAI_LY' | 'GIOI_THIEU'

/**
 * Giá bán sau khi áp một mức giảm.
 *  · PCT  — giảm phần trăm; `giamToiDa` là TRẦN cho số tiền giảm (chỉ có nghĩa ở kiểu này).
 *  · TIEN — trừ thẳng số tiền.
 *  · CON  — "giảm còn": `muc` CHÍNH LÀ giá bán, không phụ thuộc giá niêm yết.
 *
 * Không bao giờ trả số âm. `muc` rỗng/không hợp lệ -> giữ nguyên giá niêm yết,
 * KHÔNG đoán là giảm 0 hay giảm 100%.
 */
export function giaSauGiam(
  kieu: KieuGiam,
  niemYet: number | null | undefined,
  muc: number | null | undefined,
  giamToiDa?: number | null
): number {
  const ny = Math.round(Number(niemYet) || 0)
  if (muc == null || !Number.isFinite(Number(muc))) return ny
  const m = Number(muc)
  if (kieu === 'CON') return Math.max(0, Math.round(m))
  if (kieu === 'TIEN') return Math.max(0, ny - Math.round(m))
  // PCT
  let giam = Math.round((ny * m) / 100)
  const tran = giamToiDa == null ? null : Number(giamToiDa)
  if (tran != null && Number.isFinite(tran) && giam > tran) giam = Math.round(tran)
  return Math.max(0, ny - giam)
}

/** Mức áp cho một mã: mức RIÊNG của mã thắng mức chung. `null` cả hai -> không giảm. */
export function mucApDung(
  mucRieng: number | null | undefined,
  mucChung: number | null | undefined
): number | null {
  if (mucRieng != null && Number.isFinite(Number(mucRieng))) return Number(mucRieng)
  if (mucChung != null && Number.isFinite(Number(mucChung))) return Number(mucChung)
  return null
}

/** Một khoảng ngày có bao ngày `ngay` không. `den` rỗng = vô thời hạn. */
export function conHieuLuc(ngay: string, tu: string, den: string | null | undefined): boolean {
  if (!ngay || !tu) return false
  if (ngay < tu) return false
  if (den && ngay > den) return false
  return true
}

export type NhomKhach = 'TAT_CA' | 'MOI' | 'DA_MUA' | 'CHI_DINH'

export type Ctkm = {
  id: string
  ten: string
  tu_ngay: string
  den_ngay: string | null
  kieu_giam: KieuGiam
  muc_chung: number | null
  giam_toi_da: number | null
  trang_thai: string
  /** channel_id được hưởng. Rỗng = không kênh nào -> chương trình không áp cho ai. */
  kenh: number[]
  /** Nhóm khách được hưởng. Thiếu -> coi như TAT_CA (dữ liệu cũ trước 24/08). */
  nhom_khach?: NhomKhach
  /** Được áp CHỒNG lên chương trình khác thay vì tranh nhau lấy một cái. */
  cong_don?: boolean
  /** Mã khách được chỉ định (đi cùng nhom_khach = 'CHI_DINH'). */
  khachGom?: string[]
  /** Mã khách bị loại trừ — thắng mọi luật khác. */
  khachTru?: string[]
}

/** Những gì cần biết về khách để xét chương trình có áp cho họ không. */
export type KhachXet = {
  customer_code: string | null
  /** Đã từng có đơn chưa. `null` = chưa biết (khách mới gõ tay, chưa có hồ sơ). */
  daMua: boolean | null
}

/**
 * Chương trình này có áp cho KHÁCH NÀY không (chưa xét ngày/kênh/sản phẩm).
 *
 * Thứ tự xét cố định, và LOẠI TRỪ đi trước mọi thứ: đã bị gạch tên thì không có cửa
 * nào lách vào lại. Đây là cả điểm của tính năng — CEO gạch một khách ra khỏi chương
 * trình thì phải chắc chắn họ không ăn, chứ không phải "trừ khi nhóm khách bao họ".
 *
 * Khách chưa có mã (gõ tay ở màn lên đơn) thì không thể nằm trong danh sách nào, nên
 * chỉ trượt ở CHI_DINH. Không biết đã mua hay chưa (`daMua = null`) thì KHÔNG áp các
 * chương trình phân biệt mới/cũ — thà bỏ sót một khuyến mãi để nhân viên tự bấm, còn
 * hơn tự tặng nhầm rồi mới phát hiện.
 */
export function khachDuocHuong(c: Ctkm, kh: KhachXet): boolean {
  const ma = kh.customer_code
  if (ma && (c.khachTru ?? []).includes(ma)) return false
  const nhom = c.nhom_khach ?? 'TAT_CA'
  if (nhom === 'CHI_DINH') return !!ma && (c.khachGom ?? []).includes(ma)
  if (nhom === 'MOI') return kh.daMua === false
  if (nhom === 'DA_MUA') return kh.daMua === true
  return true
}

/**
 * Chương trình áp cho một đơn: đúng ngày, đúng kênh, đúng khách, và ĐÃ BAN HÀNH.
 *
 * Bản nháp KHÔNG bao giờ áp — đó là lý do có trạng thái nháp.
 *
 * Trả về BA nhóm, vì từ 24/08 CEO cho phép áp đồng thời nhiều chương trình:
 *  · `chon` — chương trình giảm SÂU NHẤT trong số các chương trình *không* cộng dồn.
 *    Đây vẫn là luật cũ: hai chương trình giảm giá cùng khớp thì chỉ một cái ăn, không
 *    tự cộng 15% + 20% thành 32% mà không ai duyệt con số đó.
 *  · `cong` — mọi chương trình có bật `cong_don`, áp CHỒNG lên `chon`. Ca CEO nêu:
 *    "CTD50 vừa giảm 15% vừa được tặng quà" — chương trình quà bật cờ này.
 *  · `khac` — các chương trình không cộng dồn đã thua, giữ lại để giao diện nói ra
 *    thay vì im lặng.
 *
 * `kh` để trống = không xét điều kiện khách (dùng cho màn xem trước chương trình).
 */
export function ctkmChoDon(
  ds: Ctkm[],
  ngay: string,
  channelId: number | null | undefined,
  niemYetThamChieu = 10_000_000,
  kh?: KhachXet
): { chon: Ctkm | null; cong: Ctkm[]; khac: Ctkm[] } {
  const khop = ds.filter(
    (c) =>
      c.trang_thai === 'ban_hanh' &&
      conHieuLuc(ngay, c.tu_ngay, c.den_ngay) &&
      channelId != null &&
      c.kenh.includes(channelId) &&
      (kh === undefined || khachDuocHuong(c, kh))
  )
  const cong = khop.filter((c) => c.cong_don)
  const rieng = khop.filter((c) => !c.cong_don)
  if (rieng.length === 0) return { chon: null, cong, khac: [] }
  const xep = [...rieng].sort(
    (a, b) =>
      giaSauGiam(a.kieu_giam, niemYetThamChieu, a.muc_chung, a.giam_toi_da) -
      giaSauGiam(b.kieu_giam, niemYetThamChieu, b.muc_chung, b.giam_toi_da)
  )
  return { chon: xep[0], cong, khac: xep.slice(1) }
}

export type ChinhSachGia = {
  bac: Bac
  internal_code: string
  giam_pct: number | null
  gia_ban: number | null
  nhap_theo: 'PCT' | 'GIA'
  hieu_luc_tu: string
  hieu_luc_den: string | null
  trang_thai: string
}

/**
 * Giá cho một mã theo bậc đối tác, tại một ngày.
 *
 * Ưu tiên `gia_ban` khi người nhập gõ theo GIÁ — giữ đúng con số đã duyệt, không tính
 * lại từ % rồi lệch vài đồng do làm tròn. Gõ theo % thì tính từ giá niêm yết.
 * Không có chính sách khớp -> `null` (gọi bên ngoài tự quyết dùng giá niêm yết).
 */
export function giaTheoBac(
  ds: ChinhSachGia[],
  bac: Bac,
  internalCode: string,
  niemYet: number | null | undefined,
  ngay: string
): number | null {
  const khop = ds
    .filter(
      (c) =>
        c.bac === bac &&
        c.internal_code === internalCode &&
        c.trang_thai === 'ban_hanh' &&
        conHieuLuc(ngay, c.hieu_luc_tu, c.hieu_luc_den)
    )
    // Nhiều bản cùng hiệu lực -> lấy bản MỚI NHẤT.
    .sort((a, b) => b.hieu_luc_tu.localeCompare(a.hieu_luc_tu))
  const c = khop[0]
  if (!c) return null
  if (c.nhap_theo === 'GIA' && c.gia_ban != null) return Math.max(0, Math.round(c.gia_ban))
  if (c.giam_pct != null) return giaSauGiam('PCT', niemYet, c.giam_pct)
  if (c.gia_ban != null) return Math.max(0, Math.round(c.gia_ban))
  return null
}

/** Cặp %/₫ cho ô nhập: gõ ô nào thì tính ô kia. Trả về cặp đã làm tròn để hiển thị. */
export function capGiaVaPct(
  niemYet: number | null | undefined,
  nhapTheo: 'PCT' | 'GIA',
  giaTri: number | null | undefined
): { pct: number | null; gia: number | null } {
  const ny = Math.round(Number(niemYet) || 0)
  if (giaTri == null || !Number.isFinite(Number(giaTri)) || ny <= 0) return { pct: null, gia: null }
  const v = Number(giaTri)
  if (nhapTheo === 'PCT') return { pct: v, gia: Math.round(ny * (1 - v / 100)) }
  // Làm tròn 1 chữ số thập phân: 179.950.000 -> 112.000.000 ra 37,8% chứ không phải 37,76537…
  return { pct: Math.round((1 - v / ny) * 1000) / 10, gia: Math.round(v) }
}

const vndCt = new Intl.NumberFormat('vi-VN')

/** Nhãn mức giảm cho danh sách: "Giảm 12%" · "Giảm 5.000.000 ₫" · "Giá còn 29.900.000 ₫". */
export function nhanKieuGiam(kieu: KieuGiam, muc: number | null | undefined): string {
  if (muc == null || !Number.isFinite(Number(muc))) return 'Chưa đặt mức giảm'
  const m = Number(muc)
  if (kieu === 'PCT') return `Giảm ${m}%`
  if (kieu === 'TIEN') return `Giảm ${vndCt.format(Math.round(m))} ₫`
  return `Giá còn ${vndCt.format(Math.round(m))} ₫`
}

export const NHAN_NHOM_KHACH: Record<string, string> = {
  TAT_CA: 'Tất cả khách lẻ',
  MOI: 'Chỉ khách mới',
  DA_MUA: 'Chỉ khách đã mua',
  CHI_DINH: 'Danh sách chỉ định',
}
export function nhanNhomKhach(ma: string): string {
  return NHAN_NHOM_KHACH[ma] ?? ma
}

// ── Giá gợi ý khi lên đơn ──────────────────────────────────────────────────

/** Mọi thứ cần để tính giá cho một khách, gom sẵn ở server để client khỏi gọi lại từng dòng. */
/** Chương trình kèm bảng mức riêng theo mã + danh sách quà của nó. */
export type CtkmApDung = Ctkm & {
  sp: Record<string, number>
  qua?: QuaCtkm[]
}

export type QuaCtkm = {
  internal_code_qua: string
  so_luong: number
  gia_tri_quy_doi: number | null
  dieu_kien: string | null
  /** Chương trình sinh ra món quà này — gắn vào dòng quà trên đơn để truy được nguồn. */
  ctkmId?: string
  /** Tên chương trình, để giao diện nói "quà theo <chương trình>". */
  ctkmTen?: string
}

export type BoiCanhGia = {
  /** Bậc đối tác đang hiệu lực. `null` = khách lẻ. */
  bac: Bac | null
  /** Kênh của khách — khách lẻ hưởng khuyến mãi theo kênh này. */
  channel_id: number | null
  chinhSach: ChinhSachGia[]
  /** Chương trình khuyến mãi đã chọn (giảm sâu nhất) cho kênh của khách. */
  ctkm: CtkmApDung | null
  /** Chương trình CỘNG DỒN — áp chồng lên `ctkm`. Thường là chương trình chỉ tặng quà. */
  ctkmCong?: CtkmApDung[]
  /** Số chương trình khác cũng khớp — để giao diện nói ra thay vì im lặng. */
  soCtkmKhac: number
  /** Giá niêm yết theo mã. */
  niemYet: Record<string, number>
}

export type NguonGia = 'BAC' | 'CTKM' | 'NIEM_YET' | 'KHONG_RO'

export type GiaGoiY = {
  gia: number | null
  nguon: NguonGia
  nhan: string
  niemYet: number | null
  /** Tên các chương trình đã áp cho mã này, theo đúng thứ tự áp. Rỗng = không có. */
  chuongTrinh: string[]
  /** Quà đi kèm các chương trình đang áp cho mã này. */
  qua: QuaCtkm[]
}

/**
 * Mức giảm của MỘT chương trình cho một mã, nếu chương trình đó có đụng tới mã này.
 *
 * `null` = chương trình không áp cho mã này. Hai ca ra `null`:
 *   · chương trình có liệt kê sản phẩm mà mã này không nằm trong đó;
 *   · không có mức riêng lẫn mức chung (chương trình chỉ tặng quà, không giảm giá).
 */
function mucChoMa(c: CtkmApDung, internalCode: string): number | null {
  const coDanhSach = Object.keys(c.sp).length > 0
  if (coDanhSach && !(internalCode in c.sp)) return null
  // Mức riêng của mã này thắng mức chung; 0 riêng vẫn thắng (miễn phí là một mức thật).
  return mucApDung(c.sp[internalCode], c.muc_chung)
}

/** Chương trình có đụng tới mã này không — kể cả khi chỉ tặng quà, không giảm giá. */
function ctkmChamMa(c: CtkmApDung, internalCode: string): boolean {
  const coDanhSach = Object.keys(c.sp).length > 0
  return !coDanhSach || internalCode in c.sp
}

/**
 * Giá gợi ý cho MỘT mã hàng, theo bối cảnh khách.
 *
 * Thứ tự ưu tiên — CEO chốt 22/08: **bậc đại lý thắng khuyến mãi bán lẻ**. Đại lý đã hưởng
 * giá sỉ theo hợp đồng thì không cộng dồn thêm chương trình bán lẻ, nếu không cùng một máy
 * bán cho đại lý lại rẻ hơn giá vốn.
 *
 * Không có gì khớp -> giá niêm yết. Không có cả giá niêm yết -> `null`, giao diện để trống
 * cho người nhập tự gõ (đừng bịa số 0 — 0 đồng trông như hàng tặng).
 */
export function giaGoiY(bc: BoiCanhGia, internalCode: string, ngay: string): GiaGoiY {
  const ny = bc.niemYet[internalCode] ?? null
  const cong = (bc.ctkmCong ?? []).filter((c) => ctkmChamMa(c, internalCode))
  // Quà gom từ MỌI chương trình đang áp cho mã này — quà không tranh nhau như giảm giá,
  // khách được cả hai thì nhận cả hai. Gắn kèm id/tên chương trình vì dòng quà trên đơn
  // phải truy được về chương trình đã duyệt nó.
  const kemNguon = (c: CtkmApDung): QuaCtkm[] =>
    (c.qua ?? []).map((q) => ({ ...q, ctkmId: c.id, ctkmTen: c.ten }))
  const quaCong = cong.flatMap(kemNguon)

  if (bc.bac) {
    const g = giaTheoBac(bc.chinhSach, bc.bac, internalCode, ny, ngay)
    // Đại lý ăn giá bậc, KHÔNG cộng thêm khuyến mãi bán lẻ (CEO chốt 22/08) — kể cả
    // chương trình cộng dồn. Nhưng QUÀ thì vẫn nhận: quà là chi phí marketing riêng,
    // không phải chiết khấu, và CEO có thể cố ý tặng quà cho cả đại lý.
    if (g != null) {
      return {
        gia: g, nguon: 'BAC', nhan: `Giá ${nhanBac(bc.bac)}`, niemYet: ny,
        chuongTrinh: [`Giá ${nhanBac(bc.bac)}`], qua: quaCong,
      }
    }
  }

  if (ny != null) {
    const ten: string[] = []
    let gia = ny
    let coGiam = false

    if (bc.ctkm) {
      const muc = mucChoMa(bc.ctkm, internalCode)
      if (muc != null) {
        gia = giaSauGiam(bc.ctkm.kieu_giam, gia, muc, bc.ctkm.giam_toi_da)
        ten.push(bc.ctkm.ten)
        coGiam = true
      }
    }

    // Chương trình cộng dồn áp CHỒNG, mỗi cái tính trên giá đã giảm của cái trước.
    // Ví dụ 15% rồi thêm 100k: 20tr -> 17tr -> 16,9tr. Cộng dồn kiểu 'CON' (chốt giá
    // bán) thì cái sau ghi đè hẳn — đúng nghĩa "giảm còn", không phụ thuộc giá trước.
    for (const c of cong) {
      const muc = mucChoMa(c, internalCode)
      if (muc == null) continue
      gia = giaSauGiam(c.kieu_giam, gia, muc, c.giam_toi_da)
      ten.push(c.ten)
      coGiam = true
    }

    const quaChon = bc.ctkm && ctkmChamMa(bc.ctkm, internalCode) ? kemNguon(bc.ctkm) : []
    const qua = [...quaChon, ...quaCong]

    if (coGiam) return { gia, nguon: 'CTKM', nhan: ten.join(' + '), niemYet: ny, chuongTrinh: ten, qua }
    // Không chương trình nào GIẢM GIÁ cho mã này, nhưng vẫn có thể có QUÀ đi kèm.
    return { gia: ny, nguon: 'NIEM_YET', nhan: 'Giá niêm yết', niemYet: ny, chuongTrinh: [], qua }
  }

  return {
    gia: null, nguon: 'KHONG_RO', nhan: 'Mã này chưa có giá niêm yết', niemYet: null,
    chuongTrinh: [], qua: [],
  }
}

export function nhanBac(b: Bac): string {
  return b === 'NPP' ? 'Cấp 1 · NPP' : b === 'DAI_LY' ? 'Cấp 2 · Đại lý' : 'Cấp 3 · Giới thiệu'
}
