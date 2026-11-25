// chép từ GWT-ERP tests/chatbot/pancake-tu-tra.test.ts @c2f3719 (bỏ ca thẻ, ảnh, quảng cáo, Bắp; vòng gọi viết lại cho GPT)
import { describe, expect, it, vi } from "vitest";

import type { CongCuTra } from "./cong-cu/cong-cu-tra.ts";
import type { goiGpt } from "./openai.ts";
import {
  boDaLap, boMarkdown, CONG_CU, dungLoiDanTuTra, dungTinTuTra, huaBaoLai, kiemCanCu, LUAT_GIONG, LUAT_THAI_DO, LUAT_XUNG_HO, MOI_SDT,
  moiSdtCuoi, soanTuTra, tuHenLich, tuTuyetDoi, type LuongTra,
} from "./tu-tra.ts";

type Goi = (messages: unknown[], tools: unknown[]) => ReturnType<typeof goiGpt>;
type Msg = { role: string; content?: unknown; tool_call_id?: string; tool_calls?: unknown[] };

const L: LuongTra = {
  cauHoi: "giá máy để bàn sao em\nsđt anh 0912345678", khachDaNoi: ["anh Tuấn hỏi"], maMay: null, // pii-ok: số giả
  lichSu: ["GWT: Dạ em chào anh", "Khách: nhà 4 người"], daCoSdt: true, soCuoc: null,
};
const BANG_GIA = "BẢNG GIÁ NIÊM YẾT MASTERDATA (đã gồm VAT):\n- Máy để bàn: CTS10 30.950.000 đ, CTS20 36.950.000 đ";
const congCu = (): CongCuTra => ({
  timTaiLieu: vi.fn(async () => [{ tieuDe: "Lắp đặt", noiDung: "Lắp trong 2 giờ." }]),
  traMay: vi.fn(async () => "SỐ LIỆU MASTERDATA cho CTS20:\n- Giá niêm yết CTS20: 12.990.000 đ (đã gồm VAT)"),
  bangGia: vi.fn(async () => BANG_GIA),
  tonKho: vi.fn(async (ma: string) => `TỒN KHO SHOPEE: ${ma} — còn hàng.`),
});
const goiCu = (calls: Array<[string, string, unknown]>, content: string | null = null) => ({
  message: { content, tool_calls: calls.map(([id, name, args]) => ({ id, function: { name, arguments: typeof args === "string" ? args : JSON.stringify(args) } })) },
  finish: "tool_calls",
});
const chu = (content: string, finish = "stop") => ({ message: { content }, finish });
const CHOT = { so_cuoc: { nhu_cau: "", da_xong: [], con_mo: [] }, tra_loi: "", can_cu: [], can_nv: false, khong_tra_loi: false, ly_do: "", xung_ho: { goi: "anh", xung: "em" } };
const chot = (v: Partial<typeof CHOT> | Record<string, unknown>) => goiCu([["c", "chot_tra_loi", { ...CHOT, ...v }]]);
const chay = (goi: Goi, l: LuongTra = L, c: CongCuTra = congCu(), hotline = "") => soanTuTra(l, { congCu: c, goi, hotline });
const msgs = (goi: ReturnType<typeof vi.fn<Goi>>, lan: number) => goi.mock.calls[lan][0] as Msg[];

describe("soanTuTra — 5 ca của plan", () => {
  it("(a) tra_may rồi chot_tra_loi có căn cứ đúng → chanTuGui rỗng; tin công cụ đúng tool_call_id", async () => {
    const c = congCu();
    const goi = vi.fn<Goi>()
      .mockResolvedValueOnce(goiCu([["t1", "tra_may", { ma: "CTS20" }]]))
      .mockResolvedValueOnce(chot({ tra_loi: "Dạ CTS20 bên em giá 12.990.000 đ ạ.", can_cu: [{ y: "giá CTS20", trich: "Giá niêm yết CTS20: 12.990.000 đ" }] }));
    const r = await chay(goi, L, c);
    expect(r).toEqual({ traLoi: "Dạ CTS20 bên em giá 12.990.000 đ ạ.", canNv: false, khongTraLoi: false, lyDo: "", chanTuGui: [], xungHo: { goi: "anh", xung: "em" }, soCuoc: null });
    expect(c.traMay).toHaveBeenCalledWith("CTS20");
    const m = msgs(goi, 1);
    expect(m[0].role).toBe("system");
    expect(m[1].role).toBe("user");
    expect(m[2]).toMatchObject({ role: "assistant", tool_calls: [{ id: "t1", type: "function", function: { name: "tra_may" } }] });
    expect(m[3]).toMatchObject({ role: "tool", tool_call_id: "t1", content: expect.stringContaining("12.990.000 đ") });
    expect(goi.mock.calls[0][1]).toBe(CONG_CU);
  });
  it("(b) số 12.990.000 không có câu trích → chanTuGui nêu số đó", async () => {
    const r = await chay(vi.fn<Goi>().mockResolvedValueOnce(chot({ tra_loi: "Dạ CTS20 giá 12.990.000 đ ạ." })));
    expect(r.chanTuGui).toEqual([expect.stringContaining("số 12.990.000 không có câu trích")]);
  });
  it("(c) arguments hỏng ở vòng 1 → tin công cụ báo đọc không được, vòng 2 vẫn chạy", async () => {
    const goi = vi.fn<Goi>()
      .mockResolvedValueOnce(goiCu([["t1", "tra_may", "{hỏng"]]))
      .mockResolvedValueOnce(chot({ tra_loi: "Dạ anh cho em xin mã máy ạ." }));
    const r = await chay(goi);
    expect(r.traLoi).toBe("Dạ anh cho em xin mã máy ạ.");
    expect(msgs(goi, 1).at(-1)).toEqual({ role: "tool", tool_call_id: "t1", content: "Đối số không đọc được, gọi lại." });
  });
  it("(c') chot_tra_loi hỏng arguments → không chốt, gọi lại; công cụ khác cùng lượt vẫn chạy", async () => {
    const goi = vi.fn<Goi>()
      .mockResolvedValueOnce(goiCu([["t1", "bang_gia", { nhom: "de_ban" }], ["c", "chot_tra_loi", "{\"tra_loi\":"]]))
      .mockResolvedValueOnce(chot({ tra_loi: "Dạ em gửi anh giá ạ." }));
    await chay(goi);
    expect(msgs(goi, 1).slice(-2)).toEqual([
      { role: "tool", tool_call_id: "t1", content: BANG_GIA },
      { role: "tool", tool_call_id: "c", content: "Đối số không đọc được, gọi lại." },
    ]);
  });
  it("(d) khong_tra_loi + tra_loi rỗng → khongTraLoi, canNv, không ném", async () => {
    const r = await chay(vi.fn<Goi>().mockResolvedValueOnce(chot({ tra_loi: "", can_nv: true, khong_tra_loi: true, ly_do: "khách hỏi showroom Đà Nẵng" })));
    expect(r).toMatchObject({ traLoi: "", khongTraLoi: true, canNv: true, lyDo: "khách hỏi showroom Đà Nẵng", chanTuGui: [] });
  });
  it("(e) 5 vòng toàn gọi công cụ → TU_TRA_QUA_VONG", async () => {
    const lap = vi.fn<Goi>(async () => goiCu([["t", "tim_tai_lieu", { cau: "x" }]]));
    await expect(chay(lap)).rejects.toThrow("TU_TRA_QUA_VONG");
    expect(lap).toHaveBeenCalledTimes(5);
  });
});

describe("soanTuTra — chặn và lỗi (chép ý ERP)", () => {
  it("bị cắt → TU_TRA_CAT; từ chối → TU_TRA_TU_CHOI; câu rỗng → TU_TRA_RONG", async () => {
    await expect(chay(vi.fn<Goi>().mockResolvedValueOnce(chu("Dạ", "length")))).rejects.toThrow("TU_TRA_CAT");
    await expect(chay(vi.fn<Goi>().mockResolvedValueOnce({ message: { content: null, refusal: "không" }, finish: "stop" } as never))).rejects.toThrow("TU_TRA_TU_CHOI");
    await expect(chay(vi.fn<Goi>().mockResolvedValueOnce(chot({ tra_loi: "  " })))).rejects.toThrow("TU_TRA_RONG");
  });
  it("kết bằng chữ thường; công cụ lỗi → tin báo lỗi, vòng vẫn chạy; hứa báo lại không chuyển NV → chặn", async () => {
    const c = congCu();
    vi.mocked(c.traMay).mockRejectedValueOnce(new Error("hỏng"));
    const goi = vi.fn<Goi>()
      .mockResolvedValueOnce(goiCu([["t1", "tra_may", { ma: "CTS20" }]]))
      .mockResolvedValueOnce(chu("Dạ em kiểm tra rồi báo lại anh ạ."));
    const r = await chay(goi, L, c);
    expect(r.traLoi).toBe("Dạ em kiểm tra rồi báo lại anh ạ.");
    expect(r.chanTuGui).toEqual(["nháp hứa báo lại mà không chuyển NV — NV theo dõi hoặc sửa trước khi gửi"]);
    expect(msgs(goi, 1).at(-1)).toMatchObject({ tool_call_id: "t1", content: "Tra lỗi, thử cách khác hoặc nói em kiểm tra rồi báo lại." });
  });
  it("hứa báo lại KÈM can_nv → không chặn (NV giữ lời hứa); canNv ra riêng", async () => {
    const r = await chay(vi.fn<Goi>().mockResolvedValueOnce(chot({ tra_loi: "Dạ em kiểm tra rồi báo lại anh ạ.", can_nv: true, ly_do: "thiếu dữ liệu" })));
    expect(r).toMatchObject({ canNv: true, lyDo: "thiếu dữ liệu", chanTuGui: [] });
  });
  it("tự hẹn lịch → chặn", async () => {
    const r = await chay(vi.fn<Goi>().mockResolvedValueOnce(chot({ tra_loi: "Dạ anh tiện ngày nào để kỹ thuật qua khảo sát ạ?" })));
    expect(r.chanTuGui).toEqual(["nháp tự hẹn ngày giờ — việc hẹn lịch là của NV, sửa trước khi gửi"]);
  });
  it("trích bịa → chặn nêu ý; nói quá nguồn → chặn nêu từ", async () => {
    const bia = await chay(vi.fn<Goi>()
      .mockResolvedValueOnce(goiCu([["t1", "tra_may", { ma: "CTS20" }]]))
      .mockResolvedValueOnce(chot({ tra_loi: "Dạ CTS20 giá 12.990.000 đ ạ.", can_cu: [{ y: "giá CTS20", trich: "CTS20 giá 12.990.000 đ kèm quà 5 triệu" }] })));
    expect(bia.chanTuGui).toEqual(["căn cứ không khớp dữ liệu tra (có thể bịa): giá CTS20"]);
    const c = congCu();
    vi.mocked(c.timTaiLieu).mockResolvedValueOnce([{ tieuDe: "Xuất xứ", noiDung: "Lõi thay thế do hãng cung cấp trực tiếp." }]);
    const qua = await chay(vi.fn<Goi>()
      .mockResolvedValueOnce(goiCu([["t1", "tim_tai_lieu", { cau: "lõi có sẵn không" }]]))
      .mockResolvedValueOnce(chot({ tra_loi: "Dạ, lõi lọc luôn có sẵn ạ." })), L, c);
    expect(qua.chanTuGui).toEqual(["nói quá nguồn: «luôn có»"]);
  });
  it("công cụ lạ → tin báo không có; nhóm bang_gia chuyển đúng", async () => {
    const c = congCu();
    const goi = vi.fn<Goi>()
      .mockResolvedValueOnce(goiCu([["t1", "xoa_het", {}], ["t2", "bang_gia", { nhom: "de_ban" }]]))
      .mockResolvedValueOnce(chot({ tra_loi: "Dạ em gửi anh giá ạ." }));
    await chay(goi, L, c);
    expect(msgs(goi, 1).at(-2)).toEqual({ role: "tool", tool_call_id: "t1", content: "Không có công cụ xoa_het." });
    expect(c.bangGia).toHaveBeenCalledWith("de_ban");
  });
  it("hotline trong lời dặn là nguồn: trích hotline → không chặn", async () => {
    const goi = vi.fn<Goi>().mockResolvedValue(chot({
      tra_loi: "Dạ anh/chị gọi hotline 1900 1234 để được hỗ trợ nhanh ạ.", can_cu: [{ y: "hotline", trich: "đưa hotline 1900 1234" }], // pii-ok: số giả
    }));
    const r = await chay(goi, L, congCu(), "1900 1234"); // pii-ok: số giả
    expect(r.chanTuGui).toEqual([]);
    expect((msgs(goi, 0)[0].content as string)).toContain("đưa hotline 1900 1234"); // pii-ok: số giả
  });
  it("tin user: lịch sử + tin đang chờ che PII, máy bộ phân loại, đã để số", async () => {
    const goi = vi.fn<Goi>().mockResolvedValueOnce(chot({ tra_loi: "Dạ em ghi nhận ạ." }));
    await chay(goi, { ...L, maMay: "CTS20" });
    const user = msgs(goi, 0)[1].content as string;
    expect(user).toContain("- «GWT: Dạ em chào anh»");
    expect(user).toContain("- «sđt anh {SĐT}»");
    expect(user).not.toContain("0912345678"); // pii-ok: số giả
    expect(user).toContain("Máy bộ phân loại ghi (có thể sai, lời khách thắng): CTS20");
    expect(user).toContain("Khách đã để số điện thoại: có");
  });
  it("sổ cuộc chat: tin user có khối sổ + cách gọi đã biết; chưa có sổ → báo dựng; sổ mới che SĐT và mang xung_ho", async () => {
    const SO = { nhu_cau: "nhà 4 người", da_xong: ["đã báo giá CTS20"], con_mo: ["hỏi lắp mất bao lâu"], xung_ho: { goi: "cô" as const, xung: "chau" as const } };
    const goi = vi.fn<Goi>().mockResolvedValue(chot({
      tra_loi: "Dạ cháu ghi nhận ạ.", xung_ho: { goi: "cô", xung: "chau" },
      so_cuoc: { nhu_cau: "nhà 4 người, số 0912345678", da_xong: ["đã báo giá CTS20"], con_mo: [] }, // pii-ok: số giả
    }));
    const r = await chay(goi, { ...L, soCuoc: SO });
    const tin = msgs(goi, 0)[1].content as string;
    expect(tin).toContain("SỔ CUỘC CHAT (bot ghi ở lượt trước):\n- Nhu cầu: «nhà 4 người»\n- Đã xong: «đã báo giá CTS20»\n- Còn mở: «hỏi lắp mất bao lâu»");
    expect(tin).toContain("Cách gọi khách đã biết: cô/chau");
    expect(r.xungHo).toEqual({ goi: "cô", xung: "chau" });
    expect(r.soCuoc).toEqual({ nhu_cau: "nhà 4 người, số {SĐT}", da_xong: ["đã báo giá CTS20"], con_mo: [], xung_ho: { goi: "cô", xung: "chau" } });
    await chay(goi, L);
    const tin2 = msgs(goi, 1)[1].content as string;
    expect(tin2).toContain("— (chưa có — lần này dựng sổ từ hội thoại)");
    expect(tin2).not.toContain("Cách gọi khách đã biết");
  });
  it("xung_ho lạ → xungHo null", async () => {
    const r = await chay(vi.fn<Goi>().mockResolvedValueOnce(chot({ tra_loi: "Dạ ạ.", xung_ho: { goi: "mày", xung: "tao" } })));
    expect(r.xungHo).toBeNull();
  });
  it("hậu xử lý: bỏ markdown #, lặp \"Dạ\", câu mời SĐT xuống cuối", async () => {
    const r = await chay(vi.fn<Goi>().mockResolvedValueOnce(chot({ tra_loi: `## Lọc tổng\nDạ CTS20 có nước lạnh ạ. ${MOI_SDT}\n\nDạ em gửi thêm: máy có soda ạ.` })));
    expect(r.traLoi).toBe(`Lọc tổng\nDạ CTS20 có nước lạnh ạ.\n\nEm gửi thêm: máy có soda ạ.\n\n${MOI_SDT}`);
  });
});

describe("CONG_CU (OpenAI strict)", () => {
  it("mỗi công cụ dạng function strict; mọi object additionalProperties false + required đủ khoá", () => {
    const kiem = (s: Record<string, unknown>): void => {
      if (s.type === "object") {
        expect(s.additionalProperties).toBe(false);
        expect([...(s.required as string[])].sort()).toEqual(Object.keys(s.properties as object).sort());
        for (const p of Object.values(s.properties as Record<string, Record<string, unknown>>)) kiem(p);
      }
      if (s.items) kiem(s.items as Record<string, unknown>);
    };
    for (const t of CONG_CU) {
      expect(t.type).toBe("function");
      expect(t.function.strict).toBe(true);
      kiem(t.function.parameters);
    }
    expect(CONG_CU.map((t) => t.function.name)).toEqual(["tim_tai_lieu", "tra_may", "bang_gia", "ton_kho", "chot_tra_loi"]);
  });
  it("chot_tra_loi: so_cuoc đầu, can_cu ngay sau tra_loi, có xung_ho (enum), không còn thẻ / ảnh", () => {
    const p = CONG_CU.find((t) => t.function.name === "chot_tra_loi")!.function.parameters as { properties: Record<string, { properties?: Record<string, { enum?: string[] }> }> };
    const khoa = Object.keys(p.properties);
    expect(khoa[0]).toBe("so_cuoc");
    expect(khoa.indexOf("can_cu")).toBe(khoa.indexOf("tra_loi") + 1);
    expect([...khoa].sort()).toEqual(["can_cu", "can_nv", "khong_tra_loi", "ly_do", "so_cuoc", "tra_loi", "xung_ho"]);
    expect(p.properties.xung_ho.properties!.goi.enum).toEqual(["anh", "chị", "anh/chị", "cô", "chú", "bác", "ông", "bà", "em"]);
    expect(p.properties.xung_ho.properties!.xung.enum).toEqual(["em", "chau"]);
    expect(JSON.stringify(CONG_CU)).not.toMatch(/ảnh khách|may_trong_anh|the_tin/);
  });
});

describe("lời dặn", () => {
  const he = dungLoiDanTuTra("");
  it("không chào, xưng hô theo luật GIỌNG, không còn nháp / thẻ / ảnh / quảng cáo", () => {
    expect(he).toContain("KHÔNG tự chào, không tự giới thiệu — hệ thống tự thêm lời chào");
    expect(he).toContain("ghi `xung_ho`: cách gọi khách suy từ hội thoại theo luật GIỌNG");
    for (const s of ["NHÁP; nhân viên sẽ xem trước", "Thẻ trả lời nhanh", "ẢNH KHÁCH GỬI", "ảnh khách", "Khách vừa nhắn từ quảng cáo", "chot_nhap", "CÁCH GWT TRẢ LỜI"]) expect(he).not.toContain(s);
    expect(he).toContain("Viết xong thì gọi chot_tra_loi đúng một lần.");
  });
  it("giữ luật cứng ERP: giọng, thái độ, số liệu, chuyển NV, hẹn lịch, căn cứ, danh mục", () => {
    expect(he).toContain(`GIỌNG (luật cứng): ${LUAT_GIONG} ${LUAT_XUNG_HO}`);
    expect(he).toContain(`THÁI ĐỘ (luật cứng): ${LUAT_THAI_DO}`);
    for (const s of ["2–4 câu", "KHÔNG gửi lại", "Hỏi TỐI ĐA MỘT câu", "Khách hỏi giá, hỏi tư vấn, để lại số KHÔNG phải can_nv", "KHÔNG dùng # hay markdown khác",
      "CHỈ được lấy từ kết quả công cụ", "điểm bán, showroom, đại lý", "khong_tra_loi = true", "KHÔNG tự hướng dẫn sửa", "KHÔNG tư vấn cách xử lý",
      "KHÔNG tự hẹn ngày giờ, KHÔNG báo chi phí lắp / khảo sát / thi công", "ghi can_cu cho MỖI con số", "Ý không chép được nguyên văn nghĩa là không có dữ liệu: BỎ ý đó khỏi tra_loi",
      "Máy để bàn: CTS10, CTS20, CTD50;", "Đã ngừng bán MÁY nhưng vẫn bán LÕI và vẫn bảo hành: B04", "Dòng «— cách N ngày —» trong hội thoại",
      "KHÔNG nhắc lại, KHÔNG gửi lại, trừ khi khách hỏi lại đúng điều đó", "Cả câu trả lời tối đa 6 đoạn", "KHÔNG dùng từ tuyệt đối"]) expect(he).toContain(s);
    expect(LUAT_THAI_DO).toContain("KHÔNG tự hẹn, đề nghị hay chốt ngày giờ khảo sát");
    expect(LUAT_GIONG).toContain('Gọi khách "anh", "chị" hay "anh/chị" thì xưng "em" — KHÔNG xưng "cháu"');
  });
  it("hotline: có số → đưa đúng số; không có → không đưa số nào", () => {
    expect(dungLoiDanTuTra("1900 1234")).toContain("đưa hotline 1900 1234"); // pii-ok: số giả
    expect(he).toContain("chưa có số hotline trong dữ liệu — KHÔNG đưa số nào");
    expect(he).not.toContain("đưa hotline");
  });
  it("dungTinTuTra: không có dòng quảng cáo", () => {
    expect(dungTinTuTra(L)).not.toContain("quảng cáo");
  });
});

// Chặn bịa lớp 6 (đã chốt 2026-10-23): trích nguyên văn, code kiểm câu trích có thật + số nằm trong câu trích.
describe("kiemCanCu", () => {
  const NGUON = "SỐ LIỆU MASTERDATA cho WH15AECO:\n- Giá niêm yết WH15AECO: 119.950.000 đ (đã gồm VAT)\n- Mô tả: Giải pháp lọc tổng GE 15A ECO - Tập trung vào làm mềm nước";
  it("trích nguyên văn (khác hoa/thường, khoảng trắng, markdown) + số nằm trong trích → đạt", () => {
    expect(kiemCanCu("Dạ WH15AECO giá 119.950.000 đ, tập trung vào làm mềm nước ạ.", [
      { y: "giá", trich: "Giá niêm yết WH15AECO:  119.950.000 đ" },
      { y: "mô tả", trich: "**tập trung vào làm mềm nước**" },
    ], NGUON)).toEqual([]);
  });
  it("trích không có trong dữ liệu → trả ý đó", () => {
    expect(kiemCanCu("Dạ bản ECO xử lý cặn canxi, magie ạ.", [{ y: "mô tả ECO", trich: "xử lý cặn canxi, magie" }], NGUON)).toEqual(["mô tả ECO"]);
  });
  it("số đáng kể không nằm trong câu trích nào → trả số; số nhỏ không bắt", () => {
    expect(kiemCanCu("Dạ giá 99.000.000 đ, lắp 2 giờ, máy CTS20 ạ.", [], NGUON)).toEqual(["số 99.000.000 không có câu trích"]);
    expect(kiemCanCu("Dạ lắp 2 giờ, máy CTS20 ạ.", [], NGUON)).toEqual([]);
  });
  it("chữ số in đậm và trích có '…' (từng phần phải có thật)", () => {
    expect(kiemCanCu("Dạ giá 𝟏𝟏𝟗.𝟗𝟓𝟎.𝟎𝟎𝟎 đ ạ.", [{ y: "giá", trich: "WH15AECO: 119.950.000 đ" }], NGUON)).toEqual([]);
    expect(kiemCanCu("Dạ ạ.", [{ y: "a", trich: "Giải pháp lọc tổng … làm mềm nước" }], NGUON)).toEqual([]);
    expect(kiemCanCu("Dạ ạ.", [{ y: "b", trich: "Giải pháp lọc tổng … khử phèn" }], NGUON)).toEqual(["b"]);
  });
  it("trích 'ảnh khách' không còn là căn cứ (bot không đọc ảnh)", () => {
    expect(kiemCanCu("Dạ máy trong ảnh là CTS20 ạ.", [{ y: "mã máy", trich: "ảnh khách" }], NGUON)).toEqual(["mã máy"]);
  });
});

describe("tuHenLich (đã chốt 2026-10-22)", () => {
  it.each([
    "Dạ em xin hẹn lịch khảo sát vào sáng mai lúc 9h được không ạ?",
    "Anh/chị tiện ngày nào để bên em qua khảo sát ạ?",
    "Dạ kỹ thuật bên em qua lắp thứ 7 này được ạ.",
    "Em đặt lịch khảo sát 14h30 chiều nay cho chị nhé.",
    "Mai bên em cho kỹ thuật tới nhà khảo sát ạ",
  ])("bắt: %s", (s) => expect(tuHenLich(s)).toBe(true));
  it.each([
    "Dạ nhân viên kỹ thuật sẽ liên hệ anh/chị để sắp xếp lịch khảo sát ạ.",
    "Dạ khảo sát lọc tổng tại Hà Nội miễn phí ạ. Lắp đặt mất khoảng 1-2 giờ.",
    "Dạ CTS20 giá 36.950.000 đ, có nước nóng ạ. Anh/chị dùng cho mấy người ạ?",
  ])("qua: %s", (s) => expect(tuHenLich(s)).toBe(false));
});

describe("huaBaoLai, tuTuyetDoi (2026-10-23)", () => {
  it("huaBaoLai: bắt lời hứa báo lại, không bắt câu thường", () => {
    expect(huaBaoLai("Phần mức diệt khuẩn em đang kiểm tra thêm, sẽ báo lại anh/chị ạ.")).toBe(true);
    expect(huaBaoLai("Em kiểm tra rồi phản hồi sớm cho anh ạ.")).toBe(true);
    expect(huaBaoLai("Dạ CTD50 không có nước lạnh ạ.")).toBe(false);
  });
  it("tuTuyetDoi: từ tuyệt đối nguồn không có thì báo; nguồn có đúng từ đó thì cho qua", () => {
    const nguon = "Lõi thay thế do hãng cung cấp trực tiếp, đặt qua fanpage hoặc hotline.";
    expect(tuTuyetDoi("Dạ, lõi lọc luôn có sẵn ạ. Anh/chị yên tâm không lo thiếu lõi ạ.", nguon)).toEqual(["luôn có", "không lo"]);
    expect(tuTuyetDoi("Dạ nước sau lọc đảm bảo chất lượng ạ.", "lọc RO/NF mới đảm bảo chất lượng nước uống")).toEqual([]);
    expect(tuTuyetDoi("Dạ máy có nhiều mức nhiệt độ ạ, lắp tại nhà luôn ạ.", "")).toEqual([]);
    expect(tuTuyetDoi("Dạ không loại lõi nào cần thay sớm ạ.", "")).toEqual([]);
  });
});

describe("moiSdtCuoi, boDaLap, boMarkdown", () => {
  it("moiSdtCuoi: câu mời SĐT luôn xuống cuối, nhận cả câu đã đổi Anh/Chị", () => {
    const qua = "Tháng này mua CTS20 anh/chị được tặng combo quà trị giá <tổng>, gồm các món sau ạ:\n- 02 bình gas";
    expect(moiSdtCuoi(`Dạ CTS20 bên em còn <giá> ạ. ${MOI_SDT}\n\n${qua}`)).toBe(`Dạ CTS20 bên em còn <giá> ạ.\n\n${qua}\n\n${MOI_SDT}`);
    expect(moiSdtCuoi(`Dạ giá ạ.\n\n${MOI_SDT}\n\n${qua}`)).toBe(`Dạ giá ạ.\n\n${qua}\n\n${MOI_SDT}`);
    const dung = `Dạ giá ạ.\n\n${MOI_SDT}`;
    expect(moiSdtCuoi(dung)).toBe(dung);
    expect(moiSdtCuoi("Dạ máy bên em có nước nóng ạ.")).toBe("Dạ máy bên em có nước nóng ạ.");
    const moiChi = MOI_SDT.replace("Anh/chị", "Chị");
    expect(moiSdtCuoi(`Dạ CTS20 bên em còn <giá> ạ. ${moiChi}\n\nQuà ạ.`)).toBe(`Dạ CTS20 bên em còn <giá> ạ.\n\nQuà ạ.\n\n${moiChi}`);
  });
  it("boDaLap: chỉ đoạn đầu giữ \"Dạ\"", () => {
    expect(boDaLap("Dạ CTS20 có nước lạnh ạ.\n\nDạ em gửi anh/chị giá ạ:\n- CTS20\n\nDạ, anh/chị để lại SĐT ạ."))
      .toBe("Dạ CTS20 có nước lạnh ạ.\n\nEm gửi anh/chị giá ạ:\n- CTS20\n\nAnh/chị để lại SĐT ạ.");
    expect(boDaLap("Dạ vâng ạ.\n\n  dạ vâng, em ghi nhận ạ.")).toBe("Dạ vâng ạ.\n\n  Vâng, em ghi nhận ạ.");
    const giu = "Dạ máy có nước nóng ạ.\nDạ thêm một dòng cùng đoạn ạ.\n\nDạy con dùng máy dễ ạ.\n\nDạ! ạ.";
    expect(boDaLap(giu)).toBe(giu);
  });
  it("boMarkdown giữ **…**, đầu dòng - / * / • thành '• ', bỏ tiêu đề #", () => {
    expect(boMarkdown("Dạ ạ:\n* **CTS10**: 30.950.000 đ\n- CTS20\n• CTS30\n## Lọc tổng")).toBe("Dạ ạ:\n• **CTS10**: 30.950.000 đ\n• CTS20\n• CTS30\nLọc tổng");
  });
});
