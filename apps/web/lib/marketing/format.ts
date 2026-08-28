/** Rút gọn số kiểu 1.2M / 33K — dùng chung cho bảng và drawer. */
export function fmt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 ? 1 : 0) + "K";
  return String(n);
}

export const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  douyin: "Douyin",
  instagram: "Instagram",
};

export const platformLabel = (p: string | null | undefined) =>
  (p && PLATFORM_LABEL[p.toLowerCase()]) || p || "—";

/** Chuẩn hoá tuyến 5A về A1–A5; giá trị lạ trả null để không vỡ badge màu. */
export function cat5a(v: string | null | undefined): string | null {
  const m = (v ?? "").toUpperCase().match(/A[1-5]/);
  return m ? m[0] : null;
}

/** Cột `metrics` là jsonb — lấy con số đại diện cho bảng. */
export function headlineMetric(m: Record<string, number | null> | null): number | null {
  if (!m) return null;
  for (const k of ["views", "view", "plays", "likes", "likes_reactions", "reactions"]) {
    const v = m[k];
    if (typeof v === "number") return v;
  }
  const first = Object.values(m).find((v) => typeof v === "number");
  return typeof first === "number" ? first : null;
}

export const METRIC_LABEL: Record<string, string> = {
  views: "views",
  likes: "likes",
  likes_reactions: "reactions",
  reposts: "reposts",
  shares: "shares",
  comments: "comments",
  saves: "saves",
};
