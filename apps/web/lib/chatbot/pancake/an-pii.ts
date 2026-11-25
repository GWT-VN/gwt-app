// chép từ GWT-ERP lib/chatbot/kenh/pancake/an-pii.ts @c2f3719
/**
 * Che PII và số trong chữ học từ chat NV (spec 2026-10-16 vòng học §3.2). Hàm thuần — LƯỚI AN TOÀN: heuristic không bắt hết
 * địa chỉ/tên viết thường; người duyệt và lời dặn model là lớp còn lại. Không đụng mã máy/mã lõi (CTS10, WH15AECO, KDF55).
 */
// Mã MÁY (tên thương mại) — chép từ GWT-ERP lib/chatbot/chat/danh-muc.ts MA_MAY (nguồn là DANH_MUC; máy mới ra thì cập nhật cả hai).
const MA_MAY: ReadonlySet<string> = new Set([
  "WH15A", "WH15AECO", "WH30A", "WH30AECO", "CTS10", "CTS20", "CTD50", "B04", "USH10", "GN610", "GN620", "DN810",
]);

// Số VN: 0 / 84 / +84 / (+84) / (84) + 9 chữ số (di động) hoặc 10 (bàn "024 3856 1234"), tối đa 2 ký tự cách/chấm/gạch trước mỗi chữ số.
// Cấm chữ số đứng trước/sau (giá 30.950.000đ không khớp); chữ đứng trước thì được ("sdt0123456789").
// Dãy theo sau là đơn vị tiền ("B04 16.950.000 đ" — đo 2026-10-20: mã máy + giá thành 0 + 9 chữ số) là GIÁ, không phải SĐT.
const SDT = /(?<!\p{N})(?:\+84|\(\+84\)|\(84\)|84|0)(?:[\s.-]{0,2}\d){9,10}(?!\p{N})(?!\s?(?:đồng|vn[dđ]|đ|₫)(?!\p{L}))/gu;
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu;
const LINK = /\bhttps?:\/\/[^\s<>«»"]+|(?<![\p{L}\p{N}])www\.[^\s<>«»"]+/gu;
// Link trang GWT công khai giữ lại (là nội dung tư vấn, không phải dữ liệu khách).
const LINK_GWT = /^(?:https?:\/\/)?(?:[\w-]+\.)*gwt\.vn(?:[/?#]|$)/i;

// Từ khoá viết HOA hoặc thường ở chữ đầu; phần tên phía sau PHẢI bắt đầu bằng chữ hoa hoặc số (tên riêng) — không có cờ `i` vì
// với /iu thì \p{Lu} khớp cả chữ thường, sẽ che nhầm "quan tâm", "đường nước".
const hoaThuong = (w: string) => `[${w[0].toUpperCase()}${w[0]}]${w.slice(1)}`;
// Giới hạn 40 ký tự: tin dài không dấu câu không bị nuốt hết nội dung (địa chỉ thật nằm ngay sau từ khoá).
const TU_SAU = "[^,.;\\n«»]{0,40}";
const DIA_CHI = new RegExp([
  `(?<![\\p{L}\\p{N}])(?:${["số nhà", "ngõ", "ngách", "hẻm", "kiệt"].map(hoaThuong).join("|")})\\s*\\d${TU_SAU}`,
  `(?<![\\p{L}\\p{N}])(?:${["đường", "phố", "tòa", "toà", "chung cư", "khu đô thị"].map(hoaThuong).join("|")}|KĐT)\\s+[\\p{Lu}\\d]${TU_SAU}`,
  `(?<![\\p{L}\\p{N}])(?:${["địa chỉ", "đc", "đ/c"].map(hoaThuong).join("|")})\\s?:${TU_SAU}`, // dấu ":" bắt buộc: "địa chỉ cửa hàng ở đâu" là câu hỏi
  `(?<![\\p{L}\\p{N}])(?:${["phường", "xã", "quận", "huyện", "thị xã", "thành phố", "tỉnh"].map(hoaThuong).join("|")}|TP\\.?|Tp\\.?)\\s+[\\p{Lu}\\d]${TU_SAU}`,
].join("|"), "gu");
const XUNG_HO = ["anh", "chị", "chi", "em", "cô", "chú", "bác", "bạn"].map(hoaThuong).join("|");
const TEN = new RegExp(`(?<=(?<![\\p{L}\\p{N}])(?:${XUNG_HO})\\s)\\p{Lu}\\p{Ll}+(?:[^\\S\\n]\\p{Lu}\\p{Ll}+){0,3}`, "gu"); // tối đa 4 âm tiết hoa, không vượt qua xuống dòng

export function anPii(s: string): string {
  return s.normalize("NFC")
    .replace(LINK, (u) => (LINK_GWT.test(u) ? u : "{link}"))
    .replace(EMAIL, "{email}")
    .replace(SDT, "{SĐT}")
    .replace(DIA_CHI, "{địa chỉ}")
    .replace(TEN, "{tên}");
}

// Mã máy/mã lõi CHỈ là: (a) có trong MA_MAY (so sau khi viết hoa — khách gõ "cts10"), hoặc (b) gõ HOA ASCII, có số, không dãy ≥5 số
// (CTS10, KDF55, SS316L, GT-PCF10-G01-G). Từ thường/lẫn dính số ("giá30tr", "stk19034567890123") và "AB123456" không phải mã.
const DANG_MA = /^(?=.*\d)[A-Z][A-Z\d]*(?:-[A-Z\d]+)*$/;
const laMa = (w: string) => MA_MAY.has(w.toUpperCase()) || (DANG_MA.test(w) && !/\d{5,}/.test(w));

/**
 * Mọi cụm số (giá, tiền, %, ngày, số người/tầng) → `{số}`; giữ mã máy/mã lõi. Số liệu thật chỉ lấy từ Masterdata/kho.
 * Một "từ" = chữ/số nối nhau bằng . , / : - (KHÔNG nuốt dấu câu cuối: "cts10," vẫn là mã), có thể kèm % cuối; từ được tách
 * theo `/` và `,` để xét từng phần ("CTS10/CTS15" là hai mã; "1.5L/phút" vẫn che số), rồi `{số}/{số}` gộp lại thành một.
 */
export const anSo = (s: string) => cheSo(s, () => false);

/** Ruột chung: `giu(cụm, vị trí hết cụm trong s)` true → cụm được giữ nguyên, ngược lại che. */
function cheSo(s: string, giu: (cum: string, ket: number) => boolean): string {
  return s.replace(/[\p{L}\p{N}]+(?:[.,/:-][\p{L}\p{N}]+)*%?/gu, (w, off: number) => {
    let pos = off;
    return w.split(/([/,])/)
      .map((p) => {
        const dau = pos;
        pos += p.length;
        return !/\p{N}/u.test(p) || laMa(p) ? p : p.replace(/\p{N}+(?:[.,:/-]\p{N}+)*/gu, (c, i: number) => (giu(c, dau + i + c.length) ? c : "{số}"));
      })
      .join("")
      .replace(/\{số\}(?:[/,]\{số\})+/g, "{số}");
  });
}

// Đơn vị tiền/phần trăm đứng ngay sau cụm số (một dấu cách được); "5 km", "2 trên" không phải (đơn vị phải trọn từ). Bỏ qua chuỗi
// `,số` / `/số` theo sau: cheSo tách "1,5" và "500/700" thành các phần, đơn vị cuối ("1,5 triệu", "500/700k") tính cho cả chuỗi.
// Đơn vị bằng chữ ("3 trăm nghìn", "1 tỷ", "15 phần trăm", cả không dấu "2 trieu", "500 nghin") và ngoại tệ ("5 đô", "5 USD", "5$")
// cũng là tiền/%; "độ", "đông" thì không.
const DON_VI = /(?:[/,]\p{N}+(?:[.:-]\p{N}+)*)*\s?(?:đồng|vn[dđ]|đô|đ|₫|k|nghìn|ngàn|nghin|ngan|trăm|tr|triệu|trieu|tỷ|tỉ|củ|phần trăm|usd|%|\$)(?!\p{L})/iuy;
const coDonVi = (s: string, ket: number) => ((DON_VI.lastIndex = ket), DON_VI.test(s)); // cờ y: chỉ khớp đúng tại `ket`
// "$" đứng TRƯỚC cụm số ("$5", "$ 1,500" — cả chuỗi `số,` / `số/` sau "$", như đơn vị cuối ở trên).
const DO_LA_TRUOC = /\$\s?(?:\p{N}+(?:[.:-]\p{N}+)*[/,])*$/u;

/**
 * Che khi LƯU CẶP: chỉ che cụm ≥ 4 chữ số (giá, SĐT còn sót, năm, mã đơn) hoặc cụm có đơn vị tiền/% — số nhỏ chỉ thời gian/bước/lần
 * ("giữ 3 giây", "bước 2") được giữ vì đó là cách dùng máy, che hết thì mất kiến thức. "2tr5" → `{số}tr{số}`.
 */
export const anSoLon = (s: string) =>
  cheSo(s, (c, ket) => c.replace(/\P{N}/gu, "").length < 4 && !coDonVi(s, ket) && !DO_LA_TRUOC.test(s.slice(0, ket - c.length)))
    .replace(/(\{số\}(?:tr|triệu|củ|k))\p{N}+/giu, "$1{số}");

export const an = (s: string) => anSo(anPii(s));
export const coSdt = (s: string) => s.search(SDT) !== -1; // search bỏ qua cờ g / lastIndex
export const conSo = (s: string) => anSo(s) !== s;
export const anCap = (s: string) => anSoLon(anPii(s));
export const conSoLon = (s: string) => anSoLon(s) !== s;
