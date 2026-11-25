import { describe, expect, it, vi } from "vitest";

import type { CauHinh } from "./cau-hinh.ts";
import type { HoiThoaiPancake, TinPancake } from "./doc.ts";
import type { DongHoiThoai, DongLuu, KhoPancake } from "./kho.ts";
import { chayMotLuot } from "./luot.ts";
import type { KetQuaTra } from "./tu-tra.ts";

const PAGE = "P1";
const NOW = new Date("2026-11-25T14:00:00.000Z"); // 21:00 giờ VN, thứ tư → ngoài giờ làm
const lui = (giay: number) => new Date(NOW.getTime() - giay * 1000).toISOString();

const CH = (o: Partial<CauHinh> = {}): CauHinh => ({
  cheDo: "bat", trang: [], trangGui: new Set([PAGE]),
  gioLam: { ngay: new Set([1, 2, 3, 4, 5, 6]), tu: 480, den: 1080 }, gioBot: null,
  hotline: "0900000000", tranNgay: 20, modelPhanLoai: "m", modelTraLoi: "m", webhook: "w", demDir: "/tmp", ...o,
});

const tinKhach = (luc: string): TinPancake => ({
  id: "m1", message: "CTS20 giá bao nhiêu?", original_message: "CTS20 giá bao nhiêu?", inserted_at: luc, from: { id: "u1", name: "Hùng" },
});
const tinNv = (luc: string): TinPancake => ({
  id: "m2", message: "Em chào anh", original_message: "Em chào anh", inserted_at: luc, from: { id: "a1", admin_id: "ad1", name: "NV" },
});
const hoiThoai: HoiThoaiPancake = {
  id: "c1", type: "INBOX", seen: false, snippet: "", updated_at: lui(60), has_phone: false,
  from: { id: "u1", name: "Hùng" }, last_sent_by: { id: "u1" },
};
const TRA: KetQuaTra = {
  traLoi: "Máy CTS20 giá 10 triệu.\n\nBảo hành 12 tháng.", canNv: false, khongTraLoi: false, lyDo: "", chanTuGui: [], xungHo: null, soCuoc: null,
};

function khoGia(): KhoPancake & { hang: Map<string, DongHoiThoai>; khoa: Set<string> } {
  const hang = new Map<string, DongHoiThoai>();
  const khoa = new Set<string>();
  return {
    hang, khoa,
    docTrangThai: async () => null,
    giuKhoa: async (p) => { if (khoa.has(p)) return false; khoa.add(p); return true; },
    nhaKhoa: async (p) => { khoa.delete(p); },
    docHoiThoai: async (_p, ids) => new Map(ids.filter((i) => hang.has(i)).map((i) => [i, hang.get(i)!])),
    luuHoiThoai: async (d: DongLuu) => {
      const cu = hang.get(d.conversationId);
      hang.set(d.conversationId, { discordThreadId: null, discordBaoLuc: cu?.discordBaoLuc ?? null, discordDongLuc: null, soCuoc: cu?.soCuoc ?? null, ...d });
    },
    danhDauXuLy: async (_p, ids) => { for (const i of ids) { const h = hang.get(i); if (h && h.trangThai === "cho") h.trangThai = "da_xu_ly"; } },
    dsCho: async () => [...hang.values()].filter((h) => h.trangThai === "cho").sort((a, b) => a.tinKhachLuc.localeCompare(b.tinKhachLuc)),
    ghiBaoLuc: async (_p, id, luc) => { hang.get(id)!.discordBaoLuc = luc; },
    hetHanCho: async () => {},
    ghiSoCuoc: async (_p, id, so) => { hang.get(id)!.soCuoc = so; },
  };
}

function dung(o: { luc?: string; tinLanGet?: (n: number) => TinPancake[]; cheDo?: CauHinh["cheDo"]; nhom?: string; gui?: () => Promise<string>; kho?: ReturnType<typeof khoGia> } = {}) {
  const luc = o.luc ?? lui(180);
  let n = 0;
  const tinNhan = vi.fn(async () => { n += 1; return (o.tinLanGet ? o.tinLanGet(n) : [tinKhach(luc)]); });
  const gui = vi.fn(o.gui ?? (async () => "id"));
  const bao = { daGui: vi.fn(async () => {}), chuyenNguoi: vi.fn(async () => {}), loi: vi.fn(async () => {}) };
  const soan = vi.fn(async () => TRA);
  const kho = o.kho ?? khoGia();
  const khieu = o.nhom === "khieu_nai";
  const phanLoai = vi.fn(async () => ({ nhom: (o.nhom ?? "hoi_gia") as never, gap: khieu, tomTat: "hỏi giá CTS20", maMay: "CTS20" }));
  let dem = 0;
  const chay = () => chayMotLuot({
    pageId: PAGE, tenKenh: "Lọc nhỏ", pancake: { dsHoiThoai: async () => [hoiThoai], tinNhan } as never, gui, kho, phanLoai, soan, bao: bao as never,
    ch: CH({ cheDo: o.cheDo ?? "bat" }), dem: { doc: () => dem, tang: () => { dem += 1; } }, now: () => NOW, nghi: async () => {},
  });
  return { chay, tinNhan, gui, bao, soan, kho, phanLoai };
}

describe("chayMotLuot", () => {
  it("(a) hỏi giá, khách yên 3 phút, bat → gửi đủ tin, báo 1 lần, ghiBaoLuc 1 lần", async () => {
    const t = dung();
    const ghi = vi.spyOn(t.kho, "ghiBaoLuc");
    const r = await t.chay();
    expect(r).toMatchObject({ viec: "xong", gui: 1, thu: 0, chuyen: 0 });
    expect(t.gui.mock.calls.length).toBeGreaterThanOrEqual(2);
    for (const c of t.gui.mock.calls) expect((c as unknown as string[])[1]).toMatch(/⁣$/);
    expect(t.bao.daGui).toHaveBeenCalledTimes(1);
    expect(ghi).toHaveBeenCalledTimes(1);
    expect(t.kho.hang.get("c1")!.trangThai).toBe("da_xu_ly");
    expect(t.kho.khoa.size).toBe(0);
  });

  it("(b) lần GET thứ hai có tin NV mới hơn → không gửi, không báo", async () => {
    const t = dung({ tinLanGet: (n) => (n >= 3 ? [tinNv(lui(10)), tinKhach(lui(180))] : [tinKhach(lui(180))]) });
    const r = await t.chay();
    expect(r.gui).toBe(0);
    expect(t.gui).not.toHaveBeenCalled();
    expect(t.bao.daGui).not.toHaveBeenCalled();
    expect(t.bao.chuyenNguoi).not.toHaveBeenCalled();
  });

  it("(c) khách gõ 40 giây trước → chưa xử lý lượt này", async () => {
    const t = dung({ luc: lui(40) });
    const r = await t.chay();
    expect(r).toMatchObject({ viec: "xong", gui: 0, chuyen: 0 });
    expect(t.soan).not.toHaveBeenCalled();
    expect(t.gui).not.toHaveBeenCalled();
    expect(t.kho.hang.get("c1")!.trangThai).toBe("cho");
  });

  it("(d) khieu_nai → chuyenNguoi 1 lần, lượt sau cùng tinKhachLuc không báo lại", async () => {
    const t = dung({ nhom: "khieu_nai" });
    expect((await t.chay()).chuyen).toBe(1);
    expect((await t.chay()).chuyen).toBe(0);
    expect(t.bao.chuyenNguoi).toHaveBeenCalledTimes(1);
    expect(t.soan).not.toHaveBeenCalled();
    expect(t.gui).not.toHaveBeenCalled();
  });

  it("(e) thu → không gửi khách, bao.daGui({thu:true}) 1 lần", async () => {
    const t = dung({ cheDo: "thu" });
    const r = await t.chay();
    expect(r).toMatchObject({ gui: 0, thu: 1 });
    expect(t.gui).not.toHaveBeenCalled();
    expect(t.bao.daGui).toHaveBeenCalledTimes(1);
    expect(t.bao.daGui.mock.calls[0]).toMatchObject([{ thu: true }]);
  });

  it("(f) tin khách 45 phút trước → boQuaCu=1, không báo, không gửi", async () => {
    const t = dung({ luc: lui(45 * 60) });
    const r = await t.chay();
    expect(r.boQuaCu).toBe(1);
    expect(t.soan).not.toHaveBeenCalled();
    expect(t.bao.daGui).not.toHaveBeenCalled();
    expect(t.bao.chuyenNguoi).not.toHaveBeenCalled();
  });

  it("(g) gửi tin đầu hỏng → bao.loi 1 lần, không thử lại", async () => {
    const t = dung({ gui: async () => { throw new Error("GUI_KHACH_HTTP_500"); } });
    const r = await t.chay();
    expect(t.gui).toHaveBeenCalledTimes(1);
    expect(t.bao.loi).toHaveBeenCalledTimes(1);
    expect(t.bao.daGui).not.toHaveBeenCalled();
    expect(r.gui).toBe(0);
  });

  it("tat → không đọc gì; ngoài khung giờ bot → ngoai_gio", async () => {
    const t = dung({ cheDo: "tat" });
    expect((await t.chay()).viec).toBe("tat");
    expect(t.tinNhan).not.toHaveBeenCalled();
    const sang = await chayMotLuot({
      pageId: PAGE, tenKenh: "k", pancake: {} as never, kho: khoGia(), phanLoai: vi.fn(), soan: vi.fn(), bao: {} as never,
      ch: CH(), dem: { doc: () => 0, tang() {} }, now: () => new Date("2026-11-25T03:00:00.000Z"), // 10:00 VN, giờ làm
    });
    expect(sang.viec).toBe("ngoai_gio");
  });
});
