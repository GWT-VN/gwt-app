// chép từ GWT-ERP lib/chatbot/kenh/pancake/loc.ts @c2f3719
import { anPii, coSdt } from "./an-pii.ts";
import type { HoiThoaiPancake, NguoiGui, TinPancake } from "./doc.ts";

/** Luật "khách đang chờ" (spec §3.3, đổi 2026-10-14 vì Botcake) + gom chữ tin khách — hàm thuần. */
export const TRAN_TIN = 4000;
const NHAN_MEDIA: Record<string, string> = { photo: "[ảnh]", image: "[ảnh]", video: "[video]", sticker: "[sticker]", audio: "[âm thanh]" };

type Gui = NguoiGui | null | undefined;

// Dấu tự động đo thật 2026-10-14 (Botcake: flow_id + source_type "rule" + app_id); ai_generated/is_automated cho AI/tự động khác.
export const laTuDong = (f: Gui): boolean =>
  Boolean(f && (f.flow_id || f.bot_id || f.broadcast_id || f.source_type || f.app_id || f.ai_generated === true || f.is_automated === true));

// Người thật trả lời qua Pancake: có admin_id/uid và không mang dấu tự động (Botcake cũng mang admin_id).
// `pageNgoai` = id page của kênh bật nvNgoaiPancake (Zalo cá nhân: nhân viên nhắn cả từ app, đo 2026-10-15) → tin từ chính
// page mà không mang dấu tự động cũng là nhân viên. Kênh có Botcake KHÔNG bật: ở đó tin page không dấu là thẻ/ảnh của flow.
export const laNhanVien = (f: Gui, pageNgoai?: string): boolean =>
  Boolean(f && !laTuDong(f) && (f.admin_id || f.uid || (pageNgoai !== undefined && f.id === pageNgoai)));

// Khách: không phải page, không admin, không tự động.
export const laKhach = (f: Gui, pageId?: string): boolean =>
  Boolean(f && !(f.admin_id || f.uid) && !(pageId && f.id === pageId) && !laTuDong(f));

/** Ký tự vô hình (U+2063) cuối MỌI tin bot tự gửi khách (tu-gui.ts) + câu mở đầu tin đầu hội thoại: nhận ra tin của chính bot. */
export const DAU_BOT = "⁣";
export const CAU_GIOI_THIEU = "Em là trợ lý ảo của máy lọc nước GE";
export const CAU_BAO_DAU = "Em là trợ lý tự động của máy lọc nước GE";
/** Câu báo cũ (tới 2026-10-23) — vẫn nhận, để hội thoại đã có câu cũ không bị chào lại. */
const CAU_BAO_CU = "em là trợ lý tự động của GWT";
export const coCauBao = (s: string) => s.includes(CAU_GIOI_THIEU) || s.includes(CAU_BAO_DAU) || s.includes(CAU_BAO_CU);
// ponytail: nhận tin bot bằng dấu vô hình trong chữ — nền tảng nào lột ký tự đó thì tin bot sau tin đầu trông như NV
// (thread ✅, 🧑‍💼 vẫn cần người `mẫu` mới vào học); đo ở lần gửi thật đầu tiên, hỏng thì lưu id tin đã gửi.
export const laTinBot = (t: TinPancake): boolean => {
  const s = `${t.original_message ?? ""}${t.message ?? ""}`;
  return s.includes(DAU_BOT) || coCauBao(s);
};

const TEP_HE_THONG = new Set(["system_message", "ad_click", "template"]);
// Zalo cá nhân (đo 2026-10-20): dòng kết bạn tới như tin khách thường, mang tên / lời chào người lạ — không phải câu hỏi, lọt PII.
// NV kết bạn trước (Zalo Care, đo 2026-10-28): "Bạn vừa gửi lời mời kết bạn tới SĐT: …" + "<tên> đã đồng ý kết bạn".
const CHU_HE_THONG = /^(?:Bạn vừa kết bạn với|Bạn nhận được lời mời kết bạn|Bạn vừa gửi lời mời kết bạn)|đã đồng ý kết bạn\.?$/u;
export const laTinHeThong = (t: TinPancake, pageNgoai?: string): boolean => laTinBot(t) ||
  (((t.attachments ?? []).some((a) => TEP_HE_THONG.has(a.type)) || CHU_HE_THONG.test(chuTin(t).normalize("NFC")))
  && !laNhanVien(t.from, pageNgoai));

// Bỏ cờ `seen` (Botcake tự bật). Tin cuối là Botcake / page không admin / khách đều là ứng viên: đọc tin (tinKhachDangCho) sẽ quyết.
export const dangCho = (h: HoiThoaiPancake, pageNgoai?: string): boolean => h.type === "INBOX" && !laNhanVien(h.last_sent_by, pageNgoai);

// Zalo cá nhân (đo 2026-10-15): nhắc tên ra dạng "@<mã số ~19 chữ số>" — mã không đọc được, chỉ làm rối bài và nháp.
const MA_NHAC_TEN = /@\d{12,}/g;

export function chuTin(t: TinPancake): string {
  // original_message là chữ thuần: chỉ gom khoảng trắng. Chỉ `message` (HTML) mới gỡ thẻ. Mỗi tin MỘT dòng — tinKhachDangCho
  // nối tin bằng "\n", bài Forum và nháp tách lại theo dòng.
  const goc = (t.original_message ?? "").replace(/\s+/g, " ").trim()
    || (t.message ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (goc) return goc.replace(MA_NHAC_TEN, "@…");
  // Object.hasOwn: tra thuộc tính của Object (constructor, toString…) không được lọt thành nhãn.
  return (t.attachments ?? []).map((a) => (Object.hasOwn(NHAN_MEDIA, a.type) ? NHAN_MEDIA[a.type] : "[tệp]")).join(" ");
}

/** `tin` xếp mới nhất trước. Dừng ở nhân viên thật; tin hệ thống / tự động / page không admin bỏ qua; chỉ tin khách được gom. */
const LOAI_ANH = new Set(["photo", "image"]);
export const TOI_DA_ANH = 4;

/** `anh` = link ảnh trong các tin khách chưa được trả lời, theo thứ tự thời gian, tối đa TOI_DA_ANH ảnh gần nhất (anh.ts tải).
 *  `sau` (ISO): chỉ gom tin gửi SAU mốc đó — 💬 chỉ đăng tin chưa lên thread (2026-10-16: lặp tin cũ làm thread khó đọc).
 *  `luc` = tin khách mới nhất, `dau` = tin khách cũ nhất được gom. */
export function tinKhachDangCho(tin: TinPancake[], pageId?: string, pageNgoai?: string, sau?: string): { text: string; luc: string; dau: string; anh: string[] } | null {
  const moc = sau ? Date.parse(sau) : -Infinity;
  const cuaKhach: TinPancake[] = [];
  for (const t of tin) {
    if (laTinBot(t)) continue; // bot tự gửi không phải NV đã trả lời: không cắt khối tin khách
    if (laNhanVien(t.from, pageNgoai)) break;
    if (!laTinHeThong(t, pageNgoai) && laKhach(t.from, pageId) && Date.parse(t.inserted_at) > moc) cuaKhach.push(t);
  }
  if (cuaKhach.length === 0) return null;
  const luc = cuaKhach[0].inserted_at; // tin KHÁCH mới nhất (tin[0] có thể là Botcake)
  const dau = cuaKhach[cuaKhach.length - 1].inserted_at;
  // Quá trần thì bỏ tin CŨ NHẤT trước — tin mới nhất là thứ cần trả lời (trước 2026-10-15 cắt từ đầu, mất tin mới). Cắt theo
  // code point: slice UTF-16 có thể chẻ đôi emoji. text có thể là "": bên gọi lùi về snippet.
  const dong = cuaKhach.reverse().map(chuTin).filter(Boolean);
  while (dong.length > 1 && [...dong.join("\n")].length > TRAN_TIN) dong.shift();
  const text = [...dong.join("\n")].slice(0, TRAN_TIN).join("");
  const anh = cuaKhach.flatMap((t) => (t.attachments ?? []).filter((a) => LOAI_ANH.has(a.type)).map((a) => a.url ?? a.origin_url ?? ""))
    .filter(Boolean).slice(-TOI_DA_ANH);
  return { text, luc, dau, anh };
}

// Nới 2026-10-20: nháp chạy model ngữ cảnh lớn (claude-…) — đọc đủ cuộc để hiểu khách quan tâm gì rồi mới chọn câu trả lời.
// Model nhỏ (Ollama 4096) thì ban-thu.ts cắt lại còn 10 dòng ngắn. ponytail: chỉ một trang tin Pancake (GET không phân trang).
const TOI_DA_LICH_SU = 40;
const TRAN_DONG_LICH_SU = 600;
const TRAN_LICH_SU = 12_000;
const TRAN_MAC_DINH = { dong: TOI_DA_LICH_SU, kyTu: TRAN_LICH_SU };
/** Chưa có sổ cuộc chat: đọc lùi tới 90 tin một lần để dựng sổ cho đủ (so-cuoc.ts, đã chốt 2026-10-21). */
export const TRAN_DUNG_SO = { dong: 90, kyTu: 24_000 };
// Câu chào bot đầu tin (tu-gui.ts; mới: "Chào anh/chị <tên>! Em là … GE.", cũ: "Dạ, em là … GWT. … hotline … ạ.") — chỉ tốn chỗ trong lịch sử.
const CAU_BAO = new RegExp(`^.*?(?:${CAU_GIOI_THIEU}\\.|${CAU_BAO_DAU}\\.|${CAU_BAO_CU}.*?ạ\\.)\\s*`, "u");
/** Dòng chèn giữa hai tin cách nhau ≥ NGAY_GIAN_DOAN ngày: "— cách N ngày —" (đo 2026-10-22: khách cũ 14 tháng quay lại hỏi dòng máy
 *  khác, nháp vẫn bám máy cũ — lịch sử không có giờ nên model tưởng một mạch). */
export const GIAN_DOAN = "— cách";
const NGAY_GIAN_DOAN = 7;
const MOT_NGAY = 86_400_000;

/**
 * Lịch sử hội thoại cho nháp + Bắp (2026-10-20: lõi chỉ thấy tin khách chưa trả lời → hỏi lại điều NV đã hỏi, xin lại SĐT).
 * `tin` mới nhất trước. Bỏ `boQua` tin khách mới nhất của khối đang chờ (đã đi làm câu hỏi + bối cảnh — chay.ts luongNhap);
 * còn lại lấy tối đa TOI_DA_LICH_SU dòng "Khách: …" / "GWT: …" (NV và bot tự gửi), cũ → mới, đã che PII; bỏ dòng hệ thống và tin tự
 * động (Botcake, tin page không người — đã chốt 2026-10-24: Botcake sẽ gỡ, bot trả lời như không có Botcake; 2026-10-22 → 23 từng đưa
 * vào thì nháp bỏ dở câu khách vì "Botcake đã trả lời"). `daCoSdt` = khách từng gửi SĐT ở BẤT KỲ tin nào trong `tin`.
 * `gwtMoiNhat` = giờ tin phía GWT mới nhất trong `tin` — chay.ts dùng để biết từ lần ghi sổ trước GWT có gửi thêm gì không.
 */
export function lichSuHoiThoai(
  tin: TinPancake[], pageId?: string, pageNgoai?: string, boQua = 0, tran: { dong: number; kyTu: number } = TRAN_MAC_DINH,
): { lichSu: string[]; daCoSdt: boolean; gwtMoiNhat?: string } {
  const dong: string[] = [];
  let trongKhoi = true;
  let conBo = boQua;
  let daCoSdt = false;
  let gwtMoiNhat: string | undefined;
  let lucSau = NaN; // giờ tin hội thoại liền SAU tin đang xét (kể cả tin khách bị bỏ vì đã vào câu hỏi)
  for (const t of tin) {
    const bot = laTinBot(t);
    const nv = !bot && laNhanVien(t.from, pageNgoai);
    if (nv) trongKhoi = false;
    const khach = !bot && !laTinHeThong(t, pageNgoai) && laKhach(t.from, pageId);
    const tho = chuTin(t).replaceAll(DAU_BOT, "");
    const chu = (bot ? tho.replace(CAU_BAO, "") : tho).trim();
    if (khach && coSdt(chu)) daCoSdt = true;
    if (!chu || !(khach || nv || bot)) continue;
    if (!khach) gwtMoiNhat ??= t.inserted_at;
    const luc = Date.parse(t.inserted_at);
    const cach = Math.floor((lucSau - luc) / MOT_NGAY); // NaN (tin đầu / giờ hỏng) → không chèn
    lucSau = luc;
    if (dong.length >= tran.dong) continue;
    if (khach && trongKhoi && conBo > 0) { conBo -= 1; continue; }
    if (cach >= NGAY_GIAN_DOAN) dong.push(`${GIAN_DOAN} ${cach} ngày —`);
    dong.push(`${khach ? "Khách" : "GWT"}: ${[...anPii(chu)].slice(0, TRAN_DONG_LICH_SU).join("")}`);
  }
  dong.reverse();
  while (dong.length > 0 && dong.join("\n").length > tran.kyTu) dong.shift();
  return { lichSu: dong, daCoSdt, ...(gwtMoiNhat ? { gwtMoiNhat } : {}) };
}
