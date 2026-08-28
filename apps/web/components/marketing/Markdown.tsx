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

/** Render markdown của `rules/*.md` và các trang wiki. Không cho HTML thô đi qua. */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
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
