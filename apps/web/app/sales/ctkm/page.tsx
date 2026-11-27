import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { listTabView } from '@/app/actions'
import { KhungChon, sapXepHopLe } from '@/bang'
import { docTatCa } from '@/bang/locTruong'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { catTrang, soSanh } from '../_trang'
import { NHAN_TT_CTKM, ngayTuLinkCu, TRUONG_CTKM } from '../truong-sales'
import { danhSachCtkm, nguonChoForm, quyenCtkm, type CtkmRow } from './actions'
import { BangCtkm } from './BangCtkm'

export const metadata = { title: 'Khuyến mãi · GWT Sales' }
export const dynamic = 'force-dynamic'

const SAP: Record<string, (c: CtkmRow) => string> = { ten: (c) => c.ten, ngay: (c) => c.tu_ngay }

// Danh sách chương trình khuyến mãi — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md); trước là lưới thẻ.
export default async function CtkmPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  // Link cũ `ngtu`/`ngden` → trường `ngay` (thời gian chạy).
  if (sp.ngtu || sp.ngden) {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(sp)) if (v && k !== 'ngtu' && k !== 'ngden') p.set(k, v)
    const ngay = sp.ngay ? null : ngayTuLinkCu(sp.ngtu, sp.ngden)
    if (ngay) p.set('ngay', ngay)
    redirect(`/sales/ctkm?${p}`)
  }

  const dk = docTatCa(sp, TRUONG_CTKM)
  const [ds, tatCa, quyen, nguon, tabRieng, q2] = await Promise.all([
    danhSachCtkm(sp.q ?? '', dk),
    danhSachCtkm(),
    quyenCtkm(),
    nguonChoForm(),
    listTabView('sales_ctkm_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])
  const sapXep = sapXepHopLe(sp.cot, sp.chieu, Object.keys(SAP), { cot: 'ngay', tang: false })
  const trang = Math.max(1, Number(sp.trang) || 1)
  const { rows, tong, soTrang } = catTrang([...ds].sort(soSanh(SAP[sapXep.cot], sapXep.tang)), trang)

  const tuyChon: Record<string, { giaTri: string; nhan: string }[]> = {
    sp: nguon.sp.map((s) => ({ giaTri: s.ma, nhan: s.ten && s.ten !== s.ma ? `${s.ma} · ${s.ten}` : s.ma })),
    kenh: nguon.kenh.map((k) => ({ giaTri: String(k.id), nhan: k.l2 ? `${k.l1} · ${k.l2}` : k.l1 })),
    tt: Object.entries(NHAN_TT_CTKM).map(([giaTri, nhan]) => ({ giaTri, nhan })),
  }
  const truong = TRUONG_CTKM.map((x) => ({ ...x, tuyChon: tuyChon[x.id] }))
  const locSp = dk.find((d) => d.truong === 'sp' && d.phep === 'la')

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon khoaTrang={rows.map((r) => r.id)} tong={tong} bat={false} thamSo={{}}>
            {/* Bảng đọc useSearchParams nên PHẢI bọc Suspense. */}
            <Suspense>
              <BangCtkm
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                sapXep={sapXep}
                tabRieng={tabRieng}
                quyenTabChung={q2.viewChung}
                demTab={{
                  'tat-ca': tatCa.length,
                  'dang-chay': tatCa.filter((c) => c.trang_thai === 'ban_hanh').length,
                  nhap: tatCa.filter((c) => c.trang_thai === 'nhap').length,
                }}
                truong={truong}
                quyen={quyen}
                ghiChu={
                  locSp && (
                    <Alert>
                      <AlertDescription>
                        Đang lọc theo sản phẩm — kết quả gồm cả chương trình <b>áp cho mọi sản phẩm</b>, vì các mã này nằm trong đó.
                      </AlertDescription>
                    </Alert>
                  )
                }
                chanTrang={
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      Khuyến mãi cho <b>khách lẻ</b> theo kênh. Khách đã gán bậc đại lý hưởng giá theo bậc, không ăn chương trình ở đây.
                    </p>
                    {!quyen.duyet && (
                      <p>
                        Bạn soạn và sửa được chương trình, nhưng <b>ban hành</b> phải do người có quyền duyệt. Soạn xong bấm{' '}
                        <b>Lưu nháp</b> rồi báo để duyệt.
                      </p>
                    )}
                  </div>
                }
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
