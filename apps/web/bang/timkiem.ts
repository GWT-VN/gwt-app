/**
 * Tìm kiếm và sắp xếp — HÀM THUẦN, không đụng DB, không import gì.
 *
 * boDau() phải khớp ĐÚNG với hàm khong_dau() dưới Postgres
 * (db/cs/migrations/06_tim_kiem_khong_dau.sql). Lệch nhau là gõ ra
 * kết quả rỗng mà không ai hiểu vì sao.
 */

export function boDau(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // bỏ dấu thanh + dấu mũ
    .replace(/đ/g, 'd')               // U+0111 KHÔNG decompose được bằng NFD
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

/** Chuẩn hoá chuỗi người dùng gõ trước khi đưa vào truy vấn. */
export function chuanHoaTuKhoa(q: string): string {
  return boDau(q).trim().replace(/\s+/g, ' ')
}

export type SapXep = {
  cot: string
  tang: boolean
  /**
   * true = đang là thứ tự MẶC ĐỊNH của trang (người dùng chưa đổi gì, hoặc đã
   * bấm về đúng thứ tự gốc). Giao diện dựa vào cờ này để chỉ hiện nút "bỏ sắp
   * xếp" khi thật sự có cái để bỏ — hiện nút lúc đang ở mặc định thì bấm vào
   * không thấy gì đổi, người dùng tưởng nút hỏng.
   */
  macDinh: boolean
}

/**
 * Cột sắp xếp lấy từ URL mà đưa thẳng vào .order() là lỗ hổng.
 * Ngoài danh sách trắng thì bỏ qua, rơi về mặc định.
 */
export function sapXepHopLe(
  cot: string | undefined,
  chieu: string | undefined,
  choPhep: readonly string[],
  macDinh: { cot: string; tang: boolean }
): SapXep {
  if (!cot || !choPhep.includes(cot)) return { ...macDinh, macDinh: true }
  const tang = chieu === 'asc'
  // So với giá trị mặc định chứ không phải "URL có ?cot= hay không": bấm vòng
  // quanh rồi quay đúng về thứ tự gốc thì cũng là mặc định, không cần nút bỏ.
  return { cot, tang, macDinh: cot === macDinh.cot && tang === macDinh.tang }
}

/** PostgREST dùng dấu phẩy và ngoặc làm cú pháp .or() — phải bỏ khỏi từ khoá. */
export function antoanChoOr(kw: string): string {
  return kw.replace(/[,()%*]/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Mẫu regex khớp theo ĐẦU TỪ, dùng cho cột đã bỏ dấu (ten_kd) với toán tử
 * `imatch` của PostgREST (`~*` của Postgres).
 *
 * Vì sao KHÔNG dùng ilike %...% cho tên người: `%huong%` khớp cả chuỗi con GIỮA
 * từ, nên gõ "huong" ra luôn Phương / Phượng / Thương / Thường (đo trên DB thật:
 * 41 dòng, trong đó 21 dòng sai — Chị Minh Phương, Nguyễn Hải Thường, cả CÔNG TY
 * ... THƯƠNG MẠI...). `\m` = mốc đầu từ của Postgres -> chỉ còn 20 dòng Hương/Hường.
 *
 * Vẫn gõ được một phần tên: "\mle thi" khớp "Lê Thị Thu Hường" vì mốc đầu từ chỉ
 * ràng buộc chỗ BẮT ĐẦU, phần đuôi vẫn khớp lỏng.
 *
 * ⚠️ BẮT BUỘC thoát ký tự regex: người dùng gõ "[" là Postgres báo regex hỏng và
 * PostgREST trả HTTP 400 (đã thử trên API thật) — trang sẽ vỡ chứ không ra rỗng.
 * Gọi SAU antoanChoOr() để dấu phẩy đã bị bỏ, không phá cú pháp .or().
 */
export function mauDauTu(kw: string): string {
  return '\\m' + kw.replace(/[\\^$.|?*+()[\]{}]/g, '\\$&')
}

/**
 * Cắt câu người dùng gõ thành TỪNG TỪ, mỗi từ một điều kiện `.or()`.
 *
 * Dùng vì PostgREST **AND** các lệnh `.or()` liên tiếp lại với nhau. Gọi n lần thì thành
 * "mọi từ đều phải khớp, mỗi từ được tự chọn khớp ở cột nào" — đúng thứ ô tìm kiếm cần.
 *
 * Vì sao đổi (CEO giao 24/08/2026): bản cũ nhét NGUYÊN CÂU vào một `\m<cả câu>`, tức là
 * bắt khớp một chuỗi LIỀN từ mốc đầu từ. Đo trên `cs_customers` ngày 24/08:
 *
 * | gõ | kiểu cũ | kiểu mới |
 * |---|---|---|
 * | `nguyen van` (không dấu)  | 5 | 5 |
 * | `van nguyen` (đảo)        | **0** | 20 |
 * | `linh sg` (chữ giữa tên)  | **0** | 1 |
 * | `sg` (chỉ chữ cuối)       | **0** | 1 |
 *
 * Tức là "gõ không dấu" vốn đã chạy; thứ hỏng là **gõ đảo thứ tự** và **gõ chữ ở giữa
 * tên** — hai kiểu gõ tự nhiên nhất khi người ta chỉ nhớ một mẩu tên.
 *
 * Cột trong `cotDauTu` khớp theo ĐẦU TỪ (`\m`) — dành cho tên người, tránh `huong`
 * lôi về cả Phương/Thường. Cột trong `cotChuoiCon` khớp chuỗi con — dành cho SĐT, mã,
 * serial, nơi người ta hay gõ mấy ký tự đuôi.
 *
 * Không nuốt lỗi gõ — đó cần trigram, phải làm dưới DB (xem `sales_tim_khach`).
 *
 * @returns mảng chuỗi để truyền vào `.or()`, mỗi phần tử một từ. Rỗng = không lọc gì.
 */
export function dieuKienTungTu(
  q: string,
  cotDauTu: readonly string[],
  cotChuoiCon: readonly string[] = []
): string[] {
  const kw = antoanChoOr(chuanHoaTuKhoa(q))
  if (!kw) return []
  return kw.split(' ').filter(Boolean).map((t) =>
    [
      ...cotDauTu.map((c) => `${c}.imatch.${mauDauTu(t)}`),
      ...cotChuoiCon.map((c) => `${c}.ilike.%${t}%`),
    ].join(',')
  )
}
