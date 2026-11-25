'use client'

// PROTOTYPE vứt đi — PA D "Chat với khách" (kiểu Zalo/Intercom): khung tin nhắn chiếm gần hết chiều cao màn. Khách báo
// (từng lần lỗi) = bong bóng TRÁI xám; xử lý gửi khách = PHẢI đậm; ghi chú nội bộ = PHẢI viền + khoá + nhãn "Nội bộ";
// dòng máy / chi phí = mốc hệ thống (Marker). Đầu trang 1 dòng; thuộc tính đầy đủ nằm trong Sheet "Chi tiết".
import type { ReactNode } from 'react'
import { Lock, Paperclip, Receipt, SlidersHorizontal, Wrench } from '@phosphor-icons/react/ssr'
import { Avatar, AvatarFallback, chuCaiDau } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  cacLan,
  CanhBao,
  ChiPhiGon,
  DongMayLoi,
  ngayVN,
  NhomLoi,
  NutLichKT,
  OKhan,
  OTrangThai,
  TTKhachMay,
  TTXuLy,
  useGhiChuMoi,
  type DuLieuCt,
} from './chung'

// ponytail: giờ VN cố định UTC+7 (như Timeline DS).
const vn = (iso: string) => new Date(Date.parse(iso) + 7 * 3600e3).toISOString()
const gio = (iso: string) => vn(iso).slice(11, 16)

type Tin =
  | { id: string; luc: string; kieu: 'khach'; ten: string; dau: string; noiDung: ReactNode }
  | { id: string; luc: string; kieu: 'xuLy' | 'noiBo'; ten: string; dau: string; noiDung: ReactNode; tep?: { ten: string; href?: string }[] }
  | { id: string; luc: string; kieu: 'moc'; icon: ReactNode; chu: string }

function dsTin(d: DuLieuCt, moi: ReturnType<typeof useGhiChuMoi>['moi']): Tin[] {
  const { t } = d
  const khach = t.customer_name ?? 'Khách'
  const ds: Tin[] = []
  cacLan(d).forEach((l, i) => {
    const luc = i === 0 ? t.created_at : d.lanLoi[i - 1].created_at
    if (l.khach)
      ds.push({ id: `kb-${l.so}`, luc, kieu: 'khach', ten: khach, dau: `Lần ${l.so} · báo ngày ${ngayVN(l.ngay)}`, noiDung: l.khach })
    // Xử lý không có mốc riêng → đặt ngay sau lời khách báo cùng lần (+1ms).
    if (l.xuLy)
      ds.push({ id: `xl-${l.so}`, luc: new Date(Date.parse(luc) + 1).toISOString(), kieu: 'xuLy', ten: t.cs_ten ?? 'CSKH', dau: `Xử lý lần ${l.so}`, noiDung: l.xuLy })
  })
  for (const n of d.notes)
    ds.push({
      id: n.id,
      luc: n.created_at,
      kieu: 'noiBo',
      ten: n.tac_gia ?? 'Không rõ',
      dau: 'Ghi chú nội bộ',
      noiDung: n.noi_dung,
      tep: d.tepNK.filter((f) => f.note_id === n.id).map((f) => ({ ten: f.ten, href: f.url ?? undefined })),
    })
  for (const m of d.dongMay)
    ds.push({ id: `may-${m.id}`, luc: m.created_at, kieu: 'moc', icon: <Wrench />, chu: `Ghi lỗi ${m.loi_ten ?? m.loi_code}` })
  for (const i of d.items)
    ds.push({
      id: `cp-${i.id}`,
      luc: i.created_at,
      kieu: 'moc',
      icon: <Receipt />,
      chu: `${i.tac_gia ?? 'CSKH'} thêm ${(i.catalog_code && d.tenCatalog[i.catalog_code]) || i.mo_ta || 'chi phí'}`,
    })
  for (const m of moi)
    ds.push({ id: m.id, luc: m.luc, kieu: 'noiBo', ten: m.ai, dau: 'Ghi chú nội bộ', noiDung: m.noiDung, tep: m.tep })
  return ds.sort((a, b) => Date.parse(a.luc) - Date.parse(b.luc))
}

function MotTin({ tin }: { tin: Exclude<Tin, { kieu: 'moc' }> }) {
  const minh = tin.kieu !== 'khach'
  return (
    <Message align={minh ? 'end' : 'start'}>
      <MessageAvatar>
        <Avatar size="lg">
          <AvatarFallback>{chuCaiDau(tin.ten)}</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <MessageHeader className="gap-1.5">
          {tin.kieu === 'noiBo' && <Lock aria-hidden="true" />}
          {tin.ten} · {tin.dau}
        </MessageHeader>
        {/* Khách = secondary (xám, như app chat); xử lý gửi khách = default (đậm); nội bộ = outline + khoá + nhãn "Nội bộ". */}
        <Bubble variant={tin.kieu === 'khach' ? 'secondary' : tin.kieu === 'xuLy' ? 'default' : 'outline'}>
          <BubbleContent className="whitespace-pre-line">{tin.noiDung}</BubbleContent>
        </Bubble>
        <MessageFooter className="gap-2">
          <span className="tabular-nums">{gio(tin.luc)}</span>
          {tin.kieu === 'noiBo' && (
            <Badge variant="soft" color="warning">
              Nội bộ
            </Badge>
          )}
          {'tep' in tin &&
            tin.tep?.map((f) => (
              <a key={f.ten} href={f.href} className="inline-flex items-center gap-1 text-inherit underline">
                <Paperclip aria-hidden="true" />
                {f.ten}
              </a>
            ))}
        </MessageFooter>
      </MessageContent>
    </Message>
  )
}

function ChiTiet({ d }: { d: DuLieuCt }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal aria-hidden="true" />
          Chi tiết
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{d.t.ticket_code}</SheetTitle>
          <SheetDescription>Thuộc tính, khách &amp; máy, chi phí. Sửa chỉ đổi trên màn (prototype).</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-6">
          <CanhBao d={d} />
          <TTXuLy d={d} />
          <TTKhachMay d={d} />
          <NhomLoi d={d} />
          <ChiPhiGon d={d} />
          <DongMayLoi d={d} />
        </SheetBody>
        <SheetFooter>
          <NutLichKT d={d} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function CtD({ d }: { d: DuLieuCt }) {
  const { t } = d
  const { moi, composer } = useGhiChuMoi()
  const tin = dsTin(d, moi)
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 border-none border-current">
      {/* Đầu trang 1 dòng: mã · khách · trạng thái · khẩn — còn lại trong "Chi tiết". */}
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-none border-current">
        <span className="ds-text-sm tabular-nums text-muted-foreground">{t.ticket_code}</span>
        <h1 className="m-0 min-w-0 truncate ds-heading-xs">{t.customer_name ?? 'Chưa gắn khách'}</h1>
        <OTrangThai d={d} />
        <OKhan d={d} />
        <span className="ml-auto border-none border-current">
          <ChiTiet d={d} />
        </span>
      </div>
      {/* ponytail: cao 70svh cố định — DS chưa có token "chiều cao vùng nội dung của khung" (còn mở). */}
      <div className="flex h-[70svh] flex-col overflow-hidden rounded-(--radius-xl) border border-solid border-(--border) bg-(--card)">
        <MessageScrollerProvider>
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport aria-label="Hội thoại với khách">
              <MessageScrollerContent className="gap-4 p-4">
                {tin.map((x, i) => {
                  const ngay = vn(x.luc).slice(0, 10)
                  const moc = i === 0 || ngay !== vn(tin[i - 1].luc).slice(0, 10)
                  return (
                    <MessageScrollerItem key={x.id} messageId={x.id}>
                      {moc && (
                        <Marker variant="separator" className="mb-4">
                          <MarkerContent>{ngayVN(ngay)}</MarkerContent>
                        </Marker>
                      )}
                      {x.kieu === 'moc' ? (
                        <Marker>
                          <MarkerIcon>{x.icon}</MarkerIcon>
                          <MarkerContent>
                            {x.chu} · <span className="tabular-nums">{gio(x.luc)}</span>
                          </MarkerContent>
                        </Marker>
                      ) : (
                        <MotTin tin={x} />
                      )}
                    </MessageScrollerItem>
                  )
                })}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
        <div className="border-t border-solid border-(--border) p-3">{composer}</div>
      </div>
    </div>
  )
}
