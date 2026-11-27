import Link from 'next/link'
import { NutQuayLai } from '@/components/NutQuayLai'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { notFound } from 'next/navigation'
import { getTicket, groupsOfTicket, listTicketNotes, listTicketItems, listCatalogItems, ticketTypes, ticketsOfCustomer, ticketsOfSerial } from '@/app/actions'
import { listStaff } from '@/lib/nen-tang/nhan-su'
import { layNhanVien } from '@/lib/nen-tang/phien'
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
import { listTepNhatKy } from '@/app/ticket/tep-actions'
import { docThemTicket } from '@/app/ticket/dau-ticket-actions'
import { docNguoiTicket } from '@/app/ticket/nguoi-actions'
import { coSuaDanhSach } from '@/lib/nen-tang/sua-danh-sach-server'
import { DauTicket } from '@/components/ticket/DauTicket'
import { TicketList } from '@/components/TicketList'
import { tomTatNhatKy } from '@/components/ticket/KhoiThuGon'
import { ChuaCoSerial } from '@/components/ticket/ChuaCoSerial'
import { ngayCuaLan, ngayVNHomNay, soNgayMo } from '@/lib/loi/ngayTicket'
import { ManV2 } from '@/components/khung/ManV2'
import { CtPrototype } from './_prototype/trang'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { DetailHeading } from '@/components/ui/detail-layout'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'

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
      xemKhach: ['cs.khach.xem', 'NHANVIEN'],
      xemTatCa: ['cs.ticket.xem_tat_ca', 'QUANLY'],
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
          variant={sp.variant}
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

  const [lichMay, lichKhach, nguoiXem] = await Promise.all([
    docAnToan('ticketsOfSerial', () => t.serial ? ticketsOfSerial(t.serial) : Promise.resolve([]), []),
    docAnToan('ticketsOfCustomer', () => t.customer_id && quyen.xemKhach ? ticketsOfCustomer(t.customer_id) : Promise.resolve([]), []),
    quyen.xemTatCa ? Promise.resolve(null) : layNhanVien(),
  ])
  const maNguoiXem = nguoiXem?.id
  const lichSu = [...new Map([...lichMay.data, ...lichKhach.data]
    // Cùng phạm vi phân công với searchTickets. Lọc trên server trước khi tạo các mục liên kết.
    .filter((cu) => quyen.xemTatCa || cu.cs_phu_trach == null ||
      (maNguoiXem != null && (cu.cs_phu_trach === maNguoiXem || cu.ky_thuat === maNguoiXem)))
    .filter((cu) => cu.ticket_code !== t.ticket_code && Date.parse(cu.created_at) <= Date.parse(t.created_at))
    .map((cu) => [cu.ticket_code, cu])).values()]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 5)

  const may = t.serial ? (
    <Link href={`/may/${encodeURIComponent(t.serial)}`} prefetch={false} className="underline underline-offset-2">
      {t.product_name ?? t.serial}
    </Link>
  ) : t.product_name ?? 'Chưa rõ máy'
  const khach = t.customer_id ? (
    <Link href={`/khach/${t.customer_id}`} prefetch={false} className="underline underline-offset-2">
      {t.customer_name ?? 'Hồ sơ khách'}
    </Link>
  ) : t.customer_name ?? 'Chưa gắn khách'
  const baoHanh = t.serial && (
    t.warranty_activated ? (
      <Badge variant="soft" color={t.con_han_may ? 'success' : 'danger'}>
        {t.con_han_may ? 'Bảo hành đến' : 'Hết bảo hành'} {vnDate(t.warranty_full_end)}
      </Badge>
    ) : <Badge variant="soft" color="warning">Chưa kích hoạt bảo hành</Badge>
  )

  return (
    <ManV2>
      <TrangDuLieu className="max-w-5xl">
        <div className="flex min-w-0 flex-col gap-5">
          <DauTicket
            code={t.ticket_code} loai={t.ticket_type} model={t.product_name} tinh={t.province}
            state={t.state} khan={t.khan} csTheoDoi={them.cs_theo_doi} ktId={t.ky_thuat} staff={staff}
            ngayDau={ngayDau} soLan={1 + lanLoi.length} ngayCuoi={ngayCuoi} homNay={homNay}
            choSua={quyen.sua} choCs={quyen.sua && !thieuCotMoi} coCotMoi={!thieuCotMoi}
            dsCs={thieuNguoi ? null : nguoi?.cs ?? null} dsKt={thieuNguoi ? null : nguoi?.kt ?? null}
            ktHoSo={nguoi?.kt_ho_so ?? null} quanTri={suaDs}
            duongDan={<NutQuayLai macDinh="/ticket" />}
            meta={[may, t.source_serial, baoHanh, khach, t.province].filter(Boolean)}
          />

          {canhBao && <Alert color="warning"><AlertDescription>{canhBao}</AlertDescription></Alert>}
          {t.may_khong_trong_he_thong && (
            <Alert color="danger">
              <AlertDescription>
                Ticket này gắn serial <code className="break-all">{t.source_serial}</code> nhưng máy không có trong hệ thống
                — Odoo đang ghi máy là tồn kho dù nó có ticket (tức đang ở nhà khách). Cần gán khách cho serial này trong
                Odoo rồi export lại.
              </AlertDescription>
            </Alert>
          )}

          <TicketEditor
            code={t.ticket_code} lastNote={t.last_note} ticketType={t.ticket_type} description={t.description}
            loaiList={loaiList} ngayBao={them.ngay_bao} ngayTao={t.created_at}
            choSua={quyen.sua} coNgayBao={!thieuCotMoi} lanLoi={lanLoi} thieuLanLoi={thieuLanLoi}
          />

          {(t.serial || (t.customer_id && quyen.xemKhach)) && (
            <section aria-labelledby="ticket-lien-quan" className="space-y-2">
              <DetailHeading id="ticket-lien-quan">Máy &amp; khách đã lỗi gì trước</DetailHeading>
              {lichMay.loi || lichKhach.loi
                ? <Alert color="warning"><AlertDescription>Chưa tải được đầy đủ lịch sử ticket.</AlertDescription></Alert>
                : null}
              {(lichSu.length > 0 || (!lichMay.loi && !lichKhach.loi)) &&
                <TicketList tickets={lichSu} empty="Chưa có ticket trước đó." />}
            </section>
          )}

          {/* Chi phí + khối khách/máy (nút Nhận việc, sửa máy & lỗi) mở sẵn: mở ticket là thấy việc phải làm ngay.
              Nhật ký gập lại — trigger đã có dòng tóm tắt. */}
          <Accordion type="multiple" defaultValue={['chi-phi', 'thong-tin']}>
            <AccordionItem value="nhat-ky">
              <AccordionTrigger>
                <span className="flex min-w-0 flex-col gap-1">
                  <span>Nhật ký trao đổi · {notes.length}</span>
                  <span className="truncate font-normal text-muted-foreground">{tomTatNhatKy(notes)}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {thieuTep && (
                  <Alert color="warning" className="mb-3"><AlertDescription>Chưa tải được tệp đính kèm.</AlertDescription></Alert>
                )}
                <TicketNotes code={t.ticket_code} notes={notes} teps={tepNK} choTep={!thieuTep && quyen.sua} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="chi-phi">
              <AccordionTrigger>Chi phí &amp; vật tư · {items.length}</AccordionTrigger>
              <AccordionContent>
                <TicketItems code={t.ticket_code} items={items} catalog={catalog} choPhepSua={quyen.chiPhi} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="thong-tin">
              <AccordionTrigger>Thông tin khác</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <PropertyList>
                  <PropertyRow nhan="Khách">{khach}</PropertyRow>
                  <PropertyRow nhan="SĐT"><span className="tabular-nums">{t.primary_phone ?? '—'}</span></PropertyRow>
                  <PropertyRow nhan="Tỉnh/TP">{t.province}</PropertyRow>
                  <PropertyRow nhan="Tài khoản nhận việc">
                    <span className="flex flex-wrap items-center gap-2">
                      {t.cs_ten ?? 'Chưa có'}{!t.cs_phu_trach && <NhanViecButton code={t.ticket_code} />}
                    </span>
                  </PropertyRow>
                  <PropertyRow nhan="Máy">{may}</PropertyRow>
                  <PropertyRow nhan="Serial">{t.source_serial}</PropertyRow>
                  <PropertyRow nhan="Ngày tạo">{vnDate(t.created_at)}</PropertyRow>
                  {baoHanh && <PropertyRow nhan="Bảo hành">{baoHanh}</PropertyRow>}
                </PropertyList>

                <DetailHeading cap={3}>Máy &amp; lỗi</DetailHeading>
                <ChuaCoSerial coSerial={Boolean(t.serial || t.source_serial)} />
                {thieuDongMay
                  ? <Alert color="warning"><AlertDescription>{THIEU_DONG_MAY}</AlertDescription></Alert>
                  : <>
                      {thieuDanhMuc && <Alert color="warning"><AlertDescription>{THIEU_DANH_MUC}</AlertDescription></Alert>}
                      <DongMayTicket code={t.ticket_code} dong={dongMay} dsLoi={dsLoi} choSua={quyen.sua} />
                    </>}
                {nhom.length > 0 && (
                  <PropertyList>
                    <PropertyRow nhan="Nhóm lỗi">
                      <span className="flex flex-wrap items-center gap-2">
                        {nhom.map((n) => (
                          <Button key={n.group_code} asChild size="sm" variant="outline">
                            <Link href={`/nhom-loi/${encodeURIComponent(n.group_code)}`}>
                              {n.nhom_ten}<MucDoBadge muc_do={n.muc_do} />
                            </Link>
                          </Button>
                        ))}
                      </span>
                    </PropertyRow>
                  </PropertyList>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {quyen.lichKT && t.customer_id && (
            <Button asChild variant="outline" className="self-start">
              <Link href={`/ky-thuat?kh=${encodeURIComponent(t.customer_id)}&loai=ticket&ref=${encodeURIComponent(t.ticket_code)}&mota=${encodeURIComponent(t.description ?? '')}`}>
                Tạo lịch kỹ thuật cho ticket này
              </Link>
            </Button>
          )}
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
