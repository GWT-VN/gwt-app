import { Suspense } from 'react'
import { listKhachHang, khoaTatCaKhachHang, exportCuaToi, listBangView, kenhChon, demKhachThieuSdt, demKhachKenhTuDong } from '@/app/actions'
import { ExportKhachButton } from '@/components/ExportKhachButton'
import { ThaoTacHangLoat } from '@/components/ThaoTacHangLoat'
import { BangKhach } from '@/components/BangKhach'
import { TaoKhachButton } from '@/components/TaoKhachButton'
import { SUA_HL_KHACH } from '@/lib/danhSach'
import { KhungChon, ThanhDaChon } from '@/bang'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'

export default async function KhachHangPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; trang?: string; cot?: string; chieu?: string; thieu_sdt?: string; kenh_tu_dong?: string }>
}) {
  const { q = '', trang: trangRaw, cot, chieu, thieu_sdt, kenh_tu_dong } = await searchParams
  const trang = Math.max(1, Number(trangRaw) || 1)
  const [{ rows, tong, soTrang, sapXep }, quyen, exportDuyet, views, kenh, soThieuSdt, soKenhTuDong] = await Promise.all([
    listKhachHang(q, { trang, cot, chieu, thieuSdt: thieu_sdt === '1', kenhTuDong: kenh_tu_dong === '1' }),
    hoiQuyen({
      hangLoat: ['cs.hang_loat.cap_nhat', 'QUANLY'],
      xoaHangLoat: ['cs.khach.xoa_hang_loat', 'ADMIN'],
      viewChung: ['he_thong.view_chung', 'QUANLY'],
    }),
    exportCuaToi(),
    listBangView('cs_customers'),
    kenhChon(),
    demKhachThieuSdt(),
    demKhachKenhTuDong(),
  ])

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon
            khoaTrang={rows.map((c) => c.id)}
            tong={tong}
            bat={quyen.hangLoat}
            thamSo={{ q, cot, chieu, thieu_sdt, kenh_tu_dong }}
            layTatCaKhoa={khoaTatCaKhachHang}
          >
            <Suspense>
              <BangKhach
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                sapXep={sapXep}
                choChon={quyen.hangLoat}
                choViewChung={quyen.viewChung}
                views={views}
                soThieuSdt={soThieuSdt}
                soKenhTuDong={soKenhTuDong}
                taoKhach={<TaoKhachButton kenh={kenh} />}
                xuatExcel={<ExportKhachButton q={q} daDuyet={exportDuyet} />}
                thanhDaChon={
                  <ThanhDaChon nhan="khách">
                    <ThaoTacHangLoat bang="cs_customers" truong={SUA_HL_KHACH} choPhepXoa={quyen.xoaHangLoat} />
                  </ThanhDaChon>
                }
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
