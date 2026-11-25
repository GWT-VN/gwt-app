'use client'

/**
 * Mảnh dùng chung của các màn Việc v2 (canvas Claude Design bản 23, CEO duyệt 23/11) — chỉ ghép component DS:
 * nhãn ưu tiên (Gấp · Cao · Thường · Thấp, `title` giữ P1–P4), chip trạng thái, chữ hạn, người chính, lưu qua server action.
 */
import { Avatar, AvatarFallback, chuCaiDau } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { MucNhan, MucTrangThai } from '@/components/ui/inline-edit'
import { thongBao } from '@/components/ui/sonner'
import { boNguoi, doiTrangThai, ganNguoi, taoViec, type KQ, type NguoiLam } from '@/app/work/actions'
import { cn } from '@/lib/utils'
import { inputTuIso, ngayThang, soNgayToiHan } from '@/lib/work'

export type Uu = '1' | '2' | '3' | '4'
/** Ưu tiên DB 1–4 → nhãn chữ của DS (canvas): Gấp solid danger · Cao soft warning · Thường soft · Thấp outline. */
export const UU: MucNhan<Uu>[] = [
  { gt: '1', chu: 'Gấp', nhan: <Badge variant="solid" color="danger" title="P1">Gấp</Badge> },
  { gt: '2', chu: 'Cao', nhan: <Badge variant="soft" color="warning" title="P2">Cao</Badge> },
  { gt: '3', chu: 'Thường', nhan: <Badge variant="soft" title="P3">Thường</Badge> },
  { gt: '4', chu: 'Thấp', nhan: <Badge variant="outline" title="P4">Thấp</Badge> },
]

/** Trạng thái DB (work.task.status) → chip soft theo nghĩa của canvas. */
export const TT: MucTrangThai[] = [
  { gt: 'todo', nhan: 'Cần làm' },
  { gt: 'doing', nhan: 'Đang làm', color: 'info' },
  { gt: 'blocked', nhan: 'Bị chặn', color: 'warning' },
  { gt: 'review', nhan: 'Chờ duyệt', color: 'discovery' },
  { gt: 'done', nhan: 'Xong', color: 'success' },
]

/** Vai DB → chữ của canvas (Chính · Làm cùng · Duyệt · Theo dõi). Không vai = việc mình tạo giao người khác. */
export const VAI: Record<string, string> = { owner: 'Chính', doer: 'Làm cùng', reviewer: 'Duyệt', watcher: 'Theo dõi' }

/** Gợi ý ô gõ của dòng "+ Việc mới" (Danh sách / Bảng); cột Kanban hẹp dùng bản ngắn. */
export const GOI_Y_THEM = 'Tên việc — Enter để tạo, Esc để thôi'
export const GOI_Y_THEM_NGAN = 'Tên việc — Enter để tạo'

/**
 * Tạo việc từ dòng "+ Việc mới" (DongThem, CEO 25/11 bỏ hộp Tạo việc): chỉ tên → RPC gán người tạo làm Chính, ưu tiên
 * Thường, chưa hạn; thuộc tính khác sửa tại ô sau. `status` (cột Kanban) khác `todo` → đổi trạng thái ngay sau khi tạo —
 * hai bước (RPC tạo chưa nhận trạng thái); bước hai hỏng thì việc vẫn có, toast nói rõ để kéo lại tay.
 */

export async function taoNhanhViec(ten: string, status?: string): Promise<boolean> {
  const kq = await taoViec({ title: ten })
  if (!kq.ok) {
    thongBao.loi(`Chưa tạo được việc — ${kq.loi}`)
    return false
  }
  const { id, ref } = kq.duLieu
  if (status && status !== 'todo') {
    const d = await doiTrangThai(id, status)
    if (!d.ok) {
      thongBao.loi(`Đã tạo ${ref} nhưng chưa chuyển được trạng thái — ${d.loi}`)
      return true
    }
  }
  thongBao.xong(`Đã tạo ${ref}`)
  return true
}

/** Server action trả `KQ` (không ném — xem actions.ts); ô sửa tại chỗ cần lỗi ném ra để trả giá trị cũ + toast Thử lại. */
export async function chac<T>(p: Promise<KQ<T>>): Promise<T> {
  const kq = await p
  if (!kq.ok) throw new Error(kq.loi)
  return kq.duLieu
}

/**
 * Đổi người chính: RPC upsert theo người, không tự hạ người chính cũ → gán người mới vai owner rồi lùi người cũ về Làm
 * cùng. Bước 2 hỏng → trả người mới về vai cũ (hoặc bỏ ra) rồi NÉM lỗi — không để việc có 2 người chính.
 */
export async function doiNguoiChinh(taskId: number, nguoi: NguoiLam[], id: string): Promise<void> {
  const cu = nguoi.find((a) => a.role === 'owner')
  const vaiCu = nguoi.find((a) => a.staff_id === id)?.role
  await chac(ganNguoi(taskId, id, 'owner'))
  if (!cu || cu.staff_id === id) return
  const kq = await ganNguoi(taskId, cu.staff_id, 'doer')
  if (kq.ok) return
  await (vaiCu ? ganNguoi(taskId, id, vaiCu) : boNguoi(taskId, id))
  throw new Error(kq.loi)
}

/** Giá trị ô hạn (OSuaHan): "YYYY-MM-DDTHH:mm" giờ máy; không hạn = "". */
export const hanO = (due: string | null) => inputTuIso(due)
/** Ô hạn → ISO lưu DB. Chọn ngày cho việc chưa có hạn (chỉ "YYYY-MM-DD") → 17:00 ngày đó (giờ hành chính cuối ngày). */
export function hanLuu(v: string): string {
  return new Date(v.length <= 10 ? `${v}T17:00` : v.replace(' ', 'T')).toISOString()
}

const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const gioCua = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

/**
 * Chữ hạn như `.b-han` của canvas: hôm nay → giờ (đậm, foreground) · hôm qua → "Hôm qua HH:mm" · trễ hơn → "dd/MM" (trễ:
 * danger 500) · mai → "Mai HH:mm" · trong tuần → "T6 27/11" · xa hơn "dd/MM"; không hạn "—". Số thẳng cột 12/18 muted.
 */
export function HanChu({ due }: { due: string | null }) {
  if (!due) return <span className="text-[12px] leading-[18px] text-muted-foreground">—</span>
  const d = new Date(due)
  const n = soNgayToiHan(d)
  const chu =
    n === 0 ? gioCua(d) : n === -1 ? `Hôm qua ${gioCua(d)}` : n === 1 ? `Mai ${gioCua(d)}` : n > 1 && n < 7 ? `${THU[d.getDay()]} ${ngayThang(d)}` : ngayThang(d)
  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap text-[12px] leading-[18px] tabular-nums text-muted-foreground',
        n === 0 && 'font-medium text-foreground',
        n < 0 && 'font-medium text-(--color-text-danger)',
      )}
    >
      {chu}
    </span>
  )
}

/** Người chính (vai owner; không có thì người đầu tiên): avatar 22 có `title` = tên. */
export function NguoiChinh({ nguoi }: { nguoi: NguoiLam[] }) {
  const n = nguoi.find((x) => x.role === 'owner') ?? nguoi[0]
  if (!n) return null
  return (
    <Avatar role="img" aria-label={`Người chính: ${n.ten}`} title={`Người chính: ${n.ten}`}>
      <AvatarFallback>{chuCaiDau(n.ten)}</AvatarFallback>
    </Avatar>
  )
}
