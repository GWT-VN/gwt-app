'use client'

/**
 * Phần chung của các dạng xem việc v2 (Bảng team, Việc của tôi): cột + ô sửa tại chỗ, Table DS có ô chọn dòng, Kanban
 * theo trạng thái (kéo thả gọi `keoTha`). Mỗi màn tự giữ dữ liệu, lọc / tab / sắp ở URL và danh sách (ListView) riêng.
 */
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { OChonDong, OChonTatCa, useDaChon } from '@/bang'
import type { MucChon } from '@/bang/OChonGoiY'
import { doiTrangThai, ganNguoi, keoTha, suaViec, type NenTang, type ViecTeamRow } from '@/app/work/actions'
import { OSuaChu, OSuaHan, OSuaNguoi, OSuaNhan, OSuaTrangThai } from '@/components/ui/inline-edit'
import { KanbanBoard, NoiDungThe, type TheKanban } from '@/components/ui/kanban-board'
import { NutMoMa } from '@/components/ui/list-view'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { TieuDeCot, type MucLoc } from '@/components/ui/tieu-de-cot'
import type { CotBang, useCotBang } from '@/components/ui/use-cot-bang'
import { nhanHan, soNgayToiHan } from '@/lib/work'
import { chac, HanChu, hanLuu, hanO, TT, UU, type Uu } from './chung'

/** Trường mà các dạng xem đọc — `ViecRow` (Việc của tôi) và `ViecTeamRow` (Bảng team) đều có. */
export type ViecXem = Pick<
  ViecTeamRow,
  'id' | 'ref' | 'title' | 'status' | 'priority' | 'due_at' | 'team_id' | 'team_name' | 'sub_n' | 'assignees' | 'links'
> & { sort_order?: number }

export const COT_VIEC: CotBang[] = [
  { id: 'uu', ten: 'Ưu tiên', rong: 76, kieu: 'sap', nghia: { tang: 'Gấp trước', giam: 'Thấp trước' } },
  { id: 'ma', ten: 'Mã', rong: 104, kieu: 'sap', nghia: { tang: 'Cũ nhất trước', giam: 'Mới tạo trước' } },
  { id: 'viec', ten: 'Việc', rong: 280, kieu: 'thuong', khoa: true },
  { id: 'tt', ten: 'Trạng thái', rong: 124, kieu: 'loc' },
  { id: 'nguoi', ten: 'Người', rong: 160, kieu: 'thuong' },
  {
    id: 'han',
    ten: 'Hạn',
    rong: 116,
    kieu: 'sap',
    phai: true,
    nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' },
  },
]
export const TEN_COT = { uu: 'Ưu tiên', ma: 'Mã', han: 'Hạn' }
export const NGHIA = {
  uu: { asc: 'gấp trước', desc: 'thấp trước' },
  ma: { asc: 'cũ nhất trước', desc: 'mới tạo trước' },
  han: { asc: 'gần hạn nhất trước', desc: 'xa hạn nhất trước' },
}

export type Sap = { cot: string; tang: boolean }
/** URL `cot`/`chieu` → sắp; cột lạ = không sắp theo URL (`cotUrl` null). */
export function docSap(sp: URLSearchParams, macDinh: Sap) {
  const cotUrl = ['uu', 'ma', 'han'].includes(sp.get('cot') ?? '') ? sp.get('cot')! : null
  const sap: Sap = cotUrl ? { cot: cotUrl, tang: sp.get('chieu') !== 'desc' } : macDinh
  return { cotUrl, sap }
}
/** So sánh theo cột; việc không hạn luôn cuối; khoá phụ id (CHUAN-FILTER luật 2). */
export function soSanh(s: Sap) {
  const huong = s.tang ? 1 : -1
  return (a: ViecXem, b: ViecXem) => {
    if (s.cot === 'han' && !a.due_at !== !b.due_at) return a.due_at ? -1 : 1
    const c =
      s.cot === 'uu'
        ? a.priority - b.priority
        : s.cot === 'han' && a.due_at && b.due_at
          ? Date.parse(a.due_at) - Date.parse(b.due_at)
          : s.cot === 'ma'
            ? a.id - b.id
            : 0
    return c * huong || a.id - b.id
  }
}

export const chinhCua = (v: ViecXem) => v.assignees.find((a) => a.role === 'owner') ?? v.assignees[0]

/** Nhân sự cho ô chọn: ComboboxPanel hiện `gt` như mã → dùng email (đọc được, phân biệt trùng tên), map về staff id. */
export function chonNhanSu(nhanSu: NenTang['nhan_su']) {
  const gtCua = (s: { id: string; email: string }) => s.email || s.id
  return {
    gtCua,
    options: nhanSu.map((s): MucChon => ({ gt: gtCua(s), nhan: s.ten })),
    idCua: (gt: string) => nhanSu.find((s) => gtCua(s) === gt)?.id,
    tenCua: (id: string) => nhanSu.find((s) => s.id === id)?.ten ?? id,
  }
}

/**
 * Ô sửa tại chỗ theo cột (ưu tiên, mã, tiêu đề, trạng thái, người chính, hạn) — dùng chung Table, ListView, mọi màn.
 * `rongNguoi` < 112 → ô người gọn (chỉ avatar).
 */
export function useOViec(nenTang: NenTang, moViec: (id: number) => void, rongNguoi = 160) {
  const router = useRouter()
  const ns = chonNhanSu(nenTang.nhan_su)
  const lamMoi = () => router.refresh()
  const luu = async (p: Parameters<typeof chac>[0]) => {
    await chac(p)
    lamMoi()
  }
  /** Đổi người chính: gán người mới vai owner, hạ người chính cũ về Làm cùng (hai lệnh — xem đề xuất RPC). */
  async function doiChinh(v: ViecXem, gt: string | null) {
    const id = gt && ns.idCua(gt)
    if (!id) return
    const cu = v.assignees.find((a) => a.role === 'owner')
    await chac(ganNguoi(v.id, id, 'owner'))
    if (cu && cu.staff_id !== id) await chac(ganNguoi(v.id, cu.staff_id, 'doer'))
    lamMoi()
  }
  const o = (v: ViecXem, id: string): ReactNode => {
    switch (id) {
      case 'uu':
        return (
          <OSuaNhan
            ma={v.ref}
            truong="ưu tiên"
            value={String(v.priority) as Uu}
            muc={UU}
            onLuu={(u) => luu(suaViec(v.id, { priority: Number(u) }))}
          />
        )
      case 'ma':
        return (
          // NutMoMa chỉ nổi cú bấm lên — ở Table không có onMo của ListView nên bắt tại đây.
          <span className="inline-flex" onClick={() => moViec(v.id)}>
            <NutMoMa ma={v.ref} luonHien />
          </span>
        )
      case 'viec':
        return <OSuaChu ma={v.ref} truong="tiêu đề" value={v.title} onLuu={(title) => luu(suaViec(v.id, { title }))} />
      case 'tt':
        return (
          <OSuaTrangThai ma={v.ref} value={{ tt: v.status }} muc={TT} onLuu={(g) => luu(doiTrangThai(v.id, g.tt))} />
        )
      case 'nguoi': {
        const n = chinhCua(v)
        const s = n && (nenTang.nhan_su.find((x) => x.id === n.staff_id) ?? { id: n.staff_id, email: n.email })
        const gt = s ? ns.gtCua(s) : null
        return (
          <OSuaNguoi
            ma={v.ref}
            truong="người chính"
            value={gt}
            options={ns.options}
            mucDangChon={n && gt ? { gt, nhan: n.ten } : undefined}
            gon={rongNguoi < 112}
            onLuu={(moi) => doiChinh(v, moi)}
          />
        )
      }
      case 'han':
        return (
          <OSuaHan
            ma={v.ref}
            value={hanO(v.due_at)}
            onLuu={(h) => luu(suaViec(v.id, { due: hanLuu(h) }))}
            hien={() => <HanChu due={v.due_at} />}
          />
        )
    }
  }
  return { ...ns, lamMoi, luu, o }
}

/** Dòng bảng: ô chọn của bang/ + nền chọn. */
function DongBang({ v, children }: { v: ViecXem; children: ReactNode }) {
  const { daChon } = useDaChon()
  return (
    <TableRow chon={daChon.includes(String(v.id))}>
      <OChonDong khoa={String(v.id)} moTa={`việc ${v.ref}`} />
      {children}
    </TableRow>
  )
}

/** Table DS: ô chọn dòng (bang/ — phải nằm trong `KhungChon`), tiêu đề cột sắp / lọc / co dãn, ô qua `o`. */
export function BangViec({
  dong,
  c,
  sap,
  onSap,
  loc,
  o,
}: {
  dong: ViecXem[]
  c: ReturnType<typeof useCotBang>
  sap: Sap
  onSap: (s: Sap | null) => void
  /** Lọc cột kiểu `loc` (Trạng thái). */
  loc?: { tuyChon: MucLoc[]; daChon: string[]; onDoi: (gt: string[]) => void }
  o: (v: ViecXem, id: string) => ReactNode
}) {
  const tongRong = 36 + c.hien.reduce((t, x) => t + c.doRong[x.id], 0)
  return (
    <TableWrap>
      <Table layout="fixed" style={{ minWidth: tongRong }}>
        <colgroup>
          <col style={{ width: 36 }} />
          {c.hien.map((x) => (
            // Cột Việc ăn phần dư (canvas `<col>` không rộng).
            <col key={x.id} style={x.id === 'viec' ? undefined : { width: c.doRong[x.id] }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <OChonTatCa nhan="việc" />
            {c.hien.map((x, i) => (
              <TieuDeCot
                key={x.id}
                cot={x}
                viTri={i}
                menuPhai={i === c.hien.length - 1}
                coDan={x.id === 'viec' ? undefined : { rong: c.doRong[x.id], onDoi: (px) => c.coDan(x.id, px) }}
                sap={
                  x.kieu === 'sap'
                    ? {
                        chieu: sap.cot === x.id ? (sap.tang ? 'tang' : 'giam') : null,
                        onDoi: (ch) => onSap(ch ? { cot: x.id, tang: ch === 'tang' } : null),
                      }
                    : undefined
                }
                loc={x.kieu === 'loc' ? loc : undefined}
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dong.map((v) => (
            <DongBang key={v.id} v={v}>
              {c.hien.map((x) => (
                <TableCell key={x.id} cot={x.id} phai={x.phai}>
                  {o(v, x.id)}
                </TableCell>
              ))}
            </DongBang>
          ))}
        </TableBody>
      </Table>
    </TableWrap>
  )
}

/**
 * Kanban theo trạng thái. Kéo sang cột khác → nối cuối cột đích theo `sort_order` của `rows` (KanbanBoard chưa có thứ
 * tự trong cột). ponytail: hàng không có `sort_order` (Việc của tôi — RPC không trả) → đặt 0; cần giữ thứ tự thì thêm
 * cột vào RPC.
 */
export function KanbanViec<T extends ViecXem>({
  dong,
  rows,
  phu,
  moViec,
  lamMoi,
}: {
  dong: T[]
  rows: T[]
  /** Dòng phụ trên thẻ (team · gắn với / vai · gắn với). */
  phu: (v: T) => string
  moViec: (id: number) => void
  lamMoi: () => void
}) {
  async function chuyen(id: string, cot: string) {
    const cuoi = rows
      .filter((v) => v.status === cot && v.sort_order !== undefined)
      .reduce<number | undefined>((m, v) => Math.max(m ?? -Infinity, v.sort_order!), undefined)
    await chac(keoTha(Number(id), cot, cuoi === undefined ? 0 : cuoi + 1))
    lamMoi()
  }
  const the: TheKanban[] = dong
    .filter((v) => TT.some((t) => t.gt === v.status))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.priority - b.priority || a.id - b.id)
    .map((v) => {
      const n = v.due_at ? soNgayToiHan(v.due_at) : null
      return {
        id: String(v.id),
        cot: v.status,
        ten: v.ref,
        noiDung: (
          <NoiDungThe
            nhan={UU.find((u) => u.gt === String(v.priority))?.nhan}
            khach={v.title}
            viec={phu(v) || undefined}
            ma={v.ref}
            han={
              v.due_at ? { chu: nhanHan(v.due_at), kieu: n! < 0 ? 'tre' : n === 0 ? 'homNay' : undefined } : undefined
            }
            chu={chinhCua(v)?.ten}
          />
        ),
      }
    })
  return (
    <KanbanBoard
      cot={TT.map((t) => ({ id: t.gt, nhan: t.nhan, color: t.color }))}
      the={the}
      onChuyen={chuyen}
      onMo={(id) => moViec(Number(id))}
    />
  )
}
