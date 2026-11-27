'use client'

import { useRef, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { TabView } from '@/app/actions'
import { hrefBoLoc, KhungChon, OTimKiem, PhanTrang, ThanhDangLoc } from '@/bang'
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
import type { BangTab } from '@/lib/tab-view'

/** Một dòng: ô ĐÃ DỰNG ở server theo id cột (Server Component không truyền được hàm vẽ ô sang client). */
export type DongDungSan = { khoa: string; o: Record<string, ReactNode>; href?: string }

/**
 * Bảng danh sách CHỈ ĐỌC theo khuôn Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md) cho màn mà server đã có sẵn
 * dữ liệu + lọc (Kho đọc DB riêng qua RPC, Nhật ký thao tác): DataViewToolbar (tìm, tab, Lọc, ⚙) → ThanhDangLoc → Table ghim
 * + cột co dãn / ẩn / đổi chỗ (URL) → ListView khi khung < 640 → EmptyState → PhanTrang. Không sắp theo cột, không chọn
 * dòng (màn dùng nó chưa có hai thứ đó). Lọc chạy ở SERVER theo tham số URL; ở đây chỉ dựng nút Lọc + chip.
 */
export function BangDungSan({
  tieuDe, nhan, bang, tabCoDinh, tabRieng, quyenTabChung, demTab, viDuTen, khu,
  timKiem, truong, cot, dienThoai, dong, tong, trang, soTrang, nutChinh, rong, ghiChu,
}: {
  tieuDe: string
  /** Danh từ bản ghi: "mã hàng", "dòng sổ"… */
  nhan: string
  bang: BangTab
  tabCoDinh: TabCoDinh[]
  tabRieng: TabView[]
  quyenTabChung: boolean
  demTab?: Record<string, number>
  viDuTen: string
  khu: string
  /** Placeholder ô tìm (`q`); bỏ trống = màn không có tìm. */
  timKiem?: string
  truong: TruongLoc[]
  cot: CotBang[]
  /** Cột hiện trên điện thoại (ListView 2 dòng). */
  dienThoai: { tren: string; duoi?: string; duoiPhai?: string }
  dong: DongDungSan[]
  tong: number
  trang?: number
  soTrang?: number
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
  const theoId = new Map(cot.map((c) => [c.id, c]))

  const q = timKiem ? params.get('q') : null
  const dk = docTatCa(params, truong)
  const { nut: refNutLoc, chip: refChipLoc } = useMoLoc()
  const tenGt = (t: TruongLoc) => (g: string) => t.tuyChon?.find((x) => x.giaTri === g)?.nhan ?? g
  const hangTab = useHangTab({
    bang,
    coDinh: tabCoDinh,
    tabRieng,
    demTab,
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

  function datLoc(id: string, d: DieuKienLoc | null) {
    const tiep = new URLSearchParams(params.toString())
    const gt = ghiDieuKien(d, truong.find((x) => x.id === id)!.kieu)
    if (gt == null) tiep.delete(id)
    else tiep.set(id, gt)
    tiep.delete('trang')
    const s = tiep.toString()
    router.push(s ? `${pathname}?${s}` : pathname, { scroll: false })
  }

  const dieuKien = [
    ...(q ? [{ nhan: 'Tìm', giaTri: q, href: hrefBoLoc(pathname, params, 'q') }] : []),
    ...dk.map((d) => {
      const t = truong.find((x) => x.id === d.truong)!
      return { nhan: t.ten, giaTri: '', chip: <ChipLoc ref={refChipLoc(d.truong)} truong={t} dieuKien={d} onDoi={datLoc} /> }
    }),
  ]
  const hrefXoaLoc = hrefBoLoc(pathname, params, 'q', ...truong.map((x) => x.id))

  const cotDs: CotDanhSach<DongDungSan>[] = (['tren', 'duoi', 'duoiPhai'] as const).flatMap((vung) => {
    const c = dienThoai[vung] ? theoId.get(dienThoai[vung]!) : undefined
    return c ? [{ id: c.id, ten: c.ten, rong: vung === 'tren' ? 'minmax(0,2fr)' : 'minmax(0,1fr)', dienThoai: vung, o: (d) => d.o[c.id] }] : []
  })

  return (
    <KhungChon khoaTrang={[]} tong={tong} bat={false} thamSo={{}}>
      {/* Đầu + thanh lọc + bảng là MỘT khối (Ticket F: bảng sát thanh công cụ). */}
      <div className="border-none border-current">
        <DataViewToolbar
          tieuDe={tieuDe}
          dem={{ thay: dong.length, tong }}
          timKiem={timKiem ? <OTimKiem placeholder={timKiem} aria-label={`Tìm ${nhan}`} /> : undefined}
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
            />
          }
        />
        <ThanhDangLoc dieuKien={dieuKien} hienThi={dong.length} tong={tong} nhan={nhan} anSoDong hrefXoaLoc={hrefXoaLoc} />
        <div ref={khungRef} className="border-none border-current">
          {rongKhung !== null && rongKhung < RONG_BANG_TOI_THIEU ? (
            dong.length > 0 && (
              <ListView
                aria-label={tieuDe}
                cot={cotDs}
                dong={dong}
                khoa={(d) => d.khoa}
                onMo={(d) => d.href && router.push(d.href)}
              />
            )
          ) : (
            <TableWrap tabIndex={0} role="region" aria-label={`Vùng cuộn bảng ${tieuDe.toLowerCase()}`}>
              <KeoCot cot={cotBang.hien} doiCho={cotBang.doiCho}>
                <Table ref={refBang} aria-label={tieuDe} layout="fixed" style={{ minWidth: cotBang.tongRong + RONG_THEM_COT }}>
                  <ColCotBang hien={cotBang.hien} doRong={cotBang.doRong} choDo={cotBang.choDo} chon={false} />
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
                        />
                      ))}
                      <ThemCot cot={cot} an={cotBang.an} onHien={cotBang.themCot} onTuyChinh={() => caiDat.current?.mo('cot')} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dong.map((d) => (
                      <TableRow key={d.khoa}>
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
          kieu={rong || dieuKien.length ? 'loc' : 'that'}
          tieuDe={rong?.tieuDe ?? (dieuKien.length ? `Không có ${nhan} nào khớp bộ lọc` : `Chưa có ${nhan} nào`)}
          moTa={rong?.moTa ?? (dieuKien.length ? 'Đổi hoặc bỏ bớt điều kiện lọc để xem thêm.' : undefined)}
        />
      )}
      {soTrang != null && trang != null && <PhanTrang trang={trang} soTrang={soTrang} />}
      {ghiChu}
    </KhungChon>
  )
}
