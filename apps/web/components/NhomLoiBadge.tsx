import type { MucDo } from '@/app/actions'
import { Badge } from '@/components/ui/badge'

type Mau = 'secondary' | 'warning' | 'danger'

/** Mức độ quyết định màu — an toàn phải đập vào mắt (nền đặc), "không lỗi" phải chìm xuống. Badge DS. */
const STYLE: Record<MucDo, { mau: Mau; dac?: boolean; label: string }> = {
  an_toan: { mau: 'danger', dac: true, label: 'AN TOÀN' },
  nghiem_trong: { mau: 'danger', label: 'Nghiêm trọng' },
  thuong: { mau: 'warning', label: 'Thường' },
  nhe: { mau: 'secondary', label: 'Nhẹ' },
  khong_loi: { mau: 'secondary', label: 'Không phải lỗi' },
}

export function MucDoBadge({ muc_do }: { muc_do: MucDo }) {
  const s = STYLE[muc_do] ?? STYLE.thuong
  return <Badge variant={s.dac ? 'solid' : 'soft'} color={s.mau}>{s.label}</Badge>
}

export function BaoHangBadge() {
  return <Badge variant="soft" color="discovery">Báo hãng</Badge>
}

/** nguồn gán: rule = máy tự gom, người = có người sửa tay */
export function NguonBadge({ nguon }: { nguon: string }) {
  if (nguon === 'người') return <Badge variant="soft" color="success">người gán</Badge>
  return <Badge variant="soft" color="secondary">tự gom</Badge>
}
