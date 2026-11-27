'use client'

import { useRef, useState, type ReactNode } from 'react'
import { BookmarkSimple, Funnel, Trash } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { luuBangView, xoaBangView, type BangView } from '@/app/actions'
import { hrefBoLoc, OChonDong, OChonTatCa, OTimKiem, PhanTrang, ThanhDangLoc, useDaChon, type SapXep } from '@/bang'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CaiDatHienThi, DataViewToolbar, type CaiDatRef } from '@/components/ui/data-view-toolbar'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { SavedView } from '@/components/ui/saved-view'
import { thongBao } from '@/components/ui/sonner'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { ThemCot } from '@/components/ui/them-cot'
import { ColCotBang, KeoCot, TieuDeCot } from '@/components/ui/tieu-de-cot'
import { TooltipNhanh } from '@/components/ui/tooltip'
import { laGhim, RONG_O_CHON, RONG_THEM_COT, useCotBang, type CotBang } from '@/components/ui/use-cot-bang'

type Khach = {
  id: string; full_name: string; primary_phone: string | null; address: string | null
  province: string | null; source: string | null; notes: string | null; machines: number
  ma_kh: string | null; customer_code: string | null
}

const COT: (CotBang & { id: Exclude<keyof Khach, 'id'> })[] = [
  { id: 'full_name', ten: 'Khách', kieu: 'sap', khoa: true, toiThieu: 128, rongToiDa: 260, nghia: { tang: 'Tên từ A đến Z', giam: 'Tên từ Z đến A' } },
  { id: 'ma_kh', ten: 'Mã KH', kieu: 'sap', toiThieu: 100, nghia: { tang: 'Mã nhỏ trước', giam: 'Mã lớn trước' } },
  { id: 'primary_phone', ten: 'SĐT', kieu: 'thuong', batBuoc: true, toiThieu: 112 },
  { id: 'address', ten: 'Địa chỉ', kieu: 'thuong', toiThieu: 124, rongToiDa: 320 },
  { id: 'province', ten: 'Tỉnh/TP', kieu: 'sap', toiThieu: 92, nghia: { tang: 'Tỉnh/TP từ A đến Z', giam: 'Tỉnh/TP từ Z đến A' } },
  { id: 'machines', ten: 'Máy', kieu: 'thuong', phai: true },
  { id: 'customer_code', ten: 'Mã Sales', kieu: 'thuong', anMacDinh: true },
  { id: 'source', ten: 'Nguồn', kieu: 'thuong', anMacDinh: true, rongToiDa: 180 },
  { id: 'notes', ten: 'Ghi chú', kieu: 'thuong', anMacDinh: true, rongToiDa: 320 },
]
const THEO_ID = new Map(COT.map((cot) => [String(cot.id), cot]))

/** Danh sách khách CSKH: cùng bố cục bảng dữ liệu DS với Ticket F. */
export function BangKhach({
  rows, tong, trang, soTrang, sapXep, choChon, choViewChung, views,
  soThieuSdt, soKenhTuDong, taoKhach, xuatExcel, thanhDaChon,
}: {
  rows: Khach[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  choChon: boolean
  choViewChung: boolean
  views: BangView[]
  soThieuSdt: number
  soKenhTuDong: number
  taoKhach: ReactNode
  xuatExcel: ReactNode
  thanhDaChon?: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const cotBang = useCotBang(COT, { url: true })
  const { refBang } = cotBang
  const caiDat = useRef<CaiDatRef>(null)
  const { daChon } = useDaChon()
  const khoaDaChon = new Set(daChon)
  const [viewId, setViewId] = useState<string | null>(null)
  const [viewXoa, setViewXoa] = useState<BangView | null>(null)
  const [loiXoa, setLoiXoa] = useState<string>()
  const nutLuu = useRef<HTMLButtonElement>(null)
  const viewDangChon = views.find((view) => view.id === viewId)

  const q = params.get('q')
  const boLoc = [
    { id: 'thieu_sdt', ten: 'Cần xin lại SĐT', nhan: 'SĐT', giaTri: 'Cần xin lại', so: soThieuSdt },
    { id: 'kenh_tu_dong', ten: 'Kênh máy tự điền, cần soát', nhan: 'Kênh', giaTri: 'Máy tự điền', so: soKenhTuDong },
  ].map((loc) => ({ ...loc, bat: params.get(loc.id) === '1' }))
  const locDangBat = boLoc.filter((loc) => loc.bat)
  const dieuKien = [
    ...(q ? [{ nhan: 'Từ khoá', giaTri: q, href: hrefBoLoc(pathname, params, 'q') }] : []),
    ...locDangBat.map(({ id, nhan, giaTri }) => ({ nhan, giaTri, href: hrefBoLoc(pathname, params, id) })),
  ]
  const hrefXoaLoc = hrefBoLoc(pathname, params, 'q', 'thieu_sdt', 'kenh_tu_dong', 'cot', 'chieu')

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

  function doiSapXep(sap: { cot: string; tang: boolean } | null) {
    doiUrl({ cot: sap?.cot ?? null, chieu: sap ? (sap.tang ? 'asc' : 'desc') : null })
  }

  function chonView(id: string | null) {
    setViewId(id)
    const view = views.find((v) => v.id === id)
    if (view) cotBang.datCotHien(view.cot)
    else cotBang.datLai()
  }

  async function luuView({ ten, chiaSe }: { ten: string; chiaSe: boolean }) {
    const ketQua = await luuBangView('cs_customers', ten, cotBang.hien.map((cot) => cot.id), chiaSe)
    if (!ketQua.ok) return { loi: ketQua.error }
    thongBao.xong(`Đã lưu chế độ xem “${ten}”`)
  }

  async function xoaView() {
    if (!viewXoa) return
    setLoiXoa(undefined)
    const ketQua = await xoaBangView(viewXoa.id)
    if (!ketQua.ok) {
      setLoiXoa(ketQua.error)
      throw new Error(ketQua.error)
    }
    if (viewId === viewXoa.id) {
      chonView(null)
      requestAnimationFrame(() => nutLuu.current?.focus())
    }
    thongBao.xong(`Đã xoá chế độ xem “${viewXoa.ten}”`)
  }

  return (
    <>
      <DataViewToolbar
        tieuDe="Khách hàng"
        dem={{ thay: rows.length, tong }}
        timKiem={<OTimKiem placeholder="Tên, SĐT, mã khách…" aria-label="Tìm khách hàng" />}
        nutChinh={taoKhach}
        tabs={
          <div className="flex flex-wrap items-center gap-2 pl-1">
            {views.length > 0 && (
              <div className="w-48 max-w-full">
                <Combobox
                  aria-label="Chế độ xem"
                  placeholder="Mặc định"
                  searchPlaceholder="Tìm chế độ xem…"
                  value={viewDangChon?.id ?? null}
                  options={views.map((v) => ({ gt: v.id, nhan: v.ten + (v.chu === 'chung' ? ' (chung)' : '') }))}
                  onValueChange={chonView}
                />
              </div>
            )}
            <SavedView
              khu="CSKH"
              dieuKien={[]}
              query=""
              trigger={
                <Button ref={nutLuu} variant="ghost" size="sm">
                  <BookmarkSimple aria-hidden="true" />
                  Lưu chế độ xem
                </Button>
              }
              chu={{
                tieuDe: 'Lưu cột của bảng',
                nhanTen: 'Tên chế độ xem',
                placeholder: 'Ví dụ: Danh sách liên hệ',
                loiTrong: 'Nhập tên để tìm lại cách hiển thị này.',
                chiaSe: choViewChung && 'Chia sẻ cho mọi người',
                xong: false,
              }}
              onLuu={luuView}
            />
            {viewDangChon && (viewDangChon.chu !== 'chung' || choViewChung) && (
              <TooltipNhanh content="Xoá chế độ xem đã chọn">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Xoá chế độ xem ${viewDangChon.ten}`}
                  onClick={() => {
                    setLoiXoa(undefined)
                    setViewXoa(viewDangChon)
                  }}
                >
                  <Trash aria-hidden="true" />
                </Button>
              </TooltipNhanh>
            )}
            {xuatExcel}
          </div>
        }
        dangXem="bang"
        loc={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant={locDangBat.length ? 'secondary' : 'ghost'}>
                <Funnel aria-hidden="true" />
                Lọc
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {boLoc.map((loc) => (
                <DropdownMenuCheckboxItem
                  key={loc.id}
                  checked={loc.bat}
                  onCheckedChange={(bat) => doiUrl({ [loc.id]: bat ? '1' : null })}
                >
                  {loc.ten} ({loc.so})
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
        caiDat={
          <CaiDatHienThi
            ref={caiDat}
            dangXem="bang"
            cot={cotBang.thuTu.map((id) => THEO_ID.get(id)!)}
            cotAn={cotBang.an}
            onCotAn={(an) => COT.forEach((cot) => cotBang.anHien(cot.id, !an.includes(cot.id)))}
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
        nhan="khách"
        anSoDong
        sapXep={sapXep.macDinh ? undefined : sapXep}
        hrefXoaLoc={hrefXoaLoc}
      />
      <TableWrap tabIndex={0} role="region" aria-label="Vùng cuộn bảng khách hàng">
        <KeoCot cot={cotBang.hien} doiCho={cotBang.doiCho}>
          <Table
            ref={refBang}
            aria-label="Khách hàng"
            layout="fixed"
            style={{ minWidth: cotBang.tongRong + RONG_THEM_COT + (choChon ? RONG_O_CHON : 0) }}
          >
            <ColCotBang hien={cotBang.hien} doRong={cotBang.doRong} choDo={cotBang.choDo} chon={choChon} />
            <TableHeader>
              <TableRow>
                <OChonTatCa nhan="khách" />
                {cotBang.hien.map((cot, i) => (
                  <TieuDeCot
                    key={cot.id}
                    cot={cot}
                    viTri={i}
                    menuPhai={i === cotBang.hien.length - 1}
                    menuCot={cotBang.menuCot(cot.id)}
                    coDan={{ rong: cotBang.doRong[cot.id], onDoi: (px) => cotBang.coDan(cot.id, px) }}
                    sap={cot.kieu === 'sap' ? {
                      chieu: sapXep.cot === cot.id ? (sapXep.tang ? 'tang' : 'giam') : null,
                      macDinh: sapXep.macDinh,
                      onDoi: (chieu) => doiSapXep(chieu ? { cot: cot.id, tang: chieu === 'tang' } : null),
                    } : undefined}
                  />
                ))}
                <ThemCot cot={COT} an={cotBang.an} onHien={cotBang.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((khach) => (
                <TableRow key={khach.id} chon={khoaDaChon.has(khach.id)}>
                  <OChonDong khoa={khach.id} moTa={`khách ${khach.full_name}`} />
                  {cotBang.hien.map((cot, i) => {
                    const giaTri = khach[THEO_ID.get(cot.id)!.id]
                    return (
                      <TableCell key={cot.id} cot={cot.id} phai={cot.phai} ghim={laGhim(cot, i)} title={giaTri?.toString()}>
                        {cot.id === 'full_name' ? (
                          <Link href={`/khach/${khach.id}`} prefetch={false} className="font-medium hover:underline">
                            {khach.full_name}
                          </Link>
                        ) : cot.id === 'primary_phone' && giaTri == null ? (
                          <span className="text-(--color-text-warning)" aria-label="Chưa có số điện thoại">—</span>
                        ) : giaTri ?? '—'}
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
      {!rows.length && (
        <EmptyState
          size="sm"
          kieu={dieuKien.length ? 'loc' : 'that'}
          tieuDe={dieuKien.length ? 'Không tìm thấy khách nào' : 'Chưa có khách hàng'}
          moTa={dieuKien.length ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' : 'Tạo khách hàng để bắt đầu theo dõi liên hệ và máy đã lắp.'}
        />
      )}
      <PhanTrang trang={trang} soTrang={soTrang} />
      {thanhDaChon}
      <ConfirmDialog
        open={viewXoa != null}
        onOpenChange={(mo) => { if (!mo) setViewXoa(null) }}
        tieuDe={`Xoá chế độ xem “${viewXoa?.ten ?? ''}”?`}
        moTa="Cấu hình cột đã lưu sẽ bị xoá."
        nutXacNhan="Xoá chế độ xem"
        pha
        loi={loiXoa}
        onXacNhan={xoaView}
      />
    </>
  )
}
