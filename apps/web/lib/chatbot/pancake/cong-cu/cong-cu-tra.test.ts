import { beforeEach, describe, expect, it, vi } from "vitest";

import { taoCongCuTra } from "./cong-cu-tra.ts";
import { quenMasterdata } from "./masterdata.ts";

// Client Masterdata giả: rpc cho truy hồi, schema(...).from(...) cho alias / view api / sales.
function sbGia(o: { rpc?: (n: string, a: Record<string, unknown>) => unknown; bang?: Record<string, unknown[]>; alias?: unknown[]; ton?: { data: unknown; error: unknown } }) {
  const limit = vi.fn(async () => o.ton ?? { data: [], error: null });
  const schema = vi.fn((s: string) => ({
    from: (ten: string) => ({
      select: () => ({
        in: async () => ({ data: o.bang?.[ten] ?? [], error: null }),
        limit,
        then: (res: (v: { data: unknown; error: null }) => void) => res({ data: o.alias ?? [], error: null }),
      }),
    }),
    _s: s,
  }));
  return { sb: { rpc: vi.fn(async (n: string, a: Record<string, unknown>) => o.rpc?.(n, a)), schema } as never, schema, limit };
}

const VEC = Array.from({ length: 1536 }, () => 0.1);
const chuaFetch = globalThis.fetch;

describe("taoCongCuTra", () => {
  beforeEach(() => { quenMasterdata(); globalThis.fetch = chuaFetch; });

  it("traMay máy ngừng bán (B04) kèm dòng LƯU Ý NGỪNG BÁN, vẫn có số liệu", async () => {
    const { sb } = sbGia({
      alias: [{ alias_norm: "B04", internal_code: "B04" }],
      bang: {
        chatbot_price: [{ internal_code: "B04", product_name: "GE B04", gia_ban: 16950000 }],
        chatbot_machine_filter: [], chatbot_warranty: [], chatbot_promotion: [],
      },
    });
    const r = await taoCongCuTra(sb).traMay("b04");
    expect(r.startsWith("LƯU Ý: máy B04 đã NGỪNG BÁN")).toBe(true);
    expect(r).toContain("16.950.000 đ");
  });

  it("traMay máy đang bán: không có dòng LƯU Ý", async () => {
    const { sb } = sbGia({
      alias: [{ alias_norm: "CTS20", internal_code: "CTS20NG" }],
      bang: { chatbot_price: [{ internal_code: "CTS20NG", product_name: "GE CTS20", gia_ban: 1000000 }], chatbot_machine_filter: [], chatbot_warranty: [], chatbot_promotion: [] },
    });
    expect(await taoCongCuTra(sb).traMay("CTS20")).not.toContain("NGỪNG BÁN");
  });

  it("bangGia: gom giá các máy đang bán của nhóm", async () => {
    const { sb } = sbGia({
      alias: [{ alias_norm: "CTS20", internal_code: "CTS20NG" }],
      bang: { chatbot_price: [{ internal_code: "CTS20NG", product_name: "GE CTS20", gia_ban: 20000000 }], chatbot_machine_filter: [], chatbot_warranty: [], chatbot_promotion: [] },
    });
    const r = await taoCongCuTra(sb).bangGia("de_ban");
    expect(r).toContain("BẢNG GIÁ NIÊM YẾT MASTERDATA");
    expect(r).toContain("20.000.000 đ");
  });

  it("timTaiLieu: cắt câu 300 ký tự, gọi match_chunks_hybrid, trả tối đa 6 đoạn", async () => {
    vi.stubEnv("OPENAI_API_KEY", "k");
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ data: [{ embedding: VEC, index: 0 }] }), { status: 200 })) as never;
    const rows = Array.from({ length: 8 }, (_u, i) => ({ chunk_id: `c${i}`, document_id: "d", document_title: `T${i}`, content: `nội dung ${i}`, metadata: {}, score: 1 }));
    const rpc = vi.fn(() => ({ data: rows, error: null }));
    const { sb } = sbGia({ rpc });
    const ra = await taoCongCuTra(sb).timTaiLieu("x".repeat(500));
    vi.unstubAllEnvs();
    expect(ra).toHaveLength(6);
    expect(ra[0]).toEqual({ tieuDe: "T0", noiDung: "nội dung 0" });
    const args = (rpc.mock.calls[0] as unknown as [string, Record<string, unknown>]);
    expect(args[0]).toBe("match_chunks_hybrid");
    expect(args[1].p_query_text).toBe("x".repeat(300));
  });

  it("tonKho đọc sales.shopee_stocks; đọc hỏng → ném TON_KHO_DOC", async () => {
    const m = sbGia({ ton: { data: [{ item_name: "Máy", model_name: null, item_sku: "CTS20NG", model_sku: null, item_status: "NORMAL", stock: 1, synced_at: new Date().toISOString() }], error: null } });
    const cc = taoCongCuTra(m.sb);
    expect(await cc.tonKho("CTS20")).toContain("CTS20 — còn hàng");
    expect(m.schema).toHaveBeenCalledWith("sales");
    m.limit.mockResolvedValueOnce({ data: null, error: { message: "x" } } as never);
    await expect(cc.tonKho("CTS20")).rejects.toThrow("TON_KHO_DOC");
  });
});
