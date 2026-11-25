// giờ làm / hotline / danh sách trang: chép từ GWT-ERP lib/chatbot/kenh/pancake/tu-gui.ts + scripts/chatbot/_trang.mjs @c2f3719
import { homedir } from "node:os";

/** Cấu hình bot tự trả lời Pancake. Fail-closed: sai bất kỳ biến nào → `loi` (chỉ nêu TÊN biến, không bao giờ giá trị / token). */
export interface GioLam { ngay: ReadonlySet<number>; tu: number; den: number }
export interface CauHinh {
  cheDo: "tat" | "thu" | "bat";
  trang: { id: string; ten: string; token: string }[];
  trangGui: Set<string>;
  gioLam: GioLam;
  gioBot: { tu: number; den: number } | null;
  hotline: string;
  tranNgay: number;
  modelPhanLoai: string;
  modelTraLoi: string;
  webhook: string;
  pingKhieuNai?: string;
  demDir: string;
}

const GIO_LAM_MAC_DINH = "1-6 08:00-18:00";
const GIO = /^([0-6])-([0-6]) ([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;
const GIO_BOT = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;
// id page: Facebook chỉ chữ số; kênh khác có tiền tố chữ thường + "_" (zl_, pzl_, spo_)
const ID = /^(?:[a-z]{1,8}_)?\d{5,25}$/;
const TEN_TOI_DA = 14;
// R1: Zalo cá nhân / Shopee không bao giờ tự gửi
const KENH_CAM = /^(?:pzl_|spo_)/;

function docGioLam(s: string): GioLam | null {
  const m = GIO.exec(s.trim());
  if (!m) return null;
  const [d1, d2, h1, p1, h2, p2] = m.slice(1).map(Number);
  const tu = h1 * 60 + p1, den = h2 * 60 + p2;
  if (d1 > d2 || tu >= den) return null;
  return { ngay: new Set(Array.from({ length: d2 - d1 + 1 }, (_, i) => d1 + i)), tu, den };
}

function docHotline(s: string | undefined): string {
  const h = s?.trim() ?? "";
  return /^\+?[\d .]{8,20}$/.test(h) && h.replace(/\D/g, "").length >= 8 ? h : "";
}

function docDsTrang(env: Record<string, string | undefined>): CauHinh["trang"] | null {
  let ds: unknown;
  try { ds = JSON.parse(env.PANCAKE_PAGES?.trim() ?? ""); } catch { return null; }
  if (!Array.isArray(ds) || !ds.length) return null;
  const daCo = new Set<string>();
  const trang: CauHinh["trang"] = [];
  for (const p of ds as { id?: unknown; ten?: unknown }[]) {
    const id = typeof p?.id === "string" ? p.id.trim() : ""; // id phải là chuỗi: số JSON dài có thể mất chính xác
    const ten = typeof p?.ten === "string" ? p.ten.trim() : "";
    if (!ID.test(id) || !ten || [...ten].length > TEN_TOI_DA || daCo.has(id)) return null;
    daCo.add(id);
    trang.push({ id, ten, token: env[`PANCAKE_PAGE_TOKEN_${id}`]?.trim() ?? "" });
  }
  return trang;
}

export function docCauHinh(env: Record<string, string | undefined>): { ch: CauHinh } | { loi: string } {
  const che = env.PANCAKE_TU_GUI?.trim() || "tat";
  if (che !== "tat" && che !== "thu" && che !== "bat") return { loi: "PANCAKE_TU_GUI phải là tat|thu|bat" };
  const gioLam = docGioLam(env.PANCAKE_GIO_LAM?.trim() || GIO_LAM_MAC_DINH);
  if (!gioLam) return { loi: "PANCAKE_GIO_LAM sai (vd \"1-6 08:00-18:00\": thứ 2–7, giờ VN)" };

  let gioBot: CauHinh["gioBot"] = null;
  const gb = env.PANCAKE_GIO_BOT?.trim();
  if (gb) {
    const m = GIO_BOT.exec(gb);
    if (!m) return { loi: "PANCAKE_GIO_BOT sai (vd \"18:00-22:00\", giờ VN)" };
    const [h1, p1, h2, p2] = m.slice(1).map(Number);
    gioBot = { tu: h1 * 60 + p1, den: h2 * 60 + p2 };
    if (gioBot.tu === gioBot.den) return { loi: "PANCAKE_GIO_BOT sai (giờ bắt đầu trùng giờ kết thúc)" };
  }

  const tranTho = env.PANCAKE_TRAN_NGAY?.trim();
  if (tranTho && !/^\d+$/.test(tranTho)) return { loi: "PANCAKE_TRAN_NGAY phải là số nguyên 1–1000" };
  const tranNgay = tranTho ? Number(tranTho) : 20;
  if (tranNgay < 1 || tranNgay > 1000) return { loi: "PANCAKE_TRAN_NGAY phải là số nguyên 1–1000" };

  const demTho = env.PANCAKE_DEM_DIR?.trim() || "~/Bots/state";
  const demDir = demTho === "~" || demTho.startsWith("~/") ? homedir() + demTho.slice(1) : demTho;

  const chung = {
    cheDo: che, gioLam, gioBot, tranNgay, demDir,
    hotline: docHotline(env.PANCAKE_HOTLINE),
    modelPhanLoai: env.PANCAKE_PHAN_LOAI_MODEL?.trim() || "claude-sonnet-5-5",
    modelTraLoi: env.PANCAKE_TRA_LOI_MODEL?.trim() ?? "",
    webhook: env.DISCORD_WEBHOOK_PANCAKE_BAO?.trim() ?? "",
    ...(env.PANCAKE_PING_KHIEU_NAI?.trim() ? { pingKhieuNai: env.PANCAKE_PING_KHIEU_NAI.trim() } : {}),
  } satisfies Omit<CauHinh, "trang" | "trangGui">;
  if (che === "tat") return { ch: { ...chung, trang: [], trangGui: new Set() } };

  // thu / bat: thiếu hay sai một biến → không chạy
  const trang = docDsTrang(env);
  if (!trang) return { loi: "PANCAKE_PAGES không hợp lệ (JSON [{\"id\":\"…\",\"ten\":\"…\"}], id không trùng)" };
  const thieuToken = trang.find((t) => !t.token);
  if (thieuToken) return { loi: `thiếu PANCAKE_PAGE_TOKEN_${thieuToken.id}` };
  const trangGui = new Set((env.PANCAKE_TU_GUI_TRANG ?? "").split(",").map((s) => s.trim()).filter(Boolean));
  if (!trangGui.size) return { loi: "thiếu PANCAKE_TU_GUI_TRANG (id page được bot tự gửi, cách nhau dấu phẩy)" };
  const ids = new Set(trang.map((t) => t.id));
  if ([...trangGui].some((t) => !ids.has(t))) return { loi: "PANCAKE_TU_GUI_TRANG có page không nằm trong PANCAKE_PAGES" };
  if ([...trangGui].some((t) => KENH_CAM.test(t))) return { loi: "PANCAKE_TU_GUI_TRANG không được chứa page Zalo cá nhân (pzl_) hay Shopee (spo_)" };
  if (!chung.hotline) return { loi: "PANCAKE_HOTLINE sai (cần số hotline)" };
  if (!chung.modelTraLoi) return { loi: "thiếu PANCAKE_TRA_LOI_MODEL" };
  if (!chung.webhook) return { loi: "thiếu DISCORD_WEBHOOK_PANCAKE_BAO" };
  for (const k of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY"]) {
    if (!env[k]?.trim()) return { loi: `thiếu ${k}` };
  }
  return { ch: { ...chung, trang, trangGui } };
}

/** R2: ngoài giờ làm (giờ VN = UTC+7) VÀ (không đặt gioBot, hoặc đang trong gioBot [tu, den) mỗi ngày). */
export function trongGioBot(now: Date, ch: Pick<CauHinh, "gioLam" | "gioBot">): boolean {
  const vn = new Date(now.getTime() + 7 * 3600_000);
  const phut = vn.getUTCHours() * 60 + vn.getUTCMinutes();
  const g = ch.gioLam;
  if (g.ngay.has(vn.getUTCDay()) && phut >= g.tu && phut < g.den) return false;
  if (!ch.gioBot) return true;
  const { tu, den } = ch.gioBot;
  return tu < den ? phut >= tu && phut < den : phut >= tu || phut < den; // qua nửa đêm
}
