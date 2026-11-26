import { Suspense } from 'react'
import Link from 'next/link'
import { listKhachHang, khoaTatCaKhachHang, exportCuaToi, listBangView, kenhChon, demKhachThieuSdt, demKhachKenhTuDong } from '@/app/actions'
import { ExportKhachButton } from '@/components/ExportKhachButton'
import { ThaoTacHangLoat } from '@/components/ThaoTacHangLoat'
import { BangKhach } from '@/components/BangKhach'
import { TaoKhachButton } from '@/components/TaoKhachButton'
import { SUA_HL_KHACH } from '@/lib/danhSach'
import { OTimKiem, ThanhDangLoc, PhanTrang } from '@/bang'
import { KhungChon, ThanhDaChon } from '@/bang'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ManV2 } from '@/components/khung/ManV2'
import { Button } from '@/components/ui/button'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { CauHinhBangDs } from '@/components/ui/bang-ds'

export default async function KhachHangPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; trang?: string; cot?: string; chieu?: string; thieu_sdt?: string; kenh_tu_dong?: string }>
}) {
  const { q = '', trang: trangRaw, cot, chieu, thieu_sdt, kenh_tu_dong } = await searchParams
  const locThieuSdt = thieu_sdt === '1'
  const locKenhTuDong = kenh_tu_dong === '1'
  const trang = Math.max(1, Number(trangRaw) || 1)
  // Ba nút, ba quyền khác nhau — trước đây gom vào laQuanLy/laAdmin nên tick lại
  // ma trận là nút hiện sai. Cặp (mã quyền, luật cũ) khớp y hệt Server Action.
  const [{ rows: list, tong, soTrang, sapXep }, quyen, exportDuyet, views, kenh, soThieuSdt, soKenhTuDong] = await Promise.all([
    listKhachHang(q, { trang, cot, chieu, thieuSdt: locThieuSdt, kenhTuDong: locKenhTuDong }),
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
        <CauHinhBangDs>
          <div className="min-w-0 space-y-4">
            <PageHeader tieuDe="Khách hàng" meta={[`${tong.toLocaleString('vi-VN')} khách`]} hanhDong={<TaoKhachButton kenh={kenh} />} />

            <Suspense>
              <OTimKiem placeholder="Gõ tên khách, SĐT, mã KH…" />
            </Suspense>

            {/* Chip lọc "Cần xin lại SĐT" — CEO chốt 22/08: cho tạo khách không SĐT, đổi lại phải
                có chỗ lọc ra danh sách phải gọi xin số. Hiện SỐ ngay trên chip để CS thấy mà làm,
                chứ chip trống thì không ai bấm. */}
            <div className="flex flex-wrap gap-2">
              {(soThieuSdt > 0 || locThieuSdt) && (
                <Button asChild size="sm" variant={locThieuSdt ? 'secondary' : 'outline'}>
                <Link href={locThieuSdt ? '/khach-hang' : '/khach-hang?thieu_sdt=1'} prefetch={false}>
                  {locThieuSdt ? '✕ Bỏ lọc · ' : '☎ '}Cần xin lại SĐT ({soThieuSdt})
                </Link>
              </Button>
              )}
              {/* Chip "Kênh máy tự điền" — CEO 24/08: *"highlight đc kênh nào là anh tự điền cần
                  tôi check lại"*. Bấm vào ra đúng nhóm mig 54 đã đổ; sửa tay hồ sơ nào là hồ sơ
                  ấy rơi khỏi đây, nên con số tự giảm dần về 0 khi soát xong. */}
              {(soKenhTuDong > 0 || locKenhTuDong) && (
                <Button asChild size="sm" variant={locKenhTuDong ? 'secondary' : 'outline'}>
                <Link href={locKenhTuDong ? '/khach-hang' : '/khach-hang?kenh_tu_dong=1'} prefetch={false}>
                  {locKenhTuDong ? '✕ Bỏ lọc · ' : '🤖 '}Kênh máy tự điền, cần soát ({soKenhTuDong})
                </Link>
              </Button>
              )}
            </div>

            <ThanhDangLoc
              dieuKien={[
                ...(q ? [{ nhan: 'Từ khoá', giaTri: q }] : []),
                ...(locThieuSdt ? [{ nhan: 'Lọc', giaTri: 'Cần xin lại SĐT' }] : []),
                ...(locKenhTuDong ? [{ nhan: 'Lọc', giaTri: 'Kênh máy tự điền' }] : []),
              ]}
              hienThi={list.length}
              tong={tong}
              nhan="khách"
              sapXep={sapXep}
            />

            <ExportKhachButton q={q} daDuyet={exportDuyet} />

            <KhungChon
              khoaTrang={list.map((c) => c.id)}
              tong={tong}
              bat={quyen.hangLoat}
              thamSo={{ q, cot, chieu }}
              layTatCaKhoa={khoaTatCaKhachHang}
            >
              <ThanhDaChon nhan="khách">
                <ThaoTacHangLoat bang="cs_customers" truong={SUA_HL_KHACH} choPhepXoa={quyen.xoaHangLoat} />
              </ThanhDaChon>
              <Suspense>
                <BangKhach rows={list} choViewChung={quyen.viewChung} views={views} />
              </Suspense>
            </KhungChon>

            <Suspense>
              <PhanTrang trang={trang} soTrang={soTrang} />
            </Suspense>
          </div>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
