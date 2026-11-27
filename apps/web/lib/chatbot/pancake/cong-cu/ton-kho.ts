// chép từ GWT-ERP lib/chatbot/kenh/pancake/ton-kho.ts @c2f3719
/**
 * Tồn kho Shopee TẠM cho nháp (đã chốt 2026-10-23, chưa có kho chuẩn): đọc ảnh tồn `sales.shopee_stocks` do Bắp ghi định kỳ
 * (gwt-discord-bot) → câu cho công cụ `ton_kho` của Haiku. CHỈ còn / hết, KHÔNG số lượng (tồn Shopee là phần đã chia cho kênh
 * Shopee). Hàm thuần — nơi gọi đọc bảng (lib/chatbot/db/cong-cu-tra.ts). Có kho chuẩn thì thay nguồn đọc, câu giữ nguyên.
 */

// chép từ GWT-ERP lib/chatbot/chat/thuc-the.ts gopMaRoi: "WH15A ECO" viết rời → "WH15AECO".
const gopMaRoi = (hoa: string): string => hoa.replace(/(?<![\p{L}\p{N}])(WH[0-9]{2}A)\s+ECO(?![\p{L}\p{N}])/gu, "$1ECO");

// chép từ GWT-ERP lib/chatbot/kenh/pancake/anh-chuan.ts MA_TREN_TEM: [mã trên tem Shopee, tên bản].
export const MA_TREN_TEM: readonly (readonly [string, string])[] = [
  ["CTD50NG", "CTD50"], ["CTS10NW", "CTS10 (bản trắng)"], ["CTS10NB", "CTS10 (bản đen)"], ["CTS20NG", "CTS20"],
  ["GPUN-4000XEN", "GN610"], ["GTUN-5800EN", "GN620"], ["GTUN-8500XDS", "DN810"], ["GTUN-8600HP", "USH10"],
  ["GTEF-15A01", "thiết bị lọc trung tâm của WH15A"], ["GTEC-15A01", "thiết bị làm mềm nước của bộ 15A (WH15A hoặc WH15AECO)"],
  ["GTEF-30A01", "thiết bị lọc trung tâm của WH30A"], ["GTEC-30A01", "thiết bị làm mềm nước của bộ 30A (WH30A hoặc WH30AECO)"],
  ["GTEP-50A01", "thiết bị tiền lọc của WH15A / WH30A"], ["GEUT-50B04", "B04 (đã ngừng bán máy)"],
];

export interface DongTon {
  item_name: string; model_name: string | null; item_sku: string | null; model_sku: string | null;
  item_status: string; stock: number; synced_at: string;
}

/** Ảnh tồn cũ hơn ngần này (Bắp ghi 15 phút/lần) coi như không có — job Bắp đã dừng. */
export const TON_CU_SAU_MS = 3 * 3_600_000;

const gioVN = (iso: string) => {
  const d = new Date(Date.parse(iso) + 7 * 3_600_000);
  const h = (n: number) => String(n).padStart(2, "0");
  return `${h(d.getUTCHours())}:${h(d.getUTCMinutes())} ${h(d.getUTCDate())}/${h(d.getUTCMonth() + 1)}`;
};

/**
 * Khớp MÁY theo SKU, KHÔNG theo tên (đo trên ảnh tồn thật 2026-10-23): tên lõi lọc / quà tặng cũng chứa mã máy ("Lõi lọc … GE
 * DN810" còn hàng trong khi máy DN810 hết) → khớp tên báo nhầm "còn hàng". SKU máy trên Shopee = mã trên tem (CTS20NG, CTS10NW,
 * GTUN-8500XDS) có khi thêm "-G"; lõi / quà / phụ kiện mang SKU khác (LX-…, …-QT). Máy không có SKU khớp → "chưa rõ" (NV xử lý).
 */
const skuMay = (ma: string) => MA_TREN_TEM.filter(([, ban]) => ban === ma || ban.startsWith(`${ma} `)).map(([tem]) => tem);
// Quà tặng có khi mang ĐÚNG SKU máy ("[Quà tặng không bán] Máy lọc nước … GN610", SKU GPUN-4000XEN-G) → loại theo tên.
const khop = (d: DongTon, tem: readonly string[]) => !/^\s*\[Quà tặng/iu.test(d.item_name) && [d.item_sku, d.model_sku].some((s) => {
  const k = (s ?? "").trim().toUpperCase();
  return tem.some((t) => k === t || k === `${t}-G`);
});

/** Câu trả về cho Haiku. Trích được nguyên văn (lớp chặn bịa) — dòng "<MÃ> — còn hàng" là căn cứ. */
export function tomTatTon(maVao: string, ds: readonly DongTon[], now: Date): string {
  const ma = gopMaRoi(maVao.trim().toUpperCase());
  const moiNhat = ds.reduce<string | null>((a, d) => (a === null || d.synced_at > a ? d.synced_at : a), null);
  if (!ma) return "Cần mã máy để tra tồn kho.";
  if (moiNhat === null || now.getTime() - Date.parse(moiNhat) > TON_CU_SAU_MS) {
    return `TỒN KHO SHOPEE: chưa có dữ liệu mới${moiNhat ? ` (cập nhật cuối ${gioVN(moiNhat)})` : ""} — chưa rõ ${ma} còn hàng không.`;
  }
  const tem = skuMay(ma);
  if (!tem.length) return `TỒN KHO SHOPEE: chỉ tra được máy GWT bán trên Shopee (không tra lõi, phụ kiện, lọc tổng) — chưa rõ ${ma} còn hàng không.`;
  const dang = ds.filter((d) => d.item_status === "NORMAL" && khop(d, tem));
  const dau = `TỒN KHO SHOPEE (cập nhật ${gioVN(moiNhat)}, chỉ biết còn / hết, không có số lượng):`;
  if (!dang.length) return `${dau} không thấy ${ma} đang bán trên Shopee — chưa rõ ${ma} còn hàng không.`;
  const phanLoai = [...dang.reduce((m, d) => (d.model_name ? m.set(d.model_name, (m.get(d.model_name) ?? false) || d.stock > 0) : m), new Map<string, boolean>())];
  const chiTiet = phanLoai.length > 1 ? ` (phân loại: ${phanLoai.map(([ten, con]) => `${ten} ${con ? "còn" : "hết"}`).join("; ")})` : "";
  return `${dau} ${ma} — ${dang.some((d) => d.stock > 0) ? "còn hàng" : "hết hàng"}${chiTiet}.`;
}
