'use client'

import { useRef, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowSquareOut, Copy, LinkSimple } from '@phosphor-icons/react/ssr'
import type { TabView } from '@/app/actions'
import { KhungChon, OTimKiem, PhanTrang } from '@/bang'
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
import type { BangTab } from '@/lib/tab-view'
import { saoChep } from '@/lib/sao-chep'

/**
 * Một dòng: ô ĐÃ DỰNG ở server theo id cột (Server Component không truyền được hàm vẽ ô sang client). `href` = trang chi
 * tiết (menu chuột phải: Mở chi tiết + Sao chép đường dẫn); `ma` = giá trị "Sao chép mã" (bỏ trống = `khoa`).
 */
export type DongDungSan = { khoa: string; o: Record<string, ReactNode>; href?: string; ma?: string }

/**
 * Bảng danh sách CHỈ ĐỌC theo khuôn Ticket F bản chốt 27/11 (docs/rework/2026-11-27-khuon-f-huong-dan-agent.md) cho màn mà
 * server đã có sẵn dữ liệu + lọc (Kho đọc DB riêng qua RPC, Nhật ký thao tác): DataViewToolbar (tìm, tab không số, Lọc +
 * Xoá bộ lọc, ⚙) → Table ghim + cột co dãn / ẩn / đổi chỗ (URL), bộ lọc ở NHÃN CỘT, chuột phải dòng → menu → ListView khi
 * khung < 640 → EmptyState → PhanTrang (bộ đếm duy nhất). Không sắp theo cột, không chọn dòng (màn dùng nó chưa có hai
 * thứ đó). Lọc chạy ở SERVER theo tham số URL; ở đây chỉ dựng nút Lọc + chip.
 */
export function BangDungSan({
  tieuDe, nhan, bang, tabCoDinh, tabRieng, quyenTabChung, viDuTen, khu,
  timKiem, truong, locCot, cot, dienThoai, dong, tong, trang = 1, soTrang = 1, moiTrang, nutChinh, rong, ghiChu,
}: {
  tieuDe: string
  /** Danh từ bản ghi: "mã hàng", "dòng sổ"… */
  nhan: string
  bang: BangTab
  tabCoDinh: TabCoDinh[]
  tabRieng: TabView[]
  quyenTabChung: boolean
  viDuTen: string
  khu: string
  /** Placeholder ô tìm (`q`); bỏ trống = màn không có tìm. */
  timKiem?: string
  truong: TruongLoc[]
  /** Cột bảng → trường lọc khi khác id (vd `ket_qua` → `kq`); cột trùng id với một trường tự nối. */
  locCot?: Record<string, string>
  cot: CotBang[]
  /** Cột hiện trên điện thoại (ListView 2 dòng). */
  dienThoai: { tren: string; duoi?: string; duoiPhai?: string }
  dong: DongDungSan[]
  /** Tổng bản ghi khớp lọc — bộ đếm của PhanTrang. */
  tong: number
  /** Màn không phân trang: bỏ trống (= trang 1 / 1). */
  trang?: number
  soTrang?: number
  /** Số dòng mỗi trang của nguồn (cho "1–100 trên N"); mặc định của PhanTrang (50). */
  moiTrang?: number
  nutChinh?: ReactNode
  /** Câu rỗng riêng (vd lọc mà nguồn dữ liệu chưa làm được). */
  rong?: { tieuDe: string; moTa?: string }
  /** Ghi chú của màn, dưới bảng. */
  ghiChu?: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const cotBang = useCotBang(cot, { url: true })
  const { refBang } = cotBang
  const caiDat = useRef<CaiDatRef>(null)
  const [khungRef, rongKhung] = useRongKhung()
  const laBang = rongKhung === null || rongKhung >= RONG_BANG_TOI_THIEU
  const theoId = new Map(cot.map((c) => [c.id, c]))

  const q = timKiem ? params.get('q') : null
  const dk = docTatCa(params, truong)
  const dangLoc = !!q || dk.length > 0
  const { nut: refNutLoc, mo: moLocTruong } = useMoLoc()
  const truongCua = (cotId: string) => locCot?.[cotId] ?? (truong.some((x) => x.id === cotId) ? cotId : undefined)
  const tenGt = (t: TruongLoc) => (g: string) => t.tuyChon?.find((x) => x.giaTri === g)?.nhan ?? g
  const hangTab = useHangTab({
    bang,
    coDinh: tabCoDinh,
    tabRieng,
    quyenTabChung,
    nhan,
    khu,
    viDuTen,
    dieuKien: [
      ...(q ? [{ nhan: 'Tìm', giaTri: q }] : []),
      ...dk.map((d) => {
        const t = truong.find((x) => x.id === d.truong)!
        const n = nhanChip(d, t.ten, tenGt(t))
        return { nhan: n.truoc.replace(/:$/, ''), giaTri: n.giaTri }
      }),
    ],
  })

  function diTiep(tiep: URLSearchParams) {
    tiep.delete('trang')
    const s = tiep.toString()
    router.push(s ? `${pathname}?${s}` : pathname, { scroll: false })
  }
  function datLoc(id: string, d: DieuKienLoc | null) {
    const tiep = new URLSearchParams(params.toString())
    const gt = ghiDieuKien(d, truong.find((x) => x.id === id)!.kieu)
    if (gt == null) tiep.delete(id)
    else tiep.set(id, gt)
    diTiep(tiep)
  }
  // "Xoá bộ lọc": bỏ mọi điều kiện trường; giữ từ khoá (ô tìm có nút xoá riêng), cột, kho — như ticket F.
  function xoaLoc() {
    const tiep = new URLSearchParams(params.toString())
    for (const x of truong) tiep.delete(x.id)
    diTiep(tiep)
  }

  const menuDong = (d: DongDungSan) => (
    <>
      {d.href && (
        <>
          <ContextMenuItem onSelect={() => router.push(d.href!)}>
            <ArrowSquareOut aria-hidden="true" />
            Mở chi tiết
          </ContextMenuItem>
          <ContextMenuSeparator />
        </>
      )}
      <ContextMenuItem onSelect={() => void saoChep(d.ma ?? d.khoa)}>
        <Copy aria-hidden="true" />
        Sao chép mã
      </ContextMenuItem>
      {d.href && (
        <ContextMenuItem onSelect={() => void saoChep(location.origin + d.href)}>
          <LinkSimple aria-hidden="true" />
          Sao chép đường dẫn
        </ContextMenuItem>
      )}
    </>
  )

  const cotDs: CotDanhSach<DongDungSan>[] = (['tren', 'duoi', 'duoiPhai'] as const).flatMap((vung) => {
    const c = dienThoai[vung] ? theoId.get(dienThoai[vung]!) : undefined
    return c ? [{ id: c.id, ten: c.ten, rong: vung === 'tren' ? 'minmax(0,2fr)' : 'minmax(0,1fr)', dienThoai: vung, o: (d) => d.o[c.id] }] : []
  })

  return (
    <KhungChon khoaTrang={[]} tong={tong} bat={false} thamSo={{}}>
      {/* Đầu + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ). */}
      <div className="border-none border-current">
        <DataViewToolbar
          tieuDe={tieuDe}
          timKiem={timKiem ? <OTimKiem placeholder={timKiem} aria-label={`Tìm ${nhan}`} /> : undefined}
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
                onXoaHet={xoaLoc}
                coCot={(id) => laBang && dong.length > 0 && cotBang.hien.some((c) => truongCua(c.id) === id)}
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
            />
          }
        />
        <div ref={khungRef} className="border-none border-current">
          {!laBang ? (
            dong.length > 0 && (
              <ListView
                aria-label={tieuDe}
                cot={cotDs}
                dong={dong}
                khoa={(d) => d.khoa}
                onMo={(d) => d.href && router.push(d.href)}
                menuDong={menuDong}
              />
            )
          ) : (
            <TableWrap tabIndex={0} role="region" aria-label={`Vùng cuộn bảng ${tieuDe.toLowerCase()}`}>
              <KeoCot cot={cotBang.hien} doiCho={cotBang.doiCho}>
                <Table ref={refBang} aria-label={tieuDe} layout="fixed" style={{ minWidth: cotBang.tongRong + RONG_THEM_COT }}>
                  <ColCotBang hien={cotBang.hien} doRong={cotBang.doRong} choDo={cotBang.choDo} chon={false} />
                  <TableHeader>
                    <TableRow>
                      {cotBang.hien.map((c, i) => {
                        const t = truongCua(c.id)
                        return (
                          <TieuDeCot
                            key={c.id}
                            cot={c}
                            viTri={i}
                            menuPhai={i === cotBang.hien.length - 1}
                            menuCot={cotBang.menuCot(c.id)}
                            moLoc={t ? moLocCot(t, dk, truong, moLocTruong) : undefined}
                            coDan={{ rong: cotBang.doRong[c.id], onDoi: (px) => cotBang.coDan(c.id, px) }}
                          />
                        )
                      })}
                      <ThemCot cot={cot} an={cotBang.an} onHien={cotBang.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dong.map((d) => (
                      <TableRow key={d.khoa} menu={menuDong(d)} tenMenu={`Thao tác ${d.ma ?? d.khoa}`}>
                        {cotBang.hien.map((c, i) => (
                          <TableCell key={c.id} cot={c.id} phai={c.phai} ghim={laGhim(c, i)}>
                            {d.o[c.id]}
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
      {!dong.length && (
        <EmptyState
          size="sm"
          kieu={rong || dangLoc ? 'loc' : 'that'}
          tieuDe={rong?.tieuDe ?? (dangLoc ? `Không có ${nhan} nào khớp bộ lọc` : `Chưa có ${nhan} nào`)}
          moTa={rong?.moTa ?? (dangLoc ? 'Đổi hoặc bỏ bớt điều kiện lọc để xem thêm.' : undefined)}
        />
      )}
      {/* Bộ đếm DUY NHẤT của màn (khuôn F 27/11 — không số trên tab / tiêu đề). */}
      <PhanTrang trang={trang} soTrang={soTrang} tong={tong} moiTrang={moiTrang} nhan={nhan} />
      {ghiChu}
    </KhungChon>
  )
}
