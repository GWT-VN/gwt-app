/**
 * "Hoạt động gần nhất" của ticket + logic tự làm mới danh sách /ticket.
 * Hàm THUẦN (không DB, không React) để test được.
 *
 * Vì sao không sắp theo created_at: bot Discord (`bot_tao_ticket`) đặt created_at =
 * NGÀY CỦA MỤC ĐẦU trong tin (có thể cách đây vài tháng), còn ghi chú mang
 * clock_timestamp(). Ticket vừa đăng vì thế nằm tận đáy khi sắp theo ngày tạo.
 * Hoạt động gần nhất = mốc lớn nhất của tickets.created_at, tickets.updated_at
 * (trigger trg_tickets_updated_at; INSERT của bot để mặc định now()) và
 * ticket_note.created_at mới nhất.
 */

export const CUA_SO_MOI_MS = 24 * 3600 * 1000

/** Mốc muộn nhất trong các mốc ISO hợp lệ (so theo THỜI ĐIỂM, không so chuỗi). */
export function hoatDongCuoi(...cacMoc: (string | null | undefined)[]): string | null {
  let tot: string | null = null
  let totMs = -Infinity
  for (const m of cacMoc) {
    if (!m) continue
    const ms = Date.parse(m)
    if (Number.isNaN(ms)) continue
    if (ms > totMs) { totMs = ms; tot = m }
  }
  return tot
}

/** Có hoạt động trong 24 giờ qua -> badge "Mới". */
export function laMoi(iso: string | null | undefined, bayGioMs: number, cuaSoMs = CUA_SO_MOI_MS): boolean {
  if (!iso) return false
  const ms = Date.parse(iso)
  return !Number.isNaN(ms) && bayGioMs - ms < cuaSoMs
}

type DongSap = { ticket_code: string; khan: boolean; hoat_dong_cuoi?: string | null }

/**
 * Khẩn luôn lên đầu (giữ đúng luật cũ của trang), rồi hoạt động gần nhất theo chiều,
 * mốc rỗng luôn xuống cuối, khoá phụ ticket_code tăng dần (duy nhất -> phân trang ổn định).
 */
export function sapTheoHoatDong<T extends DongSap>(rows: readonly T[], tang: boolean): T[] {
  const ms = (r: T) => (r.hoat_dong_cuoi ? Date.parse(r.hoat_dong_cuoi) : NaN)
  return [...rows].sort((a, b) => {
    if (a.khan !== b.khan) return a.khan ? -1 : 1
    const ma = ms(a), mb = ms(b)
    const ra = Number.isNaN(ma), rb = Number.isNaN(mb)
    if (ra !== rb) return ra ? 1 : -1
    if (!ra && ma !== mb) return tang ? ma - mb : mb - ma
    return a.ticket_code < b.ticket_code ? -1 : a.ticket_code > b.ticket_code ? 1 : 0
  })
}

/** Ảnh chụp bảng ở một lần render: chữ ký bộ lọc + mã -> mốc hoạt động. */
export type AnhBang = { boLoc: string; ban: Record<string, string | null | undefined> }

/**
 * Dòng mới xuất hiện hoặc đổi mốc hoạt động kể từ ảnh trước. Khác bộ lọc (đổi tab,
 * lật trang, gõ tìm) thì không tô gì: dòng lạ lúc đó là do lọc, không phải có hoạt động.
 */
export function dongVuaDoi(truoc: AnhBang | null, sau: AnhBang): Set<string> {
  const ra = new Set<string>()
  if (!truoc || truoc.boLoc !== sau.boLoc) return ra
  for (const [ma, moc] of Object.entries(sau.ban)) {
    if (!(ma in truoc.ban) || truoc.ban[ma] !== moc) ra.add(ma)
  }
  return ra
}

/** Có nên gọi router.refresh() lúc này không. */
export function nenLamMoi(t: {
  an: boolean; dangGo: boolean; soDaChon: number; bayGio: number; lanCuoi: number; toiThieuMs: number
}): boolean {
  if (t.an || t.dangGo || t.soDaChon > 0) return false
  return t.bayGio - t.lanCuoi >= t.toiThieuMs
}

const KIEU_KHONG_GO = new Set(['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color', 'image', 'hidden'])

/** Phần tử đang focus có phải ô nhập chữ (ô tìm kiếm, ô ghi chú…) không. */
export function laODangGo(el: { tagName?: string; type?: string; isContentEditable?: boolean } | null | undefined): boolean {
  if (!el) return false
  if (el.isContentEditable) return true
  const tag = (el.tagName ?? '').toUpperCase()
  if (tag === 'TEXTAREA') return true
  if (tag === 'INPUT') return !KIEU_KHONG_GO.has((el.type ?? 'text').toLowerCase())
  return false
}
