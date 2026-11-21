import { Heart, ThumbsUp } from '@phosphor-icons/react/ssr'
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from '@/components/ui/bubble'
import { BienThe, KhoiHang } from '../_khung/tam'

const BIEN_THE = ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'] as const

function CacBienThe() {
  return (
    <>
      <BienThe ten="Biến thể" moTa="Đủ 7 variant shadcn. Bo 12 (radius-xl), đệm 12/8, chữ 14. Rộng tối đa 80% khung (ghost: 100%).">
        <BubbleGroup className="max-w-lg" data-so="bien-the">
          {BIEN_THE.map((v) => (
            <Bubble key={v} variant={v} data-so={v}>
              <BubbleContent>
                {v === 'destructive' ? 'Không gửi được tin — thử lại' : `Bong bóng ${v}`}
              </BubbleContent>
            </Bubble>
          ))}
        </BubbleGroup>
      </BienThe>
      <BienThe ten="Bên phải" moTa="align end: dạt phải (tin của mình). Đặt trong Message align end thì tự dạt.">
        <BubbleGroup className="max-w-lg">
          <Bubble variant="secondary" align="end">
            <BubbleContent>Em đã gửi báo giá BG-0001 qua email của anh.</BubbleContent>
          </Bubble>
        </BubbleGroup>
      </BienThe>
      <BienThe ten="Bấm được" moTa="BubbleContent asChild + button: rê đổi nền, focus phím vòng ring 2 lệch 2 như Button.">
        <BubbleGroup className="max-w-lg">
          <Bubble variant="outline">
            <BubbleContent asChild>
              <button type="button" data-so="nut">
                Gợi ý: Gửi báo giá mẫu B
              </button>
            </BubbleContent>
          </Bubble>
        </BubbleGroup>
      </BienThe>
      <BienThe ten="Cảm xúc" moTa="BubbleReactions dưới góc phải (mặc định) hoặc trên/trái; nền muted, vòng 3 màu card tách khỏi bong bóng.">
        <BubbleGroup className="max-w-lg gap-6 pt-3 pb-3">
          <Bubble variant="muted">
            <BubbleContent>Ok, gửi mình báo giá mẫu B nhé.</BubbleContent>
            <BubbleReactions aria-label="2 lượt thích" data-so="cam-xuc">
              <ThumbsUp aria-hidden className="size-3.5" />
              <span className="text-[12px] leading-[18px] tabular-nums">2</span>
            </BubbleReactions>
          </Bubble>
          <Bubble variant="secondary" align="end">
            <BubbleContent>Dạ em gửi ngay ạ.</BubbleContent>
            <BubbleReactions side="top" align="start" aria-label="1 lượt thả tim">
              <Heart aria-hidden className="size-3.5" />
            </BubbleReactions>
          </Bubble>
        </BubbleGroup>
      </BienThe>
    </>
  )
}

/** #bubble trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp. */
export function KhoiBubble() {
  return (
    <section id="bubble" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#bubble">Bubble</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #bubble dạng hàng (/ds). */
export function KhoiBubbleHang() {
  return (
    <KhoiHang neo="bubble">
      <CacBienThe />
    </KhoiHang>
  )
}
