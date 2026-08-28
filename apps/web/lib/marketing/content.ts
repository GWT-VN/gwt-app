import { LUAT_QC, QUY_TRINH } from "./data/noi-dung";

/**
 * Nội dung wiki lấy từ repo **GWT Marketing Kit** (repo KHÁC), nhúng sẵn thành TS bởi:
 *
 *     npm --prefix apps/web run sync:marketing
 *
 * Cố ý KHÔNG đọc `fs` lúc chạy: Turbopack không truy vết tĩnh được `fs.readFileSync`,
 * nó cảnh báo "whole project was traced" và không bảo đảm file .md được đóng gói lên
 * Vercel — tức là trang luật có thể trắng trơn trên production mà local vẫn chạy tốt.
 *
 * Sửa luật thì sửa BÊN REPO MARKETING KIT rồi chạy lại lệnh trên. Đừng sửa
 * `data/noi-dung.ts` hay `content/marketing/` — lần đồng bộ sau ghi đè.
 */

/** Mô tả một dòng cho từng file luật — hiện trên thẻ ở trang danh sách. */
export const RULE_BLURB: Record<string, string> = {
  "ad-compliance-vn":
    "Luật quảng cáo VN (5 kênh) — cấm nói như thuốc/chữa bệnh, “số 1/tốt nhất”, so sánh đối thủ thiếu căn cứ. Thắng mọi rule khác.",
  "nguon-dan-chung":
    "Chuẩn nguồn dẫn chứng (hạng A/B/C/D) — mọi con số phải có nguồn. Gồm cả rule transcript tự động = hạng C với mọi con số.",
  "claim-can-chung-nhan":
    "Claim cần chứng nhận + nguyên tắc phát ngôn cho người đứng trước camera.",
  "video-ads-general":
    "Rule chung mọi video chạy ads — hook 1–3s → highlight 20–30s → nội dung chính → CTA có lý do cụ thể.",
  "video-loc-tong":
    "Video lọc tổng (POE): KHÔNG nêu mã bộ (WH15A…), chỉ nói giải pháp lọc tổng GE. Bán kết quả đo được.",
  "_adlaw-from-notebook":
    "Bản trích nguyên văn điều khoản luật QC từ NotebookLM — tài liệu nền của ad-compliance-vn.",
};

export type RuleDoc = { slug: string; title: string; blurb: string };

function titleOf(md: string, slug: string): string {
  const h1 = md.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].replace(/[#*`]/g, "").trim() : slug;
}

export function listRules(): RuleDoc[] {
  return Object.entries(LUAT_QC)
    .map(([slug, md]) => ({ slug, title: titleOf(md.slice(0, 2000), slug), blurb: RULE_BLURB[slug] ?? "" }))
    .sort((a, b) => {
      // ad-compliance-vn luôn đứng đầu (thắng mọi rule khác), file phụ trợ `_` xuống cuối.
      const w = (s: string) => (s === "ad-compliance-vn" ? 0 : s.startsWith("_") ? 2 : 1);
      return w(a.slug) - w(b.slug) || a.slug.localeCompare(b.slug, "vi");
    });
}

export function readRule(slug: string): string | null {
  return LUAT_QC[slug] ?? null;
}

/* ---------- Quy trình sản xuất ---------- */

/** Tên file gốc có dấu + khoảng trắng → slug URL sạch. */
export const PROCESS_DOCS: { slug: string; file: string; title: string; blurb: string }[] = [
  {
    slug: "chuan-bi-quay",
    file: "Quy trình chuẩn bị quay video ",
    title: "Chuẩn bị quay video",
    blurb: "6 bước từ lên ý tưởng → khảo sát địa điểm/thiết bị → chốt lịch → soạn đồ → ngày quay → backup source.",
  },
  {
    slug: "editor-ngoai",
    file: "Quy-trinh-editor-ngoai",
    title: "Làm việc với editor ngoài",
    blurb:
      "7 bước: chốt đề bài & hook → chọn source → voiceover → dựng edit flow → đóng gói brief → revise theo 7 yếu tố → thanh toán.",
  },
];

export function readProcessDoc(slug: string): string | null {
  const doc = PROCESS_DOCS.find((d) => d.slug === slug);
  if (!doc) return null;
  // Tên file gốc có khoảng trắng cuối — dò cả hai kiểu cho chắc.
  return QUY_TRINH[doc.file] ?? QUY_TRINH[doc.file.trim()] ?? null;
}
