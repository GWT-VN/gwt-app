'use client'

// PROTOTYPE vứt đi — khung trang: 2 ngữ cảnh (#form, #o-bang) + bảng trạng thái + thanh đổi biến thể.
import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CaretLeft, CaretRight } from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { FormFooter, FormGrid, FormLayout, FormRequiredNote, FormSection } from '@/components/ui/form-layout'
import { Input } from '@/components/ui/input'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { ChonHanA } from './bien-the-a'
import { ChonHanB } from './bien-the-b'
import { ChonHanC } from './bien-the-c'
import { congNgay, ghepIso, GIO_MAC_DINH, hienThu, homNay, type PropsHan } from './gio'

export type MaBienThe = 'A' | 'B' | 'C'
const BIEN_THE: Record<MaBienThe, { ten: string; cach: string; C: ComponentType<PropsHan> }> = {
  A: {
    ten: 'A — giờ nằm trong pop lịch',
    cach: 'Bấm ô Hạn → pop: mốc nhanh, lịch tháng, dòng "Giờ" gõ được (1730, 9…) + gợi ý mỗi 30 phút, Xoá / Xong.',
    C: ChonHanA,
  },
  B: {
    ten: 'B — hai ô riêng: ngày + giờ',
    cach: 'Ô ngày = DatePicker DS; ô giờ cạnh bên gõ được + gợi ý. Chọn giờ trước khi có ngày → tự lấy hôm nay và nói rõ.',
    C: ChonHanB,
  },
  C: {
    ten: 'C — gõ chữ tự do',
    cach: 'Gõ "mai 15h", "thứ 2 9h", "25/11 14:30", "3h chiều mai" → dòng dưới đọc lại; Enter chốt. Nút lịch bên phải khi gõ không được.',
    C: ChonHanC,
  },
}
const THU_TU: MaBienThe[] = ['A', 'B', 'C']

type Dong = { ma: string; khach: string; viec: string; han: string | null }

function dongDau(): Dong[] {
  const nay = homNay()
  return [
    { ma: 'TK-1024', khach: 'Công ty Demo An Phát', viec: 'Máy lọc báo lỗi E3', han: ghepIso(nay, GIO_MAC_DINH) },
    { ma: 'TK-1025', khach: 'Công ty Demo Bình Minh', viec: 'Thay lõi định kỳ', han: ghepIso(congNgay(nay, 1), '09:00') },
    { ma: 'TK-1026', khach: 'Công ty Demo Cát Tường', viec: 'Lắp đặt máy mới', han: null },
    { ma: 'TK-1027', khach: 'Công ty Demo Đông Á', viec: 'Rò nước dưới tủ', han: ghepIso(congNgay(nay, 5), '14:30') },
  ]
}

/** "Surface the state": giá trị ISO đang lưu + chữ hiển thị. */
function TrangThai({ dong }: { dong: { nhan: string; han: string | null }[] }) {
  return (
    <Card className="flex flex-col gap-3 self-start bg-(--sidebar)">
      <div className="ds-heading-xs">Đang lưu</div>
      {dong.map((d) => (
        <div key={d.nhan} className="flex min-w-0 flex-col gap-0.5 border-none border-current">
          <span className="ds-text-xs text-muted-foreground">{d.nhan}</span>
          <code data-iso className="ds-text-xs font-mono break-all text-foreground">
            {d.han ?? 'null'}
          </code>
          <span className="ds-text-xs text-muted-foreground">{d.han ? hienThu(d.han) : 'chưa có hạn'}</span>
        </div>
      ))}
    </Card>
  )
}

function Khoi({ id, so, tieuDe, moTa, children }: { id: string; so: number; tieuDe: string; moTa: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 flex flex-col gap-3">
      <div className="border-none border-current">
        <h2 className="m-0 ds-heading-sm">
          <a href={`#${id}`} className="text-inherit no-underline hover:underline">
            {so}. {tieuDe}
          </a>
        </h2>
        <p className="m-0 mt-1 ds-text-sm text-muted-foreground">{moTa}</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_260px]">{children}</div>
    </section>
  )
}

export function TrangChonGio({ variant }: { variant: MaBienThe }) {
  const { ten, cach, C } = BIEN_THE[variant]
  const [hanForm, setHanForm] = useState<string | null>(null)
  const [dong, setDong] = useState(dongDau)
  const router = useRouter()
  const duong = usePathname()

  const sang = (buoc: number) => {
    const moi = THU_TU[(THU_TU.indexOf(variant) + buoc + 3) % 3]
    const q = new URLSearchParams(window.location.search)
    q.set('variant', moi)
    router.replace(`${duong}?${q}${window.location.hash}`, { scroll: false })
  }

  useEffect(() => {
    const nghe = (e: KeyboardEvent) => {
      if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select, [contenteditable=true], [role=dialog], [role=grid], [role=listbox], [role=menu]')) return
      sang(e.key === 'ArrowLeft' ? -1 : 1)
    }
    window.addEventListener('keydown', nghe)
    return () => window.removeEventListener('keydown', nghe)
  })

  return (
    <>
      <div className="mx-auto flex max-w-[1080px] flex-col gap-10 px-4 pt-6 pb-32 md:px-6 md:pt-8">
        <header className="flex flex-col gap-2 border-none border-current">
          <div className="flex flex-wrap items-center gap-2 border-none border-current">
            <Badge color="warning">Prototype vứt đi</Badge>
            <Badge color="info">Phương án {variant}</Badge>
          </div>
          <h1 className="m-0 ds-heading-lg">Chọn hạn có giờ — 3 phương án</h1>
          <p className="m-0 max-w-[72ch] ds-text-sm text-muted-foreground">
            Cùng một hạn xử lý, ba cách chọn. Đổi phương án bằng thanh dưới đáy hoặc phím <Kbd>←</Kbd> <Kbd>→</Kbd>. Giá trị lưu
            là chuỗi ISO có múi <code className="font-mono">+07:00</code>, giờ 24h, gõ được phút lẻ (14:45).
          </p>
          <p className="m-0 ds-text-sm font-medium text-(--color-text-warning)">
            Giờ mặc định tạm {GIO_MAC_DINH} — chờ CEO chốt (chỉ chọn ngày, chưa chọn giờ → lấy giờ này).
          </p>
          <Card className="mt-2">
            <div className="ds-heading-xs">{ten}</div>
            <p className="m-0 mt-1 ds-text-sm text-muted-foreground">{cach}</p>
          </Card>
        </header>

        <Khoi id="form" so={1} tieuDe="Trong form Tạo ticket" moTa="Trường Hạn xử lý trong form thật (FormLayout · Field · Input DS).">
          <Card className="p-5 md:p-6">
            <FormLayout onSubmit={(e) => e.preventDefault()}>
              <FormSection tieuDe="Tạo ticket">
                <FormRequiredNote />
                <FormGrid>
                  <Field>
                    <FieldLabel htmlFor="f-khach" required>
                      Khách hàng
                    </FieldLabel>
                    <Input id="f-khach" required defaultValue="Công ty Demo An Phát" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="f-han">Hạn xử lý</FieldLabel>
                    <C key={variant} id="f-han" value={hanForm} onValueChange={setHanForm} />
                  </Field>
                  <Field data-span="full">
                    <FieldLabel htmlFor="f-tieu-de" required>
                      Tiêu đề
                    </FieldLabel>
                    <Input id="f-tieu-de" required defaultValue="Máy lọc báo lỗi E3 sau khi thay lõi" />
                    <FieldDescription>Ô thường để so độ cao, độ đậm chữ với ô Hạn.</FieldDescription>
                  </Field>
                </FormGrid>
              </FormSection>
              <FormFooter trangThai="Prototype — không lưu thật">
                <Button type="button" variant="outline">
                  Huỷ
                </Button>
                <Button type="submit">Tạo ticket</Button>
              </FormFooter>
            </FormLayout>
          </Card>
          <TrangThai dong={[{ nhan: 'Hạn xử lý', han: hanForm }]} />
        </Khoi>

        <Khoi id="o-bang" so={2} tieuDe="Ô Hạn sửa tại chỗ trong bảng" moTa="Cột Hạn hẹp 120px như bảng ticket; bấm ô để sửa.">
          <Card className="p-0 overflow-hidden">
            <TableWrap>
              <Table layout="fixed" className="min-w-[520px]">
                <colgroup>
                  <col className="w-[84px]" />
                  <col />
                  <col />
                  <col className="w-[120px]" />
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Khách</TableHead>
                    <TableHead>Việc</TableHead>
                    <TableHead>Hạn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dong.map((d, i) => (
                    <TableRow key={d.ma}>
                      <TableCell className="tabular-nums text-muted-foreground">{d.ma}</TableCell>
                      <TableCell className="truncate">{d.khach}</TableCell>
                      <TableCell className="truncate">{d.viec}</TableCell>
                      <TableCell data-o-han={d.ma}>
                        <C
                          key={variant}
                          gon
                          ma={d.ma}
                          value={d.han}
                          onValueChange={(han) => setDong((ds) => ds.map((x, j) => (j === i ? { ...x, han } : x)))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Card>
          <TrangThai dong={dong.map((d) => ({ nhan: `${d.ma} · ${d.khach}`, han: d.han }))} />
        </Khoi>
      </div>

      {/* Thanh đổi biến thể: z-55 (lớp bulkbar, dưới dialog 70 / menu 90 — thang z ds/NGUON.md). */}
      <nav
        aria-label="Đổi phương án"
        className={cn(
          'fixed bottom-4 left-1/2 z-55 flex -translate-x-1/2 items-center gap-1 rounded-(--radius-full) p-1',
          'max-w-[calc(100vw-16px)] border-none border-current bg-popover text-popover-foreground',
          '[box-shadow:var(--shadow),var(--shadow-hairline)]',
        )}
      >
        <Button variant="ghost" size="icon-sm" aria-label="Phương án trước" onClick={() => sang(-1)}>
          <CaretLeft />
        </Button>
        <span aria-live="polite" className="min-w-0 truncate px-1 ds-text-sm font-medium">
          {ten}
        </span>
        <KbdGroup className="ml-1 max-md:hidden">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
        </KbdGroup>
        <Button variant="ghost" size="icon-sm" aria-label="Phương án sau" onClick={() => sang(1)}>
          <CaretRight />
        </Button>
      </nav>
    </>
  )
}
