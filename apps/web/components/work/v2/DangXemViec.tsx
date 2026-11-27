'use client'

/**
 * Phần chung của các dạng xem việc v2 (Bảng team, Việc của tôi): cột + ô sửa tại chỗ, Table DS có ô chọn dòng, Kanban
 * theo trạng thái (kéo thả gọi `keoTha`). Mỗi màn tự giữ dữ liệu, lọc / tab / sắp ở URL và danh sách (ListView) riêng.
 */
import { useState, type ReactNode, type Ref } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, LinkSimple, SidebarSimple } from '@phosphor-icons/react/ssr'
import { OChonDong, OChonTatCa, useDaChon } from '@/bang'
import type { MucChon } from '@/bang/OChonGoiY'
import { doiTrangThai, keoTha, suaViec, type NenTang, type ViecTeamRow } from '@/app/work/actions'
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { DongThem, type DongThemRef } from '@/components/ui/dong-them'
import { OSuaHan, OSuaNguoi, OSuaNhan, OSuaNhap, OSuaTrangThai } from '@/components/ui/inline-edit'
import { KanbanBoard, NoiDungThe, type TheKanban } from '@/components/ui/kanban-board'
import { MaCho, NutMoMa, NutMoTen } from '@/components/ui/list-view'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { cotDem, hangNhap as hangNhapBang } from '@/components/ui/table-styles'
import { ColCotBang, TieuDeCot, type PropsTieuDeCot } from '@/components/ui/tieu-de-cot'
import type { CotBang, useCotBang } from '@/components/ui/use-cot-bang'
import { hienNgay, KIEU_NGAY_MAC_DINH, type KieuNgay } from '@/lib/dinh-dang-ngay'
import { mocThoiGian, nhanHan, soNgayToiHan } from '@/lib/work'
import { chac, doiNguoiChinh, GOI_Y_THEM_NGAN, HanChu, hanLuu, hanO, TT, UU, type GiaTriNhap, type Uu } from './chung'

/** Trường mà các dạng xem đọc — `ViecRow` (Việc của tôi) và `ViecTeamRow` (Bảng team) đều có. */
export type ViecXem = Pick<
  ViecTeamRow,
  'id' | 'ref' | 'title' | 'status' | 'priority' | 'due_at' | 'team_id' | 'team_name' | 'sub_n' | 'assignees' | 'links'
> & { sort_order?: number; touched_at?: string | null }

export const COT_VIEC: CotBang[] = [
  // Mọi cột tự vừa nội dung (CEO 26/11 "chiều rộng cột = chiều dài content dài nhất"): số khai cũ 76 làm tiêu đề
  // "Ưu tiên" bị cắt khi vừa sắp vừa lọc (thêm 2 dấu).
  { id: 'uu', ten: 'Ưu tiên', kieu: 'sap', nghia: { tang: 'Gấp trước', giam: 'Thấp trước' } },
  { id: 'ma', ten: 'Mã', kieu: 'sap', nghia: { tang: 'Cũ nhất trước', giam: 'Mới tạo trước' } },
  // Không khai `rong` → tự vừa tên việc dài nhất (CEO 26/11, useCotBang đo), trần 480: quá trần mới cắt (ô có title).
  { id: 'viec', ten: 'Việc', kieu: 'thuong', khoa: true, rongToiDa: 480 },
  { id: 'tt', ten: 'Trạng thái', kieu: 'loc' },
  { id: 'nguoi', ten: 'Người', kieu: 'thuong', rongToiDa: 240 },
  {
    id: 'han',
    ten: 'Hạn',
    kieu: 'sap',
    phai: true,
    ngay: true,
    nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' },
  },
]
/**
 * Bảng team thêm cột "Cập nhật" (lần đụng cuối — chỉ work_bang_team trả `touched_at`), 112 như canvas. Cột Việc tự vừa
 * như ở Việc của tôi; tổng vượt khung thì bảng cuộn ngang (không cắt tên việc).
 */
export const COT_TEAM: CotBang[] = [
  ...COT_VIEC,
  {
    id: 'cn',
    ten: 'Cập nhật',
    kieu: 'sap',
    phai: true,
    ngay: true,
    // CEO 26/11 "Để Tương đối": cột lần cuối động vào đọc theo khoảng cách (3 ngày trước) dễ hơn ngày.
    ngayMacDinh: 'tuong-doi',
    nghia: { tang: 'Lâu nhất trước', giam: 'Mới nhất trước' },
  },
]
export const TEN_COT = { uu: 'Ưu tiên', ma: 'Mã', han: 'Hạn', cn: 'Cập nhật' }
export const NGHIA = {
  uu: { asc: 'gấp trước', desc: 'thấp trước' },
  ma: { asc: 'cũ nhất trước', desc: 'mới tạo trước' },
  han: { asc: 'gần hạn nhất trước', desc: 'xa hạn nhất trước' },
  cn: { asc: 'cũ nhất trước', desc: 'mới nhất trước' },
}

/** Số ngày (lịch) từ lần đụng cuối tới nay; không có mốc → null. */
export const soNgayKhongDung = (v: ViecXem, bayGio = new Date()) =>
  v.touched_at ? -soNgayToiHan(v.touched_at, bayGio) : null

/**
 * "14:32 hôm nay" · "09:10 hôm qua" · cũ hơn → ngày theo `kieu` của menu tiêu đề cột (mặc định dd/MM; "Tương đối" →
 * "16 ngày trước"). Title giữ mốc đầy đủ.
 */
function ChuCapNhat({ v, kieu = KIEU_NGAY_MAC_DINH }: { v: ViecXem; kieu?: KieuNgay }) {
  const n = soNgayKhongDung(v)
  if (n === null) return <span className="text-muted-foreground">—</span>
  return (
    <span className="truncate tabular-nums text-muted-foreground" title={mocThoiGian(v.touched_at)}>
      {n <= 1 ? mocThoiGian(v.touched_at) : hienNgay(v.touched_at, kieu)}
    </span>
  )
}

export type Sap = { cot: string; tang: boolean }
/** URL `cot`/`chieu` → sắp; cột lạ = không sắp theo URL (`cotUrl` null). */
export function docSap(sp: URLSearchParams, macDinh: Sap) {
  const cotUrl = ['uu', 'ma', 'han', 'cn'].includes(sp.get('cot') ?? '') ? sp.get('cot')! : null
  const sap: Sap = cotUrl ? { cot: cotUrl, tang: sp.get('chieu') !== 'desc' } : macDinh
  return { cotUrl, sap }
}
/** So sánh theo cột; việc không hạn / không mốc cập nhật luôn cuối; khoá phụ id (CHUAN-FILTER luật 2). */
export function soSanh(s: Sap) {
  const huong = s.tang ? 1 : -1
  return (a: ViecXem, b: ViecXem) => {
    if (s.cot === 'han' && !a.due_at !== !b.due_at) return a.due_at ? -1 : 1
    if (s.cot === 'cn' && !a.touched_at !== !b.touched_at) return a.touched_at ? -1 : 1
    const c =
      s.cot === 'uu'
        ? a.priority - b.priority
        : s.cot === 'han' && a.due_at && b.due_at
          ? Date.parse(a.due_at) - Date.parse(b.due_at)
          : s.cot === 'cn' && a.touched_at && b.touched_at
            ? Date.parse(a.touched_at) - Date.parse(b.touched_at)
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
  /** Đổi người chính (chung.tsx `doiNguoiChinh`: hai lệnh, bước 2 hỏng thì hoàn nguyên). */
  async function doiChinh(v: ViecXem, gt: string | null) {
    const id = gt && ns.idCua(gt)
    if (!id) return
    try {
      await doiNguoiChinh(v.id, v.assignees, id)
    } finally {
      lamMoi()
    }
  }
  /** `kieu` = định dạng ngày cột đang chọn (bảng truyền `c.kieuNgay(id)`; ListView/Kanban không truyền → mặc định). */
  const o = (v: ViecXem, id: string, kieu?: KieuNgay): ReactNode => {
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
        // CEO 25/11: bấm TÊN mới mở thẻ xem nhanh (đổi tên ở thẻ — bút chì cạnh tiêu đề). Table không có onMo → bắt ở đây.
        return (
          <span className="inline-flex min-w-0 border-none border-current" onClick={() => moViec(v.id)}>
            <NutMoTen ten={v.title} />
          </span>
        )
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
      case 'cn':
        return <ChuCapNhat v={v} kieu={kieu} />
      case 'han':
        return (
          <OSuaHan
            ma={v.ref}
            value={hanO(v.due_at)}
            onLuu={(h) => luu(suaViec(v.id, h ? { due: hanLuu(h) } : { xoa_due: true }))}
            hien={() => <HanChu due={v.due_at} kieu={kieu} />}
          />
        )
    }
  }
  return { ...ns, lamMoi, luu, o }
}

/**
 * Hàng nháp "+ Việc mới" (CEO 25/11: "tạo ra một format mẫu y hệt thế này rồi chọn từng mục"): mang giá trị mặc định của
 * việc mới — Thường · Cần làm · chưa hạn · Chính = mình — vẽ bằng ĐÚNG các ô sửa tại chỗ của dòng thật (bọc `OSuaNhap`:
 * chọn chỉ đổi giá trị cục bộ, không toast), mã là `MaCho` "Mới". Enter ở ô tên (`useDongMoi`) tạo với `giaTri()`;
 * tạo xong `datLai()` về mặc định cho việc kế tiếp.
 */
export function useViecNhap(nenTang: NenTang) {
  const ns = chonNhanSu(nenTang.nhan_su)
  const me = nenTang.me
  const gtMe = me ? ns.gtCua(me) : null
  const MAC_DINH = { uu: '3' as Uu, tt: 'todo', han: hanO(null), chinh: gtMe }
  const [n, setN] = useState(MAC_DINH)
  const doi = (p: Partial<typeof MAC_DINH>) => {
    setN((x) => ({ ...x, ...p }))
    return Promise.resolve()
  }
  const tenChinh = n.chinh ? (ns.options.find((m) => m.gt === n.chinh)?.nhan ?? me?.ten ?? '') : ''

  const o = (id: string): ReactNode => {
    switch (id) {
      case 'uu':
        return <OSuaNhan ma="Việc mới" truong="ưu tiên" value={n.uu} muc={UU} onLuu={(uu) => doi({ uu })} />
      case 'ma':
        return <MaCho />
      case 'tt':
        return <OSuaTrangThai ma="Việc mới" value={{ tt: n.tt }} muc={TT} onLuu={(g) => doi({ tt: g.tt })} />
      case 'han':
        return (
          <OSuaHan
            ma="Việc mới"
            value={n.han}
            onLuu={(han) => doi({ han })}
            hien={() => <HanChu due={n.han ? hanLuu(n.han) : null} />}
          />
        )
      case 'nguoi':
      case 'chinh':
        return (
          <OSuaNguoi
            ma="Việc mới"
            truong="người chính"
            value={n.chinh}
            options={ns.options}
            mucDangChon={n.chinh ? { gt: n.chinh, nhan: tenChinh } : undefined}
            gon={id === 'chinh'}
            onLuu={(chinh) => doi({ chinh })}
          />
        )
      case 'vai':
        return <span className="min-w-0 truncate text-muted-foreground">{n.chinh === gtMe ? 'Chính' : ''}</span>
      default:
        return null
    }
  }

  return {
    /** Ô của cột `id` trong hàng nháp — đã bọc `OSuaNhap`. */
    o: (id: string): ReactNode => <OSuaNhap>{o(id)}</OSuaNhap>,
    giaTri: (): GiaTriNhap => {
      const chinh = n.chinh ? (ns.idCua(n.chinh) ?? null) : null
      return {
        status: n.tt,
        priority: Number(n.uu),
        due: n.han ? hanLuu(n.han) : null,
        chinh: chinh && chinh !== me?.id ? chinh : null,
      }
    },
    datLai: () => setN(MAC_DINH),
  }
}

/**
 * Mục menu chuột phải của một việc (khuôn F — như dòng ticket): Xem nhanh, sao chép mã, sao chép đường dẫn (`?xem=<id>`
 * của màn đang đứng — mở lại đúng thẻ xem nhanh). Dùng cho `BangViec menu` và `ListView menuDong`.
 */
export function MenuViec({ v, moViec }: { v: Pick<ViecXem, 'id' | 'ref'>; moViec: (id: number) => void }) {
  return (
    <>
      <ContextMenuItem onSelect={() => moViec(v.id)}>
        <SidebarSimple aria-hidden="true" />
        Xem nhanh
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => void navigator.clipboard?.writeText(v.ref)}>
        <Copy aria-hidden="true" />
        Sao chép mã việc
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={() => void navigator.clipboard?.writeText(`${location.origin}${location.pathname}?xem=${v.id}`)}
      >
        <LinkSimple aria-hidden="true" />
        Sao chép đường dẫn
      </ContextMenuItem>
    </>
  )
}

/** Dòng bảng: ô chọn của bang/ + nền chọn + menu chuột phải (nếu có). */
function DongBang({ v, menu, children }: { v: ViecXem; menu?: ReactNode; children: ReactNode }) {
  const { daChon } = useDaChon()
  return (
    <TableRow chon={daChon.includes(String(v.id))} menu={menu} tenMenu={`Thao tác ${v.ref}`}>
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
  moLoc,
  o,
  dongNhap,
  menu,
  sapMacDinh,
}: {
  dong: ViecXem[]
  c: ReturnType<typeof useCotBang>
  sap: Sap
  onSap: (s: Sap | null) => void
  /** Bấm tiêu đề cột → pop lọc của trường đó (`moLocCot` của bo-loc-truong; đang lọc → nhãn thành chip); undefined = không lọc. */
  moLoc?: (cotId: string) => PropsTieuDeCot['moLoc']
  o: (v: ViecXem, id: string, kieu?: KieuNgay) => ReactNode
  /** Hàng nháp "+ Việc mới": nội dung từng ô theo cột (`useViecNhap().o` + ô gõ tên ở cột Việc) — CEO 25/11. */
  dongNhap?: (cotId: string) => ReactNode
  /** Mục menu chuột phải của dòng (`MenuViec`). */
  menu?: (v: ViecXem) => ReactNode
  /** Sắp đang là mặc định của màn (URL chưa có `cot`) → tiêu đề không hiện mũi tên. */
  sapMacDinh?: boolean
}) {
  // Tách sẵn: luật react-hooks/refs coi cả `c` là ref nếu `c.refBang` gắn thẳng vào `ref=`.
  const { refBang } = c
  return (
    <TableWrap>
      {/* Mọi cột rộng cố định theo `c.doRong` (Việc tự vừa nội dung, có trần), cột trống cuối ăn phần dư — kéo tay co cột
          nào chỉ cột đó đổi (học Twenty). */}
      <Table ref={refBang} layout="fixed" style={{ minWidth: 36 + c.tongRong }}>
        <ColCotBang hien={c.hien} doRong={c.doRong} choDo={c.choDo} />
        <TableHeader>
          <TableRow>
            <OChonTatCa nhan="việc" />
            {c.hien.map((x, i) => (
              <TieuDeCot
                key={x.id}
                cot={x}
                viTri={i}
                menuPhai={i === c.hien.length - 1}
                coDan={{ rong: c.doRong[x.id], onDoi: (px) => c.coDan(x.id, px) }}
                ngay={c.ngayCot(x.id)}
                sap={
                  x.kieu === 'sap'
                    ? {
                        chieu: sap.cot === x.id ? (sap.tang ? 'tang' : 'giam') : null,
                        macDinh: sapMacDinh,
                        onDoi: (ch) => onSap(ch ? { cot: x.id, tang: ch === 'tang' } : null),
                      }
                    : undefined
                }
                moLoc={moLoc?.(x.id)}
              />
            ))}
            <TableHead aria-hidden="true" className={cotDem} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {dong.map((v) => (
            <DongBang key={v.id} v={v} menu={menu?.(v)}>
              {c.hien.map((x) => (
                <TableCell key={x.id} cot={x.id} phai={x.phai}>
                  {o(v, x.id, x.ngay ? c.kieuNgay(x.id) : undefined)}
                </TableCell>
              ))}
              <TableCell aria-hidden="true" className={cotDem} />
            </DongBang>
          ))}
          {dongNhap && (
            <TableRow data-nhap="" className={hangNhapBang}>
              <TableCell />
              {c.hien.map((x) => (
                <TableCell key={x.id} cot={x.id} phai={x.phai}>
                  {dongNhap(x.id)}
                </TableCell>
              ))}
              <TableCell aria-hidden="true" className={cotDem} />
            </TableRow>
          )}
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
  onTao,
  themRef,
}: {
  dong: T[]
  rows: T[]
  /** Dòng phụ trên thẻ (team · gắn với / vai · gắn với). */
  phu: (v: T) => string
  moViec: (id: number) => void
  lamMoi: () => void
  /** Có → chân mỗi cột (trừ Xong) có "+ Việc mới" tạo thẳng vào trạng thái của cột. */
  onTao?: (ten: string, status: string) => Promise<boolean>
  /** Gắn vào "+ Việc mới" của cột đầu (Cần làm) — nút chính thanh công cụ mở nó. */
  themRef?: Ref<DongThemRef>
}) {
  async function chuyen(id: string, cot: string) {
    // Nguồn không có thứ tự (work_viec_cua_toi không trả sort_order) → chỉ đổi trạng thái. Gửi keoTha(…, 0) sẽ GHI ĐÈ
    // thứ tự mà Bảng team đã xếp (thẻ nhảy lên đầu cột ở màn kia).
    if (!rows.some((v) => v.sort_order !== undefined)) {
      await chac(doiTrangThai(Number(id), cot))
      lamMoi()
      return
    }
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
      chanCot={
        onTao &&
        ((c) =>
          c.id === 'done' ? null : (
            <DongThem
              kieu="the"
              nhan="Việc mới"
              nhanDoc={`Việc mới — ${c.nhan}`}
              placeholder={GOI_Y_THEM_NGAN}
              ref={c.id === TT[0].gt ? themRef : undefined}
              onTao={(ten) => onTao(ten, c.id)}
            />
          ))
      }
    />
  )
}
