import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
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
  // v2 (23/11): mọi màn Việc (của tôi, Bảng team, Tự sinh) dựng panel qua KhungXemViec → useTheViec. Từ 26/11 thẻ có
  // tab (bố cục ticket F): mỗi tab + chân là một khối riêng, khối nào cũng phải mang key theo việc.
  // `<Chan>` (nút Đánh dấu xong ở chân thẻ) bỏ 27/11 — CEO "bỏ CTA đánh dấu"; đổi xong qua ô Trạng thái.
  const NOI_DUNG = ['<TongQuan', '<ViecCon', '<HoatDong', '<LienKet'].map((x) => [
    'components/work/v2/XemNhanh.tsx',
    x,
  ])

  for (const [f, the0] of NOI_DUNG) {
    it(`${f} truyền key cho ${the0}>`, () => {
      const src = doc(f)
      const i = src.indexOf(the0)
      expect(i, `${f} không còn dựng ${the0}> — cập nhật lại test này`).toBeGreaterThan(-1)
      // Cắt tới dấu đóng thẻ đầu tiên sau đó rồi tìm key= trong khoảng đó.
      const the = src.slice(i, src.indexOf('/>', i))
      expect(
        /\bkey=\{/.test(the),
        `${f}: ${the0}> thiếu prop key. Không có nó thì đổi sang việc khác ` +
          'vẫn hiện tiêu đề/mô tả/hạn của việc CŨ (defaultValue chỉ áp lúc gắn).',
      ).toBe(true)
    })
  }
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

  // Từ khung điều hướng v2 (23/11) link nằm ở menu khu Việc (lib/khung/ban-do-menu.ts — test ẩn/hiện theo quyền ở
  // ban-do-menu.test.ts). Ở đây giữ: menu hỏi ĐÚNG cặp (mã quyền, luật cũ) mà trang dùng để chặn — lệch là menu hiện mà
  // bấm vào bị đá ra, hoặc ngược lại.
  it('menu khung hỏi đúng cặp quyền mà trang /work/tu-sinh dùng để chặn', () => {
    const trang = doc('app/work/tu-sinh/page.tsx').match(/chanNeuThieuQuyen\(\s*'work\.luat_tu_sinh'\s*,\s*'(\w+)'/)
    expect(trang, 'trang không còn gọi chanNeuThieuQuyen(work.luat_tu_sinh, …)').not.toBeNull()
    const menu = doc('lib/khung/ban-do-menu.ts')
    expect(menu).toContain(`['work.luat_tu_sinh', '${trang![1]}']`)
    expect(menu).toMatch(/co\('work\.luat_tu_sinh'\)\s*\?\s*\[m\('Việc tự sinh', '\/work\/tu-sinh'\)\]/)
  })
})

// ── 3. Xoá hàng loạt phải đi qua hai nhịp ───────────────────────────────────
// Xoá là hành động duy nhất trong khu Việc không có đường lùi, và `task.parent_id`
// là FK ON DELETE CASCADE nên chọn 3 việc có thể mất 20. Nhịp xem trước tồn tại
// để nói ra con số đó; dấu vân tồn tại để con số đã nói vẫn còn đúng lúc bấm.
describe('Xoá hàng loạt — hai nhịp, có dấu vân', () => {
  const actions = doc('app/work/actions.ts')
  const thanh = doc('components/work/v2/HangLoat.tsx')

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
      /xoaHangLoat\([^)]*dau_van/.test(thanh),
      'Thanh hàng loạt phải nộp dau_van lấy từ kết quả xem trước.',
    ).toBe(true)
    expect(
      /xemTruocXoa\(/.test(thanh) && /<ConfirmDialog/.test(thanh),
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
describe('Xem nhanh việc — việc con + phụ thuộc', () => {
  const src = doc('components/work/v2/XemNhanh.tsx')

  it('có ô thêm việc con', () => {
    expect(/taoViecCon\(/.test(src), 'panel chưa gọi taoViecCon').toBe(true)
  })

  it('việc con tick xong được ngay tại panel', () => {
    // Bảng mini việc con (ListView, 27/11): ô tick nằm trong `o` của cột tên, trước `dong={ct.subtasks}`.
    const i = src.indexOf('function ViecCon(')
    expect(
      /<Checkbox[\s\S]*?onCheckedChange[\s\S]*?dong=\{ct\.subtasks\}/.test(src.slice(i, i + 3000)),
      'danh sách việc con phải có ô tick, không chỉ đọc.',
    ).toBe(true)
  })

  it('hiện CẢ HAI chiều phụ thuộc', () => {
    // Chỉ hiện chiều "bị chặn" thì hoãn một việc mà không biết mình làm kẹt ai.
    expect(/ct\.chan_boi/.test(src) && /ct\.dang_chan/.test(src)).toBe(true)
  })
})

// ── "Theo dõi" là XEM, không phải SỬA ──────────────────────────────────────
// CEO bắt được 24/08: Admin chỉ là watcher trên việc của AI mà vẫn đánh dấu xong
// được. Nguy hơn vẻ ngoài của nó: work_12 (@nhắc tên) kéo người được nhắc vào
// việc với đúng vai `watcher`, nên gộp watcher vào quyền sửa nghĩa là NHẮC AI
// LÀ CẤP QUYỀN CHO NGƯỜI ĐÓ — không ai coi việc nhắc tên là cấp quyền.
describe('co_the_sua — watcher không được sửa', () => {
  const thuMuc = fileURLToPath(new URL('../../../db/work/migrations', import.meta.url))
  const files = readdirSync(thuMuc).filter((f: string) => f.endsWith('.sql')).sort()

  /** Bản định nghĩa CUỐI của work.co_the_sua — bản đang thật sự chạy. */
  let than = ''
  for (const f of files) {
    for (const doan of readFileSync(`${thuMuc}/${f}`, 'utf8')
      .split(/(?=create or replace function )/i)) {
      if (/create or replace function\s+work\.co_the_sua/i.test(doan)) than = doan
    }
  }

  it('tìm được bản định nghĩa cuối (chống test xanh giả)', () => {
    expect(than.length, 'không thấy work.co_the_sua trong migration').toBeGreaterThan(200)
  })

  it('cửa "người làm" liệt kê vai rõ ràng, KHÔNG gồm watcher', () => {
    const m = than.match(/a\.role\s+in\s*\(([^)]*)\)/i)
    expect(
      m,
      'Cửa "người làm" phải liệt kê vai cụ thể (a.role in (…)). Không liệt kê ' +
        'nghĩa là nhận cả `watcher` — mà @nhắc-tên tự gán vai đó.',
    ).toBeTruthy()
    const vai = m![1]
    expect(/watcher/.test(vai), `watcher không được nằm trong danh sách vai sửa được: ${vai}`).toBe(false)
    for (const v of ['owner', 'doer', 'reviewer']) {
      expect(vai.includes(v), `thiếu vai '${v}' — người làm thật sự phải sửa được`).toBe(true)
    }
  })
})

// ── Phụ thuộc phải có ĐƯỜNG THÊM trên giao diện ────────────────────────────
// work_16 làm RPC + chỗ hiển thị nhưng quên ô chọn, nên tính năng chỉ dùng được
// bằng SQL — CEO mở panel ra không thấy gì để bấm.
describe('Phụ thuộc — thêm được từ giao diện', () => {
  it('panel có ô chọn việc chặn', () => {
    const src = doc('components/work/v2/XemNhanh.tsx')
    expect(/themPhuThuoc\(/.test(src)).toBe(true)
  })

  it('mục phụ thuộc hiện cả khi CHƯA có phụ thuộc nào', () => {
    // Nếu chỉ hiện khi đã có thì không bao giờ thêm được cái đầu tiên.
    const src = doc('components/work/v2/XemNhanh.tsx')
    expect(
      /ct\.chan_boi\.length > 0 \|\| ct\.dang_chan\.length > 0 \|\| sua/.test(src),
      'Mục phụ thuộc phải hiện khi người dùng sửa được việc, kể cả lúc danh sách rỗng.',
    ).toBe(true)
  })
})

// ── RPC public.work_* chỉ service_role gọi được (work_19, 23/11) ──────────────
// Mọi RPC khu Việc lấy danh tính từ THAM SỐ p_email. Hàm mới trong `public` nhận grant EXECUTE mặc định của Supabase cho
// anon/authenticated → ai cầm anon key (công khai) gọi thẳng /rest/v1/rpc/work_* là đọc/sửa việc dưới tên người khác.
// `create or replace` hàm cũ giữ ACL đã thu; hàm MỚI thì file migration phải tự revoke.
describe('RPC public.work_* — migration sau work_19 phải tự thu quyền anon', () => {
  const thuMuc = fileURLToPath(new URL('../../../supabase/migrations', import.meta.url))
  const MOC = '20261123140724' // work_19_chan_anon_rpc
  const files = readdirSync(thuMuc).filter((f: string) => f.endsWith('.sql')).sort()

  it('có migration work_19 (chống test xanh giả)', () => {
    expect(files.some((f: string) => f.startsWith(MOC))).toBe(true)
  })

  it('file nào sau mốc định nghĩa function public.work_* đều có revoke execute … anon', () => {
    const viPham = files
      .filter((f: string) => f.slice(0, 14) > MOC)
      .filter((f: string) => {
        const src = readFileSync(`${thuMuc}/${f}`, 'utf8')
        return /function\s+public\.work_/i.test(src) && !/revoke\s+execute[\s\S]*?\banon\b/i.test(src)
      })
    expect(viPham, `Thiếu revoke execute … from public, anon, authenticated: ${viPham.join(', ')}`).toEqual([])
  })
})
