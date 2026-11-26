import Link from 'next/link'
import { NutQuayLai } from '@/components/NutQuayLai'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { notFound } from 'next/navigation'
import { getTicket, groupsOfTicket, listTicketNotes, listTicketItems, listCatalogItems, ticketTypes } from '@/app/actions'
import { listStaff } from '@/lib/nen-tang/nhan-su'
import { MucDoBadge } from '@/components/NhomLoiBadge'
import { TicketEditor } from '@/components/TicketEditor'
import { TicketNotes } from '@/components/TicketNotes'
import { TicketItems } from '@/components/TicketItems'
import { NhanViecButton } from '@/components/NhanViecButton'
import { vnDate } from '@/components/Badge'
import { DongMayTicket } from '@/components/loi/DongMayTicket'
import { dongMayCuaTicket, danhMucLoi } from '@/app/ticket/loi-actions'
import { canhBaoTuQuery } from '@/lib/loi/canhBao'
import { docAnToan, THIEU_DANH_MUC, THIEU_DONG_MAY } from '@/lib/loi/anToan'
import { listLanLoi } from '@/app/ticket/lan-loi-actions'
import { LanLoiTiepTheo } from '@/components/loi/CapLoiXuLy'
import { lanTiepTheo } from '@/lib/loi/lanLoi'
import { listTepNhatKy } from '@/app/ticket/tep-actions'
import { docThemTicket } from '@/app/ticket/dau-ticket-actions'
import { docNguoiTicket } from '@/app/ticket/nguoi-actions'
import { coSuaDanhSach } from '@/lib/nen-tang/sua-danh-sach-server'
import { DauTicket } from '@/components/ticket/DauTicket'
import { KhoiThuGon, tomTatNhatKy } from '@/components/ticket/KhoiThuGon'
import { ChuaCoSerial } from '@/components/ticket/ChuaCoSerial'
import { ngayCuaLan, ngayVNHomNay, soNgayMo } from '@/lib/loi/ngayTicket'
import { ManV2 } from '@/components/khung/ManV2'
import { CtPrototype } from './_prototype/trang'

export default async function TicketPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ canhBao?: string | string[]; variant?: string }> }) {
  const { code } = await params
  const sp = await searchParams
  const canhBao = canhBaoTuQuery(sp.canhBao)
  const ma = decodeURIComponent(code)
  const [t, nhom, notes, staff, items, catalog, loaiList, { data: dongMay, loi: thieuDongMay }, { data: dsLoi, loi: thieuDanhMuc }, { data: lanLoi, loi: thieuLanLoi }, { data: tepNK, loi: thieuTep }, { data: them, loi: thieuCotMoi }, { data: nguoi, loi: thieuNguoi }, quyen, suaDs] = await Promise.all([
    getTicket(ma), groupsOfTicket(ma), listTicketNotes(ma), listStaff(), listTicketItems(ma),
    listCatalogItems(), ticketTypes(),
    docAnToan('dongMayCuaTicket', () => dongMayCuaTicket(ma), []), docAnToan('danhMucLoi', () => danhMucLoi(), []),
    docAnToan('listLanLoi', () => listLanLoi(ma), []),
    docAnToan('listTepNhatKy', () => listTepNhatKy(ma), []),
    // Cột ngay_bao / cs_theo_doi (17/11) — chưa áp migration thì ẩn phần mới, trang chạy như cũ.
    docAnToan('docThemTicket', () => docThemTicket(ma), { ngay_bao: null, cs_theo_doi: null }),
    // Danh sách CS theo dõi / kỹ thuật sửa được (18/11) — chưa áp migration thì giữ ô chọn kiểu 17/11.
    docAnToan('docNguoiTicket', () => docNguoiTicket(ma), null),
    hoiQuyen({
      lichKT: ['cs.ky_thuat.ho_so', 'QUANLY'],
      chiPhi: ['cs.ticket.chi_phi', 'QUANLY'],
      sua: ['cs.ticket.tao_sua', 'NHANVIEN'],
    }),
    coSuaDanhSach(),
  ])
  if (!t) notFound()

  const homNay = ngayVNHomNay()
  const ngayDau = ngayCuaLan(them.ngay_bao, t.created_at)
  const cuoi = lanLoi.at(-1)
  const ngayCuoi = cuoi ? ngayCuaLan(cuoi.ngay, cuoi.created_at) : ngayDau

  // PROTOTYPE vứt đi: ?variant=<gì cũng được> → trang chi tiết bản gọn dựng bằng DS v2 (CEO duyệt khung 26/11, thay 7 PA
  // A–G); chỉ dev; không có variant → màn cũ.
  if (process.env.NODE_ENV !== 'production' && sp.variant) {
    const ma = new Set(items.map((i) => i.catalog_code).filter(Boolean))
    return (
      <ManV2>
        <CtPrototype
          d={{
            t, ngayBao: them.ngay_bao, csTheoDoi: them.cs_theo_doi, nhom, notes, items,
            tenCatalog: Object.fromEntries(catalog.filter((c) => ma.has(c.code)).map((c) => [c.code, c.ten ?? c.code])),
            lanLoi, dongMay, tepNK, nguoi: thieuNguoi ? null : nguoi, staff, canhBao,
            thieu: { dongMay: thieuDongMay, danhMuc: thieuDanhMuc, lanLoi: thieuLanLoi },
            quyen: { lichKT: quyen.lichKT, sua: quyen.sua },
            ngayDau, ngayCuoi, soNgayMo: ngayDau ? soNgayMo(ngayDau, homNay) : null,
          }}
        />
      </ManV2>
    )
  }

  // Khách & máy: cột phải trên màn rộng; trên điện thoại hiện ngay sau "Các lần lỗi".
  const khachMay = (
    <section className="bg-white rounded-xl border p-5 space-y-4">
      <div>
        <h2 className="font-medium text-slate-900 mb-2">Khách</h2>
        <dl className="text-sm space-y-1.5">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Tên</dt>
            <dd className="text-right min-w-0 [overflow-wrap:anywhere]">
              {t.customer_id ? (
                <Link href={`/khach/${t.customer_id}`} prefetch={false} className="text-slate-900 underline font-medium">{t.customer_name}</Link>
              ) : <span className="text-slate-700">{t.customer_name ?? '—'}</span>}
            </dd>
          </div>
          {t.primary_phone && (
            <div className="flex justify-between gap-3"><dt className="text-slate-500">SĐT</dt><dd className="font-mono text-xs text-slate-900">{t.primary_phone}</dd></div>
          )}
          {t.province && (
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Tỉnh/TP</dt><dd className="text-slate-900">{t.province}</dd></div>
          )}
          <div className="flex justify-between gap-3 items-center">
            <dt className="text-slate-500">Tài khoản nhận việc</dt>
            <dd className="flex items-center gap-2">
              {t.cs_ten ? <span className="text-slate-900">{t.cs_ten}</span> : <span className="text-slate-400">chưa có</span>}
              {!t.cs_phu_trach && <NhanViecButton code={t.ticket_code} />}
            </dd>
          </div>
        </dl>
      </div>
      <div className="border-t border-slate-100 pt-4">
        <h2 className="font-medium text-slate-900 mb-2">Máy & lỗi</h2>
        <dl className="text-sm space-y-1.5 mb-3">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Máy</dt>
            <dd className="text-right">
              {t.serial ? (
                <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false} className="text-slate-900 underline">{t.product_name}</Link>
              ) : <span className="text-slate-400">—</span>}
            </dd>
          </div>
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Serial</dt><dd className="font-mono text-xs text-slate-900">{t.source_serial ?? '—'}</dd></div>
          {t.serial && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Bảo hành</dt>
              <dd className="text-right text-slate-900">
                {t.warranty_activated
                  ? <>đến {vnDate(t.warranty_full_end)} {t.con_han_may ? '✅' : '🔴 hết hạn'}</>
                  : 'chưa kích hoạt'}
              </dd>
            </div>
          )}
        </dl>
        <ChuaCoSerial coSerial={Boolean(t.serial || t.source_serial)} />
        {thieuDongMay
          ? <p className="text-sm bg-amber-50 text-amber-900 rounded-lg px-3 py-2">⚠️ {THIEU_DONG_MAY}</p>
          : <>
              {thieuDanhMuc && <p className="text-sm bg-amber-50 text-amber-900 rounded-lg px-3 py-2 mb-3">⚠️ {THIEU_DANH_MUC}</p>}
              <DongMayTicket code={t.ticket_code} dong={dongMay} dsLoi={dsLoi} choSua={quyen.sua} />
            </>}
      </div>
    </section>
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        <NutQuayLai macDinh="/ticket" />

        <DauTicket
          code={t.ticket_code} loai={t.ticket_type} model={t.product_name} tinh={t.province}
          state={t.state} khan={t.khan} csTheoDoi={them.cs_theo_doi} ktId={t.ky_thuat} staff={staff}
          ngayDau={ngayDau} soLan={1 + lanLoi.length} ngayCuoi={ngayCuoi} homNay={homNay}
          choSua={quyen.sua} choCs={quyen.sua && !thieuCotMoi} coCotMoi={!thieuCotMoi}
          dsCs={thieuNguoi ? null : nguoi?.cs ?? null} dsKt={thieuNguoi ? null : nguoi?.kt ?? null} ktHoSo={nguoi?.kt_ho_so ?? null} quanTri={suaDs}
        />

        {canhBao && <p className="text-sm bg-amber-50 text-amber-900 rounded-lg px-3 py-2">⚠️ {canhBao}</p>}
        {t.may_khong_trong_he_thong && (
          <p className="text-sm bg-red-50 text-red-800 rounded-lg px-3 py-2">
            ⚠️ Ticket này gắn serial <code className="font-mono text-xs">{t.source_serial}</code> nhưng
            máy <strong>không có trong hệ thống</strong> — Odoo đang ghi máy là tồn kho dù nó có ticket
            (tức đang ở nhà khách). Cần gán khách cho serial này trong Odoo rồi export lại.
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start">
          <div className="space-y-4 min-w-0">
            {/* Từng cặp Khách báo ↔ Xử lý theo lần, có ngày khách báo (Lần 1 ở ticket, Lần 2+ ở ticket_lan_loi). */}
            <section className="bg-white rounded-xl border p-5">
              <TicketEditor
                code={t.ticket_code} lastNote={t.last_note} ticketType={t.ticket_type} description={t.description}
                loaiList={loaiList} ngayBao={them.ngay_bao} ngayTao={t.created_at}
                choSua={quyen.sua} coNgayBao={!thieuCotMoi}
              >
                {thieuLanLoi
                  ? <p className="text-sm bg-amber-50 text-amber-900 rounded-lg px-3 py-2">⚠️ Chưa tải được các lần lỗi sau — báo kỹ thuật nếu kéo dài.</p>
                  : <LanLoiTiepTheo code={t.ticket_code} ds={lanLoi} choSua={quyen.sua} lanKe={lanTiepTheo(lanLoi)} />}
              </TicketEditor>
            </section>

            <div className="lg:hidden">{khachMay}</div>

            {/* Thu gọn được, mặc định đóng (chị Trang 18/11): dòng tiêu đề tóm tắt số dòng + dòng mới nhất. */}
            <KhoiThuGon tieuDe="Nhật ký trao đổi" tomTat={tomTatNhatKy(notes)}>
              <TicketNotes code={t.ticket_code} notes={notes} teps={tepNK} choTep={!thieuTep && quyen.sua} />
            </KhoiThuGon>
          </div>

          <div className="space-y-4 min-w-0">
            <div className="hidden lg:block">{khachMay}</div>

            {nhom.length > 0 && (
              <section className="bg-white rounded-xl border p-4">
                <h2 className="font-medium text-slate-900 mb-2 text-sm">Nhóm lỗi</h2>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  {nhom.map((n) => (
                    <Link key={n.group_code} href={`/nhom-loi/${n.group_code}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border hover:bg-slate-50">
                      <span className="text-slate-900">{n.nhom_ten}</span>
                      <MucDoBadge muc_do={n.muc_do} />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white rounded-xl border p-5">
              <h2 className="font-medium text-slate-900 mb-3">Chi phí & vật tư</h2>
              <TicketItems code={t.ticket_code} items={items} catalog={catalog} choPhepSua={quyen.chiPhi} />
            </section>

            {quyen.lichKT && t.customer_id && (
              <Link href={`/ky-thuat?kh=${t.customer_id}&loai=ticket&ref=${encodeURIComponent(t.ticket_code)}&mota=${encodeURIComponent(t.description ?? '')}`}
                className="block text-center rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-medium">
                + Tạo lịch kỹ thuật cho ticket này
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
