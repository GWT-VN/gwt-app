import { describe, expect, it, vi } from "vitest";

import type { CauHinh } from "./cau-hinh.ts";
import type { HoiThoaiPancake, TinPancake } from "./doc.ts";
import type { DongHoiThoai, DongLuu, KhoPancake } from "./kho.ts";
import { chayMotLuot } from "./luot.ts";
import type { KetQuaTra, LuongTra } from "./tu-tra.ts";

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

function dung(o: { luc?: string; tinLanGet?: (n: number) => TinPancake[]; cheDo?: CauHinh["cheDo"]; nhom?: string; pl?: object; gui?: () => Promise<string>; kho?: ReturnType<typeof khoGia> } = {}) {
  const luc = o.luc ?? lui(180);
  let n = 0;
  const tinNhan = vi.fn(async () => { n += 1; return (o.tinLanGet ? o.tinLanGet(n) : [tinKhach(luc)]); });
  const gui = vi.fn(o.gui ?? (async () => "id"));
  const bao = { daGui: vi.fn(async () => {}), chuyenNguoi: vi.fn(async () => {}), loi: vi.fn(async () => {}) };
  const soan = vi.fn(async (_l: LuongTra) => TRA);
  const kho = o.kho ?? khoGia();
  const khieu = o.nhom === "khieu_nai";
  const phanLoai = vi.fn(async () => ({ nhom: (o.nhom ?? "hoi_gia") as never, gap: khieu, tomTat: "hỏi giá CTS20", maMay: "CTS20", ...(o.pl ?? {}) }));
  let dem = 0;
  const chay = (bayGio: Date = NOW) => chayMotLuot({
    pageId: PAGE, tenKenh: "Lọc nhỏ", pancake: { dsHoiThoai: async () => [hoiThoai], tinNhan } as never, gui, kho, phanLoai, soan, bao: bao as never,
    ch: CH({ cheDo: o.cheDo ?? "bat" }), dem: { doc: () => dem, tang: () => { dem += 1; } }, now: () => bayGio, nghi: async () => {},
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

  const khach = (id: string, text: string, luc: string): TinPancake => ({ id, message: text, original_message: text, inserted_at: luc, from: { id: "u1", name: "Hùng" } });
  const botTin = (luc: string): TinPancake => ({
    id: "b1", message: "Chào anh! Em là trợ lý ảo của máy lọc nước GE ạ.⁣", inserted_at: luc, from: { id: PAGE },
  });
  const dongCu = (tinKhachLuc: string, soCuoc: DongHoiThoai["soCuoc"], baoLuc: string | null): DongHoiThoai => ({
    pageId: PAGE, conversationId: "c1", tenKhach: "Hùng", tinKhach: "cũ", tinKhachLuc, coSdt: false, nhom: "hoi_gia", gap: false,
    tomTat: "x", maMay: null, phanLoaiLuc: tinKhachLuc, trangThai: "cho", discordThreadId: null, discordBaoLuc: baoLuc, discordDongLuc: null, soCuoc,
  });
  const SO = { nhu_cau: "hỏi CTS20", da_xong: ["đã báo giá"], con_mo: [], xung_ho: { goi: "chị", xung: "em" } } as const;

  it("khối tin cắt tại tin bot: hai mảnh mới chưa yên → chờ; yên rồi → chỉ hỏi mảnh mới, giữ sổ + xưng hô, không giới thiệu lại", async () => {
    const kho = khoGia();
    kho.hang.set("c1", dongCu(lui(3720), SO as never, lui(3590)));
    const tin = [khach("k3", "CTS20 bao tiền?", lui(30)), khach("k2", "máy nào hợp nhà 4 người", lui(60)), botTin(lui(3600)), khach("k1", "chào shop", lui(3720))];
    const t = dung({ kho, tinLanGet: () => tin });
    const r1 = await t.chay();
    expect(r1.gui).toBe(0);
    expect(t.soan).not.toHaveBeenCalled();
    const r2 = await t.chay(new Date(NOW.getTime() + 100_000));
    expect(r2.gui).toBe(1);
    const l = t.soan.mock.calls[0][0] as { cauHoi: string; soCuoc: unknown };
    expect(l.cauHoi).toBe("máy nào hợp nhà 4 người\nCTS20 bao tiền?");
    expect(l.soCuoc).toMatchObject({ nhu_cau: "hỏi CTS20" });
    const dau = (t.gui.mock.calls[0] as unknown as string[])[1];
    expect(dau).toMatch(/^Dạ chị/);
    expect(dau).not.toContain("trợ lý ảo");
  });

  it("khách quay lại sau 8 ngày, hai mảnh qua hai lượt → sổ cũ bị bỏ", async () => {
    const kho = khoGia();
    const tam = 8 * 86400;
    kho.hang.set("c1", dongCu(lui(260), SO as never, null)); // mảnh đầu của chính khối, lượt trước ghi
    const tin = [khach("k3", "còn hàng không", lui(200)), khach("k2", "chào shop", lui(260)), botTin(lui(tam)), khach("k0", "hỏi cũ", lui(tam + 3600))];
    const t = dung({ kho, tinLanGet: () => tin });
    await t.chay();
    expect((t.soan.mock.calls[0][0] as { soCuoc: unknown }).soCuoc).toBeNull();
  });

  it("ghiSoCuoc hỏng sau khi gửi → dòng vẫn đóng, lượt sau không gửi lại", async () => {
    const kho = khoGia();
    kho.ghiSoCuoc = async () => { throw new Error("kho_pancake_ghi_so_cuoc"); };
    const ghi = vi.spyOn(kho, "ghiBaoLuc");
    const dd = vi.spyOn(kho, "danhDauXuLy");
    const t = dung({ kho });
    t.soan.mockResolvedValue({ ...TRA, soCuoc: { nhu_cau: "hỏi giá", da_xong: [], con_mo: [] } });
    const r1 = await t.chay();
    expect(r1.gui).toBe(1);
    expect(ghi).toHaveBeenCalled();
    expect(dd).toHaveBeenCalled();
    expect(kho.hang.get("c1")!.trangThai).toBe("da_xu_ly");
    const gui1 = t.gui.mock.calls.length;
    expect((await t.chay()).gui).toBe(0);
    expect(t.gui.mock.calls.length).toBe(gui1);
  });

  it("bot đã trả lời sau tin khách ngay ở lần GET đầu → không soạn", async () => {
    const t = dung({ tinLanGet: (n) => (n >= 2 ? [botTin(lui(20)), tinKhach(lui(180))] : [tinKhach(lui(180))]) });
    await t.chay();
    expect(t.soan).not.toHaveBeenCalled();
    expect(t.gui).not.toHaveBeenCalled();
  });

  it("mã lỗi toàn chữ số (như SĐT) thành mã chung", async () => {
    const t = dung({ gui: async () => { throw Object.assign(new Error("x"), { code: "1234567" }); } });
    await t.chay();
    expect(t.bao.loi.mock.calls[0]).toMatchObject([{ ma: "LOI_KHONG_RO" }]);
    const t2 = dung();
    t2.kho.docTrangThai = async () => { throw new Error("1234567"); };
    expect(await t2.chay()).toMatchObject({ viec: "loi", loi: "LOI_KHONG_RO" });
  });

  it("đoán giới từ tên: nam + Hùng → 'Chào anh Hùng!', soan nhận xưng hô mặc định; sổ không lưu đoán", async () => {
    const t = dung({ pl: { gioi: "nam", tenGoi: "Hùng" } });
    t.soan.mockResolvedValue({ ...TRA, xungHo: { goi: "anh", xung: "em" } });
    await t.chay();
    expect((t.soan.mock.calls[0][0] as { soCuoc: { xung_ho: unknown } }).soCuoc.xung_ho).toEqual({ goi: "anh", xung: "em" });
    expect((t.gui.mock.calls[0] as unknown as string[])[1]).toMatch(/^Chào anh Hùng! Em là trợ lý ảo/);
    expect(t.kho.hang.get("c1")!.soCuoc?.xung_ho).toBeUndefined();
  });

  it("không rõ giới → 'Chào anh/chị!' không tên; xưng hô đã học (cô) thắng đoán nam", async () => {
    const t0 = dung({ pl: { gioi: "khong_ro", tenGoi: null } });
    await t0.chay();
    expect((t0.gui.mock.calls[0] as unknown as string[])[1]).toMatch(/^Chào anh\/chị! Em là/);

    const kho = khoGia();
    kho.hang.set("c1", dongCu(lui(3720), { ...SO, xung_ho: { goi: "cô", xung: "chau" } } as never, null));
    const bot2: TinPancake = { id: "b2", message: "Dạ ạ⁣", inserted_at: lui(3600), from: { id: PAGE } };
    const tin = [khach("k2", "CTS20 giá?", lui(180)), bot2, khach("k0", "chào", lui(3720))];
    const t = dung({ kho, tinLanGet: () => tin, pl: { gioi: "nam", tenGoi: "Hùng" } });
    await t.chay();
    expect((t.soan.mock.calls[0][0] as { soCuoc: { xung_ho: unknown } }).soCuoc.xung_ho).toEqual({ goi: "cô", xung: "chau" });
    expect((t.gui.mock.calls[0] as unknown as string[])[1]).toMatch(/^Chào cô Hùng! Cháu là/);
  });
});
