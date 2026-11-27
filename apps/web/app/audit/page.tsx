import { Badge } from '@/components/ui/badge'
import { Suspense } from 'react'
import { ManV2 } from '@/components/khung/ManV2'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { O_TIM_PILL } from '@/components/ui/bang-styles'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { CHON_BANG_GHIM } from '@/components/ui/table-styles'
import type { CotBang } from '@/components/ui/use-cot-bang'
import { BangDungSan } from '@/components/BangDungSan'
import { chanNeuThieuQuyen, hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { listNhatKyThaoTac, listTabView } from '@/app/actions'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { KET_QUA_AUDIT, TAB_AUDIT, TRUONG_AUDIT } from './truong-audit'

const NHAN_BANG: Record<string, string> = {
  cs_customers: 'khách', customer_contacts: 'SĐT phụ',
  filter_replacement: 'lịch thay lõi', installed_base: 'máy đã lắp',
}
const NHAN: Record<string, string> = {
  duyet_serial: 'Duyệt serial', tu_choi_serial: 'Từ chối serial', xoa_serial_pending: 'Xoá serial chờ',
  duyet_khach: 'Duyệt khách', kich_hoat_bh: 'Kích hoạt BH', sua_nv: 'Sửa nhân viên',
  gui_yeu_cau: 'Gửi yêu cầu (chờ duyệt)', duyet_yeu_cau: 'Duyệt yêu cầu', tu_choi_yeu_cau: 'Từ chối yêu cầu',
}

/** Nhãn hành động: ưu tiên map, còn lại suy từ mẫu <loai>_<bảng>. */
function nhanHanhDong(hd: string): string {
  if (NHAN[hd]) return NHAN[hd]
  const m = hd.match(/^(sua|xoa|doi_serial)_(.+)$/)
  if (m) {
    const loai = m[1] === 'sua' ? 'Sửa' : m[1] === 'xoa' ? 'Xoá' : 'Đổi serial'
    return `${loai} ${NHAN_BANG[m[2]] ?? m[2]}`
  }
  return hd
}

function chiTiet(o: Record<string, unknown> | null): string {
  if (!o) return '—'
  return Object.entries(o).map(([k, v]) => `${k}=${v ?? '—'}`).join(' · ')
}

const COT: CotBang[] = [
  { id: 'luc', ten: 'Lúc', kieu: 'thuong', khoa: true },
  { id: 'actor', ten: 'Người', kieu: 'thuong', rongToiDa: 240 },
  { id: 'hanh_dong', ten: 'Hành động', kieu: 'thuong', rongToiDa: 240 },
  { id: 'doi_tuong', ten: 'Đối tượng', kieu: 'thuong', rongToiDa: 280 },
  { id: 'chi_tiet', ten: 'Chi tiết', kieu: 'thuong', rongToiDa: 420 },
  { id: 'ket_qua', ten: 'Kết quả', kieu: 'thuong' },
]

// Nhật ký thao tác — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await chanNeuThieuQuyen('he_thong.nhat_ky', 'ADMIN')
  const sp = await searchParams
  const trang = Math.max(1, Number(sp.trang) || 1)
  const loc = Object.fromEntries(TRUONG_AUDIT.map((x) => [x.id, sp[x.id]]))
  const [{ rows, tong, soTrang }, tabRieng, quyen] = await Promise.all([
    listNhatKyThaoTac(sp.q ?? '', { trang, loc }),
    listTabView('audit_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs giaoDien={{ ...O_TIM_PILL, ...CHON_BANG_GHIM }} thanhHangLoat="surface">
          <Suspense>
            <BangDungSan
              tieuDe="Nhật ký thao tác"
              nhan="thao tác"
              bang="audit_tab"
              tabCoDinh={TAB_AUDIT}
              tabRieng={tabRieng}
              quyenTabChung={quyen.viewChung}
              viDuTen="VD: Xoá khách tuần này"
              khu="Hệ thống"
              timKiem="Người, hành động, đối tượng…"
              truong={TRUONG_AUDIT.map((x) => ({ id: x.id, ten: x.ten, kieu: x.kieu, tuyChon: x.kieu === 'chon' ? KET_QUA_AUDIT : undefined }))}
              locCot={{ ket_qua: 'kq' }}
              cot={COT}
              dienThoai={{ tren: 'hanh_dong', duoi: 'actor', duoiPhai: 'luc' }}
              tong={tong}
              trang={trang}
              soTrang={soTrang}
              dong={rows.map((r) => ({
                khoa: String(r.id),
                o: {
                  luc: <span className="text-muted-foreground">{hienNgay(r.luc, 'gio')}</span>,
                  actor: r.actor ?? '—',
                  hanh_dong: nhanHanhDong(r.hanh_dong),
                  doi_tuong: <span className="font-mono text-xs text-muted-foreground">{r.doi_tuong ?? '—'}</span>,
                  chi_tiet: <span className="font-mono text-xs text-muted-foreground" title={chiTiet(r.chi_tiet)}>{chiTiet(r.chi_tiet)}</span>,
                  ket_qua: <Badge variant="soft" color={r.ket_qua === 'ok' ? 'success' : 'danger'}>{r.ket_qua}</Badge>,
                },
              }))}
              ghiChu={<p className="text-sm text-muted-foreground">Vết mọi thao tác nhạy cảm: duyệt / kích hoạt / sửa / xoá + chi tiết, mới nhất trước.</p>}
            />
          </Suspense>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
