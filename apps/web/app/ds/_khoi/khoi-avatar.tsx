import { Avatar, AvatarFallback, chuCaiDau } from '@/components/ui/avatar'

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
        <Avatar data-so="md"><AvatarFallback>{chuCaiDau('chị Hiền')}</AvatarFallback></Avatar>
        <Avatar data-so="md-2"><AvatarFallback>{chuCaiDau('Kim Thoa')}</AvatarFallback></Avatar>
        <Avatar data-so="sm" size="sm"><AvatarFallback>{chuCaiDau('anh Thanh Tùng')}</AvatarFallback></Avatar>
        {/* .ui-caption (bundle.css): 12px/18px muted — avatar bên trong kế thừa line-height 18px như artifact */}
        <span className="text-[12px] leading-[18px] text-muted-foreground">
          Kèm tên:{' '}
          {/* preview: .ui-row style="display:inline-flex;gap:6px;align-items:center" */}
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Avatar data-so="ten"><AvatarFallback>{chuCaiDau('Hiền')}</AvatarFallback></Avatar> Hiền
          </span>
        </span>
      </div>
    </section>
  )
}
