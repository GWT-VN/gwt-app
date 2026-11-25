'use client'

/**
 * "Việc của tôi" v2 — ghép Data view DS theo canvas bản 23 (CEO duyệt 23/11): DataViewToolbar (tìm bo tròn, + Việc mới,
 * tab Đang mở · Quá hạn · Tôi giao · Đã xong, dạng xem) + ba dạng xem (tab Đang mở có dòng "+ Việc mới" tạo tại chỗ —
 * CEO 25/11 bỏ hộp Tạo việc; nút chính thanh công cụ mở dòng đó): Danh sách (ListView nhóm
 * theo hạn, sửa tại chỗ) · Bảng (Table DS, chọn dòng + thanh hàng loạt) · Kanban (theo trạng thái, kéo thả).
 * Bảng / Kanban / ô sửa dùng chung với Bảng team (DangXemViec). URL: `tab`, `q`, `cot`/`chieu`. Dữ liệu + quyền qua
 * server action (app/work/actions.ts).
 */
import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Plus } from '@phosphor-icons/react/ssr'
import { KhungChon, OChonO, OTimKiem, ThanhDaChon } from '@/bang'
import { type NenTang, type ViecRow } from '@/app/work/actions'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { DongThem, type DongThemRef } from '@/components/ui/dong-them'
import { DataViewToolbar, TrangDuLieu, type DangXem } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { ListView, NhanDau, NutMoMa, type CotDanhSach } from '@/components/ui/list-view'
import { CHON_BANG } from '@/components/ui/table-styles'
import { Tabs, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { NHAN_NHOM, nhanChip, nhomTheoHan, THU_TU_NHOM } from '@/lib/work'
import { KhungXemViec, useXemViec } from './KhungXemViec'
import { GOI_Y_THEM, NguoiChinh, taoNhanhViec, VAI } from './chung'
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
  const { lamMoi, o } = useOViec(nenTang, xem.mo, c.doRong.nguoi)
  // Dòng "+ Việc mới" chỉ ở tab Đang mở, không từ khoá: việc vừa tạo (mình là Chính, chưa hạn) chỉ hiện ở đó — tạo ở tab
  // khác / khi đang tìm thì dòng mới biến mất ngay khỏi mắt.
  const choThem = tab === 'mo' && !q
  const themRef = useRef<DongThemRef>(null)
  // Bấm nút chính khi đang ở tab khác: đổi tab trước, dòng thêm dựng xong mới mở (ref, không setState trong effect).
  const moSau = useRef(false)
  useEffect(() => {
    if (!choThem || !moSau.current) return
    moSau.current = false
    themRef.current?.mo()
  }, [choThem])
  const taoTai = async (ten: string, status?: string) => {
    const ok = await taoNhanhViec(ten, status)
    if (ok) lamMoi()
    return ok
  }
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

  const cot: CotDanhSach<ViecRow>[] = [
    {
      id: 'viec',
      ten: 'Việc',
      rong: 'minmax(0,2.4fr)',
      dienThoai: 'tren',
      o: (v) => (
        <>
          {/* Ô chọn dòng (ẩn chờ rê) — CEO 23/11: ô tick CHỈ để chọn, xong việc đi qua chip trạng thái / Xem nhanh. */}
          <OChonO khoa={String(v.id)} moTa={`việc ${v.ref}`} />
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
              <Button
                onClick={() => {
                  if (choThem) return themRef.current?.mo()
                  moSau.current = true
                  datUrl({ tab: null, q: null })
                }}
              >
                <Plus aria-hidden="true" />
                Việc mới
              </Button>
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

          {/* Danh sách + Bảng đều chọn dòng được (ô chọn ẩn chờ rê); Kanban không có ô chọn. */}
          <KhungChon
            khoaTrang={dong.map((v) => String(v.id))}
            tong={dong.length}
            bat={dangXem !== 'kanban'}
            thamSo={{ tab, q: q || undefined, cot: cotUrl ?? undefined, chieu, hien: dong.map((v) => v.id).join(',') }}
          >
            {dangXem === 'danh-sach' ? (
              // Rỗng → chỉ EmptyState, không vẽ hàng tiêu đề cột trơ trọi bên dưới (CEO 25/11: "thừa").
              <>
                {rong || (
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
                              <span className={n === 'qua_han' ? 'text-(--color-text-danger)' : undefined}>
                                {NHAN_NHOM[n]}
                              </span>
                            ),
                          })),
                        }
                  }
                />
                )}
                {choThem && (
                  <DongThem ref={themRef} kieu="ds" nhan="Việc mới" placeholder={GOI_Y_THEM} onTao={(ten) => taoTai(ten)} />
                )}
              </>
            ) : dangXem === 'kanban' ? (
              // Chỗ được thêm (tab Đang mở, không từ khoá) luôn vẽ cột kể cả chưa có việc — tạo thẳng vào cột.
              (!choThem && rong) || (
                <KanbanViec
                  dong={dong}
                  rows={loc}
                  phu={vaiGan}
                  moViec={xem.mo}
                  lamMoi={lamMoi}
                  onTao={choThem ? taoTai : undefined}
                  themRef={themRef}
                />
              )
            ) : (
              <>
                {rong || <BangViec dong={dong} c={c} sap={sap} onSap={datSap} o={o} />}
                {choThem && (
                  <DongThem ref={themRef} kieu="bang" nhan="Việc mới" placeholder={GOI_Y_THEM} onTao={(ten) => taoTai(ten)} />
                )}
              </>
            )}
            <ThanhDaChon nhan="việc">
              <ThanhHangLoatViec nenTang={nenTang} xong={lamMoi} />
            </ThanhDaChon>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </KhungXemViec>
  )
}
