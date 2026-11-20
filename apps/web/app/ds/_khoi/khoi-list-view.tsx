'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ArrowCounterClockwise, ArrowSquareOut, Check, Copy, SidebarSimple, WarningCircle } from '@phosphor-icons/react/ssr'
import type { MucChon } from '@/bang/OChonGoiY'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { ContextMenuItem, ContextMenuLabel, ContextMenuSeparator } from '@/components/ui/context-menu'
import {
  OSuaChu,
  OSuaHan,
  OSuaKhach,
  OSuaNguoi,
  OSuaNhan,
  OSuaTrangThai,
  type GiaTriTrangThai,
  type MucNhan,
  type MucTrangThai,
} from '@/components/ui/inline-edit'
import { cat, khach, luuY } from '@/components/ui/inline-edit-styles'
import { ListView, NhanDau, NutMoMa, TieuDeDs, TieuDeGop, type CotDanhSach, type KhoaSap } from '@/components/ui/list-view'
import type { BanGhi } from '@/components/ui/record-picker'
import type { MucLoc } from '@/components/ui/tieu-de-cot'
import { thongBao } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { BienThe, KhoiHang } from '../_khung/tam'
import { KHACH_DEMO } from './khoi-record-picker'

/* Dữ liệu demo (không PII): mã ticket tự đặt, khách lấy từ KHACH_DEMO, nhân viên tên giả. "Hôm nay" cố định 20/11/2026
   để HTML máy chủ = máy khách. Bộ nhãn/trạng thái như khối InlineEdit (khối đó không export — chép lại). */

const HOM_NAY = '2026-11-20'
type Uu = 'P1' | 'P2' | 'P3' | 'P4'
const UU: MucNhan<Uu>[] = [
  { gt: 'P1', nhan: <Badge variant="solid" color="danger">P1</Badge>, chu: 'P1' },
  { gt: 'P2', nhan: <Badge color="warning">P2</Badge>, chu: 'P2' },
  { gt: 'P3', nhan: <Badge>P3</Badge>, chu: 'P3' },
  { gt: 'P4', nhan: <Badge variant="outline">P4</Badge>, chu: 'P4' },
]
const MAU_LOI = { Main: 'discovery', 'Rò rỉ nước': 'info', 'Chất lượng nước': 'success', App: 'warning' } as const
const LOI: MucNhan[] = [...Object.keys(MAU_LOI), 'Chưa phân loại'].map((ten) => ({
  gt: ten,
  chu: ten,
  nhan: (
    <Badge variant="outline" title={`Loại lỗi: ${ten}`}>
      <BadgeDot color={MAU_LOI[ten as keyof typeof MAU_LOI]} />
      {ten}
    </Badge>
  ),
}))
const TT: MucTrangThai[] = [
  { gt: 'moi', nhan: 'Mới', color: 'discovery' },
  { gt: 'xu-ly', nhan: 'Đang xử lý', color: 'info' },
  { gt: 'cho', nhan: 'Chờ', color: 'warning', hoiLyDo: true },
  { gt: 'cho-kh', nhan: 'Chờ KH xác nhận' },
  { gt: 'dong', nhan: 'Đóng', color: 'success' },
  { gt: 'huy', nhan: 'Huỷ' },
]
const NGUOI: MucChon[] = ['Hiệp', 'Hiền', 'Kiều Trang', 'Tuyết Trang', 'Như', 'Tuấn', 'Lan', 'Mai', 'Nam', 'Oanh', 'Phúc', 'Quang'].map(
  (nhan, i) => ({ gt: `NV${String(i + 1).padStart(2, '0')}`, nhan }),
)
const kh = (ma: string) => KHACH_DEMO.find((k) => k.ma === ma)!

type Ve = {
  ma: string
  tao: number
  uu: Uu
  loai: string
  khach: BanGhi | null
  hoiLai?: number
  viec: string
  tt: GiaTriTrangThai
  han: string
  chu: string | null
}
const VE: Ve[] = [
  { ma: 'TK-2611-045', tao: 45, uu: 'P1', loai: 'Rò rỉ nước', khach: kh('KH-01036'), hoiLai: 1, viec: 'Báo KT trưởng, xếp lịch trong ngày', tt: { tt: 'moi' }, han: '2026-11-20 10:00', chu: 'NV02' },
  { ma: 'TK-2611-042', tao: 42, uu: 'P1', loai: 'Rò rỉ nước', khach: kh('KH-01029'), hoiLai: 2, viec: 'Cử KT kiểm tra rò nước đáy máy', tt: { tt: 'xu-ly' }, han: '2026-11-20 11:00', chu: 'NV01' },
  { ma: 'TK-2611-039', tao: 39, uu: 'P2', loai: 'Main', khach: kh('KH-01022'), viec: 'Chờ CEO duyệt miễn phí thay bơm', tt: { tt: 'cho', lyDo: 'duyệt' }, han: '2026-11-18 16:00', chu: 'NV02' },
  { ma: 'TK-2611-043', tao: 43, uu: 'P2', loai: 'Main', khach: kh('KH-01064'), hoiLai: 1, viec: 'Gọi hướng dẫn xử lý màn hình báo E4', tt: { tt: 'xu-ly' }, han: '2026-11-19 09:00', chu: 'NV03' },
  { ma: 'TK-2611-037', tao: 37, uu: 'P2', loai: 'Rò rỉ nước', khach: kh('KH-01015'), hoiLai: 1, viec: 'KT thay gioăng bình áp', tt: { tt: 'xu-ly' }, han: '2026-11-20 13:30', chu: 'NV02' },
  { ma: 'TK-2611-036', tao: 36, uu: 'P2', loai: 'Rò rỉ nước', khach: kh('KH-01001'), viec: 'KT xếp lịch thay van', tt: { tt: 'cho', lyDo: 'KT' }, han: '2026-11-20 16:00', chu: 'NV02' },
  { ma: 'TK-2611-035', tao: 35, uu: 'P2', loai: 'Chất lượng nước', khach: kh('KH-01050'), hoiLai: 1, viec: 'Chờ lõi RO về kho NX', tt: { tt: 'cho', lyDo: 'vật tư' }, han: '2026-11-21 09:00', chu: 'NV01' },
]

const KHOA: KhoaSap[] = [
  { id: 'uu', ten: 'Ưu tiên', kieu: 'sap', nghia: { tang: 'Gấp trước', giam: 'Ít gấp trước' } },
  { id: 'tao', ten: 'Thứ tự tạo', kieu: 'sap', nghia: { tang: 'Cũ nhất trước', giam: 'Mới tạo trước' } },
]
const tag = (giaTri: string, nhan: string, color?: MucLoc['color']): MucLoc => ({ giaTri, nhan, color })
const LOC_UU = [tag('P1', 'P1', 'danger'), tag('P2', 'P2', 'warning'), tag('P3', 'P3'), tag('P4', 'P4')]
const LOC_LOAI = LOI.map((m) => tag(m.gt, m.gt, MAU_LOI[m.gt as keyof typeof MAU_LOI]))
const tenNguoi = (gt: string | null) => NGUOI.find((n) => n.gt === gt)?.nhan ?? 'Chưa giao'

type Sap = { id: string; chieu: 'tang' | 'giam' } | null
type Loc = { uu: string[]; loai: string[]; chu: string[] }

/** Ô hạn như `.b-han`: 12/18 số thẳng cột muted; hôm nay foreground 500 (chỉ giờ); trễ danger 500 "Quá N ngày"; mai "Mai HH:mm". */
function HanChu({ v }: { v: string }) {
  const ngay = v.slice(0, 10)
  const gio = v.slice(11, 16)
  const lech = Math.round((Date.parse(ngay) - Date.parse(HOM_NAY)) / 864e5)
  const chu = lech === 0 ? gio : lech < 0 ? `Quá ${-lech} ngày` : lech === 1 ? `Mai ${gio}` : `${ngay.slice(8)}/${ngay.slice(5, 7)}`
  return (
    <span
      data-so="han-chu"
      className={cn(
        'inline-flex border-none border-current text-[12px] leading-[18px] tabular-nums whitespace-nowrap text-muted-foreground',
        lech === 0 && 'font-medium text-foreground',
        lech < 0 && 'font-medium text-(--color-text-danger)',
      )}
    >
      {chu}
    </span>
  )
}

/** Ô khách như preview: tên (cắt …) + cờ lưu ý + số lần khách hỏi lại (`.b-hoilai`: 12 500 warning, icon 13). */
function TenKhach({ k, hoiLai }: { k: BanGhi | null; hoiLai?: number }) {
  return (
    <span className={khach}>
      <span data-so="ten-khach" className={cat}>
        {k?.ten ?? '—'}
      </span>
      {k?.luuY && (
        <span role="img" aria-label="Khách có lưu ý" title="Khách có thẻ lưu ý — phải đọc" className={luuY}>
          <WarningCircle weight="fill" aria-hidden="true" />
        </span>
      )}
      {!!hoiLai && (
        <span
          role="img"
          aria-label={`Khách hỏi lại ${hoiLai} lần`}
          title={`Khách đã hỏi lại ${hoiLai} lần`}
          className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium tabular-nums text-(--color-text-warning) [&>svg]:size-[13px]"
        >
          <ArrowCounterClockwise aria-hidden="true" />
          {hoiLai}
        </span>
      )}
    </span>
  )
}

const THU_UU: Record<Uu, number> = { P1: 1, P2: 2, P3: 3, P4: 4 }
function loc(ve: Ve[], sap: Sap, l: Loc) {
  const ra = ve.filter(
    (v) =>
      (!l.uu.length || l.uu.includes(v.uu)) &&
      (!l.loai.length || l.loai.includes(v.loai)) &&
      (!l.chu.length || l.chu.includes(v.chu ?? '')),
  )
  if (!sap) return ra
  const gt = (v: Ve) => (sap.id === 'uu' ? THU_UU[v.uu] * 1000 - v.tao / 1000 : sap.id === 'tao' ? v.tao : Date.parse(v.han.replace(' ', 'T')))
  return ra.sort((a, b) => (gt(a) - gt(b)) * (sap.chieu === 'tang' ? 1 : -1))
}

/**
 * Danh sách ticket demo dùng chung khối trần và bản hàng: sắp/lọc ở tiêu đề (gộp "Ticket" + Hạn + Chủ), mọi ô sửa thật
 * (lưu vào state), chuột phải / Shift+F10 mở menu dòng. `nhomTheo` → nhóm theo trạng thái.
 */
function DanhSachTicket({ nhomTheo, onMo, dangMo }: { nhomTheo?: boolean; onMo?: (ma: string) => void; dangMo?: string | null }) {
  const [ve, setVe] = useState(VE)
  const [sap, setSap] = useState<Sap>({ id: 'uu', chieu: 'tang' })
  const [l, setL] = useState<Loc>({ uu: [], loai: [], chu: [] })
  const dong = useMemo(() => loc([...ve], sap, l), [ve, sap, l])
  const sua = (ma: string, moi: Partial<Ve>) => setVe((ds) => ds.map((v) => (v.ma === ma ? { ...v, ...moi } : v)))
  const locDoi = (k: keyof Loc) => (gt: string[]) => setL((c) => ({ ...c, [k]: gt }))
  const mo = (v: Ve) => onMo?.(v.ma)

  const cot: CotDanhSach<Ve>[] = [
    {
      id: 'ticket',
      ten: 'Ticket',
      rong: 'minmax(0,2.4fr)',
      dienThoai: 'tren',
      tieuDe: (
        <TieuDeGop
          ten="Ticket"
          sap={{ khoa: KHOA, dang: sap?.id === 'han' ? null : sap, onDoi: setSap }}
          loc={[
            { id: 'uu', ten: 'Ưu tiên', tuyChon: LOC_UU, daChon: l.uu, onDoi: locDoi('uu') },
            { id: 'loai', ten: 'Loại lỗi', tuyChon: LOC_LOAI, daChon: l.loai, onDoi: locDoi('loai') },
          ]}
        />
      ),
      o: (v) => (
        <>
          <NhanDau>
            <OSuaNhan ma={v.ma} truong="ưu tiên" value={v.uu} muc={UU} onLuu={(uu) => sua(v.ma, { uu })} />
            <OSuaNhan ma={v.ma} truong="loại lỗi" value={v.loai} muc={LOI} onLuu={(loai) => sua(v.ma, { loai })} rong />
          </NhanDau>
          <NutMoMa ma={v.ma} />
          <OSuaKhach ma={v.ma} value={v.khach} muc={KHACH_DEMO} onLuu={(k) => sua(v.ma, { khach: k })}>
            <TenKhach k={v.khach} hoiLai={v.hoiLai} />
          </OSuaKhach>
        </>
      ),
    },
    {
      id: 'viec',
      ten: 'Việc tiếp theo',
      rong: 'minmax(0,1fr)',
      anKhiHep: true,
      dienThoai: 'duoi',
      o: (v) => <OSuaChu ma={v.ma} truong="việc tiếp theo" value={v.viec} onLuu={(viec) => sua(v.ma, { viec })} />,
    },
    {
      id: 'tt',
      ten: 'Trạng thái',
      rong: '140px',
      dienThoai: 'duoiPhai',
      o: (v) => <OSuaTrangThai ma={v.ma} value={v.tt} muc={TT} onLuu={(tt) => sua(v.ma, { tt })} />,
    },
    {
      id: 'han',
      ten: 'Hạn',
      rong: '88px',
      phai: true,
      dienThoai: 'trenPhai',
      tieuDe: (
        <TieuDeDs
          cot={{ id: 'han', ten: 'Hạn', rong: 88, kieu: 'sap', nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' }, phai: true }}
          sap={{ chieu: sap?.id === 'han' ? sap.chieu : null, onDoi: (ch) => setSap(ch ? { id: 'han', chieu: ch } : null) }}
        />
      ),
      o: (v) => <OSuaHan ma={v.ma} value={v.han} onLuu={(han) => sua(v.ma, { han })} hien={(gt) => <HanChu v={gt} />} />,
    },
    {
      id: 'chu',
      ten: 'Chủ',
      rong: '40px',
      anKhiHep: true,
      tieuDe: (
        <TieuDeDs
          cot={{ id: 'chu', ten: 'Chủ', rong: 40, kieu: 'loc' }}
          menuPhai
          loc={{
            tuyChon: [...new Set(ve.map((v) => v.chu ?? ''))].map((gt) => tag(gt, tenNguoi(gt || null))),
            daChon: l.chu,
            onDoi: locDoi('chu'),
          }}
        />
      ),
      o: (v) => (
        <OSuaNguoi ma={v.ma} truong="chủ ticket" value={v.chu} options={NGUOI} onLuu={(chu) => sua(v.ma, { chu })} gon />
      ),
    },
  ]

  return (
    <ListView
      aria-label="Ticket"
      cot={cot}
      dong={dong}
      khoa={(v) => v.ma}
      onMo={mo}
      dangMo={dangMo}
      nhom={nhomTheo ? { theo: (v) => v.tt.tt, muc: TT.map((m) => ({ gt: m.gt, nhan: <Badge color={m.color}>{m.nhan}</Badge> })) } : undefined}
      menuDong={(v) => {
        const dong = v.tt.tt === 'dong'
        return (
          <>
            <ContextMenuLabel>{v.ma}</ContextMenuLabel>
            <ContextMenuItem data-so="cp-mo" onSelect={() => mo(v)}>
              <ArrowSquareOut aria-hidden="true" />
              Mở ticket
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => mo(v)}>
              <SidebarSimple aria-hidden="true" mirrored />
              Xem nhanh bên phải
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => {
                void navigator.clipboard?.writeText(v.ma).catch(() => {})
                thongBao.xong(`Đã chép mã ${v.ma}`)
              }}
            >
              <Copy aria-hidden="true" />
              Sao chép mã
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={() => {
                const cu = v.tt
                sua(v.ma, { tt: { tt: dong ? 'xu-ly' : 'dong' } })
                thongBao.xong(`${v.ma}: ${dong ? 'đã mở lại' : 'đã đóng'}`, { hoanTac: () => sua(v.ma, { tt: cu }) })
              }}
            >
              <Check aria-hidden="true" />
              {dong ? 'Mở lại ticket' : 'Đóng ticket'}
            </ContextMenuItem>
          </>
        )
      }}
    />
  )
}

/** `.ds-muc` + `.ds-nhan` + `.ds-cuon` của preview: nhãn 12/16 500 muted cách 8, vùng cuộn ngang đệm dưới 6, lề dưới 28. */
function Muc({ so, nhan, rong, children }: { so: string; nhan: string; rong: number; children: ReactNode }) {
  return (
    <div data-so={so} className="mb-7 border-none border-current">
      <p className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">{nhan}</p>
      <div className="overflow-x-auto pb-1.5 border-none border-current">
        <div className="border-none border-current" style={{ width: rong }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * #list-view — khối trần (/ds/tron, cổng so khớp): tái tạo ds/nguon/components/ListView/preview.html — ba khổ của vùng
 * đặt danh sách (1100 rộng · 640 hẹp · 375 điện thoại), mỗi khổ một danh sách ticket thật (sửa tại ô, menu dòng).
 */
export function KhoiListView() {
  return (
    <section id="list-view" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#list-view">ListView</a>
      </h2>
      <Muc so="rong" nhan="Khổ rộng ≥ 860px — mặc định (dòng 2 đang hover)" rong={1100}>
        <DanhSachTicket />
      </Muc>
      <Muc so="hep" nhan="Khổ hẹp ≤ 860px — khi mở thẻ xem nhanh: vẫn 1 dòng, ẩn bớt cột" rong={640}>
        <DanhSachTicket />
      </Muc>
      <Muc so="dt" nhan="Điện thoại ≤ 480px — 2 dòng" rong={375}>
        <DanhSachTicket />
      </Muc>
    </section>
  )
}

/** #list-view dạng hàng (/ds). */
export function KhoiListViewHang() {
  const [dangMo, setDangMo] = useState<string | null>(null)
  return (
    <KhoiHang neo="list-view">
      <BienThe
        ten="Bấm thử"
        moTa="Mỗi ticket một dòng. Bấm vào nhãn, tên khách, việc, trạng thái, hạn hay người để sửa ngay tại chỗ; bấm chỗ trống của dòng hoặc mã để mở ticket. Chuột phải (hoặc Shift+F10 khi dòng đang chọn bằng phím) mở menu thao tác. Tiêu đề “Ticket” sắp theo ưu tiên hoặc thứ tự tạo, lọc theo ưu tiên và loại lỗi."
      >
        <div className="flex flex-col gap-2 border-none border-current">
          <DanhSachTicket onMo={setDangMo} dangMo={dangMo} />
          <p aria-live="polite" className="min-h-[18px] border-none border-current text-[12px] leading-[18px] text-muted-foreground">
            {dangMo && `Đang mở ${dangMo} (demo: thẻ xem nhanh / trang chi tiết) — dòng được tô nền.`}
          </p>
        </div>
      </BienThe>
      <BienThe ten="Nhóm theo" moTa="Nhóm theo trạng thái: mỗi nhóm có tiêu đề là nhãn + số ticket; nhóm không có ticket thì không hiện.">
        <DanhSachTicket nhomTheo />
      </BienThe>
      <BienThe ten="Khổ hẹp" moTa="Vùng hẹp hơn 860px (ví dụ đang mở thẻ xem nhanh): vẫn một dòng, ẩn việc tiếp theo, người phụ trách, mã và loại lỗi — xem trong thẻ.">
        <div className="max-w-[640px] border-none border-current">
          <DanhSachTicket />
        </div>
      </BienThe>
      <BienThe ten="Điện thoại" moTa="Vùng hẹp hơn 480px: hai dòng — tên khách + hạn ở trên, việc tiếp theo + trạng thái ở dưới; không hiện tiêu đề cột.">
        <div className="max-w-[375px] border-none border-current">
          <DanhSachTicket />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
