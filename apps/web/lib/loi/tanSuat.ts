/** Tần suất lỗi: nhóm × model × tháng, tỷ lệ theo máy bán/nhập lũy kế, ngày chạy trước khi lỗi, máy báo lặp. Thuần hàm. */
export type DongCa = { ticket_code: string; loi_code: string; loi_ten: string; nhom: string | null; nhom_ten: string | null
  internal_code: string; may: string | null; ngay_bao: string; thang: string; install_date: string | null }
export type MauSo = { internal_code: string; thang: string; so: number }
export type DongTanSuat = { nhom_ten: string; loi_code: string; loi_ten: string; internal_code: string
  theo_thang: Record<string, number>; so_ca: number; ban_luy_ke: number | null; nhap_luy_ke: number | null
  ty_le_ban: number | null; ty_le_nhap: number | null; trung_vi_ngay_chay: number | null; so_may_lap_lai: number }

export function trungVi(xs: number[]): number | null {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  const g = Math.floor(s.length / 2)
  return s.length % 2 ? s[g] : (s[g - 1] + s[g]) / 2
}

const NGAY = 86_400_000
const soNgay = (tu: string, den: string) => Math.round((Date.parse(den) - Date.parse(tu)) / NGAY)
const tyLe = (a: number, b: number | null) => (b ? Math.round((a / b) * 10000) / 100 : null)

function luyKe(ds: MauSo[], ma: string, den?: string): number | null {
  const t = ds.filter((m) => m.internal_code === ma && (!den || m.thang <= den)).reduce((s, m) => s + (Number(m.so) || 0), 0)
  return t > 0 ? t : null
}

export function tinhTanSuat(ca: DongCa[], ban: MauSo[], nhap: MauSo[], loc: { tu?: string; den?: string }): DongTanSuat[] {
  const nhomLai = new Map<string, DongCa[]>()
  for (const c of ca) {
    if (loc.tu && c.thang < loc.tu) continue
    if (loc.den && c.thang > loc.den) continue
    const k = `${c.loi_code}\u0000${c.internal_code}`
    const ds = nhomLai.get(k) ?? []
    ds.push(c); nhomLai.set(k, ds)
  }
  const ra: DongTanSuat[] = []
  for (const ds of nhomLai.values()) {
    const d0 = ds[0]
    const theo_thang: Record<string, number> = {}
    for (const c of ds) theo_thang[c.thang] = (theo_thang[c.thang] ?? 0) + 1
    const ngayChay = ds.filter((c) => c.install_date).map((c) => soNgay(c.install_date!, c.ngay_bao)).filter((n) => Number.isFinite(n) && n >= 0)
    const theoMay = new Map<string, Set<string>>()
    for (const c of ds) if (c.may) theoMay.set(c.may, (theoMay.get(c.may) ?? new Set()).add(c.ticket_code))
    const ban_luy_ke = luyKe(ban, d0.internal_code, loc.den)
    const nhap_luy_ke = luyKe(nhap, d0.internal_code, loc.den)
    ra.push({
      nhom_ten: d0.nhom_ten ?? '(chưa gắn nhóm)', loi_code: d0.loi_code, loi_ten: d0.loi_ten, internal_code: d0.internal_code,
      theo_thang, so_ca: ds.length, ban_luy_ke, nhap_luy_ke,
      ty_le_ban: tyLe(ds.length, ban_luy_ke), ty_le_nhap: tyLe(ds.length, nhap_luy_ke),
      trung_vi_ngay_chay: trungVi(ngayChay),
      so_may_lap_lai: [...theoMay.values()].filter((s) => s.size >= 2).length,
    })
  }
  return ra.sort((a, b) => b.so_ca - a.so_ca || a.loi_ten.localeCompare(b.loi_ten, 'vi') || a.internal_code.localeCompare(b.internal_code))
}
