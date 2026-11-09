import { describe, it, expect } from 'vitest'
import { sapXepHopLe } from '../bang/timkiem'
import { COT_TICKET, SAP_TICKET_MAC_DINH, TEN_COT, NGHIA_SAP_XEP } from './danhSach'
import {
  hoatDongCuoi, laMoi, sapTheoHoatDong, dongVuaDoi, nenLamMoi, laODangGo,
  CUA_SO_MOI_MS,
} from './ticketHoatDong'

// Bối cảnh: bot Discord tạo ticket với created_at = NGÀY CỦA MỤC ĐẦU trong tin (có
// thể cách đây vài tháng) còn ghi chú mang clock_timestamp(). Sắp theo created_at
// thì ticket vừa đăng chìm xuống đáy -> phải sắp theo HOẠT ĐỘNG GẦN NHẤT.

describe('hoatDongCuoi — mốc lớn nhất của created_at / updated_at / ghi chú mới nhất', () => {
  it('ticket bot tạo: created_at tháng 6, ghi chú hôm nay -> lấy ghi chú', () => {
    expect(hoatDongCuoi('2026-06-01T02:00:00+00:00', '2026-06-01T02:00:00+00:00', '2026-11-09T03:15:00.123+00:00'))
      .toBe('2026-11-09T03:15:00.123+00:00')
  })
  it('updated_at mới hơn ghi chú (sửa ticket, đổi trạng thái) -> lấy updated_at', () => {
    expect(hoatDongCuoi('2026-06-01T02:00:00Z', '2026-11-08T10:00:00Z', '2026-07-01T00:00:00Z'))
      .toBe('2026-11-08T10:00:00Z')
  })
  it('so theo THỜI ĐIỂM chứ không so chuỗi (múi giờ khác nhau)', () => {
    // 09:00+07 = 02:00Z, sớm hơn 03:00Z dù chuỗi "09" > "03"
    expect(hoatDongCuoi('2026-11-09T09:00:00+07:00', '2026-11-09T03:00:00+00:00')).toBe('2026-11-09T03:00:00+00:00')
  })
  it('bỏ qua null/undefined/chuỗi hỏng; không còn gì -> null', () => {
    expect(hoatDongCuoi(null, undefined, 'abc', '2026-01-01T00:00:00Z')).toBe('2026-01-01T00:00:00Z')
    expect(hoatDongCuoi(null, undefined)).toBeNull()
  })
})

describe('laMoi — hoạt động trong 24 giờ qua', () => {
  const bayGio = Date.parse('2026-11-09T12:00:00Z')
  it('cửa sổ là 24 giờ', () => expect(CUA_SO_MOI_MS).toBe(24 * 3600 * 1000))
  it('1 giờ trước -> mới; 25 giờ trước -> không', () => {
    expect(laMoi('2026-11-09T11:00:00Z', bayGio)).toBe(true)
    expect(laMoi('2026-11-08T11:00:00Z', bayGio)).toBe(false)
  })
  it('null -> không mới', () => expect(laMoi(null, bayGio)).toBe(false))
})

describe('sapTheoHoatDong — Khẩn luôn lên đầu, rồi hoạt động gần nhất', () => {
  const t = (ticket_code: string, khan: boolean, created_at: string, hoat_dong_cuoi: string | null) =>
    ({ ticket_code, khan, created_at, hoat_dong_cuoi })
  const rows = [
    t('TK-2606-001', false, '2026-06-01T02:00:00Z', '2026-11-09T03:00:00Z'), // bot vừa đăng, ngày tạo cũ
    t('TK-2611-005', false, '2026-11-05T02:00:00Z', '2026-11-05T02:00:00Z'),
    t('TK-2610-002', true, '2026-10-01T02:00:00Z', '2026-10-01T02:00:00Z'),  // khẩn nhưng cũ
    t('TK-2611-001', false, '2026-11-01T02:00:00Z', null),
  ]
  it('giảm dần: khẩn trước, rồi ticket bot vừa đăng lên trên ticket tạo ngày 05/11, null xuống cuối', () => {
    expect(sapTheoHoatDong(rows, false).map((r) => r.ticket_code))
      .toEqual(['TK-2610-002', 'TK-2606-001', 'TK-2611-005', 'TK-2611-001'])
  })
  it('tăng dần: khẩn VẪN trước, rồi lâu chưa động tới nhất trước, null vẫn cuối', () => {
    expect(sapTheoHoatDong(rows, true).map((r) => r.ticket_code))
      .toEqual(['TK-2610-002', 'TK-2611-005', 'TK-2606-001', 'TK-2611-001'])
  })
  it('trùng mốc -> khoá phụ ticket_code tăng dần (thứ tự ổn định giữa các trang)', () => {
    const cung = '2026-11-01T00:00:00Z'
    const r = [t('TK-B', false, cung, cung), t('TK-A', false, cung, cung)]
    expect(sapTheoHoatDong(r, false).map((x) => x.ticket_code)).toEqual(['TK-A', 'TK-B'])
  })
  it('không đổi mảng gốc', () => {
    const goc = rows.map((r) => r.ticket_code)
    sapTheoHoatDong(rows, false)
    expect(rows.map((r) => r.ticket_code)).toEqual(goc)
  })
})

describe('COT_TICKET + mặc định sắp xếp trang /ticket', () => {
  it('mặc định là hoat_dong giảm dần', () => {
    expect(SAP_TICKET_MAC_DINH).toEqual({ cot: 'hoat_dong', tang: false })
    expect(sapXepHopLe(undefined, undefined, COT_TICKET, SAP_TICKET_MAC_DINH))
      .toEqual({ cot: 'hoat_dong', tang: false, macDinh: true })
  })
  it('vẫn sắp được theo ngày tạo; "cũ nhất trước" KHÔNG phải mặc định (chip hiện nút × để bỏ)', () => {
    expect(sapXepHopLe('created_at', 'asc', COT_TICKET, SAP_TICKET_MAC_DINH))
      .toEqual({ cot: 'created_at', tang: true, macDinh: false })
  })
  it('có nhãn + nghĩa tiếng Việt cho chip', () => {
    expect(TEN_COT.hoat_dong).toBe('Hoạt động gần nhất')
    expect(NGHIA_SAP_XEP.hoat_dong.desc).toBe('mới nhất trước')
  })
})

describe('dongVuaDoi — dòng mới xuất hiện / vừa đổi kể từ lần làm mới trước', () => {
  const anh = (boLoc: string, ban: Record<string, string | null>) => ({ boLoc, ban })
  it('lần đầu (chưa có ảnh trước) -> không tô dòng nào', () => {
    expect(dongVuaDoi(null, anh('q=', { A: '1' })).size).toBe(0)
  })
  it('cùng bộ lọc: dòng mới + dòng đổi mốc hoạt động được tô; dòng y nguyên thì không', () => {
    const truoc = anh('q=', { A: '2026-11-09T01:00:00Z', B: '2026-11-08T01:00:00Z' })
    const sau = anh('q=', { A: '2026-11-09T01:00:00Z', B: '2026-11-09T05:00:00Z', C: '2026-11-09T05:01:00Z' })
    expect([...dongVuaDoi(truoc, sau)].sort()).toEqual(['B', 'C'])
  })
  it('đổi bộ lọc / trang -> KHÔNG tô (dòng "mới" chỉ vì đổi bộ lọc, không phải vì có hoạt động)', () => {
    expect(dongVuaDoi(anh('state=Open', { A: '1' }), anh('state=Done', { B: '2' })).size).toBe(0)
  })
})

describe('nenLamMoi — tự làm mới chỉ khi an toàn', () => {
  const coBan = { an: false, dangGo: false, soDaChon: 0, bayGio: 100_000, lanCuoi: 0, toiThieuMs: 2000 }
  it('tab đang xem, không gõ, không chọn -> làm mới', () => expect(nenLamMoi(coBan)).toBe(true))
  it('tab ẩn -> dừng', () => expect(nenLamMoi({ ...coBan, an: true })).toBe(false))
  it('đang gõ ô tìm -> dừng', () => expect(nenLamMoi({ ...coBan, dangGo: true })).toBe(false))
  it('đang chọn dòng -> dừng', () => expect(nenLamMoi({ ...coBan, soDaChon: 3 })).toBe(false))
  it('vừa làm mới chưa tới 2 giây (focus + visibilitychange cùng lúc) -> bỏ lượt trùng', () => {
    expect(nenLamMoi({ ...coBan, lanCuoi: 99_000 })).toBe(false)
  })
})

describe('laODangGo — focus đang ở ô nhập chữ', () => {
  it('input text/search, textarea, contenteditable -> đang gõ', () => {
    expect(laODangGo({ tagName: 'INPUT', type: 'text' })).toBe(true)
    expect(laODangGo({ tagName: 'INPUT', type: 'search' })).toBe(true)
    expect(laODangGo({ tagName: 'TEXTAREA' })).toBe(true)
    expect(laODangGo({ tagName: 'DIV', isContentEditable: true })).toBe(true)
  })
  it('checkbox, nút, link, body, null -> không', () => {
    expect(laODangGo({ tagName: 'INPUT', type: 'checkbox' })).toBe(false)
    expect(laODangGo({ tagName: 'BUTTON' })).toBe(false)
    expect(laODangGo({ tagName: 'BODY' })).toBe(false)
    expect(laODangGo(null)).toBe(false)
  })
})
