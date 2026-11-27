'use client'

// Khung bảng danh sách theo khuôn Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md) cho các màn CSKH đợt 3
// (Kho serial, BH chờ kích hoạt, Nhóm lỗi, Danh mục lỗi, Khách cần dọn, Soát kênh, Nước). Ghép ĐÚNG như
// components/BangKhach.tsx: DataViewToolbar (tìm · nút chính · hàng tab · Lọc · ⚙) › ThanhDangLoc › Table ghim
// (useCotBang url) / ListView < 640 › EmptyState › PhanTrang › thanh hàng loạt. Màn chỉ khai cột + trường lọc + tab.
// Phải nằm trong <KhungChon> (bat=false khi màn không có thao tác hàng loạt) và <CauHinhBangDs>.
import { Fragment, useRef, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { TabView } from '@/app/actions'
import { hrefBoLoc, OChonDong, OChonTatCa, OTimKiem, PhanTrang, ThanhDangLoc, useDaChon, type SapXep } from '@/bang'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc, type KieuTruong } from '@/bang/locTruong'
import { useHangTab, type TabCoDinh } from '@/components/HangTab'
import { ChipLoc, NutLoc, useMoLoc, type TruongLoc } from '@/components/ui/bo-loc-truong'
import { CaiDatHienThi, DataViewToolbar, type CaiDatRef } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { ListView, type CotDanhSach } from '@/components/ui/list-view'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { ThemCot } from '@/components/ui/them-cot'
import { ColCotBang, KeoCot, TieuDeCot } from '@/components/ui/tieu-de-cot'
import { laGhim, RONG_O_CHON, RONG_THEM_COT, useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { RONG_BANG_TOI_THIEU, useRongKhung } from '@/components/ui/use-rong-khung'
import type { KieuNgay } from '@/lib/dinh-dang-ngay'
import { TAB_VIEW, type BangTab } from '@/lib/tab-view'

/** Cột: khai báo `CotBang` + cách vẽ ô (`kieuNgay` của cột `ngay` để gọi `hienNgay(v, kieu)`) + `title` khi ô bị cắt. */
export type CotF<T> = CotBang & {
  o: (r: T, kieuNgay: KieuNgay) => ReactNode
  title?: (r: T) => string | null | undefined
}
/** Trường Lọc ▸ (bang/locTruong): `cot` dùng phía server, client chỉ cần id/ten/kieu. */
export type TruongF = { id: string; ten: string; kieu: KieuTruong }

export function BangDanhSachF<T>({
  tieuDe, nhan, timKiem, rows, khoa, moTa, cot, cotDs, hrefDong, tong, trang, soTrang, sapXep, choChon = false,
  tab, truong = [], tuyChonLoc = {}, co = [], nutChinh, congCu, thanhDaChon, rong, rongLoc, ghiChuLoc, lopDong, sauDong,
}: {
  tieuDe: string
  /** Danh từ bản ghi: "serial", "khách"… (đếm, ô chọn, xác nhận xoá tab). */
  nhan: string
  timKiem: { placeholder: string; nhan: string }
  rows: T[]
  khoa: (r: T) => string
  moTa: (r: T) => string
  cot: CotF<T>[]
  /** Màn hẹp (< 640) → ListView. Không truyền = luôn là bảng (cuộn ngang) — màn có ô sửa tại dòng. */
  cotDs?: CotDanhSach<T>[]
  /** Trang chi tiết của dòng (ListView bấm tên để mở). */
  hrefDong?: (r: T) => string | null
  tong: number
  trang?: number
  soTrang?: number
  /** Màn sắp được ở server; không truyền = thứ tự cố định (không menu sắp). */
  sapXep?: SapXep
  choChon?: boolean
  tab: {
    bang: BangTab
    coDinh: readonly TabCoDinh[]
    rieng: TabView[]
    quyenChung: boolean
    dem?: Record<string, number>
    khu: string
    viDuTen: string
  }
  truong?: TruongF[]
  tuyChonLoc?: Record<string, { giaTri: string; nhan: string }[]>
  /** Cờ `?id=1` do tab cố định đặt — hiện thành chip gỡ được (như "Cần xin SĐT" của Khách hàng). */
  co?: { id: string; nhan: string; giaTri: string }[]
  nutChinh?: ReactNode
  /** Nút icon đứng trước Lọc (vd xuất Excel). */
  congCu?: ReactNode
  thanhDaChon?: ReactNode
  rong: { tieuDe: string; moTa?: string }
  rongLoc?: { tieuDe: string; moTa?: string }
  /** Ghi chú bên phải thanh đang lọc (giới hạn của bộ lọc…). */
  ghiChuLoc?: ReactNode
  lopDong?: (r: T) => string | undefined
  /** Dòng phụ ngay dưới dòng (form sửa tại chỗ, lỗi) — `soCot` để colSpan. */
  sauDong?: (r: T, soCot: number) => ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const cotBang = useCotBang(cot, { url: true })
  const { refBang } = cotBang
  const theoId = new Map(cot.map((c) => [c.id, c]))
  const caiDat = useRef<CaiDatRef>(null)
  const { daChon } = useDaChon()
  const khoaDaChon = new Set(daChon)
  const [khungRef, rongKhung] = useRongKhung()

  const q = params.get('q')
  const coBat = co.filter((x) => params.get(x.id) === '1')
  const dk = docTatCa(params, truong)
  const truongLoc: TruongLoc[] = truong.map((x) => ({ id: x.id, ten: x.ten, kieu: x.kieu, tuyChon: tuyChonLoc[x.id] ?? [] }))
  const tenGiaTri = (id: string) => (g: string) => tuyChonLoc[id]?.find((x) => x.giaTri === g)?.nhan ?? g
  const { nut: refNutLoc, chip: refChipLoc } = useMoLoc()
  const hangTab = useHangTab({
    bang: tab.bang,
    coDinh: tab.coDinh,
    tabRieng: tab.rieng,
    demTab: tab.dem,
    quyenTabChung: tab.quyenChung,
    nhan,
    khu: tab.khu,
    viDuTen: tab.viDuTen,
    dieuKien: [
      ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
      ...coBat.map(({ nhan: n, giaTri }) => ({ nhan: n, giaTri })),
      ...dk.map((d) => {
        const x = truongLoc.find((y) => y.id === d.truong)!
        const n = nhanChip(d, x.ten, tenGiaTri(d.truong))
        return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
      }),
    ],
  })

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
      const x = truongLoc.find((y) => y.id === d.truong)!
      return { nhan: x.ten, giaTri: '', chip: <ChipLoc ref={refChipLoc(d.truong)} truong={x} dieuKien={d} onDoi={datLoc} /> }
    }),
  ]
  const soCot = cotBang.hien.length + (choChon ? 1 : 0) + 1
  const hep = !!cotDs && rongKhung !== null && rongKhung < RONG_BANG_TOI_THIEU
  const rongHien = dieuKien.length ? (rongLoc ?? { tieuDe: `Không tìm thấy ${nhan} nào`, moTa: 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' }) : rong

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
            <>
              {congCu}
              {truong.length > 0 && <NutLoc ref={refNutLoc} truong={truongLoc} dieuKien={dk} onDoi={datLoc} />}
            </>
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
              onSapXep={sapXep ? doiSapXep : undefined}
            />
          }
        />
        <ThanhDangLoc
          dieuKien={dieuKien}
          hienThi={rows.length}
          tong={tong}
          nhan={nhan}
          anSoDong
          sapXep={sapXep && !sapXep.macDinh ? sapXep : undefined}
          phai={ghiChuLoc}
          hrefXoaLoc={hrefBoLoc(pathname, params, ...TAB_VIEW[tab.bang].khoaLoc)}
        />
        <div ref={khungRef} className="border-none border-current">
          {hep ? (
            rows.length > 0 && (
              <ListView
                aria-label={tieuDe}
                cot={cotDs!}
                dong={rows}
                khoa={khoa}
                onMo={(r) => {
                  const h = hrefDong?.(r)
                  if (h) router.push(h)
                }}
                moKhi="ten"
              />
            )
          ) : (
            <TableWrap tabIndex={0} role="region" aria-label={`Vùng cuộn bảng ${tieuDe.toLocaleLowerCase('vi')}`}>
              <KeoCot cot={cotBang.hien} doiCho={cotBang.doiCho}>
                <Table
                  ref={refBang}
                  aria-label={tieuDe}
                  layout="fixed"
                  style={{ minWidth: cotBang.tongRong + RONG_THEM_COT + (choChon ? RONG_O_CHON : 0) }}
                >
                  <ColCotBang hien={cotBang.hien} doRong={cotBang.doRong} choDo={cotBang.choDo} chon={choChon} />
                  <TableHeader>
                    <TableRow>
                      <OChonTatCa nhan={nhan} />
                      {cotBang.hien.map((c, i) => (
                        <TieuDeCot
                          key={c.id}
                          cot={c}
                          viTri={i}
                          menuPhai={i === cotBang.hien.length - 1}
                          menuCot={cotBang.menuCot(c.id)}
                          ngay={cotBang.ngayCot(c.id)}
                          coDan={{ rong: cotBang.doRong[c.id], onDoi: (px) => cotBang.coDan(c.id, px) }}
                          sap={c.kieu === 'sap' && sapXep ? {
                            chieu: sapXep.cot === c.id ? (sapXep.tang ? 'tang' : 'giam') : null,
                            macDinh: sapXep.macDinh,
                            onDoi: (chieu) => doiSapXep(chieu ? { cot: c.id, tang: chieu === 'tang' } : null),
                          } : undefined}
                        />
                      ))}
                      <ThemCot cot={cot} an={cotBang.an} onHien={cotBang.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const k = khoa(r)
                      return (
                        <Fragment key={k}>
                          <TableRow chon={khoaDaChon.has(k)} className={lopDong?.(r)}>
                            <OChonDong khoa={k} moTa={moTa(r)} />
                            {cotBang.hien.map((c, i) => {
                              const dinh = theoId.get(c.id)!
                              return (
                                <TableCell key={c.id} cot={c.id} phai={c.phai} ghim={laGhim(c, i)} title={dinh.title?.(r) ?? undefined}>
                                  {dinh.o(r, cotBang.kieuNgay(c.id))}
                                </TableCell>
                              )
                            })}
                            <TableCell />
                          </TableRow>
                          {sauDong?.(r, soCot)}
                        </Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </KeoCot>
            </TableWrap>
          )}
        </div>
      </div>
      {!rows.length && <EmptyState size="sm" kieu={dieuKien.length ? 'loc' : 'that'} tieuDe={rongHien.tieuDe} moTa={rongHien.moTa} />}
      {trang !== undefined && soTrang !== undefined && <PhanTrang trang={trang} soTrang={soTrang} />}
      {thanhDaChon}
    </>
  )
}
