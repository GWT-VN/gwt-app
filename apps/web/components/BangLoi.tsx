'use client'

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowSquareOut, Copy, LinkSimple } from '@phosphor-icons/react/ssr'
import type { CoreDue, TabView } from '@/app/actions'
import { SAP, TAB_LOI, TRUONG_LOI, TT_LOI } from '@/app/loi/truong-loi'
import { OChonDong, OChonTatCa, OTimKiem, PhanTrang, useDaChon, type SapXep } from '@/bang'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc } from '@/bang/locTruong'
import { useHangTab } from '@/components/HangTab'
import { ThayLoiButton } from '@/components/ThayLoiButton'
import { Badge } from '@/components/ui/badge'
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
import { hienNgay, type KieuNgay } from '@/lib/dinh-dang-ngay'
import { saoChep } from '@/lib/sao-chep'

function HanBadge({ tt, ngay }: { tt: string; ngay: number | null }) {
  if (tt === 'QUÁ HẠN') return <Badge variant="soft" color="danger">Quá {Math.abs(ngay ?? 0)} ngày</Badge>
  if (tt === SAP) return <Badge variant="soft" color="warning">Còn {ngay} ngày</Badge>
  if (tt.startsWith('không rõ')) return <Badge variant="soft" color="secondary">Không rõ</Badge>
  return <Badge variant="soft" color="success">Còn {ngay} ngày</Badge>
}

const khoaDong = (r: CoreDue) => `${r.serial}-${r.filter_code}`

/** `id` = khoá sắp xếp của coreForecast (COT_LOI) cho cột `sap`. */
const COT: CotBang[] = [
  { id: 'customer_name', ten: 'Khách', kieu: 'sap', khoa: true, toiThieu: 128, rongToiDa: 260, nghia: { tang: 'Tên từ A đến Z', giam: 'Tên từ Z đến A' } },
  { id: 'primary_phone', ten: 'SĐT', kieu: 'thuong', toiThieu: 112 },
  { id: 'serial', ten: 'Serial', kieu: 'sap', toiThieu: 112, nghia: { tang: 'Serial từ A đến Z', giam: 'Serial từ Z đến A' } },
  { id: 'product_name', ten: 'Máy', kieu: 'thuong', toiThieu: 120, rongToiDa: 260 },
  { id: 'filter_code', ten: 'Lõi cần thay', kieu: 'thuong', rongToiDa: 280 },
  { id: 'chu_ky', ten: 'Chu kỳ', kieu: 'thuong' },
  { id: 'moc_tinh', ten: 'Mốc tính', kieu: 'thuong', ngay: true },
  { id: 'nguon_moc', ten: 'Tính từ', kieu: 'thuong' },
  { id: 'tinh_trang', ten: 'Tình trạng', kieu: 'thuong' },
  { id: 'han_som', ten: 'Đến hạn', kieu: 'sap', ngay: true, nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' } },
  { id: 'ghi', ten: 'Ghi log', kieu: 'thuong' },
]
const THEO_ID = new Map(COT.map((cot) => [cot.id, cot]))
/** Cột bảng → trường lọc (TRUONG_LOI): bấm tiêu đề mở thẳng pop lọc (khuôn F; pop có chân "Định dạng ngày" cho cột ngày). */
const LOC_COT: Record<string, string> = { tinh_trang: 'tt', han_som: 'han' }

const duongDanMay = (r: CoreDue) => `/may/${encodeURIComponent(r.serial)}`

/** Menu chuột phải một dòng lõi (bảng + ListView): chi tiết = trang máy của dòng. */
function MenuLoi({ r, mo }: { r: CoreDue; mo: (r: CoreDue) => void }) {
  return (
    <>
      <ContextMenuItem onSelect={() => mo(r)}>
        <ArrowSquareOut aria-hidden="true" />
        Mở chi tiết máy
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => void saoChep(r.serial)}>
        <Copy aria-hidden="true" />
        Sao chép serial
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => void saoChep(location.origin + duongDanMay(r))}>
        <LinkSimple aria-hidden="true" />
        Sao chép đường dẫn
      </ContextMenuItem>
    </>
  )
}

const O: Record<string, (r: CoreDue, kieuNgay: KieuNgay) => { o: ReactNode; title?: string }> = {
  customer_name: (r) => ({
    o: r.customer_id ? (
      <Link href={`/khach/${r.customer_id}`} prefetch={false} className="font-medium hover:underline">
        {r.customer_name}
      </Link>
    ) : (
      '—'
    ),
    title: r.customer_name ?? undefined,
  }),
  primary_phone: (r) => ({
    o: r.primary_phone ? (
      <span className="tabular-nums">{r.primary_phone}</span>
    ) : (
      <span className="text-(--color-text-warning)" aria-label="Chưa có số điện thoại">—</span>
    ),
  }),
  serial: (r) => ({
    o: (
      <Link href={duongDanMay(r)} prefetch={false} className="tabular-nums hover:underline">
        {r.serial}
      </Link>
    ),
    title: r.serial,
  }),
  product_name: (r) => ({ o: r.product_name ?? '—', title: r.product_name ?? undefined }),
  filter_code: (r) => ({
    o: (
      <>
        <span className="tabular-nums">{r.filter_code}</span>
        {r.filter_name && <span className="text-muted-foreground"> · {r.filter_name}</span>}
      </>
    ),
    title: [r.filter_code, r.filter_name].filter(Boolean).join(' · '),
  }),
  chu_ky: (r) => ({ o: r.chu_ky_raw ?? '—', title: r.chu_ky_raw ?? undefined }),
  moc_tinh: (r, k) => ({ o: <span className="tabular-nums">{hienNgay(r.moc_tinh, k)}</span> }),
  nguon_moc: (r) => ({ o: r.lan_thay_gan_nhat ? 'Lần thay gần nhất' : 'Ngày lắp (chưa có log thay)' }),
  tinh_trang: (r) => ({ o: <HanBadge tt={r.tinh_trang} ngay={r.con_bao_nhieu_ngay} /> }),
  han_som: (r, k) => ({ o: <span className="tabular-nums">{hienNgay(r.han_som, k)}</span> }),
  ghi: (r) => ({ o: <ThayLoiButton serial={r.serial} filterCode={r.filter_code} filterName={r.filter_name} compact /> }),
}

/** Màn hẹp (< 640): ListView 1–2 dòng như Ticket F; nút "Đã thay" giữ trên điện thoại (thao tác chính của màn). */
const COT_DS: CotDanhSach<CoreDue>[] = [
  {
    id: 'ten',
    ten: 'Khách',
    rong: 'minmax(0,2fr)',
    dienThoai: 'tren',
    o: (r) => (
      <Link href={duongDanMay(r)} prefetch={false} className="min-w-0 truncate font-medium hover:underline">
        {r.customer_name ?? r.serial}
      </Link>
    ),
  },
  { id: 'ghi', ten: 'Ghi log', rong: 'auto', dienThoai: 'trenPhai', o: (r) => <ThayLoiButton serial={r.serial} filterCode={r.filter_code} filterName={r.filter_name} compact /> },
  { id: 'loi', ten: 'Lõi', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (r) => r.filter_code },
  { id: 'han', ten: 'Đến hạn', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai', o: (r) => <HanBadge tt={r.tinh_trang} ngay={r.con_bao_nhieu_ngay} /> },
]

/** Lịch thay lõi `/loi` — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). */
export function BangLoi({
  rows, tong, trang, soTrang, sapXep, choChon, tabRieng, quyenTabChung, canhBao, xuatExcel, thanhDaChon,
}: {
  rows: CoreDue[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  choChon: boolean
  tabRieng: TabView[]
  quyenTabChung: boolean
  /** Lời nhắc theo bộ lọc đang xem (vd tab Quá hạn) — đứng ngay trên bảng. */
  canhBao?: ReactNode
  xuatExcel?: ReactNode
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
  // Lọc ▸ trường: server lọc ở DB (coreForecast) — ở đây chỉ đọc điều kiện để dựng nút Lọc + chip.
  const dk = docTatCa(params, TRUONG_LOI)
  const truongLoc: TruongLoc[] = TRUONG_LOI.map((x) => ({ id: x.id, ten: x.ten, kieu: x.kieu, tuyChon: x.id === 'tt' ? TT_LOI : undefined }))
  const tenGiaTri = (g: string) => TT_LOI.find((y) => y.giaTri === g)?.nhan ?? g
  const { nut: refNutLoc, mo: moLocTruong } = useMoLoc()
  const dieuKienTat = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
    ...dk.map((d) => {
      const n = nhanChip(d, truongLoc.find((y) => y.id === d.truong)!.ten, tenGiaTri)
      return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
    }),
  ]
  const dangLoc = dieuKienTat.length > 0
  const hangTab = useHangTab({
    bang: 'loi_tab',
    coDinh: TAB_LOI,
    tabRieng,
    quyenTabChung,
    nhan: 'dòng lõi',
    khu: 'CSKH',
    viDuTen: 'VD: Quá hạn tháng này',
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

  const datLoc = (id: string, d: DieuKienLoc | null) => doiUrl({ [id]: ghiDieuKien(d, TRUONG_LOI.find((x) => x.id === id)!.kieu) })
  const moMay = (r: CoreDue) => router.push(duongDanMay(r))
  const laBang = rongKhung === null || rongKhung >= RONG_BANG_TOI_THIEU

  return (
    <>
      {/* Đầu + thanh lọc + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ). */}
      <div className="border-none border-current">
      <DataViewToolbar
        tieuDe="Lịch thay lõi"
        timKiem={<OTimKiem placeholder="Serial, khách, SĐT, mã lõi…" aria-label="Tìm lịch thay lõi" />}
        tabs={hangTab.tabs}
        dangXem="bang"
        loc={
          <>
            {xuatExcel}
            {/* "Xoá bộ lọc" xoá điều kiện lọc trường (giữ tìm, sắp, cột). */}
            <NutLoc
              ref={refNutLoc}
              truong={truongLoc}
              dieuKien={dk}
              onDoi={datLoc}
              onXoaHet={() => doiUrl(Object.fromEntries(TRUONG_LOI.map((x) => [x.id, null])))}
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
      {canhBao}
      {/* Khung < 640 (điện thoại) → ListView; còn lại Bảng, hết chỗ thì cuộn ngang (khuôn Ticket F). */}
      <div ref={khungRef} className="border-none border-current">
      {!laBang ? (
        rows.length > 0 && (
          <ListView
            aria-label="Lịch thay lõi"
            cot={COT_DS}
            dong={rows}
            khoa={khoaDong}
            onMo={moMay}
            moKhi="ten"
            menuDong={(r) => <MenuLoi r={r} mo={moMay} />}
          />
        )
      ) : (
      <TableWrap tabIndex={0} role="region" aria-label="Vùng cuộn bảng lịch thay lõi">
        <KeoCot cot={cotBang.hien} doiCho={cotBang.doiCho}>
          <Table
            ref={refBang}
            aria-label="Lịch thay lõi"
            layout="fixed"
            style={{ minWidth: cotBang.tongRong + RONG_THEM_COT + (choChon ? RONG_O_CHON : 0) }}
          >
            <ColCotBang hien={cotBang.hien} doRong={cotBang.doRong} choDo={cotBang.choDo} chon={choChon} />
            <TableHeader>
              <TableRow>
                <OChonTatCa nhan="dòng lõi" />
                {cotBang.hien.map((cot, i) => (
                  <TieuDeCot
                    key={cot.id}
                    cot={cot}
                    viTri={i}
                    menuPhai={i === cotBang.hien.length - 1}
                    menuCot={cotBang.menuCot(cot.id)}
                    ngay={cotBang.ngayCot(cot.id)}
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
              {/* Khoá dòng = (serial, filter_code): một máy có NHIỀU lõi nên riêng serial không định danh được một dòng. */}
              {rows.map((r) => (
                <TableRow
                  key={khoaDong(r)}
                  chon={khoaDaChon.has(khoaDong(r))}
                  menu={<MenuLoi r={r} mo={moMay} />}
                  tenMenu={`Thao tác lõi ${r.filter_code} · ${r.serial}`}
                >
                  <OChonDong khoa={khoaDong(r)} moTa={`lõi ${r.filter_code} của máy ${r.serial}`} />
                  {cotBang.hien.map((cot, i) => {
                    const { o, title } = O[cot.id](r, cotBang.kieuNgay(cot.id))
                    return (
                      <TableCell key={cot.id} cot={cot.id} phai={cot.phai} ghim={laGhim(cot, i)} title={title}>
                        {o}
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
          tieuDe={dangLoc ? 'Không có lõi nào khớp' : 'Chưa có lịch thay lõi'}
          moTa={dangLoc ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' : 'Lõi tới hạn thay theo từng máy sẽ hiện ở đây.'}
        />
      )}
      {/* Bộ đếm DUY NHẤT của màn (khuôn F): tổng dòng (máy × lõi) khớp lọc. */}
      <PhanTrang trang={trang} soTrang={soTrang} tong={tong} nhan="dòng lõi" />
      {thanhDaChon}
    </>
  )
}
