import { Suspense } from 'react'
import Link from 'next/link'
import { listTabView } from '@/app/actions'
import { boDau, KhungChon, sapXepHopLe } from '@/bang'
import { ManV2 } from '@/components/khung/ManV2'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { Button } from '@/components/ui/button'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { catTrang, soSanh } from '../_trang'
import { bangGiaNiemYet, type DongGia } from './actions'
import { BangGia } from './BangGia'

export const metadata = { title: 'Bảng giá niêm yết · GWT Sales' }
export const dynamic = 'force-dynamic'

const SAP: Record<string, (x: DongGia) => string | number> = { ma: (x) => x.ma, ten: (x) => x.ten, gia: (x) => x.gia_vat }

// Bảng giá niêm yết — danh sách bản ghi (một mã một giá) nên theo khuôn bảng Ticket F
// (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Chính sách giá đại lý (ma trận 3 bậc) ở /sales/gia/chinh-sach giữ dạng riêng.
export default async function BangGiaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const [tatCa, tabRieng, quyen] = await Promise.all([
    bangGiaNiemYet(),
    listTabView('sales_gia_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])
  const s = boDau((sp.q ?? '').trim())
  const khop = s ? tatCa.filter((x) => boDau(x.ma).includes(s) || boDau(x.ten).includes(s)) : tatCa
  const sapXep = sapXepHopLe(sp.cot, sp.chieu, Object.keys(SAP), { cot: 'gia', tang: false })
  const trang = Math.max(1, Number(sp.trang) || 1)
  const { rows, tong, soTrang } = catTrang([...khop].sort(soSanh(SAP[sapXep.cot], sapXep.tang)), trang)

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon khoaTrang={rows.map((r) => r.ma)} tong={tong} bat={false} thamSo={{}}>
            <Suspense>
              <BangGia
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                sapXep={sapXep}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                lienKet={
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/sales/gia/chinh-sach">Chính sách giá đại lý</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/sales/gia/doi-tac">Đối tác đại lý</Link>
                    </Button>
                  </>
                }
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
