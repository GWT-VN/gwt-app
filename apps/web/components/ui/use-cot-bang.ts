import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { KIEU_NGAY_MAC_DINH, laKieuNgay, type KieuNgay } from '@/lib/dinh-dang-ngay'

/**
 * Cột của dạng xem Bảng (Table) / Danh sách (ListView) — README Table "Nhãn cột: lọc + sắp xếp".
 * `kieu` theo BẢN CHẤT dữ liệu của cột (CEO 18/11 + 19/11):
 * - `sap`: cột có thứ tự/số lượng (Ưu tiên, Hạn, Số ngày mở, Thứ tự tạo) → menu Sắp xếp, nhãn nói NGHĨA (`nghia`);
 * - `loc`: cột nhãn/phân loại (Loại lỗi, Trạng thái, Chủ, Khách, Nguồn) → CHỈ lọc theo tag. Khai `nghia` cho cột này là
 *   lỗi kiểu (`nghia?: never`) và `TieuDeCot` ném lỗi lúc chạy — sắp nhãn theo chữ cái là vô nghĩa;
 * - `thuong`: không menu (Việc tiếp theo, Máy · serial).
 * `rong` (tuỳ chọn) = độ rộng cố định (px). KHÔNG khai = cột tự VỪA NỘI DUNG (CEO 26/11 "chiều rộng cột = chiều dài content
 * dài nhất để tránh bị cắt thông tin"): max(tiêu đề, mọi ô đang vẽ) + đệm ô, đo trên DOM sau khi vẽ (`refBang`) ·
 * `rongToiDa` = trần cho cột tự vừa (cột chữ dài như tên khách) — quá trần mới cắt, ô bị cắt có `title` · nhấp đúp tay co
 * dãn = bỏ số kéo tay, về mặc định (`rong` hoặc vừa nội dung) · `toiThieu` mặc định 56 · `khoa` = không kéo đổi chỗ,
 * không ẩn · `anMacDinh` = ẩn sẵn (bật lại trong ⚙ → Cột hiển thị hoặc nút "+" `ThemCot`) · `phai` = căn phải (số, hạn) ·
 * `icon` = icon đứng trước tên ở danh sách chọn cột (`ThemCot`), không bắt buộc · `ngay` = cột hiện NGÀY → menu tiêu đề có
 * "Định dạng ngày" (CEO 26/11 "cho phép chọn định dạng date ở ô label cột"); ô đọc `useCotBang().kieuNgay(id)` rồi gọi
 * `hienNgay(v, kieu)` (lib/dinh-dang-ngay), URL `cot_ngay=tao:gio` (chỉ ghi cột khác mặc định) · `ngayMacDinh` = kiểu
 * mặc định riêng của cột (vd Cập nhật = 'tuong-doi', CEO 26/11 "Để Tương đối"); không khai = dd/MM của toàn app.
 */
export type NghiaSap = {
  /** Câu nói nghĩa chiều tăng dần của giá trị, vd "Gần hạn nhất trước" — không ghi "Tăng dần". */
  tang: string
  giam: string
}
type CotChung = {
  id: string
  ten: string
  rong?: number
  rongToiDa?: number
  toiThieu?: number
  khoa?: boolean
  anMacDinh?: boolean
  phai?: boolean
  icon?: ReactNode
  ngay?: boolean
  ngayMacDinh?: KieuNgay
}
export type CotBang =
  | (CotChung & { kieu: 'sap'; nghia: NghiaSap })
  | (CotChung & { kieu: 'loc'; nghia?: never })
  | (CotChung & { kieu: 'thuong'; nghia?: never })

export const RONG_TOI_THIEU = 56
/** Bề rộng cột ô chọn dòng (`OChonDong` / `OChonTatCa`) đầu bảng. */
export const RONG_O_CHON = 36
/** Bề rộng cột "+" (`ThemCot`) ở cuối hàng tiêu đề: nút icon-sm 28 + đệm ngang 6 × 2 của `.b-bang-c`. */
export const RONG_THEM_COT = 40
/** Cột tự vừa trước lần đo đầu (HTML server vẽ, trước khi hydrate). */
export const RONG_CHO_DO = 120
/** Khoảng thở cuối cột tự vừa — chữ dài nhất không dính sát cột kế (CEO 26/11 "add thêm 8px spacing ở các đoạn cuối cột"). */
export const KHOANG_CUOI_COT = 8
export type BenTha = 'trai' | 'phai'

/**
 * Mục dời / ẩn trong menu tiêu đề cột (`TieuDeCot` prop `menuCot`, lấy từ `useCotBang().menuCot(id)`). `trai`/`phai` =
 * tên cột đang hiện kề bên mà cột này dời qua được; `null` = ở mép hoặc kề cột khoá → mục hiện nhưng tắt.
 */
export type MenuCot = {
  trai: string | null
  phai: string | null
  onDoi: (ben: BenTha) => void
  onAn: () => void
}
/** Định dạng ngày của một cột `ngay` cho `TieuDeCot ngay` (`useCotBang().ngayCot(id)`). */
export type NgayCot = { kieu: KieuNgay; onDoi: (k: KieuNgay) => void }

export const toiThieu = (c: CotBang) => c.toiThieu ?? RONG_TOI_THIEU
const ngayMd = (c: CotBang | undefined) => c?.ngayMacDinh ?? KIEU_NGAY_MAC_DINH
/** Cột GHIM trái khi bảng cuộn ngang: cột `khoa` đứng ĐẦU hàng (vị trí 0 trong `hien`) — như cột nhãn của Twenty. */
export const laGhim = (c: CotBang, viTri: number) => !!c.khoa && viTri === 0

/**
 * Cột `khoa` đứng YÊN ở vị trí khai báo (cột khoá đầu = cột ghim). Kéo thả (dnd-kit cho thả TRƯỚC cột khoá) hoặc URL
 * `cot_thu_tu` cũ có thể đẩy cột khác lên trước nó → bảng mất `th[data-ghim]` và mất luôn bộ kiểu bảng ghim (ô tick thụt,
 * tiêu đề viết hoa, kẻ trên) — CEO 26/11 "Align giữ nguyên bản gốc chứ sao đẩy lệch thế này". Gom về đây: mọi đường đổi
 * thứ tự đi qua hàm này.
 */
export function giuCotKhoa(thuTu: string[], cot: CotBang[]): string[] {
  const khoa = cot.flatMap((c, i) => (c.khoa && thuTu.includes(c.id) ? [[c.id, i] as const] : []))
  const ra = thuTu.filter((x) => !khoa.some(([id]) => id === x))
  for (const [id, i] of khoa) ra.splice(Math.min(i, ra.length), 0, id)
  return ra
}

/** Bỏ `id` khỏi chỗ cũ, chèn trước (`trai`) / sau (`phai`) cột `dich`. Cột lạ hoặc trùng → giữ nguyên. */
export function doiChoMang(thuTu: string[], id: string, dich: string, ben: BenTha): string[] {
  if (id === dich || !thuTu.includes(id) || !thuTu.includes(dich)) return thuTu
  const m = thuTu.filter((x) => x !== id)
  m.splice(m.indexOf(dich) + (ben === 'phai' ? 1 : 0), 0, id)
  return m
}

/** `keoTay` = CHỈ cột người dùng đã kéo co dãn (px) — cột vắng mặt dùng `rong` khai sẵn hoặc vừa nội dung. */
type TrangThaiCot = { thuTu: string[]; keoTay: Record<string, number>; an: string[]; ngay: Record<string, KieuNgay> }

const macDinh = (cot: CotBang[]): TrangThaiCot => ({
  thuTu: cot.map((c) => c.id),
  keoTay: {},
  an: cot.filter((c) => c.anMacDinh && !c.khoa).map((c) => c.id),
  ngay: {},
})

// Tham số URL (tách khỏi `cot`/`chieu` sắp xếp của bang/): chỉ ghi phần KHÁC mặc định → URL gọn, chép link mở lại y hệt.
const P_THU_TU = 'cot_thu_tu'
const P_RONG = 'cot_rong'
const P_AN = 'cot_an'
const P_NGAY = 'cot_ngay'

/** Đọc trạng thái cột từ URL. Id lạ bị bỏ, cột thiếu trong thứ tự nối cuối theo mặc định, độ rộng kẹp ≥ tối thiểu. */
export function docUrlCot(sp: URLSearchParams, cot: CotBang[]): TrangThaiCot {
  const md = macDinh(cot)
  const theoId = new Map(cot.map((c) => [c.id, c]))
  const ds = (k: string) => (sp.get(k) ?? '').split(',').filter((x) => theoId.has(x))
  const thuTuUrl = [...new Set(ds(P_THU_TU))]
  // Cột mới khai sau khi link được lưu (URL thiếu id) → chèn ngay sau cột đứng trước nó trong thứ tự mặc định, không
  // dồn xuống cuối (CEO 26/11: link cũ thiếu `ma`/`bh` hiện hai cột này cuối bảng).
  const thuTuDu = giuCotKhoa(thuTuUrl, cot)
  md.thuTu.forEach((id, i) => {
    if (thuTuDu.includes(id)) return
    const truoc = md.thuTu.slice(0, i).reverse().find((x) => thuTuDu.includes(x))
    thuTuDu.splice(truoc ? thuTuDu.indexOf(truoc) + 1 : 0, 0, id)
  })
  const thuTu = giuCotKhoa(thuTuDu, cot)
  const keoTay: Record<string, number> = {}
  for (const cap of (sp.get(P_RONG) ?? '').split(',')) {
    const [id, so] = cap.split(':')
    const c = theoId.get(id)
    const px = Number(so)
    if (c && so && Number.isFinite(px)) keoTay[id] = Math.max(toiThieu(c), Math.round(px))
  }
  const an = sp.has(P_AN) ? ds(P_AN).filter((x) => !theoId.get(x)?.khoa) : md.an
  const ngay: Record<string, KieuNgay> = {}
  for (const cap of (sp.get(P_NGAY) ?? '').split(',')) {
    const [id, k] = cap.split(':')
    const c = theoId.get(id)
    if (c?.ngay && k && laKieuNgay(k) && k !== ngayMd(c)) ngay[id] = k
  }
  return { thuTu, keoTay, an, ngay }
}

/** Ghi trạng thái cột vào bản sao `sp` (giữ mọi tham số khác). Bằng mặc định → xoá tham số. */
export function ghiUrlCot(sp: URLSearchParams, s: TrangThaiCot, cot: CotBang[]): URLSearchParams {
  const md = macDinh(cot)
  const ra = new URLSearchParams(sp)
  const dat = (k: string, gt: string | null) => (gt === null ? ra.delete(k) : ra.set(k, gt))
  dat(P_THU_TU, s.thuTu.join(',') === md.thuTu.join(',') ? null : s.thuTu.join(','))
  const rong = cot
    .filter((c) => s.keoTay[c.id] != null && s.keoTay[c.id] !== c.rong)
    .map((c) => `${c.id}:${s.keoTay[c.id]}`)
  dat(P_RONG, rong.length ? rong.join(',') : null)
  const an = [...s.an].sort().join(',')
  dat(P_AN, an === [...md.an].sort().join(',') ? null : an)
  const ngay = Object.entries(s.ngay)
    .filter(([id, k]) => cot.some((c) => c.id === id && c.ngay && k !== ngayMd(c)))
    .map(([id, k]) => `${id}:${k}`)
  dat(P_NGAY, ngay.length ? ngay.join(',') : null)
  return ra
}

/**
 * Đo bề rộng VỪA NỘI DUNG của các cột tự vừa (không khai `rong`) trong `bang`: mỗi cột = max trên ô tiêu đề + mọi ô thân
 * đang vẽ (`th/td[data-cot]`; bỏ hàng nháp `[data-nhap]` vì ô gõ có bề rộng riêng) của: phạm vi các con không định vị
 * tuyệt đối (bỏ tay co dãn), từ mép trái nhất tới mép phải nhất, + đệm trái/phải của ô; kẹp ≥ tối thiểu, ≤ `rongToiDa`.
 * Con bị cắt (`truncate`, `w-full`, `min-w-0`…) được thả `width: max-content` lúc đo rồi trả lại — MỘT lượt ghi rồi MỘT
 * lượt đọc (một lần bố cục). Cột có trần: ô vượt trần có `title` = nội dung (tooltip chữ bị cắt), ô vừa thì gỡ.
 */
export function doVuaNoiDung(bang: HTMLElement, cot: CotBang[]): Record<string, number> {
  const tuVua = new Map(cot.filter((c) => c.rong == null).map((c) => [c.id, c]))
  const o = [...bang.querySelectorAll<HTMLElement>('th[data-cot], td[data-cot]')].filter(
    (x) => tuVua.has(x.dataset.cot!) && !x.closest('[data-nhap]'),
  )
  const con = o.map((x) =>
    [...x.children].filter((y): y is HTMLElement => y instanceof HTMLElement && getComputedStyle(y).position !== 'absolute'),
  )
  const cu = con.flat().map((y) => [y, y.style.width, y.style.maxWidth] as const)
  for (const [y] of cu) {
    y.style.width = 'max-content'
    y.style.maxWidth = 'none'
  }
  const tho = o.map((x, i) => {
    let trai = Infinity
    let phai = -Infinity
    const hop = (r: { left: number; right: number }) => {
      trai = Math.min(trai, r.left)
      phai = Math.max(phai, r.right)
    }
    for (const y of con[i]) hop(y.getBoundingClientRect())
    for (const n of x.childNodes) {
      if (n.nodeType !== Node.TEXT_NODE || !n.textContent?.trim()) continue
      const r = document.createRange()
      r.selectNodeContents(n)
      if (typeof r.getBoundingClientRect === 'function') hop(r.getBoundingClientRect())
    }
    const cs = getComputedStyle(x)
    const dem = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
    return Math.ceil((phai > trai ? phai - trai : 0) + dem)
  })
  for (const [y, w, m] of cu) {
    y.style.width = w
    y.style.maxWidth = m
  }
  const ra: Record<string, number> = {}
  o.forEach((x, i) => {
    const id = x.dataset.cot!
    ra[id] = Math.max(ra[id] ?? 0, tho[i])
  })
  for (const id of Object.keys(ra)) {
    const c = tuVua.get(id)!
    const vua = ra[id] + KHOANG_CUOI_COT
    ra[id] = Math.max(toiThieu(c), c.rongToiDa ? Math.min(vua, c.rongToiDa) : vua)
  }
  o.forEach((x, i) => {
    const tran = tuVua.get(x.dataset.cot!)?.rongToiDa
    if (x.tagName !== 'TD' || !tran) return
    if (tho[i] > tran) x.title = x.textContent?.trim() ?? ''
    else x.removeAttribute('title')
  })
  return ra
}

/**
 * useCotBang — thứ tự / độ rộng / ẩn hiện cột (ruling R8: KHÔNG TanStack — sắp/lọc/phân trang chạy phía server qua URL
 * trong bang/, phần còn lại của trạng thái cột chỉ là ba thứ này).
 * `url: true` → đọc lúc mở trang + ghi lại (`history.replaceState`, Next đồng bộ useSearchParams; gom 200ms cho lúc kéo
 * co dãn) vào `cot_thu_tu`, `cot_rong`, `cot_an`. Hook gọi useSearchParams → nơi dùng nằm trong `<Suspense>` như bang/.
 * Cột tự vừa (không khai `rong`): `const { refBang } = c` rồi `<Table ref={refBang}>` (tách trước — luật react-hooks/refs
 * coi cả `c` là ref nếu `c.refBang` gắn thẳng vào `ref=`) → đo `doVuaNoiDung` trước khi vẽ (layout effect)
 * khi bảng gắn / cột hiện đổi, và đo lại MỘT lượt (gom theo khung hình) khi nội dung ô đổi (MutationObserver: dòng, chữ)
 * hoặc font tải xong. Kéo co dãn chỉ đổi `keoTay` + thuộc tính `<col>` → không kích đo lại.
 * ponytail: chỉ đọc URL lúc mở; bấm Back đổi URL không nạp lại trạng thái cột — thêm khi màn thật cần.
 */
export function useCotBang(cot: CotBang[], { url = false }: { url?: boolean } = {}) {
  const sp = useSearchParams()
  const [s, setS] = useState<TrangThaiCot>(() => (url ? docUrlCot(new URLSearchParams(sp.toString()), cot) : macDinh(cot)))
  const [bang, refBang] = useState<HTMLTableElement | null>(null)
  const [vua, setVua] = useState<Record<string, number>>({})
  const [daDo, setDaDo] = useState(false)

  useEffect(() => {
    if (!url) return
    const hen = setTimeout(() => {
      const ra = ghiUrlCot(new URLSearchParams(window.location.search), s, cot).toString()
      if (ra !== window.location.search.replace(/^\?/, ''))
        window.history.replaceState(null, '', `${window.location.pathname}${ra ? `?${ra}` : ''}${window.location.hash}`)
    }, 200)
    return () => clearTimeout(hen)
  }, [url, s, cot])

  const hien = useMemo(
    () => s.thuTu.filter((id) => !s.an.includes(id)).map((id) => cot.find((c) => c.id === id)!).filter(Boolean),
    [s, cot],
  )
  // Cột tự vừa đang hiện — đổi (hiện/ẩn/dời) thì đo lại; `keoTay` KHÔNG nằm trong deps (kéo co dãn không đo lại).
  const idDo = hien
    .filter((c) => c.rong == null)
    .map((c) => c.id)
    .join(',')
  useLayoutEffect(() => {
    if (!bang || !idDo) return
    let hen = 0
    // Bảng đang ẩn (Suspense của React giấu cây bằng display:none lúc tải lại, tab ẩn…) đo ra 0 → kẹp về sàn 56. Bỏ lượt
    // đó, chờ ResizeObserver báo bảng có kích thước rồi đo — chỉ lúc đang chờ, không đo theo mỗi lần bảng đổi cỡ (kéo).
    let choHien = false
    const chay = () => {
      hen = 0
      choHien = !bang.getClientRects().length
      if (choHien) return
      const moi = doVuaNoiDung(bang, cot)
      setVua((cu) => (Object.keys(moi).every((k) => cu[k] === moi[k]) ? cu : { ...cu, ...moi }))
      setDaDo(true)
    }
    const henDo = () => {
      if (!hen) hen = requestAnimationFrame(chay)
    }
    chay()
    const mo = new MutationObserver(henDo)
    mo.observe(bang, { childList: true, subtree: true, characterData: true })
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => choHien && henDo())
    ro?.observe(bang)
    const fonts = document.fonts as FontFaceSet | undefined
    fonts?.addEventListener?.('loadingdone', henDo)
    void fonts?.ready?.then(henDo)
    return () => {
      mo.disconnect()
      ro?.disconnect()
      fonts?.removeEventListener?.('loadingdone', henDo)
      if (hen) cancelAnimationFrame(hen)
    }
  }, [bang, idDo, cot])
  const doRong = useMemo(
    () => Object.fromEntries(cot.map((c) => [c.id, s.keoTay[c.id] ?? c.rong ?? vua[c.id] ?? RONG_CHO_DO])),
    [cot, s.keoTay, vua],
  )
  const doiCho = (id: string, dich: string, ben: BenTha) =>
    setS((t) => ({ ...t, thuTu: giuCotKhoa(doiChoMang(t.thuTu, id, dich, ben), cot) }))
  const anHien = (id: string, hienCot?: boolean) =>
    setS((t) => {
      if (cot.find((c) => c.id === id)?.khoa) return t
      const dangAn = t.an.includes(id)
      const an = (hienCot ?? dangAn) ? t.an.filter((x) => x !== id) : dangAn ? t.an : [...t.an, id]
      return { ...t, an }
    })
  /** Cột đang hiện kề bên trái/phải mà `id` dời qua được (không vượt cột khoá). */
  const ke = (id: string, ben: BenTha) => {
    const i = hien.findIndex((c) => c.id === id)
    const k = i < 0 ? undefined : hien[ben === 'trai' ? i - 1 : i + 1]
    return k && !k.khoa ? k : null
  }

  return {
    thuTu: s.thuTu,
    /** Độ rộng đang dùng của MỌI cột: kéo tay → `rong` khai → vừa nội dung (đã đo) → `RONG_CHO_DO`. */
    doRong,
    /** Cột đã kéo tay (px) — phần ghi vào URL `cot_rong`. */
    keoTay: s.keoTay,
    an: s.an,
    /** Gắn vào `<Table ref>` để cột tự vừa (không khai `rong`) đo được nội dung. */
    refBang,
    /** Cột đang hiện, đúng thứ tự. */
    hien,
    /**
     * Bảng có cột tự vừa mà CHƯA đo lần nào (server render, trước hydrate) — đưa cho `ColCotBang choDo`: bảng giữ chỗ
     * nhưng ẩn (`visibility: hidden`) tới lượt đo đầu (layout effect, trước khi vẽ) thay vì hiện `RONG_CHO_DO` rồi nhảy
     * (CEO thấy cột giật lúc mở trang, 26/11). Đo xong một lần là hiện, kể cả cột không đo được (về `RONG_CHO_DO`).
     */
    choDo: !daDo && !!idDo,
    /**
     * Tổng bề rộng các cột đang hiện (chưa gồm ô chọn / cột cuối). Bảng `layout="fixed"` đặt `minWidth` = số này + phần
     * cố định khác → vượt khung thì cuộn ngang. Dùng cùng `ColCotBang` (tieu-de-cot.tsx).
     */
    tongRong: hien.reduce((t, x) => t + doRong[x.id], 0),
    doiCho,
    /** Đặt độ rộng kéo tay (px), kẹp ≥ tối thiểu. `null` = bỏ kéo tay, về mặc định (`rong` khai hoặc vừa nội dung). */
    coDan: (id: string, rong: number | null) =>
      setS((t) => {
        const c = cot.find((x) => x.id === id)
        if (!c) return t
        const keoTay = { ...t.keoTay }
        if (rong === null) delete keoTay[id]
        else keoTay[id] = Math.max(toiThieu(c), Math.round(rong))
        return { ...t, keoTay }
      }),
    /** Về mặc định cả thứ tự, độ rộng, ẩn hiện. */
    datLai: () => setS(macDinh(cot)),
    /** Bật/tắt hiện một cột (`hien` bỏ trống = đảo). Cột `khoa` luôn hiện. */
    anHien,
    /** "Thêm cột" (`ThemCot`): hiện cột đang ẩn và đưa nó về CUỐI bảng (sau cột đang hiện cuối cùng). */
    themCot: (id: string) =>
      setS((t) =>
        cot.some((c) => c.id === id && !c.khoa)
          ? { ...t, thuTu: [...t.thuTu.filter((x) => x !== id), id], an: t.an.filter((x) => x !== id) }
          : t,
      ),
    /** Mục Dời trái / Dời phải / Ẩn cho menu tiêu đề cột `id` (`TieuDeCot menuCot`); cột khoá → `undefined` (không mục). */
    menuCot: (id: string): MenuCot | undefined => {
      const x = hien.find((c) => c.id === id)
      if (!x || x.khoa) return undefined
      const trai = ke(id, 'trai')
      const phai = ke(id, 'phai')
      return {
        trai: trai?.ten ?? null,
        phai: phai?.ten ?? null,
        onDoi: (ben) => {
          const k = ben === 'trai' ? trai : phai
          if (k) doiCho(id, k.id, ben)
        },
        onAn: () => anHien(id, false),
      }
    },
    /** "Định dạng ngày" cho tiêu đề cột `id` (`TieuDeCot ngay`); cột không phải cột ngày → `undefined`. */
    ngayCot: (id: string): NgayCot | undefined =>
      cot.find((c) => c.id === id)?.ngay
        ? { kieu: s.ngay[id] ?? ngayMd(cot.find((c) => c.id === id)), onDoi: (k) => setS((t) => ({ ...t, ngay: { ...t.ngay, [id]: k } })) }
        : undefined,
    /** Định dạng ngày đang chọn của cột `id` (mặc định dd/MM) — ô gọi `hienNgay(v, c.kieuNgay(id))`. */
    kieuNgay: (id: string): KieuNgay => s.ngay[id] ?? ngayMd(cot.find((c) => c.id === id)),
  }
}
export type CotBangState = ReturnType<typeof useCotBang>
