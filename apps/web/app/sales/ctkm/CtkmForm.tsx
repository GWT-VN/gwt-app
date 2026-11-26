'use client'

import { Table, TableWrap, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

import { ChannelSelect } from '../ChannelSelect'
import { Badge } from '@/components/ui/badge'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FieldLabel } from '@/components/ui/field'
import { FormFooter, FormLayout, FormSection } from '@/components/ui/form-layout'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition, useId } from 'react'
import { luuNhap, banHanh, timKhachChoCtkm, type CtkmInput, type KhachCtkm } from './actions'
import { OChonGoiY, OChonTimXa } from '@/bang'
import { giaSauGiam, mucApDung, type KieuGiam, type NhomTru } from '../_ctkm'

type Kenh = { id: number; l1: string; l2: string }
type Sp = { ma: string; ten: string; gia: number | null }

const vnd = new Intl.NumberFormat('vi-VN')
const tien = (n: number | null | undefined) => (n == null ? '—' : vnd.format(Math.round(n)) + ' ₫')


/** Mức mặc định khi đổi kiểu giảm — 12% và 12 đồng là hai thứ khác hẳn nhau. */
const MUC_GOI_Y: Record<KieuGiam, number> = { PCT: 10, TIEN: 1000000, CON: 0, KHONG: 0 }

/**
 * Một bước của form. Khai báo NGOÀI component cha — nếu định nghĩa bên trong thì mỗi
 * lần cha render lại là một kiểu component MỚI, React tháo cả cây con rồi dựng lại:
 * ô đang gõ mất nội dung và mất luôn con trỏ. Lỗi thật, không phải chuyện dọn dẹp.
 */
function Buoc({
  tieuDe, phu, children,
}: { tieuDe: string; phu?: string; children: React.ReactNode }) {
  return (
    <Card>
      <FormSection tieuDe={tieuDe} moTa={phu}>{children}</FormSection>
    </Card>
  )
}

/**
 * Một danh sách khách gắn vào chương trình — dùng cho CẢ "chỉ định" lẫn "loại trừ".
 *
 * Cùng một component cho hai vai trò khác hẳn nhau về hậu quả, nên `mau` không phải
 * chuyện trang trí: danh sách GẠCH TÊN phải nhìn ra ngay là màu chặn, không được trông
 * giống hệt danh sách cho hưởng.
 */
function DanhSachKhach({
  ds, doi, mau, choTrong, moTa,
}: {
  ds: KhachCtkm[]
  doi: (f: (cu: KhachCtkm[]) => KhachCtkm[]) => void
  mau: 'gom' | 'tru'
  choTrong: string
  moTa: string
}) {
  const the =
    mau === 'tru'
      ? 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'
      : 'bg-(--color-background-info-soft-alpha) text-(--color-text-info-soft) ring-1 ring-(--color-border-info-surface)'
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{moTa} ({ds.length})</span>
        <div className="w-full sm:w-[320px]">
          <OChonTimXa
            choTrong={choTrong}
            tim={async (kw) => {
              const kq = await timKhachChoCtkm(kw)
              return kq.map((k) => ({
                gt: k.customer_code,
                nhan: k.ten || '(chưa tên)',
                phu: [k.phone, k.customer_code].filter(Boolean).join(' · '),
              }))
            }}
            onChon={(m) =>
              doi((cu) =>
                cu.some((x) => x.customer_code === m.gt)
                  ? cu
                  : [...cu, { customer_code: m.gt, ten: m.nhan, phone: null }]
              )
            }
          />
        </div>
      </div>
      {ds.length === 0 ? (
        <p className="py-2 text-center text-sm text-muted-foreground">Chưa có khách nào.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {ds.map((k) => (
            <span key={k.customer_code} className={'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ' + the}>
              {k.ten || '(chưa tên)'}
              <span className="font-mono opacity-60">{k.customer_code}</span>
              <button type="button" className="opacity-60 hover:opacity-100"
                onClick={() => doi((cu) => cu.filter((x) => x.customer_code !== k.customer_code))}>✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** Ô tick gạch một tập khách. Tách riêng cho gọn — dùng 6 lần trong bước 3. */
function OTruNhom({ nhan, co, doi }: { nhan: string; co: boolean; doi: () => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <input type="checkbox" className="h-4 w-4 accent-rose-600" checked={co} onChange={doi} />
      {nhan}
    </label>
  )
}

export function CtkmForm({
  kenhDs,
  spDs,
  initial,
  coQuyenDuyet,
}: {
  kenhDs: Kenh[]
  spDs: Sp[]
  initial?: CtkmInput
  coQuyenDuyet: boolean
}) {
  const router = useRouter()
  const fieldId = useId()
  const [dangChay, batDau] = useTransition()
  const [loi, setLoi] = useState<string | null>(null)

  const [ten, setTen] = useState(initial?.ten ?? '')
  const [moTa, setMoTa] = useState(initial?.mo_ta_khach ?? '')
  const [luuY, setLuuY] = useState(initial?.luu_y_noi_bo ?? '')
  const [tuNgay, setTuNgay] = useState(initial?.tu_ngay ?? '')
  const [denNgay, setDenNgay] = useState(initial?.den_ngay ?? '')
  const [nhomKhach, setNhomKhach] = useState(initial?.nhom_khach ?? 'TAT_CA')
  const [kieu, setKieu] = useState<KieuGiam>(initial?.kieu_giam ?? 'PCT')
  const [mucChung, setMucChung] = useState<number | null>(initial?.muc_chung ?? 10)
  const [giamToiDa, setGiamToiDa] = useState<number | null>(initial?.giam_toi_da ?? null)
  const [donToiThieu, setDonToiThieu] = useState(initial?.don_toi_thieu ?? 0)
  const [slToiThieu, setSlToiThieu] = useState(initial?.sl_toi_thieu ?? 1)
  const [kenh, setKenh] = useState<number[]>(initial?.kenh ?? [])
  const [sp, setSp] = useState(initial?.sp ?? [])
  const [qua, setQua] = useState(initial?.qua ?? [])
  const [congDon, setCongDon] = useState(initial?.cong_don ?? false)
  const [khachGom, setKhachGom] = useState<KhachCtkm[]>(initial?.khachGom ?? [])
  const [khachTru, setKhachTru] = useState<KhachCtkm[]>(initial?.khachTru ?? [])
  const [nhomTru, setNhomTru] = useState<NhomTru[]>(initial?.nhomTru ?? [])
  const chiTangQua = kieu === 'KHONG'

  const coNhomTru = (loai: NhomTru['loai'], gt: string) =>
    nhomTru.some((n) => n.loai === loai && n.gia_tri === gt)
  const doiNhomTru = (loai: NhomTru['loai'], gt: string) =>
    setNhomTru((ds) =>
      coNhomTru(loai, gt) ? ds.filter((n) => !(n.loai === loai && n.gia_tri === gt)) : [...ds, { loai, gia_tri: gt }]
    )

  const [cap1, setCap1] = useState<string | null>(kenhDs[0]?.l1 ?? null)
  const [cap2, setCap2] = useState('')
  const cap2Ds = useMemo(() => kenhDs.filter((k) => k.l1 === cap1), [kenhDs, cap1])
  const cac1 = useMemo(() => [...new Set(kenhDs.map((k) => k.l1))], [kenhDs])
  const tenKenh = (id: number) => {
    const k = kenhDs.find((x) => x.id === id)
    return k ? (k.l2 ? `${k.l1} · ${k.l2}` : k.l1) : `#${id}`
  }
  const giaCua = (ma: string) => spDs.find((s) => s.ma === ma)?.gia ?? null

  function doiKieu(k: KieuGiam) {
    setKieu(k)
    setSp((ds) => ds.map((s) => ({ ...s, muc: null })))
    if (k !== 'PCT') setGiamToiDa(null)
    if (k === 'KHONG') {
      // Không giảm giá thì không có mức nào để lưu — để lại số cũ là rác trong DB.
      setMucChung(null)
      // Chương trình chỉ tặng quà gần như luôn phải chồng lên chương trình giảm giá,
      // nếu không nó tranh chỗ với chương trình đang giảm và làm mất phần giảm.
      // Vẫn để CEO bỏ tick được nếu cố ý.
      setCongDon(true)
      return
    }
    setMucChung(MUC_GOI_Y[k])
  }

  function themKenhCap1() {
    const ids = cap2Ds.map((k) => k.id)
    setKenh((ds) => [...new Set([...ds, ...ids])])
  }

  function luu(roiBanHanh: boolean) {
    setLoi(null)
    const payload: CtkmInput = {
      id: initial?.id, ten, mo_ta_khach: moTa || null, luu_y_noi_bo: luuY || null,
      tu_ngay: tuNgay, den_ngay: denNgay || null, nhom_khach: nhomKhach,
      kieu_giam: kieu, muc_chung: mucChung, giam_toi_da: giamToiDa,
      don_toi_thieu: donToiThieu, sl_toi_thieu: slToiThieu, kenh, sp, qua,
      cong_don: congDon, khachGom, khachTru, nhomTru,
    }
    batDau(async () => {
      const r = await luuNhap(payload)
      if (!r.ok) return setLoi(r.error)
      if (roiBanHanh && r.id) {
        const b = await banHanh(r.id)
        if (!b.ok) return setLoi(b.error)
      }
      router.push('/sales/ctkm')
      router.refresh()
    })
  }


  return (
    <FormLayout className="pb-24" onSubmit={(e) => e.preventDefault()}>
      {loi && <Alert color="danger"><AlertDescription>{loi}</AlertDescription></Alert>}

      <Buoc tieuDe="Thông tin chung">
        <div><FieldLabel htmlFor={fieldId + '-ten'} className="mb-1" required>Tên chương trình</FieldLabel>
          <Input id={fieldId + '-ten'} value={ten} required onChange={(e) => setTen(e.target.value)} placeholder="Deal 10.10 Shopee" /></div>
        <div><FieldLabel htmlFor={fieldId + '-moTa'} className="mb-1">Mô tả hiện cho khách</FieldLabel>
          <Textarea id={fieldId + '-moTa'} rows={2} value={moTa} onChange={(e) => setMoTa(e.target.value)} /></div>
        <div><FieldLabel htmlFor={fieldId + '-luuY'} className="mb-1">Lưu ý nội bộ <span className="font-normal normal-case tracking-normal text-muted-foreground">(khách không thấy)</span></FieldLabel>
          <Textarea id={fieldId + '-luuY'} rows={2} value={luuY} onChange={(e) => setLuuY(e.target.value)} placeholder="Ngân sách, điều kiện, ai duyệt…" /></div>
      </Buoc>

      <Buoc tieuDe="Thời gian áp dụng" phu="Đơn có ngày nằm trong khoảng này mới được hưởng">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><FieldLabel htmlFor={fieldId + '-tuNgay'} className="mb-1" required>Từ ngày</FieldLabel>
            <Input id={fieldId + '-tuNgay'} type="date" value={tuNgay} required onChange={(e) => setTuNgay(e.target.value)} /></div>
          <div><FieldLabel htmlFor={fieldId + '-denNgay'} className="mb-1">Đến ngày</FieldLabel>
            <Input id={fieldId + '-denNgay'} type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">Để trống = chạy vô thời hạn</p></div>
        </div>
      </Buoc>

      <Buoc tieuDe="Áp dụng cho ai" phu="Khách đã gán bậc đại lý KHÔNG ăn chương trình này — họ hưởng giá theo bậc">
        <div>
          <FieldLabel className="mb-1">Kênh bán — chọn 2 cấp từ danh mục kênh</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <ChannelSelect label="Kênh cấp 1" value={cap1 === null ? '' : ':' + cap1}
              emptyLabel="Chọn kênh cấp 1…"
              options={cac1.map((kenh) => ({ gt: ':' + kenh, nhan: kenh || '(không có cấp 1)', anMa: true }))}
              onChange={(value) => { setCap1(value ? value.slice(1) : null); setCap2('') }}
            />
            <ChannelSelect label="Kênh cấp 2" value={cap2} onChange={setCap2}
              emptyLabel={cap1 === null ? 'Chọn kênh cấp 1 trước' : 'Toàn bộ ' + cap1 + ' (' + cap2Ds.length + ')'}
              options={cap2Ds.map((kenh) => ({ gt: String(kenh.id), nhan: kenh.l2 || '(không có cấp 2)', anMa: true }))}
            />
            <Button variant="outline" disabled={cap1 === null}
              onClick={() => {
                if (!cap2) themKenhCap1()
                else setKenh((ds) => (ds.includes(Number(cap2)) ? ds : [...ds, Number(cap2)]))
              }}>＋ Thêm kênh</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {kenh.length === 0 ? (
              <span className="text-xs text-rose-600">Chưa chọn kênh nào — chương trình sẽ không áp cho đơn nào.</span>
            ) : kenh.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-(--color-background-info-soft-alpha) px-2 py-0.5 text-xs font-medium text-(--color-text-info-soft)">
                {tenKenh(id)}
                <button type="button" className="text-teal-600 hover:text-rose-600" onClick={() => setKenh((ds) => ds.filter((x) => x !== id))}>✕</button>
              </span>
            ))}
          </div>
        </div>
        <div><FieldLabel htmlFor={fieldId + '-nhomKhach'} className="mb-1">Nhóm khách</FieldLabel>
          <NativeSelect id={fieldId + '-nhomKhach'} value={nhomKhach} onChange={(e) => setNhomKhach(e.target.value)}>
            <NativeSelectOption value="TAT_CA">Tất cả khách lẻ</NativeSelectOption>
            <NativeSelectOption value="MOI">Chỉ khách mới (chưa có đơn nào)</NativeSelectOption>
            <NativeSelectOption value="DA_MUA">Chỉ khách đã mua</NativeSelectOption>
            <NativeSelectOption value="CHI_DINH">Danh sách chỉ định</NativeSelectOption>
          </NativeSelect>
          {nhomKhach === 'MOI' && (
            <p className="mt-1 text-xs text-muted-foreground">
              &ldquo;Khách mới&rdquo; = hồ sơ chưa có đơn nào. Khách nhân viên gõ tay lúc lên đơn
              (chưa có mã KH) thì app <b>chưa biết</b> mới hay cũ nên <b>không tự áp</b> — nhân
              viên gõ giá tay.
            </p>
          )}
        </div>

        {nhomKhach === 'CHI_DINH' && (
          <div>
            <FieldLabel className="mb-1">Danh sách chỉ định — chỉ những khách này được hưởng</FieldLabel>
            <DanhSachKhach
              ds={khachGom} doi={setKhachGom} mau="gom"
              moTa="Khách được chỉ định"
              choTrong="＋ Gõ tên / SĐT / mã khách…"
            />
            {khachGom.length === 0 && (
              <p className="mt-1 text-xs text-rose-600">
                Chưa chọn khách nào — chương trình sẽ <b>không áp cho ai</b>.
              </p>
            )}
          </div>
        )}

        <div>
          <FieldLabel className="mb-1">Loại trừ theo NHÓM — gạch cả một tập khách</FieldLabel>
          <div className="space-y-2 rounded-lg border border-dashed border-rose-200 bg-rose-50/40 p-3">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Theo lịch sử mua</div>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <OTruNhom nhan="Gạch khách MỚI (chưa có đơn nào)" co={coNhomTru('NHOM', 'MOI')} doi={() => doiNhomTru('NHOM', 'MOI')} />
                <OTruNhom nhan="Gạch khách ĐÃ MUA" co={coNhomTru('NHOM', 'DA_MUA')} doi={() => doiNhomTru('NHOM', 'DA_MUA')} />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Theo bậc đối tác</div>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <OTruNhom nhan="Gạch MỌI đối tác có bậc" co={coNhomTru('BAC', 'CO_BAC')} doi={() => doiNhomTru('BAC', 'CO_BAC')} />
                <OTruNhom nhan="Cấp 1 · NPP" co={coNhomTru('BAC', 'NPP')} doi={() => doiNhomTru('BAC', 'NPP')} />
                <OTruNhom nhan="Cấp 2 · Đại lý" co={coNhomTru('BAC', 'DAI_LY')} doi={() => doiNhomTru('BAC', 'DAI_LY')} />
                <OTruNhom nhan="Cấp 3 · Giới thiệu" co={coNhomTru('BAC', 'GIOI_THIEU')} doi={() => doiNhomTru('BAC', 'GIOI_THIEU')} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Chương trình <b>giảm giá</b> vốn đã không áp cho đối tác có bậc (họ ăn giá bậc).
                Mấy ô này có nghĩa với chương trình <b>chỉ tặng quà</b> — quà thì đối tác vẫn nhận.
              </p>
            </div>
            {kenh.length > 0 && (
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Gạch bớt kênh trong số kênh đã chọn ở trên
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {kenh.map((id) => {
                    const tru = coNhomTru('KENH', String(id))
                    return (
                      <button key={id} type="button" onClick={() => doiNhomTru('KENH', String(id))}
                        className={
                          'rounded-full px-2 py-0.5 text-xs font-medium ring-1 ' +
                          (tru ? 'bg-rose-100 text-rose-800 ring-rose-300 line-through' : 'bg-card text-muted-foreground ring-slate-300')
                        }>
                        {tenKenh(id)}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Bấm để gạch. Tiện khi anh thêm cả cấp 1 rồi muốn bỏ ra vài cấp 2 —
                  đỡ phải thêm từng kênh một.
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <FieldLabel className="mb-1">Loại trừ TỪNG khách — người cụ thể không được hưởng</FieldLabel>
          <DanhSachKhach
            ds={khachTru} doi={setKhachTru} mau="tru"
            moTa="Khách bị loại trừ"
            choTrong="＋ Gõ tên / SĐT / mã khách…"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Gạch tên ở đây <b>thắng mọi luật khác</b> — kể cả khi khách nằm trong nhóm khách
            và trong danh sách chỉ định ở trên. Dùng cho khách đã có giá thoả thuận riêng.
          </p>
        </div>
      </Buoc>

      <Buoc tieuDe="Sản phẩm & mức giảm" phu="Đặt mức chung, hoặc chỉnh riêng từng mã">
        {chiTangQua && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Chương trình <b>chỉ tặng quà</b>: đơn giá giữ nguyên, không giảm đồng nào.
            Danh sách sản phẩm bên dưới là <b>điều kiện nhận quà</b> — mua mã trong danh
            sách thì được quà. Để trống = mua gì cũng được quà. Quà khai ở bước 5.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <div><FieldLabel htmlFor={fieldId + '-kieu'} className="mb-1">Kiểu giảm</FieldLabel>
            <NativeSelect id={fieldId + '-kieu'} value={kieu} onChange={(e) => doiKieu(e.target.value as KieuGiam)}>
              <NativeSelectOption value="PCT">Giảm theo % — vd giảm 12%</NativeSelectOption>
              <NativeSelectOption value="TIEN">Giảm số tiền — vd giảm 5.000.000đ</NativeSelectOption>
              <NativeSelectOption value="CON">Giảm CÒN — chốt giá bán</NativeSelectOption>
              <NativeSelectOption value="KHONG">KHÔNG giảm giá — chỉ tặng quà</NativeSelectOption>
            </NativeSelect></div>
          {!chiTangQua && (
            <div><FieldLabel className="mb-1">Mức chung {kieu === 'PCT' ? '(%)' : '(₫)'}</FieldLabel>
              <Input type="number" value={mucChung ?? ''} onChange={(e) => setMucChung(e.target.value === '' ? null : Number(e.target.value))} /></div>
          )}
          {kieu === 'PCT' && !chiTangQua && (
            <div><FieldLabel className="mb-1">Giảm tối đa (₫)</FieldLabel>
              <Input type="number" value={giamToiDa ?? ''} onChange={(e) => setGiamToiDa(e.target.value === '' ? null : Number(e.target.value))} />
              <p className="mt-1 text-xs text-muted-foreground">Trần cho số tiền giảm</p></div>
          )}
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Sản phẩm ({sp.length === 0 ? 'chưa chọn = áp mọi sản phẩm' : sp.length})
            </span>
                <div className="w-full sm:w-[320px]">
              <OChonGoiY
                giaTri={null}
                choPhepXoa={false}
                choTrong="＋ Gõ mã hoặc tên sản phẩm…"
                tuyChon={spDs
                  .filter((s) => !sp.some((x) => x.internal_code === s.ma))
                  .map((s) => ({ gt: s.ma, nhan: s.ten, phu: s.gia ? tien(s.gia) : undefined }))}
                onChon={(ma) => {
                  if (ma && !sp.some((s) => s.internal_code === ma)) setSp((ds) => [...ds, { internal_code: ma, muc: null }])
                }}
              />
            </div>
          </div>
          {sp.length > 0 && (
            <TableWrap>
              <Table variant="thuong">
                <TableHeader className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  <TableRow><TableHead className="py-1">Sản phẩm</TableHead><TableHead className="py-1 text-right">Niêm yết</TableHead>
                    {!chiTangQua && <><TableHead className="py-1 text-center">Mức riêng</TableHead><TableHead className="py-1 text-right">Giá sau giảm</TableHead></>}
                    <TableHead /></TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-200">
                  {sp.map((s, i) => {
                    const g = giaCua(s.internal_code)
                    const m = mucApDung(s.muc, mucChung)
                    return (
                      <TableRow key={s.internal_code}>
                        <TableCell className="py-1.5">
                          <div className="font-medium text-foreground">{spDs.find((x) => x.ma === s.internal_code)?.ten ?? s.internal_code}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">{s.internal_code}</div>
                        </TableCell>
                        <TableCell className="py-1.5 text-right tabular-nums text-muted-foreground">{tien(g)}</TableCell>
                        {!chiTangQua && <>
                          <TableCell className="py-1.5 text-center">
                            <Input type="number" className="w-24 rounded border border-border px-2 py-1 text-right text-sm"
                              placeholder={String(mucChung ?? '')} value={s.muc ?? ''}
                              onChange={(e) => setSp((ds) => ds.map((x, j) => j === i ? { ...x, muc: e.target.value === '' ? null : Number(e.target.value) } : x))} />
                          </TableCell>
                          <TableCell className="py-1.5 text-right font-semibold tabular-nums text-(--color-text-info)">{tien(giaSauGiam(kieu, g, m, giamToiDa))}</TableCell>
                        </>}
                        <TableCell className="py-1.5 text-right">
                          <button type="button" className="text-muted-foreground hover:text-rose-600" onClick={() => setSp((ds) => ds.filter((_, j) => j !== i))}>✕</button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableWrap>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#0e8c9a]"
            checked={congDon} onChange={(e) => setCongDon(e.target.checked)} />
          <span>
            <b>Cho cộng dồn với chương trình khác</b>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Mặc định TẮT: nhiều chương trình cùng khớp một đơn thì chỉ chương trình{' '}
              <b>giảm sâu nhất</b> được áp — để hai chương trình 15% và 20% không lặng lẽ
              thành 32% mà không ai duyệt con số đó.
              <br />
              Bật lên là chương trình này áp <b>chồng</b> lên chương trình đã chọn. Đúng cho
              chương trình <b>chỉ tặng quà</b>, hoặc mức giảm nhỏ cố ý cộng thêm.
            </span>
          </span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div><FieldLabel htmlFor={fieldId + '-donToiThieu'} className="mb-1">Đơn tối thiểu (₫)</FieldLabel>
            <Input id={fieldId + '-donToiThieu'} type="number" value={donToiThieu} onChange={(e) => setDonToiThieu(Number(e.target.value) || 0)} />
            <p className="mt-1 text-xs text-muted-foreground">0 = không yêu cầu</p></div>
          <div><FieldLabel htmlFor={fieldId + '-slToiThieu'} className="mb-1">Số lượng tối thiểu</FieldLabel>
            <Input id={fieldId + '-slToiThieu'} type="number" value={slToiThieu} onChange={(e) => setSlToiThieu(Number(e.target.value) || 1)} /></div>
        </div>
      </Buoc>

      <Buoc tieuDe="Quà tặng kèm" phu="Cùng chương trình — không phải tạo chương trình riêng">
        <div className="rounded-lg border border-dashed border-border bg-muted p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Quà ({qua.length})</span>
                <div className="w-full sm:w-[320px]">
              <OChonGoiY
                giaTri={null}
                choPhepXoa={false}
                choTrong="＋ Gõ mã hoặc tên quà tặng…"
                tuyChon={spDs.map((s) => ({ gt: s.ma, nhan: s.ten, phu: s.gia ? tien(s.gia) : undefined }))}
                onChon={(ma) => {
                  if (ma) setQua((ds) => [...ds, { internal_code_qua: ma, so_luong: 1, gia_tri_quy_doi: giaCua(ma), dieu_kien: null }])
                }}
              />
            </div>
          </div>
          {qua.length === 0 ? (
            <p className={'py-3 text-center text-sm ' + (chiTangQua ? 'text-rose-600' : 'text-muted-foreground')}>
              {chiTangQua
                ? 'Chương trình đang đặt "chỉ tặng quà" mà chưa có món quà nào — nó sẽ không làm gì cả.'
                : 'Chương trình này không có quà.'}
            </p>
          ) : (
            <div className="space-y-2">
              {qua.map((q, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <div className="col-span-12 sm:col-span-4">
                    <div className="text-sm font-medium text-foreground">{spDs.find((x) => x.ma === q.internal_code_qua)?.ten ?? q.internal_code_qua}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{q.internal_code_qua}</div>
                  </div>
                  <Input type="number" className="col-span-3 sm:col-span-1 rounded border border-border px-2 py-1 text-right text-sm"
                    value={q.so_luong} onChange={(e) => setQua((ds) => ds.map((x, j) => j === i ? { ...x, so_luong: Number(e.target.value) || 1 } : x))} />
                  <Input type="number" className="col-span-5 sm:col-span-3 rounded border border-border px-2 py-1 text-right text-sm"
                    value={q.gia_tri_quy_doi ?? ''} placeholder="giá trị quy đổi"
                    onChange={(e) => setQua((ds) => ds.map((x, j) => j === i ? { ...x, gia_tri_quy_doi: e.target.value === '' ? null : Number(e.target.value) } : x))} />
                  <Input className="col-span-11 sm:col-span-3 rounded border border-border px-2 py-1 text-sm"
                    value={q.dieu_kien ?? ''} placeholder="điều kiện nhận"
                    onChange={(e) => setQua((ds) => ds.map((x, j) => j === i ? { ...x, dieu_kien: e.target.value || null } : x))} />
                  <button type="button" className="col-span-1 text-muted-foreground hover:text-rose-600"
                    onClick={() => setQua((ds) => ds.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Quà ghi vào đơn thành dòng <b>tính 0 đ</b>. Giá trị quy đổi chỉ để tính chi phí chương trình, không cộng vào tiền khách trả.
          </p>
        </div>
      </Buoc>

      <FormFooter className="sticky bottom-0 z-10 flex-wrap rounded-(--radius-xl) bg-card p-3">
        <Badge variant="soft" color="warning" className="mr-auto">Nháp — chưa áp cho đơn nào</Badge>
        <Button variant="outline" disabled={dangChay}
          onClick={() => router.push('/sales/ctkm')}>Huỷ</Button>
        <Button variant="outline" disabled={dangChay}
          onClick={() => luu(false)}>{dangChay ? 'Đang lưu…' : 'Lưu nháp'}</Button>
        {coQuyenDuyet && (
          <Button disabled={dangChay}
            onClick={() => luu(true)}>Lưu &amp; ban hành</Button>
        )}
      </FormFooter>
    </FormLayout>
  )
}
