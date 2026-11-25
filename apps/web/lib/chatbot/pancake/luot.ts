/** Một lượt bot Pancake cho một page (spec §5 bước 0–10). Hai pha như bot cũ: A đọc + phân loại, B soạn + gửi. KHÔNG ném. */
import type { taoBao } from "./bao.ts";
import { chanSauSoan, chanTruocSoan } from "./cong.ts";
import { trongGioBot, type CauHinh } from "./cau-hinh.ts";
import { coSdt } from "./an-pii.ts";
import type { PancakeClient, TinPancake } from "./doc.ts";
import { dungTinGui, kieuMo } from "./dung-tin.ts";
import type { DongHoiThoai, KhoPancake } from "./kho.ts";
import { dangCho, laKhach, laNhanVien, laTinBot, lichSuHoiThoai, tinKhachDangCho, TRAN_DUNG_SO } from "./loc.ts";
import type { Gioi, PhanLoai } from "./phan-loai.ts";
import { chuanSoCuoc, type SoCuoc, type XungHo } from "./so-cuoc.ts";
import type { KetQuaTra, LuongTra } from "./tu-tra.ts";

export interface KetQua {
  viec: "bo_qua_khoa" | "ngoai_gio" | "tat" | "xong" | "loi";
  phanLoai: number; gui: number; thu: number; chuyen: number; boQuaCu: number; loi?: string;
}
export interface PhuThuocLuot {
  pageId: string; tenKenh: string;
  pancake: Pick<PancakeClient, "dsHoiThoai" | "tinNhan">;
  gui?: (cid: string, msg: string) => Promise<string>; // cửa gửi duy nhất (gui-khach.ts) do bên gọi tiêm vào
  kho: KhoPancake;
  phanLoai: (tin: string, coSdt: boolean, lichSu: string[], tenKhach?: string | null) => Promise<PhanLoai>;
  soan: (l: LuongTra) => Promise<KetQuaTra>;
  bao: ReturnType<typeof taoBao>;
  ch: CauHinh;
  dem: { doc(): number; tang(): void }; // số hội thoại bot đã gửi hôm nay
  now: () => Date;
  nghi?: (ms: number) => Promise<unknown>;
}

const PHUT = 60_000;
const NGAY = 86_400_000;
const YEN_MS = 120_000;
const YEN_TRAN_MS = 300_000;
const CU_MS = 30 * PHUT;
const TOI_DA_GUI = 5;
const TOI_DA_LOI_GUI = 3;
const TOI_DA_TRANG = 5;
const CHO_GIUA_TIN_MS = 1000;
const TOI_DA_LUOT_NGAY_CHO_MOT_HOI_THOAI = 600_000; // tin bot cách nhau > 10 phút = lượt khác

// Mã lỗi ngắn, không kèm URL/token: chỉ nhận chuỗi chữ-số-gạch dưới.
const maSach = (m: unknown) => (typeof m === "string" && /^[A-Za-z][A-Za-z0-9_]{2,63}$/.test(m) ? m : "LOI_KHONG_RO");
const maLoi = (e: unknown) => maSach(e instanceof Error ? e.message : "");
/** Khối tin khách đang chờ, cắt tại tin bot mới nhất / mốc đã báo (tinKhachDangCho bỏ qua tin bot chứ không dừng ở đó). */
const khoiCho = (tin: TinPancake[], pageId: string, baoLuc: string | null | undefined) => {
  const moc = Math.max(baoLuc ? Date.parse(baoLuc) : -Infinity, ...tin.filter(laTinBot).map((t) => Date.parse(t.inserted_at)).filter(Number.isFinite));
  return tinKhachDangCho(tin, pageId, undefined, Number.isFinite(moc) ? iso(moc) : undefined);
};
const ngayVn = (ms: number) => Math.floor((ms + 7 * 3600_000) / NGAY);
const iso = (ms: number) => new Date(ms).toISOString();

export async function chayMotLuot(p: PhuThuocLuot): Promise<KetQua> {
  const kq: KetQua = { viec: "xong", phanLoai: 0, gui: 0, thu: 0, chuyen: 0, boQuaCu: 0 };
  const now = p.now();
  const nowMs = now.getTime();
  if (p.ch.cheDo === "tat" || !p.ch.trangGui.has(p.pageId)) return { ...kq, viec: "tat" };
  if (!trongGioBot(now, p.ch)) return { ...kq, viec: "ngoai_gio" };
  if (p.ch.cheDo === "bat" && !p.gui) return { ...kq, viec: "loi", loi: "THIEU_CUA_GUI" };

  let giu = false;
  let loiDau: string | undefined;
  let docXong = false; // pha A chạy hết, không lỗi → mới được dời lanChayCuoi
  const ghiLoi = (e: unknown) => { loiDau ??= maLoi(e); };
  try {
    if (!(await p.kho.giuKhoa(p.pageId, now))) return { ...kq, viec: "bo_qua_khoa" };
    giu = true;
    const nghi = p.nghi ?? ((ms: number) => new Promise((ok) => setTimeout(ok, ms)));
    const dauKhoi = new Map<string, number>(); // conversationId → giờ tin khách đầu khối (trần chờ 300 giây)
    const truocDo = new Map<string, number | null>(); // conversationId → tin_khach_luc của dòng DB cũ (trước khi pha A ghi đè)

    // ---- Pha A: đọc + phân loại ----
    const trangThai = await p.kho.docTrangThai(p.pageId);
    const lan = trangThai?.lanChayCuoi ? Date.parse(trangThai.lanChayCuoi) : -Infinity;
    const tu = Math.max(lan - 5 * PHUT, nowMs - CU_MS);
    const ds = new Map<string, Awaited<ReturnType<typeof p.pancake.dsHoiThoai>>[number]>();
    let truocId: string | undefined;
    for (let i = 0; i < TOI_DA_TRANG; i += 1) {
      const trang = await p.pancake.dsHoiThoai({ since: Math.floor(tu / 1000), until: Math.floor(nowMs / 1000), ...(truocId ? { truocId } : {}) });
      const moi = trang.filter((h) => !ds.has(h.id));
      for (const h of moi) ds.set(h.id, h);
      if (!moi.length) break;
      truocId = trang.at(-1)!.id;
    }
    const ungVien = [...ds.values()].filter((h) => dangCho(h) && (h.customers?.length ?? 0) < 2);
    const cu = await p.kho.docHoiThoai(p.pageId, ungVien.map((h) => h.id));
    const xong: string[] = [];
    const doanTen = new Map<string, { gioi?: Gioi; tenGoi?: string | null }>(); // conversationId → đoán giới/tên gọi từ tên Facebook (chỉ trong lượt chạy này)
    for (const h of ungVien) {
      try {
        const tin = await p.pancake.tinNhan(h.id);
        const dong = cu.get(h.id);
        const kh = khoiCho(tin, p.pageId, dong?.discordBaoLuc);
        if (!kh) { xong.push(h.id); continue; }
        if (dong && Date.parse(kh.luc) <= Date.parse(dong.tinKhachLuc)) continue; // không có tin khách mới hơn lần đã phân loại
        // Mốc cũ chỉ là "lần khách nhắn trước" khi nó nằm trước khối này; còn không là mảnh của chính khối (lượt trước ghi) → dùng tin đã tải.
        if (dong && Date.parse(dong.tinKhachLuc) < Date.parse(kh.dau)) truocDo.set(h.id, Date.parse(dong.tinKhachLuc));
        dauKhoi.set(h.id, Date.parse(kh.dau));
        const text = kh.text || h.snippet || "";
        const co = h.has_phone || coSdt(text);
        const soTin = Math.max(1, kh.text.split("\n").length);
        const { lichSu } = lichSuHoiThoai(tin, p.pageId, undefined, soTin);
        const pl = await p.phanLoai(text, co, lichSu, h.from?.name ?? null);
        doanTen.set(h.id, { gioi: pl.gioi, tenGoi: pl.tenGoi });
        kq.phanLoai += 1;
        await p.kho.luuHoiThoai({
          pageId: p.pageId, conversationId: h.id, tenKhach: h.from?.name ?? null, tinKhach: text, tinKhachLuc: iso(Date.parse(kh.luc)),
          coSdt: co, nhom: pl.nhom, gap: pl.gap, tomTat: pl.tomTat, maMay: pl.maMay, phanLoaiLuc: iso(nowMs), trangThai: "cho",
        });
      } catch (e) { ghiLoi(e); }
    }
    if (xong.length) await p.kho.danhDauXuLy(p.pageId, xong);
    docXong = !loiDau;

    // ---- Pha B: soạn + gửi ----
    let luotGui = 0, loiGui = 0;
    for (const d of await p.kho.dsCho(p.pageId)) {
      if (luotGui >= TOI_DA_GUI || loiGui >= TOI_DA_LOI_GUI) break;
      const luc = Date.parse(d.tinKhachLuc);
      if (d.discordBaoLuc && Date.parse(d.discordBaoLuc) >= luc) continue; // đã báo cho đúng lượt tin khách này
      const yen = nowMs - luc;
      if (yen >= CU_MS) { // quá 30 phút: bỏ im lặng
        kq.boQuaCu += 1;
        await p.kho.danhDauXuLy(p.pageId, [d.conversationId]);
        continue;
      }
      const daiQua = nowMs - (dauKhoi.get(d.conversationId) ?? nowMs) >= YEN_TRAN_MS;
      if (yen < YEN_MS && !daiQua) continue;
      try {
        const r = await xuLyDong(d, luc);
        if (r === "gui") luotGui += 1;
        else if (r === "loi_gui") { luotGui += 1; loiGui += 1; }
      } catch (e) { ghiLoi(e); }
    }

    async function xuLyDong(d: DongHoiThoai, luc: number): Promise<"gui" | "loi_gui" | "khac"> {
      const id = d.conversationId;
      const ghiXong = async (danhDau = true) => {
        await p.kho.ghiBaoLuc(p.pageId, id, iso(Math.max(nowMs, luc)));
        if (danhDau) await p.kho.danhDauXuLy(p.pageId, [id]);
      };
      const tin = await p.pancake.tinNhan(id);
      const kh = khoiCho(tin, p.pageId, d.discordBaoLuc);
      if (!kh) { await p.kho.danhDauXuLy(p.pageId, [id]); return "khac"; } // NV/bot đã trả lời
      if (Date.parse(kh.luc) > luc) return "khac"; // khách nhắn thêm: pha A lượt sau phân loại lại
      const moi = (t: TinPancake) => Date.parse(t.inserted_at) > Date.parse(kh.luc) && (laTinBot(t) || laNhanVien(t.from));
      if (tin.some(moi)) { await ghiXong(); return "khac"; } // bot/NV đã nói sau tin khách: không soạn

      const chuyen = async (lyDo: string) => {
        await p.bao.chuyenNguoi({
          kenh: p.tenKenh, nhom: d.nhom ?? "chua_phan_loai", lyDo, tomTat: d.tomTat ?? "", khieuNai: d.nhom === "khieu_nai",
          ...(p.ch.pingKhieuNai ? { ping: p.ch.pingKhieuNai } : {}),
        });
        kq.chuyen += 1;
        await ghiXong();
        return "khac" as const;
      };

      const homNay = ngayVn(nowMs);
      const luotBot: number[] = [];
      for (const t of tin.filter(laTinBot).map((x) => Date.parse(x.inserted_at)).filter((ms) => ngayVn(ms) === homNay).sort((a, b) => a - b)) {
        if (luotBot.length === 0 || t - luotBot.at(-1)! > TOI_DA_LUOT_NGAY_CHO_MOT_HOI_THOAI) luotBot.push(t);
        else luotBot[luotBot.length - 1] = t;
      }
      const chanTruoc = chanTruocSoan({
        nhom: d.nhom, gap: d.gap, coAnh: kh.anh.length > 0,
        nvTrong24h: tin.some((t) => !laTinBot(t) && laNhanVien(t.from) && nowMs - Date.parse(t.inserted_at) < NGAY),
        botLuotHomNay: luotBot.length, daGuiHomNay: p.dem.doc(), tranNgay: p.ch.tranNgay, tinKhach: kh.text,
      });
      if (chanTruoc) return chuyen(chanTruoc);

      // Sổ chỉ dùng nếu lần khách nhắn trước (dòng DB cũ, hoặc tin khách liền trước trong hội thoại) ≤ 7 ngày.
      const truoc = truocDo.has(id) ? truocDo.get(id)! : tin.map((t) => Date.parse(t.inserted_at))
        .filter((ms, i) => laKhach(tin[i].from, p.pageId) && ms < Date.parse(kh.dau)).sort((a, b) => b - a)[0] ?? null;
      const so: SoCuoc | null = d.soCuoc && truoc !== null && nowMs - truoc <= 7 * NGAY ? d.soCuoc : null;
      const ls = lichSuHoiThoai(tin, p.pageId, undefined, Math.max(1, kh.text.split("\n").length), so ? undefined : TRAN_DUNG_SO);
      const kieu = kieuMo(tin, now, so);
      // Đoán anh/chị từ tên: chỉ khi sổ chưa biết cách xưng hô (xưng hô đã học thắng). Lượt trước chưa lưu đoán (DB chưa có cột) → hỏi lại bộ phân loại, chỉ ở lần đầu tiếp xúc.
      let doan = doanTen.get(id);
      if (!doan && kieu === "gioi_thieu" && d.tenKhach) doan = await p.phanLoai(d.tinKhach, d.coSdt, [], d.tenKhach).catch(() => undefined);
      const doanGoi: XungHo | null = so?.xung_ho ? null : doan?.gioi === "nam" ? { goi: "anh", xung: "em" } : doan?.gioi === "nu" ? { goi: "chị", xung: "em" } : null;
      const soChoSoan: SoCuoc | null = doanGoi ? { ...(so ?? { nhu_cau: "", da_xong: [], con_mo: [] }), xung_ho: doanGoi } : so;
      const k = await p.soan({ cauHoi: kh.text, khachDaNoi: [], lichSu: ls.lichSu, maMay: d.maMay, daCoSdt: ls.daCoSdt || d.coSdt, soCuoc: soChoSoan });
      const chanSau = chanSauSoan(k);
      if (chanSau) return chuyen(chanSau);

      // Đọc lại ngay trước khi gửi: có tin NV/bot mới hơn tin khách → bỏ, không báo.
      const lai = await p.pancake.tinNhan(id);
      const kiem = (t: TinPancake) => Date.parse(t.inserted_at) > Date.parse(kh.luc);
      if (lai.some((t) => kiem(t) && (laTinBot(t) || laNhanVien(t.from)))) { await ghiXong(); return "khac"; }
      if (lai.some((t) => kiem(t) && laKhach(t.from, p.pageId))) return "khac"; // khách nhắn thêm trong lúc soạn

      const xh = k.xungHo ?? so?.xung_ho ?? doanGoi;
      const laDoan = Boolean(xh && doanGoi && xh.goi === doanGoi.goi && xh.xung === doanGoi.xung); // chỉ là đoán từ tên → không ghi vào sổ
      const tinGui = dungTinGui(k.traLoi, { kieu, xungHo: xh, ten: doan?.tenGoi ?? null, hotline: p.ch.hotline, hoiSo: !(ls.daCoSdt || d.coSdt) });
      if (!tinGui.length) return chuyen("rong");

      const baoDaGui = (tinDa: string[], thu: boolean) =>
        p.bao.daGui({ kenh: p.tenKenh, nhom: d.nhom ?? "", tomTat: d.tomTat ?? "", tin: tinDa, thu });
      if (p.ch.cheDo === "thu") {
        kq.thu += 1;
        await baoDaGui(tinGui, true).catch(ghiLoi);
        await ghiXong();
        return "gui";
      }
      const daGui: string[] = [];
      let hong: string | null = null;
      for (const m of tinGui) {
        if (daGui.length) await nghi(CHO_GIUA_TIN_MS);
        try { await p.gui!(id, m); daGui.push(m); } catch (e) { const c = (e as { code?: unknown })?.code; hong = c !== undefined ? maSach(c) : maLoi(e); break; } // không thử lại
      }
      if (hong) {
        await p.bao.loi({ kenh: p.tenKenh, ma: hong }).catch(ghiLoi);
        if (!daGui.length) { await ghiXong(false); return "loi_gui"; }
      }
      // Đã có tin tới khách: mọi việc sau phải chạy dù Discord hỏng, để không gửi lặp lượt sau.
      kq.gui += 1;
      p.dem.tang();
      await baoDaGui(daGui, false).catch(ghiLoi);
      await ghiXong(); // đóng dòng TRƯỚC sổ: sổ hỏng không được để dòng mở lại → soạn/báo lại
      const { xung_ho: _boDoan, ...soMoi } = k.soCuoc ?? { nhu_cau: "", da_xong: [], con_mo: [] };
      const sach = chuanSoCuoc({ ...soMoi, ...(xh && !laDoan ? { xung_ho: xh } : {}) });
      if (sach) await p.kho.ghiSoCuoc(p.pageId, id, sach).catch(ghiLoi);
      return hong ? "loi_gui" : "gui";
    }

    await p.kho.hetHanCho(p.pageId, new Date(nowMs - 7 * NGAY));
  } catch (e) {
    ghiLoi(e);
  } finally {
    if (giu) {
      try { await p.kho.nhaKhoa(p.pageId, docXong ? { lanChayCuoi: now.toISOString() } : {}); } catch (e) { ghiLoi(e); }
    }
  }
  return loiDau ? { ...kq, viec: "loi", loi: loiDau } : kq;
}
