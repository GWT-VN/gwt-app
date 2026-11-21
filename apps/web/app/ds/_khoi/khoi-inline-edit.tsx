'use client'

import { useState, type ReactNode } from 'react'
import { ArrowCounterClockwise, WarningCircle } from '@phosphor-icons/react/ssr'
import type { MucChon } from '@/bang/OChonGoiY'
import { Badge, BadgeDot } from '@/components/ui/badge'
import {
  OSuaChu,
  OSuaHan,
  OSuaKhach,
  OSuaNguoi,
  OSuaNhan,
  OSuaTrangThai,
  type GiaTriTrangThai,
  type MucNhan,
  type MucTrangThai,
} from '@/components/ui/inline-edit'
import { cat, khach, luuY, oSuaInput } from '@/components/ui/inline-edit-styles'
import { Input } from '@/components/ui/input'
import type { BanGhi } from '@/components/ui/record-picker'
import { BienThe, KhoiHang } from '../_khung/tam'
import { KHACH_DEMO } from './khoi-record-picker'

// Dữ liệu demo — mã ticket tự đặt, tên nhân viên/khách giả. Không đọc DB.
const MA = 'TK-2611-045'

/** Ưu tiên (README: P1 solid danger · P2 warning · P3 mặc định · P4 outline). */
const UU: MucNhan[] = [
  { gt: 'P1', nhan: <Badge variant="solid" color="danger">P1</Badge>, chu: 'P1' },
  { gt: 'P2', nhan: <Badge variant="soft" color="warning">P2</Badge>, chu: 'P2' },
  { gt: 'P3', nhan: <Badge variant="soft">P3</Badge>, chu: 'P3' },
  { gt: 'P4', nhan: <Badge variant="outline">P4</Badge>, chu: 'P4' },
]

/** Loại lỗi: Badge viền xám + chấm màu theo nhóm (preview InlineEdit, menu loại lỗi). */
const LOI = (
  [
    ['Main', 'discovery'],
    ['Rò rỉ nước', 'info'],
    ['Chất lượng nước', 'success'],
    ['App', 'warning'],
    ['Chưa phân loại', undefined],
  ] as const
).map(([ten, mau]) => ({
  gt: ten,
  chu: ten,
  nhan: (
    <Badge variant="outline" title={`Loại lỗi: ${ten}`}>
      <BadgeDot color={mau} />
      {ten}
    </Badge>
  ),
})) satisfies MucNhan[]

/** Trạng thái ticket (preview: Mới discovery · Đang xử lý info · Chờ warning · Chờ KH xác nhận xám · Đóng success · Huỷ xám). */
const TT: MucTrangThai[] = [
  { gt: 'moi', nhan: 'Mới', color: 'discovery' },
  { gt: 'xu-ly', nhan: 'Đang xử lý', color: 'info' },
  { gt: 'cho', nhan: 'Chờ', color: 'warning', hoiLyDo: true },
  { gt: 'cho-kh', nhan: 'Chờ KH xác nhận' },
  { gt: 'dong', nhan: 'Đóng', color: 'success' },
  { gt: 'huy', nhan: 'Huỷ' },
]

/** 12 nhân viên giả (> 10 → ô người bắt buộc gõ để tìm). Mã NV tự đặt. */
const NGUOI: MucChon[] = ['Hiệp', 'Hiền', 'Kiều Trang', 'Tuyết Trang', 'Như', 'Tuấn', 'Lan', 'Mai', 'Nam', 'Oanh', 'Phúc', 'Quang'].map(
  (nhan, i) => ({ gt: `NV${String(i + 1).padStart(2, '0')}`, nhan }),
)

const KHACH_SEN_VANG = KHACH_DEMO.find((k) => k.ma === 'KH-01036')!

/** Ô khách như preview: tên + cờ lưu ý + số lần khách hỏi lại (thuộc ticket — bên gọi vẽ qua `children`). */
function TenKhach({ k, hoiLai }: { k: BanGhi | null; hoiLai?: number }) {
  return (
    <span className={khach}>
      <span data-so="ten-khach" className={cat}>
        {k?.ten ?? '—'}
      </span>
      {k?.luuY && (
        <span data-so="luu-y" role="img" aria-label="Khách có lưu ý" title="Khách có thẻ lưu ý — phải đọc" className={luuY}>
          <WarningCircle weight="fill" aria-hidden="true" />
        </span>
      )}
      {!!hoiLai && (
        // `.b-hoilai`: 12px 500 số thẳng cột, màu warning, icon 13 (bundle.css gõ 13px), cách 2.
        <span
          data-so="hoi-lai"
          role="img"
          aria-label={`Khách hỏi lại ${hoiLai} lần`}
          title={`Khách đã hỏi lại ${hoiLai} lần`}
          className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium tabular-nums text-(--color-text-warning) [&>svg]:size-[13px]"
        >
          <ArrowCounterClockwise aria-hidden="true" />
          {hoiLai}
        </span>
      )}
    </span>
  )
}

/** Một bộ 5 ô của preview (ưu tiên · loại lỗi · trạng thái · chủ (gọn) · khách), state riêng. `so` = tiền tố data-so. */
function BoO({ so }: { so: string }) {
  const [uu, setUu] = useState('P1')
  const [loi, setLoi] = useState('Rò rỉ nước')
  const [tt, setTt] = useState<GiaTriTrangThai>({ tt: 'moi' })
  const [chu, setChu] = useState<string | null>('NV02')
  const [kh, setKh] = useState<BanGhi | null>(KHACH_SEN_VANG)
  return (
    <>
      <span data-so={`${so}-uu`} className="inline-flex border-none border-current">
        <OSuaNhan ma={MA} truong="ưu tiên" value={uu} muc={UU} onLuu={setUu} />
      </span>
      <span data-so={`${so}-loi`} className="inline-flex border-none border-current">
        <OSuaNhan ma={MA} truong="loại lỗi" value={loi} muc={LOI} onLuu={setLoi} rong />
      </span>
      <span data-so={`${so}-tt`} className="inline-flex border-none border-current">
        <OSuaTrangThai ma={MA} value={tt} muc={TT} onLuu={setTt} />
      </span>
      <span data-so={`${so}-chu`} className="inline-flex border-none border-current">
        <OSuaNguoi ma={MA} truong="chủ ticket" value={chu} options={NGUOI} onLuu={setChu} gon />
      </span>
      <span data-so={`${so}-khach`} className="inline-flex border-none border-current">
        <OSuaKhach ma={MA} value={kh} muc={KHACH_DEMO} onLuu={setKh}>
          <TenKhach k={kh} hoiLai={1} />
        </OSuaKhach>
      </span>
    </>
  )
}

/** `.ui-caption`: 12/18 muted. */
function Caption({ children }: { children: ReactNode }) {
  return <span className="border-none border-current text-[12px] leading-[18px] text-muted-foreground">{children}</span>
}

/**
 * #inline-edit — tái tạo ds/nguon/components/InlineEdit/preview.html: nhãn + lưới 120 + 5 cột tự co (khoảng 12 dọc / 28
 * ngang), ba hàng Thường / Hover / Sửa chữ. Ô ở hai hàng đầu là ô THẬT (bấm mở menu / pop); hàng Hover cần rê chuột thật
 * (cổng so khớp đo hover bằng chuột CDP trên hàng Thường). Hai menu tĩnh của preview (trạng thái, loại lỗi) đo trên menu
 * mở thật từ ô. Khoá: ds/so-khop/inlineedit.json.
 */
export function KhoiInlineEdit() {
  return (
    <section id="inline-edit" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#inline-edit">InlineEdit</a>
      </h2>
      <div className="border-none border-current">
        <p className="mb-2 border-none border-current text-[12px] leading-[16px] font-medium text-muted-foreground">
          Các kiểu ô — thường / hover / đang sửa chữ
        </p>
        {/* `.ds-cuon.ds-muc`: cuộn ngang, đệm dưới 6, lề dưới 28. */}
        <div className="mb-7 overflow-x-auto pb-1.5 border-none border-current">
          <div
            data-so="luoi"
            className="grid w-max grid-cols-[120px_repeat(5,auto)] items-center justify-start gap-x-7 gap-y-3 border-none border-current"
          >
            <Caption>Thường</Caption>
            <BoO so="o" />
            <Caption>Hover</Caption>
            <BoO so="h" />
            <Caption>Sửa chữ</Caption>
            <div className="col-span-5 border-none border-current">
              <Input data-so="o-nhap" aria-label="Việc tiếp theo" defaultValue="Báo KT trưởng, xếp lịch trong ngày" className={oSuaInput} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Dong({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-6 border-none border-current">{children}</div>
}

/** #inline-edit dạng hàng (/ds): mỗi kiểu ô một hàng, ô thật — bấm để sửa, toast Hoàn tác đáy màn. */
export function KhoiInlineEditHang() {
  const [uu, setUu] = useState('P2')
  const [loi, setLoi] = useState('Chất lượng nước')
  const [tt, setTt] = useState<GiaTriTrangThai>({ tt: 'cho', lyDo: 'vật tư' })
  const [viec, setViec] = useState('Báo KT trưởng, xếp lịch trong ngày')
  const [han, setHan] = useState('2026-11-21 17:00')
  const [lam, setLam] = useState<string | null>('NV03')
  const [chu, setChu] = useState<string | null>('NV02')
  const [kh, setKh] = useState<BanGhi | null>(KHACH_SEN_VANG)
  return (
    <KhoiHang neo="inline-edit">
      <BienThe ten="Nhãn" moTa="Ưu tiên, loại lỗi: bấm nhãn mở menu chọn, mục đang chọn có ✓. Rê chuột: viền nhẹ ngay trên nhãn, không nền ô.">
        <Dong>
          <OSuaNhan ma={MA} truong="ưu tiên" value={uu} muc={UU} onLuu={setUu} />
          <OSuaNhan ma={MA} truong="loại lỗi" value={loi} muc={LOI} onLuu={setLoi} rong />
        </Dong>
      </BienThe>
      <BienThe ten="Trạng thái" moTa="Tag có ▾ bên trong. Chọn “Chờ” phải chọn thêm lý do: khách, KT, vật tư, hãng, duyệt.">
        <OSuaTrangThai ma={MA} value={tt} muc={TT} onLuu={setTt} />
      </BienThe>
      <BienThe ten="Chữ" moTa="Bấm thành ô nhập ngay tại chỗ. Enter lưu, Esc huỷ, bấm ra ngoài cũng lưu.">
        <div className="max-w-[280px] border-none border-current">
          <OSuaChu ma={MA} truong="việc tiếp theo" value={viec} onLuu={setViec} />
        </div>
      </BienThe>
      <BienThe ten="Hạn" moTa="Bấm mở lịch, chọn ngày mới — giữ nguyên giờ cũ.">
        <OSuaHan ma={MA} value={han} onLuu={setHan} />
      </BienThe>
      <BienThe ten="Người" moTa="Danh sách trên 10 người nên gõ để tìm (không dấu). Cột hẹp chỉ hiện avatar.">
        <Dong>
          <OSuaNguoi ma={MA} truong="người làm" value={lam} options={NGUOI} onLuu={setLam} />
          <OSuaNguoi ma={MA} truong="chủ ticket" value={chu} options={NGUOI} onLuu={setChu} gon />
        </Dong>
      </BienThe>
      <BienThe ten="Khách" moTa="Mở bảng chọn khách đủ thông tin phân biệt (xem RecordPicker).">
        <OSuaKhach ma={MA} value={kh} muc={KHACH_DEMO} onLuu={setKh}>
          <TenKhach k={kh} hoiLai={1} />
        </OSuaKhach>
      </BienThe>
      <BienThe ten="Lưu lỗi" moTa="Máy chủ báo lỗi (demo luôn lỗi): ô trả về giá trị cũ, báo lỗi có nút Thử lại.">
        <OSuaNhan
          ma="TK-DEMO-LOI"
          truong="ưu tiên"
          value="P3"
          muc={UU}
          onLuu={async () => {
            await new Promise((r) => setTimeout(r, 400))
            throw new Error('máy chủ demo từ chối')
          }}
        />
      </BienThe>
    </KhoiHang>
  )
}
