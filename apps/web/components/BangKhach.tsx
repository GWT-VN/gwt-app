'use client'

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowSquareOut, Copy, LinkSimple } from '@phosphor-icons/react/ssr'
import type { TabView } from '@/app/actions'
import { TAB_KHACH, TRUONG_KHACH } from '@/app/khach-hang/truong-khach'
import { OChonDong, OChonTatCa, OTimKiem, PhanTrang, useDaChon, type SapXep } from '@/bang'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc } from '@/bang/locTruong'
import { useHangTab } from '@/components/HangTab'
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
/** Cột bảng → trường lọc (TRUONG_KHACH): bấm tiêu đề cột mở thẳng pop lọc của trường đó (khuôn F). */
const LOC_COT: Record<string, string> = { province: 'tinh', source: 'nguon' }

/** Menu chuột phải một khách (bảng + ListView): mở chi tiết, sao chép mã, sao chép đường dẫn. */
function MenuKhach({ k, mo }: { k: Khach; mo: (k: Khach) => void }) {
  const ma = k.ma_kh ?? k.customer_code
  return (
    <>
      <ContextMenuItem onSelect={() => mo(k)}>
        <ArrowSquareOut aria-hidden="true" />
        Mở chi tiết
      </ContextMenuItem>
      <ContextMenuSeparator />
      {ma && (
        <ContextMenuItem onSelect={() => void navigator.clipboard?.writeText(ma)}>
          <Copy aria-hidden="true" />
          Sao chép mã khách
        </ContextMenuItem>
      )}
      <ContextMenuItem onSelect={() => void navigator.clipboard?.writeText(`${location.origin}/khach/${k.id}`)}>
        <LinkSimple aria-hidden="true" />
        Sao chép đường dẫn
      </ContextMenuItem>
    </>
  )
}

/** Màn hẹp (< 640): ListView 1–2 dòng như Ticket F. */
const COT_DS: CotDanhSach<Khach>[] = [
  {
    id: 'ten',
    ten: 'Khách',
    rong: 'minmax(0,2fr)',
    dienThoai: 'tren',
    o: (k) => (
      <Link href={`/khach/${k.id}`} prefetch={false} className="min-w-0 truncate font-medium hover:underline">
        {k.full_name}
      </Link>
    ),
  },
  { id: 'sdt', ten: 'SĐT', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (k) => k.primary_phone ?? '—' },
  { id: 'tinh', ten: 'Tỉnh/TP', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai', o: (k) => k.province ?? '—' },
]

/** Danh sách khách CSKH — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). */
export function BangKhach({
  rows, tong, trang, soTrang, sapXep, choChon, tabRieng, quyenTabChung, tuyChonLoc,
  taoKhach, xuatExcel, thanhDaChon,
}: {
  rows: Khach[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  choChon: boolean
  tabRieng: TabView[]
  quyenTabChung: boolean
  /** Giá trị có trong dữ liệu cho Lọc ▸ trường (`tinh`, `nguon`). */
  tuyChonLoc: Record<string, string[]>
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
  const [khungRef, rongKhung] = useRongKhung()

  const q = params.get('q')
  // Hai cờ soát dữ liệu = điều kiện của tab cố định "Cần xin SĐT" / "Kênh cần soát" — tab đang chọn đã nói, không chip (khuôn F).
  const co = [
    { id: 'thieu_sdt', nhan: 'SĐT', giaTri: 'Cần xin lại' },
    { id: 'kenh_tu_dong', nhan: 'Kênh', giaTri: 'Máy tự điền' },
  ].filter((x) => params.get(x.id) === '1')
  // Lọc ▸ trường: server lọc ở DB (listKhachHang) — ở đây chỉ đọc điều kiện để dựng nút Lọc + chip.
  const dk = docTatCa(params, TRUONG_KHACH)
  const truongLoc: TruongLoc[] = TRUONG_KHACH.map((x) => ({
    id: x.id,
    ten: x.ten,
    kieu: x.kieu,
    tuyChon: (tuyChonLoc[x.id] ?? []).map((g) => ({ giaTri: g, nhan: g })),
  }))
  const { nut: refNutLoc, mo: moLocTruong } = useMoLoc()
  const dieuKienTat = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
    ...co.map(({ nhan, giaTri }) => ({ nhan, giaTri })),
    ...dk.map((d) => {
      const x = truongLoc.find((y) => y.id === d.truong)!
      const n = nhanChip(d, x.ten, (g) => g)
      return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
    }),
  ]
  const dangLoc = dieuKienTat.length > 0
  const hangTab = useHangTab({
    bang: 'khach_tab',
    coDinh: TAB_KHACH,
    tabRieng,
    quyenTabChung,
    nhan: 'khách',
    khu: 'CSKH',
    viDuTen: 'VD: Khách Hà Nội',
    dieuKien: dieuKienTat,
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

  function doiSapXep(sap: { cot: string; tang: boolean } | null) {
    doiUrl({ cot: sap?.cot ?? null, chieu: sap ? (sap.tang ? 'asc' : 'desc') : null })
  }

  const datLoc = (id: string, d: DieuKienLoc | null) => doiUrl({ [id]: ghiDieuKien(d, TRUONG_KHACH.find((x) => x.id === id)!.kieu) })
  const moKhach = (k: Khach) => router.push(`/khach/${k.id}`)
  const laBang = rongKhung === null || rongKhung >= RONG_BANG_TOI_THIEU

  return (
    <>
      {/* Đầu + thanh lọc + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ) — khoảng cách 16 của KhungChon chỉ áp
          giữa bảng và phần dưới (trạng thái rỗng, phân trang, thanh hàng loạt). */}
      <div className="border-none border-current">
      <DataViewToolbar
        tieuDe="Khách hàng"
        timKiem={<OTimKiem placeholder="Tên, SĐT, mã khách…" aria-label="Tìm khách hàng" />}
        nutChinh={taoKhach}
        tabs={hangTab.tabs}
        dangXem="bang"
        loc={
          <>
            {xuatExcel}
            {/* "Xoá bộ lọc" xoá điều kiện lọc trường (giữ tìm, tab, sắp, cột). */}
            <NutLoc
              ref={refNutLoc}
              truong={truongLoc}
              dieuKien={dk}
              onDoi={datLoc}
              onXoaHet={() => doiUrl(Object.fromEntries(TRUONG_KHACH.map((x) => [x.id, null])))}
              coCot={(id) => laBang && rows.length > 0 && cotBang.hien.some((c) => LOC_COT[c.id] === id)}
            />
          </>
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
      {/* Khung < 640 (điện thoại) → ListView; còn lại Bảng, hết chỗ thì cuộn ngang (khuôn Ticket F). */}
      <div ref={khungRef} className="border-none border-current">
      {!laBang ? (
        rows.length > 0 && (
          <ListView
            aria-label="Khách hàng"
            cot={COT_DS}
            dong={rows}
            khoa={(k) => k.id}
            onMo={moKhach}
            moKhi="ten"
            menuDong={(k) => <MenuKhach k={k} mo={moKhach} />}
          />
        )
      ) : (
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
                    moLoc={LOC_COT[cot.id] ? moLocCot(LOC_COT[cot.id], dk, truongLoc, moLocTruong) : undefined}
                  />
                ))}
                <ThemCot cot={COT} an={cotBang.an} onHien={cotBang.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((khach) => (
                <TableRow
                  key={khach.id}
                  chon={khoaDaChon.has(khach.id)}
                  menu={<MenuKhach k={khach} mo={moKhach} />}
                  tenMenu={`Thao tác ${khach.full_name}`}
                >
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
      )}
      </div>
      </div>
      {!rows.length && (
        <EmptyState
          size="sm"
          kieu={dangLoc ? 'loc' : 'that'}
          tieuDe={dangLoc ? 'Không tìm thấy khách nào' : 'Chưa có khách hàng'}
          moTa={dangLoc ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' : 'Tạo khách hàng để bắt đầu theo dõi liên hệ và máy đã lắp.'}
        />
      )}
      {/* Bộ đếm DUY NHẤT của màn (khuôn F): tổng khách khớp lọc. */}
      <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan="khách" />
      {thanhDaChon}
    </>
  )
}
