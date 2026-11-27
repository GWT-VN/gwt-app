'use client'

// Lõi bảng danh sách khu Sales theo khuôn Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md), chép đúng thứ tự phần của
// components/BangKhach.tsx: DataViewToolbar (tìm · tạo · tab · Lọc · ⚙) → ThanhDangLoc → [ghi chú khi lọc] → Table ghim / ListView
// < 640 → EmptyState → PhanTrang. Bốn màn (đơn, khách, giá, CTKM) chỉ khai cột + ô; không thao tác hàng loạt (Sales không có).
import { useRef, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { TabView } from '@/app/actions'
import { hrefBoLoc, OTimKiem, PhanTrang, ThanhDangLoc, type SapXep } from '@/bang'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc } from '@/bang/locTruong'
import { useHangTab, type TabCoDinh } from '@/components/HangTab'
import { ChipLoc, NutLoc, useMoLoc, type TruongLoc } from '@/components/ui/bo-loc-truong'
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

/** Cờ lọc bật/tắt (`?<id>=1`, tab cố định đặt) — hiện thành chip gỡ được. */
export type CoLoc = { id: string; nhan: string; giaTri: string }

export function BangF<T>({
  tieuDe, nhan, timKiem, nutChinh, bang, coDinh, tabRieng, demTab, quyenTabChung, viDuTen, truong = [], co = [],
  cot, o, tieuDeO, cotDs, khoa, hrefMo, rows, tong, trang, soTrang, sapXep, ghiChu, chanTrang, rong,
}: {
  tieuDe: string
  /** Danh từ của bản ghi ("đơn", "khách"…). */
  nhan: string
  timKiem: { placeholder: string; nhan: string }
  nutChinh?: ReactNode
  bang: BangTab
  coDinh: readonly TabCoDinh[]
  tabRieng: TabView[]
  demTab?: Record<string, number>
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
  const { nut: refNutLoc, chip: refChipLoc, mo: moLocTruong } = useMoLoc()
  const dieuKienTat = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
    ...coBat.map(({ nhan: n, giaTri }) => ({ nhan: n, giaTri })),
    ...dk.map((d) => {
      const x = truong.find((y) => y.id === d.truong)!
      const n = nhanChip(d, x.ten, tenGiaTri(x))
      return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
    }),
  ]
  const hrefXoaLoc = hrefBoLoc(pathname, params, 'q', ...co.map((x) => x.id), ...truong.map((x) => x.id), 'cot', 'chieu')
  const hangTab = useHangTab({ bang, coDinh, tabRieng, demTab, quyenTabChung, nhan, khu: 'Sales', viDuTen, dieuKien: dieuKienTat })

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

  const dieuKien = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q, href: hrefBoLoc(pathname, params, 'q') }] : []),
    ...coBat.map(({ id, nhan: n, giaTri }) => ({ nhan: n, giaTri, href: hrefBoLoc(pathname, params, id) })),
    ...dk.map((d) => {
      const x = truong.find((y) => y.id === d.truong)!
      return { nhan: x.ten, giaTri: '', chip: <ChipLoc ref={refChipLoc(d.truong)} truong={x} dieuKien={d} onDoi={datLoc} /> }
    }),
  ]

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
          loc={truong.length ? <NutLoc ref={refNutLoc} truong={truong} dieuKien={dk} onDoi={datLoc} /> : undefined}
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
        <ThanhDangLoc
          dieuKien={dieuKien}
          hienThi={rows.length}
          tong={tong}
          nhan={nhan}
          anSoDong
          sapXep={sapXep.macDinh ? undefined : sapXep}
          hrefXoaLoc={hrefXoaLoc}
        />
        {ghiChu}
        <div ref={khungRef} className="border-none border-current">
          {rongKhung !== null && rongKhung < RONG_BANG_TOI_THIEU ? (
            rows.length > 0 && (
              <ListView aria-label={tieuDe} cot={cotDs} dong={rows} khoa={khoa} onMo={(r) => hrefMo && router.push(hrefMo(r))} moKhi="ten" />
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
                          moLoc={
                            truong.some((y) => y.id === c.id)
                              ? { dang: dk.some((d) => d.truong === c.id), onMo: (neo, phu) => moLocTruong(c.id, neo, phu) }
                              : undefined
                          }
                        />
                      ))}
                      <ThemCot cot={cot} an={cotBang.an} onHien={cotBang.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={khoa(r)}>
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
          kieu={dieuKien.length ? 'loc' : 'that'}
          tieuDe={dieuKien.length ? rong.loc : rong.that.tieuDe}
          moTa={dieuKien.length ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' : rong.that.moTa}
        />
      )}
      <PhanTrang trang={trang} soTrang={soTrang} />
      {chanTrang}
    </>
  )
}
