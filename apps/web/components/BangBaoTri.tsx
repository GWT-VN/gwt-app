'use client'

import { useRef, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { MaintenanceDue, TabView } from '@/app/actions'
import { KHOA_LOC_BAO_TRI, SAP, TAB_BAO_TRI, TRUONG_BAO_TRI, TT_BAO_TRI } from '@/app/bao-tri/truong-bao-tri'
import { hrefBoLoc, OChonDong, OChonTatCa, OTimKiem, PhanTrang, ThanhDangLoc, useDaChon, type SapXep } from '@/bang'
import { docTatCa, ghiDieuKien, nhanChip, type DieuKienLoc } from '@/bang/locTruong'
import { BaoTriDoneButton } from '@/components/BaoTriDoneButton'
import { ChiSoNuoc } from '@/components/ChiSoNuoc'
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
import { hienNgay, type KieuNgay } from '@/lib/dinh-dang-ngay'
import { coDoNuoc } from '@/lib/nuoc'

function TinhTrangBadge({ tt }: { tt: string }) {
  if (tt === 'QUÁ HẠN') return <Badge variant="soft" color="danger">Quá hạn</Badge>
  if (tt === SAP) return <Badge variant="soft" color="warning">Sắp đến hạn</Badge>
  if (tt === 'đã xong') return <Badge variant="soft" color="success">Đã xong</Badge>
  if (tt.startsWith('không rõ')) return <Badge variant="soft" color="secondary">Không rõ</Badge>
  return <Badge variant="soft" color="info">Còn hạn</Badge>
}

/** `id` = khoá sắp xếp của maintenanceDue (COT_BAO_TRI) cho cột `sap`. */
const COT: CotBang[] = [
  { id: 'customer_name', ten: 'Khách', kieu: 'sap', khoa: true, toiThieu: 128, rongToiDa: 280, nghia: { tang: 'Tên từ A đến Z', giam: 'Tên từ Z đến A' } },
  { id: 'primary_phone', ten: 'SĐT', kieu: 'thuong', toiThieu: 112 },
  { id: 'section', ten: 'Công trình', kieu: 'thuong', rongToiDa: 260 },
  { id: 'bo_may', ten: 'Bộ máy', kieu: 'thuong', rongToiDa: 220 },
  { id: 'loai_goi', ten: 'Gói', kieu: 'thuong', rongToiDa: 200 },
  { id: 'lan', ten: 'Lần', kieu: 'thuong', phai: true },
  { id: 'tinh_trang', ten: 'Tình trạng', kieu: 'thuong' },
  { id: 'due_date', ten: 'Đến hạn', kieu: 'sap', ngay: true, nghia: { tang: 'Gần hạn nhất trước', giam: 'Xa hạn nhất trước' } },
  { id: 'nuoc', ten: 'Chỉ số nước', kieu: 'thuong', rongToiDa: 280 },
  { id: 'ghi', ten: 'Ghi', kieu: 'thuong' },
]
const THEO_ID = new Map(COT.map((cot) => [cot.id, cot]))

const O: Record<string, (r: MaintenanceDue, kieuNgay: KieuNgay) => { o: ReactNode; title?: string }> = {
  // Dòng "chưa khớp khách" = lịch từ Asana chưa gắn được vào hồ sơ khách (tên công trình ở cột Công trình).
  customer_name: (r) => ({
    o: (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span className="truncate font-medium">{r.customer_name ?? '—'}</span>
        {r.chua_khop_khach && <Badge variant="soft" color="warning">Chưa khớp khách</Badge>}
      </span>
    ),
    title: r.customer_name ?? undefined,
  }),
  primary_phone: (r) => ({ o: r.primary_phone ? <span className="tabular-nums">{r.primary_phone}</span> : '—' }),
  section: (r) => ({ o: r.section ?? '—', title: r.section ?? undefined }),
  bo_may: (r) => ({ o: r.bo_may ?? '—', title: r.bo_may ?? undefined }),
  loai_goi: (r) => ({ o: r.loai_goi ?? '—', title: r.loai_goi ?? undefined }),
  lan: (r) => ({ o: <span className="tabular-nums">{r.lan_thu ?? '—'}{r.tong_lan ? `/${r.tong_lan}` : ''}</span> }),
  tinh_trang: (r) => ({ o: <TinhTrangBadge tt={r.tinh_trang} /> }),
  due_date: (r, k) => ({ o: <span className="tabular-nums">{hienNgay(r.due_date, k)}</span> }),
  nuoc: (r) => ({
    o: coDoNuoc(r.do_nuoc) ? <ChiSoNuoc d={r.do_nuoc!} gonMotDong /> : <span className="text-muted-foreground">Chưa đo</span>,
  }),
  ghi: (r) => ({ o: <BaoTriDoneButton visitId={r.visit_id} completedAt={r.completed_at} doNuoc={r.do_nuoc} /> }),
}

/** Màn hẹp (< 640): ListView 1–2 dòng như Ticket F; nút "Đã bảo trì" giữ trên điện thoại (thao tác chính của màn). */
const COT_DS: CotDanhSach<MaintenanceDue>[] = [
  { id: 'ten', ten: 'Khách', rong: 'minmax(0,2fr)', dienThoai: 'tren', o: (r) => <span className="min-w-0 truncate font-medium">{r.customer_name ?? r.section ?? '—'}</span> },
  { id: 'ghi', ten: 'Ghi', rong: 'auto', dienThoai: 'trenPhai', o: (r) => <BaoTriDoneButton visitId={r.visit_id} completedAt={r.completed_at} doNuoc={r.do_nuoc} /> },
  { id: 'han', ten: 'Đến hạn', rong: 'minmax(0,1fr)', dienThoai: 'duoi', o: (r) => hienNgay(r.due_date) },
  { id: 'tt', ten: 'Tình trạng', rong: 'minmax(0,1fr)', dienThoai: 'duoiPhai', o: (r) => <TinhTrangBadge tt={r.tinh_trang} /> },
]

/** Lịch bảo trì `/bao-tri` — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). */
export function BangBaoTri({
  rows, tong, trang, soTrang, sapXep, choChon, tabRieng, quyenTabChung, demTab, lich, canhBao, xuatExcel, thanhDaChon,
}: {
  rows: MaintenanceDue[]
  tong: number
  trang: number
  soTrang: number
  sapXep: SapXep
  choChon: boolean
  tabRieng: TabView[]
  quyenTabChung: boolean
  demTab: Record<string, number>
  /** Tab "Lịch tháng": vẽ lịch thay bảng (không lọc / cột / chọn dòng — lịch chỉ theo tháng). */
  lich?: ReactNode
  /** Lời nhắc đứng ngay trên bảng. */
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
  // Lọc ▸ trường: server lọc ở DB (maintenanceDue) — ở đây chỉ đọc điều kiện để dựng nút Lọc + chip.
  const dk = docTatCa(params, TRUONG_BAO_TRI)
  const truongLoc: TruongLoc[] = TRUONG_BAO_TRI.map((x) => ({ id: x.id, ten: x.ten, kieu: x.kieu, tuyChon: x.id === 'tt' ? TT_BAO_TRI : undefined }))
  const tenGiaTri = (g: string) => TT_BAO_TRI.find((y) => y.giaTri === g)?.nhan ?? g
  const { nut: refNutLoc, chip: refChipLoc } = useMoLoc()
  const dieuKienTat = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
    ...dk.map((d) => {
      const n = nhanChip(d, truongLoc.find((y) => y.id === d.truong)!.ten, tenGiaTri)
      return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
    }),
  ]
  const hrefXoaLoc = hrefBoLoc(pathname, params, ...KHOA_LOC_BAO_TRI)
  const hangTab = useHangTab({
    bang: 'bao_tri_tab',
    coDinh: TAB_BAO_TRI,
    tabRieng,
    demTab,
    quyenTabChung,
    nhan: 'lượt bảo trì',
    khu: 'CSKH',
    viDuTen: 'VD: Quá hạn khu Hà Nội',
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

  const datLoc = (id: string, d: DieuKienLoc | null) => doiUrl({ [id]: ghiDieuKien(d, TRUONG_BAO_TRI.find((x) => x.id === id)!.kieu) })
  const dieuKien = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q, href: hrefBoLoc(pathname, params, 'q') }] : []),
    ...dk.map((d) => {
      const x = truongLoc.find((y) => y.id === d.truong)!
      return { nhan: x.ten, giaTri: '', chip: <ChipLoc ref={refChipLoc(d.truong)} truong={x} dieuKien={d} onDoi={datLoc} /> }
    }),
  ]

  const toolbar = (
    <DataViewToolbar
      tieuDe="Lịch bảo trì"
      dem={lich ? undefined : { thay: rows.length, tong }}
      timKiem={lich ? undefined : <OTimKiem placeholder="Tên khách, SĐT, bộ máy, công trình…" aria-label="Tìm lượt bảo trì" />}
      tabs={hangTab.tabs}
      dangXem="bang"
      loc={
        lich ? undefined : (
          <>
            {xuatExcel}
            <NutLoc ref={refNutLoc} truong={truongLoc} dieuKien={dk} onDoi={datLoc} />
          </>
        )
      }
      caiDat={
        lich ? undefined : (
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
        )
      }
    />
  )

  if (lich)
    return (
      <>
        {toolbar}
        {lich}
      </>
    )

  return (
    <>
      {/* Đầu + thanh lọc + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ). */}
      <div className="border-none border-current">
      {toolbar}
      <ThanhDangLoc
        dieuKien={dieuKien}
        hienThi={rows.length}
        tong={tong}
        nhan="lượt"
        anSoDong
        sapXep={sapXep.macDinh ? undefined : sapXep}
        hrefXoaLoc={hrefXoaLoc}
      />
      {canhBao}
      {/* Khung < 640 (điện thoại) → ListView; còn lại Bảng, hết chỗ thì cuộn ngang (khuôn Ticket F). */}
      <div ref={khungRef} className="border-none border-current">
      {rongKhung !== null && rongKhung < RONG_BANG_TOI_THIEU ? (
        // Lượt bảo trì không có trang chi tiết → không mở dòng (moKhi "ten", tên không phải nút).
        rows.length > 0 && <ListView aria-label="Lịch bảo trì" cot={COT_DS} dong={rows} khoa={(r) => r.visit_id} onMo={() => {}} moKhi="ten" />
      ) : (
      <TableWrap tabIndex={0} role="region" aria-label="Vùng cuộn bảng lịch bảo trì">
        <KeoCot cot={cotBang.hien} doiCho={cotBang.doiCho}>
          <Table
            ref={refBang}
            aria-label="Lịch bảo trì"
            layout="fixed"
            style={{ minWidth: cotBang.tongRong + RONG_THEM_COT + (choChon ? RONG_O_CHON : 0) }}
          >
            <ColCotBang hien={cotBang.hien} doRong={cotBang.doRong} choDo={cotBang.choDo} chon={choChon} />
            <TableHeader>
              <TableRow>
                <OChonTatCa nhan="lượt bảo trì" />
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
              {rows.map((r) => (
                <TableRow key={r.visit_id} chon={khoaDaChon.has(r.visit_id)}>
                  <OChonDong khoa={r.visit_id} moTa={`lượt bảo trì của ${r.customer_name ?? r.section ?? 'khách chưa khớp'}`} />
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
          kieu={dieuKien.length ? 'loc' : 'that'}
          tieuDe={dieuKien.length ? 'Không có lượt bảo trì nào khớp' : 'Chưa có lịch bảo trì'}
          moTa={dieuKien.length ? 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' : 'Gói bảo trì theo hợp đồng sẽ sinh lịch ở đây.'}
        />
      )}
      <PhanTrang trang={trang} soTrang={soTrang} />
      {thanhDaChon}
    </>
  )
}
