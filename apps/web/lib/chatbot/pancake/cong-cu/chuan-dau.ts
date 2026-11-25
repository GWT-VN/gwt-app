// chép từ GWT-ERP lib/chatbot/chat/chuan-dau.ts @c2f3719
/**
 * Luật nhận dạng câu so trên chữ CÓ DẤU — spec docs/superpowers/specs/2026-09-30-chatbot-luat-co-dau-design.md.
 *
 * Bỏ dấu gộp chữ khác nghĩa (lõi/lỗi, hỏng/hông/hồng, vị lạ/vì là…), trong khi 98,3% tin khách gõ có dấu (đo 2026-09-30,
 * 77.838 tin Pancake từ 3 từ trở lên).
 * - Lớp 1 `chuanCau`: đưa câu về một dạng tất định trước khi so.
 * - Lớp 2 `luat`: luật viết CÓ DẤU; mỗi chữ có dấu nhận thêm dạng trần của nó (KÉP), để câu gõ không dấu (1,7%) và chữ gõ
 *   trần lẫn trong câu có dấu vẫn khớp như luật bỏ dấu cũ. Prototype trên TIN_HIEU_SU_CO (106.857 câu): KÉP gỡ 148 câu va
 *   chạm, chỉ lọt 2 lỗi gõ; so "câu có dấu chỉ nhận chữ có dấu" lọt thêm 6 sự cố thật gõ trần một chữ.
 * - Họ cụm lỗi gõ `CUM_*` (cuối file): mảnh nguồn cho `luat` dùng chung giữa các file luật.
 */

/** Bỏ dấu + đ→d, giữ hoa/thường. Không import `thuc-the`: bước 4 của spec cho `thuc-the` dùng file này — import ngược là vòng. */
const boDau = (s: string): string => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

/** Có dấu tiếng Việt (dấu thanh, mũ, móc, trăng, hoặc đ) — nhận cả chuỗi NFC lẫn NFD. */
export function coDau(s: string): boolean {
  return /[\u0300-\u036f]|[đĐ]/.test(s.normalize("NFD"));
}

// Dấu thanh trên vần oa/oe/uy CUỐI âm tiết: đưa kiểu MỚI (hoà, khoẻ, thuỷ — dấu trên nguyên âm sau) về kiểu CŨ (hòa,
// khỏe, thủy — dấu trên nguyên âm đầu); "ua" gõ lệch (cuả → của) không thuộc kiểu nào, đi cùng đường. Tin khách chia đôi
// hai kiểu (hoá 208 / hóa 271, thuỷ 36 / thủy 85 — đo 2026-09-30). Chạy trên NFD: dấu thanh đứng sau nguyên âm thứ hai thì
// dời lên nguyên âm đầu. Không đụng "qu" (quý, quà) và vần còn chữ theo sau (ngoài, xoáy, hoàn — hai kiểu vốn trùng nhau).
const DAU_KIEU_MOI = /(?<!q)([ou])([aey])([\u0300\u0301\u0303\u0309\u0323])(?![\p{L}\p{M}])/gu;

// Lỗi gõ ĐÃ ĐO (spec §4 quyết định 4): dạng không phải từ ĐỨNG RIÊNG có nghĩa, có số đo hoặc luật cũ đã nhận. Dạng còn nằm
// trong từ ghép/láy khác ("rầu rĩ") thì đổi sang chữ đích không được làm câu đó khớp luật nào. Đứng thành từ trong câu
// harness gom (106.857 câu, 2026-09-30): "lỏi" 13 lần / 11 câu (spec: cả 13 là lõi); "rĩ" 1 lần — rò rĩ 1, rầu rĩ 0,
// khác 0; "hõng" 0 lần (luật 828bbf8 đã nhận). Không gộp hỏi/ngã nói chung: sữa/sửa, nữa/nửa khác nghĩa.
// Bước 2 (y-dinh.ts, cùng cách đếm, 2026-09-30) — số câu, MỌI lần đều là chữ đích: giâ 19, gía 15, lăp 9, sẳn 5, biêt 5,
// chăc 5, khuyễn 4, hơp 4 (cả "trương hơp", "kêt hơp"), tôt 3, tièn 3, cõ 2. Không nhận vì đích không duy nhất: "đăt" 6
// câu (đặt 5 / đắt 1), "đải" 2 (đãi 1 / chữ khác 1) — nhận bằng cụm (`CUM_LAP_DAT` cuối file; so_ctkm); dạng 1 câu (giă, bâo,
// bãn, nhiẹu…) chờ đủ số.
// Bước 3 (danh-muc.ts, cùng cách đếm): đàu 4 câu, cả 4 là "đầu" (đàu nguồn 2, đàu vào 1, đàu hút 1).
const LOI_GO: Readonly<Record<string, string>> = {
  lỏi: "lõi", rĩ: "rỉ", hõng: "hỏng",
  giâ: "giá", gía: "giá", lăp: "lắp", sẳn: "sẵn", biêt: "biết", chăc: "chắc", khuyễn: "khuyến", hơp: "hợp", tôt: "tốt",
  tièn: "tiền", cõ: "có",
  đàu: "đầu",
};
const LOI_GO_RE = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${Object.keys(LOI_GO).join("|")})(?![\\p{L}\\p{N}_])`, "gu");

/** Lớp 1 — dạng chuẩn của câu khách: NFC, chữ thường, một dấu cách, dấu kiểu cũ (hòa, khỏe, thủy), sửa lỗi gõ đã đo. Lũy đẳng. */
export function chuanCau(s: string): string {
  return s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim()
    .normalize("NFD").replace(DAU_KIEU_MOI, "$1$3$2").normalize("NFC")
    .replace(LOI_GO_RE, (w) => LOI_GO[w] ?? w);
}

const CHU = "[\\p{L}\\p{N}_]";
// `\b` của JS chỉ hiểu ASCII ("đ", "ỏ" không phải chữ với nó) → ranh giới Unicode, giữ nghĩa `\b` cũ kể cả "_".
const RANH_GIOI = `(?:(?<=${CHU})(?!${CHU})|(?<!${CHU})(?=${CHU}))`;
// Mảnh nguồn regex: lớp ký tự | chuỗi thoát (\p{…}, \u{…}, \uXXXX, \xXX, một ký tự) | cụm chữ | một ký tự khác.
// Không cờ `s`: tsconfig target ES2017 chặn nó (TS1501); nguồn luật không có xuống dòng sau `\`.
const MANH = /\[(?:\\.|[^\]\\])*\]|\\(?:[pPu]\{[^}]*\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)|\p{L}+|[^]/gu;

function kep(nguon: string): string {
  const manh = nguon.normalize("NFC").match(MANH) ?? [];
  return manh.map((m, i) => {
    if (m === "\\b") return RANH_GIOI;
    if (/^\\[wWB]$/.test(m)) throw new Error(`luat: ${m} chỉ hiểu ASCII — dùng \\b hoặc lớp \\p{L}`);
    if (m.startsWith("[")) {
      if (boDau(m) !== m) throw new Error(`luat: chữ có dấu trong lớp ký tự ${m} — viết thành nhánh (?:a|b)`);
      return m;
    }
    if (!/^\p{L}/u.test(m)) return m;
    if (chuanCau(m) !== m) throw new Error(`luat: "${m}" chưa ở dạng chuanCau ("${chuanCau(m)}")`);
    const tran = boDau(m);
    if (tran === m) return m;
    if (/^[?*+{]/.test(manh[i + 1] ?? "")) throw new Error(`luat: lượng từ ngay sau "${m}" — bọc (?:…) trước`);
    return `(?:${m}|${tran})`;
  }).join("");
}

/**
 * Lớp 2 — luật viết CÓ DẤU (cú pháp regex, chữ ở dạng `chuanCau`) → RegExp so trên `chuanCau(câu)`. Mỗi cụm chữ có dấu
 * nhận thêm dạng trần (KÉP); `\b` là ranh giới Unicode. Mảng = các nhánh nối "|". Luôn cờ `u`; `co` thêm cờ khác.
 * Giới hạn guard: viết TRỌN âm tiết, không tách qua `(`/`|`/`?` (`ho(?:à|a)` không ném mà trượt `chuanCau("hoà")`;
 * `hoà(?:n|ng)` ném oan). Chữ có dấu viết bằng escape (`\u…`, `\x…`, kể cả trong khoảng lớp ký tự) guard không bắt —
 * lưới đỡ là harness so cũ ↔ mới. `[a-z]`/`[^a-z]` mang nghĩa "chữ" phải đổi sang `\p{L}`: câu đã `chuanCau` còn chữ có dấu.
 */
export function luat(nguon: string | readonly string[], co = ""): RegExp {
  return new RegExp((typeof nguon === "string" ? [nguon] : nguon).map(kep).join("|"), `u${co}`);
}

// HỌ CỤM lỗi gõ dùng ở cả `hoi-lai.ts` lẫn `y-dinh.ts` (spec §3.3). Dạng gõ nhầm LÀ từ có nghĩa nên không vào `LOI_GO`, chỉ nhận
// trong cụm. Mọi luật cùng họ — kể cả luật LOẠI TRỪ như `GIA_LOI` — dùng chung một mảnh nguồn cho `luat`, nên cùng nhận một bộ
// dạng: thêm dạng vào một luật mà quên luật anh em là lệch (review cả nhánh 2026-09-30). Mảnh không kèm `\b`, luật dùng tự đặt.
// Họ chỉ dùng trong một file thì định nghĩa ở file đó: "giá / bao nhiêu tiền", "cửa hàng" (y-dinh.ts); "thế nào" (hoi-lai.ts).
// Số đo 2026-09-30 trên 106.857 câu.

/** "thay lõi": "thay lỗi" 3/3 câu là thay lõi. TIN_HIEU_TUY_MAY, CHU_DE_TUY_MAY (hoi-lai); so_loi, GIA_LOI (y-dinh). */
export const CUM_THAY_LOI = "thay (?:lõi|lỗi)";
/**
 * "lõi lọc": "lôi lọc" 2 câu (viết dính dấu chấm, đều là chuyện thay lõi) — "lôi" trơ có nghĩa riêng (kéo) nên chỉ nhận trong
 * cụm. so_loi, GIA_LOI (y-dinh).
 */
export const CUM_LOI_LOC = "(?:lõi|lôi) lọc";
/**
 * "lắp đặt": lấp đặt 3, lập đặt 1, lặp đặt 1, lắp đăt 2, lắp dặt 1 câu (thêm "lăp đăt", "lăp dặt" 1 câu mỗi dạng nhờ `LOI_GO`).
 * "lấp đất" (3 câu) là chữ khác; "đăt" 6 câu (đặt 5 / đắt 1) nên không vào `LOI_GO`. lap_dat, hoi_nhu_cau (y-dinh — chỉ vế có
 * "đặt": "lấp"/"lập" trơ là "lấp đất"/"thành lập"); TIN_HIEU_TUY_MAY, CHU_DE_TUY_MAY (hoi-lai).
 */
export const CUM_LAP_DAT = "(?:(?:lắp|lấp|lập|lặp) đặt|lắp (?:đăt|dặt))";
