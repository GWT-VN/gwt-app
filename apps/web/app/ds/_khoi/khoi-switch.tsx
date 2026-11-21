import { Switch, SwitchRow } from '@/components/ui/switch'
import { BienThe, KhoiHang } from '../_khung/tam'

/** 3 hàng cài đặt — dùng chung cho KhoiSwitch (so khớp, /ds/tron) và KhoiSwitchHang (/ds). */
function NhomCaiDat() {
  return (
    // border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền.
    <div className="flex max-w-[520px] flex-col gap-4 border-none border-current">
      <SwitchRow data-so="hang-1" nhan="Báo người phụ trách ngay khi lưu" moTa="Tắt nếu chỉ lưu nháp.">
        <Switch data-so="bat" defaultChecked />
      </SwitchRow>
      <SwitchRow data-so="hang-2" nhan="Gửi email tóm tắt hằng ngày">
        <Switch data-so="tat" />
      </SwitchRow>
      <SwitchRow data-so="hang-3" nhan="Đồng bộ kho (quản trị khoá)">
        <Switch data-so="khoa" defaultChecked disabled />
      </SwitchRow>
    </div>
  )
}

/**
 * #switch — tái tạo ds/nguon/components/Switch/preview.html: cột gap 16 rộng tối đa 520 (style inline của preview),
 * 3 hàng cài đặt: bật + mô tả, tắt, bật nhưng khoá (disabled). Rê chuột / Tab thật mới thấy hover/focus (so khớp đo
 * bằng tương tác thật). Dữ liệu minh hoạ (demo). `data-so` = khoá so khớp (ds/so-khop/switch.json).
 */
export function KhoiSwitch() {
  return (
    <section id="switch" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#switch">Switch</a>
      </h2>
      <NhomCaiDat />
    </section>
  )
}

/** #switch dạng hàng (/ds): 3 trạng thái của công tắc trần + khuôn hàng cài đặt đầy đủ. */
export function KhoiSwitchHang() {
  return (
    <KhoiHang neo="switch">
      <BienThe ten="Đang bật" moTa="Có hiệu lực ngay, không cần bấm Lưu. Rê chuột / bấm Tab để thấy viền đổi.">
        <Switch defaultChecked aria-label="Công tắc bật (demo)" />
      </BienThe>
      <BienThe ten="Đang tắt">
        <Switch aria-label="Công tắc tắt (demo)" />
      </BienThe>
      <BienThe ten="Khoá (không bấm được)" moTa="Bị khoá do thiếu quyền hoặc do cài đặt chung — ghi lý do ở nhãn.">
        <Switch defaultChecked disabled aria-label="Công tắc khoá (demo)" />
      </BienThe>
      <BienThe ten="Hàng cài đặt" moTa="Nhãn + mô tả bên trái, công tắc bên phải; bấm cả hàng.">
        <NhomCaiDat />
      </BienThe>
      <BienThe ten="sm" moTa="size sm (shadcn): rãnh 24×14, núm 10 — trong bảng, dòng dày.">
        <div className="flex items-center gap-4 border-none border-current">
          <Switch size="sm" defaultChecked aria-label="Công tắc nhỏ bật (demo)" />
          <Switch size="sm" aria-label="Công tắc nhỏ tắt (demo)" />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
