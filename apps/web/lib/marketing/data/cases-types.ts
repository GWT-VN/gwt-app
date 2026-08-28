/** Kiểu dữ liệu cho kho case WIN/FAIL — dùng chung cho VCB, Elation và các kênh tham khảo. */

export type Verdict = "win" | "fail" | "fix" | "drop" | "ref";

export const VERDICT_LABEL: Record<Verdict, string> = {
  win: "WIN",
  fail: "FAIL",
  fix: "SỬA ĐƯỢC",
  drop: "BỎ",
  ref: "THAM KHẢO",
};

export type Metric = { label: string; value: string };
export type PaastRow = { k: "P" | "A1" | "A2" | "S" | "T"; label: string; text: string };

export type CaseStudy = {
  slug: string;
  /** Mã trong biên bản gốc: V1, F3, S2, E4, R2… */
  code: string;
  brand: "VCB" | "Elation" | "Tham khảo";
  brandFull: string;
  title: string;
  verdict: Verdict;
  /** Kết quả một dòng, vd "116k view — WIN". */
  verdictNote: string;
  buoi: string;
  /** Con số công khai trong buổi (view, avg watch, tương tác, follow, điểm PAAST). */
  metrics?: Metric[];
  paastScore?: string;
  /** 1–2 câu cho thẻ ở trang danh sách. */
  summary: string;
  /** Nội dung video kể gì. */
  story?: string;
  /** Chấm theo từng chữ PAAST. */
  paast?: PaastRow[];
  worked?: string[];
  failed?: string[];
  /** Lời CEO Thiện trong buổi — giữ sát ý gốc. */
  thien?: string[];
  fix?: string[];
  /** Rút ra gì áp được cho GWT (máy lọc nước). */
  gwt: string;
  /** Tên luật liên quan trong trang Luật sửa content. */
  laws?: string[];
};

export const PAAST_NAME: Record<PaastRow["k"], string> = {
  P: "P — Prefer",
  A1: "A — Action",
  A2: "A — Acknowledge",
  S: "S — Stick",
  T: "T — Trust",
};
