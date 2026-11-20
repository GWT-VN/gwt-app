import { Switch, SwitchRow } from '@/components/ui/switch'

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
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
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
    </section>
  )
}
