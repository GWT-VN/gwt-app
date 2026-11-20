import { CaretRight } from '@phosphor-icons/react/ssr'
import { Md } from './md'
import { chiaMuc, docNguon, neoTieuDe, readmeComponent, TAI_LIEU } from './readme'
import { Muc, Tam, ThanMuc } from './tam'

/** Trang chữ: các mục README dự án theo `TAI_LIEU[slug]`, mỗi mục một `Muc`; mục trùng tên trang không lặp tiêu đề. */
export function TrangTaiLieu({ slug }: { slug: keyof typeof TAI_LIEU }) {
  const { tieuDe, muc } = TAI_LIEU[slug]
  const ds = chiaMuc(docNguon('README.md')).muc
  return (
    <Tam tieuDe={tieuDe}>
      {muc.map((ten) => (
        <Muc key={ten} id={neoTieuDe(ten)} tieuDe={ten !== tieuDe ? ten : undefined}>
          <ThanMuc className="[&>div>:first-child]:mt-0 [&>div>:last-child]:mb-0">
            <Md md={ds.get(ten) ?? ''} />
          </ThanMuc>
        </Muc>
      ))}
    </Tam>
  )
}

/**
 * Hàng cuối của mục component: "Hướng dẫn dùng" thu gọn — README component của artifact (chưa có file thì không hiện).
 * Là con trực tiếp của `Muc` (kẻ ngang 1px phía trên do Muc lo).
 */
export function HuongDan({ ten }: { ten: string }) {
  const md = readmeComponent(ten)
  if (!md) return null
  return (
    <details className="group">
      {/* summary flex → mất tam giác mặc định → caret Phosphor 16 xoay khi mở. */}
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-5 text-[14px] leading-[20px] font-medium hover:bg-(--alpha-04) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:px-8">
        <CaretRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none" />
        Hướng dẫn dùng {ten}
      </summary>
      <ThanMuc className="border-t border-(--border) pt-1">
        <Md md={md} nho />
      </ThanMuc>
    </details>
  )
}
