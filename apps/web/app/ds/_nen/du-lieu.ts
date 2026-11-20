// File thường (server): đọc ds/nguon/tokens.json → danh sách hiển thị cho 7 trang nền của /ds. Không gõ tay giá trị
// token nào ở đây — mọi số đi ra từ JSON. Màu: cột Sáng/Tối tô bằng giá trị đã giải của đúng theme đó (var() chỉ cho
// được theme đang xem; ds/sinh-token.test.ts bảo đảm tokens.css = tokens.json). Trang khác: mẫu tô bằng var(--tên).
import tokens from '@/ds/nguon/tokens.json'

type GiaTri = string | { light: string; dark: string }
type Theme = 'light' | 'dark'
type TokenNguon = { name: string; value: GiaTri; usage?: string }

/** Một token đã giải: `sang`/`toi` = giá trị cuối (hex/rgba…), `tro` = token nó trỏ thẳng tới (nếu là tham chiếu). */
export type Token = {
  ten: string
  bien: string
  sang: string
  toi: string
  tro?: { sang?: string; toi?: string }
  dung?: string
  /** Chỉ màu chữ: tỉ lệ tương phản trên `nen` ở mỗi theme. */
  tuongPhan?: { nen: string; sang: number; toi: number }
}
export type NhomMau = { id: string; ten: string; mau: Token[] }

const MAU_NGUON = tokens.color.tokens as TokenNguon[]
const THEO_TEN = new Map(MAU_NGUON.map((t) => [t.name, t]))

const theoTheme = (v: GiaTri, theme: Theme) => (typeof v === 'string' ? v : v[theme])
const thamChieu = (s: string) => s.match(/^\{(.+)\}$/)?.[1]

/** Giải `{tên}` lồng nhau tới giá trị cuối theo theme. Tham chiếu tới token không có → ném lỗi (test bắt). */
export function giai(v: GiaTri, theme: Theme, nguon: Map<string, TokenNguon> = THEO_TEN): string {
  const s = theoTheme(v, theme)
  const ten = thamChieu(s)
  if (!ten) return s
  const t = nguon.get(ten)
  if (!t) throw new Error(`Token tham chiếu không tồn tại: ${ten}`)
  return giai(t.value, theme, nguon)
}

type Rgba = [number, number, number, number]

/** `#rrggbb` hoặc `rgba(r, g, b, a)` — hai dạng duy nhất tokens.json dùng (test bắt dạng lạ). */
export function docMau(s: string): Rgba {
  const hex = s.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (hex) return [...hex.slice(1, 4).map((h) => Number.parseInt(h, 16)), 1] as Rgba
  const rgba = s.match(/^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/)
  if (rgba) return rgba.slice(1, 5).map(Number) as Rgba
  throw new Error(`Màu không đọc được: ${s}`)
}

/** Hiển thị kiểu artifact: `#0D0D0D` + % alpha khi trong suốt. */
export function hienMau(s: string): { hex: string; phanTram?: number } {
  const [r, g, b, a] = docMau(s)
  const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
  return a < 1 ? { hex, phanTram: Math.round(a * 100) } : { hex }
}

const chong = ([r, g, b, a]: Rgba, [R, G, B]: Rgba): Rgba => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1]
const doSang = ([r, g, b]: Rgba) => {
  const k = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b)
}

/** Tỉ lệ tương phản WCAG 2 của chữ `chu` trên `nen`; màu trong suốt chồng lên `nenTrang` (background của theme). */
export function tiLeTuongPhan(chu: string, nen: string, nenTrang: string): number {
  const day = chong(docMau(nen), docMau(nenTrang))
  const [a, b] = [doSang(chong(docMau(chu), day)), doSang(day)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

/**
 * Nền để đo một màu chữ: `x-foreground` → `x` (foreground → background); `color-text-<đuôi>` → `color-background-<đuôi>`
 * nếu có (đuôi `-soft` → `-soft-alpha` trước); còn lại → background. Không phải màu chữ → undefined.
 */
export function nenCua(ten: string, co: (ten: string) => boolean = (t) => THEO_TEN.has(t)): string | undefined {
  if (ten === 'foreground' || ten.endsWith('-foreground')) return ten.replace(/-?foreground$/, '') || 'background'
  if (!ten.startsWith('color-text')) return undefined
  const cap = ten.replace(/^color-text/, 'color-background')
  // Chữ `-soft` đi với nền `-soft-alpha` (cặp Badge, cặp README đo) — ưu tiên khi có.
  const ung = cap.endsWith('-soft') ? [`${cap}-alpha`, cap] : [cap]
  return ung.find((c) => c !== 'color-background' && co(c)) ?? 'background'
}

function token(t: TokenNguon): Token {
  const troSang = thamChieu(theoTheme(t.value, 'light'))
  const troToi = thamChieu(theoTheme(t.value, 'dark'))
  const nen = nenCua(t.name)
  const doTheo = (theme: Theme) => {
    const giaiTen = (ten: string) => giai(THEO_TEN.get(ten)!.value, theme)
    return tiLeTuongPhan(giai(t.value, theme), giaiTen(nen!), giaiTen('background'))
  }
  return {
    ten: t.name,
    bien: `--${t.name}`,
    sang: giai(t.value, 'light'),
    toi: giai(t.value, 'dark'),
    tro: troSang || troToi ? { sang: troSang, toi: troToi } : undefined,
    dung: t.usage,
    tuongPhan: nen ? { nen, sang: doTheo('light'), toi: doTheo('dark') } : undefined,
  }
}

/** Ô caro sau màu trong suốt — hai bậc xám của đúng theme của cột, giải từ tokens.json. */
export const CARO = {
  sang: [giai('{gray-0}', 'light'), giai('{gray-150}', 'light')],
  toi: [giai('{gray-0}', 'dark'), giai('{gray-150}', 'dark')],
}

const THANG = /^(gray|alpha|green|red|pink|orange|yellow|purple|blue)-/
const VAI = ['primary', 'secondary', 'info', 'warning', 'caution', 'danger', 'success', 'discovery'] as const
const VAI_RE = new RegExp(`^color-(?:background|text|border|ring)-(${VAI.join('|')})(?:-|$)`)
// Chữ phụ chung (= muted-foreground): nguồn đặt ở khối chung đầu danh sách, không thuộc vai "secondary" của nút/badge.
const CHUNG_DU_KHOP_VAI = new Set(['color-text-secondary'])

/** Nhóm hiển thị của một tên màu. Thứ tự nhóm trên trang theo NHOM_MAU bên dưới. */
export function nhomCua(ten: string): string {
  if (ten === 'white' || ten === 'black') return 'co-dinh'
  const thang = ten.match(THANG)?.[1]
  if (thang) return `thang-${thang}`
  if (!ten.startsWith('color-')) return 'semantic'
  const vai = CHUNG_DU_KHOP_VAI.has(ten) ? undefined : ten.match(VAI_RE)?.[1]
  return vai ? `vai-${vai}` : 'vai-chung'
}

const TEN_NHOM: Record<string, string> = {
  semantic: 'Semantic shadcn',
  'co-dinh': 'Cố định (white, black)',
  'vai-chung': 'OpenAI — chung (chữ, nền, viền, bề mặt, tắt)',
  ...Object.fromEntries(VAI.map((v) => [`vai-${v}`, `OpenAI — vai ${v}`])),
}
const THU_TU_NHOM = ['semantic', 'thang', 'co-dinh', 'vai-chung', 'vai']

/** Mọi màu trong tokens.json chia nhóm: semantic shadcn → thang OpenAI → cố định → color-* theo vai. Giữ thứ tự JSON. */
export function chiaNhomMau(ds: TokenNguon[] = MAU_NGUON): NhomMau[] {
  const nhom = new Map<string, NhomMau>()
  for (const t of ds) {
    const id = nhomCua(t.name)
    if (!nhom.has(id)) nhom.set(id, { id, ten: TEN_NHOM[id] ?? `Thang ${id.slice(6)}`, mau: [] })
    nhom.get(id)!.mau.push(token(t))
  }
  const hang = (id: string) => THU_TU_NHOM.findIndex((p) => id === p || id.startsWith(`${p}-`))
  return [...nhom.values()].sort((a, b) => hang(a.id) - hang(b.id))
}

export const NHOM_MAU = chiaNhomMau()
export const SO_MAU = MAU_NGUON.length

type DonGian = { name: string; value: GiaTri; usage?: string }
const donGian = (ds: DonGian[]): Token[] =>
  ds.map((t) => ({ ten: t.name, bien: `--${t.name}`, sang: theoTheme(t.value, 'light'), toi: theoTheme(t.value, 'dark'), dung: t.usage }))

export const KHOANG_CACH = donGian(tokens.spacing.tokens)
export const BO_GOC = donGian(tokens.radius.tokens)
export const BONG = donGian(tokens.shadow.tokens)
export const CO_CONTROL = donGian(tokens.controlSize.tokens)
export const MOC_MAN_HINH = donGian(tokens.breakpoint.tokens)
export const GHI_CHU = {
  khoangCach: tokens.spacing.note,
  coControl: tokens.controlSize.note,
  bong: tokens.shadow.note,
  mocManHinh: tokens.breakpoint.note,
}

/** Thang `spacing(n) = n × --spacing` hay dùng (bội số Tailwind); px tính từ token gốc, không gõ tay. */
export const DON_VI = Number.parseFloat(KHOANG_CACH.find((t) => t.ten === 'spacing')!.sang)
export const BOI_SPACING = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((n) => ({ n, px: n * DON_VI }))

export type KieuChu = {
  ten: string
  bien: string
  lop: string
  co: string
  dong: string
  dam: number
  gianChu: string | null
  mau: string
  dung: string
}
export const HO_CHU = Object.entries(tokens.type.families).map(([ten, giaTri]) => ({ ten, bien: `--font-${ten}`, giaTri }))
export const NHOM_CHU = tokens.type.groups.map((g) => ({
  ten: g.name,
  ho: g.family,
  kieu: g.styles.map(
    (s): KieuChu => ({
      ten: s.name,
      bien: `--text-${s.name}`,
      lop: `ds-${s.name}`,
      co: s.fontSize,
      dong: s.lineHeight,
      dam: s.fontWeight,
      gianChu: 'letterSpacing' in s ? s.letterSpacing : null,
      mau: s.sample,
      dung: s.usage,
    }),
  ),
}))

/** Bề rộng tương đối của mốc so với mốc lớn nhất (0–100) để vẽ thanh tỉ lệ. */
export function tiLe(ds: Token[]): { token: Token; phanTram: number }[] {
  const px = ds.map((t) => Number.parseFloat(t.sang))
  const max = Math.max(...px)
  return ds.map((token, i) => ({ token, phanTram: Math.round((px[i] / max) * 1000) / 10 }))
}
