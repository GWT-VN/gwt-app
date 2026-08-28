import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * File nguồn viết link theo đường dẫn repo (`../rules/x.md`) — đổi sang route của wiki
 * để bấm trong web không bị 404. Link không khớp thì giữ nguyên.
 */
function rewriteHref(href?: string): string | undefined {
  if (!href) return href;
  const rule = href.match(/rules\/([a-z0-9_-]+)\.md$/i);
  if (rule) return `/wiki/marketing/luat/${rule[1]}`;
  const proc = href.match(/Quy-trinh-editor-ngoai\.md$/i);
  if (proc) return "/wiki/marketing/khung/quy-trinh/editor-ngoai";
  return href;
}

/**
 * Slug của một tiêu đề — PHẢI khớp y hệt `slugTieuDe()` trong
 * tools/scripts/sync-wiki-sanpham.mjs.
 *
 * Script đó gỡ mấy thẻ neo `<a id="q26"></a>` trong PKB (react-markdown không hiểu HTML
 * thô nên in nguyên văn ra màn hình) và viết lại link mục lục sang slug tiêu đề. Hàm này
 * là đầu kia của giao kèo: nó đặt đúng cái `id` ấy lên thẻ heading. Lệch nhau là 144 link
 * mục lục Q1–Q40 trỏ vào hư không. Có test chốt: lib/wiki/wiki.test.ts.
 */
export function slugTieuDe(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Gom chữ trong cây con của heading để tạo slug (heading có thể chứa `**`, `code`…). */
function chuCua(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(chuCua).join("");
  if (typeof node === "object" && "props" in node) {
    return chuCua((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/** Render markdown của `rules/*.md` và các trang wiki. Không cho HTML thô đi qua. */
export default function Markdown({ children }: { children: string }) {
  // Heading tự mang `id` = slug của chính nó, để link `](#...)` trong tài liệu nhảy đúng chỗ.
  const heading = (Tag: "h1" | "h2" | "h3" | "h4") =>
    function H({ children }: { children?: ReactNode }) {
      return <Tag id={slugTieuDe(chuCua(children))}>{children}</Tag>;
    };

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: heading("h1"),
          h2: heading("h2"),
          h3: heading("h3"),
          h4: heading("h4"),
          a: ({ href, children }) => {
            const to = rewriteHref(href);
            const external = to?.startsWith("http");
            return (
              <a href={to} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
