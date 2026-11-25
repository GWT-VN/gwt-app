// chép từ GWT-ERP lib/chatbot/kenh/pancake/so-cuoc.ts @c2f3719
/**
 * Sổ cuộc chat (spec docs/superpowers/specs/2026-10-20-chatbot-haiku-tu-tra-design.md §4e, đã chốt 2026-10-21): mỗi hội thoại
 * một sổ ngắn do Haiku tự tra cập nhật sau mỗi nháp — bot nhớ được phần hội thoại đã trôi khỏi 30 tin Pancake trả mỗi lần, và
 * thấy rõ việc gì GWT đã làm xong để không nhắc lại. Lưu ở `chatbot.pancake_conversations.so_cuoc` (jsonb ≤ 6000 ký tự).
 * Hàm thuần: che PII, bỏ trùng, cắt trần — sổ là chữ suy từ lời khách nên không bao giờ lưu nguyên văn.
 */
import { anPii } from "./an-pii.ts";

export type Goi = "anh" | "chị" | "anh/chị" | "cô" | "chú" | "bác" | "ông" | "bà" | "em";
export type XungHo = { goi: Goi; xung: "em" | "chau" };
export interface SoCuoc { nhu_cau: string; da_xong: string[]; con_mo: string[]; xung_ho?: XungHo }

const GOI: ReadonlySet<string> = new Set(["anh", "chị", "anh/chị", "cô", "chú", "bác", "ông", "bà", "em"]);
// Cách xưng hô lạ → bỏ khoá (không đoán).
const xungHo = (v: unknown): XungHo | undefined => {
  const o = v && typeof v === "object" ? (v as Record<string, unknown>) : null;
  return o && typeof o.goi === "string" && GOI.has(o.goi) && (o.xung === "em" || o.xung === "chau") ? { goi: o.goi as Goi, xung: o.xung } : undefined;
};

const TRAN_NHU_CAU = 500;
const TRAN_MUC = 200;
const TOI_DA_XONG = 12;
const TOI_DA_MO = 6;
const TRAN_JSON = 5800; // CHECK DB 6000 trên jsonb::text — chừa chỗ cho dấu thoát

const chu = (v: unknown, n: number) =>
  typeof v === "string" ? [...anPii(v).replace(/\s+/g, " ").trim()].slice(0, n).join("").toWellFormed() : "";
// Giữ mục MỚI nhất khi quá trần (model ghi cũ → mới).
const ds = (v: unknown, toiDa: number) =>
  Array.isArray(v) ? [...new Set(v.map((s) => chu(s, TRAN_MUC)).filter(Boolean))].slice(-toiDa) : [];

/**
 * Nháp chưa gửi KHÔNG phải việc đã xong (đo 2026-10-22: 33/37 sổ của cuộc chưa từng có NV trả lời ghi "đã báo giá…" — model chép
 * câu nháp của chính nó vào "Đã xong", lượt sau tưởng đã gửi nên không trả lời). `coViecMoi` = từ lần ghi sổ trước có tin GWT mới;
 * không có thì "Đã xong" giữ nguyên bản cũ, mục model vừa thêm bị bỏ.
 */
export const giuDaXong = (cu: SoCuoc | null | undefined, moi: SoCuoc, coViecMoi: boolean): SoCuoc =>
  coViecMoi ? moi : { ...moi, da_xong: cu?.da_xong ?? [] };

/** Đầu ra model / dòng DB → sổ sạch; rỗng hết hoặc sai dạng → null (= chưa có sổ). */
export function chuanSoCuoc(x: unknown): SoCuoc | null {
  if (!x || typeof x !== "object" || Array.isArray(x)) return null;
  const o = x as Record<string, unknown>;
  const xh = xungHo(o.xung_ho);
  const so: SoCuoc = { nhu_cau: chu(o.nhu_cau, TRAN_NHU_CAU), da_xong: ds(o.da_xong, TOI_DA_XONG), con_mo: ds(o.con_mo, TOI_DA_MO), ...(xh ? { xung_ho: xh } : {}) };
  while (JSON.stringify(so).length > TRAN_JSON && so.da_xong.length) so.da_xong.shift();
  return so.nhu_cau || so.da_xong.length || so.con_mo.length ? so : null;
}
