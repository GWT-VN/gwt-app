'use client'

import {
  createContext, useContext, useEffect, useRef, useState, useTransition,
  type KeyboardEvent as KeyboardEventReact, type ReactNode, type RefObject,
} from 'react'
import { BocGoiY, useCauHinh, useGiaoDien } from './CauHinh'
import type { ThamSoLoc } from './kieu'

/**
 * Chọn nhiều dòng trong bảng — MỚI CHỈ CÓ PHẦN CHỌN, chưa có hành động nào.
 * Chỗ cắm hành động hàng loạt là `children` của <ThanhDaChon>; xem hướng dẫn ở
 * cuối file.
 *
 * Bốn quyết định đã chốt, đừng đổi mà không bàn lại:
 *
 * 1. Xoá sạch lựa chọn khi ĐỔI BỘ LỌC / TỪ KHOÁ / SẮP XẾP, nhưng GIỮ khi lật
 *    trang. Mốc so sánh là chữ ký bộ lọc (`thamSo`), KHÔNG phải danh sách khoá
 *    của trang — lấy khoá trang làm mốc thì chọn tất cả 472 máy xong lật sang
 *    trang 2 là mất sạch, đúng thứ vừa bấm.
 *
 * 2. Chọn quá phạm vi trang thì PHẢI NÓI RA. Thanh luôn ghi con số thật, và khi
 *    lựa chọn có dòng nằm ngoài trang đang xem thì ghi thêm "gồm cả dòng ở trang
 *    khác". Tai nạn kinh điển của chọn-xuyên-trang là người dùng nhìn thấy 3 ô
 *    tick trên màn hình rồi bấm, không biết còn 189 dòng nữa đang được chọn.
 *
 * 3. Chỉ admin thấy ô chọn (`bat`). Đây là lớp che giao diện cho đỡ rối mắt,
 *    KHÔNG phải phân quyền — rào thật phải nằm trong Server Action.
 *
 * 4. Khoá dòng là khoá chính thật (ticket_code, visit_id, serial+filter_code…),
 *    không phải chỉ số mảng — chỉ số đổi nghĩa mỗi lần sắp xếp lại.
 */

type BoiCanh = {
  bat: boolean
  daChon: Set<string>
  khoaTrang: string[]
  tong: number
  dangLay: boolean
  loi: string | null
  doiMot: (khoa: string, chon: boolean) => void
  doiTatCa: (chon: boolean) => void
  /** Xoá SẠCH, kể cả dòng đã chọn ở trang khác. Khác doiTatCa(false) vốn chỉ đụng trang này. */
  xoaHet: () => void
  chonToanBo: (() => void) | null
  /** Đã bấm "chọn tất cả" xong rồi -> không mời bấm lại nữa. */
  daLayToanBo: boolean
  /** Câu cho vùng đọc (aria-live) luôn có sẵn trong khung — ThanhDaChon đặt. */
  datCauDoc: (cau: string) => void
}

/**
 * Ref đi context RIÊNG: React Compiler coi cả object chứa ref là ref → mọi trường khác của BoiCanh đọc trong render
 * bị báo `react-hooks/refs`. Giá trị ổn định (tạo một lần) nên context này không làm ai render lại.
 */
type RefChon = {
  /** Ô "chọn hết trang" (OChonTatCa) — đích trả focus khi thanh biến mất. */
  oTatCa: RefObject<HTMLInputElement | null>
  khung: RefObject<HTMLDivElement | null>
  /** OChonTatCa gắn ô của nó vào `oTatCa` (callback ref — truyền thẳng `ref={oTatCa}` lại làm Compiler coi object là ref). */
  ganOTatCa: (el: HTMLInputElement | null) => void
}

const Ctx = createContext<BoiCanh | null>(null)
const CtxRef = createContext<RefChon | null>(null)

/** Tên bắt đầu bằng `use` là bắt buộc — quy tắc hook của React/ESLint. */
function useBoiCanh(ten: string): BoiCanh {
  const c = useContext(Ctx)
  if (!c) throw new Error(`<${ten}> phải nằm trong <KhungChon>.`)
  return c
}

/** Gọi SAU useBoiCanh (đã ném lỗi rõ tên nếu thiếu KhungChon) → ở đây chắc chắn có. */
function useRefChon(): RefChon {
  return useContext(CtxRef)!
}

export function KhungChon({
  khoaTrang,
  tong,
  bat,
  thamSo,
  layTatCaKhoa,
  children,
}: {
  /** Khoá chính của ĐÚNG các dòng đang hiện trên trang này, theo thứ tự hiển thị. */
  khoaTrang: string[]
  /** Tổng số dòng khớp bộ lọc (tất cả các trang). */
  tong: number
  /** false -> không hiện ô chọn nào (vai trò cs). */
  bat: boolean
  /**
   * Bộ lọc hiện hành của trang — q, tt, sp, bh, cot, chieu… KHÔNG chứa `trang`.
   * Dùng cho hai việc: làm mốc xoá lựa chọn, và làm tham số cho layTatCaKhoa().
   */
  thamSo: ThamSoLoc
  /** Server Action trả TOÀN BỘ khoá khớp bộ lọc (khoaTatCa* trong app/actions.ts). */
  layTatCaKhoa?: (t: ThamSoLoc) => Promise<string[]>
  children: ReactNode
}) {
  const gd = useGiaoDien()
  const [daChon, setDaChon] = useState<Set<string>>(() => new Set())
  const [cauDoc, datCauDoc] = useState('')
  const oTatCa = useRef<HTMLInputElement>(null)
  const khung = useRef<HTMLDivElement>(null)
  const [refChon] = useState<RefChon>(() => ({
    oTatCa,
    khung,
    ganOTatCa: (el) => {
      oTatCa.current = el
    },
  }))
  const [daLayToanBo, setDaLayToanBo] = useState(false)
  const [loi, setLoi] = useState<string | null>(null)
  const [dangLay, batDau] = useTransition()

  // Đổi bộ lọc -> bỏ chọn hết. Đây là mẫu "chỉnh state khi prop đổi" của React
  // (so sánh ngay trong lúc render, không dùng useEffect) — dùng useEffect ở đây
  // sẽ hiện một nhịp với lựa chọn CŨ trên dữ liệu MỚI.
  //
  // Cố ý KHÔNG lấy khoaTrang làm mốc: lật trang thì khoaTrang đổi nhưng bộ lọc
  // vẫn thế, mà lật trang KHÔNG phải lý do để vứt lựa chọn người dùng vừa làm.
  const chuKy = JSON.stringify(thamSo)
  const [chuKyCu, setChuKyCu] = useState(chuKy)
  if (chuKy !== chuKyCu) {
    setChuKyCu(chuKy)
    setDaChon(new Set())
    setDaLayToanBo(false)
    setLoi(null)
  }

  function doiMot(khoa: string, chon: boolean) {
    setDaChon((cu) => {
      const moi = new Set(cu)
      if (chon) moi.add(khoa)
      else moi.delete(khoa)
      return moi
    })
    setLoi(null)
  }

  /** Chỉ tác động trong phạm vi TRANG: giữ nguyên các dòng đã chọn ở trang khác. */
  function doiTatCa(chon: boolean) {
    setDaChon((cu) => {
      const moi = new Set(cu)
      for (const k of khoaTrang) {
        if (chon) moi.add(k)
        else moi.delete(k)
      }
      return moi
    })
    setLoi(null)
  }

  function xoaHet() {
    setDaChon(new Set())
    setDaLayToanBo(false)
    setLoi(null)
  }

  const chonToanBo = layTatCaKhoa
    ? () => {
        setLoi(null)
        batDau(async () => {
          try {
            const tatCa = await layTatCaKhoa(thamSo)
            setDaChon(new Set(tatCa))
            setDaLayToanBo(true)
          } catch {
            setLoi('Không lấy được toàn bộ danh sách. Thử lại.')
          }
        })
      }
    : null

  return (
    <Ctx.Provider
      value={{
        bat, daChon, khoaTrang, tong, dangLay, loi,
        doiMot, doiTatCa, xoaHet, chonToanBo, daLayToanBo, datCauDoc,
      }}
    >
      <CtxRef.Provider value={refChon}>
        <div ref={khung} className={gd.chon_khung}>
          {/* Vùng đọc LUÔN có (kể cả 0 dòng chọn): vùng live sinh cùng lúc với nội dung thì
              câu đầu không được đọc. Đặt ĐẦU khung: sr-only là absolute nên không đổi bố cục. */}
          <span className={gd.chon_vungDoc} aria-live="polite" aria-atomic="true">
            {cauDoc}
          </span>
          {children}
        </div>
      </CtxRef.Provider>
    </Ctx.Provider>
  )
}

/**
 * Hành động hàng loạt đọc lựa chọn qua hook này.
 *
 * `daChon` là mảng khoá THẬT, kể cả khi người dùng bấm "chọn tất cả khớp bộ lọc"
 * — không có chế độ ngầm nào để bên gọi phải tự đoán. Đổi lại, hành động phải
 * chịu được mảng vài trăm phần tử: chia lô mà gửi, đừng bắn từng dòng một.
 */
export function useDaChon() {
  const c = useBoiCanh('useDaChon')
  return {
    daChon: [...c.daChon],
    soDong: c.daChon.size,
    boChonHet: c.xoaHet,
  }
}

/** `<th>` ô chọn tất cả TRÊN TRANG. Đặt làm cột ĐẦU TIÊN của `<tr>` trong `<thead>`. */
export function OChonTatCa({ nhan = 'dòng' }: { nhan?: string }) {
  const c = useBoiCanh('OChonTatCa')
  const gd = useGiaoDien()
  const { ganOTatCa } = useRefChon()
  const ref = useRef<HTMLInputElement>(null)
  const tongTrang = c.khoaTrang.length
  const soChon = c.khoaTrang.filter((k) => c.daChon.has(k)).length
  const het = tongTrang > 0 && soChon === tongTrang

  // "Chọn một phần" không set được bằng thuộc tính JSX, phải gán qua DOM.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = soChon > 0 && soChon < tongTrang
  }, [soChon, tongTrang])

  if (!c.bat) return null

  return (
    <th className={gd.chon_oTh}>
      <input
        ref={(el) => {
          ref.current = el
          ganOTatCa(el)
        }}
        type="checkbox"
        checked={het}
        disabled={tongTrang === 0}
        onChange={(e) => c.doiTatCa(e.target.checked)}
        aria-label={`Chọn ${tongTrang} ${nhan} trên trang này`}
        title={`Chọn ${tongTrang} ${nhan} trên trang này`}
        className={gd.chon_checkbox}
      />
    </th>
  )
}

/** `<td>` ô chọn của một dòng. Đặt làm cột ĐẦU TIÊN của mỗi `<tr>` trong `<tbody>`. */
export function OChonDong({ khoa, moTa }: { khoa: string; moTa?: string }) {
  const c = useBoiCanh('OChonDong')
  const gd = useGiaoDien()
  if (!c.bat) return null

  return (
    <td className={gd.chon_oTd}>
      <input
        type="checkbox"
        checked={c.daChon.has(khoa)}
        onChange={(e) => c.doiMot(khoa, e.target.checked)}
        aria-label={`Chọn ${moTa ?? khoa}`}
        className={gd.chon_checkbox}
      />
    </td>
  )
}

/**
 * Thanh "Đã chọn N …" — chỉ hiện khi có ít nhất một dòng được chọn.
 *
 * 👉 CHỖ CẮM HÀNH ĐỘNG HÀNG LOẠT (cho chị Trang):
 *    Viết một Client Component riêng, trong đó gọi `useDaChon()` để lấy
 *    `daChon` (mảng khoá) và `boChonHet`, rồi đặt nó vào `children` của thanh này:
 *
 *      <ThanhDaChon nhan="ticket">
 *        <DoiTrangThaiHangLoat />
 *      </ThanhDaChon>
 *
 *    Bốn việc BẮT BUỘC trong Server Action tương ứng (đã soát code 2026-07-29):
 *      • gọi laAdmin() — updateTicket() hiện KHÔNG có rào admin nào
 *      • hộp xác nhận ghi rõ SỐ DÒNG trước khi chạy
 *      • chia lô khi ghi (mảng có thể tới vài trăm khoá sau khi "chọn tất cả")
 *      • ghi vết trước/sau vào ticket_note — updateTicket() đè thẳng, không lưu
 *        giá trị cũ, sửa nhầm 50 dòng là không lần ngược được
 */
export function ThanhDaChon({ nhan = 'dòng', children }: { nhan?: string; children?: ReactNode }) {
  const c = useBoiCanh('ThanhDaChon')
  const { giaoDien: gd, bieuTuong, escBoChon } = useCauHinh()
  const refChon = useRefChon()
  const soDong = c.bat ? c.daChon.size : 0
  const thanh = useRef<HTMLDivElement>(null)
  const [nutDung, setNutDung] = useState(0)

  const soTrenTrang = c.khoaTrang.filter((k) => c.daChon.has(k)).length
  const hetTrang = c.khoaTrang.length > 0 && soTrenTrang === c.khoaTrang.length
  // Lựa chọn vượt khỏi trang đang xem -> BẮT BUỘC nói ra, xem quyết định 2 ở đầu file.
  const vuotTrang = soDong > soTrenTrang
  const conNua = c.tong > c.khoaTrang.length
  const moiChonToanBo = hetTrang && conNua && soDong < c.tong && !!c.chonToanBo && !c.daLayToanBo
  // Đã lấy toàn bộ mà vẫn thiếu -> chạm trần TOI_DA_CHON. PHẢI nói ra: im lặng ở
  // đây nghĩa là người dùng tin mình đang thao tác trên cả 5.000 dòng trong khi
  // thực tế chỉ có 2.000.
  const chamTran = c.daLayToanBo && soDong < c.tong

  // Câu cho vùng đọc của KhungChon: số dòng + lời mời chọn toàn bộ + cảnh báo trần + lỗi.
  const cau =
    soDong === 0
      ? ''
      : [
          `Đã chọn ${soDong} ${nhan}${vuotTrang ? ' (gồm cả dòng ở trang khác)' : ''}.`,
          chamTran && `Chỉ chọn được tối đa ${soDong} mỗi lượt — thu hẹp bộ lọc rồi làm nhiều đợt.`,
          moiChonToanBo && `Có thể chọn tất cả ${c.tong} ${nhan} khớp bộ lọc.`,
          c.loi,
        ]
          .filter(Boolean)
          .join(' ')
  const daCo = useRef(false)
  const { datCauDoc } = c
  useEffect(() => {
    datCauDoc(cau || (daCo.current ? 'Đã bỏ chọn.' : ''))
    daCo.current = !!cau
  }, [cau, datCauDoc])

  // Bỏ hết. Thanh biến mất → focus đang ở trong thanh (hoặc đã rơi về body) thì dời về ô
  // "chọn hết trang"; không có ô đó thì về khung — không để rơi về đầu trang.
  function boChon() {
    const dang = document.activeElement
    if (!dang || dang === document.body || thanh.current?.contains(dang)) {
      const o = refChon.oTatCa.current
      const kh = refChon.khung.current
      if (o && !o.disabled) o.focus()
      else if (kh) {
        // Vòng focus để bộ giao diện / trình duyệt vẽ (focus-visible) — không tắt: WCAG 2.4.7.
        // setAttribute thay vì gán `tabIndex`: Compiler cấm gán thuộc tính lên giá trị lấy từ hook (context).
        kh.setAttribute('tabindex', '-1')
        kh.focus()
      }
    }
    c.xoaHet()
  }
  const boChonMoi = useRef(boChon)
  useEffect(() => {
    boChonMoi.current = boChon
  })

  // Esc = bỏ HẾT (bật qua CauHinhBang `escBoChon`). Nhường Esc cho thứ đang dùng nó: bộ gõ
  // đang ghép chữ, ô đang gõ chữ, lớp Radix đang mở (menu / Select / hộp / tooltip đóng bằng
  // Esc thì preventDefault ở pha capture). KHÔNG quét DOM tìm role menu/listbox: màn có
  // listbox thường trực (Combobox, bảng lệnh tĩnh) thì Esc sẽ không bao giờ bỏ chọn được.
  useEffect(() => {
    if (!escBoChon || soDong === 0) return
    const k = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.isComposing || e.defaultPrevented) return
      const t = e.target as Element | null
      if (t?.closest?.('input:not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=""], [contenteditable="true"]')) return
      boChonMoi.current()
    }
    // Nghe ở WINDOW (pha nổi, chặng cuối): mọi listener trên document — Radix (capture) và cả listener
    // gắn SAU listener này như KeyboardSensor của dnd-kit (huỷ kéo cột/thẻ bằng Esc) — đã chạy và
    // preventDefault xong. Nghe ở document thì listener gắn trước chạy trước, cướp Esc của dnd-kit.
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [escBoChon, soDong])

  // Toolbar theo APG: một điểm Tab, ←/→/Home/End đi giữa các nút theo thứ tự HIỆN (bộ giao
  // diện có thể đổi thứ tự bằng CSS `order`) — sắp theo vị trí trên màn: hai nút cùng hàng khi
  // khoảng dọc của chúng chồng nhau (nút link thấp hơn nút thường, so mép trên là lệch hàng), rồi trái → phải.
  function cacNut(): HTMLElement[] {
    const t = thanh.current
    if (!t) return []
    const ds = [...t.querySelectorAll<HTMLElement>('button, a[href]')].filter((el) => !(el as HTMLButtonElement).disabled)
    return ds.sort((a, b) => {
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      if (ra.bottom <= rb.top && ra.top < rb.top) return -1
      if (rb.bottom <= ra.top && rb.top < ra.top) return 1
      return ra.left - rb.left
    })
  }
  useEffect(() => {
    const ds = cacNut()
    const i = Math.min(nutDung, ds.length - 1)
    ds.forEach((el, j) => (el.tabIndex = j === i ? 0 : -1))
  })
  function phimMuiTen(e: KeyboardEventReact<HTMLDivElement>) {
    // Sự kiện React nổi qua portal (menu mở từ nút trong thanh) — chỉ xử lý phím trên nút của thanh.
    if (!thanh.current?.contains(e.target as Node)) return
    const ds = cacNut()
    const i = ds.indexOf(e.target as HTMLElement)
    if (i < 0) return
    const den = { ArrowRight: (i + 1) % ds.length, ArrowLeft: (i - 1 + ds.length) % ds.length, Home: 0, End: ds.length - 1 }[e.key]
    if (den === undefined) return
    e.preventDefault()
    ds[den].focus()
  }

  if (soDong === 0) return null

  return (
    <div
      ref={thanh}
      className={gd.chon_thanh}
      role="toolbar"
      aria-label="Thao tác hàng loạt"
      onKeyDown={phimMuiTen}
      onFocus={(e) => {
        const i = cacNut().indexOf(e.target as HTMLElement)
        if (i >= 0) setNutDung(i)
      }}
    >
      <span className={gd.chon_thanhSo}>
        Đã chọn <strong>{soDong}</strong> {nhan}
        {vuotTrang && <span className={gd.chon_thanhPhuChu}> (gồm cả dòng ở trang khác)</span>}
      </span>

      {chamTran && (
        <span className={gd.chon_thanhCanhBao}>
          Chỉ chọn được tối đa {soDong} mỗi lượt — thu hẹp bộ lọc rồi làm nhiều đợt.
        </span>
      )}

      {moiChonToanBo && (
        <button
          type="button"
          onClick={c.chonToanBo!}
          disabled={c.dangLay}
          className={gd.chon_nutChonToanBo}
        >
          {c.dangLay ? 'Đang lấy…' : `Chọn tất cả ${c.tong} ${nhan} khớp bộ lọc`}
        </button>
      )}

      {/* xoaHet chứ KHÔNG doiTatCa(false): sau khi "chọn tất cả 472", bỏ chọn mà
          chỉ xoá trong phạm vi trang thì còn sót 422 dòng đang chọn ngoài tầm mắt. */}
      {bieuTuong.boChon ? (
        <BocGoiY noiDung={escBoChon ? 'Bỏ hết, kể cả trang khác (Esc)' : 'Bỏ hết, kể cả trang khác'}>
          <button type="button" onClick={boChon} aria-label="Bỏ chọn" className={gd.chon_nutBoChon}>
            {bieuTuong.boChon}
          </button>
        </BocGoiY>
      ) : (
        <button type="button" onClick={boChon} className={gd.chon_nutBoChon}>
          Bỏ chọn
        </button>
      )}

      {c.loi && <span className={gd.chon_loi}>{c.loi}</span>}

      {children ? (
        <div className={gd.chon_khuHanhDong}>{children}</div>
      ) : (
        // Nói thật trạng thái thay vì để một nút giả: chọn xong mà không làm gì
        // được thì người dùng phải biết là do CHƯA CÓ, không phải do bấm hỏng.
        <span className={gd.chon_chuaCoHanhDong}>
          Thao tác hàng loạt đang được bổ sung — hiện chỉ chọn được.
        </span>
      )}
    </div>
  )
}
