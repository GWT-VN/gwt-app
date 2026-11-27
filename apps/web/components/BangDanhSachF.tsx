'use client'

// Khung bảng danh sách theo khuôn Ticket F bản chốt 27/11 (docs/rework/2026-11-27-khuon-f-huong-dan-agent.md) cho các màn
// CSKH đợt 3 (Kho serial, BH chờ kích hoạt, Nhóm lỗi, Danh mục lỗi, Khách cần dọn, Soát kênh, Nước). Ghép như
// app/ticket/_danh-sach/ds-f.tsx: DataViewToolbar (tìm · nút chính · hàng tab KHÔNG số · Xoá bộ lọc · Lọc · ⚙) › Table
// ghim (useCotBang url; lọc hiện ở nhãn cột — `moLocCot`) / ListView < 640 › EmptyState › ghi chú › PhanTrang (bộ đếm
// DUY NHẤT) › thanh hàng loạt. Chuột phải dòng → menu (Mở chi tiết · Sao chép mã · Sao chép đường dẫn).
// Màn chỉ khai cột + trường lọc + tab. Phải nằm trong <KhungChon> (bat=false khi màn không có thao tác hàng loạt),
// <CauHinhBangDs> và <Suspense> (component đọc useSearchParams).
import { Fragment, useRef, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowSquareOut, Copy, LinkSimple } from '@phosphor-icons/react/ssr'
import type { TabView } from '@/app/actions'
import { OChonDong, OChonTatCa, OTimKiem, PhanTrang, useDaChon, type SapXep } from '@/bang'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc, type KieuTruong } from '@/bang/locTruong'
import { useHangTab, type TabCoDinh } from '@/components/HangTab'
import { moLocCot, NutLoc, useMoLoc, type TruongLoc } from '@/components/ui/bo-loc-truong'
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { CaiDatHienThi, DataViewToolbar, type CaiDatRef } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { ListView, type CotDanhSach } from '@/components/ui/list-view'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { ThemCot } from '@/components/ui/them-cot'
import { ColCotBang, KeoCot, TieuDeCot } from '@/components/ui/tieu-de-cot'
import { laGhim, RONG_O_CHON, RONG_THEM_COT, useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { RONG_BANG_TOI_THIEU, useRongKhung } from '@/components/ui/use-rong-khung'
import type { KieuNgay } from '@/lib/dinh-dang-ngay'
import type { BangTab } from '@/lib/tab-view'

/** Cột: khai báo `CotBang` + cách vẽ ô (`kieuNgay` của cột `ngay` để gọi `hienNgay(v, kieu)`) + `title` khi ô bị cắt. */
export type CotF<T> = CotBang & {
  o: (r: T, kieuNgay: KieuNgay) => ReactNode
  title?: (r: T) => string | null | undefined
}
/** Trường Lọc ▸ (bang/locTruong): `cot` dùng phía server, client chỉ cần id/ten/kieu. */
export type TruongF = { id: string; ten: string; kieu: KieuTruong }

export function BangDanhSachF<T>({
  tieuDe, nhan, timKiem, rows, khoa, moTa, cot, cotDs, hrefDong, tenMo = 'Mở chi tiết', maDong, tenMa = 'mã', tong, trang = 1,
  soTrang = 1, sapXep, choChon = false, tab, truong = [], locCot = {}, tuyChonLoc = {}, nutChinh, congCu, thanhDaChon, rong,
  rongLoc, ghiChuLoc, lopDong, sauDong,
}: {
  tieuDe: string
  /** Danh từ bản ghi: "serial", "khách"… (bộ đếm, ô chọn, xác nhận xoá tab). */
  nhan: string
  timKiem: { placeholder: string; nhan: string }
  rows: T[]
  khoa: (r: T) => string
  moTa: (r: T) => string
  cot: CotF<T>[]
  /** Màn hẹp (< 640) → ListView. Không truyền = luôn là bảng (cuộn ngang) — màn có ô sửa tại dòng. */
  cotDs?: CotDanhSach<T>[]
  /** Trang chi tiết của dòng: ListView bấm tên để mở + menu chuột phải "Mở chi tiết" / "Sao chép đường dẫn". */
  hrefDong?: (r: T) => string | null
  /** Nhãn mục mở trang chi tiết ở menu dòng (vd "Mở hồ sơ khách" khi chi tiết là khách, không phải bản ghi). */
  tenMo?: string
  /** Mã của dòng cho mục "Sao chép <tenMa>" ở menu chuột phải. Không truyền = không có mục này. */
  maDong?: (r: T) => string | null | undefined
  tenMa?: string
  /** Tổng bản ghi khớp lọc — bộ đếm của PhanTrang. */
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
    khu: string
    viDuTen: string
  }
  truong?: TruongF[]
  /** Cột → trường lọc khi khác id (vd cột `trang_thai` ↔ trường `tt`); cùng id thì không cần khai. */
  locCot?: Record<string, string>
  tuyChonLoc?: Record<string, { giaTri: string; nhan: string }[]>
  nutChinh?: ReactNode
  /** Nút icon đứng trước Lọc (vd xuất Excel). */
  congCu?: ReactNode
  thanhDaChon?: ReactNode
  rong: { tieuDe: string; moTa?: string }
  rongLoc?: { tieuDe: string; moTa?: string }
  /** Ghi chú dưới bảng, cạnh phân trang (giới hạn của bộ lọc, nhóm đang xem là gì…). */
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
  const dk = docTatCa(params, truong)
  const truongLoc: TruongLoc[] = truong.map((x) => ({ id: x.id, ten: x.ten, kieu: x.kieu, tuyChon: tuyChonLoc[x.id] ?? [] }))
  const tenGiaTri = (id: string) => (g: string) => tuyChonLoc[id]?.find((x) => x.giaTri === g)?.nhan ?? g
  const { nut: refNutLoc, mo: moLocTruong } = useMoLoc()
  const truongCua = (cotId: string) => locCot[cotId] ?? cotId
  const hangTab = useHangTab({
    bang: tab.bang,
    coDinh: tab.coDinh,
    tabRieng: tab.rieng,
    quyenTabChung: tab.quyenChung,
    nhan,
    khu: tab.khu,
    viDuTen: tab.viDuTen,
    dieuKien: [
      ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
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

  const soCot = cotBang.hien.length + (choChon ? 1 : 0) + 1
  const hep = !!cotDs && rongKhung !== null && rongKhung < RONG_BANG_TOI_THIEU
  const dangLoc = !!q || dk.length > 0
  const rongHien = dangLoc ? (rongLoc ?? { tieuDe: `Không tìm thấy ${nhan} nào`, moTa: 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' }) : rong

  // Chuột phải dòng (TableRow menu / ListView menuDong) — chỉ mục ĐỌC, không thao tác ghi mới. Dòng không có gì → null.
  const menuDong = (r: T) => {
    const h = hrefDong?.(r)
    const m = maDong?.(r)
    if (!h && !m) return null
    return (
      <>
        {h && (
          <>
            <ContextMenuItem onSelect={() => router.push(h)}>
              <ArrowSquareOut aria-hidden="true" />
              {tenMo}
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        {m && (
          <ContextMenuItem onSelect={() => void navigator.clipboard?.writeText(m)}>
            <Copy aria-hidden="true" />
            Sao chép {tenMa}
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
  const coMenu = !!hrefDong || !!maDong

  return (
    <>
      {/* Đầu + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ). */}
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
              {truong.length > 0 && (
                <NutLoc
                  ref={refNutLoc}
                  truong={truongLoc}
                  dieuKien={dk}
                  onDoi={datLoc}
                  // "Xoá bộ lọc" xoá mọi điều kiện lọc trường (giữ tìm, sắp, cột, tab).
                  onXoaHet={() => doiUrl(Object.fromEntries(truong.map((x) => [x.id, null])))}
                  // Trường có cột đang hiện → chip ở nhãn cột; còn lại (cột ẩn, ListView, bảng rỗng) → chip cạnh nút Xoá.
                  coCot={(id) => !hep && rows.length > 0 && cotBang.hien.some((c) => truongCua(c.id) === id)}
                />
              )}
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
                menuDong={coMenu ? menuDong : undefined}
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
                          moLoc={moLocCot(truongCua(c.id), dk, truongLoc, moLocTruong)}
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
                          <TableRow
                            chon={khoaDaChon.has(k)}
                            className={lopDong?.(r)}
                            menu={coMenu ? (menuDong(r) ?? undefined) : undefined}
                            tenMenu={`Thao tác ${moTa(r)}`}
                          >
                            <OChonDong khoa={k} moTa={moTa(r)} />
                            {cotBang.hien.map((c, i) => {
                              const dinh = theoId.get(c.id)!
                              return (
                                <TableCell key={c.id} cot={c.id} phai={c.phai} ghim={laGhim(c, i)} title={dinh.title?.(r) ?? undefined}>
                                  {dinh.o(r, cotBang.kieuNgay(c.id))}
                                </TableCell>
                              )
                            })}
                            <TableCell aria-hidden="true" />
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
      {!rows.length && <EmptyState size="sm" kieu={dangLoc ? 'loc' : 'that'} tieuDe={rongHien.tieuDe} moTa={rongHien.moTa} />}
      {ghiChuLoc && <p role="note" className="mt-3 text-sm text-muted-foreground">{ghiChuLoc}</p>}
      <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan={nhan} />
      {thanhDaChon}
    </>
  )
}
