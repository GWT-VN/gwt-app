// chép từ GWT-ERP tests/chatbot/pancake-kho.test.ts @c2f3719 (bỏ ghiDiscord/dsCanDong/xoaCu, thêm ghiBaoLuc + hetHanCho xoá sổ; client đã gắn schema chatbot)
import { describe, expect, it, vi } from "vitest";

import { taoKhoPancake, type DongHoiThoai } from "./kho.ts";

type KQ = { data?: unknown; error?: { code?: string; message?: string } | null; count?: number | null };

/** Client giả: mỗi `from()` ghi tên bảng + chuỗi lời gọi, rồi await trả kết quả kế tiếp trong hàng đợi. */
function sbGia(...ketQua: KQ[]) {
  const nhatKy: Array<{ bang: string; goi: Array<[string, unknown[]]> }> = [];
  const hang = [...ketQua];
  const from = vi.fn((bang: string) => {
    const muc = { bang, goi: [] as Array<[string, unknown[]]> };
    nhatKy.push(muc);
    const b: unknown = new Proxy({}, {
      get(_, ten: string) {
        if (ten === "then") {
          const kq = { data: null, error: null, count: null, ...(hang.shift() ?? {}) };
          return (res: (v: unknown) => unknown) => res(kq);
        }
        return (...args: unknown[]) => { muc.goi.push([ten, args]); return b; };
      },
    });
    return b;
  });
  return { sb: { from } as never, nhatKy };
}
const goiCua = (m: { goi: Array<[string, unknown[]]> }, ten: string) => m.goi.filter(([t]) => t === ten).map(([, a]) => a);

const dong: DongHoiThoai = {
  pageId: "P1", conversationId: "c1", tenKhach: "Khách A", tinKhach: "giá?", tinKhachLuc: "2026-10-14T03:00:00.000Z",
  coSdt: false, nhom: "hoi_gia", gap: false, tomTat: "Hỏi giá", maMay: null, phanLoaiLuc: "2026-10-14T03:00:05.000Z",
  trangThai: "cho", discordThreadId: null, discordBaoLuc: null, discordDongLuc: null, soCuoc: null,
};
/** Hàng DB khớp `dong` (đúng tên cột); đổi conversation_id cho bài test lô. */
const hangDb = (conversationId: string) => ({
  page_id: "P1", conversation_id: conversationId, ten_khach: "Khách A", tin_khach: "giá?", tin_khach_luc: dong.tinKhachLuc,
  co_sdt: false, nhom: "hoi_gia", gap: false, tom_tat: "Hỏi giá", ma_may: null, phan_loai_luc: dong.phanLoaiLuc,
  trang_thai: "cho", discord_thread_id: null, discord_bao_luc: null, discord_dong_luc: null,
});
const idsLon = (n: number) => Array.from({ length: n }, (_, i) => `c${i}`);

describe("taoKhoPancake", () => {
  it("giuKhoa: upsert dòng rồi update có điều kiện khoá cũ/null; có dòng trả về → true", async () => {
    const a = sbGia({}, { data: [{ page_id: "P1" }] });
    const now = new Date("2026-10-14T03:00:00Z");
    expect(await taoKhoPancake(a.sb).giuKhoa("P1", now)).toBe(true);
    expect(a.nhatKy[0].bang).toBe("pancake_sync_state");
    expect(goiCua(a.nhatKy[0], "upsert")[0]).toEqual([{ page_id: "P1" }, { onConflict: "page_id", ignoreDuplicates: true }]);
    expect(goiCua(a.nhatKy[1], "update")[0]).toEqual([{ dang_chay_tu: now.toISOString() }]);
    expect(goiCua(a.nhatKy[1], "or")[0]).toEqual([`dang_chay_tu.is.null,dang_chay_tu.lt.${new Date(now.getTime() - 300_000).toISOString()}`]);
    expect(goiCua(a.nhatKy[1], "eq")).toContainEqual(["page_id", "P1"]);
    expect(goiCua(a.nhatKy[1], "select")[0]).toEqual(["page_id"]);
    expect(await taoKhoPancake(sbGia({}, { data: [] }).sb).giuKhoa("P1", now)).toBe(false);
  });

  it("nhaKhoa: luôn nhả dang_chay_tu = null, chỉ ghi thêm trường được truyền", async () => {
    const a = sbGia({});
    await taoKhoPancake(a.sb).nhaKhoa("P1", { lanChayCuoi: "x" });
    expect(goiCua(a.nhatKy[0], "update")[0]).toEqual([{ dang_chay_tu: null, lan_chay_cuoi: "x" }]);
    expect(goiCua(a.nhatKy[0], "eq")).toContainEqual(["page_id", "P1"]);
    const b = sbGia({});
    await taoKhoPancake(b.sb).nhaKhoa("P1", {});
    expect(goiCua(b.nhatKy[0], "update")[0]).toEqual([{ dang_chay_tu: null }]);
  });

  it("docTrangThai: maybeSingle; không có dòng → null; mốc giờ chuẩn hoá ISO", async () => {
    expect(await taoKhoPancake(sbGia({ data: null }).sb).docTrangThai("P1")).toBeNull();
    const a = sbGia({ data: { lan_chay_cuoi: "2026-10-14T03:00:00+00:00", token_loi_luc: "2026-10-14T04:00:00Z" } });
    expect(await taoKhoPancake(a.sb).docTrangThai("P1")).toEqual({
      lanChayCuoi: "2026-10-14T03:00:00.000Z", tokenLoiLuc: "2026-10-14T04:00:00.000Z",
    });
    expect(goiCua(a.nhatKy[0], "select")[0]).toEqual(["lan_chay_cuoi,token_loi_luc"]); // expand-contract: không đọc tong_hop_gan_nhat
    expect(goiCua(a.nhatKy[0], "maybeSingle")).toHaveLength(1);
    expect(goiCua(a.nhatKy[0], "eq")).toContainEqual(["page_id", "P1"]);
  });

  it("luuHoiThoai: upsert đủ cột snake_case + cap_nhat_luc", async () => {
    const a = sbGia({});
    await taoKhoPancake(a.sb).luuHoiThoai(dong);
    const [hang, tuy] = goiCua(a.nhatKy[0], "upsert")[0] as [Record<string, unknown>, unknown];
    expect(hang).toMatchObject({
      page_id: "P1", conversation_id: "c1", ten_khach: "Khách A", tin_khach: "giá?", tin_khach_luc: dong.tinKhachLuc,
      co_sdt: false, nhom: "hoi_gia", gap: false, tom_tat: "Hỏi giá", ma_may: null, phan_loai_luc: dong.phanLoaiLuc,
      trang_thai: "cho",
    });
    expect(hang).not.toHaveProperty("da_bao_gap_luc"); // expand-contract: cột đợt 1 không còn được ghi
    expect(hang).not.toHaveProperty("discord_thread_id");
    expect(hang).not.toHaveProperty("discord_bao_luc");
    expect(hang).not.toHaveProperty("discord_dong_luc");
    expect(typeof hang.cap_nhat_luc).toBe("string");
    expect(tuy).toEqual({ onConflict: "page_id,conversation_id" });
  });

  it("luuHoiThoai: cắt tin_khach ≤ 4000 và ten_khach ≤ 200 theo CHECK của bảng", async () => {
    const a = sbGia({});
    await taoKhoPancake(a.sb).luuHoiThoai({ ...dong, tinKhach: "x".repeat(5000), tenKhach: "y".repeat(300) });
    const [hang] = goiCua(a.nhatKy[0], "upsert")[0] as [Record<string, unknown>];
    expect((hang.tin_khach as string).length).toBe(4000);
    expect((hang.ten_khach as string).length).toBe(200);
    const b = sbGia({});
    await taoKhoPancake(b.sb).luuHoiThoai({ ...dong, tinKhach: `${"x".repeat(3999)}😀😀` });
    const [hb] = goiCua(b.nhatKy[0], "upsert")[0] as [Record<string, unknown>];
    expect(hb.tin_khach).toBe(`${"x".repeat(3999)}😀`); // không để nửa surrogate
  });

  it("luuHoiThoai: mọi chữ ghi xuống đều well-formed — nửa surrogate lẻ không lọt tới Postgres", async () => {
    const lonThuaDau = "\ud83d";
    const a = sbGia({});
    await taoKhoPancake(a.sb).luuHoiThoai({
      ...dong, tinKhach: `${"x".repeat(3999)}${lonThuaDau}`, tenKhach: `Khách${lonThuaDau}`, tomTat: `Hỏi giá${lonThuaDau}`, maMay: `CTS10${lonThuaDau}`,
    });
    const [hang] = goiCua(a.nhatKy[0], "upsert")[0] as [Record<string, string>];
    for (const cot of ["tin_khach", "ten_khach", "tom_tat", "ma_may"]) expect([cot, hang[cot].isWellFormed()]).toEqual([cot, true]);
    expect(hang.tin_khach).toHaveLength(4000);
  });

  it("luuHoiThoai: tom_tat ≤ 80 và ma_may ≤ 64 theo code point; null giữ null", async () => {
    const a = sbGia({});
    await taoKhoPancake(a.sb).luuHoiThoai({ ...dong, tomTat: "😀".repeat(100), maMay: "m".repeat(100) });
    const [hang] = goiCua(a.nhatKy[0], "upsert")[0] as [Record<string, string>];
    expect([...hang.tom_tat]).toHaveLength(80);
    expect(hang.ma_may).toHaveLength(64);
    const b = sbGia({});
    await taoKhoPancake(b.sb).luuHoiThoai({ ...dong, tenKhach: null, tomTat: null, maMay: null });
    const [hb] = goiCua(b.nhatKy[0], "upsert")[0] as [Record<string, unknown>];
    expect([hb.ten_khach, hb.tom_tat, hb.ma_may]).toEqual([null, null, null]);
  });

  it("docHoiThoai: map theo conversation_id, đổi về camelCase; ids rỗng → không gọi DB", async () => {
    const a = sbGia({ data: [{ page_id: "P1", conversation_id: "c1", ten_khach: "Khách A", tin_khach: "giá?",
      tin_khach_luc: dong.tinKhachLuc, co_sdt: false, nhom: "hoi_gia", gap: false, tom_tat: "Hỏi giá", ma_may: null,
      phan_loai_luc: dong.phanLoaiLuc, trang_thai: "cho", discord_thread_id: null, discord_bao_luc: null,
      discord_dong_luc: null }] });
    const m = await taoKhoPancake(a.sb).docHoiThoai("P1", ["c1"]);
    expect(m.get("c1")).toEqual(dong);
    expect(goiCua(a.nhatKy[0], "in")[0]).toEqual(["conversation_id", ["c1"]]);
    expect(goiCua(a.nhatKy[0], "eq")).toContainEqual(["page_id", "P1"]);
    expect(goiCua(a.nhatKy[0], "select")[0][0]).not.toContain("da_bao_gap_luc");
    const b = sbGia();
    expect((await taoKhoPancake(b.sb).docHoiThoai("P1", [])).size).toBe(0);
    expect(b.nhatKy).toHaveLength(0);
  });

  it("docHoiThoai: 250 id → 3 truy vấn lô 100/100/50, gộp một Map", async () => {
    const a = sbGia({ data: [hangDb("c0")] }, { data: [hangDb("c100")] }, { data: [hangDb("c200")] });
    const m = await taoKhoPancake(a.sb).docHoiThoai("P1", idsLon(250));
    expect(a.nhatKy).toHaveLength(3);
    expect(a.nhatKy.map((n) => (goiCua(n, "in")[0][1] as string[]).length)).toEqual([100, 100, 50]);
    expect(Array.from(m.keys())).toEqual(["c0", "c100", "c200"]);
  });

  it("dsCho: trang_thai 'cho', order tin_khach_luc tăng dần, đổi về camelCase", async () => {
    const a = sbGia({ data: [hangDb("c1")] });
    expect(await taoKhoPancake(a.sb).dsCho("P1")).toEqual([dong]);
    expect(goiCua(a.nhatKy[0], "eq")).toEqual([["page_id", "P1"], ["trang_thai", "cho"]]);
    expect(goiCua(a.nhatKy[0], "order")[0]).toEqual(["tin_khach_luc", { ascending: true }]);
  });

  it("ghiSoCuoc: chỉ ghi so_cuoc đã che PII (không đụng cap_nhat_luc); sổ rỗng → không gọi DB; đọc so_cuoc → soCuoc", async () => {
    const a = sbGia({}, {});
    const k = taoKhoPancake(a.sb);
    await k.ghiSoCuoc("P1", "c1", { nhu_cau: "gọi 0912345678", da_xong: [], con_mo: [] }); // pii-ok: SĐT giả
    await k.ghiSoCuoc!("P1", "c1", { nhu_cau: " ", da_xong: [], con_mo: [] });
    expect(a.nhatKy).toHaveLength(1);
    expect(goiCua(a.nhatKy[0], "update")[0]).toEqual([{ so_cuoc: { nhu_cau: "gọi {SĐT}", da_xong: [], con_mo: [] } }]);
    expect(goiCua(a.nhatKy[0], "eq")).toEqual([["page_id", "P1"], ["conversation_id", "c1"]]);
    const b = sbGia({ data: [{ ...hangDb("c1"), so_cuoc: { nhu_cau: "nhà 4 người", da_xong: ["đã báo giá"], con_mo: [] } }] });
    expect((await taoKhoPancake(b.sb).docHoiThoai("P1", ["c1"])).get("c1")?.soCuoc).toEqual({ nhu_cau: "nhà 4 người", da_xong: ["đã báo giá"], con_mo: [] });
  });

  it("docHoiThoai: mốc discord_* chuẩn hoá ISO", async () => {
    const a = sbGia({ data: [{ ...hangDb("c1"), discord_thread_id: "900001", discord_bao_luc: "2026-10-14T03:00:00+00:00", discord_dong_luc: "2026-10-14T04:00:00+00:00" }] });
    const m = await taoKhoPancake(a.sb).docHoiThoai("P1", ["c1"]);
    expect(m.get("c1")).toMatchObject({ discordThreadId: "900001", discordBaoLuc: "2026-10-14T03:00:00.000Z", discordDongLuc: "2026-10-14T04:00:00.000Z" });
    expect(goiCua(a.nhatKy[0], "select")[0][0]).toMatch(/discord_thread_id.*discord_bao_luc.*discord_dong_luc/);
  });

  it("ghiBaoLuc: chỉ ghi discord_bao_luc + cap_nhat_luc, khoá theo page_id và conversation_id", async () => {
    const a = sbGia({});
    await taoKhoPancake(a.sb).ghiBaoLuc("P1", "c1", "2026-10-14T03:00:00.000Z");
    expect(goiCua(a.nhatKy[0], "update")[0]).toEqual([{ discord_bao_luc: "2026-10-14T03:00:00.000Z", cap_nhat_luc: expect.any(String) }]);
    expect(goiCua(a.nhatKy[0], "eq")).toEqual([["page_id", "P1"], ["conversation_id", "c1"]]);
  });

  it("danhDauXuLy chỉ dòng 'cho'; hetHanCho: 2 update (cho→da_xu_ly và so_cuoc=null) đều lọc page_id + tin_khach_luc < truoc; không xoá dòng", async () => {
    const a = sbGia({}, {}, {});
    const k = taoKhoPancake(a.sb);
    await k.danhDauXuLy("P1", ["c1"]);
    await k.hetHanCho("P1", new Date("2026-10-07T03:00:00Z"));
    expect(goiCua(a.nhatKy[0], "update")[0]).toEqual([{ trang_thai: "da_xu_ly", cap_nhat_luc: expect.any(String) }]);
    expect(goiCua(a.nhatKy[0], "eq")).toEqual([["page_id", "P1"], ["trang_thai", "cho"]]);
    expect(goiCua(a.nhatKy[0], "in")[0]).toEqual(["conversation_id", ["c1"]]);
    expect(a.nhatKy).toHaveLength(3);
    expect(goiCua(a.nhatKy[1], "update")[0]).toEqual([{ trang_thai: "da_xu_ly", cap_nhat_luc: expect.any(String) }]);
    expect(goiCua(a.nhatKy[1], "eq")).toEqual([["page_id", "P1"], ["trang_thai", "cho"]]);
    expect(goiCua(a.nhatKy[1], "lt")[0]).toEqual(["tin_khach_luc", "2026-10-07T03:00:00.000Z"]);
    expect(goiCua(a.nhatKy[2], "update")[0]).toEqual([{ so_cuoc: null }]);
    expect(goiCua(a.nhatKy[2], "eq")).toEqual([["page_id", "P1"]]);
    expect(goiCua(a.nhatKy[2], "lt")[0]).toEqual(["tin_khach_luc", "2026-10-07T03:00:00.000Z"]);
    for (const n of a.nhatKy) expect(goiCua(n, "delete")).toHaveLength(0);
  });

  it("danhDauXuLy: 250 id → 3 update lô 100/100/50; lỗi một lô → ném mã và dừng ngay lô đó", async () => {
    const a = sbGia({}, {}, {});
    await taoKhoPancake(a.sb).danhDauXuLy("P1", idsLon(250));
    expect(a.nhatKy.map((n) => (goiCua(n, "in")[0][1] as string[]).length)).toEqual([100, 100, 50]);
    const b = sbGia({}, { error: { code: "XX" } }, {});
    await expect(taoKhoPancake(b.sb).danhDauXuLy("P1", idsLon(250))).rejects.toThrow(/^kho_pancake_danh_dau_xu_ly$/);
    expect(b.nhatKy).toHaveLength(2);
  });

  it("mọi lời gọi chạm đúng bảng chatbot.pancake_* của client", async () => {
    const a = sbGia();
    const k = taoKhoPancake(a.sb);
    await k.giuKhoa("P1", new Date());
    await k.docTrangThai("P1");
    await k.nhaKhoa("P1", {});
    await k.docHoiThoai("P1", ["c1"]);
    await k.luuHoiThoai(dong);
    await k.dsCho("P1");
    await k.ghiBaoLuc("P1", "c1", dong.tinKhachLuc);
    expect(a.nhatKy.every((n) => n.bang.startsWith("pancake_"))).toBe(true);
  });

  it("lỗi DB → ném mã ngắn, không kèm dữ liệu", async () => {
    await expect(taoKhoPancake(sbGia({ error: { code: "XX", message: "tin khách nhạy cảm" } }).sb).dsCho("P1"))
      .rejects.toThrow(/^kho_pancake_ds_cho$/);
  });
});
