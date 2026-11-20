import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CHU } from './chu'

// Bảng: khung radius-xl 12 + viền `border` (README "khung bảng radius-xl"); nhãn cột 12/18 muted-foreground.
// Màn hẹp: mã token trong ô không ngắt ở dấu gạch (ra "--" một dòng) — bảng cuộn ngang trong khung.
const O = 'px-3 py-2 text-left align-top'
const CHU_MD: Components = {
  h2: ({ children }) => <h3 className={`mt-6 mb-2 ${CHU.h3}`}>{children}</h3>,
  h3: ({ children }) => <h3 className={`mt-6 mb-2 ${CHU.h3}`}>{children}</h3>,
  p: ({ children }) => <p className="my-3 max-w-[72ch]">{children}</p>,
  ul: ({ children }) => <ul className="my-3 max-w-[72ch] list-disc space-y-1.5 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 max-w-[72ch] list-decimal space-y-1.5 pl-6">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} className="underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded-xs bg-muted px-1 py-px [font:var(--text-code-sm)] break-words">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-md bg-muted p-3 [font:var(--text-code-sm)] [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-(--border) max-md:[&_td_code]:whitespace-nowrap">
      <table className={`w-full border-collapse ${CHU.sm}`}>{children}</table>
    </div>
  ),
  // Tách lẻ cỡ/dòng (y `.ui-sidebar-label` 12/18) — shorthand `font:` mang weight 400 sẽ giành với font-medium.
  th: ({ children }) => <th className={`${O} text-[12px] leading-[18px] font-medium text-muted-foreground`}>{children}</th>,
  td: ({ children }) => <td className={`${O} border-t border-(--border)`}>{children}</td>,
}

/** Markdown của artifact (README) với kiểu DS. Đoạn văn 16/24 (README "text-md cho đoạn văn"); `nho` = 14/20. Server component — đọc file bằng fs ở trang gọi. */
export function Md({ md, nho }: { md: string; nho?: boolean }) {
  return (
    <div className={nho ? CHU.sm : CHU.md}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={CHU_MD}>
        {md}
      </ReactMarkdown>
    </div>
  )
}
