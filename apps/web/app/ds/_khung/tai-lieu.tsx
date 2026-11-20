import { existsSync } from 'node:fs'
import path from 'node:path'
import { CaretRight } from '@phosphor-icons/react/ssr'
import { CHU } from './chu'
import { Md } from './md'
import { chiaMuc, docNguon, neoTieuDe, TAI_LIEU } from './readme'

/** Neo tiêu đề (`h2 > a`): vòng focus DS thay outline mặc định trình duyệt — như khối /ds. */
const NEO = 'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

/** Trang chữ: các mục README dự án theo `TAI_LIEU[slug]`; mục trùng tên trang không lặp tiêu đề. */
export function TrangTaiLieu({ slug }: { slug: keyof typeof TAI_LIEU }) {
  const { tieuDe, muc } = TAI_LIEU[slug]
  const ds = chiaMuc(docNguon('README.md')).muc
  return (
    <article>
      <h1 className={`m-0 mb-4 ${CHU.h1}`}>{tieuDe}</h1>
      {muc.map((ten) => (
        <section key={ten} id={neoTieuDe(ten)} className="scroll-mt-6">
          {ten !== tieuDe && (
            <h2 className={`mt-10 mb-2 ${CHU.h2}`}>
              <a href={`#${neoTieuDe(ten)}`} className={NEO}>
                {ten}
              </a>
            </h2>
          )}
          <Md md={ds.get(ten) ?? ''} />
        </section>
      ))}
    </article>
  )
}

/** "Hướng dẫn dùng" thu gọn dưới khối /ds — README component của artifact (chưa có file thì không hiện). */
export function HuongDan({ ten }: { ten: string }) {
  const rel = `components/${ten}/README.md`
  if (!existsSync(path.join(process.cwd(), 'ds/nguon', rel))) return null
  return (
    <details className="group mt-4 rounded-xl border border-(--border)">
      {/* summary flex → mất tam giác mặc định → caret Phosphor 16 xoay khi mở. */}
      <summary className="flex h-(--control-size-md) cursor-pointer list-none items-center gap-2 rounded-xl px-3 text-[14px] leading-[20px] font-medium hover:bg-(--alpha-04) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
        <CaretRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none" />
        Hướng dẫn dùng {ten}
      </summary>
      <div className="border-t border-(--border) px-4 pb-2">
        <Md md={docNguon(rel)} nho />
      </div>
    </details>
  )
}
