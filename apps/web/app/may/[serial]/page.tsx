import Link from 'next/link'
import { NutQuayLai } from '@/components/NutQuayLai'
import { notFound } from 'next/navigation'
import { getMachine, mayKhoInfo, ticketsOfSerial, lichSuSerial, dsTrangThai, daiLyCuaMay, donDaiLyChon, doiTacChon } from '@/app/actions'
import { NHAN_DO_CHAC } from '@/lib/danhSach'
import { WarrantyBadge, vnDate } from '@/components/Badge'
import { ActivateForm } from '@/components/ActivateForm'
import { TicketList } from '@/components/TicketList'
import { LoiCuaMay } from '@/components/LoiCuaMay'
import { QuanLyMay } from '@/components/QuanLyMay'
import { GanDaiLy } from '@/components/GanDaiLy'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { docChoSerial } from '@/app/may/chua-serial-actions'
import { BoSungSerial } from '@/components/bh/BoSungSerial'
import { docThongTinLap } from '@/app/may/huy-lap-actions'
import { QuanLyLap } from '@/components/bh/QuanLyLap'
import { docAnToan } from '@/lib/loi/anToan'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

export default async function MachinePage({ params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params
  const serialGoc = decodeURIComponent(serial)
  const m = await getMachine(serialGoc)
  // Máy CHƯA lắp khách không có trong v_installed_base -> vẫn cho xem trang máy KHO
  // (thông tin gọn + nhật ký vòng đời trạng thái), thay vì 404.
  if (!m) return <MayKhoView serial={serialGoc} />
  const [tickets, vongDoi, quyen, dsTT, daiLy, donDaiLy, doiTacDs, { data: cho }, { data: lap }] = await Promise.all([
    ticketsOfSerial(m.serial), lichSuSerial(m.serial), hoiQuyen({
      lichKT: ['cs.ky_thuat.ho_so', 'QUANLY'],
      lapThuDoi: ['cs.may.lap_thu_doi', 'QUANLY'],
      suaKhach: ['cs.khach.xin_xoa', 'NHANVIEN'],
      khoSerial: ['cs.serial.kho', 'QUANLY'],
      kichHoat: ['cs.may.kich_hoat_bh', 'NHANVIEN'],
    }), dsTrangThai(), daiLyCuaMay(m.serial), donDaiLyChon(), doiTacChon(),
    // Cờ chờ bổ sung serial (18/11) — chưa áp migration thì coi như không chờ.
    docAnToan('docChoSerial', () => docChoSerial(m.serial), { cho_serial: false, internal_code: null }),
    // Bộ combo + huỷ lắp (nhập nhầm) bất cứ lúc nào + sửa ngày cả bộ (18/11). Đọc lỗi → không hiện khung.
    docAnToan('docThongTinLap', () => docThongTinLap(m.serial), null),
  ])
  // Máy này có phải máy THAY THẾ (đổi máy cho khách) không -> hiện tính chuyển tiếp.
  const suKienThayThe = vongDoi.su_kien.find((s) => s.su_kien === 'doi_may_lap_moi')

  // Chỉ chứa DỮ LIỆU, không chứa JSX — cách hiển thị do chỗ render quyết định.
  // (Để JSX trong mảng thì eslint react/jsx-key báo lỗi, dù ở đây không cần key.)
  const rows: { label: string; value: React.ReactNode; mono?: boolean }[] = [
    { label: 'Serial', value: m.serial, mono: true },
    { label: 'Máy', value: m.product_name ?? '—' },
    { label: 'Mã nội bộ', value: m.internal_code ?? '—', mono: true },
    { label: 'Nhóm', value: m.category_l2 ?? '—' },
    {
      label: 'Ngày bắt đầu BH',
      value: (
        <>
          {vnDate(m.warranty_start ?? m.install_date)}
          {/* Ngày đoán phải nhìn ra ngay — nếu không, CS đọc hạn BH rồi báo chắc nịch
              cho khách trong khi mốc gốc chỉ là ước lượng. */}
          {m.ngay_lap_do_chac && m.ngay_lap_do_chac !== 'chinh_xac' && (
            <span className="ml-2 rounded-full bg-(--color-background-warning-surface) px-2 py-0.5 text-xs font-medium text-(--color-text-warning)">
              {NHAN_DO_CHAC[m.ngay_lap_do_chac]} — ngày chỉ là ước lượng
            </span>
          )}
        </>
      ),
    },
    { label: 'Trạng thái máy', value: m.status },
    { label: 'Hết BH máy', value: vnDate(m.warranty_full_end) },
    { label: 'Hết BH linh kiện', value: vnDate(m.warranty_core_end) },
    ...(m.ghi_chu ? [{ label: 'Ghi chú', value: m.ghi_chu }] : []),
  ]

  return (
    <ManV2>
      <TrangDuLieu className="max-w-3xl">
        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <NutQuayLai macDinh="/" />
          </div>

          <div className="flex items-center gap-3">
            <PageHeader tieuDe={m.product_name} />
            <WarrantyBadge m={m} />
          </div>

          {cho.cho_serial && <BoSungSerial maTam={m.serial} internalCode={cho.internal_code ?? m.internal_code} choSua={quyen.kichHoat} />}
          {lap && <QuanLyLap serial={m.serial} tt={lap} choSua={quyen.kichHoat} />}

          <section className="bg-card rounded-(--radius-xl) border p-5">
            <h2 className="font-medium text-foreground mb-3">Khách hàng</h2>
            {suKienThayThe && (
              <p className="text-sm bg-(--color-background-discovery-surface) text-(--color-text-discovery) rounded-lg px-3 py-2 mb-3">
                🔄 <strong>Máy thay thế</strong> — {suKienThayThe.ghi_chu ?? 'kế thừa bảo hành + khách của máy cũ'}
              </p>
            )}
            {m.customer_id ? (
              <p className="text-sm">
                <Link href={`/khach/${m.customer_id}`} prefetch={false} className="text-foreground underline font-medium">
                  {m.customer_name}
                </Link>
                <span className="text-muted-foreground"> · </span>
                <span className="tabular-nums text-xs">{m.primary_phone ?? <span className="text-(--color-text-warning)">chưa có SĐT</span>}</span>
              </p>
            ) : <p className="text-sm text-muted-foreground">Chưa gắn khách</p>}
          </section>

          <section className="bg-card rounded-(--radius-xl) border p-5">
            <h2 className="font-medium text-foreground mb-3">Thông tin máy</h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {rows.map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between border-b border-border py-1.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className={`text-foreground text-right${mono ? ' tabular-nums text-xs' : ''}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="bg-card rounded-(--radius-xl) border p-5">
            <h2 className="font-medium text-foreground mb-3">Lõi lọc & lịch thay</h2>
            <LoiCuaMay serial={m.serial} />
            {quyen.lichKT && m.customer_id && (
              <Link href={`/ky-thuat?kh=${m.customer_id}&loai=thay_loi&ref=${encodeURIComponent(m.serial)}`}
                className="mt-3 inline-block rounded-lg bg-(--color-background-success-solid) text-primary-foreground px-3 py-1.5 text-sm font-medium">
                + Tạo lịch kỹ thuật (thay lõi máy này)
              </Link>
            )}
          </section>

          <section className="bg-card rounded-(--radius-xl) border p-5">
            <h2 className="font-medium text-foreground mb-3">Ticket của máy này ({tickets.length})</h2>
            <TicketList tickets={tickets} empty="Máy này chưa có ticket nào." />
          </section>

          <section className="bg-card rounded-(--radius-xl) border p-5">
            <h2 className="font-medium text-foreground mb-3">Bảo hành</h2>
            {/* Mã bộ combo không có bảo hành riêng — bảo hành nằm ở từng thiết bị (18/11: bấm nhầm ở đây tạo BH vô nghĩa). */}
            {lap?.la_bo ? (
              <p className="text-sm text-muted-foreground">Bảo hành tính theo <strong>từng thiết bị</strong> trong bộ (danh sách ở trên). Đổi ngày cho cả bộ bằng nút &quot;Sửa ngày bảo hành cả bộ&quot;.</p>
            ) : (
              <ActivateForm
                serial={m.serial}
                defaultDate={m.warranty_start ?? m.install_date}
                activated={m.warranty_activated}
                hasPolicy={m.co_chinh_sach_bh}
              />
            )}
          </section>

          <section className="bg-card rounded-(--radius-xl) border p-5">
            <h2 className="font-medium text-foreground mb-3">Quản lý máy</h2>
            <GanDaiLy serial={m.serial} daiLyTen={daiLy.dai_ly_ten}
              daiLyDon={daiLy.dai_ly_don} doiTacList={doiTacDs} donList={donDaiLy} />

            <QuanLyMay serial={m.serial} internalCode={m.internal_code} trangThai={vongDoi.trang_thai} suKien={vongDoi.su_kien}
              dangLap={!!m.customer_id} ds={dsTT}
              choLapThuDoi={quyen.lapThuDoi} choSuaKhach={quyen.suaKhach} choKhoSerial={quyen.khoSerial} />
          </section>
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}

/** Trang gọn cho máy CHƯA lắp khách (đang ở kho: trưng bày/mkt/bảo trì…). Không có
 *  trong v_installed_base nên thiếu BH/khách; nhưng vẫn cần xem + đổi trạng thái và
 *  NHẤT LÀ nhật ký vòng đời (lịch sử trạng thái theo thời gian). */
async function MayKhoView({ serial }: { serial: string }) {
  const kho = await mayKhoInfo(serial)
  if (!kho) notFound()
  const [vongDoi, quyen, dsTT] = await Promise.all([
    lichSuSerial(kho.serial),
    hoiQuyen({
      lapThuDoi: ['cs.may.lap_thu_doi', 'QUANLY'],
      suaKhach: ['cs.khach.xin_xoa', 'NHANVIEN'],
      khoSerial: ['cs.serial.kho', 'QUANLY'],
    }),
    dsTrangThai(),
  ])
  const mapTT = new Map(dsTT.map((t) => [t.code, t]))
  const nhanTT = (c: string | null) => (c ? mapTT.get(c)?.nhan ?? c : '—')
  const rows: { label: string; value: React.ReactNode; mono?: boolean }[] = [
    { label: 'Serial', value: kho.serial, mono: true },
    { label: 'Tên nội bộ', value: kho.ten_noi_bo ?? '—' },
    { label: 'Mã nội bộ', value: kho.ma_noi_bo ?? '—', mono: true },
    { label: 'Trạng thái', value: nhanTT(kho.trang_thai) },
  ]

  return (
    <ManV2>
      <TrangDuLieu className="max-w-3xl">
        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <NutQuayLai macDinh="/serial" />
          </div>

          <div className="flex items-center gap-3">
            <PageHeader tieuDe={kho.ten_noi_bo ?? kho.serial} />
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground whitespace-nowrap">Máy trong kho — chưa lắp khách</span>
          </div>

          <section className="bg-card rounded-(--radius-xl) border p-5">
            <h2 className="font-medium text-foreground mb-3">Thông tin máy</h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {rows.map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between border-b border-border py-1.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className={`text-foreground text-right${mono ? ' tabular-nums text-xs' : ''}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="bg-card rounded-(--radius-xl) border p-5">
            <h2 className="font-medium text-foreground mb-3">Quản lý máy & lịch sử trạng thái</h2>
            <QuanLyMay serial={kho.serial} internalCode={kho.ma_noi_bo} trangThai={vongDoi.trang_thai} suKien={vongDoi.su_kien}
              dangLap={false} ds={dsTT}
              choLapThuDoi={quyen.lapThuDoi} choSuaKhach={quyen.suaKhach} choKhoSerial={quyen.khoSerial} />
          </section>
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
