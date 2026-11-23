'use client'

/**
 * "Việc của tôi" v2 — ghép Data view DS theo canvas bản 23 (CEO duyệt 23/11): DataViewToolbar (tìm bo tròn, Tạo việc,
 * tab Đang mở · Quá hạn · Tôi giao · Đã xong, dạng xem) + ô "Thêm việc nhanh" + ba dạng xem: Danh sách (ListView nhóm
 * theo hạn, sửa tại chỗ) · Bảng (Table DS, chọn dòng + thanh hàng loạt) · Kanban (theo trạng thái, kéo thả).
 * Bảng / Kanban / ô sửa dùng chung với Bảng team (DangXemViec). URL: `tab`, `q`, `cot`/`chieu`. Dữ liệu + quyền qua
 * server action (app/work/actions.ts).
 */
import { Suspense, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Plus } from '@phosphor-icons/react/ssr'
import { KhungChon, OTimKiem, ThanhDaChon } from '@/bang'
import { doiTrangThai, taoViec, type NenTang, type ViecRow } from '@/app/work/actions'
import { Badge } from '@/components/ui/badge'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataViewToolbar, TrangDuLieu, type DangXem } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { ListView, NhanDau, NutMoMa, type CotDanhSach } from '@/components/ui/list-view'
import { thongBao } from '@/components/ui/sonner'
import { CHON_BANG } from '@/components/ui/table-styles'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { NHAN_NHOM, nhanChip, nhomTheoHan, THU_TU_NHOM } from '@/lib/work'
import { KhungXemViec, useXemViec } from './KhungXemViec'
import { TaoViec } from './TaoViec'
import { NguoiChinh, VAI } from './chung'
import { BangViec, COT_VIEC, docSap, KanbanViec, NGHIA, soSanh, TEN_COT, useOViec, type Sap } from './DangXemViec'
import { ThanhHangLoatViec } from './HangLoat'

type Tab = 'mo' | 'qua-han' | 'toi-giao' | 'xong'
const TAB: { v: Tab; ten: string }[] = [
  { v: 'mo', ten: 'Đang mở' },
  { v: 'qua-han', ten: 'Quá hạn' },
  { v: 'toi-giao', ten: 'Tôi giao' },
  { v: 'xong', ten: 'Đã xong' },
]

/** Cột Bảng: như Bảng team, trừ lọc Trạng thái ở tiêu đề — màn này không có FilterBar để hiện chip lọc đó. */
const COT: CotBang[] = COT_VIEC.map((x) => (x.id === 'tt' ? { ...x, kieu: 'thuong', nghia: undefined } : x))

/** Trạng thái rỗng theo tab: nói thứ gì sẽ hiện ở đây (EmptyState `that`). */
const RONG: Record<Tab, { tieuDe: string; moTa: string }> = {
  mo: {
    tieuDe: 'Không còn việc nào đang mở',
    moTa: 'Việc bạn phụ trách, làm cùng, duyệt hoặc theo dõi sẽ hiện ở đây.',
  },
  'qua-han': {
    tieuDe: 'Không có việc trễ hạn',
    moTa: 'Việc quá hạn mà chưa xong sẽ hiện ở đây.',
  },
  'toi-giao': {
    tieuDe: 'Bạn chưa giao việc nào',
    moTa: 'Việc bạn tạo cho người khác làm sẽ hiện ở đây.',
  },
  xong: {
    tieuDe: 'Chưa xong việc nào trong 7 ngày qua',
    moTa: 'Việc đã xong trong 7 ngày gần nhất sẽ hiện ở đây.',
  },
}

/** "Vai · gắn với": vai của mình (không vai = Tôi giao) · liên kết ERP đầu tiên, không có thì số việc con. */
function vaiGan(v: ViecRow) {
  const vai = v.my_role ? (VAI[v.my_role] ?? v.my_role) : 'Tôi giao'
  const gan = v.links?.[0] ? nhanChip(v.links[0]).ten : v.sub_n ? `${v.sub_n} việc con` : ''
  return gan ? `${vai} · ${gan}` : vai
}

const khop = (v: ViecRow, q: string) =>
  !q || `${v.ref} ${v.title}`.toLocaleLowerCase('vi').includes(q.toLocaleLowerCase('vi'))

export function ViecCuaToi({
  rows,
  xongTuanNay,
  nenTang,
}: {
  rows: ViecRow[]
  xongTuanNay: ViecRow[]
  nenTang: NenTang
}) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const tab = (TAB.some((t) => t.v === sp.get('tab')) ? sp.get('tab') : 'mo') as Tab
  const q = sp.get('q') ?? ''
  const [dangXem, setDangXem] = useState<DangXem>('danh-sach')
  const xem = useXemViec()
  const c = useCotBang(COT, { url: true })
  const { lamMoi, luu, o } = useOViec(nenTang, xem.mo, c.doRong.nguoi)
  const [moi, setMoi] = useState('')
  const [dangTao, setDangTao] = useState(false)
  const { cotUrl, sap } = docSap(new URLSearchParams(sp.toString()), { cot: 'han', tang: true })

  const cuaToi = rows.filter((v) => v.my_role)
  const nguon: Record<Tab, ViecRow[]> = {
    mo: cuaToi,
    'qua-han': cuaToi.filter((v) => nhomTheoHan(v.due_at) === 'qua_han'),
    'toi-giao': rows.filter((v) => !v.my_role),
    xong: xongTuanNay,
  }
  const loc = nguon[tab].filter((v) => khop(v, q))
  // Danh sách + Kanban giữ thứ tự riêng (nhóm theo hạn / thứ tự cột); Bảng sắp theo `cot`/`chieu`, mặc định hạn gần.
  const dong = dangXem === 'bang' ? [...loc].sort(soSanh(sap)) : loc

  const datUrl = (sua: Record<string, string | null>) => {
    const p = new URLSearchParams(sp.toString())
    for (const [k, gt] of Object.entries(sua)) {
      if (gt) p.set(k, gt)
      else p.delete(k)
    }
    router.replace(`${pathname}${p.size ? `?${p}` : ''}`, { scroll: false })
  }
  const chieu = cotUrl ? (sap.tang ? 'asc' : 'desc') : undefined
  const datSap = (s: Sap | null) => datUrl({ cot: s?.cot ?? null, chieu: s ? (s.tang ? 'asc' : 'desc') : null })

  async function themNhanh() {
    const title = moi.trim()
    if (!title || dangTao) return
    setDangTao(true)
    const kq = await taoViec({ title })
    setDangTao(false)
    if (!kq.ok) return thongBao.loi(`Chưa thêm được việc — ${kq.loi}`)
    setMoi('')
    thongBao.xong(`Đã thêm ${kq.duLieu.ref}`)
    lamMoi()
  }

  const cot: CotDanhSach<ViecRow>[] = [
    {
      id: 'viec',
      ten: 'Việc',
      rong: 'minmax(0,2.4fr)',
      dienThoai: 'tren',
      o: (v) => (
        <>
          {/* Ô tick = đánh dấu xong (canvas) — bấm không mở dòng. */}
          <span className="inline-flex" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <Checkbox
              aria-label={`Đánh dấu xong ${v.ref}`}
              checked={v.status === 'done'}
              disabled={v.status === 'done'}
              onCheckedChange={async (c) => {
                if (!c) return
                const kq = await doiTrangThai(v.id, 'done')
                if (!kq.ok) return thongBao.loi(`${v.ref}: chưa đánh dấu xong — ${kq.loi}`)
                thongBao.xong(`${v.ref}: đã xong`, {
                  hoanTac: () => void luu(doiTrangThai(v.id, v.status)),
                })
                lamMoi()
              }}
            />
          </span>
          <NhanDau gon>{o(v, 'uu')}</NhanDau>
          <NutMoMa ma={v.ref} />
          {o(v, 'viec')}
        </>
      ),
    },
    {
      id: 'vai',
      ten: 'Vai · gắn với',
      rong: 'minmax(0,1fr)',
      anKhiHep: true,
      dienThoai: 'duoi',
      o: (v) => <span className="min-w-0 truncate text-muted-foreground">{vaiGan(v)}</span>,
    },
    { id: 'tt', ten: 'Trạng thái', rong: '120px', dienThoai: 'duoiPhai', o: (v) => o(v, 'tt') },
    { id: 'han', ten: 'Hạn', rong: '104px', phai: true, dienThoai: 'trenPhai', o: (v) => o(v, 'han') },
    { id: 'chinh', ten: 'Chính', rong: '40px', anKhiHep: true, o: (v) => <NguoiChinh nguoi={v.assignees} /> },
  ]

  const rong = !dong.length && (
    <EmptyState
      size="sm"
      kieu={q ? 'loc' : 'that'}
      tieuDe={q ? `Không có việc nào khớp “${q}”` : RONG[tab].tieuDe}
      moTa={q ? 'Thử từ khoá khác — tìm theo tiêu đề hoặc mã việc.' : RONG[tab].moTa}
    />
  )

  return (
    <KhungXemViec ds={dong} nenTang={nenTang}>
      <TrangDuLieu>
        <CauHinhBangDs
          giaoDien={{ ...O_TIM_PILL, ...CHON_BANG }}
          thanhHangLoat="surface"
          tenCot={TEN_COT}
          nghiaSapXep={NGHIA}
        >
          <DataViewToolbar
            tieuDe="Việc của tôi"
            dem={{ thay: dong.length, tong: nguon[tab].length }}
            timKiem={
              <Suspense>
                <OTimKiem placeholder="Tìm tiêu đề, mã việc…" />
              </Suspense>
            }
            nutChinh={
              <TaoViec
                nenTang={nenTang}
                trigger={
                  <Button>
                    <Plus aria-hidden="true" />
                    Tạo việc
                  </Button>
                }
              />
            }
            tabs={
              <Tabs value={tab} onValueChange={(t) => datUrl({ tab: t === 'mo' ? null : t })}>
                <TabsList variant="pill" aria-label="Nhóm việc">
                  {TAB.map((t) => (
                    <TabsTrigger key={t.v} value={t.v}>
                      {t.ten}{' '}
                      <TabsCount color={t.v === 'qua-han' && nguon[t.v].length ? 'danger' : undefined}>
                        {nguon[t.v].length}
                      </TabsCount>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            }
            dangXem={dangXem}
            onDoiXem={setDangXem}
            xemNhanh={xem.id != null}
            onXemNhanh={(bat) => (bat ? dong[0] && xem.mo(dong[0].id) : xem.dong())}
          />

          <form
            className="mb-3"
            onSubmit={(e) => {
              e.preventDefault()
              void themNhanh()
            }}
          >
            <Input
              icon={<Plus />}
              value={moi}
              onChange={(e) => setMoi(e.target.value)}
              disabled={dangTao}
              placeholder="Thêm việc nhanh — gõ tiêu đề rồi Enter (hạn, người sửa sau)"
              aria-label="Thêm việc nhanh"
            />
          </form>

          {dangXem === 'danh-sach' ? (
            <>
              {rong}
              <ListView
                aria-label="Việc của tôi"
                cot={cot}
                dong={dong}
                khoa={(v) => String(v.id)}
                onMo={(v) => xem.mo(v.id)}
                dangMo={xem.id ? String(xem.id) : null}
                nhom={
                  tab === 'xong'
                    ? undefined
                    : {
                        theo: (v) => nhomTheoHan(v.due_at),
                        muc: THU_TU_NHOM.map((n) => ({
                          gt: n,
                          nhan: (
                            <Badge variant="soft" color={n === 'qua_han' ? 'danger' : 'secondary'}>
                              {NHAN_NHOM[n]}
                            </Badge>
                          ),
                        })),
                      }
                }
              />
            </>
          ) : (
            rong || (
              <KhungChon
                khoaTrang={dong.map((v) => String(v.id))}
                tong={dong.length}
                bat={dangXem === 'bang'}
                thamSo={{ tab, q: q || undefined, cot: cotUrl ?? undefined, chieu }}
              >
                {dangXem === 'kanban' ? (
                  <KanbanViec dong={dong} rows={loc} phu={vaiGan} moViec={xem.mo} lamMoi={lamMoi} />
                ) : (
                  <BangViec dong={dong} c={c} sap={sap} onSap={datSap} o={o} />
                )}
                <ThanhDaChon nhan="việc">
                  <ThanhHangLoatViec nenTang={nenTang} xong={lamMoi} />
                </ThanhDaChon>
              </KhungChon>
            )
          )}
        </CauHinhBangDs>
      </TrangDuLieu>
    </KhungXemViec>
  )
}
