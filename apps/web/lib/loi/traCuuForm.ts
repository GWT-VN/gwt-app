/** Hàm thuần cho form "Tạo ticket": dòng máy, nhãn tra cứu, điều kiện bấm lưu. */
import { chuanHoaSerial, kiemDangSerial } from './serial'
import type { DongMayInput, KetQuaTraSerial, KhachVaMay } from './kieu'
import type { MucChon } from '@/bang'

export const SO_DONG_TOI_DA = 20

export const ngayVN = (iso: string | null | undefined): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '—'
}

export const dongThem = (d: DongMayInput[]): DongMayInput[] => (d.length >= SO_DONG_TOI_DA ? d : [...d, {}])
export const dongBo = (d: DongMayInput[], i: number): DongMayInput[] => (d.length <= 1 ? d : d.filter((_, j) => j !== i))

/** Mỗi máy một mục (gt = "idKhach|serial"); khách chưa có máy một mục (gt = "idKhach|"). */
export function mucTuKetQuaKhach(ds: KhachVaMay[]): MucChon[] {
  return ds.flatMap((k) =>
    k.may.length
      ? k.may.map((m) => ({
          gt: `${k.id}|${m.serial}`,
          nhan: `${k.full_name} — ${m.product_name ?? m.internal_code} · ${m.serial}`,
          phu: `${k.primary_phone ?? ''}${m.warranty_activated ? '' : ' · chưa kích hoạt'}`,
        }))
      : [{ gt: `${k.id}|`, nhan: `${k.full_name} — chưa có máy`, phu: k.primary_phone ?? '' }],
  )
}

/**
 * Cho phép lưu khi có ≥1 dòng có serial và không dòng nào có serial sai dạng
 * (serial lạ sai khuôn chỉ chấp nhận khi tra cứu cho thấy nó đã có trong hệ thống).
 * `loaiTheoSerial` khoá theo serial đã chuẩn hoá.
 */
export function dongDuDieuKien(dong: DongMayInput[], loaiTheoSerial: Record<string, KetQuaTraSerial['loai']>): boolean {
  const coSerial = dong.filter((d) => chuanHoaSerial(d.serial ?? ''))
  if (!coSerial.length) return false
  return coSerial.every((d) => {
    const k = kiemDangSerial(d.serial ?? '')
    const loai = loaiTheoSerial[k.chuan]
    if (loai === 'sai_dang') return false
    return k.hopLe || loai === 'da_lap' || loai === 'chua_kich_hoat'
  })
}
