import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Lưới an toàn tĩnh cho khu Việc — chốt mấy bất biến đã từng bị phá và tốn tiền
 * đi tìm. Kiểm trên MÃ NGUỒN (heuristic chuỗi) vì repo chưa có bộ dựng React
 * trong test; rẻ, chạy trong 1ms, và bắt đúng lỗi hồi quy đã xảy ra thật.
 */
const doc = (p: string) =>
  readFileSync(fileURLToPath(new URL('../' + p, import.meta.url)), 'utf8')

// ── 1. Panel chi tiết phải được GẮN LẠI khi đổi việc ────────────────────────
// Lỗi 22/08: ô tiêu đề / mô tả / hạn dùng defaultValue (ô KHÔNG kiểm soát), React
// chỉ áp defaultValue lúc gắn vào DOM. Không có key thì bấm sang việc khác vẫn
// thấy chữ của việc cũ — và bản nháp bình luận còn sót có thể gửi nhầm sang việc
// vừa mở. Bản vá là `key={mo}` ở MỌI chỗ dựng panel; test này giữ nó ở đó.
describe('ChiTietViec — mọi chỗ dựng panel đều truyền key', () => {
  const NOI_DUNG = [
    'components/work/ViecCuaToi.tsx',
    'components/work/BangTeam.tsx',
    'components/work/TuSinh.tsx',
  ]

  for (const f of NOI_DUNG) {
    it(`${f} truyền key cho <ChiTietViec>`, () => {
      const src = doc(f)
      const i = src.indexOf('<ChiTietViec')
      expect(i, `${f} không còn dựng <ChiTietViec> — cập nhật lại test này`).toBeGreaterThan(-1)
      // Cắt tới dấu đóng thẻ đầu tiên sau đó rồi tìm key= trong khoảng đó.
      const the = src.slice(i, src.indexOf('/>', i))
      expect(
        /\bkey=\{/.test(the),
        `${f}: <ChiTietViec> thiếu prop key. Không có nó thì đổi sang việc khác ` +
          'vẫn hiện tiêu đề/mô tả/hạn của việc CŨ (defaultValue chỉ áp lúc gắn).',
      ).toBe(true)
    })
  }
})

// ── 2. Kéo thả kanban phải nạp dữ liệu vào dataTransfer ─────────────────────
// Firefox KHÔNG khởi động lượt kéo nào nếu kho dữ liệu rỗng. Chrome/Safari dễ
// tính hơn nên thiếu setData ẩn được rất lâu rồi mới lộ ở máy người khác.
describe('BangTeam — kéo thả nạp dataTransfer', () => {
  const src = doc('components/work/BangTeam.tsx')

  it('onDragStart gọi setData', () => {
    expect(
      /dataTransfer\.setData\(/.test(src),
      'onDragStart thiếu dataTransfer.setData — Firefox sẽ không kéo được thẻ nào.',
    ).toBe(true)
  })

  it('onDrop đọc lại id từ dataTransfer làm lưới đỡ', () => {
    expect(
      /dataTransfer\.getData\(/.test(src),
      'onDrop chỉ tin React state. dangKeo có thể đã bị dọn trước khi drop chạy; ' +
        'đọc thêm dataTransfer thì lượt thả nào cũng biết mình đang thả cái gì.',
    ).toBe(true)
  })

  // ── Ba bất biến rút ra từ lỗi CEO báo lại 24/08 ("kéo sang vẫn không được") ──

  it('thẻ kéo KHÔNG phải <button>', () => {
    // Safari/Firefox không cho `draggable` chạy tử tế trên form control: thẻ
    // không nhấc lên được và cũng chẳng báo gì. Phải là <div role="button">.
    const i = src.indexOf('draggable')
    const truoc = src.slice(Math.max(0, i - 500), i)
    expect(
      !/<button\s[^>]*$/.test(truoc) && /role="button"/.test(truoc),
      'Thẻ kanban phải là <div role="button" tabIndex={0}>, không phải <button>.',
    ).toBe(true)
  })

  it('cột có chiều cao tối thiểu — cột RỖNG vẫn hứng được cú thả', () => {
    // Trước 24/08 grid để items-start và cột không có minHeight, nên cột rỗng co
    // lại còn mỗi tiêu đề (~38px) trong khi thẻ kéo cao gấp đôi. Con trỏ trượt ra
    // ngoài hộp -> drop không nổ -> "không có gì xảy ra", không kèm lỗi nào.
    expect(
      /minHeight:\s*\d{2,}/.test(src),
      'Cột kanban thiếu minHeight. Cột rỗng co lại thì không thả vào được.',
    ).toBe(true)
  })

  it('dragover đọc REF chứ không đọc state', () => {
    // setDangKeo là state, chỉ thấy được ở lần dựng lại sau; dragover có thể nổ
    // trước lần dựng đó, đọc ra null rồi bỏ qua preventDefault — mà thiếu
    // preventDefault thì trình duyệt từ chối thả, im lặng.
    const i = src.indexOf('onDragOver')
    expect(
      /dangKeoRef\.current/.test(src.slice(i, i + 400)),
      'onDragOver phải đọc dangKeoRef.current (đồng bộ), không đọc state dangKeo.',
    ).toBe(true)
  })
})

// ── /work/tu-sinh: nhân viên thường không thấy màn này ──────────────────────
// CEO chốt 24/08: "nhân viên thì nên bỏ qua luôn ko thấy phần này chứ ko phải là
// ko ấn được." Bày ra một trang toàn nút chết là bắt người ta đoán mình sai gì.
describe('/work/tu-sinh — chặn cả TRANG, không chỉ ẩn nút', () => {
  it('trang gọi chanNeuThieuQuyen', () => {
    const src = doc('app/work/tu-sinh/page.tsx')
    expect(
      /chanNeuThieuQuyen\(\s*'work\.luat_tu_sinh'/.test(src),
      'Trang /work/tu-sinh phải chặn bằng chanNeuThieuQuyen — ẩn link trên nav ' +
        'không phải phân quyền, ai biết đường dẫn vẫn gõ thẳng vào được.',
    ).toBe(true)
  })

  for (const f of ['app/work/page.tsx', 'app/work/team/page.tsx']) {
    it(`${f} ẩn link "Việc tự sinh" với nhân viên thường`, () => {
      const src = doc(f)
      const i = src.indexOf('/work/tu-sinh')
      expect(i, `${f} không còn link tới /work/tu-sinh`).toBeGreaterThan(-1)
      expect(
        /thayTuSinh\s*&&/.test(src.slice(Math.max(0, i - 200), i)),
        `${f}: link "Việc tự sinh" phải bọc trong {thayTuSinh && …}.`,
      ).toBe(true)
    })
  }
})

// ── 3. Xoá hàng loạt phải đi qua hai nhịp ───────────────────────────────────
// Xoá là hành động duy nhất trong khu Việc không có đường lùi, và `task.parent_id`
// là FK ON DELETE CASCADE nên chọn 3 việc có thể mất 20. Nhịp xem trước tồn tại
// để nói ra con số đó; dấu vân tồn tại để con số đã nói vẫn còn đúng lúc bấm.
describe('Xoá hàng loạt — hai nhịp, có dấu vân', () => {
  const actions = doc('app/work/actions.ts')
  const thanh = doc('components/work/ThanhHangLoat.tsx')

  it('có action xem trước, và nó không xoá gì', () => {
    expect(/export async function xemTruocXoa\(/.test(actions)).toBe(true)
    const than = actions.slice(
      actions.indexOf('export async function xemTruocXoa('),
      actions.indexOf('export async function xoaHangLoat('),
    )
    expect(
      /work_xem_truoc_xoa/.test(than) && !/work_xoa_hang_loat/.test(than),
      'xemTruocXoa phải chỉ gọi RPC đếm, tuyệt đối không gọi RPC xoá.',
    ).toBe(true)
  })

  it('xoaHangLoat bắt buộc nhận dấu vân', () => {
    const m = actions.match(/export async function xoaHangLoat\(([^)]*)\)/)
    expect(m, 'không thấy xoaHangLoat').toBeTruthy()
    expect(
      /dauVan\s*:\s*string(?!\s*\|)/.test(m![1]),
      'dauVan phải là tham số BẮT BUỘC (không optional, không nullable) — nếu không ' +
        'thì gọi thẳng xoá mà bỏ qua bước xem trước lại thành chuyện làm được.',
    ).toBe(true)
  })

  it('thanh hàng loạt không gọi thẳng xoaHangLoat khi chưa có dấu vân', () => {
    expect(
      /xemTruoc\?\.dau_van/.test(thanh) || /xemTruoc\.dau_van/.test(thanh),
      'ThanhHangLoat phải lấy dau_van từ kết quả xem trước.',
    ).toBe(true)
    expect(
      /HopXacNhanXoa/.test(thanh),
      'Nút xoá phải mở hộp xác nhận, không xoá ngay khi bấm.',
    ).toBe(true)
  })
})

// ── Không RPC nào được chép tay luật quyền ─────────────────────────────────
// Bài học 24/08: work_13 thêm cửa admin + team vào `work.co_the_sua()`, nhưng
// `work_doi_trang_thai` có bản kiểm quyền CHÉP TAY riêng nên bản vá trượt qua nó
// — mà đó là RPC bị bấm nhiều nhất khu Việc (nút "✓ Đánh dấu xong" và ô chọn
// trạng thái). Sửa hàm chung mà quên hàm chép tay = vá một nửa, và nửa còn lại
// im lặng chạy luật cũ.
//
// Hai hàm chung hợp lệ:
//   · work.co_the_sua()        — quyền SỬA
//   · work.visible_task_ids()  — quyền XEM (bình luận, chọn việc cha… dùng cái này)
describe('RPC khu Việc — quyền luôn hỏi hàm chung, không chép tay', () => {
  const { readdirSync } = require('node:fs') as typeof import('node:fs')
  const thuMuc = fileURLToPath(new URL('../../../db/work/migrations', import.meta.url))
  // Sắp theo tên file = theo thứ tự áp. Bản ĐỊNH NGHĨA SAU đè bản trước, nên chỉ
  // bản CUỐI của mỗi hàm mới là thứ đang chạy — file cũ đương nhiên còn bản cũ,
  // soi cả file cũ là báo động giả.
  const files = readdirSync(thuMuc).filter((f: string) => f.endsWith('.sql')).sort()

  /** tên hàm -> thân của lần định nghĩa CUỐI CÙNG */
  const banCuoi = new Map<string, { file: string; than: string }>()
  for (const f of files) {
    const src = readFileSync(`${thuMuc}/${f}`, 'utf8')
    for (const doan of src.split(/(?=create or replace function )/i)) {
      const m = doan.match(/create or replace function\s+([\w.]+)/i)
      if (m) banCuoi.set(m[1], { file: f, than: doan })
    }
  }

  it('đọc được migration và gom được hàm (chống test xanh giả)', () => {
    expect(files.length, 'không đọc được db/work/migrations').toBeGreaterThan(5)
    expect(banCuoi.size, 'không gom được hàm nào').toBeGreaterThan(10)
  })

  it('không hàm nào chặn quyền bằng điều kiện chép tay', () => {
    const viPham: string[] = []
    for (const [ten, { file, than }] of banCuoi) {
      if (!/Không có quyền/.test(than)) continue
      if (/co_the_sua\s*\(|visible_task_ids\s*\(/.test(than)) continue
      viPham.push(`${ten} (${file})`)
    }
    expect(
      viPham,
      'Hàm chặn quyền bằng điều kiện chép tay thay vì gọi work.co_the_sua() / ' +
        `work.visible_task_ids(): ${viPham.join(', ')}. ` +
        'Chép tay là lần sau sửa luật chung sẽ trượt qua chúng — đúng thứ đã xảy ra ' +
        'với work_doi_trang_thai khi work_13 mở cửa admin.',
    ).toEqual([])
  })
})

// ── Panel: việc con tạo được, phụ thuộc hiện được ──────────────────────────
describe('ChiTietViec — việc con + phụ thuộc', () => {
  const src = doc('components/work/ChiTietViec.tsx')

  it('có ô thêm việc con', () => {
    expect(/taoViecCon\(/.test(src), 'panel chưa gọi taoViecCon').toBe(true)
  })

  it('việc con tick xong được ngay tại panel', () => {
    const i = src.indexOf('ct.subtasks.map')
    expect(
      /type="checkbox"/.test(src.slice(i, i + 1200)),
      'danh sách việc con phải có ô tick, không chỉ đọc.',
    ).toBe(true)
  })

  it('hiện CẢ HAI chiều phụ thuộc', () => {
    // Chỉ hiện chiều "bị chặn" thì hoãn một việc mà không biết mình làm kẹt ai.
    expect(/ct\.chan_boi/.test(src) && /ct\.dang_chan/.test(src)).toBe(true)
  })
})
