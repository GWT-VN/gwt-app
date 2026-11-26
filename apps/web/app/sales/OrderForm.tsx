'use client'

import { Checkbox, ChoiceLabel } from '@/components/ui/checkbox'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { FieldLabel } from '@/components/ui/field'
import { FormFooter, FormLayout } from '@/components/ui/form-layout'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { useEffect, useMemo, useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import { ChonTinh } from '@/components/ChonTinh'
import { taoDon, suaDon, timKhachChoDon, boiCanhGia } from './actions'
import { useTimXa } from '@/bang/useTimXa'
import { ChannelSelect } from './ChannelSelect'
import { fmtVnd } from './_ui'
import { deriveSourceTab } from './_calc'
import {
  type CatalogPick,
  type ChannelOpt,
  type NewOrderItem,
  type NewOrderInput,
  type OrderFormInitial,
  type CustomerHit,
  FULFILL_OPTS,
  PAYMENT_OPTS,
  PAYMETHOD_OPTS,
  VAT_OPTS,
  vatMacDinh,
  maVat,
} from './_types'
import { giaGoiY, tomTatChinhSach, type BoiCanhGia, type GiaGoiY } from './_ctkm'

/**
 * `giaTuGo` = người nhập đã TỰ gõ số vào ô đơn giá.
 *
 * Cờ này là ranh giới giữa "số của app" và "số của người". App được phép sửa lại số
 * của chính nó khi chính sách đổi (đổi khách, đổi kênh, đổi sản phẩm trên cùng dòng),
 * nhưng KHÔNG BAO GIỜ đè số người đã gõ tay — số nhảy dưới tay người nhập là mất tin cậy.
 */
type Line = NewOrderItem & { key: number; giaTuGo: boolean }

const emptyLine = (key: number): Line => ({
  key,
  giaTuGo: false,
  internal_code: '',
  product_name: '',
  category_l1: null,
  category_l2: null,
  quantity: 1,
  unit_price_vat: 0,
  is_gift: false,
  // Mặc định 8%: 320/328 mã là 8%, và Apps Script cũng mặc định vậy (defaultVatFor_).
  // Để trống là người nhập dễ quên -> tiền trước VAT tính sai. Chọn sản phẩm xong thì
  // VAT tự điền lại theo đúng mã (xem onPick của ProductPicker).
  vat_pct: 0.08,
  vat_loai: 'VAT' as const,
  note: null,
})

function todayISO(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}


/** Ô tìm sản phẩm: gõ theo tên / mã nội bộ / mã cũ / mã đối tác, hoặc bấm chọn. */
function ProductPicker({
  catalog,
  code,
  name,
  nhan,
  onPick,
}: {
  catalog: CatalogPick[]
  code: string
  name: string
  nhan: string
  onPick: (c: CatalogPick | null) => void
}) {
  const options = catalog.map((c) => ({
    gt: c.internal_code,
    nhan: `${c.name} · ${c.internal_code}`,
    phu: [c.ma_cu, c.ma_doitac].filter(Boolean).join(' · '),
    anMa: true,
  }))
  if (code && !options.some((m) => m.gt === code)) {
    options.push({ gt: code, nhan: name ? `${name} · ${code}` : code, phu: '', anMa: true })
  }

  return (
    <Combobox value={code || null} options={options} aria-label={nhan}
      placeholder="Chọn sản phẩm" searchPlaceholder="Gõ tên, mã nội bộ, mã cũ…"
      onValueChange={(ma) => {
        if (!ma) onPick(null)
        else {
          const c = catalog.find((m) => m.internal_code === ma)
          if (c) onPick(c)
        }
      }} />
  )
}

export function OrderForm({
  catalog,
  channels,
  mode = 'create',
  orderCode,
  initial,
}: {
  catalog: CatalogPick[]
  channels: ChannelOpt[]
  mode?: 'create' | 'edit'
  orderCode?: string
  initial?: OrderFormInitial
}) {
  const router = useRouter()
  const fieldId = useId()
  const isEdit = mode === 'edit'

  const initHasNewCust = !!initial && !initial.customer_code && !!(initial.customer_name || initial.phone)
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>(initHasNewCust ? 'new' : 'existing')
  const [custQuery, setCustQuery] = useState('')
  const [custSearchOpen, setCustSearchOpen] = useState(false)
  const { ds: custHits, dangTim: searching, loi: loiTimKhach, thieuKyTu } = useTimXa(timKhachChoDon, custSearchOpen ? custQuery : '')
  const [selectedCust, setSelectedCust] = useState<CustomerHit | null>(
    initial?.customer_code
      ? { customer_code: initial.customer_code, name: initial.customer_name, phone: initial.phone, phone_chuan: initial.phone, province: null, province_moi: null }
      : null
  )
  const [newName, setNewName] = useState(initHasNewCust ? initial!.customer_name ?? '' : '')
  const [newPhone, setNewPhone] = useState(initHasNewCust ? initial!.phone ?? '' : '')

  const [address, setAddress] = useState(initial?.address ?? '')
  const [province, setProvince] = useState(initial?.province ?? '')
  const [orderDate, setOrderDate] = useState(initial?.order_date || todayISO())
  const [channelId, setChannelId] = useState(initial?.channel_id ? String(initial.channel_id) : '')
  const [partnerCode, setPartnerCode] = useState(initial?.partner_order_code ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'Mới')
  const [payment, setPayment] = useState(initial?.payment_status ?? 'Chờ cọc')
  const [payMethod, setPayMethod] = useState(initial?.payment_method ?? '')
  const [shippingCode, setShippingCode] = useState(initial?.shipping_code ?? '')
  const [installDate, setInstallDate] = useState(initial?.install_date ?? '')
  const [note, setNote] = useState(initial?.note ?? '')

  // ── Ô Sheet bổ sung 22/08 ────────────────────────────────────────────────
  const [chiTietKenh, setChiTietKenh] = useState(initial?.channel_detail ?? '')
  const [quaTang, setQuaTang] = useState(initial?.qua_tang ?? '')
  const [dungQuaTang, setDungQuaTang] = useState(initial?.su_dung_qua_tang ?? '')
  const [linkTracking, setLinkTracking] = useState(initial?.tracking_url ?? '')
  const [kichHoatBH, setKichHoatBH] = useState(!!initial?.kich_hoat_bh)
  const [emailDon, setEmailDon] = useState(initial?.email ?? '')
  const [tienCoc, setTienCoc] = useState(initial?.tien_coc != null ? String(initial.tien_coc) : '')
  // POU
  const [guiHdsd, setGuiHdsd] = useState(!!initial?.gui_hdsd)
  const [xuatHD, setXuatHD] = useState(!!initial?.xuat_hoa_don)
  const [doiSoat, setDoiSoat] = useState(!!initial?.da_doi_soat)
  const [ngayDoiSoat, setNgayDoiSoat] = useState(initial?.ngay_doi_soat ?? '')
  // POE
  const [soHD, setSoHD] = useState(initial?.so_hd ?? '')
  const [tenGoi, setTenGoi] = useState(initial?.ten_goi_khach ?? '')
  const [tenFolder, setTenFolder] = useState(initial?.ten_folder ?? '')
  const [tenTheoDoi, setTenTheoDoi] = useState(initial?.ten_khach_theo_doi ?? '')
  const [tienSeThu, setTienSeThu] = useState(initial?.tien_se_thu != null ? String(initial.tien_se_thu) : '')
  const [bienBan, setBienBan] = useState(!!initial?.bien_ban_xac_nhan)
  const [baoCaoLap, setBaoCaoLap] = useState(!!initial?.bao_cao_lap_dat)
  const [tienDoLap, setTienDoLap] = useState(initial?.tien_do_lap_dat ?? '')
  const [ngayXongLap, setNgayXongLap] = useState(initial?.ngay_hoan_thanh_lap ?? '')
  const [tuDien, setTuDien] = useState(initial?.tu_dien ?? '')
  const [phienBan, setPhienBan] = useState(initial?.version ?? '')
  const [ngheNghiep, setNgheNghiep] = useState(initial?.nghe_nghiep ?? '')
  const [ngaySinhKH, setNgaySinhKH] = useState(initial?.ngay_sinh ?? '')
  const [gioiTinh, setGioiTinh] = useState(initial?.gioi_tinh ?? '')
  const [doTuoi, setDoTuoi] = useState(initial?.do_tuoi ?? '')
  const [loaiNha, setLoaiNha] = useState(initial?.loai_nha ?? '')
  const [tinhTrangNha, setTinhTrangNha] = useState(initial?.tinh_trang_nha ?? '')
  const [ctyXuatHD, setCtyXuatHD] = useState(initial?.cong_ty_xuat_hd ?? '')
  const [mstXuatHD, setMstXuatHD] = useState(initial?.mst ?? '')
  const [dcXuatHD, setDcXuatHD] = useState(initial?.dia_chi_xuat_hd ?? '')
  const [moPOE, setMoPOE] = useState(false)

  // Đơn cũ mở ra sửa: mọi giá đã lưu đều tính là NGƯỜI gõ. Nếu không, mở lại một đơn
  // tháng trước là app lặng lẽ viết đè giá khuyến mãi HÔM NAY lên — đơn đã chốt bị đổi số.
  const [lines, setLines] = useState<Line[]>(
    initial?.items?.length
      ? initial.items.map((it, i) => ({ ...it, ...vatMacDinh(it.vat_pct, it.vat_loai), key: i + 1, giaTuGo: true }))
      : [emptyLine(1)]
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── GIÁ TỰ BẮT ───────────────────────────────────────────────────────────
  // CEO chốt: khách có bậc/kênh thì lên đơn tự ăn đúng chính sách đang áp.
  // Gợi ý thôi — người nhập vẫn gõ đè được, chỉ bị nhắc khi bán dưới mức đã duyệt.
  const custCode = customerMode === 'existing' ? selectedCust?.customer_code ?? null : null
  const kenhSo = channelId ? Number(channelId) : null
  /** Khoá của lần tra hiện tại. Đổi khách/kênh/ngày là đổi khoá. */
  const khoaGia = `${custCode ?? ''}|${kenhSo ?? ''}|${orderDate}`

  // Lưu KÈM khoá rồi so lúc đọc, thay vì xoá state ngay trong effect: kết quả về muộn
  // của lần tra cũ tự bị bỏ qua vì khoá không khớp, và effect không phải gọi setState
  // đồng bộ (thứ đẻ ra render dây chuyền).
  const [bcRaw, setBcRaw] = useState<{ khoa: string; bc: BoiCanhGia } | null>(null)
  useEffect(() => {
    if (!custCode && kenhSo == null) return
    let huy = false
    boiCanhGia(custCode, kenhSo, orderDate).then((bc) => { if (!huy) setBcRaw({ khoa: khoaGia, bc }) })
    return () => { huy = true }
  }, [khoaGia, custCode, kenhSo, orderDate])
  const bcGia = bcRaw?.khoa === khoaGia ? bcRaw.bc : null

  /**
   * Giá gợi ý cho từng dòng — DẪN XUẤT, không giữ trong state.
   *
   * Giữ bằng state là phải có effect đồng bộ lại mỗi khi đổi khách/kênh/ngày, và
   * effect đó gọi setState trong lúc render (React cảnh báo đúng). Tính thẳng từ
   * `lines + bcGia + orderDate` thì không bao giờ lệch pha.
   *
   * Đổi khách giữa chừng KHÔNG tự sửa đơn giá đang có — đơn soạn dở mà số nhảy dưới
   * tay người nhập là mất tin tưởng. Chỉ đổi nhãn, kèm nút để họ tự áp lại.
   */
  const goiY = useMemo<Record<number, GiaGoiY>>(() => {
    if (!bcGia) return {}
    const m: Record<number, GiaGoiY> = {}
    for (const l of lines) if (l.internal_code) m[l.key] = giaGoiY(bcGia, l.internal_code, orderDate)
    return m
  }, [bcGia, lines, orderDate])

  /**
   * Đổ giá gợi ý xuống ô Đơn giá — CEO bắt lỗi 24/08: "sao không hiển thị luôn giá
   * khuyến mãi vào đơn giá".
   *
   * Bản cũ chỉ điền tại ĐÚNG MỘT khoảnh khắc: lúc bấm chọn sản phẩm, và chỉ khi ô đang
   * trống. Ba ca thường gặp đều trượt:
   *   · chọn sản phẩm TRƯỚC rồi mới chọn khách — lúc chọn sản phẩm chưa có bối cảnh giá;
   *   · chọn khách xong bấm sản phẩm ngay — lượt tra bối cảnh còn đang bay, `bcGia` = null;
   *   · đổi sang sản phẩm khác trên cùng dòng — ô đã có số nên bị bỏ qua, giữ giá máy cũ.
   *
   * Nay điền lại mỗi khi gợi ý đổi, nhưng CHỈ trên dòng người nhập chưa tự gõ giá
   * (`giaTuGo`). Không dùng state trung gian: `goiY` đã là dẫn xuất, so số rồi mới ghi nên
   * lượt sau không còn gì để đổi -> dừng, không lặp vô hạn.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cố ý (xem chú thích trên): điền lại giá theo gợi ý, so số rồi mới ghi nên không lặp
    setLines((ls) => {
      let doi = false
      const moi = ls.map((l) => {
        if (l.giaTuGo || l.is_gift || !l.internal_code) return l
        const g = goiY[l.key]
        if (!g || g.gia == null || Number(l.unit_price_vat) === g.gia) return l
        doi = true
        return { ...l, unit_price_vat: g.gia }
      })
      return doi ? moi : ls
    })
  }, [goiY])

  /**
   * Quà của các chương trình đang áp — gom từ mọi dòng hàng, gộp trùng.
   *
   * Vì sao gom ở ĐÂY chứ không hiện dưới từng dòng: hai dòng cùng ăn một chương trình
   * thì quà của chương trình đó KHÔNG nhân đôi. Gộp theo (chương trình + mã quà) rồi
   * mới hiện, để nhân viên nhìn ra đúng số món phải giao.
   */
  const quaCtkm = useMemo(() => {
    const m = new Map<string, { ctkmId: string; ma: string; ten: string; soLuong: number; dieuKien: string | null; giaTri: number | null }>()
    for (const l of lines) {
      const g = goiY[l.key]
      if (!g || l.is_gift) continue
      for (const q of g.qua) {
        const ctkmId = q.ctkmId ?? ''
        const khoa = `${ctkmId}|${q.internal_code_qua}`
        if (m.has(khoa)) continue
        m.set(khoa, {
          ctkmId,
          ma: q.internal_code_qua,
          ten: catalog.find((c) => c.internal_code === q.internal_code_qua)?.name ?? q.internal_code_qua,
          soLuong: q.so_luong,
          dieuKien: q.dieu_kien,
          giaTri: q.gia_tri_quy_doi,
        })
      }
    }
    return [...m.values()]
  }, [lines, goiY, catalog])

  const chip = useMemo(() => tomTatChinhSach(bcGia), [bcGia])

  /** Mã quà đã có sẵn trên đơn — để không mời thêm lần hai. */
  const quaDaThem = new Set(lines.filter((l) => l.is_gift).map((l) => l.internal_code))

  function themQua(q: { ctkmId: string; ma: string; ten: string; soLuong: number }) {
    const c = catalog.find((x) => x.internal_code === q.ma)
    setLines((ls) => [
      ...ls,
      {
        ...emptyLine(Math.max(0, ...ls.map((l) => l.key)) + 1),
        internal_code: q.ma,
        product_name: c?.name ?? q.ma,
        category_l1: c?.category_l1 ?? null,
        category_l2: c?.category_l2 ?? null,
        quantity: q.soLuong,
        // Dòng quà tính 0 đ — `is_gift` đã lo phần tiền, đây chỉ để ô không hiện số lạ.
        unit_price_vat: 0,
        is_gift: true,
        ...vatMacDinh(c?.vat_pct, c?.vat_loai),
        giaTuGo: true,
        ctkm_id: q.ctkmId || null,
      },
    ])
  }

  const setLine = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  const addLine = () => setLines((ls) => [...ls, emptyLine(Math.max(0, ...ls.map((l) => l.key)) + 1)])
  /**
   * Bấm ✕ luôn phải có tác dụng nhìn thấy được.
   *
   * Bản cũ `ls.length > 1 ? filter : ls` — còn đúng một dòng thì bấm ✕ KHÔNG LÀM GÌ,
   * người dùng tưởng nút hỏng (CEO bắt được 24/08). Đơn vẫn phải có ít nhất một dòng,
   * nên dòng cuối thì XOÁ TRẮNG tại chỗ thay vì bỏ đi. Cấp key mới để ô tìm sản phẩm
   * (giữ chữ đang gõ trong state riêng của nó) cũng được dựng lại sạch.
   */
  const removeLine = (key: number) =>
    setLines((ls) =>
      ls.length > 1 ? ls.filter((l) => l.key !== key) : [emptyLine(Math.max(0, ...ls.map((l) => l.key)) + 1)]
    )

  const total = lines.reduce((s, l) => s + (l.is_gift ? 0 : (Number(l.quantity) || 0) * (Number(l.unit_price_vat) || 0)), 0)

  // Loại đơn suy từ SẢN PHẨM, đúng cách Apps Script cắt tab — không bắt người nhập chọn tay.
  const loaiDon = deriveSourceTab(lines)
  const laPOE = loaiDon === 'DON_POE'
  const laPOU = loaiDon === 'DON_POU'
  // Đơn lõi/muối/dịch vụ cũng bán qua Viettelpost và cũng thu COD -> cũng phải đối soát
  // y như POU (Sheet chốt 29/07/2025, EXTRA.O có 'Đã đối soát' + 'Ngày nhận đối soát').
  const coDoiSoat = laPOU || loaiDon === 'DON_OTHERS'
  const conCanThu = total - (tienCoc === '' ? 0 : Number(tienCoc) || 0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const input: NewOrderInput = {
      customer_code: customerMode === 'existing' ? selectedCust?.customer_code ?? null : null,
      phone: customerMode === 'existing' ? selectedCust?.phone_chuan ?? selectedCust?.phone ?? null : newPhone.trim() || null,
      customer_name: customerMode === 'existing' ? selectedCust?.name ?? null : newName.trim() || null,
      address: address.trim() || null,
      province: province.trim() || null,
      order_date: orderDate,
      channel_id: channelId ? Number(channelId) : null,
      partner_order_code: partnerCode.trim() || null,
      status: status || null,
      payment_status: payment || null,
      payment_method: payMethod || null,
      shipping_code: shippingCode.trim() || null,
      install_date: installDate || null,
      channel_detail: chiTietKenh.trim() || null,
      qua_tang: quaTang.trim() || null,
      su_dung_qua_tang: dungQuaTang.trim() || null,
      tracking_url: linkTracking.trim() || null,
      kich_hoat_bh: kichHoatBH,
      email: emailDon.trim() || null,
      tien_coc: tienCoc === '' ? null : Number(tienCoc),
      gui_hdsd: guiHdsd,
      xuat_hoa_don: xuatHD,
      da_doi_soat: doiSoat,
      ngay_doi_soat: ngayDoiSoat || null,
      so_hd: soHD.trim() || null,
      ten_goi_khach: tenGoi.trim() || null,
      ten_folder: tenFolder.trim() || null,
      ten_khach_theo_doi: tenTheoDoi.trim() || null,
      tien_se_thu: tienSeThu === '' ? null : Number(tienSeThu),
      bien_ban_xac_nhan: bienBan,
      bao_cao_lap_dat: baoCaoLap,
      tien_do_lap_dat: tienDoLap.trim() || null,
      ngay_hoan_thanh_lap: ngayXongLap || null,
      tu_dien: tuDien.trim() || null,
      version: phienBan.trim() || null,
      nghe_nghiep: ngheNghiep.trim() || null,
      ngay_sinh: ngaySinhKH || null,
      gioi_tinh: gioiTinh || null,
      do_tuoi: doTuoi.trim() || null,
      loai_nha: loaiNha.trim() || null,
      tinh_trang_nha: tinhTrangNha.trim() || null,
      cong_ty_xuat_hd: ctyXuatHD.trim() || null,
      mst: mstXuatHD.trim() || null,
      dia_chi_xuat_hd: dcXuatHD.trim() || null,
      note: note.trim() || null,
      items: lines.map((l) => ({
        internal_code: l.internal_code,
        product_name: l.product_name,
        category_l1: l.category_l1,
        category_l2: l.category_l2,
        quantity: Number(l.quantity) || 0,
        unit_price_vat: Number(l.unit_price_vat) || 0,
        is_gift: l.is_gift,
        vat_pct: l.vat_pct == null || (l.vat_pct as unknown as string) === '' ? null : Number(l.vat_pct),
        vat_loai: l.vat_loai ?? null,
        note: l.note?.trim() || null,
        ctkm_id: l.ctkm_id ?? null,
      })),
    }
    try {
      const res = isEdit && orderCode ? await suaDon(orderCode, input) : await taoDon(input)
      if (res.ok) {
        router.push(`/sales/don/${encodeURIComponent(res.order_code)}`)
        router.refresh()
        return
      }
      setError(res.error)
    } catch {
      setError('Chưa rõ kết quả lưu. Kiểm tra danh sách đơn trước khi thử lại.')
    }
    setSubmitting(false)
  }

  return (
    <FormLayout onSubmit={submit} noValidate={false} className="@container/order">
      <div className="grid min-w-0 items-start gap-6 @min-[60rem]:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 space-y-6">
          {/* Khách hàng */}
          <Card>
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-sm font-semibold text-foreground">Khách hàng</span>
              <div className="flex gap-1 text-sm">
                {(['existing', 'new'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCustomerMode(m)}
                    aria-pressed={customerMode === m}
                    className={'rounded-md px-3 py-1 ' + (customerMode === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent')}
                  >
                    {m === 'existing' ? 'Khách cũ' : 'Khách mới'}
                  </button>
                ))}
              </div>
            </div>

            {customerMode === 'existing' ? (
              selectedCust ? (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-(--color-border-success-surface) bg-(--color-background-success-surface) px-3 py-2 text-sm text-foreground">
                  <span>
                    <b>{selectedCust.name || '(chưa tên)'}</b> · {selectedCust.phone_chuan || selectedCust.phone} ·{' '}
                    <span className="font-mono text-xs text-muted-foreground">{selectedCust.customer_code}</span>
                  </span>
                  <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setSelectedCust(null)}>Đổi</button>
                </div>
              ) : (
                <div className="relative" onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setCustSearchOpen(false)
                }} onKeyDown={(e) => {
                  if (e.key === 'Escape') setCustSearchOpen(false)
                }}>
                  <Input aria-label="Tìm khách hàng" placeholder="Tìm khách theo tên / SĐT / mã KH…" value={custQuery}
                    onFocus={() => setCustSearchOpen(true)}
                    onChange={(e) => { setCustQuery(e.target.value); setCustSearchOpen(true) }} />
                  {custSearchOpen && !thieuKyTu && (
                    <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                      {searching && <div className="px-3 py-2 text-sm text-muted-foreground">Đang tìm…</div>}
                      {!searching && !loiTimKhach && custHits.map((h) => (
                        <button key={h.customer_code} type="button" onClick={() => { setSelectedCust(h); setCustSearchOpen(false); setCustQuery('') }} className="block w-full px-3 py-2 text-left text-sm hover:bg-muted">
                          <b>{h.name || '(chưa tên)'}</b>{' '}
                          <span className="text-muted-foreground">· {h.phone_chuan || h.phone || '—'} · {h.province_moi || h.province || ''}</span>
                          <span className="ml-1 font-mono text-xs text-muted-foreground">{h.customer_code}</span>
                        </button>
                      ))}
                      {!searching && (loiTimKhach || custHits.length === 0) && (
                        <div role="status" className="px-3 py-2 text-sm text-muted-foreground">
                          {loiTimKhach ? 'Chưa tìm được khách. Hãy thử lại.' : 'Không tìm thấy khách phù hợp.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div><FieldLabel htmlFor={fieldId + '-newName'} className="mb-1">Tên khách</FieldLabel><Input id={fieldId + '-newName'} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nguyễn Văn A" /></div>
                <div><FieldLabel htmlFor={fieldId + '-newPhone'} className="mb-1">SĐT</FieldLabel><Input id={fieldId + '-newPhone'} value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="09xxxxxxxx" inputMode="tel" /></div>
                <p className="text-xs text-muted-foreground sm:col-span-2">Khách mới nhập tại đây sẽ nối theo SĐT; muốn cấp mã KA thì tạo ở trang Khách hàng.</p>
              </div>
            )}
          </Card>

          {/* Sản phẩm */}
          <Card className="@container">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Sản phẩm</span>
              <Button variant="outline" size="sm" onClick={addLine}>＋ Thêm dòng</Button>
            </div>
            {/* Hàng tiêu đề: các ô số bên phải rất hẹp, không có nhãn thì không đoán được ô nào là gì. */}
            <div aria-hidden="true" className="mb-1 hidden grid-cols-12 gap-2 px-2 text-xs text-muted-foreground @min-[42rem]:grid">
              <span className="col-span-4">Sản phẩm</span>
              <span className="col-span-2 text-right">Số lượng</span>
              <span className="col-span-2 text-right">Đơn giá (gồm VAT)</span>
              <span className="col-span-2 text-right">VAT</span>
              <span className="col-span-1 text-center">Quà</span>
              <span className="col-span-1" />
            </div>

            {/* Nói RÕ khách này đang ăn chính sách nào — không để app lặng lẽ điền số.
                Danh sách chip do `tomTatChinhSach()` dựng; ở đây KHÔNG có điều kiện nào ngoài
                "rỗng thì thôi". Bản cũ gài điều kiện vào JSX (`bcGia.bac || bcGia.ctkm`) và
                ẩn sạch cả dải khi mọi chương trình đều cộng dồn — CEO gặp 24/08. */}
            {chip.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg bg-(--color-background-info-surface) px-3 py-2 text-sm text-(--color-text-info)">
                <span className="font-semibold">Đang áp:</span>
                {chip.map((c, i) => (
                  <span
                    key={`${c.kieu}-${c.nhan}-${i}`}
                    className={
                      'rounded-full px-2 py-0.5 text-xs font-semibold text-white ' +
                      (c.kieu === 'cong' ? 'bg-emerald-600' : 'bg-teal-600')
                    }
                    title={c.kieu === 'cong' ? 'Chương trình cộng dồn — áp chồng lên chương trình chính' : undefined}
                  >
                    {c.kieu === 'cong' ? '+ ' : ''}{c.nhan}
                  </span>
                ))}
                {bcGia?.bac && bcGia.ctkm && (
                  <span className="text-xs text-(--color-text-info)">
                    (đại lý ăn giá bậc, <b>không</b> cộng thêm khuyến mãi bán lẻ)
                  </span>
                )}
                {(bcGia?.soCtkmKhac ?? 0) > 0 && (
                  <span className="text-xs text-(--color-text-info)">
                    · còn {bcGia!.soCtkmKhac} chương trình khác cũng khớp, app lấy cái giảm sâu nhất
                  </span>
                )}
              </div>
            )}
            <div className="space-y-2">
              {lines.map((l, index) => (
                <div key={l.key} className="rounded-lg border border-border bg-muted p-2">
                  <div className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-12 @min-[42rem]:col-span-4">
                      <span className="mb-1 block text-xs text-muted-foreground @min-[42rem]:hidden">Sản phẩm {index + 1}</span>
                      <ProductPicker
                        nhan={`Sản phẩm dòng ${index + 1}`}
                        catalog={catalog}
                        code={l.internal_code}
                        name={l.product_name}
                        onPick={(c) =>
                          setLine(l.key, {
                            internal_code: c?.internal_code ?? '',
                            product_name: c?.name ?? '',
                            category_l1: c?.category_l1 ?? null,
                            category_l2: c?.category_l2 ?? null,
                            // VAT tự điền theo mã nội bộ (CEO chốt 21/08); mã chưa xếp loại VAT → 8% (đổi
                            // 05/11/2026), người nhập vẫn chọn lại được ở ô VAT.
                            ...vatMacDinh(c?.vat_pct, c?.vat_loai),
                            // Đổi MÃ là đổi cả bảng giá -> trả ô đơn giá về cho app điền lại.
                            // Số cũ là giá của mã CŨ, giữ lại chỉ để lẫn sang mã mới.
                            giaTuGo: false,
                            unit_price_vat: 0,
                          })
                        }
                      />
                    </div>
                    <label className="col-span-6 @min-[42rem]:col-span-2">
                      <span className="mb-1 block text-xs text-muted-foreground @min-[42rem]:sr-only">Số lượng</span>
                      <Input type="number" min={0} className="text-right tabular-nums" value={l.quantity}
                        onChange={(e) => setLine(l.key, { quantity: Number(e.target.value) })} />
                    </label>
                    <label className="col-span-6 @min-[42rem]:col-span-2">
                      <span className="mb-1 block text-xs text-muted-foreground @min-[42rem]:sr-only">Đơn giá (gồm VAT)</span>
                      <Input type="number" min={0} step="any" className="text-right tabular-nums" value={l.unit_price_vat}
                        onChange={(e) => setLine(l.key, { unit_price_vat: Number(e.target.value), giaTuGo: true })} disabled={l.is_gift} />
                    </label>
                    <label className="col-span-6 @min-[42rem]:col-span-2">
                      <span className="mb-1 block text-xs text-muted-foreground @min-[42rem]:sr-only">VAT</span>
                      <NativeSelect
                        value={maVat(l.vat_pct, l.vat_loai)}
                        onChange={(e) => {
                          const v = VAT_OPTS.find((x) => x.ma === e.target.value)
                          setLine(l.key, { vat_pct: v?.pct ?? null, vat_loai: v?.loai ?? null })
                        }}
                        title="Thuế suất VAT — KCT: không chịu thuế (muối) · KAD: không áp dụng (bình gas)"
                      >
                        {VAT_OPTS.map((v) => (
                          <NativeSelectOption key={v.ma} value={v.ma}>{v.nhan}</NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </label>
                    <ChoiceLabel className="col-span-4 flex items-center justify-center gap-1 self-end pb-2 text-xs text-muted-foreground @min-[42rem]:col-span-1 @min-[42rem]:self-center @min-[42rem]:pb-0" nhan="Quà" title="Hàng tặng"><Checkbox checked={l.is_gift} onCheckedChange={(checked) => setLine(l.key, { is_gift: checked === true })} /></ChoiceLabel>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeLine(l.key)}
                      className="col-span-2 justify-self-end self-end @min-[42rem]:col-span-1 @min-[42rem]:self-center" aria-label={`Xoá dòng ${index + 1}`}>✕</Button>
                    <LineGiaNhan
                      g={goiY[l.key]}
                      daGo={Number(l.unit_price_vat) || 0}
                      laQua={l.is_gift}
                      onApLai={(v) => setLine(l.key, { unit_price_vat: v, giaTuGo: false })}
                      tuDien={!l.giaTuGo}
                    />
                  </div>
                  <Input aria-label={`Ghi chú dòng ${index + 1}`} className="mt-1.5 text-xs" value={l.note ?? ''} onChange={(e) => setLine(l.key, { note: e.target.value })} placeholder="Ghi chú dòng (tuỳ chọn)…" />
                </div>
              ))}
            </div>
            {/* Quà theo chương trình — KHÔNG tự thêm vào đơn.
                Quà là hàng phải xuất kho thật; app tự đẻ dòng hàng mà nhân viên không để ý
                là kho giao thừa. Hiện ra và để họ bấm, kèm điều kiện nhận để họ đọc trước. */}
            {quaCtkm.length > 0 && (
              <div className="mt-3 rounded-lg border border-(--color-border-success-surface) bg-(--color-background-success-surface) p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--color-text-success)">
                  🎁 Quà theo chương trình đang áp
                </div>
                <div className="space-y-1.5">
                  {quaCtkm.map((q) => (
                    <div key={`${q.ctkmId}|${q.ma}`} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">{q.ten}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{q.ma}</span>
                      <span className="text-muted-foreground">× {q.soLuong}</span>
                      {q.dieuKien && <span className="text-xs text-(--color-text-warning)">· điều kiện: {q.dieuKien}</span>}
                      <span className="flex-1" />
                      {quaDaThem.has(q.ma) ? (
                        <span className="text-xs text-(--color-text-success)">✓ đã có trong đơn</span>
                      ) : (
                        <button type="button" onClick={() => themQua(q)}
                          className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                          ＋ Thêm vào đơn
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-(--color-text-success)">
                  Thêm vào đơn = một dòng hàng tick <b>Quà</b>, tính <b>0 đ</b>. App không tự thêm —
                  quà phải xuất kho thật nên để anh chị bấm.
                </p>
              </div>
            )}

            <p className="mt-2 text-xs text-muted-foreground"><b>DVBT</b> = mã bảo trì, SL = số lần. Nguồn đơn tự suy từ danh mục. Tick “Quà” → dòng tính 0 đ.</p>
            <div className="mt-3 flex justify-between gap-2 border-t border-border pt-3 text-sm @min-[60rem]/order:hidden">
              <span className="text-muted-foreground">Tổng (gồm VAT)</span>
              <span className="font-semibold tabular-nums">{fmtVnd(total)}</span>
            </div>
          </Card>

          {/* Giao & thanh toán */}
          <Card>
            <div className="mb-3 text-sm font-semibold text-foreground">Giao hàng & thanh toán</div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div><FieldLabel htmlFor={fieldId + '-orderDate'} className="mb-1">Ngày đơn</FieldLabel><Input id={fieldId + '-orderDate'} type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required /></div>
              <div><FieldLabel htmlFor={fieldId + '-channelId'} className="mb-1">Kênh</FieldLabel>
                <ChannelSelect id={fieldId + '-channelId'} value={channelId} onChange={setChannelId} emptyLabel="Chọn kênh…"
                  options={channels.map((channel) => ({
                    gt: String(channel.id), nhan: [channel.channel_l1, channel.channel_l2].filter(Boolean).join(' · '), anMa: true,
                  }))}
                />
              </div>
              <div><FieldLabel htmlFor={fieldId + '-chiTietKenh'} className="mb-1">Chi tiết kênh</FieldLabel><Input id={fieldId + '-chiTietKenh'} value={chiTietKenh} onChange={(e) => setChiTietKenh(e.target.value)} placeholder="Tên shop / người giới thiệu…" /></div>
              <div><FieldLabel htmlFor={fieldId + '-partnerCode'} className="mb-1">Mã đơn đối tác</FieldLabel><Input id={fieldId + '-partnerCode'} value={partnerCode} onChange={(e) => setPartnerCode(e.target.value)} placeholder="Shopee / HĐ…" /></div>
              <div><FieldLabel htmlFor={fieldId + '-installDate'} className="mb-1">Ngày lắp đặt</FieldLabel><Input id={fieldId + '-installDate'} type="date" value={installDate} onChange={(e) => setInstallDate(e.target.value)} /></div>
              <div><FieldLabel htmlFor={fieldId + '-status'} className="mb-1">Tình trạng hàng</FieldLabel><NativeSelect id={fieldId + '-status'} value={status} onChange={(e) => setStatus(e.target.value)}>{FULFILL_OPTS.map((o) => <NativeSelectOption key={o} value={o}>{o}</NativeSelectOption>)}</NativeSelect></div>
              <div><FieldLabel htmlFor={fieldId + '-payment'} className="mb-1">Thanh toán</FieldLabel><NativeSelect id={fieldId + '-payment'} value={payment} onChange={(e) => setPayment(e.target.value)}>{PAYMENT_OPTS.map((o) => <NativeSelectOption key={o} value={o}>{o}</NativeSelectOption>)}</NativeSelect></div>
              <div><FieldLabel htmlFor={fieldId + '-payMethod'} className="mb-1">Hình thức TT</FieldLabel><NativeSelect id={fieldId + '-payMethod'} value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>{PAYMETHOD_OPTS.map((o) => <NativeSelectOption key={o} value={o}>{o || '— chọn —'}</NativeSelectOption>)}</NativeSelect></div>
              <div><FieldLabel htmlFor={fieldId + '-shippingCode'} className="mb-1">Mã vận đơn</FieldLabel><Input id={fieldId + '-shippingCode'} value={shippingCode} onChange={(e) => setShippingCode(e.target.value)} /></div>
              <div className="sm:col-span-2"><FieldLabel htmlFor={fieldId + '-linkTracking'} className="mb-1">Link tracking</FieldLabel><Input id={fieldId + '-linkTracking'} value={linkTracking} onChange={(e) => setLinkTracking(e.target.value)} placeholder="https://…" /></div>
              <div><FieldLabel htmlFor={fieldId + '-tienCoc'} className="mb-1">Số tiền đã cọc</FieldLabel>
                <Input id={fieldId + '-tienCoc'} type="number" min={0} step="any" className="text-right tabular-nums" value={tienCoc} onChange={(e) => setTienCoc(e.target.value)} />
              </div>
              <div className="sm:col-span-1"><FieldLabel className="mb-1">Tỉnh / TP</FieldLabel>
                <ChonTinh value={province} onChange={setProvince} />
              </div>
              <div className="sm:col-span-3"><FieldLabel htmlFor={fieldId + '-address'} className="mb-1">Địa chỉ giao</FieldLabel><Input id={fieldId + '-address'} value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            </div>
            <div className="mt-3"><FieldLabel htmlFor={fieldId + '-note'} className="mb-1">Ghi chú đơn</FieldLabel><Textarea id={fieldId + '-note'} rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          </Card>


          {/* QUÀ TẶNG — Sheet để 2 ô CHỮ TỰ DO cho cả POE lẫn POU (chốt 27/07/2025, bỏ cách
              tách từng cột "Lõi PCF / Lõi NF / Bình gas" đánh 0/2). Giữ đúng như vậy: nhân viên
              ghi kiểu liệt kê, ép thành ô chọn là mất những ca ngoài danh sách. */}
          {(laPOE || laPOU) && (
            <Card>
              <div className="mb-3 text-sm font-semibold text-foreground">Quà tặng</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor={fieldId + '-quaTang'} className="mb-1">Quà tặng đi kèm</FieldLabel>
                  <Textarea id={fieldId + '-quaTang'} rows={2} value={quaTang} onChange={(e) => setQuaTang(e.target.value)}
                    placeholder="02 lõi PCF / 01 lõi NF / 01 bình gas" />
                </div>
                <div>
                  <FieldLabel htmlFor={fieldId + '-dungQuaTang'} className="mb-1">Sử dụng quà tặng</FieldLabel>
                  <Textarea id={fieldId + '-dungQuaTang'} rows={2} value={dungQuaTang} onChange={(e) => setDungQuaTang(e.target.value)}
                    placeholder="01 lõi PCF (27/6/2025)" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Ghi kiểu liệt kê như trong Sheet. Hàng tặng có mã và có tính vào đơn thì tick
                <b> Quà</b> ở dòng hàng bên trên, đừng ghi vào đây.
              </p>
            </Card>
          )}

          {/* POU — theo dõi sau bán: bảo hành, hướng dẫn sử dụng, hoá đơn, đối soát. */}
          {coDoiSoat && (
            <Card>
              <div className="mb-3 text-sm font-semibold text-foreground">
                {laPOU ? 'Theo dõi sau bán (POU)' : 'Đối soát'}
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {laPOU && (
                  <div className="sm:col-span-2"><FieldLabel htmlFor={fieldId + '-emailDon'} className="mb-1">Email khách</FieldLabel>
                    <Input id={fieldId + '-emailDon'} type="email" value={emailDon} onChange={(e) => setEmailDon(e.target.value)} /></div>
                )}
                <div><FieldLabel htmlFor={fieldId + '-ngayDoiSoat'} className="mb-1">Ngày nhận đối soát</FieldLabel>
                  <Input id={fieldId + '-ngayDoiSoat'} type="date" value={ngayDoiSoat} onChange={(e) => setNgayDoiSoat(e.target.value)} /></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                <OTick nhan="Đã đối soát" giaTri={doiSoat} doi={setDoiSoat} />
                {laPOU && <>
                  <OTick nhan="Kích hoạt bảo hành" giaTri={kichHoatBH} doi={setKichHoatBH}
                    chuThich="Hồ sơ bảo hành nằm bên CSKH — đây chỉ là cờ đánh dấu trên đơn" />
                  <OTick nhan="Gửi HDSD (CTD50/CTS10)" giaTri={guiHdsd} doi={setGuiHdsd} />
                  <OTick nhan="Xuất hoá đơn" giaTri={xuatHD} doi={setXuatHD} />
                </>}
              </div>
            </Card>
          )}

          {/* POE — đơn lọc tổng: hồ sơ, tiến độ lắp, khảo sát nhà, thông tin xuất hoá đơn.
              Gập lại vì 20 ô, mở ra chỉ khi cần. */}
          {laPOE && (
            <Card>
              <button type="button" onClick={() => setMoPOE((v) => !v)}
                className="flex w-full items-center justify-between text-left text-sm font-semibold text-foreground">
                <span>Hồ sơ &amp; lắp đặt (POE)</span>
                <span className="text-muted-foreground">{moPOE ? '▲' : '▼ mở ra'}</span>
              </button>

              {moPOE && (
                <div className="mt-3 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div><FieldLabel htmlFor={fieldId + '-soHD'} className="mb-1">Số HĐ</FieldLabel><Input id={fieldId + '-soHD'} value={soHD} onChange={(e) => setSoHD(e.target.value)} /></div>
                    <div><FieldLabel htmlFor={fieldId + '-tenGoi'} className="mb-1">Tên gọi khách</FieldLabel><Input id={fieldId + '-tenGoi'} value={tenGoi} onChange={(e) => setTenGoi(e.target.value)} placeholder="gọi thân mật" /></div>
                    <div><FieldLabel htmlFor={fieldId + '-tenFolder'} className="mb-1">Tên folder</FieldLabel><Input id={fieldId + '-tenFolder'} value={tenFolder} onChange={(e) => setTenFolder(e.target.value)} /></div>
                    <div><FieldLabel htmlFor={fieldId + '-tenTheoDoi'} className="mb-1">Tên khách theo dõi</FieldLabel><Input id={fieldId + '-tenTheoDoi'} value={tenTheoDoi} onChange={(e) => setTenTheoDoi(e.target.value)} /></div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div><FieldLabel htmlFor={fieldId + '-tienSeThu'} className="mb-1">Tiền sẽ thu</FieldLabel>
                      <Input id={fieldId + '-tienSeThu'} type="number" min={0} step="any" className="text-right tabular-nums" value={tienSeThu} onChange={(e) => setTienSeThu(e.target.value)} /></div>
                    <div><FieldLabel htmlFor={fieldId + '-tienDoLap'} className="mb-1">Tiến độ lắp đặt</FieldLabel><Input id={fieldId + '-tienDoLap'} value={tienDoLap} onChange={(e) => setTienDoLap(e.target.value)} /></div>
                    <div><FieldLabel htmlFor={fieldId + '-ngayXongLap'} className="mb-1">Ngày hoàn thành lắp</FieldLabel><Input id={fieldId + '-ngayXongLap'} type="date" value={ngayXongLap} onChange={(e) => setNgayXongLap(e.target.value)} /></div>
                    <div><FieldLabel htmlFor={fieldId + '-tuDien'} className="mb-1">Tủ điện</FieldLabel><Input id={fieldId + '-tuDien'} value={tuDien} onChange={(e) => setTuDien(e.target.value)} /></div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <OTick nhan="Biên bản xác nhận" giaTri={bienBan} doi={setBienBan} />
                    <OTick nhan="Báo cáo lắp đặt" giaTri={baoCaoLap} doi={setBaoCaoLap} />
                    <OTick nhan="Kích hoạt bảo hành" giaTri={kichHoatBH} doi={setKichHoatBH}
                      chuThich="Hồ sơ bảo hành nằm bên CSKH — đây chỉ là cờ đánh dấu trên đơn" />
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Khảo sát tại thời điểm lắp
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div><FieldLabel htmlFor={fieldId + '-phienBan'} className="mb-1">Version</FieldLabel><Input id={fieldId + '-phienBan'} value={phienBan} onChange={(e) => setPhienBan(e.target.value)} /></div>
                      <div><FieldLabel htmlFor={fieldId + '-ngheNghiep'} className="mb-1">Nghề nghiệp</FieldLabel><Input id={fieldId + '-ngheNghiep'} value={ngheNghiep} onChange={(e) => setNgheNghiep(e.target.value)} /></div>
                      <div><FieldLabel htmlFor={fieldId + '-ngaySinhKH'} className="mb-1">Ngày sinh</FieldLabel><Input id={fieldId + '-ngaySinhKH'} type="date" value={ngaySinhKH} onChange={(e) => setNgaySinhKH(e.target.value)} /></div>
                      <div><FieldLabel htmlFor={fieldId + '-gioiTinh'} className="mb-1">Giới tính</FieldLabel>
                        <NativeSelect id={fieldId + '-gioiTinh'} value={gioiTinh} onChange={(e) => setGioiTinh(e.target.value)}>
                          <NativeSelectOption value="">—</NativeSelectOption><NativeSelectOption value="Nam">Nam</NativeSelectOption><NativeSelectOption value="Nữ">Nữ</NativeSelectOption><NativeSelectOption value="Khác">Khác</NativeSelectOption>
                        </NativeSelect></div>
                      <div><FieldLabel htmlFor={fieldId + '-doTuoi'} className="mb-1">Độ tuổi</FieldLabel><Input id={fieldId + '-doTuoi'} value={doTuoi} onChange={(e) => setDoTuoi(e.target.value)} placeholder="30-40" /></div>
                      <div><FieldLabel htmlFor={fieldId + '-loaiNha'} className="mb-1">Loại nhà</FieldLabel><Input id={fieldId + '-loaiNha'} value={loaiNha} onChange={(e) => setLoaiNha(e.target.value)} placeholder="Chung cư, nhà phố…" /></div>
                      <div><FieldLabel htmlFor={fieldId + '-tinhTrangNha'} className="mb-1">Tình trạng nhà</FieldLabel><Input id={fieldId + '-tinhTrangNha'} value={tinhTrangNha} onChange={(e) => setTinhTrangNha(e.target.value)} placeholder="Đang ở, đang xây…" /></div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Đây là khảo sát <b>của lần lắp này</b>, không phải hồ sơ khách — một khách lắp
                      hai lần có thể khai khác nhau, nên lưu ở đơn.
                    </p>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Xuất hoá đơn cho công ty
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="sm:col-span-2"><FieldLabel htmlFor={fieldId + '-ctyXuatHD'} className="mb-1">Công ty xuất HĐ</FieldLabel><Input id={fieldId + '-ctyXuatHD'} value={ctyXuatHD} onChange={(e) => setCtyXuatHD(e.target.value)} /></div>
                      <div><FieldLabel htmlFor={fieldId + '-mstXuatHD'} className="mb-1">MST</FieldLabel><Input id={fieldId + '-mstXuatHD'} className="font-mono" value={mstXuatHD} onChange={(e) => setMstXuatHD(e.target.value)} /></div>
                      <div className="sm:col-span-4"><FieldLabel htmlFor={fieldId + '-dcXuatHD'} className="mb-1">Địa chỉ xuất HĐ</FieldLabel><Input id={fieldId + '-dcXuatHD'} value={dcXuatHD} onChange={(e) => setDcXuatHD(e.target.value)} /></div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Chỉ điền khi hợp đồng ký với <b>công ty</b>. Tên / SĐT / địa chỉ khách ở trên
                      vẫn giữ của <b>người</b>, không thay bằng thông tin công ty.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
        <aside aria-labelledby={fieldId + '-tom-tat'} className="@min-[60rem]:sticky @min-[60rem]:top-4">
          <Card className="space-y-3">
            <h2 id={fieldId + '-tom-tat'} className="text-base font-semibold">Tóm tắt đơn</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">Tổng (gồm VAT)</dt>
                <dd className="font-medium tabular-nums">{fmtVnd(total)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">Đã cọc</dt>
                <dd className="tabular-nums">{fmtVnd(Number(tienCoc) || 0)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-2 border-t border-border pt-2">
                <dt className="font-medium">Còn cần thu</dt>
                <dd className="text-lg font-semibold tabular-nums" aria-live="polite">{fmtVnd(conCanThu)}</dd>
              </div>
            </dl>
            {error && <Alert color="danger"><AlertDescription>{error}</AlertDescription></Alert>}
            <FormFooter className="flex-col items-stretch">
              <Button type="submit" loading={submitting} disabled={submitting}>
                {submitting ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo đơn'}
              </Button>
            </FormFooter>
          </Card>
        </aside>
      </div>
    </FormLayout>
  )
}


/**
 * Nhãn dưới ô đơn giá: giá này ở đâu ra, và có đang bán dưới mức đã duyệt không.
 *
 * Cảnh báo chứ KHÔNG chặn — CEO chốt bán dưới giá là quyết định kinh doanh, có ca hợp lệ
 * (đổi trả, thanh lý). Chặn cứng là nhân viên đi đường vòng, app mất luôn dấu vết.
 */
function LineGiaNhan({
  g, daGo, laQua, onApLai, tuDien,
}: { g: GiaGoiY | undefined; daGo: number; laQua: boolean; onApLai: (v: number) => void; tuDien: boolean }) {
  if (!g || laQua) return <div className="col-span-12 hidden" />
  const lech = g.gia != null && daGo > 0 && daGo !== g.gia
  const duoi = g.gia != null && daGo > 0 && daGo < g.gia

  return (
    <div className="col-span-12 -mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 pl-1 text-xs">
      {g.nguon === 'KHONG_RO' ? (
        <span className="text-(--color-text-warning)">⚠ {g.nhan} — nhập tay giúp.</span>
      ) : (
        <span className={g.nguon === 'NIEM_YET' ? 'text-muted-foreground' : 'text-(--color-text-info)'}>
          {g.nguon === 'NIEM_YET' ? 'Giá niêm yết' : `Theo ${g.nhan}`}
          {g.gia != null && <> · <b>{fmtVnd(g.gia)}</b></>}
        </span>
      )}
      {/* Nói rõ con số trong ô là của app hay của người — để nhân viên biết đổi khách
          giữa chừng thì ô nào sẽ tự đổi theo, ô nào giữ nguyên số họ đã gõ. */}
      {tuDien && !lech && g.gia != null && (
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">app tự điền</span>
      )}
      {!tuDien && (
        <span className="rounded bg-(--color-background-warning-surface) px-1.5 py-0.5 text-[10px] text-(--color-text-warning)">giá gõ tay — app không tự đổi</span>
      )}
      {duoi && <span className="text-(--color-text-danger)">⚠ đang bán THẤP HƠN mức đã duyệt</span>}
      {lech && g.gia != null && (
        <button type="button" onClick={() => onApLai(g.gia as number)}
          className="text-(--color-text-info) underline hover:text-teal-900">áp lại giá này</button>
      )}
    </div>
  )
}


/** Ô tick có nhãn bấm được — Sheet dùng checkbox, giữ nguyên kiểu cho quen tay. */
function OTick({
  nhan, giaTri, doi, chuThich,
}: { nhan: string; giaTri: boolean; doi: (v: boolean) => void; chuThich?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground" title={chuThich}>
      <Checkbox checked={giaTri} onCheckedChange={(checked) => doi(checked === true)} />
      {nhan}
    </label>
  )
}
