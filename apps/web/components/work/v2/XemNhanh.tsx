'use client'

/**
 * "Xem nhanh một việc" v2 — dữ liệu `the` cho khung DS `XemNhanh` (components/ui/xem-nhanh.tsx: đầu "MÃ · tiêu đề", ‹ ›,
 * ✕, Esc, hàng tab, chân dính đáy). Bố cục theo thẻ Xem nhanh ticket F (CEO 26/11 "làm layout popup công việc cho giống
 * popup này" — mẫu app/ticket/_danh-sach/xem-nhanh-f.tsx): tab line có icon Tổng quan · Việc con · Hoạt động · Liên kết;
 * Tổng quan = nhóm gập/mở (Accordion) gồm dòng icon + nhãn mờ · giá trị sửa tại chỗ; chân = Đánh dấu xong.
 * Khác mẫu có chủ đích: mỗi hành động MỘT chỗ (không lặp ở nhóm và chân); trường trống hiện "—" (không lặp tên nhãn).
 * Nghiệp vụ giữ y bản trước (quyền `co_the_sua`, việc con, chặn/đang chặn, @nhắc tên, nhật ký). Mọi action trả `KQ`.
 */
import { xemPhu } from '@/components/ui/detail-styles'
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react'
import Link from 'next/link'
import {
  AddressBook,
  ArrowRight,
  CalendarBlank,
  ChatText,
  Check,
  CircleHalf,
  Clock,
  Eye,
  Flag,
  Globe,
  HourglassMedium,
  House,
  LinkSimple,
  ListChecks,
  PencilSimple,
  Plus,
  Prohibit,
  Receipt,
  SealCheck,
  ShieldCheck,
  Sparkle,
  Ticket as IconTicket,
  TreeStructure,
  User,
  UserCircle,
  Users,
  UsersThree,
  X,
} from '@phosphor-icons/react/ssr'
import { boDau, type MucChon } from '@/bang'
import {
  boErp,
  boNguoi,
  boPhuThuoc,
  chiTietViec,
  doiTrangThai,
  ganErp,
  ganNguoi,
  suaViec,
  taoViecCon,
  themBinhLuan,
  themPhuThuoc,
  timErp,
  timViec,
  type ChiTietViec,
  type KQ,
  type NenTang,
} from '@/app/work/actions'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertActions, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, chuCaiDau } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { ComboboxPanel } from '@/components/ui/combobox'
import { Command, CommandItem, CommandList } from '@/components/ui/command'
import { Composer } from '@/components/ui/composer'
import { EmptyState } from '@/components/ui/empty-state'
import { ChipTrangThai, OSuaHan, OSuaNguoi, OSuaNhan, OSuaTrangThai, type MucNhan } from '@/components/ui/inline-edit'
import { cat, nguoi, nutThem } from '@/components/ui/inline-edit-styles'
import { Input } from '@/components/ui/input'
import { menuContent } from '@/components/ui/menu-styles'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { Skeleton, VungDoc } from '@/components/ui/skeleton'
import { thongBao } from '@/components/ui/sonner'
import { Textarea } from '@/components/ui/textarea'
import { Timeline, type MucTimeline } from '@/components/ui/timeline'
import { TooltipNhanh } from '@/components/ui/tooltip'
import type { XemNhanh as KhungXemNhanh } from '@/components/ui/xem-nhanh'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { cn } from '@/lib/utils'
import {
  chenNhac,
  chiaTheoNhac,
  duongDanLink,
  moTaNhatKy,
  NHAN_LOAI_LINK,
  NHAN_TRANG_THAI,
  nhanChip,
  tokenNhac,
  type LoaiLink,
} from '@/lib/work'
import { chac, doiNguoiChinh, HanChu, hanLuu, hanO, TT, UU, type Uu } from './chung'

type Ct = ChiTietViec
type ViecNho = Ct['subtasks'][number]
type The = NonNullable<Parameters<typeof KhungXemNhanh>[0]['the']>

/** Tab của thẻ (bên gọi giữ — lật ‹ › giữ tab, đóng thẻ về Tổng quan). */
export const TAB_VIEC = ['tong', 'con', 'hd', 'lk'] as const
export type TabViec = (typeof TAB_VIEC)[number]

const LOAI: LoaiLink[] = ['khach', 'ticket', 'don']
const ICON_LOAI: Record<LoaiLink, ReactNode> = {
  khach: <AddressBook aria-hidden="true" />,
  ticket: <IconTicket aria-hidden="true" />,
  don: <Receipt aria-hidden="true" />,
}
const CHO_TRONG: Record<LoaiLink, string> = {
  khach: 'Gõ tên khách, mã hoặc số điện thoại…',
  ticket: 'Gõ mã ticket hoặc nội dung…',
  don: 'Gõ mã đơn hoặc tên khách…',
}
const PHAM_VI: Record<string, string> = { private: 'Chỉ mình tôi', team: 'Cả team', company: 'Toàn công ty' }
/** Vai phụ (owner = "Người chính" riêng một dòng). */
const VAI_PHU = [
  { v: 'doer', ten: 'Làm cùng', icon: <Users aria-hidden="true" /> },
  { v: 'reviewer', ten: 'Duyệt', icon: <SealCheck aria-hidden="true" /> },
  { v: 'watcher', ten: 'Theo dõi', icon: <Eye aria-hidden="true" /> },
] as const
const roi = (s: string) => s === 'done' || s === 'cancelled'

const PHU = xemPhu
/** Chữ tiêu đề trong ô giá trị: 14/20 medium, xuống dòng đủ. */
const TEN = 'min-w-0 font-medium [overflow-wrap:anywhere] border-none border-current'
/** Hàng chip trong ô PropertyList (liên kết): xuống dòng khi hẹp. */
const HANG = 'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 border-none border-current'
const CUM = 'inline-flex min-w-0 items-center gap-0.5 border-none border-current'
/** Danh sách người của một vai: mỗi người một dòng (cao 32 = dòng nhãn), nút "+ Thêm người" dòng riêng bên dưới. */
const DOC = 'flex min-w-0 flex-col items-start border-none border-current'
const DONG_NGUOI = 'group/nguoi inline-flex min-h-(--control-size-md) min-w-0 items-center gap-0.5 border-none border-current'
/** × bỏ người: ẩn, rê vào người đó / focus phím mới hiện; máy cảm ứng luôn hiện. */
const AN_CHO_RE = 'opacity-0 group-hover/nguoi:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
/** Khung pop chọn có tìm — y PopoverContent của `OSuaNguoi`. */
const KHUNG_CHON = cn(
  menuContent,
  'w-auto min-w-[240px] max-w-[calc(100vw-16px)] max-h-(--radix-popover-content-available-height)',
)
/** Cột dọc của một tab (như khối tab của ticket F). */
const COT = 'flex flex-col gap-3 border-none border-current'

const mucTT = (s: string) => TT.find((m) => m.gt === s) ?? { gt: s, nhan: NHAN_TRANG_THAI[s] ?? s }

/** Một dòng trường như mẫu ticket F: icon + nhãn mờ (cột trái) · giá trị; trống → "—" (không lặp tên trường). */
function Truong({ icon, nhan, children }: { icon: ReactNode; nhan: string; children?: ReactNode }) {
  return (
    <PropertyRow
      nhan={
        <>
          {icon}
          {nhan}
        </>
      }
      trong="—"
    >
      {children}
    </PropertyRow>
  )
}

/** Mọi tab dùng chung: chi tiết đã tải + hai cách ghi. */
type Ctx = {
  ct: Ct
  nenTang: NenTang
  sua: boolean
  /** Ghi một lần: lỗi → toast (thẻ giữ nguyên), trả false; xong → tải lại + báo màn. */
  chay: (p: Promise<KQ<unknown>>, viec: string) => Promise<boolean>
  /** Cho ô sửa tại chỗ DS: lỗi phải NÉM (ô trả giá trị cũ + toast Thử lại); ô tự báo xong + Hoàn tác. */
  luu: (p: Promise<KQ<unknown>>) => Promise<void>
  sau: () => Promise<void>
  onMoViec: (id: number) => void
}

/**
 * Tải chi tiết việc `taskId` và dựng `the` cho khung DS. `taskId` null → null (thẻ đóng). Đang tải / lỗi → thân thường
 * (Skeleton / Alert Thử lại), chưa có tab.
 */
export function useTheViec({
  taskId,
  ma,
  nenTang,
  tab,
  onTab,
  onDong,
  onMoViec,
  onDoi,
}: {
  taskId: number | null
  /** Mã hiện ở đầu thẻ lúc đang tải (ref trong danh sách). */
  ma: string
  nenTang: NenTang
  tab: TabViec
  onTab: (v: TabViec) => void
  onDong: () => void
  /** Bấm việc con / việc cha / việc chặn → mở việc đó (thẻ nhảy sang, không đóng). */
  onMoViec: (id: number) => void
  /** Sau mỗi lần ghi thành công (màn gọi `router.refresh()`). */
  onDoi: () => void
}): The | null {
  const [tai, setTai] = useState<{ id: number; kq: KQ<Ct> } | null>(null)
  useEffect(() => {
    if (!taskId) return
    let huy = false
    void chiTietViec(taskId).then((kq) => {
      if (!huy) setTai({ id: taskId, kq })
    })
    return () => {
      huy = true
    }
  }, [taskId])
  const taiLai = useCallback(async () => {
    if (!taskId) return
    const kq = await chiTietViec(taskId)
    // Đã nhảy sang việc khác trong lúc chờ → bỏ kết quả cũ.
    setTai((cu) => (cu && cu.id !== taskId ? cu : { id: taskId, kq }))
  }, [taskId])
  const sau = useCallback(async () => {
    await taiLai()
    onDoi()
  }, [taiLai, onDoi])

  if (!taskId) return null
  if (!tai || tai.id !== taskId) return { ma, noiDung: <DangTai /> }
  if (!tai.kq.ok)
    return {
      ma,
      noiDung: (
        <Alert color="danger">
          <AlertTitle>Chưa mở được việc</AlertTitle>
          <AlertDescription>{tai.kq.loi}</AlertDescription>
          <AlertActions>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTai(null)
                void taiLai()
              }}
            >
              Thử lại
            </Button>
            <Button size="sm" variant="ghost" onClick={onDong}>
              Đóng
            </Button>
          </AlertActions>
        </Alert>
      ),
    }

  const ct = tai.kq.duLieu
  const t = ct.task
  const c: Ctx = {
    ct,
    nenTang,
    sua: ct.co_the_sua,
    chay: async (p, viec) => {
      const kq = await p
      if (!kq.ok) {
        thongBao.loi(`${t.ref}: chưa ${viec} — ${kq.loi}`)
        return false
      }
      await sau()
      return true
    },
    luu: async (p) => {
      await chac(p)
      await sau()
    },
    sau,
    onMoViec,
  }
  return {
    ma: t.ref,
    phu: t.title,
    // Tiêu đề lớn trên hàng tab (CEO 27/11, học Notion) — thay dòng "Tiêu đề" trong Tổng quan.
    tieuDe: <TieuDe lon value={t.title} sua={c.sua} onLuu={(title) => c.chay(suaViec(t.id, { title }), 'sửa tiêu đề')} />,
    tab: {
      value: tab,
      onDoi: (v) => onTab(v as TabViec),
      ds: [
        { gt: 'tong', nhan: 'Tổng quan', icon: <House aria-hidden="true" />, noiDung: <TongQuan key={t.id} c={c} /> },
        { gt: 'con', nhan: 'Việc con', icon: <ListChecks aria-hidden="true" />, noiDung: <ViecCon key={t.id} c={c} /> },
        { gt: 'hd', nhan: 'Hoạt động', icon: <ChatText aria-hidden="true" />, noiDung: <HoatDong key={t.id} c={c} /> },
        { gt: 'lk', nhan: 'Liên kết', icon: <LinkSimple aria-hidden="true" />, noiDung: <LienKet key={t.id} c={c} /> },
      ],
    },
    chan: <Chan key={t.id} c={c} />,
  }
}

function DangTai() {
  return (
    <>
      <VungDoc chu="Đang tải việc" />
      <div aria-busy="true" className="flex flex-col gap-3 border-none border-current">
        <Skeleton shape="pill" />
        <Skeleton shape="title" width="3/4" />
        <Skeleton width="1/2" />
        <Skeleton width="2/3" className="mt-5" />
        <Skeleton width="1/2" />
        <Skeleton width="2/3" />
      </div>
    </>
  )
}

/** Tổng quan: cảnh báo đang bị chặn · nhóm Việc · Mô tả · Hệ thống (gập/mở). */
function TongQuan({ c }: { c: Ctx }) {
  const { ct, nenTang, sua, chay, luu, sau, onMoViec } = c
  const t = ct.task
  const ic = (I: typeof User) => <I aria-hidden="true" />
  // Ô chọn người: khoá = email (uuid làm mã sẽ hiện ra cột mã của ComboboxPanel).
  const nguoiChon: MucChon[] = nenTang.nhan_su.map((n) => ({ gt: n.email, nhan: n.ten }))
  const idCua = (email: string | null) => nenTang.nhan_su.find((n) => n.email === email)?.id
  const chinh = ct.assignees.find((a) => a.role === 'owner')
  async function doiChinh(email: string | null) {
    const id = idCua(email)
    if (!id) throw new Error('không tìm thấy nhân sự')
    try {
      await doiNguoiChinh(t.id, ct.assignees, id)
    } finally {
      await sau()
    }
  }
  const chanMo = ct.chan_boi.filter((b) => !roi(b.status))
  const uu = UU.find((u) => u.gt === String(t.priority))?.nhan
  const cha = t.parent_id
  const mucTeam: MucNhan<string>[] = [
    { gt: '', chu: 'Không team', nhan: <Badge variant="outline">Không team</Badge> },
    ...nenTang.teams.map((tm) => ({ gt: String(tm.id), chu: tm.name, nhan: <Badge variant="soft">{tm.name}</Badge> })),
  ]

  return (
    <div className="border-none border-current">
      {chanMo.length > 0 && (
        <Alert color="warning" role="note" className="mb-2">
          <AlertTitle>{chanMo.length === 1 ? `Chờ ${chanMo[0].ref} xong trước` : `Chờ ${chanMo.length} việc xong trước`}</AlertTitle>
          <AlertDescription>{chanMo.map((b) => b.title).join(' · ')} — chưa đánh dấu xong được việc này.</AlertDescription>
        </Alert>
      )}
      <Accordion type="multiple" defaultValue={['viec', 'mo-ta', 'he-thong']}>
        <AccordionItem value="viec">
          <AccordionTrigger>Việc</AccordionTrigger>
          <AccordionContent>
            <PropertyList>
              <Truong icon={ic(CircleHalf)} nhan="Trạng thái">
                <OSuaTrangThai ma={t.ref} value={{ tt: t.status }} muc={TT} onLuu={(g) => luu(doiTrangThai(t.id, g.tt))} />
              </Truong>
              <Truong icon={ic(Flag)} nhan="Ưu tiên">
                {sua ? (
                  <OSuaNhan
                    ma={t.ref}
                    truong="ưu tiên"
                    value={String(t.priority) as Uu}
                    muc={UU}
                    onLuu={(u) => luu(suaViec(t.id, { priority: Number(u) }))}
                  />
                ) : (
                  uu
                )}
              </Truong>
              <Truong icon={ic(CalendarBlank)} nhan="Hạn">
                {sua ? (
                  <span className={CUM}>
                    <OSuaHan
                      ma={t.ref}
                      gioMacDinh="17:00"
                      value={hanO(t.due_at)}
                      onLuu={(h) => luu(suaViec(t.id, h ? { due: hanLuu(h) } : { xoa_due: true }))}
                      hien={(v) => <HanChu due={v ? hanLuu(v) : null} />}
                    />
                    {t.due_at && (
                      <NutIcon nhan="Bỏ hạn" onClick={() => void chay(suaViec(t.id, { xoa_due: true }), 'bỏ hạn')}>
                        <X aria-hidden="true" />
                      </NutIcon>
                    )}
                  </span>
                ) : (
                  t.due_at && <HanChu due={t.due_at} />
                )}
              </Truong>
              <Truong icon={ic(User)} nhan="Người chính">
                {sua ? (
                  <OSuaNguoi ma={t.ref} truong="người chính" value={chinh?.email ?? null} options={nguoiChon} onLuu={doiChinh} />
                ) : (
                  chinh && <Nguoi ten={chinh.ten} />
                )}
              </Truong>
              {VAI_PHU.map(({ v, ten, icon }) => {
                const ds = ct.assignees.filter((a) => a.role === v)
                return (
                  <Truong key={v} icon={icon} nhan={ten}>
                    {(ds.length > 0 || sua) && (
                      <span className={DOC}>
                        {ds.map((a) => (
                          <span key={a.staff_id} className={DONG_NGUOI}>
                            <Nguoi ten={a.ten} />
                            {sua && ct.assignees.length > 1 && (
                              <NutIcon
                                nhan={`Bỏ ${a.ten} khỏi việc`}
                                className={AN_CHO_RE}
                                onClick={() => void chay(boNguoi(t.id, a.staff_id), `bỏ ${a.ten}`)}
                              >
                                <X aria-hidden="true" />
                              </NutIcon>
                            )}
                          </span>
                        ))}
                        {sua && (
                          <NutChon
                            nhan={`Thêm người ${ten.toLowerCase()}`}
                            chu="Thêm người"
                            options={nguoiChon.filter((m) => m.gt !== chinh?.email && !ds.some((a) => a.email === m.gt))}
                            onChon={(m) => {
                              const id = idCua(m.gt)
                              if (id) void chay(ganNguoi(t.id, id, v), `thêm ${m.nhan}`)
                            }}
                          />
                        )}
                      </span>
                    )}
                  </Truong>
                )
              })}
              <Truong icon={ic(UsersThree)} nhan="Team">
                {sua ? (
                  <OSuaNhan
                    ma={t.ref}
                    truong="team"
                    value={String(t.team_id ?? '')}
                    muc={mucTeam}
                    onLuu={(v) => luu(suaViec(t.id, v ? { team_id: Number(v) } : { xoa_team: true }))}
                  />
                ) : (
                  t.team_name
                )}
              </Truong>
              {cha !== null && (
                <Truong icon={ic(TreeStructure)} nhan="Việc cha">
                  <Button variant="link" className="min-w-0 text-left" onClick={() => onMoViec(cha)}>
                    <span className={cat}>
                      {t.parent_ref} {t.parent_title}
                    </span>
                  </Button>
                </Truong>
              )}
            </PropertyList>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="mo-ta">
          <AccordionTrigger>Mô tả</AccordionTrigger>
          <AccordionContent>
            {sua ? (
              <Textarea
                key={t.description ?? ''}
                defaultValue={t.description ?? ''}
                aria-label="Mô tả"
                placeholder="Thêm mô tả…"
                rows={3}
                onBlur={(e) => {
                  if (e.target.value !== (t.description ?? '')) void chay(suaViec(t.id, { description: e.target.value }), 'lưu mô tả')
                }}
              />
            ) : (
              <p className="m-0 border-none border-current whitespace-pre-wrap">
                {t.description || <span className="text-(--color-text-tertiary)">—</span>}
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="he-thong">
          <AccordionTrigger>Hệ thống</AccordionTrigger>
          <AccordionContent>
            <PropertyList>
              <Truong icon={ic(UserCircle)} nhan="Người tạo">
                {t.creator_ten}
              </Truong>
              <Truong icon={ic(Clock)} nhan="Ngày tạo">
                <span className="tabular-nums">{hienNgay(t.created_at, 'gio')}</span>
              </Truong>
              <Truong icon={ic(Sparkle)} nhan="Nguồn">
                {t.origin === 'manual' ? 'Tạo tay' : 'Tự sinh'}
              </Truong>
              <Truong icon={ic(Globe)} nhan="Ai xem được">
                {PHAM_VI[t.visibility] ?? t.visibility}
              </Truong>
              <Truong icon={ic(ShieldCheck)} nhan="Quyền của bạn">
                {/* Ngắn cho vừa một dòng (dòng nhiều dòng lệch tâm nhãn). */}
                {sua ? 'Sửa được' : 'Chỉ xem — không phải người làm'}
              </Truong>
            </PropertyList>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

/** Việc con: tiến độ · tick xong ngay tại đây · mở việc con · thêm việc con. */
function ViecCon({ c }: { c: Ctx }) {
  const { ct, sua, chay, onMoViec } = c
  const t = ct.task
  const so = ct.subtasks.length
  const them = sua && <ThemViecCon onThem={(title) => chay(taoViecCon(t.id, title), 'thêm việc con')} />
  if (!so)
    return (
      <EmptyState size="sm" tieuDe="Chưa có việc con" moTa="Chia việc thành các đầu mục nhỏ, tick xong ngay tại đây.">
        {them}
      </EmptyState>
    )
  return (
    <div className={COT}>
      <p className={cn(PHU, 'm-0 tabular-nums')}>
        {ct.subtasks.filter((s) => s.status === 'done').length}/{so} xong
      </p>
      <div className="flex flex-col gap-2 border-none border-current">
        {ct.subtasks.map((s) => (
          <div key={s.id} className="flex min-w-0 items-center gap-2 border-none border-current">
            {/* Tick ngay tại đây — việc con thường là đầu mục 10 giây, không đáng mở thẻ riêng. */}
            <ChoiceLabel className="min-w-0 flex-1">
              <Checkbox
                checked={s.status === 'done'}
                disabled={!sua}
                onCheckedChange={(v) =>
                  void chay(doiTrangThai(s.id, v === true ? 'done' : 'todo'), v === true ? `đánh dấu xong ${s.ref}` : `bỏ xong ${s.ref}`)
                }
              />
              <span className={cn(cat, s.status === 'done' && 'text-muted-foreground')}>{s.title}</span>
            </ChoiceLabel>
            <MoViec v={s} onMo={() => onMoViec(s.id)} />
          </div>
        ))}
      </div>
      {them}
    </div>
  )
}

/** Hoạt động = nhật ký + bình luận (cũ → mới) · ô bình luận @nhắc tên. */
function HoatDong({ c }: { c: Ctx }) {
  const { ct, nenTang, sau } = c
  const t = ct.task
  // Bỏ dòng nhật ký "bình luận"/"nhắc" — bình luận đã hiện đủ (tên nhắc tô đậm).
  const muc: MucTimeline[] = [
    ...ct.activity
      .filter((a) => a.verb !== 'commented' && a.verb !== 'mentioned')
      .map((a) => ({ id: `a${a.id}`, ai: a.ten ?? 'Hệ thống', loai: moTaNhatKy(a.verb, a.payload), luc: a.created_at })),
    ...ct.comments.map((cm) => ({
      id: `c${cm.id}`,
      ai: cm.ten ?? '?',
      loai: 'bình luận',
      luc: cm.created_at,
      noiDung: chiaTheoNhac(cm.body, cm.nhac_ten ?? []).map((m, i) =>
        m.nhac ? (
          <strong key={i} className="font-semibold">
            {m.text}
          </strong>
        ) : (
          <Fragment key={i}>{m.text}</Fragment>
        ),
      ),
    })),
  ].sort((a, b) => Date.parse(a.luc) - Date.parse(b.luc))
  return (
    <div className={COT}>
      <Timeline muc={muc} hien={8} aria-label={`Hoạt động ${t.ref}`} />
      <BinhLuan
        nhanSu={nenTang.nhan_su}
        onGui={async (body, nhac) => {
          const kq = await themBinhLuan(t.id, body, nhac)
          if (!kq.ok) throw new Error(kq.loi)
          await sau()
        }}
      />
    </div>
  )
}

/** Liên kết: gắn khách / ticket / đơn ERP · phụ thuộc hai chiều (phải xong trước · đang chặn). */
function LienKet({ c }: { c: Ctx }) {
  const { ct, sua, chay, onMoViec } = c
  const t = ct.task
  const khachGan = ct.links.find((l) => l.loai === 'khach')
  const chanKhoa = ct.chan_boi.map((b) => b.id).join(',')
  // `tim` của ComboboxPanel phải giữ tham chiếu (useTimXa) → tạo một lần theo việc + danh sách chặn hiện có.
  const tim = useMemo(() => {
    const daCo = new Set(chanKhoa.split(',').filter(Boolean).map(Number))
    const erp = (loai: LoaiLink) => async (q: string): Promise<MucChon[]> => {
      const kq = await timErp(loai, q, t.id)
      if (!kq.ok) throw new Error(kq.loi)
      return kq.duLieu.map((g) => ({ gt: g.ma, nhan: g.nhan, phu: g.phu ?? undefined }))
    }
    const idViec = new Map<string, number>()
    return {
      khach: erp('khach'),
      ticket: erp('ticket'),
      don: erp('don'),
      /** Mã hiện ở cột mã là `ref`; id thật nhớ lại để thêm phụ thuộc. */
      viec: async (q: string): Promise<MucChon[]> => {
        const kq = await timViec(q, t.id)
        if (!kq.ok) throw new Error(kq.loi)
        return kq.duLieu
          .filter((v) => !daCo.has(v.id))
          .map((v) => {
            idViec.set(v.ref, v.id)
            return { gt: v.ref, nhan: v.title, phu: v.team_name ?? undefined }
          })
      },
      idViec: (ref: string) => idViec.get(ref),
    }
  }, [t.id, chanKhoa])

  return (
    <Accordion type="multiple" defaultValue={['gan', 'phu-thuoc']}>
      <AccordionItem value="gan">
        <AccordionTrigger>Gắn với</AccordionTrigger>
        <AccordionContent>
          <PropertyList>
            {LOAI.map((loai) => {
              const ds = ct.links.filter((l) => l.loai === loai)
              const ten = NHAN_LOAI_LINK[loai]
              return (
                <Truong key={loai} icon={ICON_LOAI[loai]} nhan={ten}>
                  {(ds.length > 0 || sua) && (
                    <span className={HANG}>
                      {ds.map((l) => {
                        const chip = nhanChip(l)
                        const href = chip.treo ? null : duongDanLink(l)
                        return (
                          <span key={l.id} className={CUM}>
                            {href ? (
                              <Link href={href} title={l.phu ?? undefined} className={cn(buttonVariants({ variant: 'link' }), 'min-w-0')}>
                                <span className={cat}>{chip.ten}</span>
                              </Link>
                            ) : (
                              // Mã treo (khách bị gộp/xoá): giữ để không mất dấu, nói rõ vì sao không bấm được.
                              <span title={chip.giaiThich ?? l.phu ?? undefined} className={cn(cat, 'text-muted-foreground')}>
                                {chip.ten} · đã gộp/xoá
                              </span>
                            )}
                            {sua && (
                              <NutIcon nhan={`Bỏ gắn ${ten.toLowerCase()} ${chip.ten}`} onClick={() => void chay(boErp(l.id), `bỏ gắn ${chip.ten}`)}>
                                <X aria-hidden="true" />
                              </NutIcon>
                            )}
                          </span>
                        )
                      })}
                      {sua && (
                        <NutChon
                          nhan={`Gắn ${ten.toLowerCase()}`}
                          chu={`Gắn ${ten.toLowerCase()}`}
                          tim={tim[loai]}
                          // Ticket/đơn chỉ tìm trong khách đã gắn — không nói ra thì "tìm mãi không thấy" trông như hỏng.
                          goiY={loai !== 'khach' && khachGan ? `${ten} của khách ${nhanChip(khachGan).ten} — bỏ khách để tìm rộng` : CHO_TRONG[loai]}
                          onChon={(m) => void chay(ganErp(t.id, loai, m.gt), `gắn ${m.nhan}`)}
                        />
                      )}
                    </span>
                  )}
                </Truong>
              )
            })}
          </PropertyList>
        </AccordionContent>
      </AccordionItem>
      {(ct.chan_boi.length > 0 || ct.dang_chan.length > 0 || sua) && (
        <AccordionItem value="phu-thuoc">
          <AccordionTrigger>Phụ thuộc</AccordionTrigger>
          <AccordionContent>
            <PropertyList>
              {(ct.chan_boi.length > 0 || sua) && (
                <Truong icon={<HourglassMedium aria-hidden="true" />} nhan="Phải xong trước">
                  <span className="flex w-full min-w-0 flex-col gap-1 border-none border-current">
                    {ct.chan_boi.map((b) => (
                      <DongViec key={b.id} v={b} onMo={() => onMoViec(b.id)}>
                        {sua && (
                          <NutIcon nhan={`Bỏ phụ thuộc ${b.ref}`} onClick={() => void chay(boPhuThuoc(t.id, b.id), `bỏ phụ thuộc ${b.ref}`)}>
                            <X aria-hidden="true" />
                          </NutIcon>
                        )}
                      </DongViec>
                    ))}
                    {sua && (
                      <span className={CUM}>
                        <NutChon
                          nhan="Thêm việc phải xong trước"
                          chu="Thêm việc"
                          tim={tim.viec}
                          goiY="Tiêu đề hoặc mã việc (việc đã xong/huỷ không hiện)"
                          onChon={(m) => {
                            const id = tim.idViec(m.gt)
                            if (id) void chay(themPhuThuoc(t.id, id), `thêm phụ thuộc ${m.gt}`)
                          }}
                        />
                      </span>
                    )}
                  </span>
                </Truong>
              )}
              {/* Chiều ngược lại: không có nó thì hoãn một việc mà không biết mình làm kẹt ai. */}
              <Truong icon={<Prohibit aria-hidden="true" />} nhan="Đang chặn">
                {ct.dang_chan.length > 0 && (
                  <span className="flex w-full min-w-0 flex-col gap-1 border-none border-current">
                    {ct.dang_chan.map((b) => (
                      <DongViec key={b.id} v={b} onMo={() => onMoViec(b.id)} />
                    ))}
                  </span>
                )}
              </Truong>
            </PropertyList>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  )
}

/** Chân thẻ: nút chính Đánh dấu xong / Bỏ đánh dấu xong (viền). Bỏ ⋮ "Sao chép mã" (CEO 27/11: "hơi thừa"). */
function Chan({ c }: { c: Ctx }) {
  const { ct, chay } = c
  const t = ct.task
  const [dang, setDang] = useState(false)
  const xong = t.status === 'done'
  const chanMo = ct.chan_boi.some((b) => !roi(b.status))
  return (
    <>
      <Button
        variant={xong ? 'outline' : 'default'}
        loading={dang}
        disabled={!xong && chanMo}
        onClick={async () => {
          setDang(true)
          const ok = await chay(doiTrangThai(t.id, xong ? 'todo' : 'done'), xong ? 'bỏ đánh dấu xong' : 'đánh dấu xong')
          setDang(false)
          if (ok && !xong)
            thongBao.xong(`${t.ref}: đã xong`, {
              hoanTac: () => void chay(doiTrangThai(t.id, t.status), 'hoàn tác'),
            })
        }}
      >
        <Check aria-hidden="true" />
        {xong ? 'Bỏ đánh dấu xong' : 'Đánh dấu xong'}
      </Button>
    </>
  )
}

function Nguoi({ ten }: { ten: string }) {
  return (
    <span className={nguoi}>
      <Avatar aria-hidden="true">
        <AvatarFallback>{chuCaiDau(ten)}</AvatarFallback>
      </Avatar>
      <span className={cat}>{ten}</span>
    </span>
  )
}

/** Nút icon ghost xs + tooltip (chữ tooltip trùng tên nút → aria-hidden, không đọc hai lần). */
function NutIcon({
  nhan,
  onClick,
  className,
  children,
}: {
  nhan: string
  onClick: () => void
  className?: string
  children: ReactElement
}) {
  return (
    <TooltipNhanh content={<span aria-hidden="true">{nhan}</span>}>
      <Button variant="ghost" size="icon-xs" aria-label={nhan} className={className} onClick={onClick}>
        {children}
      </Button>
    </TooltipNhanh>
  )
}

/**
 * Nút phẳng "+ Thêm …" mở pop chọn có tìm (Popover + ComboboxPanel — như OSuaNguoi, nhưng trigger là nút thêm). Có
 * chữ (CEO 23/11: nút "+" trơn khó bấm, không biết thêm gì); `chu` là phần đầu của `nhan` (nhãn đọc chứa chữ đang thấy).
 */
function NutChon({
  nhan,
  chu,
  options,
  tim,
  goiY,
  onChon,
}: {
  nhan: string
  chu: string
  options?: MucChon[]
  tim?: (q: string) => Promise<MucChon[]>
  goiY?: string
  onChon: (m: MucChon) => void
}) {
  const [mo, setMo] = useState(false)
  return (
    <Popover open={mo} onOpenChange={setMo}>
      <PopoverTrigger asChild>
        {/* Nút phẳng (ghost): chữ mờ tertiary (mờ hơn nhãn), rê mới hiện nền + chữ sáng — CEO 23/11. Lề âm = đúng đệm trái size xs → icon
            thẳng cột giá trị (nền rê tràn ra trái, như Linear). */}
        <Button variant="ghost" size="xs" className={nutThem} aria-label={nhan}>
          <Plus aria-hidden="true" />
          {chu}
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label={nhan} align="start" className={KHUNG_CHON}>
        <ComboboxPanel
          value={null}
          options={options}
          tim={tim}
          searchPlaceholder={goiY}
          onSelect={(m) => {
            setMo(false)
            onChon(m)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/** Mã việc + nút mở việc đó (việc con, việc chặn). */
function MoViec({ v, onMo }: { v: ViecNho; onMo: () => void }) {
  return (
    <>
      <span className={cn(PHU, 'shrink-0 tabular-nums')}>{v.ref}</span>
      <NutIcon nhan={`Mở ${v.ref}`} onClick={onMo}>
        <ArrowRight aria-hidden="true" />
      </NutIcon>
    </>
  )
}

function DongViec({ v, onMo, children }: { v: ViecNho; onMo: () => void; children?: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-2 border-none border-current">
      <ChipTrangThai muc={mucTT(v.status)} value={{ tt: v.status }} />
      <span className={cn(cat, 'flex-1')}>{v.title}</span>
      <MoViec v={v} onMo={onMo} />
      {children}
    </span>
  )
}

/**
 * Giá trị dòng "Tiêu đề": xuống dòng đủ (không cắt — đầu thẻ chỉ hiện một dòng) + nút bút → ô nhập DS. Enter / rời ô
 * lưu, Esc huỷ, focus về nút bút.
 * Không dùng OSuaChu: ô đó cắt một dòng ≤ 280px (ô bảng), tiêu đề thẻ phải hiện trọn — xem đề xuất DS.
 */
function TieuDe({ value, sua, onLuu, lon }: { value: string; sua: boolean; onLuu: (v: string) => Promise<boolean>; lon?: boolean }) {
  // `lon`: tiêu đề lớn của thẻ (cỡ chữ do khung `xnTieuDe` quyết) — không ép 500 / đệm dòng thuộc tính.
  const chu = lon ? 'min-w-0 [overflow-wrap:anywhere] border-none border-current' : TEN
  const [nhap, setNhap] = useState<string | null>(null)
  const dang = useRef(false)
  const traFocus = useRef(false)
  const nut = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => {
    if (nhap === null && traFocus.current) {
      traFocus.current = false
      nut.current?.focus()
    }
  }, [nhap])
  if (!sua) return <span className={cn(chu, !lon && 'py-1.5')}>{value}</span>
  // Gọi một lần mỗi lượt sửa (Enter rồi ô bị gỡ có thể bắn thêm blur).
  const ket = (luuLai: boolean, focusVe: boolean) => {
    if (!dang.current || nhap === null) return
    dang.current = false
    traFocus.current = focusVe
    const v = nhap.trim()
    setNhap(null)
    if (luuLai && v && v !== value) void onLuu(v)
  }
  if (nhap !== null)
    return (
      <Input
        autoFocus
        aria-label="Tiêu đề việc"
        className={lon ? 'text-[20px] font-semibold' : undefined}
        value={nhap}
        onChange={(e) => setNhap(e.target.value)}
        onBlur={() => ket(true, false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            ket(true, true)
          } else if (e.key === 'Escape') {
            e.preventDefault()
            ket(false, true)
          }
        }}
      />
    )
  return (
    <div className="flex w-full min-w-0 items-start gap-1 border-none border-current">
      {/* Dòng đầu thẳng tâm nhãn (dòng 32): chữ đệm 6 trên/dưới (6 + 20/2 = 16), nút bút 28 lùi 2 (2 + 28/2 = 16). */}
      <span className={cn(chu, 'flex-1', !lon && 'py-1.5')}>{value}</span>
      <TooltipNhanh content={<span aria-hidden="true">Sửa tiêu đề</span>}>
        <Button
          ref={nut}
          variant="ghost"
          size="icon-sm"
          className={lon ? undefined : 'mt-0.5'}
          aria-label="Sửa tiêu đề"
          onClick={() => {
            dang.current = true
            setNhap(value)
          }}
        >
          <PencilSimple aria-hidden="true" />
        </Button>
      </TooltipNhanh>
    </div>
  )
}

/** "+ Thêm việc con" → ô nhập DS; Enter thêm (ô giữ mở để thêm tiếp), Esc / rời ô trống thì thôi. */
function ThemViecCon({ onThem }: { onThem: (title: string) => Promise<boolean> }) {
  const [mo, setMo] = useState(false)
  const [daDong, setDaDong] = useState(false)
  const [chu, setChu] = useState('')
  const dong = () => {
    setMo(false)
    setChu('')
    setDaDong(true)
  }
  if (!mo)
    return (
      <Button variant="ghost" size="sm" className="mt-2 text-(--color-text-tertiary)" autoFocus={daDong} onClick={() => setMo(true)}>
        <Plus aria-hidden="true" />
        Thêm việc con
      </Button>
    )
  return (
    <form
      className="mt-2 border-none border-current"
      onSubmit={async (e) => {
        e.preventDefault()
        const title = chu.trim()
        if (title && (await onThem(title))) setChu('')
      }}
    >
      <Input
        autoFocus
        aria-label="Tiêu đề việc con"
        placeholder="Tiêu đề việc con — Enter để thêm"
        value={chu}
        onChange={(e) => setChu(e.target.value)}
        onBlur={() => {
          if (!chu.trim()) {
            setMo(false)
            setChu('')
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            dong()
          }
        }}
      />
    </form>
  )
}

/**
 * Composer DS + gợi ý @tên (Popover + Command, focus giữ ở ô chữ). Composer chưa có `value` điều khiển được → chèn tên
 * bằng cách dựng lại Composer (`key`) với `defaultValue` mới rồi đặt lại con trỏ — xem đề xuất DS.
 * Chỉ gửi người mà "@Tên" VẪN CÒN trong câu (gõ rồi xoá thì không nhắc nữa). Enter/Tab khi đang gợi ý = chọn mục đầu.
 */
function BinhLuan({
  nhanSu,
  onGui,
}: {
  nhanSu: NenTang['nhan_su']
  onGui: (body: string, nhac: string[]) => Promise<void>
}) {
  const [phien, setPhien] = useState(0)
  const [nhap, setNhap] = useState('')
  const [daNhac, setDaNhac] = useState<Record<string, string>>({})
  const [goiY, setGoiY] = useState<{ tuKhoa: string; batDau: number; caret: number; body: string } | null>(null)
  const [loi, setLoi] = useState<string>()
  const khung = useRef<HTMLDivElement>(null)

  const tk = goiY ? boDau(goiY.tuKhoa) : ''
  const ds = goiY ? nhanSu.filter((n) => boDau(n.ten).includes(tk)).slice(0, 6) : []

  const doc = (el: EventTarget) => {
    if (!(el instanceof HTMLTextAreaElement)) return
    const c = el.selectionStart ?? el.value.length
    const tok = tokenNhac(el.value, c)
    setGoiY(tok ? { ...tok, caret: c, body: el.value } : null)
  }
  const chon = (n: { id: string; ten: string }) => {
    if (!goiY) return
    const r = chenNhac(goiY.body, goiY.batDau, goiY.caret, n.ten)
    setDaNhac((cu) => ({ ...cu, [n.ten]: n.id }))
    setNhap(r.body)
    setGoiY(null)
    setPhien((p) => p + 1)
    requestAnimationFrame(() => {
      const o = khung.current?.querySelector('textarea')
      o?.focus()
      o?.setSelectionRange(r.caret, r.caret)
    })
  }

  return (
    <Popover open={ds.length > 0} onOpenChange={(m) => !m && setGoiY(null)}>
      <PopoverAnchor asChild>
        <div
          ref={khung}
          className="border-none border-current"
          onInput={(e) => doc(e.target)}
          onBlur={() => setGoiY(null)}
          onKeyDownCapture={(e) => {
            if (!ds.length) return
            if (e.key === 'Enter' || e.key === 'Tab') {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              e.stopPropagation()
              chon(ds[0])
            } else if (e.key === 'Escape') {
              e.preventDefault()
              setGoiY(null)
            }
          }}
        >
          <Composer
            key={phien}
            defaultValue={nhap}
            tep={false}
            loi={loi}
            aria-label="Viết bình luận"
            placeholder="Bình luận — gõ @ để nhắc tên"
            onGui={async (body) => {
              const nhac = Object.entries(daNhac)
                .filter(([ten]) => body.includes(`@${ten}`))
                .map(([, id]) => id)
              try {
                await onGui(body, nhac)
              } catch (e) {
                setLoi(`Chưa gửi được — ${e instanceof Error ? e.message : 'lỗi không rõ'}`)
                throw e
              }
              setLoi(undefined)
              setDaNhac({})
              setNhap('')
            }}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="start"
        aria-label="Nhắc tên"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={cn(menuContent, 'w-[240px] max-w-[calc(100vw-16px)]')}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {ds.map((n) => (
              <CommandItem key={n.id} value={n.id} onMouseDown={(e) => e.preventDefault()} onSelect={() => chon(n)}>
                <Avatar aria-hidden="true">
                  <AvatarFallback>{chuCaiDau(n.ten)}</AvatarFallback>
                </Avatar>
                <span className={cat}>{n.ten}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
