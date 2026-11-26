// chép từ GWT-ERP tests/chatbot/pancake-loc.test.ts @c2f3719
import { describe, expect, it } from "vitest";

import type { HoiThoaiPancake, NguoiGui, TinPancake } from "./doc.ts";
import {
  chuTin, coCauBao, dangCho, DAU_BOT, GIAN_DOAN, laKhach, laNhanVien, laTuDong, lichSuHoiThoai, tinKhachDangCho, TRAN_TIN,
} from "./loc.ts";

const ht = (o: Partial<HoiThoaiPancake> = {}): HoiThoaiPancake => ({
  id: "c1", type: "INBOX", seen: false, snippet: "giá?", updated_at: "2026-10-14T03:00:00Z", has_phone: false,
  from: { id: "k1", name: "Khách A" }, last_sent_by: { id: "k1", name: "Khách A", uid: null, admin_id: null }, ...o,
});
const tin = (id: string, message: string, nv = false, o: Partial<TinPancake> = {}): TinPancake => ({
  id, message, inserted_at: `2026-10-14T03:0${id.slice(1)}:00Z`, from: nv ? { admin_id: "a1" } : { id: "k1" }, ...o,
});

// Dạng `from` đo thật 2026-10-14 trên page có Botcake (không PII).
const PAGE = "P1";
const BOTCAKE: NguoiGui = {
  id: PAGE, admin_id: "ad1", admin_name: "Bot Botcake", app_id: 556376998159104, flow_id: "fl1",
  source_type: "rule", source_id: "so1", bot_id: null, broadcast_id: null,
};
const HE_THONG: NguoiGui = { id: PAGE, ai_generated: false };
const KHACH: NguoiGui = { id: "psid1", ai_generated: false };
const NHAN_VIEN: NguoiGui = { id: PAGE, admin_id: "nv1" };
const PAGE_KHONG_ADMIN: NguoiGui = { id: PAGE };
// m(phút, from, chữ, phần thêm): mốc giờ tăng theo phút để dễ đọc thứ tự.
const m = (phut: number, from: NguoiGui, message = "", o: Partial<TinPancake> = {}): TinPancake => ({
  id: `x${phut}`, message, inserted_at: `2026-10-14T03:${String(phut).padStart(2, "0")}:00Z`, from, ...o,
});

describe("gom tin Zalo (đo 2026-10-15)", () => {
  it("chuTin: '@<mã số dài>' (nhắc tên Zalo) → '@…'; '@' trong chữ thường giữ nguyên", () => {
    expect(chuTin(m(1, KHACH, "@1234567890123456789 cho em hỏi giá"))).toBe("@… cho em hỏi giá");
    expect(chuTin(m(1, KHACH, "email a@b.vn, mã @123"))).toBe("email a@b.vn, mã @123");
  });
  it("tinKhachDangCho.anh: link ảnh trong tin khách CHƯA được trả lời, theo thứ tự thời gian, tối đa 4 gần nhất", () => {
    const anh = (phut: number, url: string, type = "photo") => m(phut, KHACH, "", { attachments: [{ type, url }] });
    const ds = [
      anh(9, "https://content.pancake.vn/9.jpg"), anh(8, "https://content.pancake.vn/8.jpg"),
      m(7, KHACH, "", { attachments: [{ type: "document", url: "https://content.pancake.vn/x.pdf" }] }),
      anh(6, "https://content.pancake.vn/6.jpg", "image"), anh(5, "https://content.pancake.vn/5.jpg"),
      anh(4, "https://content.pancake.vn/4.jpg"),
      m(3, NHAN_VIEN, "dạ em gửi"),
      anh(2, "https://content.pancake.vn/2.jpg"),
    ];
    const r = tinKhachDangCho(ds, PAGE);
    expect(r?.anh).toEqual([
      "https://content.pancake.vn/5.jpg", "https://content.pancake.vn/6.jpg",
      "https://content.pancake.vn/8.jpg", "https://content.pancake.vn/9.jpg",
    ]);
    expect(tinKhachDangCho([m(1, KHACH, "chữ thôi")], PAGE)?.anh).toEqual([]);
  });
  it("tinKhachDangCho(sau): chỉ gom tin khách gửi SAU mốc (💬 không lặp tin đã đăng); ảnh cũng chỉ của các tin đó", () => {
    const ds = [
      m(9, KHACH, "tin mới 2"), m(8, KHACH, "", { attachments: [{ type: "photo", url: "https://content.pancake.vn/moi.jpg" }] }),
      m(7, KHACH, "tin mới 1"), m(5, KHACH, "tin đã đăng", { attachments: [{ type: "photo", url: "https://content.pancake.vn/cu.jpg" }] }),
    ];
    const r = tinKhachDangCho(ds, PAGE, undefined, "2026-10-14T03:06:00.000Z");
    expect(r?.text).toBe("tin mới 1\n[ảnh]\ntin mới 2");
    expect(r?.anh).toEqual(["https://content.pancake.vn/moi.jpg"]);
    expect(r?.luc).toBe("2026-10-14T03:09:00Z");
    expect(tinKhachDangCho(ds, PAGE, undefined, "2026-10-14T03:09:00.000Z")).toBeNull(); // đúng mốc = đã đăng
    expect(tinKhachDangCho(ds, PAGE)?.text).toBe("tin đã đăng\ntin mới 1\n[ảnh]\ntin mới 2"); // không mốc: như cũ
  });
  it("tinKhachDangCho quá trần → bỏ tin CŨ NHẤT, giữ tin mới nhất", () => {
    const cu = "c".repeat(TRAN_TIN - 10);
    const r = tinKhachDangCho([m(5, KHACH, "tin mới nhất"), m(3, KHACH, cu)], PAGE);
    expect(r?.text).toBe("tin mới nhất");
  });
});

// Kênh Zalo cá nhân (đo 2026-10-15): nhân viên nhắn cả từ app Zalo → tin từ page KHÔNG mang dấu Pancake. Kênh bật
// nvNgoaiPancake thì tin đó tính là nhân viên trả lời; tin page mang dấu tự động vẫn KHÔNG phải nhân viên.
describe("kênh bật nvNgoaiPancake (pageNgoai = id page)", () => {
  it("laNhanVien: tin page không dấu → nhân viên chỉ khi bật; tin page có dấu tự động → không bao giờ", () => {
    expect(laNhanVien(PAGE_KHONG_ADMIN)).toBe(false);
    expect(laNhanVien(PAGE_KHONG_ADMIN, PAGE)).toBe(true);
    expect(laNhanVien(BOTCAKE, PAGE)).toBe(false);
    expect(laNhanVien(KHACH, PAGE)).toBe(false);
    expect(laNhanVien({ id: "page-khac" }, PAGE)).toBe(false);
  });
  it("dangCho: tin cuối từ page không dấu → hết chờ khi bật, còn chờ khi tắt", () => {
    const h = ht({ last_sent_by: PAGE_KHONG_ADMIN });
    expect(dangCho(h)).toBe(true);
    expect(dangCho(h, PAGE)).toBe(false);
    expect(dangCho(ht({ last_sent_by: BOTCAKE }), PAGE)).toBe(true);
  });
  it("tinKhachDangCho: nhân viên nhắn từ app sau tin khách → không còn chờ khi bật", () => {
    const ds = [m(5, PAGE_KHONG_ADMIN, "dạ em gửi giá"), m(3, KHACH, "giá bao nhiêu")];
    expect(tinKhachDangCho(ds, PAGE)?.text).toBe("giá bao nhiêu");
    expect(tinKhachDangCho(ds, PAGE, PAGE)).toBeNull();
    // Tin tự động sau tin khách vẫn không tính là trả lời.
    expect(tinKhachDangCho([m(5, BOTCAKE, "chào"), m(3, KHACH, "giá bao nhiêu")], PAGE, PAGE)?.text).toBe("giá bao nhiêu");
  });
});

describe("laTuDong / laNhanVien / laKhach", () => {
  it("laTuDong: flow_id, bot_id, broadcast_id, source_type, app_id, ai_generated, is_automated", () => {
    expect(laTuDong({ flow_id: "f" })).toBe(true);
    expect(laTuDong({ bot_id: "b" })).toBe(true);
    expect(laTuDong({ broadcast_id: "b" })).toBe(true);
    expect(laTuDong({ source_type: "rule" })).toBe(true);
    expect(laTuDong({ app_id: 556376998159104 })).toBe(true);
    expect(laTuDong({ ai_generated: true })).toBe(true);
    expect(laTuDong({ is_automated: true })).toBe(true);
    expect(laTuDong(BOTCAKE)).toBe(true);
    expect(laTuDong(NHAN_VIEN)).toBe(false);
    expect(laTuDong(KHACH)).toBe(false);
    expect(laTuDong({ bot_id: null, flow_id: null, ai_generated: false })).toBe(false);
    expect(laTuDong(null)).toBe(false);
  });
  it("laNhanVien: có admin_id/uid VÀ không mang dấu tự động (Botcake có admin_id nhưng không phải người thật)", () => {
    expect(laNhanVien({ admin_id: "a" })).toBe(true);
    expect(laNhanVien({ uid: "u" })).toBe(true);
    expect(laNhanVien(NHAN_VIEN)).toBe(true);
    expect(laNhanVien(BOTCAKE)).toBe(false);
    expect(laNhanVien({ admin_id: "a", flow_id: "f" })).toBe(false);
    expect(laNhanVien({ admin_id: "a", ai_generated: true })).toBe(false);
    expect(laNhanVien({ ai_generated: true })).toBe(false);
    expect(laNhanVien({ is_automated: true })).toBe(false);
    expect(laNhanVien(PAGE_KHONG_ADMIN)).toBe(false); // id = page nhưng không admin_id: chưa chắc là người
    expect(laNhanVien({ id: "k1", admin_id: null, uid: null })).toBe(false);
    expect(laNhanVien(null)).toBe(false);
  });
  it("laKhach: không admin, không phải page, không tự động", () => {
    expect(laKhach(KHACH, PAGE)).toBe(true);
    expect(laKhach({ id: "k1" })).toBe(true);
    expect(laKhach(PAGE_KHONG_ADMIN, PAGE)).toBe(false);
    expect(laKhach(PAGE_KHONG_ADMIN)).toBe(true); // không truyền pageId thì không đoán
    expect(laKhach(NHAN_VIEN, PAGE)).toBe(false);
    expect(laKhach({ uid: "u" }, PAGE)).toBe(false);
    expect(laKhach(BOTCAKE, PAGE)).toBe(false);
    expect(laKhach({ id: "k1", ai_generated: true }, PAGE)).toBe(false);
    expect(laKhach(null, PAGE)).toBe(false);
  });
});

describe("dangCho", () => {
  it("chờ = INBOX + tin cuối chưa phải nhân viên thật; seen không còn quyết định", () => {
    expect(dangCho(ht())).toBe(true);
    expect(dangCho(ht({ seen: true }))).toBe(true);
    expect(dangCho(ht({ type: "COMMENT" }))).toBe(false);
    expect(dangCho(ht({ type: "COMMENT", seen: false }))).toBe(false);
  });
  it("seen: true + last_sent_by khách → vẫn chờ", () => {
    expect(dangCho(ht({ seen: true, last_sent_by: KHACH }))).toBe(true);
  });
  it("last_sent_by Botcake (admin_id + flow_id + source_type rule + app_id) → chờ (ứng viên; đọc tin sẽ quyết)", () => {
    expect(dangCho(ht({ last_sent_by: BOTCAKE }))).toBe(true);
    expect(dangCho(ht({ seen: true, last_sent_by: BOTCAKE }))).toBe(true);
  });
  it("last_sent_by nhân viên (admin_id, không dấu tự động) → hết chờ", () => {
    expect(dangCho(ht({ last_sent_by: NHAN_VIEN }))).toBe(false);
    expect(dangCho(ht({ last_sent_by: { admin_id: "a1" } }))).toBe(false);
    expect(dangCho(ht({ seen: true, last_sent_by: { uid: "u1" } }))).toBe(false);
  });
  it("last_sent_by page không admin (vd trả từ app Facebook / lời chào) → vẫn chờ; ai_generated / is_automated cũng chỉ là ứng viên", () => {
    expect(dangCho(ht({ last_sent_by: PAGE_KHONG_ADMIN }))).toBe(true);
    expect(dangCho(ht({ last_sent_by: { is_automated: true } }))).toBe(true);
    expect(dangCho(ht({ last_sent_by: { ai_generated: true } }))).toBe(true);
  });
  it("chưa có tin cuối (last_sent_by null) + INBOX → vẫn chờ", () => {
    expect(dangCho(ht({ last_sent_by: null }))).toBe(true);
  });
});

describe("chuTin", () => {
  it("ưu tiên original_message, bỏ thẻ HTML, media → nhãn", () => {
    expect(chuTin(tin("m1", "<div>xin <b>giá</b></div>"))).toBe("xin giá");
    expect(chuTin(tin("m1", "<div>x</div>", false, { original_message: "gốc" }))).toBe("gốc");
    expect(chuTin(tin("m1", "<div></div>", false, { attachments: [{ type: "photo" }, { type: "sticker" }] }))).toBe("[ảnh] [sticker]");
    expect(chuTin(tin("m1", "", false, { attachments: [{ type: "video" }, { type: "lạ" }] }))).toBe("[video] [tệp]");
  });
  it("original_message là chữ thuần: không gỡ '<'/'>' kiểu toán, chỉ gom khoảng trắng", () => {
    expect(chuTin(tin("m1", "x", false, { original_message: "giá <5tr, ship >3 ngày" }))).toBe("giá <5tr, ship >3 ngày");
    expect(chuTin(tin("m1", "x", false, { original_message: "  giá   <5tr \n ship " }))).toBe("giá <5tr ship");
  });
  it("loại media lạ trùng thuộc tính của Object (constructor) → [tệp], không lộ hàm", () => {
    expect(chuTin(tin("m1", "", false, { attachments: [{ type: "constructor" }] }))).toBe("[tệp]");
  });
});

describe("tinKhachDangCho", () => {
  it("gom tin khách từ sau tin nhân viên cuối, theo thứ tự thời gian", () => {
    const r = tinKhachDangCho([tin("m4", "còn hàng ko"), tin("m3", "CTS10 giá?"), tin("m2", "Dạ em chào", true), tin("m1", "alo")]);
    expect(r).toMatchObject({ text: "CTS10 giá?\ncòn hàng ko", luc: "2026-10-14T03:04:00Z" });
  });
  it("tin Pancake AI đứng giữa các tin khách cắt khối (tin trước nó đã được trả lời); Pancake AI mới nhất chưa tính là trả lời", () => {
    // Đo 2026-11-26: «Bao tiền bộ lọc này» → Pancake AI báo giá → 1 giờ sau «Cao quá» → bot gom cả hai, báo lại nguyên bảng giá.
    const AI: NguoiGui = { id: PAGE, ai_generated: true };
    const ds = [m(9, AI, "Em hiểu anh thấy mức này cao"), m(8, KHACH, "Cao quá"), m(7, AI, "Giá WH15A ECO …"), m(5, KHACH, "Bao tiền bộ lọc này")];
    expect(tinKhachDangCho(ds, PAGE)).toMatchObject({ text: "Cao quá", dau: m(8, KHACH).inserted_at });
    expect(tinKhachDangCho(ds.slice(1), PAGE)?.text).toBe("Cao quá");
  });
  it("tin mới nhất là của nhân viên → null; rỗng → null", () => {
    expect(tinKhachDangCho([tin("m2", "Dạ", true), tin("m1", "hỏi")])).toBeNull();
    expect(tinKhachDangCho([])).toBeNull();
  });
  it("dòng hệ thống kết bạn của Zalo (mang tên/lời chào người lạ) không phải tin khách — bỏ, không cắt khối", () => {
    const r = tinKhachDangCho([
      tin("m3", "Lát c xem nhé"),
      tin("m2", "Bạn nhận được lời mời kết bạn: Xin chào, mình là X. Kết bạn với mình nhé!"),
      tin("m1", "Bạn vừa kết bạn với Y"),
    ]);
    expect(r).toMatchObject({ text: "Lát c xem nhé", dau: "2026-10-14T03:03:00Z" });
    expect(tinKhachDangCho([tin("m1", "Bạn vừa kết bạn với Y")])).toBeNull();
  });
  it("Zalo khi NV kết bạn trước (đo 2026-10-28): «Bạn vừa gửi lời mời kết bạn tới SĐT…» và «<tên> đã đồng ý kết bạn» cũng là dòng hệ thống", () => {
    const r = tinKhachDangCho([
      tin("m3", "khi nào bên mình qua thay máy cho anh"),
      tin("m2", "Nguyễn Văn A đã đồng ý kết bạn"),
      tin("m1", "Bạn vừa gửi lời mời kết bạn tới SĐT: 0900000000"),
    ]);
    expect(r).toMatchObject({ text: "khi nào bên mình qua thay máy cho anh", dau: "2026-10-14T03:03:00Z" });
  });
  it("cắt TRAN_TIN ký tự", () => {
    expect(tinKhachDangCho([tin("m1", "a".repeat(5000))])!.text).toHaveLength(TRAN_TIN);
  });
  it("cắt TRAN_TIN theo code point: không để nửa surrogate (Postgres từ chối cả lượt)", () => {
    const r = tinKhachDangCho([tin("m1", `${"x".repeat(3999)}😀😀`)])!;
    expect(r.text.isWellFormed()).toBe(true);
    expect(r.text).toBe(`${"x".repeat(3999)}😀`);
  });

  it("Botcake (ảnh + chữ), tin hệ thống, khách, lời chào page không admin, ad_click → chỉ tin khách; luc = giờ tin khách (không phải tin[0])", () => {
    const r = tinKhachDangCho([
      m(10, BOTCAKE, "", { attachments: [{ type: "photo" }] }),
      m(9, BOTCAKE, "Dạ em gửi bảng giá ạ"),
      m(8, HE_THONG, "", { attachments: [{ type: "system_message" }] }),
      m(7, KHACH, "tin thử"),
      m(6, PAGE_KHONG_ADMIN, "Chào bạn, bạn cần tư vấn gì ạ?"),
      m(5, PAGE_KHONG_ADMIN, "", { attachments: [{ type: "ad_click" }] }),
    ], PAGE);
    expect(r).toMatchObject({ text: "tin thử", luc: "2026-10-14T03:07:00Z" });
  });
  it("tin hệ thống / ad_click / template của page (không admin_id) bị bỏ qua dù không truyền pageId", () => {
    expect(tinKhachDangCho([
      m(5, HE_THONG, "", { attachments: [{ type: "system_message" }] }),
      m(4, KHACH, "giá?"),
      m(3, PAGE_KHONG_ADMIN, "Xin chào", { attachments: [{ type: "template" }] }),
      m(2, PAGE_KHONG_ADMIN, "", { attachments: [{ type: "ad_click" }] }),
    ])).toMatchObject({ text: "giá?", luc: "2026-10-14T03:04:00Z" });
  });
  it("nhân viên thật trả lời sau tin khách cuối → null (kể cả khi tin nhân viên mang đính kèm template)", () => {
    expect(tinKhachDangCho([m(2, NHAN_VIEN, "Dạ em báo giá"), m(1, KHACH, "giá?")], PAGE)).toBeNull();
    expect(tinKhachDangCho([m(2, NHAN_VIEN, "", { attachments: [{ type: "template" }] }), m(1, KHACH, "giá?")], PAGE)).toBeNull();
  });
  it("[khách2, Botcake, khách1, nhân viên] → gom khách1 rồi khách2, luc = khách2; dừng ở nhân viên", () => {
    const r = tinKhachDangCho([
      m(4, KHACH, "khách2"), m(3, BOTCAKE, "Dạ em chào"), m(2, KHACH, "khách1"), m(1, NHAN_VIEN, "Dạ"), m(0, KHACH, "cũ hơn nhân viên"),
    ], PAGE);
    expect(r).toMatchObject({ text: "khách1\nkhách2", luc: "2026-10-14T03:04:00Z" });
  });
  it("dau = giờ tin khách CŨ NHẤT được gom (chờ khách ngừng gõ tính trần từ đây); `sau` cắt luôn cả dau", () => {
    const ds = [m(4, KHACH, "khách2"), m(3, BOTCAKE, "Dạ em chào"), m(2, KHACH, "khách1"), m(1, NHAN_VIEN, "Dạ")];
    expect(tinKhachDangCho(ds, PAGE)).toMatchObject({ luc: "2026-10-14T03:04:00Z", dau: "2026-10-14T03:02:00Z" });
    expect(tinKhachDangCho(ds, PAGE, undefined, "2026-10-14T03:03:00Z")).toMatchObject({ luc: "2026-10-14T03:04:00Z", dau: "2026-10-14T03:04:00Z" });
  });
  it("chỉ có Botcake + tin hệ thống, không khách nào → null", () => {
    expect(tinKhachDangCho([m(2, BOTCAKE, "Dạ"), m(1, HE_THONG, "", { attachments: [{ type: "system_message" }] })], PAGE)).toBeNull();
    expect(tinKhachDangCho([m(1, BOTCAKE, "Dạ")], PAGE)).toBeNull();
  });
  it("page trả lời từ app Facebook (from.id = pageId, không admin_id) KHÔNG phải nhân viên: bỏ qua và gom khách (ưu tiên báo thừa)", () => {
    expect(tinKhachDangCho([m(2, PAGE_KHONG_ADMIN, "Dạ"), m(1, KHACH, "hỏi")], PAGE)).toMatchObject({ text: "hỏi", luc: "2026-10-14T03:01:00Z" });
    expect(tinKhachDangCho([m(3, KHACH, "giá?"), m(2, PAGE_KHONG_ADMIN, "Dạ"), m(1, KHACH, "alo")], PAGE))
      .toMatchObject({ text: "alo\ngiá?", luc: "2026-10-14T03:03:00Z" });
  });
  it("tin khách rỗng (không chữ, không đính kèm) → { text: \"\", luc }; bên gọi lùi về snippet", () => {
    expect(tinKhachDangCho([m(1, KHACH, "<div></div>")], PAGE)).toMatchObject({ text: "", luc: "2026-10-14T03:01:00Z" });
    expect(tinKhachDangCho([m(2, BOTCAKE, "Dạ"), m(1, KHACH, "")], PAGE)).toMatchObject({ text: "", luc: "2026-10-14T03:01:00Z" });
  });
  it("tin máy is_automated bị bỏ qua, KHÔNG chặn việc gom về trước nó; Pancake AI (ai_generated) đứng giữa thì cắt (2026-11-26)", () => {
    const r1 = tinKhachDangCho([tin("m3", "CTS10 giá?"), tin("m2", "bot", false, { from: { ai_generated: true } }), tin("m1", "alo")]);
    expect(r1).toMatchObject({ text: "CTS10 giá?", luc: "2026-10-14T03:03:00Z" });
    const r2 = tinKhachDangCho([tin("m3", "còn ko"), tin("m2", "auto", false, { from: { is_automated: true } }), tin("m1", "alo")]);
    expect(r2).toMatchObject({ text: "alo\ncòn ko", luc: "2026-10-14T03:03:00Z" });
  });
});

describe("lichSuHoiThoai — đoạn chat trước tin đang chờ cho nháp + Bắp (2026-10-20)", () => {
  // Mới nhất trước, như Pancake trả: khối đang chờ (phút 9, 8) → NV (7) → khách cũ (6) → Botcake (5) → hệ thống (4) → khách (3).
  const tinDs = [
    m(9, KHACH, "vậy lắp mất bao lâu"), m(8, KHACH, "nhà em ở tầng 3"),
    m(7, NHAN_VIEN, "Dạ CTS20 giá 10 triệu ạ, anh Tuấn để lại địa chỉ: 12 Hàng Bông nhé"),
    m(6, KHACH, "sđt em 0123456789"), m(5, BOTCAKE, "Chào mừng!"),
    m(4, HE_THONG, "", { attachments: [{ type: "ad_click" }] }), m(3, KHACH, "CTS20 giá sao"),
  ];
  it("bỏ `boQua` tin khách mới nhất của khối đang chờ; giữ khách + NV theo thứ tự cũ → mới; bỏ Botcake (2026-10-24) và dòng hệ thống; che PII", () => {
    const r = lichSuHoiThoai(tinDs, PAGE, undefined, 2);
    expect(r.lichSu).toEqual([
      "Khách: CTS20 giá sao", "Khách: sđt em {SĐT}", "GWT: Dạ CTS20 giá 10 triệu ạ, anh {tên} để lại {địa chỉ}",
    ]);
    expect(r.daCoSdt).toBe(true);
  });
  it("tin Pancake AI (ai_generated) có chữ vào lịch sử là GWT — khách đã đọc báo giá đó (đo 2026-11-26: bot bảo khách gửi lại báo giá)", () => {
    const AI: NguoiGui = { id: PAGE, ai_generated: true };
    const r = lichSuHoiThoai([
      m(9, KHACH, "chi phí như bên trên báo giá đúng k"), m(8, NHAN_VIEN, "Dạ em là chuyên viên tư vấn ạ"),
      m(7, AI, "Chúng tôi có WH30A giá 249.950.000đ"), m(6, BOTCAKE, "Chào mừng!"), m(5, KHACH, "tư vấn lọc tổng"),
    ], PAGE, undefined, 1);
    expect(r.lichSu).toEqual(["Khách: tư vấn lọc tổng", "GWT: Chúng tôi có WH30A giá 249.950.000đ", "GWT: Dạ em là chuyên viên tư vấn ạ"]);
  });
  it("khối đang chờ dài hơn boQua → tin khách cũ hơn trong khối vào lịch sử; boQua 0 → cả khối", () => {
    expect(lichSuHoiThoai(tinDs, PAGE, undefined, 1).lichSu[3]).toBe("Khách: nhà em ở tầng 3");
    expect(lichSuHoiThoai(tinDs, PAGE).lichSu.slice(-2)).toEqual(["Khách: nhà em ở tầng 3", "Khách: vậy lắp mất bao lâu"]);
  });
  it("tin bot tự gửi vào lịch sử là GWT, bỏ câu báo + dấu vô hình, KHÔNG cắt khối đang chờ", () => {
    const bot = m(7, PAGE_KHONG_ADMIN, `Dạ, em là trợ lý tự động của GWT. Anh/chị cần hỗ trợ kỹ hơn vui lòng gọi hotline 1900 3363 ạ.\n\nDạ CTS20 có nước nóng ạ.${DAU_BOT}`);
    const r = lichSuHoiThoai([m(9, KHACH, "còn lạnh?"), bot, m(6, KHACH, "có nóng ko"), m(5, NHAN_VIEN, "Dạ em chào anh")], PAGE, undefined, 2);
    expect(r.lichSu).toEqual(["GWT: Dạ em chào anh", "GWT: Dạ CTS20 có nước nóng ạ."]);
    // câu chào mới (2026-10-23): bỏ "Chào anh/chị <tên>! Em là … GE." — tên khách không vào lịch sử
    const moi = m(7, PAGE_KHONG_ADMIN, `Chào anh/chị Minh Anh! Em là trợ lý tự động của máy lọc nước GE. Dạ CTS20 có nước nóng ạ.${DAU_BOT}`);
    const ls = lichSuHoiThoai([m(9, KHACH, "còn lạnh?"), moi, m(6, KHACH, "có nóng ko"), m(5, NHAN_VIEN, "Dạ em chào anh")], PAGE, undefined, 2).lichSu;
    expect(ls).toEqual(["GWT: Dạ em chào anh", "GWT: Dạ CTS20 có nước nóng ạ."]);
     // câu giới thiệu mới của bot GPT (gwt-app): "Em là trợ lý ảo của máy lọc nước GE ạ." cũng bị bỏ
    const gpt = m(7, PAGE_KHONG_ADMIN, `Chào anh Hùng! Em là trợ lý ảo của máy lọc nước GE ạ. Dạ CTS20 có nước nóng ạ.${DAU_BOT}`);
    expect(lichSuHoiThoai([m(9, KHACH, "còn lạnh?"), gpt, m(6, KHACH, "có nóng ko"), m(5, NHAN_VIEN, "Dạ em chào anh")], PAGE, undefined, 2).lichSu)
      .toEqual(["GWT: Dạ em chào anh", "GWT: Dạ CTS20 có nước nóng ạ."]);
    const chau = m(7, PAGE_KHONG_ADMIN, `Chào cô Lan! Cháu là trợ lý ảo của máy lọc nước GE ạ. Dạ CTS20 có nước nóng ạ.${DAU_BOT}`);
    expect(coCauBao(chau.message)).toBe(true);
    expect(lichSuHoiThoai([m(9, KHACH, "còn lạnh?"), chau, m(6, KHACH, "có nóng ko"), m(5, NHAN_VIEN, "Dạ em chào anh")], PAGE, undefined, 2).lichSu)
      .toEqual(["GWT: Dạ em chào anh", "GWT: Dạ CTS20 có nước nóng ạ."]);
 });
  it("trần (nới 2026-10-20): tối đa 40 dòng mới nhất, mỗi dòng ≤ 600 + nhãn, cả khối ≤ 12000 ký tự; không khách nào gửi số → daCoSdt false", () => {
    const dai = Array.from({ length: 60 }, (_, i) => m(59 - i, i % 2 ? NHAN_VIEN : KHACH, `${i} ${"chữ ".repeat(200)}`));
    const r = lichSuHoiThoai(dai, PAGE);
    expect(r.lichSu.length).toBeLessThanOrEqual(40);
    expect(r.lichSu.length).toBeGreaterThanOrEqual(19);
    expect(r.lichSu.every((c) => c.length <= 607)).toBe(true);
    expect(r.lichSu.join("\n").length).toBeLessThanOrEqual(12_000);
    expect(r.lichSu.at(-1)).toMatch(/^Khách: 0 /);
    expect(r.daCoSdt).toBe(false);
    expect(lichSuHoiThoai([m(1, NHAN_VIEN, "hotline 0123456789")], PAGE).daCoSdt).toBe(false); // số của NV không phải khách để số
  });
  // Lỗi 2026-10-22: khách cũ quay lại sau hơn một năm hỏi dòng máy khác — lịch sử không có giờ nên nháp tưởng một mạch, bám máy cũ.
  it("hai tin cách ≥ 7 ngày → chèn dòng \"— cách N ngày —\" đúng chỗ; khoảng cách tới khối đang chờ (đã bỏ) → dòng cuối; < 7 ngày không chèn", () => {
    const luc = (iso: string, from: NguoiGui, message: string) => m(0, from, message, { inserted_at: iso });
    const ds = [
      luc("2026-10-22T03:24:00Z", KHACH, "CTS20 có nước nóng không"),
      luc("2025-08-23T04:06:00Z", NHAN_VIEN, "Dạ WH15A giá niêm yết ạ"),
      luc("2025-08-23T04:05:00Z", KHACH, "WH15A giá sao em"),
      luc("2025-08-10T01:00:00Z", KHACH, "nhà 5 người dùng loại nào"),
      luc("2025-08-08T01:00:00Z", NHAN_VIEN, "Dạ em chào chị"),
    ];
    expect(lichSuHoiThoai(ds, PAGE, undefined, 1).lichSu).toEqual([
      "GWT: Dạ em chào chị", "Khách: nhà 5 người dùng loại nào", `${GIAN_DOAN} 13 ngày —`, "Khách: WH15A giá sao em", "GWT: Dạ WH15A giá niêm yết ạ",
      `${GIAN_DOAN} 424 ngày —`,
    ]);
    expect(lichSuHoiThoai(tinDs, PAGE).lichSu.some((c) => c.startsWith(GIAN_DOAN))).toBe(false);
  });
  it("gwtMoiNhat = giờ tin phía GWT mới nhất (NV, bot tự gửi); Botcake và dòng hệ thống không tính; không có → vắng", () => {
    expect(lichSuHoiThoai(tinDs, PAGE).gwtMoiNhat).toBe("2026-10-14T03:07:00Z");
    expect(lichSuHoiThoai([m(9, KHACH, "giá?"), m(5, BOTCAKE, "Bảng giá đây")], PAGE).gwtMoiNhat).toBeUndefined();
    expect(lichSuHoiThoai([m(9, KHACH, "giá?"), m(4, HE_THONG, "", { attachments: [{ type: "ad_click" }] })], PAGE).gwtMoiNhat).toBeUndefined();
  });
  // Đã chốt 2026-10-24: Botcake sẽ gỡ — bot trả lời như không có Botcake. Từ 2026-10-22 tin Botcake / page không người từng vào lịch
  // sử ("GWT (tự động)") làm nháp bỏ dở câu khách vì "Botcake đã trả lời".
  it("Botcake, lời chào page không người, thẻ template của flow — trước hay sau tin khách đang chờ — đều KHÔNG vào lịch sử", () => {
    const ds = [m(9, BOTCAKE, "Giá CTD50 đây ạ"), m(8, KHACH, "giá bao nhiêu"), m(5, PAGE_KHONG_ADMIN, "Chào mừng!"),
      m(4, PAGE_KHONG_ADMIN, "Thẻ", { attachments: [{ type: "template" }] }), m(3, KHACH, "alo")];
    expect(lichSuHoiThoai(ds, PAGE, undefined, 1).lichSu).toEqual(["Khách: alo"]);
  });
});


describe("coCauBao — nhận cả ba câu báo bot", () => {
  it.each([
    "Chào anh Hùng! Em là trợ lý ảo của máy lọc nước GE ạ.",
    "Chào anh Hùng! Em là trợ lý tự động của máy lọc nước GE ạ.",
    "Dạ, em là trợ lý tự động của GWT. Anh/chị cần hỗ trợ ạ.",
  ])("%s", (s) => expect(coCauBao(s)).toBe(true));
  it("tin thường không phải", () => expect(coCauBao("Dạ CTS20 có nước nóng ạ")).toBe(false));
});
