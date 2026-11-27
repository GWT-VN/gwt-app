import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { listTabView } from '@/app/actions'
import { KhungChon } from '@/bang'
import { docTatCa } from '@/bang/locTruong'
import { ManV2 } from '@/components/khung/ManV2'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import { coTheVaoSales } from '@/lib/nen-tang/gac-cong'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { requireNhanSu } from '@/lib/nen-tang/phien'
import { danhSachKhach, demKhachSales, kenhChonDuoc, kenhTrongDon, khachTrungSdt, nhanVienChonDuoc, tinhTrongKhach } from '../actions'
import { TaoKhachButton } from '../TaoKhachButton'
import { TRUONG_KHACH_SALES } from '../truong-sales'
import { BangKhachSales } from './BangKhachSales'

export const metadata = { title: 'Khách hàng · GWT Sales' }
export const dynamic = 'force-dynamic'

// Danh sách khách Sales — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
export default async function SalesKhachPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireNhanSu()
  if (!(await coTheVaoSales())) redirect('/?loi=khong_du_quyen')
  const sp = await searchParams
  const dk = docTatCa(sp, TRUONG_KHACH_SALES)
  const trang = Math.max(1, Number(sp.trang) || 1)
  const trungSdt = sp.trung_sdt === '1'
  const [{ rows, tong, soTrang, sapXep }, tinhOpts, kenhOpts, kenhDim, trung, nhanVien, tabRieng, quyen, soTatCa] = await Promise.all([
    danhSachKhach(sp.q ?? '', dk, { trang, cot: sp.cot, chieu: sp.chieu, trungSdt }),
    tinhTrongKhach(),
    kenhTrongDon(),
    kenhChonDuoc(),
    khachTrungSdt(),
    nhanVienChonDuoc(),
    listTabView('sales_khach_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
    demKhachSales(),
  ])
  const tuyChon: Record<string, string[]> = { tinh: tinhOpts, kenh: kenhOpts }
  const truong = TRUONG_KHACH_SALES.map((x) => ({ ...x, tuyChon: tuyChon[x.id].map((g) => ({ giaTri: g, nhan: g })) }))
  const locKenh = dk.some((d) => d.truong === 'kenh')

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon khoaTrang={rows.map((r) => r.customer_code)} tong={tong} bat={false} thamSo={{}}>
            {/* Bảng đọc useSearchParams -> BẮT BUỘC bọc Suspense, xem docs/CHUAN-FILTER.md */}
            <Suspense>
              <BangKhachSales
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                sapXep={sapXep}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                demTab={{ 'tat-ca': soTatCa, 'trung-sdt': trung.reduce((n, t) => n + t.ma.length, 0) }}
                truong={truong}
                taoKhach={<TaoKhachButton kenh={kenhDim} nhanVien={nhanVien} />}
                ghiChu={
                  <>
                    {/* Cảnh báo trùng — CEO chốt 22/08: đếm và nói ra, không chặn cứng ở DB. Nay là tab "Trùng SĐT". */}
                    {trungSdt && trung.length > 0 && (
                      <Alert color="warning">
                        <AlertTitle>{trung.length} số điện thoại đang có nhiều hồ sơ khách</AlertTitle>
                        <AlertDescription>
                          <ul className="space-y-1">
                            {trung.map((t) => (
                              <li key={t.sdt9}>
                                <span className="font-mono">…{t.sdt9}</span> →{' '}
                                {t.ma.map((m, i) => (
                                  <span key={m}>
                                    {i > 0 && ' · '}
                                    <Link href={`/sales/khach/${encodeURIComponent(m)}`} prefetch={false} className="hover:underline">
                                      <span className="font-mono">{m}</span>
                                      {t.ten[i] && ` ${t.ten[i]}`}
                                    </Link>
                                  </span>
                                ))}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2">
                            Phần lớn do Google Sheet ăn mất số 0 đầu SĐT. Sửa trong <b>ô SĐT của dòng đơn</b> rồi chạy{' '}
                            <b>Dựng lại DM_KHACH → Đồng bộ khách</b> — hai hồ sơ sẽ tự gộp làm một.
                          </p>
                        </AlertDescription>
                      </Alert>
                    )}
                    {locKenh && (
                      <Alert>
                        <AlertDescription>
                          Kênh của khách đang <b>suy từ đơn đã mua</b> — cột <code>channel_id</code> vừa thêm 21/08 và chưa có ai
                          điền. Khách chưa có đơn nào coi như chưa có kênh.
                        </AlertDescription>
                      </Alert>
                    )}
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
