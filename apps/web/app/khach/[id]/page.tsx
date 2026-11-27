import Link from 'next/link'
import { Suspense } from 'react'
import { HoSoKhach } from '@/components/khach/HoSoKhach'
import { MAY_KHACH_DEMO, TICKET_DEMO } from '@/app/ticket/_prototype/demo'
import { notFound } from 'next/navigation'
import { dongMayTheoTickets } from '@/app/ticket/loi-actions'
import { dongLoiCuaTicket } from '@/lib/khach/thong-ke-loi'
import { GIOI_HAN } from '@/lib/loi/kiemDauVao'
import { getCustomer, ticketsOfCustomer, machinesOfCustomer, kenhChon, baoTriCuaKhach, diaChiCuaKhach } from '@/app/actions'
import { DiaChiKhachList } from '@/components/DiaChiKhachList'
import { NuocCuaKhach } from '@/components/NuocCuaKhach'
import { CustomerEditor } from '@/components/CustomerEditor'
import { GopKhachButton } from '@/components/GopKhachButton'
import { GanKenh } from '@/components/GanKenh'
import { KhachTabs } from '@/components/KhachTabs'
import { TicketList } from '@/components/TicketList'
import { WarrantyBadge, vnDate } from '@/components/Badge'
import { NutQuayLai } from '@/components/NutQuayLai'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

/**
 * /khach/[id] = HỒ SƠ KHÁCH v2 (2 cột, 3 tab cố định `?tab=` ticket / thong-tin / bao-tri — CEO 27/11). Màn cũ (tab Máy/Ticket/Bảo trì/Sửa thông tin)
 * giữ ở `?cu=1` tới khi v2 có đủ phần sửa thông tin / kênh / địa chỉ / nước. Dev: `DEMO-KH-*` = khách của ticket Demo.
 */
export default async function CustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { id } = await params
  const sp = await searchParams
  if (sp.cu === '1') return <TrangKhachCu id={id} />
  if (process.env.NODE_ENV !== 'production' && id.startsWith('DEMO-KH-')) {
    const tickets = TICKET_DEMO.filter((t) => t.customer_id === id)
    if (!tickets.length) notFound()
    const t = tickets[0]
    const may = MAY_KHACH_DEMO[id] ?? []
    const tenMay = (s: string) => may.find((m) => m.serial === s)?.product_name ?? null
    return (
      <ManV2>
        <Suspense>
          <HoSoKhach
            demo
            khach={{ id, ten: t.customer_name ?? id, sdt: t.primary_phone, tinh: t.province, diaChi: null, nguon: 'Demo', maKh: id, maSales: null, phuTrach: null }}
            may={may}
            tickets={tickets}
            dongLoi={tickets.flatMap((x) => dongLoiCuaTicket(x, x.dong_may ?? [], tenMay))}
            baoTri={[]}
          />
        </Suspense>
      </ManV2>
    )
  }
  const { customer, contacts } = await getCustomer(id)
  if (!customer) notFound()
  const [tickets, machines, baoTri, diaChi, kenh] = await Promise.all([
    ticketsOfCustomer(id), machinesOfCustomer(id), baoTriCuaKhach(id), diaChiCuaKhach(id),
    // Kênh cần quyền he_thong.kenh — thiếu quyền thì Kênh hiện "Chưa có", không hỏng cả hồ sơ.
    kenhChon().catch(() => []),
  ])
  // ponytail: tra tối đa GIOI_HAN.soMaTicket (200) ticket mới nhất — khách vượt mức thì Máy & lỗi đếm thiếu ticket cũ.
  // Dòng máy cần cs.ticket.xem — vai chỉ có cs.khach.xem thì Máy & lỗi rỗng, không hỏng cả hồ sơ (như kenhChon).
  const dongTheoMa = tickets.length
    ? await dongMayTheoTickets(tickets.slice(0, GIOI_HAN.soMaTicket).map((t) => t.ticket_code)).catch(() => ({}) as Record<string, never>)
    : {}
  const tenMay = (s: string) => machines.find((m) => m.serial === s)?.product_name ?? null
  const k = customer.channel_id == null ? null : kenh.find((x) => x.id === customer.channel_id)
  return (
    <ManV2>
      <Suspense>
        <HoSoKhach
          demo={false}
          khach={{
            id: customer.id,
            ten: customer.full_name,
            sdt: customer.primary_phone,
            tinh: customer.province,
            diaChi: customer.address,
            nguon: customer.source,
            maKh: customer.ma_kh ?? null,
            maSales: customer.customer_code ?? null,
            // ST chưa có "phụ trách" ở mức khách → để trống (đợt sau nối nguồn).
            phuTrach: null,
          }}
          may={machines}
          tickets={tickets}
          dongLoi={tickets.flatMap((t) => dongLoiCuaTicket(t, dongTheoMa[t.ticket_code] ?? [], tenMay))}
          lienHe={contacts.map((c) => ({ id: c.id, sdt: c.phone, ten: c.contact_name, vaiTro: c.role, chinh: c.is_primary }))}
          diaChiPhu={diaChi.map((d) => ({ id: d.id, diaChi: d.dia_chi, loai: d.loai, tinh: d.tinh }))}
          kenh={k ? [k.channel_l1, k.channel_l2].filter(Boolean).join(' · ') : null}
          baoTri={baoTri.map((v) => ({ id: v.visit_id, lan: v.lan_thu, ngay: v.due_date, xong: v.completed_at, boMay: v.bo_may }))}
        />
      </Suspense>
    </ManV2>
  )
}

/** Màn khách cũ (trước v2) — `?cu=1`. */
async function TrangKhachCu({ id }: { id: string }) {
  const { customer, contacts } = await getCustomer(id)
  if (!customer) notFound()
  const [tickets, machines, kenh, baoTri, quyen, diaChi] = await Promise.all([
    ticketsOfCustomer(id), machinesOfCustomer(id), kenhChon(), baoTriCuaKhach(id),
    // Link "Tạo lịch bảo trì" dẫn tới /bao-tri/len-lich, mà trang đó gác bằng
    // cs.bao_tri.tao_plan. Hỏi đúng quyền đó thay vì cờ vai trò thô laQuanLy.
    hoiQuyen({ taoPlan: ['cs.bao_tri.tao_plan', 'QUANLY'] }),
    diaChiCuaKhach(id),
  ])
  const btDaXong = baoTri.filter((v) => v.completed_at).length

  // Bốn khối dưới đây là NGUYÊN nội dung của 4 section cũ, chỉ bỏ dòng <h2> vì
  // nhãn tab đã nói rồi. Không đổi một dòng logic nào bên trong.
  const khoiMay = (
    <section className="bg-card rounded-(--radius-xl) border border-border p-5 ">
      {machines.length === 0 ? (
        <p className="text-sm text-muted-foreground">Khách này chưa có máy nào trong hệ thống.</p>
      ) : (
        <ul className="divide-y border rounded-lg">
          {machines.map((m) => (
            <li key={m.serial} className="px-3 py-2.5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/may/${encodeURIComponent(m.serial)}`} prefetch={false} className="text-foreground underline">
                  {m.product_name ?? m.serial}
                </Link>
                <div className="tabular-nums text-xs text-muted-foreground">{m.serial}</div>
                <div className="text-xs text-muted-foreground">Lắp: {vnDate(m.install_date)}</div>
              </div>
              <WarrantyBadge m={m} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )

  const khoiTicket = (
    <section className="bg-card rounded-(--radius-xl) border border-border p-5 ">
      <TicketList tickets={tickets} empty="Khách này chưa có ticket nào." />
    </section>
  )

  const khoiBaoTri = (
    <section className="bg-card rounded-(--radius-xl) border border-border p-5 ">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm text-muted-foreground">{btDaXong}/{baoTri.length} lượt đã làm</p>
        {quyen.taoPlan && (
          <Link href={`/bao-tri/len-lich?kh=${customer.id}`} prefetch={false} className="text-xs text-(--color-text-info) underline whitespace-nowrap">
            ＋ Tạo lịch bảo trì
          </Link>
        )}
      </div>
      {baoTri.length === 0 ? (
        <p className="text-sm text-muted-foreground">Khách này chưa có lịch bảo trì.</p>
      ) : (
        <ul className="divide-y border rounded-lg text-sm">
          {baoTri.map((v) => {
            const doNuoc = [
              v.tds_truoc != null || v.tds_sau != null ? `TDS ${v.tds_truoc ?? '?'}→${v.tds_sau ?? '?'}` : null,
              v.ph_truoc != null || v.ph_sau != null ? `pH ${v.ph_truoc ?? '?'}→${v.ph_sau ?? '?'}` : null,
              v.do_cung_truoc != null || v.do_cung_sau != null ? `Độ cứng ${v.do_cung_truoc ?? '?'}→${v.do_cung_sau ?? '?'}` : null,
              v.clo_truoc != null || v.clo_sau != null ? `Clo ${v.clo_truoc ?? '?'}→${v.clo_sau ?? '?'}` : null,
            ].filter(Boolean).join(' · ')
            return (
              <li key={v.visit_id} className="px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Lần {v.lan_thu ?? '?'}</span> · {vnDate(v.due_date)}
                    {v.bo_may && <span className="text-muted-foreground"> · {v.bo_may}</span>}
                  </span>
                  {v.completed_at
                    ? <span className="text-xs text-(--color-text-success)">✓ đã làm {vnDate(v.completed_at.slice(0, 10))}</span>
                    : <span className="text-xs text-(--color-text-warning)">chưa làm</span>}
                </div>
                {(doNuoc || v.ket_qua_ghi_chu) && <div className="text-[11px] text-muted-foreground mt-0.5">💧 {doNuoc}{v.ket_qua_ghi_chu ? ` · ${v.ket_qua_ghi_chu}` : ''}</div>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )

  const khoiThongTin = (
    <div className="space-y-4">
      <section className="bg-card rounded-(--radius-xl) border border-border p-5 ">
        <h2 className="font-medium text-foreground mb-1">Kênh / đối tác</h2>
        <p className="text-xs text-muted-foreground mb-2">Đại lý/KTS/KOL quản lý khách này (taxonomy chung với Sales).</p>
        {/* Nói thẳng kênh này ở đâu ra. Người dùng nhìn ô đã điền sẵn thì mặc định tin là
            có người điền — mà đây là máy suy từ đơn bên Sales, sai được. */}
        {customer.channel_tu_dong && (
          <p className="mb-2 rounded-lg bg-(--color-background-info-surface) px-2.5 py-1.5 text-xs text-(--color-text-info)">
            🤖 Kênh này do <strong>máy tự điền</strong> theo kênh của <strong>đơn đầu tiên</strong> bên
            Sales — chưa ai xác nhận. Sai thì chọn lại; đúng thì bấm <strong>“Đúng rồi, bỏ nhãn”</strong>.
          </p>
        )}
        <GanKenh customerId={customer.id} channelId={customer.channel_id} kenh={kenh} tuDong={customer.channel_tu_dong} />
      </section>
      <CustomerEditor customer={customer} contacts={contacts} />
      <DiaChiKhachList customerId={customer.id} items={diaChi} />

      {/* Lịch sử chất lượng nước — CEO yêu cầu 31/08: xem theo TỪNG LẦN kiểm tra. */}
      <NuocCuaKhach customerId={customer.id} />
    </div>
  )

  return (
    <ManV2>
      <TrangDuLieu className="max-w-4xl">
        <div className="min-w-0 space-y-4">
          <NutQuayLai macDinh="/" />

          {/* Đầu trang: ai — gọi số nào — ở đâu — bao nhiêu máy/ticket/bảo trì.
              Trước đây phải cuộn qua 5 khối dọc mới ráp đủ chừng đó thông tin. */}
          <section className="rounded-(--radius-xl) border border-border bg-card p-5 ">
            <div className="flex items-start gap-4 flex-wrap">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-(--radius-xl) bg-[#fbeadd] text-lg font-bold text-[#8a4a1c]">
                {(customer.full_name ?? '?').trim().slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-[200px] flex-1">
                {/* Mã khách hiện ngay ở đầu hồ sơ: CEO 24/08 cầm mã đi tra mà không màn nào
                    hiện mã. `ma_kh` là mã dùng chung hai khu; `customer_code` là mã nối sang
                    Sales — hiện cả hai vì đang có 4 cặp lệch nhau cần đối chiếu tận nơi. */}
                <PageHeader
                  tieuDe={customer.full_name}
                  meta={[
                    customer.primary_phone
                      ? <span key="sdt" className="tabular-nums">{customer.primary_phone}</span>
                      : <span key="sdt" className="text-(--color-text-warning)">thiếu SĐT</span>,
                    customer.province,
                    customer.source,
                    customer.ma_kh && <span key="ma" className="tabular-nums">{customer.ma_kh}</span>,
                    customer.customer_code && <span key="sales" className="tabular-nums">Sales {customer.customer_code}</span>,
                  ].filter(Boolean)}
                  hanhDong={<GopKhachButton giuId={customer.id} tenGiu={customer.full_name} />}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-muted">
              {[
                { n: String(machines.length), t: 'Máy đã lắp' },
                { n: String(tickets.length), t: 'Ticket' },
                { n: `${btDaXong}/${baoTri.length}`, t: 'Bảo trì đã làm' },
                { n: String(contacts.length), t: 'Liên hệ' },
              ].map((o) => (
                <div key={o.t} className="bg-muted px-3 py-2.5 text-center">
                  <div className="text-lg font-bold tabular-nums text-foreground">{o.n}</div>
                  <div className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{o.t}</div>
                </div>
              ))}
            </div>
          </section>

          <KhachTabs
            tabs={[
              { khoa: 'may', nhan: `Máy (${machines.length})`, noiDung: khoiMay },
              { khoa: 'ticket', nhan: `Ticket (${tickets.length})`, noiDung: khoiTicket },
              { khoa: 'baotri', nhan: `Bảo trì (${baoTri.length})`, noiDung: khoiBaoTri },
              { khoa: 'thongtin', nhan: '✎ Sửa thông tin', noiDung: khoiThongTin },
            ]}
          />
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
