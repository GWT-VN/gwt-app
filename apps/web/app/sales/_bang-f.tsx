'use client'

// Lõi bảng danh sách khu Sales theo khuôn Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md), chép đúng thứ tự phần của
// components/BangKhach.tsx: DataViewToolbar (tìm · tạo · tab · Lọc · ⚙) → [ghi chú khi lọc] → Table ghim / ListView < 640 →
// EmptyState → PhanTrang. Bốn màn (đơn, khách, giá, CTKM) chỉ khai cột + ô; không thao tác hàng loạt (Sales không có).
// Khuôn F bản chốt 27/11: không số trên tab, lọc hiện ở nhãn cột (`moLocCot`), bộ đếm duy nhất = PhanTrang, chuột phải dòng
// → menu Mở chi tiết · Sao chép mã · Sao chép đường dẫn.
import { useRef, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { TabView } from '@/app/actions'
import { ArrowSquareOut, Copy, LinkSimple } from '@phosphor-icons/react/ssr'
import { OTimKiem, PhanTrang, type SapXep } from '@/bang'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc } from '@/bang/locTruong'
import { useHangTab, type TabCoDinh } from '@/components/HangTab'
import { moLocCot, NutLoc, useMoLoc, type TruongLoc } from '@/components/ui/bo-loc-truong'
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { CaiDatHienThi, DataViewToolbar, type CaiDatRef } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { ListView, type CotDanhSach } from '@/components/ui/list-view'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { ThemCot } from '@/components/ui/them-cot'
import { ColCotBang, KeoCot, TieuDeCot } from '@/components/ui/tieu-de-cot'
import { laGhim, RONG_THEM_COT, useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { RONG_BANG_TOI_THIEU, useRongKhung } from '@/components/ui/use-rong-khung'
import type { KieuNgay } from '@/lib/dinh-dang-ngay'
import type { BangTab } from '@/lib/tab-view'

/** Cờ lọc bật/tắt (`?<id>=1`, tab cố định đặt) — tab đang chọn đã nói (khuôn F: không chip); vẫn vào tóm tắt khi lưu tab. */
export type CoLoc = { id: string; nhan: string; giaTri: string }

export function BangF<T>({
  tieuDe, nhan, timKiem, nutChinh, bang, coDinh, tabRieng, quyenTabChung, viDuTen, truong = [], co = [],
  cot, o, tieuDeO, cotDs, khoa, ma = khoa, hrefMo, rows, tong, trang, soTrang, sapXep, ghiChu, chanTrang, rong,
}: {
  tieuDe: string
  /** Danh từ của bản ghi ("đơn", "khách"…). */
  nhan: string
  timKiem: { placeholder: string; nhan: string }
  nutChinh?: ReactNode
  bang: BangTab
  coDinh: readonly TabCoDinh[]
  tabRieng: TabView[]
  quyenTabChung: boolean
  viDuTen: string
  /** Lọc ▸ trường (đã kèm danh sách giá trị); server lọc theo cùng tham số URL. */
  truong?: TruongLoc[]
  co?: CoLoc[]
  cot: CotBang[]
  o: (r: T, id: string, ngay: (id: string) => KieuNgay) => ReactNode
  tieuDeO?: (r: T, id: string) => string | undefined
  cotDs: CotDanhSach<T>[]
  khoa: (r: T) => string
  /** Mã cho "Sao chép mã" ở menu chuột phải (mặc định `khoa`); null = dòng không có mã. */
  ma?: (r: T) => string | null
  /** Trang chi tiết của dòng (ListView mở khi bấm tên); thiếu = bản ghi không có trang riêng (bảng giá). */
  hrefMo?: (r: T) => string
  rows: T[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  /** Ghi chú đi kèm bộ lọc đang áp (vd lọc sản phẩm thì cột Tổng chỉ cộng dòng khớp) — nằm ngay trên bảng. */
  ghiChu?: ReactNode
  /** Ghi chú cố định của màn — dưới bảng. */
  chanTrang?: ReactNode
  rong: { that: { tieuDe: string; moTa: string }; loc: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const cotBang = useCotBang(cot, { url: true })
  const { refBang } = cotBang
  const theoId = new Map(cot.map((c) => [c.id, c]))
  const caiDat = useRef<CaiDatRef>(null)
  const [khungRef, rongKhung] = useRongKhung()

  const q = params.get('q')
  const coBat = co.filter((x) => params.get(x.id) === '1')
  const dk = docTatCa(params, truong)
  const tenGiaTri = (x: TruongLoc) => (g: string) => x.tuyChon?.find((t) => t.giaTri === g)?.nhan ?? g
  const { nut: refNutLoc, mo: moLocTruong } = useMoLoc()
  const dieuKienTat = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
    ...coBat.map(({ nhan: n, giaTri }) => ({ nhan: n, giaTri })),
    ...dk.map((d) => {
      const x = truong.find((y) => y.id === d.truong)!
      const n = nhanChip(d, x.ten, tenGiaTri(x))
      return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
    }),
  ]
  const hangTab = useHangTab({ bang, coDinh, tabRieng, quyenTabChung, nhan, khu: 'Sales', viDuTen, dieuKien: dieuKienTat })

  function doiUrl(thayDoi: Record<string, string | null>) {
    const tiep = new URLSearchParams(params.toString())
    for (const [id, giaTri] of Object.entries(thayDoi)) {
      if (giaTri == null) tiep.delete(id)
      else tiep.set(id, giaTri)
    }
    tiep.delete('trang')
    const query = tiep.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }
  const doiSapXep = (sap: { cot: string; tang: boolean } | null) =>
    doiUrl({ cot: sap?.cot ?? null, chieu: sap ? (sap.tang ? 'asc' : 'desc') : null })
  const datLoc = (id: string, d: DieuKienLoc | null) => doiUrl({ [id]: ghiDieuKien(d, truong.find((x) => x.id === id)!.kieu) })

  const dangLoc = dieuKienTat.length > 0
  const laBang = !(rongKhung !== null && rongKhung < RONG_BANG_TOI_THIEU)

  // Chuột phải dòng (khuôn F 27/11): Mở chi tiết (nếu có trang) · Sao chép mã · Sao chép đường dẫn — không thao tác ghi.
  const menuDong = (r: T) => {
    const m = ma(r)
    const h = hrefMo?.(r)
    if (!m && !h) return undefined
    return (
      <>
        {h && (
          <>
            <ContextMenuItem onSelect={() => router.push(h)}>
              <ArrowSquareOut aria-hidden="true" />
              Mở chi tiết
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        {m && (
          <ContextMenuItem onSelect={() => void navigator.clipboard?.writeText(m)}>
            <Copy aria-hidden="true" />
            Sao chép mã {nhan}
          </ContextMenuItem>
        )}
        {h && (
          <ContextMenuItem onSelect={() => void navigator.clipboard?.writeText(location.origin + h)}>
            <LinkSimple aria-hidden="true" />
            Sao chép đường dẫn
          </ContextMenuItem>
        )}
      </>
    )
  }

  return (
    <>
      {/* Đầu + thanh lọc + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ). */}
      <div className="border-none border-current">
        <DataViewToolbar
          tieuDe={tieuDe}
          timKiem={<OTimKiem placeholder={timKiem.placeholder} aria-label={timKiem.nhan} />}
          nutChinh={nutChinh}
          tabs={hangTab.tabs}
          dangXem="bang"
          loc={
            truong.length ? (
              <NutLoc
                ref={refNutLoc}
                truong={truong}
                dieuKien={dk}
                onDoi={datLoc}
                onXoaHet={() => doiUrl(Object.fromEntries(truong.map((x) => [x.id, null])))}
                coCot={(id) => laBang && rows.length > 0 && cotBang.hien.some((c) => c.id === id)}
              />
            ) : undefined
          }
          caiDat={
            <CaiDatHienThi
              ref={caiDat}
              dangXem="bang"
              cot={cotBang.thuTu.map((id) => theoId.get(id)!)}
              cotAn={cotBang.an}
              onCotAn={(an) => cot.forEach((c) => cotBang.anHien(c.id, !an.includes(c.id)))}
              onDoiChoCot={cotBang.doiCho}
              sapXep={sapXep}
              onSapXep={doiSapXep}
            />
          }
        />
        {ghiChu}
        <div ref={khungRef} className="border-none border-current">
          {!laBang ? (
            rows.length > 0 && (
              <ListView
                aria-label={tieuDe}
                cot={cotDs}
                dong={rows}
                khoa={khoa}
                onMo={(r) => hrefMo && router.push(hrefMo(r))}
                moKhi="ten"
                menuDong={menuDong}
              />
            )
          ) : (
            <TableWrap tabIndex={0} role="region" aria-label={`Vùng cuộn bảng ${tieuDe.toLowerCase()}`}>
              <KeoCot cot={cotBang.hien} doiCho={cotBang.doiCho}>
                <Table ref={refBang} aria-label={tieuDe} layout="fixed" style={{ minWidth: cotBang.tongRong + RONG_THEM_COT }}>
                  <ColCotBang hien={cotBang.hien} doRong={cotBang.doRong} choDo={cotBang.choDo} />
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
                          ngay={cotBang.ngayCot(c.id)}
                          sap={c.kieu === 'sap' ? {
                            chieu: sapXep.cot === c.id ? (sapXep.tang ? 'tang' : 'giam') : null,
                            macDinh: sapXep.macDinh,
                            onDoi: (chieu) => doiSapXep(chieu ? { cot: c.id, tang: chieu === 'tang' } : null),
                          } : undefined}
                          moLoc={moLocCot(c.id, dk, truong, moLocTruong)}
                        />
                      ))}
                      <ThemCot cot={cot} an={cotBang.an} onHien={cotBang.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={khoa(r)} menu={menuDong(r)} tenMenu={`Thao tác ${ma(r) ?? khoa(r)}`}>
                        {cotBang.hien.map((c, i) => (
                          <TableCell key={c.id} cot={c.id} phai={c.phai} ghim={laGhim(c, i)} title={tieuDeO?.(r, c.id)}>
                            {o(r, c.id, cotBang.kieuNgay)}
                          </TableCell>
                        ))}
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
      {!rows.length && (
        <EmptyState
          size="sm"
          kieu={dangLoc ? 'loc' : 'that'}
          tieuDe={dangLoc ? rong.loc : rong.that.tieuDe}
          moTa={dangLoc ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' : rong.that.moTa}
        />
      )}
      {/* Bộ đếm DUY NHẤT của màn (khuôn F — CEO 27/11). */}
      <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan={nhan} />
      {chanTrang}
    </>
  )
}
