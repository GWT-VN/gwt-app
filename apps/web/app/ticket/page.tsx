import Link from 'next/link'
import { Suspense } from 'react'
import { danhMucLoi, mayCuaCacKhach } from '@/app/ticket/loi-actions'
import { docAnToan, THIEU_DANH_MUC } from '@/lib/loi/anToan'
import { searchTickets, ticketTypes, khoaTatCaTicket, listBangView, listTabView, type Ticket } from '@/app/actions'
import { currentStaff, listStaff } from '@/lib/nen-tang/nhan-su'
import type { KetQuaTrang } from '@/bang'
import { ExportTicketButton } from '@/components/ExportTicketButton'
import { BangTicket } from '@/components/BangTicket'
import { DauTrang } from '@/components/DauTrang'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { OTimKiem } from '@/bang'
import { ThanhDangLoc } from '@/bang'
import { PhanTrang } from '@/bang'
import { BoLocChon, BoLocGoiY } from '@/bang'
import { LocNgay } from '@/bang'
import { docLocNgay, moTaLocNgay, SAP_TICKET_MAC_DINH } from '@/lib/danhSach'
import { TuLamMoi } from '@/components/TuLamMoi'
import { KhungChon, ThanhDaChon } from '@/bang'
import { redirect } from 'next/navigation'
import { ManV2 } from '@/components/khung/ManV2'
import { cotLocTicket } from '@/app/actions'
import { TrangTicketPrototype } from './_prototype/trang'
import { locDemo, TICKET_DEMO, TOI_DEMO } from './_prototype/demo'
import { TicketF } from './_danh-sach/ds-f'
import type { DuLieuTicket } from './_danh-sach/chung'
import { queryTab, TRUONG_F, tuyChonF, VIEW_F } from './_danh-sach/truong-f'
import { apLoc, docTatCa } from '@/bang/locTruong'

type SP = Record<string, string | string[] | undefined>
const mot = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/**
 * Dữ liệu danh sách F (/ticket): lọc theo trường + tìm + sắp + trang ở DB (searchTickets); tab = bộ lọc chọn sẵn (VIEW_F
 * `loc`), số mỗi tab = đếm ở DB với đúng bộ lọc của tab. Giá trị ô lọc chọn = distinct trên mọi ticket xem được
 * (cotLocTicket). Dev + DB < 5 ticket → nối ticket Demo trong bộ nhớ (lọc bằng cùng TRUONG_F); production không có Demo.
 */
async function duLieuF(sp: SP): Promise<DuLieuTicket> {
  const trang = Math.max(1, Number(mot(sp.trang)) || 1)
  const [me, tabRieng, { viewChung, sua }, nhanVien] = await Promise.all([
    currentStaff(),
    // Tab tự tạo (bang_view 'ticket_tab'). Đọc lỗi → chỉ 4 tab cố định, không vỡ trang.
    docAnToan('listTabView', () => listTabView('ticket_tab'), []).then((r) => r.data),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'], sua: ['cs.ticket.tao_sua', 'NHANVIEN'] }),
    // Người phụ trách chọn được ở ô bảng / Xem nhanh (như form Tạo ticket).
    listStaff(),
  ])
  const dev = process.env.NODE_ENV !== 'production'
  // Một bộ lọc (query) → điều kiện DB. Cột "Ngày tạo" (`cot=tao`) = created_at; chọn cột sắp → Khẩn không chen lên đầu.
  const dieuKien = (p: URLSearchParams) => {
    const cot = p.get('cot') === 'tao' ? 'created_at' : undefined
    return { q: p.get('q') ?? '', dk: docTatCa(p, TRUONG_F), cot, chieu: p.get('chieu') ?? undefined }
  }
  const hien = dieuKien(new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : []))))
  // Không đếm từng tab nữa: bộ đếm duy nhất là phân trang dưới bảng (CEO 27/11 "bỏ hết bộ đếm… cho hiển thị bằng pagination").
  const [ketQua, cotDb, { data: dsLoi }, tongDb] = await Promise.all([
    searchTickets(hien.q, undefined, false, undefined, {
      locTruong: hien.dk, toiId: me?.id, khanTruoc: !hien.cot, trang, cot: hien.cot, chieu: hien.chieu,
    }),
    cotLocTicket(),
    docAnToan('danhMucLoi', () => danhMucLoi(), []),
    dev ? searchTickets('', undefined, false, undefined, { chiDem: true }).then((r) => r.tong) : Promise.resolve(Infinity),
  ])
  const demo = tongDb < 5
  // Máy của các khách trên trang (pop chọn ô Máy) — một truy vấn; lỗi đọc → ô Máy chỉ đọc.
  const { data: mayKhach } = await docAnToan(
    'mayCuaCacKhach',
    () => mayCuaCacKhach(ketQua.rows.flatMap((r) => (r.customer_id ? [r.customer_id] : []))),
    {},
  )
  // Demo: cùng tìm kiếm (locDemo) + bộ lọc trường (apLoc, "Tôi" = TOI_DEMO).
  const locDemoTheo = (d: ReturnType<typeof dieuKien>) => (demo ? apLoc(locDemo({ q: d.q }), d.dk, TRUONG_F, { toi: TOI_DEMO }) : [])
  const demoHien = locDemoTheo(hien)
  let rows = [...ketQua.rows, ...demoHien]
  if (demo && hien.cot) {
    const tang = hien.chieu !== 'desc'
    rows = rows.sort((a, b) => (Date.parse(a.created_at) - Date.parse(b.created_at)) * (tang ? 1 : -1) || a.ticket_code.localeCompare(b.ticket_code))
  }
  return {
    rows,
    tong: ketQua.tong + demoHien.length,
    trang,
    soTrang: demo ? 1 : ketQua.soTrang,
    loaiList: [],
    dsLoi: dsLoi.map((d) => ({ code: d.code, ten: d.ten, ma_may: d.ma_may, ngung: d.trang_thai === 'ngung' })),
    demo,
    quyenSua: sua,
    mayKhach,
    nhanVien: nhanVien.map((n) => ({ gt: n.id, nhan: n.ten, anMa: true })),
    tuyChonLoc: tuyChonF(demo ? [...cotDb, ...TICKET_DEMO] : cotDb),
    tabRieng,
    quyenTabChung: viewChung,
  }
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string; state?: string; khan?: string; mine?: string; trang?: string
    cot?: string; chieu?: string; loai?: string; loi?: string; ngtu?: string; ngden?: string
    variant?: string; cu?: string
  } & Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const dev = process.env.NODE_ENV !== 'production'
  // Mặc định = danh sách F (dữ liệu thật). `?cu=1` = màn cũ (giữ tới khi CEO bỏ). `?variant=` = prototype, chỉ dev.
  if (sp.cu !== '1' && (!dev || !sp.variant || sp.variant === 'F')) {
    // Link cũ (màn khác: Tổng quan ?state=Open, /tim, Tần suất lỗi ?loi=…; tab cũ ?view=cua-toi|chua-giao|mo|hen-nay) → tab
    // F (CEO 26/11 còn 4 tab): khan=1 → Khẩn, state=Done|Cancel → Đã xong|Đã huỷ (áp bộ lọc của tab), còn lại → Tất cả.
    // Giữ q/loi/lọc khác. `khan` cũ = "1"; `khan` của F là trường lọc (co/khong) — không nhầm.
    const viewCu = mot(sp.view)
    const tabCu = ['cua-toi', 'chua-giao', 'mo', 'hen-nay'].includes(viewCu ?? '')
    if (sp.state || sp.khan === '1' || sp.mine || tabCu) {
      const giu = Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' && !['state', 'khan', 'mine', 'view'].includes(k) ? [[k, v]] : []))
      const tab = VIEW_F.find((x) => x.v === (sp.khan === '1' ? 'khan' : sp.state === 'Done' ? 'xong' : sp.state === 'Cancel' ? 'huy' : ''))
      const p = new URLSearchParams(tab ? queryTab(new URLSearchParams(giu), tab.loc, tab.v, ['tt', 'khan']) : new URLSearchParams(giu).toString())
      redirect(`/ticket?${p}`)
    }
    const du = await duLieuF(sp)
    return dev && sp.variant === 'F' ? (
      <TrangTicketPrototype variant="F" {...du} />
    ) : (
      <ManV2>
        <TicketF {...du} />
      </ManV2>
    )
  }
  const { q = '', state = '', khan = '', mine = '', trang: trangRaw, cot, chieu, loai = '', loi = '', ngtu, ngden, variant } = sp
  const onlyKhan = khan === '1'
  const isMine = mine === '1'
  const trang = Math.max(1, Number(trangRaw) || 1)
  const me = isMine ? await currentStaff() : null
  // Gõ nguyên hình dạng KetQuaTrang<Ticket> (kể cả `trang`) cho nhánh rỗng — thiếu field
  // không lộ lỗi build ngay bây giờ (chưa ai đọc `trang`) nhưng Task 4 destructure vào là vỡ.
  const [ketQua, loaiList, { data: dsLoi, loi: thieuDanhMuc }, quyen] = await Promise.all([
    (isMine && !me
      ? Promise.resolve<KetQuaTrang<Ticket>>({
          rows: [], tong: 0, trang: 1, soTrang: 1,
          // Phải khớp mặc định của searchTickets, nếu không nhánh rỗng sẽ khoe
          // sai cột đang sắp ở ChipSapXep.
          sapXep: { ...SAP_TICKET_MAC_DINH, macDinh: true },
        })
      : searchTickets(q, onlyKhan ? undefined : state || undefined, onlyKhan, me?.id, {
          trang, cot, chieu, ngtu, ngden, loaiTicket: loai || undefined, loiCode: loi || undefined,
        })),
    ticketTypes(),
    docAnToan('danhMucLoi', () => danhMucLoi(), []),
    hoiQuyen({
      hangLoat: ['cs.hang_loat.cap_nhat', 'QUANLY'],
      viewChung: ['he_thong.view_chung', 'QUANLY'],
      xuat: ['cs.bao_cao.xuat', 'QUANLY'],
    }),
  ])
  const views = await listBangView('tickets')
  const { rows: tickets, tong, soTrang, sapXep } = ketQua

  // PROTOTYPE vứt đi (25/11): ?variant=A–E, T → phương án DS v2 (app/ticket/_prototype), chỉ chạy dev. F ở nhánh trên.
  if (variant && ['A', 'B', 'C', 'D', 'E', 'T'].includes(variant) && dev) {
    // DB local gần như trống (< 5 ticket) → thêm ticket Demo trong bộ nhớ (lọc theo tab/từ khoá) sau ticket thật.
    const dbIt = tong < 5 && (await searchTickets('', undefined, false, undefined, { trang: 1, kemDongMay: false })).tong < 5
    const demo = dbIt ? [...tickets, ...locDemo({ state, khan, mine, q })] : null
    const rows = demo ?? tickets
    return (
      <TrangTicketPrototype
        variant={variant} rows={rows} tong={demo ? rows.length : tong} trang={trang}
        soTrang={demo ? 1 : soTrang}
        loaiList={demo ? [...new Set(TICKET_DEMO.map((t) => t.ticket_type!))] : loaiList} demo={!!demo}
        dsLoi={dsLoi.map((d) => ({ code: d.code, ten: d.ten }))}
      />
    )
  }

  const tabs = [
    { key: '', label: 'Tất cả' },
    { key: 'Open', label: 'Đang mở' },
    { key: 'Done', label: 'Đã xong' },
    { key: 'Cancel', label: 'Đã huỷ' },
  ]

  // Link bỏ RIÊNG một điều kiện, giữ nguyên điều kiện khác (kể cả cột/chiều đang sắp).
  // state/khan/mine là tab điều hướng riêng (không phải chip ở ThanhDangLoc) nên vẫn
  // giữ nguyên — bỏ "Từ khoá" hay "Loại lỗi" không có nghĩa là rời khỏi tab đang chọn.
  function hrefBoDieuKien(bo: 'q' | 'loai' | 'loi' | 'ngay') {
    const params = new URLSearchParams({ cu: '1' })
    if (q && bo !== 'q') params.set('q', q)
    if (state) params.set('state', state)
    if (khan) params.set('khan', khan)
    if (mine) params.set('mine', mine)
    if (loai && bo !== 'loai') params.set('loai', loai)
    if (loi && bo !== 'loi') params.set('loi', loi)
    if (ngtu && bo !== 'ngay') params.set('ngtu', ngtu)
    if (ngden && bo !== 'ngay') params.set('ngden', ngden)
    if (cot) params.set('cot', cot)
    if (chieu) params.set('chieu', chieu)
    return `/ticket?${params}`
  }

  const tenLoi = dsLoi.find((d) => d.code === loi)?.ten ?? loi
  const { tu: ngTuOk, den: ngDenOk } = docLocNgay({ ngtu, ngden })
  const moTaNgay = moTaLocNgay(ngTuOk, ngDenOk, 'Ngày tạo')

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        <DauTrang tieuDe="Ticket CSKH" phuDe={`${tong.toLocaleString('vi-VN')} ticket`}>
          <Link
            href="/tao-ticket"
            className="rounded-[9px] bg-[#b5642a] text-white px-4 py-2 text-sm font-medium hover:bg-[#8a4a1c]"
          >
            ＋ Tạo ticket
          </Link>
        </DauTrang>

        {thieuDanhMuc && <p className="text-sm bg-amber-50 text-amber-900 rounded-lg px-3 py-2">⚠️ {THIEU_DANH_MUC}</p>}

        <Suspense>
          <OTimKiem placeholder="Gõ mã ticket, serial, tên khách, SĐT hoặc nội dung lỗi…" />
        </Suspense>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={`/ticket?${new URLSearchParams({ cu: '1', ...(q && { q }), ...(t.key && { state: t.key }) })}`}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  !onlyKhan && !isMine && state === t.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600'
                }`}
              >
                {t.label}
              </Link>
            ))}
            <Link
              href={`/ticket?${new URLSearchParams({ cu: '1', ...(q && { q }), khan: '1' })}`}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                onlyKhan ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200'
              }`}
            >
              🔴 Khẩn
            </Link>
            <Link
              href={`/ticket?${new URLSearchParams({ cu: '1', ...(q && { q }), mine: '1' })}`}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                isMine ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600'
              }`}
            >
              Việc của tôi
            </Link>
            <Suspense>
              {/* Danh sách chọn sinh từ ticketTypes() — chỉ liệt kê loại ĐANG thực sự có
                  trong cột ticket_type, không hardcode. */}
              <BoLocChon param="loai" nhan="Loại ticket" tuyChon={loaiList.map((l) => ({ giaTri: l, nhan: l }))} />
            </Suspense>
            <Suspense>
              <BoLocGoiY param="loi" nhan="Loại lỗi" tuyChon={dsLoi.map((d) => ({ giaTri: d.code, nhan: d.ten }))} />
            </Suspense>
            <Suspense>
              <LocNgay nhan="Ngày tạo" />
            </Suspense>
          </div>
        </div>

        <ThanhDangLoc
          dieuKien={[
            ...(q ? [{ nhan: 'Từ khoá', giaTri: q, href: hrefBoDieuKien('q') }] : []),
            ...(loai ? [{ nhan: 'Loại ticket', giaTri: loai, href: hrefBoDieuKien('loai') }] : []),
            ...(loi ? [{ nhan: 'Loại lỗi', giaTri: tenLoi, href: hrefBoDieuKien('loi') }] : []),
            ...(moTaNgay ? [{ nhan: 'Ngày tạo', giaTri: moTaNgay.replace(/^Ngày tạo\s*[:=]?\s*/, ''), href: hrefBoDieuKien('ngay') }] : []),
          ]}
          hienThi={tickets.length}
          tong={tong}
          nhan="ticket"
          hrefXoaLoc="/ticket?cu=1"
          // Câu lệnh luôn .order('khan') TRƯỚC cột người dùng chọn -> phải nói ra,
          // không thì bấm "Ngày" thấy ticket cũ nằm trên ticket mới lại tưởng hỏng.
          sapXep={{ ...sapXep, ghiChu: 'Khẩn luôn lên đầu' }}
        />

        {/* Chỉ CHỌN dòng, chưa có hành động — chỗ cắm hành động ở children của
            <ThanhDaChon>, xem hướng dẫn trong components/ChonDong.tsx. */}
        <KhungChon
          khoaTrang={tickets.map((t) => t.ticket_code)}
          tong={tong}
          bat={quyen.hangLoat}
          thamSo={{ q, state, khan, mine, loai, loi, cot, chieu, ngtu, ngden }}
          layTatCaKhoa={khoaTatCaTicket}
        >
        {/* Tự làm mới ~20 giây/lần (router.refresh, giữ nguyên URL) — đặt trong KhungChon
            để tạm dừng khi đang chọn dòng. */}
        <TuLamMoi />
        <ThanhDaChon nhan="ticket" />
        <BangTicket rows={tickets} choViewChung={quyen.viewChung} views={views}
          boLoc={JSON.stringify([q, state, khan, mine, loai, loi, ngtu, ngden, trang, sapXep.cot, sapXep.tang])}
          congCu={quyen.xuat && <ExportTicketButton q={q} state={onlyKhan || isMine ? undefined : state || undefined} khan={onlyKhan} mine={isMine} ngtu={ngtu} ngden={ngden} loai={loai || undefined} loi={loi || undefined} />} />
        </KhungChon>

        <Suspense>
          <PhanTrang trang={trang} soTrang={soTrang} />
        </Suspense>
      </div>
    </main>
  )
}
