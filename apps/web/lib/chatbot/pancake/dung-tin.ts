// chép từ GWT-ERP lib/chatbot/kenh/pancake/tu-gui.ts @c2f3719 (tachDoan, inDamUnicode, tenGoi, coHotline, CAU_HO_TRO);
// kieuMo / dungTinGui là phần mới của gwt-app (spec §6.6): chào / giới thiệu / "Dạ <gọi> <tên>," theo trạng thái hội thoại.
import type { TinPancake } from "./doc.ts";
import { CAU_GIOI_THIEU, coCauBao, DAU_BOT, laNhanVien, laTinBot } from "./loc.ts";
import type { SoCuoc, XungHo } from "./so-cuoc.ts";

export type KieuMo = "gioi_thieu" | "chao" | "da";
const SAU_GIO = 6 * 3600_000;

/** Chưa có câu giới thiệu trong hội thoại, hoặc sổ cuộc đã hết hạn (null) → giới thiệu lại; tin GWT/bot gần nhất cũ > 6 giờ → chào; còn lại "Dạ". */
export function kieuMo(tin: TinPancake[], now: Date, soCuoc: SoCuoc | null): KieuMo {
  if (!soCuoc || !tin.some((t) => coCauBao(`${t.original_message ?? ""}${t.message ?? ""}`))) return "gioi_thieu";
  const moi = Math.max(...tin.filter((t) => laTinBot(t) || laNhanVien(t.from)).map((t) => Date.parse(t.inserted_at)));
  return now.getTime() - moi > SAU_GIO ? "chao" : "da";
}

/** Câu trả lời đã có hotline (khách xin hotline) → không thêm câu hỗ trợ nhắc lại hotline. */
const coHotline = (traLoi: string, hotline: string) => {
  const so = hotline.replace(/\D/g, "");
  return Boolean(so) && traLoi.replace(/(\d)[ .](?=\d)/g, "$1").includes(so);
};

/** Tên Facebook để chào: bỏ emoji / ký hiệu, chữ kiểu (𝐀) về chữ thường (NFKC). Có số, link, @, không còn chữ cái, hay dài quá 30 ký tự → null. */
export function tenGoi(ten: string | null | undefined): string | null {
  const s = (ten ?? "").normalize("NFKC");
  if (/\d|https?:|www\.|@/i.test(s)) return null;
  const sach = s.replace(/[^\p{L}\p{M}' .-]/gu, " ").replace(/\s+/g, " ").trim();
  return /\p{L}/u.test(sach) && [...sach].length <= 30 ? sach : null;
}

export const CAU_HO_TRO = (hotline: string, hoiSo: boolean, goi = "anh/chị") => (hoiSo
  ? `Nếu ${goi} cần tư vấn kỹ hơn có thể để lại SĐT để được chuyên gia liên hệ hỗ trợ ạ. Hoặc nếu cần hỗ trợ nhanh hơn ${goi} có thể gọi hotline ${hotline} ạ.`
  : `Nếu cần hỗ trợ nhanh hơn ${goi} có thể gọi hotline ${hotline} ạ.`);

/** Mỗi đoạn (cách nhau dòng trống) một tin như NV nhắn; dòng liền nhau (gạch đầu dòng "•") ở chung một tin. */
export function tachDoan(traLoi: string): string[] {
  return traLoi.trim().split(/\n\s*\n/).map((s) => s.trim())
    // Câu dẫn / tiêu đề kết ":" (kể cả "**Tiêu đề:**") đi liền phần dưới của nó.
    .reduce<string[]>((ds, s) => (ds.at(-1)?.replace(/\*+$/, "").endsWith(":") ? [...ds.slice(0, -1), `${ds.at(-1)}\n${s}`] : [...ds, s]), []);
}

const DAM_SO = 0x1d7ce, DAM_HOA = 0x1d400, DAM_THUONG = 0x1d41a;
/** Messenger không đọc markdown: "**…**" đổi sang chữ đậm Unicode. Chữ có dấu tách NFD rồi giữ dấu ghép; Đ/đ giữ nguyên. "**" lẻ bị bỏ. */
export function inDamUnicode(s: string): string {
  const dam = (t: string) => [...t.normalize("NFD")].map((c) => {
    const m = c.charCodeAt(0);
    if (c >= "0" && c <= "9") return String.fromCodePoint(DAM_SO + m - 48);
    if (c >= "A" && c <= "Z") return String.fromCodePoint(DAM_HOA + m - 65);
    if (c >= "a" && c <= "z") return String.fromCodePoint(DAM_THUONG + m - 97);
    return c;
  }).join("").normalize("NFC");
  return s.replace(/\*\*(.+?)\*\*/g, (_, t: string) => dam(t)).replaceAll("**", "");
}

const CHAO_GPT = /^(dạ\s*,?\s*)?(chào|xin chào)[^.!?\n]*[.!?]\s*/i;
const DA_DAU = /^dạ\s*,?\s*/i;

/** Mỗi tin kết "ạ" (trước dấu . ? ! cuối; không dấu thì thêm " ạ."). Tin dạng danh sách (• / -) là tiêu đề + gạch đầu dòng: giữ nguyên. */
function ketA(s: string): string {
  if (/^\s*[•-]\s/m.test(s)) return s;
  const m = /^([\s\S]*?)([.?!…]*)$/.exec(s.trimEnd())!;
  if (/ạ$/.test(m[1])) return s;
  return m[2] ? `${m[1]} ạ${m[2]}` : `${s.trimEnd()} ạ.`;
}

export function dungTinGui(
  traLoi: string,
  o: { kieu: KieuMo; xungHo: XungHo | null; tenKhach: string | null; hotline: string; hoiSo: boolean },
): string[] {
  const goi = o.xungHo?.goi ?? "anh/chị";
  const ten = tenGoi(o.tenKhach);
  const doan = tachDoan(traLoi);
  // Câu chào GPT lỡ viết ở đầu → bỏ (bot tự chào theo `kieu`).
  let dau = (doan[0] ?? "").replace(CHAO_GPT, "");
  if (o.kieu === "da") { // GPT mở bằng "Dạ" → bỏ để khỏi "Dạ anh Hùng, dạ …"; chữ đầu hạ thường vì nối sau dấu phẩy
    dau = dau.replace(DA_DAU, "");
    if (/^\p{Lu}\p{Ll}/u.test(dau)) dau = dau[0].toLowerCase() + dau.slice(1); // "Máy" → "máy"; "CTS20" giữ
  }
  const them = ten ? ` ${ten}` : "";
  const mo = o.kieu === "da" ? `Dạ ${goi}${them}, `
    : `Chào ${goi}${them}! ${o.kieu === "gioi_thieu" ? `${o.xungHo?.xung === "chau" ? "Cháu" : "Em"}${CAU_GIOI_THIEU.slice(2)} ạ. ` : ""}`;
  const dauTin = dau ? mo + ketA(dau) : o.kieu === "da" ? "" : mo.trim(); // GPT chỉ chào → còn đúng câu mở
  const tin = [dauTin, ...doan.slice(1).map(ketA)].filter(Boolean);
  if (o.kieu === "gioi_thieu" && !coHotline(traLoi, o.hotline)) tin.push(CAU_HO_TRO(o.hotline, o.hoiSo, goi));
  return tin.map((s) => `${inDamUnicode(s)}${DAU_BOT}`);
}
