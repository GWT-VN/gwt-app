'use client'

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Machine, TabView } from '@/app/actions'
import { BH_MAY, KHOA_LOC_MAY, TAB_MAY, TRUONG_MAY } from '@/app/may/truong-may'
import { hrefBoLoc, OChonDong, OChonTatCa, OTimKiem, PhanTrang, ThanhDangLoc, useDaChon, type SapXep } from '@/bang'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc } from '@/bang/locTruong'
import { useHangTab } from '@/components/HangTab'
import { Badge } from '@/components/ui/badge'
import { ChipLoc, NutLoc, useMoLoc, type TruongLoc } from '@/components/ui/bo-loc-truong'
import { CaiDatHienThi, DataViewToolbar, type CaiDatRef } from '@/components/ui/data-view-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { ListView, type CotDanhSach } from '@/components/ui/list-view'
import { Table, TableBody, TableCell, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { ThemCot } from '@/components/ui/them-cot'
import { ColCotBang, KeoCot, TieuDeCot } from '@/components/ui/tieu-de-cot'
import { laGhim, RONG_O_CHON, RONG_THEM_COT, useCotBang, type CotBang } from '@/components/ui/use-cot-bang'
import { RONG_BANG_TOI_THIEU, useRongKhung } from '@/components/ui/use-rong-khung'
import { laMaBo } from '@/lib/danhSach'
import { hienNgay, type KieuNgay } from '@/lib/dinh-dang-ngay'

/** Bảo hành — cùng nhánh WarrantyBadge (components/Badge.tsx), kiểu Badge DS soft. */
function BaoHanhMay({ m }: { m: Machine }) {
  if (laMaBo(m.internal_code) && !m.warranty_activated)
    return <Badge variant="soft" color="discovery" title="Bộ hệ thống — bảo hành ở từng thiết bị con">Bộ (đầu hệ)</Badge>
  if (!m.warranty_activated) return <Badge variant="soft" color="secondary">Chưa kích hoạt</Badge>
  if (!m.co_chinh_sach_bh)
    return <Badge variant="soft" color="warning" title="Máy chưa có số năm bảo hành trong product_warranty">Không rõ hạn</Badge>
  if (m.con_han_may) return <Badge variant="soft" color="success">Còn BH máy</Badge>
  if (m.con_han_loi) return <Badge variant="soft" color="info">Hết BH máy · còn BH linh kiện</Badge>
  return <Badge variant="soft" color="danger">Hết bảo hành</Badge>
}

/** `id` = khoá sắp xếp của searchMachines (COT_MAY) cho cột `sap`. */
const COT: CotBang[] = [
  { id: 'serial', ten: 'Serial', kieu: 'sap', khoa: true, toiThieu: 112, nghia: { tang: 'Serial từ A đến Z', giam: 'Serial từ Z đến A' } },
  { id: 'product_name', ten: 'Máy', kieu: 'sap', toiThieu: 120, rongToiDa: 280, nghia: { tang: 'Tên máy từ A đến Z', giam: 'Tên máy từ Z đến A' } },
  { id: 'customer_name', ten: 'Khách', kieu: 'sap', toiThieu: 128, rongToiDa: 260, nghia: { tang: 'Tên từ A đến Z', giam: 'Tên từ Z đến A' } },
  { id: 'primary_phone', ten: 'SĐT', kieu: 'thuong', toiThieu: 112 },
  { id: 'install_date', ten: 'Ngày lắp', kieu: 'sap', ngay: true, nghia: { tang: 'Lắp lâu nhất trước', giam: 'Lắp gần nhất trước' } },
  { id: 'warranty_full_end', ten: 'Bảo hành', kieu: 'sap', nghia: { tang: 'Hết hạn BH sớm nhất trước', giam: 'Hết hạn BH muộn nhất trước' } },
]
const THEO_ID = new Map(COT.map((cot) => [cot.id, cot]))

const O: Record<string, (m: Machine, kieuNgay: KieuNgay) => { o: ReactNode; title?: string }> = {
  serial: (m) => ({
    o: (
      <Link href={`/may/${encodeURIComponent(m.serial)}`} prefetch={false} className="font-medium tabular-nums hover:underline">
        {m.serial}
      </Link>
    ),
    title: m.serial,
  }),
  product_name: (m) => ({ o: m.product_name ?? '—', title: m.product_name ?? undefined }),
  customer_name: (m) => ({
    o: m.customer_id ? (
      <Link href={`/khach/${m.customer_id}`} prefetch={false} className="hover:underline">
        {m.customer_name}
      </Link>
    ) : (
      '—'
    ),
    title: m.customer_name ?? undefined,
  }),
  primary_phone: (m) => ({
    o: m.primary_phone ? (
      <span className="tabular-nums">{m.primary_phone}</span>
    ) : (
      <span className="text-(--color-text-warning)" aria-label="Chưa có số điện thoại">—</span>
    ),
  }),
  install_date: (m, k) => ({ o: <span className="tabular-nums">{hienNgay(m.install_date, k)}</span> }),
  warranty_full_end: (m) => ({ o: <BaoHanhMay m={m} /> }),
}

/** Màn hẹp (< 640): ListView 1–2 dòng như Ticket F. */
const COT_DS: CotDanhSach<Machine>[] = [
  {
    id: 'ten',
    ten: 'Serial',
    rong: 'minmax(0,2fr)',
    dienThoai: 'tren',
    o: (m) => (
      <Link href={`/may/${encodeURIComponent(m.serial)}`} prefetch={false} className="min-w-0 truncate font-medium hover:underline">
        {m.serial}
      </Link>
    ),
  },
  { id: 'khach', ten: 'Khách', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (m) => m.customer_name ?? '—' },
  { id: 'bh', ten: 'Bảo hành', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai', o: (m) => <BaoHanhMay m={m} /> },
]

/** Máy đã lắp `/` — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). */
export function BangMay({
  rows, tong, trang, soTrang, sapXep, choChon, tabRieng, quyenTabChung, demTab, tuyChonSp, xuatExcel, thanhDaChon,
}: {
  rows: Machine[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  choChon: boolean
  tabRieng: TabView[]
  quyenTabChung: boolean
  demTab: Record<string, number>
  /** Lọc ▸ Sản phẩm: mã nội bộ + nhãn (machineModels). */
  tuyChonSp: { giaTri: string; nhan: string }[]
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
  // Lọc ▸ trường: server lọc ở DB (searchMachines) — ở đây chỉ đọc điều kiện để dựng nút Lọc + chip.
  const dk = docTatCa(params, TRUONG_MAY)
  const tuyChon: Record<string, { giaTri: string; nhan: string }[]> = { sp: tuyChonSp, bh: BH_MAY }
  const truongLoc: TruongLoc[] = TRUONG_MAY.map((x) => ({ ...x, tuyChon: tuyChon[x.id] }))
  const tenGiaTri = (id: string) => (g: string) => tuyChon[id]?.find((y) => y.giaTri === g)?.nhan ?? g
  const { nut: refNutLoc, chip: refChipLoc } = useMoLoc()
  const dieuKienTat = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
    ...dk.map((d) => {
      const n = nhanChip(d, truongLoc.find((y) => y.id === d.truong)!.ten, tenGiaTri(d.truong))
      return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
    }),
  ]
  const hrefXoaLoc = hrefBoLoc(pathname, params, ...KHOA_LOC_MAY)
  const hangTab = useHangTab({
    bang: 'may_tab',
    coDinh: TAB_MAY,
    tabRieng,
    demTab,
    quyenTabChung,
    nhan: 'máy',
    khu: 'CSKH',
    viDuTen: 'VD: Máy chưa kích hoạt BH',
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

  const datLoc = (id: string, d: DieuKienLoc | null) => doiUrl({ [id]: ghiDieuKien(d, TRUONG_MAY.find((x) => x.id === id)!.kieu) })
  const dieuKien = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q, href: hrefBoLoc(pathname, params, 'q') }] : []),
    ...dk.map((d) => {
      const x = truongLoc.find((y) => y.id === d.truong)!
      return { nhan: x.ten, giaTri: '', chip: <ChipLoc ref={refChipLoc(d.truong)} truong={x} dieuKien={d} onDoi={datLoc} /> }
    }),
  ]

  return (
    <>
      {/* Đầu + thanh lọc + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ). */}
      <div className="border-none border-current">
      <DataViewToolbar
        tieuDe="Máy đã lắp"
        dem={{ thay: rows.length, tong }}
        timKiem={<OTimKiem placeholder="Serial, tên khách, SĐT…" aria-label="Tìm máy" />}
        tabs={hangTab.tabs}
        dangXem="bang"
        loc={
          <>
            {xuatExcel}
            <NutLoc ref={refNutLoc} truong={truongLoc} dieuKien={dk} onDoi={datLoc} />
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
      <ThanhDangLoc
        dieuKien={dieuKien}
        hienThi={rows.length}
        tong={tong}
        nhan="máy"
        anSoDong
        sapXep={sapXep.macDinh ? undefined : sapXep}
        hrefXoaLoc={hrefXoaLoc}
      />
      {/* Khung < 640 (điện thoại) → ListView; còn lại Bảng, hết chỗ thì cuộn ngang (khuôn Ticket F). */}
      <div ref={khungRef} className="border-none border-current">
      {rongKhung !== null && rongKhung < RONG_BANG_TOI_THIEU ? (
        rows.length > 0 && (
          <ListView
            aria-label="Máy đã lắp"
            cot={COT_DS}
            dong={rows}
            khoa={(m) => m.serial}
            onMo={(m) => router.push(`/may/${encodeURIComponent(m.serial)}`)}
            moKhi="ten"
          />
        )
      ) : (
      <TableWrap tabIndex={0} role="region" aria-label="Vùng cuộn bảng máy đã lắp">
        <KeoCot cot={cotBang.hien} doiCho={cotBang.doiCho}>
          <Table
            ref={refBang}
            aria-label="Máy đã lắp"
            layout="fixed"
            style={{ minWidth: cotBang.tongRong + RONG_THEM_COT + (choChon ? RONG_O_CHON : 0) }}
          >
            <ColCotBang hien={cotBang.hien} doRong={cotBang.doRong} choDo={cotBang.choDo} chon={choChon} />
            <TableHeader>
              <TableRow>
                <OChonTatCa nhan="máy" />
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
                  />
                ))}
                <ThemCot cot={COT} an={cotBang.an} onHien={cotBang.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.serial} chon={khoaDaChon.has(m.serial)}>
                  <OChonDong khoa={m.serial} moTa={`máy ${m.serial}`} />
                  {cotBang.hien.map((cot, i) => {
                    const { o, title } = O[cot.id](m, cotBang.kieuNgay(cot.id))
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
          kieu={dieuKien.length ? 'loc' : 'that'}
          tieuDe={dieuKien.length ? 'Không tìm thấy máy nào' : 'Chưa có máy đã lắp'}
          moTa={dieuKien.length ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' : 'Máy lắp cho khách sẽ hiện ở đây.'}
        />
      )}
      <PhanTrang trang={trang} soTrang={soTrang} />
      {thanhDaChon}
    </>
  )
}
