import Link from 'next/link'
import { Suspense } from 'react'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import {
  searchSerialsTrang, listSerialPending, khoaTatCaSerial, catalogChon, dsTrangThai, listTabView,
  type CatalogChon, type SerialPending,
} from '@/app/actions'
import { KhungChon, ThanhDaChon } from '@/bang'
import { BangSerial } from '@/components/BangSerial'
import { SerialTao } from '@/components/SerialTao'
import { SerialPendingList } from '@/components/SerialPendingList'
import { NhapKhoSerial } from '@/components/NhapKhoSerial'
import { TrangThaiCauHinh } from '@/components/TrangThaiCauHinh'
import { Button } from '@/components/ui/button'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'

/** Trang con (không phải danh sách): `?tab=` giữ đúng giá trị cũ để link cũ (vd /kho/ma "Chờ duyệt") không gãy. */
const TRANG_CON: Record<string, string> = { nhap: 'Nhập kho serial', cho: 'Serial chờ duyệt', cauhinh: 'Cấu hình trạng thái' }

// Kho serial — danh sách theo khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md); Nhập kho / Chờ duyệt /
// Cấu hình trạng thái là trang con mở từ nút ở đầu bảng.
export default async function SerialPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string; trang?: string; tt?: string }>
}) {
  const { q = '', tab = '', trang: trangRaw, tt } = await searchParams
  const trang = Math.max(1, Number(trangRaw) || 1)
  const con = Object.hasOwn(TRANG_CON, tab) ? tab : null
  // Hỏi quyền TRƯỚC. listSerialPending() tự gác bằng cs.serial.duyet và ĐÁ VỀ
  // TRANG CHỦ nếu thiếu — gọi vô điều kiện là nhân viên thường mở /serial liền bị
  // văng, dù bảng kho serial vốn cho họ xem.
  const quyen = await hoiQuyen({
    kho: ['cs.serial.kho', 'QUANLY'],
    trangThai: ['cs.may.trang_thai', 'QUANLY'],
    duyet: ['cs.serial.duyet', 'QUANLY'],
    hangLoat: ['cs.hang_loat.cap_nhat', 'QUANLY'],
    viewChung: ['he_thong.view_chung', 'QUANLY'],
  })
  const [pending, catalog, dsTT] = await Promise.all([
    quyen.duyet ? listSerialPending('cho_duyet') : Promise.resolve<SerialPending[]>([]),
    con === 'nhap' ? catalogChon() : Promise.resolve<CatalogChon[]>([]),
    dsTrangThai(),
  ])

  if (con) {
    return (
      <ManV2>
        <TrangDuLieu>
          <CauHinhBangDs>
            <div className="min-w-0 space-y-4">
              <PageHeader
                duongDan={<Button asChild variant="ghost"><Link href="/serial">← Kho serial</Link></Button>}
                tieuDe={TRANG_CON[con]}
              />
              {con === 'cauhinh' ? (
                quyen.trangThai ? <TrangThaiCauHinh ds={dsTT} /> : <p className="text-sm text-(--color-text-warning)">Bạn không có quyền cấu hình trạng thái máy.</p>
              ) : con === 'nhap' ? (
                quyen.kho ? (
                  <NhapKhoSerial catalog={catalog} />
                ) : (
                  <p className="text-sm text-(--color-text-warning)">Bạn không có quyền nhập kho trực tiếp. Bạn có thể “Tạo serial mới (chờ duyệt)”.</p>
                )
              ) : (
                <section className="space-y-3">
                  {/*
                    createSerialPending() phía sau nút này đòi cs.serial.kho. Hiện nó cho
                    người không có quyền là mời họ bấm vào một thứ chắc chắn hỏng.
                    ⚠️ Đáng để CEO xem lại: luồng "tạo serial chờ duyệt" sinh ra CHO nhân
                    viên thường xin, mà ma trận đang để nó ở mức Trưởng CSKH.
                  */}
                  {quyen.kho && <SerialTao />}
                  <SerialPendingList items={pending} choDuyet={quyen.duyet} />
                </section>
              )}
            </div>
          </CauHinhBangDs>
        </TrangDuLieu>
      </ManV2>
    )
  }

  const [{ rows, tong, soTrang }, tabRieng] = await Promise.all([
    searchSerialsTrang(q, { trang }, tt),
    listTabView('serial_tab'),
  ])

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <KhungChon
            khoaTrang={rows.map((s) => s.serial)}
            tong={tong}
            bat={quyen.hangLoat}
            thamSo={{ q, tt }}
            layTatCaKhoa={khoaTatCaSerial}
          >
            <Suspense>
              <BangSerial
                rows={rows}
                tong={tong}
                trang={trang}
                soTrang={soTrang}
                choChon={quyen.hangLoat}
                choDoiTrangThai={quyen.kho}
                dsTrangThai={dsTT}
                tabRieng={tabRieng}
                quyenTabChung={quyen.viewChung}
                nutChinh={
                  <>
                    {quyen.trangThai && (
                      <Button asChild variant="ghost"><Link href="/serial?tab=cauhinh">Cấu hình trạng thái</Link></Button>
                    )}
                    <Button asChild variant="outline">
                      <Link href="/serial?tab=cho">Chờ duyệt{quyen.duyet ? ` (${pending.length})` : ''}</Link>
                    </Button>
                    {quyen.kho && <Button asChild><Link href="/serial?tab=nhap">Nhập kho</Link></Button>}
                  </>
                }
                thanhDaChon={<ThanhDaChon nhan="serial" />}
              />
            </Suspense>
          </KhungChon>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
