import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Cột của dạng xem Bảng (Table) / Danh sách (ListView) — README Table "Nhãn cột: lọc + sắp xếp".
 * `kieu` theo BẢN CHẤT dữ liệu của cột (CEO 18/11 + 19/11):
 * - `sap`: cột có thứ tự/số lượng (Ưu tiên, Hạn, Số ngày mở, Thứ tự tạo) → menu Sắp xếp, nhãn nói NGHĨA (`nghia`);
 * - `loc`: cột nhãn/phân loại (Loại lỗi, Trạng thái, Chủ, Khách, Nguồn) → CHỈ lọc theo tag. Khai `nghia` cho cột này là
 *   lỗi kiểu (`nghia?: never`) và `TieuDeCot` ném lỗi lúc chạy — sắp nhãn theo chữ cái là vô nghĩa;
 * - `thuong`: không menu (Việc tiếp theo, Máy · serial).
 * `rong` = độ rộng mặc định (px, nhấp đúp tay co dãn về số này) · `toiThieu` mặc định 56 · `khoa` = không kéo đổi chỗ,
 * không ẩn · `anMacDinh` = ẩn sẵn (bật lại trong ⚙ → Cột hiển thị hoặc nút "+" `ThemCot`) · `phai` = căn phải (số, hạn) ·
 * `icon` = icon đứng trước tên ở danh sách chọn cột (`ThemCot`), không bắt buộc.
 */
export type NghiaSap = {
  /** Câu nói nghĩa chiều tăng dần của giá trị, vd "Gần hạn nhất trước" — không ghi "Tăng dần". */
  tang: string
  giam: string
}
type CotChung = {
  id: string
  ten: string
  rong: number
  toiThieu?: number
  khoa?: boolean
  anMacDinh?: boolean
  phai?: boolean
  icon?: ReactNode
}
export type CotBang =
  | (CotChung & { kieu: 'sap'; nghia: NghiaSap })
  | (CotChung & { kieu: 'loc'; nghia?: never })
  | (CotChung & { kieu: 'thuong'; nghia?: never })

export const RONG_TOI_THIEU = 56
/** Bề rộng cột "+" (`ThemCot`) ở cuối hàng tiêu đề: nút icon-sm 28 + đệm ngang 6 × 2 của `.b-bang-c`. */
export const RONG_THEM_COT = 40
export type BenTha = 'trai' | 'phai'

/**
 * Mục dời / ẩn trong menu tiêu đề cột (`TieuDeCot` prop `menuCot`, lấy từ `useCotBang().menuCot(id)`). `trai`/`phai` =
 * tên cột đang hiện kề bên mà cột này dời qua được; `null` = ở mép hoặc kề cột khoá → mục hiện nhưng tắt.
 */
export type MenuCot = { trai: string | null; phai: string | null; onDoi: (ben: BenTha) => void; onAn: () => void }

export const toiThieu = (c: CotBang) => c.toiThieu ?? RONG_TOI_THIEU
/** Cột GHIM trái khi bảng cuộn ngang: cột `khoa` đứng ĐẦU hàng (vị trí 0 trong `hien`) — như cột nhãn của Twenty. */
export const laGhim = (c: CotBang, viTri: number) => !!c.khoa && viTri === 0

/** Bỏ `id` khỏi chỗ cũ, chèn trước (`trai`) / sau (`phai`) cột `dich`. Cột lạ hoặc trùng → giữ nguyên. */
export function doiChoMang(thuTu: string[], id: string, dich: string, ben: BenTha): string[] {
  if (id === dich || !thuTu.includes(id) || !thuTu.includes(dich)) return thuTu
  const m = thuTu.filter((x) => x !== id)
  m.splice(m.indexOf(dich) + (ben === 'phai' ? 1 : 0), 0, id)
  return m
}

type TrangThaiCot = { thuTu: string[]; doRong: Record<string, number>; an: string[] }

const macDinh = (cot: CotBang[]): TrangThaiCot => ({
  thuTu: cot.map((c) => c.id),
  doRong: Object.fromEntries(cot.map((c) => [c.id, c.rong])),
  an: cot.filter((c) => c.anMacDinh && !c.khoa).map((c) => c.id),
})

// Tham số URL (tách khỏi `cot`/`chieu` sắp xếp của bang/): chỉ ghi phần KHÁC mặc định → URL gọn, chép link mở lại y hệt.
const P_THU_TU = 'cot_thu_tu'
const P_RONG = 'cot_rong'
const P_AN = 'cot_an'

/** Đọc trạng thái cột từ URL. Id lạ bị bỏ, cột thiếu trong thứ tự nối cuối theo mặc định, độ rộng kẹp ≥ tối thiểu. */
export function docUrlCot(sp: URLSearchParams, cot: CotBang[]): TrangThaiCot {
  const md = macDinh(cot)
  const theoId = new Map(cot.map((c) => [c.id, c]))
  const ds = (k: string) => (sp.get(k) ?? '').split(',').filter((x) => theoId.has(x))
  const thuTuUrl = [...new Set(ds(P_THU_TU))]
  const thuTu = [...thuTuUrl, ...md.thuTu.filter((x) => !thuTuUrl.includes(x))]
  const doRong = { ...md.doRong }
  for (const cap of (sp.get(P_RONG) ?? '').split(',')) {
    const [id, so] = cap.split(':')
    const c = theoId.get(id)
    const px = Number(so)
    if (c && Number.isFinite(px)) doRong[id] = Math.max(toiThieu(c), Math.round(px))
  }
  const an = sp.has(P_AN) ? ds(P_AN).filter((x) => !theoId.get(x)?.khoa) : md.an
  return { thuTu, doRong, an }
}

/** Ghi trạng thái cột vào bản sao `sp` (giữ mọi tham số khác). Bằng mặc định → xoá tham số. */
export function ghiUrlCot(sp: URLSearchParams, s: TrangThaiCot, cot: CotBang[]): URLSearchParams {
  const md = macDinh(cot)
  const ra = new URLSearchParams(sp)
  const dat = (k: string, gt: string | null) => (gt === null ? ra.delete(k) : ra.set(k, gt))
  dat(P_THU_TU, s.thuTu.join(',') === md.thuTu.join(',') ? null : s.thuTu.join(','))
  const rong = cot.filter((c) => s.doRong[c.id] !== c.rong).map((c) => `${c.id}:${s.doRong[c.id]}`)
  dat(P_RONG, rong.length ? rong.join(',') : null)
  const an = [...s.an].sort().join(',')
  dat(P_AN, an === [...md.an].sort().join(',') ? null : an)
  return ra
}

/**
 * useCotBang — thứ tự / độ rộng / ẩn hiện cột (ruling R8: KHÔNG TanStack — sắp/lọc/phân trang chạy phía server qua URL
 * trong bang/, phần còn lại của trạng thái cột chỉ là ba thứ này).
 * `url: true` → đọc lúc mở trang + ghi lại (`history.replaceState`, Next đồng bộ useSearchParams; gom 200ms cho lúc kéo
 * co dãn) vào `cot_thu_tu`, `cot_rong`, `cot_an`. Hook gọi useSearchParams → nơi dùng nằm trong `<Suspense>` như bang/.
 * ponytail: chỉ đọc URL lúc mở; bấm Back đổi URL không nạp lại trạng thái cột — thêm khi màn thật cần.
 */
export function useCotBang(cot: CotBang[], { url = false }: { url?: boolean } = {}) {
  const sp = useSearchParams()
  const [s, setS] = useState<TrangThaiCot>(() => (url ? docUrlCot(new URLSearchParams(sp.toString()), cot) : macDinh(cot)))

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
  const doiCho = (id: string, dich: string, ben: BenTha) => setS((t) => ({ ...t, thuTu: doiChoMang(t.thuTu, id, dich, ben) }))
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
    doRong: s.doRong,
    an: s.an,
    /** Cột đang hiện, đúng thứ tự. */
    hien,
    doiCho,
    /** Đặt độ rộng (px), kẹp ≥ tối thiểu của cột. */
    coDan: (id: string, rong: number) =>
      setS((t) => {
        const c = cot.find((x) => x.id === id)
        return c ? { ...t, doRong: { ...t.doRong, [id]: Math.max(toiThieu(c), Math.round(rong)) } } : t
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
  }
}
export type CotBangState = ReturnType<typeof useCotBang>
