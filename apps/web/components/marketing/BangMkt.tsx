'use client'

// Bảng dữ liệu Wiki › Marketing (Phân tích video · Kho hook · Ý tưởng) theo khuôn Ticket F
// (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md; mẫu components/BangKhach.tsx). Khác Khách hàng: dữ liệu đã nạp đủ
// (≤ 500 dòng, REST riêng lib/marketing) → tìm / lọc / sắp chạy TRONG BỘ NHỚ theo URL (`apLoc`), không phân trang, không chọn
// hàng loạt. Bấm tên / dòng = mở ngăn chi tiết của màn (`onMo`). Khuôn F bản chốt 27/11: không số trên tab, lọc hiện ở nhãn
// cột (`moLocCot`), bộ đếm duy nhất = PhanTrang, chuột phải dòng → Mở chi tiết · Xem nhanh · Sao chép mã · Sao chép đường dẫn.
import { useRef, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { TabView } from '@/app/actions'
import { ArrowSquareOut, Copy, LinkSimple, SidebarSimple } from '@phosphor-icons/react/ssr'
import { boDau, chuanHoaTuKhoa, OTimKiem, PhanTrang, sapXepHopLe } from '@/bang'
import { apLoc, docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc } from '@/bang/locTruong'
import { useHangTab, type TabCoDinh } from '@/components/HangTab'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { moLocCot, NutLoc, useMoLoc, type TruongLoc } from '@/components/ui/bo-loc-truong'
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { CaiDatHienThi, DataViewToolbar, type CaiDatRef } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { ListView, type CotDanhSach } from '@/components/ui/list-view'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { ThemCot } from '@/components/ui/them-cot'
import { ColCotBang, KeoCot, TieuDeCot } from '@/components/ui/tieu-de-cot'
import { laGhim, RONG_THEM_COT, useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { RONG_BANG_TOI_THIEU, useRongKhung } from '@/components/ui/use-rong-khung'
import type { TruongMkt } from '@/app/wiki/marketing/du-lieu/truong-mkt'
import type { BangTab } from '@/lib/tab-view'
import { saoChep } from '@/lib/sao-chep'

/** Cột: `o` = nội dung ô, `chu` = chữ đầy đủ (title khi bị cắt), `sap` = khoá sắp (cột `kieu: 'sap'`). */
export type CotMkt<T> = CotBang & { o: (r: T) => ReactNode; chu?: (r: T) => string | null | undefined; sap?: (r: T) => string | number | null }

function soSanh(a: string | number | null, b: string | number | null) {
  if (a == null || a === '') return b == null || b === '' ? 0 : 1 // trống luôn xuống cuối
  if (b == null || b === '') return -1
  return typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'vi')
}

export function BangMkt<T>({
  bang, tieuDe, nhan, viDuTen, rows, khoa, ma, hrefMo, cot, cotDs, truong, locCot = {}, tabCoDinh, timTrong, onMo,
  tabRieng, coTab, quyenTabChung, timGoiY, rongThat,
}: {
  bang: BangTab
  tieuDe: string
  /** Danh từ bản ghi: "video", "câu", "ý tưởng". */
  nhan: string
  viDuTen: string
  rows: T[]
  khoa: (r: T) => string
  /** "Sao chép mã" ở menu chuột phải; thiếu / null = không có mục đó. */
  ma?: (r: T) => string | null
  /** Trang chi tiết riêng (Mở chi tiết + Sao chép đường dẫn ở menu chuột phải); thiếu = bản ghi chỉ có ngăn xem nhanh. */
  hrefMo?: (r: T) => string
  cot: CotMkt<T>[]
  /** Khung < 640: ListView. */
  cotDs: CotDanhSach<T>[]
  truong: TruongMkt<T>[]
  /** Cột → trường lọc khi khác id (vd cột `nguon` ↔ trường `nen_tang`); cùng id thì tự khớp. */
  locCot?: Record<string, string>
  tabCoDinh: TabCoDinh[]
  /** Chữ để tìm (gộp các cột chữ). */
  timTrong: (r: T) => string
  onMo: (r: T) => void
  tabRieng: TabView[]
  /** Hiện hàng tab: action tab (`bang_view`) gác khu CSKH — người ngoài CS (vd vai marketing) bấm "+" sẽ bị đá ra. */
  coTab: boolean
  quyenTabChung: boolean
  timGoiY: string
  rongThat: { tieuDe: string; moTa: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const cotBang = useCotBang(cot, { url: true })
  const { refBang } = cotBang
  const caiDat = useRef<CaiDatRef>(null)
  const [khungRef, rongKhung] = useRongKhung()
  const theoId = new Map(cot.map((c) => [c.id, c]))

  // Lọc ▸ trường: giá trị chọn lấy từ chính dữ liệu.
  const truongLoc: TruongLoc[] = truong.map((x) => ({
    id: x.id,
    ten: x.ten,
    kieu: x.kieu,
    tuyChon: [...new Set(rows.map(x.lay).filter((g): g is string => !!g))]
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map((g) => ({ giaTri: g, nhan: x.nhan?.(g) ?? g })),
  }))
  const tenGiaTri = (id: string) => (g: string) => truong.find((x) => x.id === id)?.nhan?.(g) ?? g
  const q = params.get('q')
  const dk = docTatCa(params, truong)
  const coSap = cot.filter((c) => c.sap).map((c) => c.id)
  const sapXep = sapXepHopLe(params.get('cot') ?? undefined, params.get('chieu') ?? undefined, coSap, { cot: '', tang: true })

  let shown = apLoc(rows, dk, truong)
  const tu = q ? chuanHoaTuKhoa(q).split(' ') : []
  if (tu.length) shown = shown.filter((r) => { const s = boDau(timTrong(r)); return tu.every((t) => s.includes(t)) })
  const cotSap = theoId.get(sapXep.cot)?.sap
  if (cotSap) shown = [...shown].sort((a, b) => soSanh(cotSap(a), cotSap(b)) * (sapXep.tang ? 1 : -1))

  const { nut: refNutLoc, mo: moLocTruong } = useMoLoc()
  const truongCua = (cotId: string) => locCot[cotId] ?? cotId
  const dieuKienTat = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
    ...dk.map((d) => {
      const x = truong.find((y) => y.id === d.truong)!
      const n = nhanChip(d, x.ten, tenGiaTri(x.id))
      return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
    }),
  ]
  const hangTab = useHangTab({ bang, coDinh: tabCoDinh, tabRieng, quyenTabChung, nhan, khu: 'Marketing', viDuTen, dieuKien: dieuKienTat })
  const laBang = !(rongKhung !== null && rongKhung < RONG_BANG_TOI_THIEU)

  function doiUrl(thayDoi: Record<string, string | null>) {
    const tiep = new URLSearchParams(params.toString())
    for (const [id, giaTri] of Object.entries(thayDoi)) {
      if (giaTri == null) tiep.delete(id)
      else tiep.set(id, giaTri)
    }
    const query = tiep.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }
  const doiSapXep = (sap: { cot: string; tang: boolean } | null) =>
    doiUrl({ cot: sap?.cot ?? null, chieu: sap ? (sap.tang ? 'asc' : 'desc') : null })
  const datLoc = (id: string, d: DieuKienLoc | null) => doiUrl({ [id]: ghiDieuKien(d, truong.find((x) => x.id === id)!.kieu) })

  // Chuột phải dòng (khuôn F 27/11) — chỉ mở / sao chép, không thao tác ghi.
  const menuDong = (r: T) => {
    const m = ma?.(r)
    const h = hrefMo?.(r)
    return (
      <>
        {h && (
          <ContextMenuItem onSelect={() => router.push(h)}>
            <ArrowSquareOut aria-hidden="true" />
            Mở chi tiết
          </ContextMenuItem>
        )}
        <ContextMenuItem onSelect={() => onMo(r)}>
          <SidebarSimple aria-hidden="true" />
          Xem nhanh
        </ContextMenuItem>
        {(m || h) && <ContextMenuSeparator />}
        {m && (
          <ContextMenuItem onSelect={() => void saoChep(m)}>
            <Copy aria-hidden="true" />
            Sao chép mã {nhan}
          </ContextMenuItem>
        )}
        {h && (
          <ContextMenuItem onSelect={() => void saoChep(location.origin + h)}>
            <LinkSimple aria-hidden="true" />
            Sao chép đường dẫn
          </ContextMenuItem>
        )}
      </>
    )
  }

  return (
    <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }}>
      {/* Đầu + thanh lọc + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ). Trang Wiki đã có tiêu đề h1 → h2. */}
      <div className="border-none border-current">
        <DataViewToolbar
          tieuDe={tieuDe}
          capTieuDe="h2"
          timKiem={<OTimKiem placeholder={timGoiY} aria-label={`Tìm ${nhan}`} />}
          tabs={coTab ? hangTab.tabs : undefined}
          dangXem="bang"
          loc={
            <NutLoc
              ref={refNutLoc}
              truong={truongLoc}
              dieuKien={dk}
              onDoi={datLoc}
              onXoaHet={() => doiUrl(Object.fromEntries(truong.map((x) => [x.id, null])))}
              coCot={(id) => laBang && shown.length > 0 && cotBang.hien.some((c) => truongCua(c.id) === id)}
            />
          }
          caiDat={
            <CaiDatHienThi
              ref={caiDat}
              dangXem="bang"
              cot={cotBang.thuTu.map((id) => theoId.get(id)!)}
              cotAn={cotBang.an}
              onCotAn={(an) => cot.forEach((c) => cotBang.anHien(c.id, !an.includes(c.id)))}
              onDoiChoCot={cotBang.doiCho}
              sapXep={sapXep.cot ? sapXep : undefined}
              onSapXep={doiSapXep}
            />
          }
        />
        <div ref={khungRef} className="border-none border-current">
          {!laBang ? (
            shown.length > 0 && <ListView aria-label={tieuDe} cot={cotDs} dong={shown} khoa={khoa} onMo={onMo} menuDong={menuDong} />
          ) : (
            <TableWrap tabIndex={0} role="region" aria-label={`Vùng cuộn bảng ${tieuDe.toLowerCase()}`}>
              <KeoCot cot={cotBang.hien} doiCho={cotBang.doiCho}>
                <Table ref={refBang} aria-label={tieuDe} layout="fixed" style={{ minWidth: cotBang.tongRong + RONG_THEM_COT }}>
                  <ColCotBang hien={cotBang.hien} doRong={cotBang.doRong} choDo={cotBang.choDo} chon={false} />
                  <TableHeader>
                    <TableRow>
                      {cotBang.hien.map((c, i) => (
                        <TieuDeCot
                          key={c.id}
                          cot={c}
                          viTri={i}
                          menuPhai={i === cotBang.hien.length - 1}
                          menuCot={cotBang.menuCot(c.id)}
                          coDan={{ rong: cotBang.doRong[c.id], onDoi: (px) => cotBang.coDan(c.id, px) }}
                          sap={c.kieu === 'sap' ? {
                            chieu: sapXep.cot === c.id ? (sapXep.tang ? 'tang' : 'giam') : null,
                            macDinh: sapXep.macDinh,
                            onDoi: (chieu) => doiSapXep(chieu ? { cot: c.id, tang: chieu === 'tang' } : null),
                          } : undefined}
                          moLoc={moLocCot(truongCua(c.id), dk, truongLoc, moLocTruong)}
                        />
                      ))}
                      <ThemCot cot={cot} an={cotBang.an} onHien={cotBang.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shown.map((r) => (
                      <TableRow
                        key={khoa(r)}
                        className="cursor-pointer"
                        onClick={() => onMo(r)}
                        menu={menuDong(r)}
                        tenMenu={`Thao tác ${ma?.(r) ?? khoa(r)}`}
                      >
                        {cotBang.hien.map((c, i) => {
                          const d = theoId.get(c.id)!
                          return (
                            <TableCell key={c.id} cot={c.id} phai={c.phai} ghim={laGhim(c, i)} title={d.chu?.(r) ?? undefined}>
                              {d.o(r)}
                            </TableCell>
                          )
                        })}
                        <TableCell />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </KeoCot>
            </TableWrap>
          )}
        </div>
      </div>
      {!shown.length && (
        <EmptyState
          size="sm"
          kieu={rows.length ? 'loc' : 'that'}
          tieuDe={rows.length ? `Không có ${nhan} nào khớp bộ lọc` : rongThat.tieuDe}
          moTa={rows.length ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' : rongThat.moTa}
        />
      )}
      {/* Bộ đếm DUY NHẤT của màn (khuôn F — CEO 27/11): dữ liệu đã nạp đủ, không phân trang → luôn 1 trang. */}
      <PhanTrang trang={1} soTrang={1} tong={shown.length} nhan={nhan} />
    </CauHinhBangDs>
  )
}
