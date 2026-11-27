import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { listTabView } from '@/app/actions'
import { KhungChon } from '@/bang'
import { docTatCa } from '@/bang/locTruong'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { coTheVaoSales } from '@/lib/nen-tang/gac-cong'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { BangDon } from './BangDon'
import { danhSachDon, kenhChiTietTrongDon, kenhTrongDon, spTrongDon } from './actions'
import { FULFILL_OPTS, PAYMENT_OPTS } from './_types'
import { ngayTuLinkCu, TAB_DON, TRUONG_DON } from './truong-sales'

export const metadata = { title: 'Đơn hàng · GWT Sales' }
export const dynamic = 'force-dynamic'

const NHOM = new Map(TAB_DON.filter((t) => t.loc).map((t) => [t.loc.replace('nhom=', ''), t.v]))
const chon = (ds: readonly string[]) => ds.map((g) => ({ giaTri: g, nhan: g }))

// Danh sách đơn Sales — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
export default async function SalesDonPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireNhanSu()
  if (!(await coTheVaoSales())) redirect('/?loi=khong_du_quyen')
  const sp = await searchParams

  // Link cũ: `?tab=DON_POE` (nay `tab` = tab tự tạo) và `ngtu`/`ngden` (nay trường `ngay`) → đổi sang tham số mới.
  const nhomCu = sp.tab && NHOM.has(sp.tab) ? sp.tab : null
  const ngayCu = sp.ngay ? null : ngayTuLinkCu(sp.ngtu, sp.ngden)
  if (nhomCu || sp.ngtu || sp.ngden) {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(sp)) if (v && k !== 'ngtu' && k !== 'ngden' && !(nhomCu && k === 'tab')) p.set(k, v)
    if (nhomCu) {
      p.set('nhom', nhomCu)
      p.set('view', NHOM.get(nhomCu)!)
    }
    if (ngayCu) p.set('ngay', ngayCu)
    redirect(`/sales?${p}`)
  }

  const nhom = sp.nhom && NHOM.has(sp.nhom) ? sp.nhom : ''
  const dk = docTatCa(sp, TRUONG_DON)
  const trang = Math.max(1, Number(sp.trang) || 1)
  const [{ rows, tong, soTrang, sapXep }, kenhOpts, kenhCtOpts, spOpts, tabRieng, quyen] = await Promise.all([
    danhSachDon(sp.q ?? '', nhom, dk, { trang, cot: sp.cot, chieu: sp.chieu }),
    kenhTrongDon(),
    kenhChiTietTrongDon(),
    spTrongDon(),
    listTabView('sales_don_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])

  // Đang lọc Kênh "là …" thì Kênh chi tiết chỉ hiện chi tiết THUỘC các kênh đó — đỡ cuộn qua chi tiết của kênh khác.
  const kenhLa = dk.find((d) => d.truong === 'kenh' && d.phep === 'la')?.giaTri
  const kenh2 = new Map<string, string>()
  for (const k of kenhCtOpts) {
    if (kenhLa && !kenhLa.includes(k.kenh)) continue
    if (!kenh2.has(k.chiTiet)) kenh2.set(k.chiTiet, kenhLa?.length === 1 ? k.chiTiet : `${k.chiTiet} (${k.kenh || '—'})`)
  }
  const tuyChon: Record<string, { giaTri: string; nhan: string }[]> = {
    tt: chon(FULFILL_OPTS),
    tp: chon(PAYMENT_OPTS),
    kenh: chon(kenhOpts),
    kenh2: [...kenh2].map(([giaTri, nhan]) => ({ giaTri, nhan })),
    // Danh mục dài → ô "Tìm…" của Lọc khớp cả mã lẫn tên.
    sp: spOpts.map((o) => ({ giaTri: o.ma, nhan: o.ten ? `${o.ma} · ${o.ten}` : o.ma })),
  }
  const truong = TRUONG_DON.map((x) => ({ ...x, tuyChon: tuyChon[x.id] }))
  const locSp = dk.some((d) => d.truong === 'sp')

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon khoaTrang={rows.map((r) => r.order_code)} tong={tong} bat={false} thamSo={{}}>
            {/* Bảng đọc useSearchParams -> BẮT BUỘC bọc Suspense, thiếu là `next build` fail. */}
            <Suspense>
              <BangDon
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                sapXep={sapXep}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                truong={truong}
                ghiChu={
                  locSp && (
                    <Alert color="warning">
                      <AlertDescription>
                        Đang lọc theo sản phẩm — cột <b>Tổng (VAT)</b> chỉ cộng các dòng khớp sản phẩm đó, không phải tổng cả đơn.
                      </AlertDescription>
                    </Alert>
                  )
                }
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
