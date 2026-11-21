import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, chuCaiDau } from '@/components/ui/avatar'
import { CHU } from '../_khung/chu'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiAvatar` (/ds/tron) và `KhoiAvatarHang` (/ds). */
const MD = (
  <>
    <Avatar data-so="md"><AvatarFallback>{chuCaiDau('chị Hiền')}</AvatarFallback></Avatar>
    <Avatar data-so="md-2"><AvatarFallback>{chuCaiDau('Kim Thoa')}</AvatarFallback></Avatar>
  </>
)
const SM = <Avatar data-so="sm" size="sm"><AvatarFallback>{chuCaiDau('anh Thanh Tùng')}</AvatarFallback></Avatar>
/* preview: .ui-row style="display:inline-flex;gap:6px;align-items:center" */
const KEM_TEN = (
  <span className="inline-flex flex-wrap items-center gap-1.5">
    <Avatar data-so="ten"><AvatarFallback>{chuCaiDau('Hiền')}</AvatarFallback></Avatar> Hiền
  </span>
)

/**
 * #avatar — tái tạo ds/nguon/components/Avatar/preview.html; `data-so` = khoá so khớp (ds/so-khop/avatar.json nhắm
 * `#avatar > div` → giữ nguyên cấu trúc DOM). Chữ cái sinh bằng `chuCaiDau` (H, KT, TT như preview).
 */
export function KhoiAvatar() {
  return (
    <section id="avatar" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#avatar">Avatar</a>
      </h2>
      {/* preview: .ui-row gap 12px */}
      <div className="flex flex-wrap items-center gap-3">
        {MD}
        {SM}
        {/* .ui-caption (bundle.css): 12px/18px muted — avatar bên trong kế thừa line-height 18px như artifact */}
        <span className="text-[12px] leading-[18px] text-muted-foreground">
          Kèm tên:{' '}
          {KEM_TEN}
        </span>
      </div>
    </section>
  )
}

/** #avatar dạng hàng cho /ds — mỗi cỡ một hàng + cách đặt cạnh tên. */
export function KhoiAvatarHang() {
  return (
    <KhoiHang neo="avatar">
      <BienThe ten='size="default"' moTa="22px — danh sách, người phụ trách. Chữ cái đầu lấy tự động từ tên người.">
        <div className="flex flex-wrap items-center gap-3">{MD}</div>
      </BienThe>
      <BienThe ten='size="sm"' moTa="20px — chỗ chật: ô bảng, chip.">
        <div className="flex flex-wrap items-center gap-3">{SM}</div>
      </BienThe>
      <BienThe ten="Kèm tên" moTa="Avatar đứng trước tên, cách 6px.">
        <span className={`${CHU.xs} text-muted-foreground`}>{KEM_TEN}</span>
      </BienThe>
      <BienThe ten='size="lg" · AvatarBadge' moTa="Phần shadcn, artifact chưa có: cỡ 28px; chấm trạng thái góc dưới phải.">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar size="lg" aria-hidden="true">
            <AvatarFallback>{chuCaiDau('chị Hiền')}</AvatarFallback>
            <AvatarBadge />
          </Avatar>
          <Avatar aria-hidden="true">
            <AvatarFallback>{chuCaiDau('Kim Thoa')}</AvatarFallback>
            <AvatarBadge />
          </Avatar>
        </div>
      </BienThe>
      <BienThe ten="AvatarGroup · AvatarGroupCount" moTa="Phần shadcn: nhóm chồng nhau 6px, ô +N cuối nhóm.">
        <AvatarGroup aria-label="Người theo dõi: Hiền, Thoa, Tùng và 2 người khác" role="img">
          <Avatar>
            <AvatarFallback>{chuCaiDau('chị Hiền')}</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>{chuCaiDau('Kim Thoa')}</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>{chuCaiDau('anh Thanh Tùng')}</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+2</AvatarGroupCount>
        </AvatarGroup>
      </BienThe>
    </KhoiHang>
  )
}
