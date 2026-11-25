// chép từ GWT-ERP lib/chatbot/kenh/pancake/doc.ts @c2f3719 (bỏ dsQuangCao — chưa dùng)
/**
 * Client ĐỌC Pancake public API (developer.pancake.biz/openapi/openapi.yaml) — CHỈ GET. Token Pancake gửi được tin nên ranh
 * giới "không gửi" do code giữ: file này không có hàm ghi, guard `tests/chatbot/pancake-chi-doc.test.ts` canh.
 * Token CHỈ vào URL, không bao giờ vào lỗi/log.
 */
const GOC = "https://pages.fm/api/public_api";
const TIN_MOT_TRANG = 30; // openapi: GET messages trả 30 tin mỗi lần

export interface NguoiGui {
  id?: string; name?: string; uid?: string | null; admin_id?: string | null; ai_generated?: boolean; is_automated?: boolean;
  // Dấu của tin tự động (Botcake đo thật 2026-10-14: admin_id + flow_id + app_id + source_type "rule").
  admin_name?: string | null; app_id?: string | number | null; bot_id?: string | null; flow_id?: string | null;
  broadcast_id?: string | null; source_type?: string | null; source_id?: string | null;
}
export interface HoiThoaiPancake {
  id: string; type: string; seen: boolean; snippet: string | null; updated_at: string; has_phone: boolean;
  from: { id: string; name: string }; last_sent_by: NguoiGui | null;
  customers?: unknown[]; // Zalo cá nhân: nhóm chat có ≥2 khách (đo 2026-10-15)
}
export interface TinPancake {
  id: string; message: string; original_message?: string; inserted_at: string; from: NguoiGui; attachments?: { type: string; url?: string; origin_url?: string; ad_id?: string; name?: string }[]; // ad_id / name: tin ad_click (quang-cao.ts)
}

export class PancakeError extends Error {
  readonly code: string;
  readonly status: number | null;
  constructor(code: string, status: number | null = null) { super(code); this.code = code; this.status = status; this.name = "PancakeError"; }
}

// ponytail: Pancake trả giờ KHÔNG kèm múi (`2026-10-14T03:53:23.000000`) — giả định là UTC. Task 12 bước 1 đối chiếu với một tin thật;
// nếu hoá ra là giờ VN thì đổi đúng dòng này (chuẩn hoá một lần ở cửa vào, phía sau chỉ thấy ISO có múi).
const utc = (s: unknown) => (typeof s === "string" && s && !/(Z|[+-]\d\d:?\d\d)$/i.test(s) ? `${s}Z` : s);

// Nghỉ giữa các trang tin của MỘT cuộc (đo 2026-10-21: quét lịch sử đọc tới 20 trang liền → Pancake 429 sau 10 cuộc). Pancake ~5
// lời gọi/giây mỗi page → 250 ms ≈ 4/giây, chừa chỗ cho job phút cùng page.
const CHO_GIUA_TRANG_MS = 250;

export function taoPancake(
  pageId: string, token: string, fetchImpl: typeof fetch = fetch,
  nghi: (ms: number) => Promise<unknown> = (ms) => new Promise((ok) => setTimeout(ok, ms)),
) {
  async function doc(duong: string, q: Record<string, string>, khoa: "conversations" | "messages" | "data"): Promise<unknown[]> {
    const u = new URL(`${GOC}${duong}`);
    u.searchParams.set("page_access_token", token);
    for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v);
    // 429 (tài liệu Pancake: 5 lời gọi/giây mỗi page, "slow down and retry with a short back-off"): chờ rồi gọi lại, tối đa 3 lần.
    // Không gọi lại thì MỘT lần 429 hỏng cả lượt của page, phút sau xử lý đúng cuộc đó lại 429 — đo 2026-10-23: page FB Lọc tổng
    // kẹt PANCAKE_HTTP_429 mỗi phút từ 16:58 sau một tin khách mới. Chờ theo Retry-After (≤ 5 s), không có thì 1 s, 2 s, 3 s.
    let r: Response;
    for (let lan = 0; ; lan += 1) {
      try {
        r = await fetchImpl(u.toString(), { method: "GET", signal: AbortSignal.timeout(15_000) });
      } catch { throw new PancakeError("PANCAKE_UNREACHABLE"); }
      if (r.status !== 429 || lan >= 3) break;
      const s = Number(r.headers.get("retry-after"));
      await nghi(Number.isFinite(s) && s > 0 ? Math.min(s, 5) * 1000 : 1000 * (lan + 1));
    }
    if (!r.ok) throw new PancakeError(`PANCAKE_HTTP_${r.status}`, r.status);
    const j = (await r.json().catch(() => null)) as Record<string, unknown> | null;
    // Pancake báo lỗi bằng HTTP 200 + { success: false, error_code } (đo thật 2026-10-14: token sai → 102 "Invalid
    // access_token"). 102 mang status 401 để nhánh "token hỏng" của chay.ts bắt được; mã khác giữ status HTTP.
    if (j?.success === false) {
      const ma = Number.isInteger(j.error_code) ? Number(j.error_code) : 0;
      throw new PancakeError(`PANCAKE_LOI_${ma}`, ma === 102 ? 401 : r.status);
    }
    const ds = j?.[khoa];
    if (!Array.isArray(ds)) throw new PancakeError("PANCAKE_BAD_BODY", r.status);
    return ds;
  }
  const p = encodeURIComponent(pageId);
  return {
    dsHoiThoai: async (o: { since: number; until: number; truocId?: string }) =>
      ((await doc(`/v2/pages/${p}/conversations`, {
        type: "INBOX", order_by: "updated_at", since: String(o.since), until: String(o.until),
        ...(o.truocId ? { last_conversation_id: o.truocId } : {}),
      }, "conversations")) as HoiThoaiPancake[]).map((h) => ({ ...h, updated_at: utc(h.updated_at) as string })),
    // `trang` > 1 (trần 20): đọc lùi thêm trang cũ hơn (`current_count` = số tin đã lấy, API trả 30 tin trước mốc đó) — dựng sổ cuộc chat
    // lần đầu (so-cuoc.ts). Dừng khi trang thiếu hoặc không có tin mới; trang sau bỏ tin đã có (theo id), trang đầu giữ nguyên.
    tinNhan: async (conversationId: string, o: { trang?: number } = {}) => {
      const duong = `/v1/pages/${p}/conversations/${encodeURIComponent(conversationId)}/messages`;
      const gom: TinPancake[] = [];
      const daCo = new Set<string>();
      for (let i = 0; i < Math.max(1, Math.min(o.trang ?? 1, 20)); i += 1) {
        if (i) await nghi(CHO_GIUA_TRANG_MS);
        const ds = (await doc(duong, i ? { current_count: String(gom.length) } : {}, "messages")) as TinPancake[];
        const moi = i ? ds.filter((m) => !daCo.has(m.id)) : ds;
        for (const m of moi) { gom.push(m); daCo.add(m.id); }
        if (ds.length < TIN_MOT_TRANG || moi.length === 0) break;
      }
      return gom
        .map((m) => ({ ...m, inserted_at: utc(m.inserted_at) as string }))
        // Thứ tự API chưa xác minh mà loc.ts đi từ đầu mảng và lấy `tin[0]` làm tin mới nhất → ép mới nhất trước (sort ổn định; giờ hỏng = NaN → đứng yên).
        .sort((a, b) => Date.parse(b.inserted_at) - Date.parse(a.inserted_at));
    },
  };
}
export type PancakeClient = ReturnType<typeof taoPancake>;
