'use client'

/**
 * "Việc tự sinh" v2 — chỉ ghép component DS: DataViewToolbar (tab Luật · Việc đã sinh, nút Chạy ngay) · Card +
 * SwitchRow (công tắc chung của bộ quét) · ListView luật (Switch bật/tắt, người nhận sửa tại chỗ, Sửa → Dialog
 * `SuaLuat`, Xem trước → Dialog danh sách sẽ sinh) · Table việc đã sinh (chọn dòng → `ThanhHangLoatViec`, mã → thẻ xem
 * nhanh `KhungXemViec`).
 * Thao tác sinh việc thật (bật bộ quét, chạy ngay) hỏi trước bằng ConfirmDialog.
 *
 * Bộ quét chạy dưới DB mỗi 15 phút, không phụ thuộc ai mở app; "Chạy ngay" chỉ để xem kết quả liền. Mỗi việc mang khoá
 * của sự kiện gốc nên chạy lại bao nhiêu lần cũng không đẻ trùng.
 * ponytail: mỗi tab một dạng xem (luật = Danh sách, việc = Bảng) — cụm dạng xem của DataViewToolbar không đổi gì ở màn
 * này (DS chưa cho ẩn cụm đó).
 */
import { useOptimistic, useState, useTransition, type MouseEvent, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Eye, PencilSimple, Play } from '@phosphor-icons/react/ssr'
import { KhungChon, OChonDong, OChonTatCa, ThanhDaChon, useDaChon } from '@/bang'
import type { MucChon } from '@/bang/OChonGoiY'
import {
  batTatLuat,
  batTatTuSinh,
  chayTuSinh,
  doiNguoiNhan,
  doiTrangThai,
  thuLuat,
  type LuatTuSinh,
  type ManTuSinh,
  type NenTang,
  type ThuLuat,
} from '@/app/work/actions'
import { Badge } from '@/components/ui/badge'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataViewToolbar, TrangDuLieu } from '@/components/ui/data-view-toolbar'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { OSuaNguoi, OSuaTrangThai } from '@/components/ui/inline-edit'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { ListView, NutMoMa, type CotDanhSach } from '@/components/ui/list-view'
import { thongBao } from '@/components/ui/sonner'
import { Switch, SwitchRow } from '@/components/ui/switch'
import { TooltipNhanh } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  BangTrangThai,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrap,
} from '@/components/ui/table'
import { CHON_BANG } from '@/components/ui/table-styles'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ngayThang, nhanChip } from '@/lib/work'
import { ThanhHangLoatViec } from './HangLoat'
import { KhungXemViec, useXemViec } from './KhungXemViec'
import { SuaLuat } from './SuaLuat'
import { chac, HanChu, NguoiChinh, TT, UU } from './chung'

type Tab = 'luat' | 'viec'
type ViecSinh = ManTuSinh['gan_day'][number]

/** Người nhận "mặc định" trong ô người: `gt` = `nhan` → ComboboxPanel không in mã đầu dòng. */
const MAC_DINH = 'Quản lý CSKH (mặc định)'

const MO_TA_BO_QUET = {
  bat:
    'Đang bật — cứ 15 phút một lần, việc mới tự sinh theo các luật đang bật bên dưới. ' +
    'Mỗi việc mang khoá của sự kiện gốc nên không sinh trùng.',
  tat:
    'Đang tắt — không có gì tự sinh, kể cả luật bên dưới đang bật. ' +
    'Chỉnh luật thoải mái rồi bật lại khi dữ liệu đã gọn.',
}

/** "vừa xong" · "5 phút trước" · "3 giờ trước" · "dd/MM" — hàm cấp module (đọc đồng hồ ngoài thân component). */
function luc(iso: string): string {
  const phut = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (phut < 1) return 'vừa xong'
  if (phut < 60) return `${phut} phút trước`
  if (phut < 60 * 24) return `${Math.round(phut / 60)} giờ trước`
  return ngayThang(iso)
}

const thamSo = (l: LuatTuSinh) =>
  [
    `hạn +${l.han_ngay} ngày`,
    l.nguong_gio != null && `sau ${l.nguong_gio} giờ`,
    l.cua_so_ngay != null && `±${l.cua_so_ngay} ngày`,
    `tối đa ${l.max_moi_lan}/lượt`,
  ]
    .filter(Boolean)
    .join(' · ')

/** Bấm nút / công tắc trong ô không nổi lên dòng (dòng ListView bấm = mở hộp Sửa). */
const chanDong = (e: MouseEvent) => e.stopPropagation()

/** Công tắc một luật — lạc quan: đổi ngay, lỗi thì trả lại + toast. */
function CongTacLuat({ l, duoc }: { l: LuatTuSinh; duoc: boolean }) {
  const router = useRouter()
  const [bat, datBat] = useOptimistic(l.active)
  const [dang, start] = useTransition()
  return (
    <Switch
      aria-label={`Bật luật ${l.name}`}
      checked={bat}
      disabled={!duoc || dang}
      onCheckedChange={(c) =>
        start(async () => {
          datBat(c)
          const kq = await batTatLuat(l.key, c)
          if (!kq.ok) return void thongBao.loi(`${l.name}: chưa ${c ? 'bật' : 'tắt'} được — ${kq.loi}`)
          thongBao.xong(`${l.name}: đã ${c ? 'bật' : 'tắt'}`)
          router.refresh()
        })
      }
    />
  )
}

/** Dòng bảng việc: ô chọn của bang/ + nền chọn. */
function DongViec({ v, children }: { v: ViecSinh; children: ReactNode }) {
  const { daChon } = useDaChon()
  return (
    <TableRow chon={daChon.includes(String(v.id))}>
      <OChonDong khoa={String(v.id)} moTa={`việc ${v.ref}`} />
      {children}
    </TableRow>
  )
}

export function TuSinh({
  duLieu,
  nenTang,
  duocSuaLuat,
}: {
  duLieu: ManTuSinh
  nenTang: NenTang
  duocSuaLuat: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const tab: Tab = sp.get('tab') === 'viec' ? 'viec' : 'luat'
  const xem = useXemViec()
  const [sua, setSua] = useState<LuatTuSinh | null>(null)
  const [thu, setThu] = useState<{ ten: string; kq: ThuLuat } | null>(null)
  const [dangThu, setDangThu] = useState<string | null>(null)
  /** Hộp hỏi đang mở (chạy ngay / bật bộ quét) + câu lỗi của lượt đó. */
  const [hoiGi, setHoiGi] = useState<'chay' | 'bat' | null>(null)
  const [loiHoi, setLoiHoi] = useState<string | null>(null)
  const [dangGat, setDangGat] = useState(false)
  const hoi = (h: 'chay' | 'bat') => {
    setLoiHoi(null)
    setHoiGi(h)
  }
  /** Lỗi trong hộp hỏi: hiện câu lỗi + ném để ConfirmDialog giữ hộp mở (bấm lại được). */
  const loiTrongHop = (loi: string) => {
    setLoiHoi(loi)
    throw new Error(loi)
  }

  const { luat, gan_day: viec } = duLieu
  const soBat = luat.filter((l) => l.active).length
  const lamMoi = () => router.refresh()

  const doiTab = (t: string) => {
    const m = new URLSearchParams(sp.toString())
    if (t === 'luat') m.delete('tab')
    else m.set('tab', t)
    router.replace(`${pathname}${m.size ? `?${m}` : ''}`, { scroll: false })
  }

  // ── Người nhận: ComboboxPanel in `gt` làm mã → email (đọc được, phân biệt trùng tên), map về staff id. ──
  const gtCua = (s: { id: string; email: string }) => s.email || s.id
  const nguoi: MucChon[] = [
    { gt: MAC_DINH, nhan: MAC_DINH },
    ...nenTang.nhan_su.map((s) => ({ gt: gtCua(s), nhan: s.ten })),
  ]
  const gtNhan = (l: LuatTuSinh) => {
    if (!l.nguoi_nhan) return MAC_DINH
    const s = nenTang.nhan_su.find((x) => x.id === l.nguoi_nhan)
    return s ? gtCua(s) : l.nguoi_nhan
  }
  const idCua = (gt: string | null) =>
    !gt || gt === MAC_DINH ? null : (nenTang.nhan_su.find((s) => gtCua(s) === gt)?.id ?? gt)

  // ── Ghi ──
  async function gatBoQuet(bat: boolean) {
    setDangGat(true)
    const kq = await batTatTuSinh(bat)
    setDangGat(false)
    if (kq.ok) {
      thongBao.xong(bat ? 'Đã bật bộ quét tự động' : 'Đã tắt bộ quét — không có gì tự sinh nữa')
      lamMoi()
    }
    return kq
  }

  async function chayNgay() {
    const kq = await chayTuSinh()
    if (!kq.ok) return loiTrongHop(kq.loi)
    const co = kq.duLieu.filter((x) => x.da_tao > 0)
    const tong = co.reduce((n, x) => n + x.da_tao, 0)
    const ten = (k: string) => luat.find((l) => l.key === k)?.name ?? k
    thongBao.xong(
      tong === 0
        ? 'Quét xong — không có việc nào mới.'
        : `Quét xong — sinh ${tong} việc mới: ${co.map((x) => `${ten(x.luat)} (${x.da_tao})`).join(', ')}`,
    )
    lamMoi()
  }

  async function xemTruoc(l: LuatTuSinh) {
    setDangThu(l.key)
    const kq = await thuLuat(l.key)
    setDangThu(null)
    if (!kq.ok) return thongBao.loi(`${l.name}: chưa xem trước được — ${kq.loi}`)
    setThu({ ten: l.name, kq: kq.duLieu })
  }

  // ── Luật: ListView một dòng (Switch · tên + mô tả · nguồn · tham số · người nhận · lần quét · thao tác) ──
  const cotLuat: CotDanhSach<LuatTuSinh>[] = [
    {
      id: 'bat',
      ten: 'Bật',
      rong: '40px',
      dienThoai: 'trenPhai',
      o: (l) => (
        <span className="inline-flex" onClick={chanDong}>
          <CongTacLuat l={l} duoc={duocSuaLuat} />
        </span>
      ),
    },
    {
      id: 'luat',
      ten: 'Luật',
      rong: 'minmax(0,2fr)',
      dienThoai: 'tren',
      o: (l) => (
        // Tên cắt gọn trong cột (shrink-0 từng tràn đè sang Nguồn ở 1440). Mô tả DB viết theo tên bảng/cột → chỉ ở title.
        // Nguồn gộp vào đây (badge sau tên) — cột riêng 96px làm cột Luật chỉ còn ~100px ở 1440.
        <>
          <span
            className={cn('min-w-0 truncate font-medium', !l.active && 'text-muted-foreground')}
            title={l.mo_ta ? `${l.name} — ${l.mo_ta}` : l.name}
          >
            {l.name}
          </span>
          <Badge variant="soft">{l.nguon}</Badge>
        </>
      ),
    },
    {
      id: 'tham-so',
      ten: 'Việc sinh ra',
      rong: 'minmax(0,1.6fr)',
      anKhiHep: true,
      dienThoai: 'duoi',
      o: (l) => (
        <>
          {UU.find((u) => u.gt === String(l.priority))?.nhan}
          <span className="min-w-0 truncate text-muted-foreground">{thamSo(l)}</span>
        </>
      ),
    },
    {
      id: 'nhan',
      ten: 'Giao cho',
      rong: '180px',
      dienThoai: 'duoiPhai',
      o: (l) =>
        duocSuaLuat ? (
          <OSuaNguoi
            ma={l.name}
            truong="người nhận"
            value={l.nguoi_nhan ? gtNhan(l) : null /* mặc định = "chưa giao" (chữ mờ, không avatar "(Đ") */}
            options={nguoi}
            mucDangChon={l.nguoi_nhan && l.nguoi_nhan_ten ? { gt: gtNhan(l), nhan: l.nguoi_nhan_ten } : undefined}
            chuaGiao={MAC_DINH}
            onLuu={async (gt) => {
              await chac(doiNguoiNhan(l.key, idCua(gt)))
              lamMoi()
            }}
          />
        ) : (
          <span className="min-w-0 truncate">{l.nguoi_nhan_ten ?? MAC_DINH}</span>
        ),
    },
    {
      id: 'quet',
      ten: 'Lần quét',
      rong: '144px',
      anKhiHep: true,
      phai: true,
      o: (l) => (
        <span className="min-w-0 truncate text-muted-foreground">
          {l.last_run_at ? luc(l.last_run_at) : 'chưa chạy lần nào'}
          {l.last_created > 0 && ` · sinh ${l.last_created}`}
        </span>
      ),
    },
    ...(duocSuaLuat
      ? [
          {
            id: 'thao-tac',
            ten: 'Thao tác',
            rong: '72px',
            anKhiHep: true,
            phai: true,
            o: (l: LuatTuSinh) => (
              <span className="inline-flex gap-1" onClick={chanDong}>
                <TooltipNhanh content={<span aria-hidden="true">Sửa luật</span>}>
                  <Button variant="ghost" size="icon-sm" aria-label={`Sửa luật ${l.name}`} onClick={() => setSua(l)}>
                    <PencilSimple aria-hidden="true" />
                  </Button>
                </TooltipNhanh>
                <TooltipNhanh content={<span aria-hidden="true">Xem trước việc sẽ sinh</span>}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Xem trước luật ${l.name}`}
                    loading={dangThu === l.key}
                    onClick={() => void xemTruoc(l)}
                  >
                    <Eye aria-hidden="true" />
                  </Button>
                </TooltipNhanh>
              </span>
            ),
          } satisfies CotDanhSach<LuatTuSinh>,
        ]
      : []),
  ]

  const phanLuat = (
    <>
      {/*
        Công tắc chung đặt TRÊN danh sách luật, vì nó phủ quyết cả danh sách. Để dưới thì người ta bật một luật,
        đợi 15 phút, không thấy gì, rồi mới cuộn xuống phát hiện cả bộ đang tắt.
      */}
      <Card className="mb-4">
        <SwitchRow
          nhan="Bộ quét tự động"
          moTa={duLieu.cong_tac_bat ? MO_TA_BO_QUET.bat : MO_TA_BO_QUET.tat}
        >
          <Switch
            checked={duLieu.cong_tac_bat}
            disabled={!duocSuaLuat || dangGat}
            onCheckedChange={(c) => {
              if (c) return hoi('bat')
              void gatBoQuet(false).then((kq) => !kq.ok && thongBao.loi(`Chưa tắt được bộ quét — ${kq.loi}`))
            }}
          />
        </SwitchRow>
      </Card>
      {luat.length ? (
        <ListView
          aria-label="Luật sinh việc"
          cot={cotLuat}
          dong={luat}
          khoa={(l) => l.key}
          onMo={(l) => duocSuaLuat && setSua(l)}
        />
      ) : (
        <EmptyState
          size="sm"
          tieuDe="Chưa có luật sinh việc nào"
          moTa="Luật sinh việc từ sự kiện CSKH / Sales sẽ hiện ở đây."
        />
      )}
      {!duocSuaLuat && (
        <p className="mt-2 text-xs text-muted-foreground">
          Chỉ cấp quản lý mới bật/tắt luật, đổi người nhận hoặc chạy tay.
        </p>
      )}
    </>
  )

  // ── Việc đã sinh: Table chọn được (thanh hàng loạt), mã → thẻ xem nhanh ──
  const ganVoi = (v: ViecSinh) => [v.team_name, v.links?.[0] && nhanChip(v.links[0]).ten].filter(Boolean).join(' · ')
  const phanViec = (
    <>
      {duLieu.tong_auto > viec.length && (
        <p className="mb-3 text-xs text-muted-foreground">
          Bạn xem được {viec.length}/{duLieu.tong_auto} việc tự sinh — phần còn lại thuộc team khác.
        </p>
      )}
      {viec.length === 0 ? (
        <BangTrangThai
          trangThai="rongThat"
          tieuDe="Chưa có việc nào được sinh tự động"
          moTa="Khi bộ quét chạy và có sự kiện khớp luật đang bật, việc sinh ra sẽ hiện ở đây."
        />
      ) : (
        <KhungChon khoaTrang={viec.map((v) => String(v.id))} tong={viec.length} bat thamSo={{ tab }}>
          <TableWrap>
            <Table layout="fixed" className="min-w-180">
              <colgroup>
                <col className="w-9" />
                <col className="w-24" />
                <col />
                <col className="w-36" />
                <col className="w-28" />
                <col className="w-32" />
                <col className="w-26" />
                <col className="w-12" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <OChonTatCa nhan="việc" />
                  <TableHead>Mã</TableHead>
                  <TableHead>Việc</TableHead>
                  <TableHead>Sự kiện gốc</TableHead>
                  <TableHead>Sinh lúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead phai>Hạn</TableHead>
                  <TableHead>Chính</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viec.map((v) => (
                  <DongViec key={v.id} v={v}>
                    <TableCell>
                      {/* NutMoMa chỉ nổi cú bấm lên — Table không có onMo của ListView nên bắt tại đây. */}
                      <span className="inline-flex" onClick={() => xem.mo(v.id)}>
                        <NutMoMa ma={v.ref} luonHien />
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="block truncate" title={v.title}>
                        {v.title}
                      </span>
                      {ganVoi(v) && <span className="block truncate text-muted-foreground">{ganVoi(v)}</span>}
                    </TableCell>
                    <TableCell>
                      <span className="block truncate text-muted-foreground">{v.origin_ref ?? '—'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{luc(v.created_at)}</span>
                    </TableCell>
                    <TableCell>
                      <OSuaTrangThai
                        ma={v.ref}
                        value={{ tt: v.status }}
                        muc={TT}
                        onLuu={async (g) => {
                          await chac(doiTrangThai(v.id, g.tt))
                          lamMoi()
                        }}
                      />
                    </TableCell>
                    <TableCell phai>
                      <HanChu due={v.due_at} />
                    </TableCell>
                    <TableCell>
                      <NguoiChinh nguoi={v.assignees} />
                    </TableCell>
                  </DongViec>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
          <ThanhDaChon nhan="việc">
            <ThanhHangLoatViec nenTang={nenTang} xong={lamMoi} />
          </ThanhDaChon>
        </KhungChon>
      )}
    </>
  )

  return (
    <KhungXemViec ds={viec} nenTang={nenTang}>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={CHON_BANG} thanhHangLoat="surface">
          <DataViewToolbar
            tieuDe="Việc tự sinh"
            dem={tab === 'viec' ? { thay: viec.length, tong: duLieu.tong_auto } : undefined}
            nutChinh={
              duocSuaLuat && (
                <Button onClick={() => hoi('chay')}>
                  <Play aria-hidden="true" />
                  Chạy ngay
                </Button>
              )
            }
            tabs={
              <Tabs value={tab} onValueChange={doiTab}>
                <TabsList variant="pill" aria-label="Phần của màn">
                  <TabsTrigger value="luat">
                    Luật sinh việc{' '}
                    <TabsCount>
                      {soBat}/{luat.length}
                      <span className="sr-only"> đang bật</span>
                    </TabsCount>
                  </TabsTrigger>
                  <TabsTrigger value="viec">
                    Việc đã sinh <TabsCount>{viec.length}</TabsCount>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            }
            dangXem={tab === 'viec' ? 'bang' : 'danh-sach'}
            onDoiXem={() => {}}
            xemNhanh={xem.id != null}
            onXemNhanh={(bat) => (bat ? viec[0] && xem.mo(viec[0].id) : xem.dong())}
          />
          {tab === 'luat' ? phanLuat : phanViec}
        </CauHinhBangDs>
      </TrangDuLieu>

      {sua && <SuaLuat key={sua.key} l={sua} nenTang={nenTang} onDong={() => setSua(null)} />}

      <Dialog open={!!thu} onOpenChange={(o) => !o && setThu(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chạy bây giờ sẽ sinh {thu?.kq.se_sinh.length ?? 0} việc</DialogTitle>
            <DialogDescription>
              Luật “{thu?.ten}” — đây chỉ là xem trước, chưa việc nào được tạo.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {thu?.kq.se_sinh.length ? (
              <ItemGroup aria-label="Việc sẽ sinh">
                {thu.kq.se_sinh.map((x) => (
                  <Item key={x.khoa} size="sm" variant="outline">
                    <ItemContent>
                      <ItemTitle>{x.mo_ta}</ItemTitle>
                      <ItemDescription>
                        {x.khoa} · {x.moc}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            ) : (
              <EmptyState
                size="sm"
                kieu="loc"
                tieuDe="Không có sự kiện nào khớp"
                moTa="Mọi sự kiện đã sinh việc rồi, hoặc tham số đang quá chặt."
              />
            )}
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={hoiGi === 'chay'}
        onOpenChange={(o) => !o && setHoiGi(null)}
        tieuDe="Chạy bộ quét ngay?"
        moTa="Việc sinh ra là việc thật, giao ngay cho người nhận của từng luật."
        hauQua={[
          `${soBat} luật đang bật quét sự kiện mới`,
          'Mỗi luật sinh tối đa số việc đã đặt cho một lượt',
          'Sự kiện đã sinh việc rồi thì không sinh lại',
        ]}
        nutXacNhan="Chạy ngay"
        loi={loiHoi}
        onXacNhan={chayNgay}
      />
      <ConfirmDialog
        open={hoiGi === 'bat'}
        onOpenChange={(o) => !o && setHoiGi(null)}
        tieuDe="Bật bộ quét tự động?"
        moTa="Từ lượt quét kế tiếp, việc tự sinh và giao cho người nhận — không cần ai mở app."
        hauQua={[
          `Cứ 15 phút quét một lần theo ${soBat} luật đang bật`,
          'Lượt đầu có thể sinh nhiều việc cùng lúc (tối đa theo từng luật)',
        ]}
        nutXacNhan="Bật bộ quét"
        loi={loiHoi}
        onXacNhan={async () => {
          const kq = await gatBoQuet(true)
          if (!kq.ok) loiTrongHop(kq.loi)
        }}
      />
    </KhungXemViec>
  )
}
