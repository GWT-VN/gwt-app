import "server-only";
import { ALL_CASES } from "./data/cases";
import { LUAT_GROUPS } from "./data/luat-sua";
import { listRules, PROCESS_DOCS } from "./content";
import { NAV } from "./nav";
import type { SearchItem } from "@/components/marketing/Search";

/**
 * Chỉ mục tìm kiếm — chỉ TIÊU ĐỀ trang, luật QC, quy trình, luật sửa content và kho case.
 * Cố ý KHÔNG đưa dữ liệu Supabase vào: chỉ mục đi vào bundle client, mà dữ liệu đó là nội bộ.
 */
export function buildSearchIndex(): SearchItem[] {
  const pages: SearchItem[] = NAV.flatMap((g) =>
    g.items.map((i) => ({ href: i.href, title: i.label, kind: g.heading })),
  );
  const rules: SearchItem[] = listRules().map((r) => ({
    href: `/marketing/luat/${r.slug}`,
    title: r.title,
    kind: `Luật QC · rules/${r.slug}.md`,
  }));
  const process: SearchItem[] = PROCESS_DOCS.map((d) => ({
    href: `/marketing/khung/quy-trinh/${d.slug}`,
    title: d.title,
    kind: "Quy trình sản xuất",
  }));
  const luat: SearchItem[] = LUAT_GROUPS.flatMap((g) =>
    g.items.map((l) => ({ href: "/marketing/khung/luat-sua", title: l.t, kind: `Luật sửa content · ${g.g}` })),
  );
  const cases: SearchItem[] = ALL_CASES.map((c) => ({
    href: `/marketing/kho-case/${c.slug}`,
    title: c.title,
    kind: `Kho case · ${c.brand} · ${c.code}`,
  }));
  return [...pages, ...rules, ...process, ...luat, ...cases];
}
