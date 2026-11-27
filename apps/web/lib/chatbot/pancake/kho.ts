// chép từ GWT-ERP lib/chatbot/kenh/pancake/kho.ts @c2f3719 (bỏ KhoGopY/KhoHoc, xoaCu, dsCanDong; ghiDiscord → ghiBaoLuc)
/** Cửa DB đọc/báo Pancake (`chatbot.pancake_*`), CHỈ service_role; `sb` tạo với `db: { schema: "chatbot" }`. Lỗi gói mã ngắn, không kèm dữ liệu khách. */
import type { SupabaseClient } from "@supabase/supabase-js";
import { chuanSoCuoc, type SoCuoc } from "./so-cuoc.ts";

import type { Nhom } from "./phan-loai.ts";

export interface DongHoiThoai {
  pageId: string; conversationId: string; tenKhach: string | null; tinKhach: string; tinKhachLuc: string; coSdt: boolean;
  nhom: Nhom | null; gap: boolean; tomTat: string | null; maMay: string | null; phanLoaiLuc: string | null;
  trangThai: "cho" | "da_xu_ly";
  discordThreadId: string | null; discordBaoLuc: string | null; discordDongLuc: string | null;
  soCuoc?: SoCuoc | null; // sổ cuộc chat (so-cuoc.ts); vắng = chưa có
}
/** Phần luuHoiThoai ghi — KHÔNG gồm discord_*: upsert chỉ đè cột được gửi, nên mốc Discord của dòng cũ giữ nguyên. Cột `da_bao_gap_luc` (đợt 1) và `tong_hop_gan_nhat` không còn đọc/ghi (expand-contract). */
export type DongLuu = Omit<DongHoiThoai, "discordThreadId" | "discordBaoLuc" | "discordDongLuc" | "soCuoc">;
export interface TrangThaiDongBo { lanChayCuoi: string | null; tokenLoiLuc: string | null }
export interface KhoPancake {
  docTrangThai(pageId: string): Promise<TrangThaiDongBo | null>;
  giuKhoa(pageId: string, now: Date): Promise<boolean>; // true = giữ được (không có lượt khác đang chạy < 5 phút)
  nhaKhoa(pageId: string, patch: Partial<TrangThaiDongBo>): Promise<void>; // dang_chay_tu = null + patch
  docHoiThoai(pageId: string, ids: string[]): Promise<Map<string, DongHoiThoai>>;
  luuHoiThoai(d: DongLuu): Promise<void>; // upsert theo (page_id, conversation_id)
  danhDauXuLy(pageId: string, ids: string[]): Promise<void>; // chỉ dòng đang 'cho'
  dsCho(pageId: string): Promise<DongHoiThoai[]>; // trang_thai = 'cho', tin_khach_luc tăng dần
  ghiBaoLuc(pageId: string, id: string, luc: string): Promise<void>; // chỉ discord_bao_luc + cap_nhat_luc
  hetHanCho(pageId: string, truoc: Date): Promise<void>; // 'cho' có tin_khach_luc < truoc → 'da_xu_ly'; sổ cuộc của mọi dòng tin_khach_luc < truoc → null. KHÔNG xoá dòng
  ghiSoCuoc(pageId: string, id: string, so: SoCuoc): Promise<void>; // chỉ cột so_cuoc, không đụng cap_nhat_luc
}

const loi = (ma: string) => new Error(`kho_pancake_${ma}`);
const KHOA_CHET_MS = 5 * 60_000;
// Chia lô cho .in(): id Pancake ~33 ký tự, 600 id trong một URL vượt giới hạn gateway ~8 KB.
const LO_ID = 100;
// Cắt theo code point (CHECK char_length) + toWellFormed: nửa surrogate lẻ (từ API hoặc cắt ở nơi khác) thành U+FFFD, không để Postgres từ chối cả lượt.
const cat = (s: string, n: number) => [...s].slice(0, n).join("").toWellFormed();
const catNull = (s: string | null, n: number) => (s === null ? null : cat(s, n));
const COT = "page_id,conversation_id,ten_khach,tin_khach,tin_khach_luc,co_sdt,nhom,gap,tom_tat,ma_may,phan_loai_luc,trang_thai,discord_thread_id,discord_bao_luc,discord_dong_luc,so_cuoc";

type Hang = Record<string, unknown>;
const veDong = (h: Hang): DongHoiThoai => ({
  pageId: h.page_id as string, conversationId: h.conversation_id as string, tenKhach: (h.ten_khach as string | null) ?? null,
  tinKhach: h.tin_khach as string, tinKhachLuc: new Date(h.tin_khach_luc as string).toISOString(), coSdt: Boolean(h.co_sdt),
  nhom: (h.nhom as Nhom | null) ?? null, gap: Boolean(h.gap), tomTat: (h.tom_tat as string | null) ?? null,
  maMay: (h.ma_may as string | null) ?? null,
  phanLoaiLuc: h.phan_loai_luc ? new Date(h.phan_loai_luc as string).toISOString() : null,
  trangThai: h.trang_thai as "cho" | "da_xu_ly",
  discordThreadId: (h.discord_thread_id as string | null) ?? null,
  discordBaoLuc: h.discord_bao_luc ? new Date(h.discord_bao_luc as string).toISOString() : null,
  discordDongLuc: h.discord_dong_luc ? new Date(h.discord_dong_luc as string).toISOString() : null,
  soCuoc: chuanSoCuoc(h.so_cuoc),
});

export function taoKhoPancake(sb: SupabaseClient): KhoPancake {
  const bang = (ten: string) => sb.from(ten);
  const bayGio = () => new Date().toISOString();
  return {
    async docTrangThai(pageId) {
      const { data, error } = await bang("pancake_sync_state").select("lan_chay_cuoi,token_loi_luc")
        .eq("page_id", pageId).maybeSingle();
      if (error) throw loi("doc_trang_thai");
      if (!data) return null;
      const d = data as Hang;
      const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
      return { lanChayCuoi: iso(d.lan_chay_cuoi), tokenLoiLuc: iso(d.token_loi_luc) };
    },
    async giuKhoa(pageId, now) {
      const { error: e1 } = await bang("pancake_sync_state").upsert({ page_id: pageId }, { onConflict: "page_id", ignoreDuplicates: true });
      if (e1) throw loi("giu_khoa");
      const cu = new Date(now.getTime() - KHOA_CHET_MS).toISOString();
      const { data, error } = await bang("pancake_sync_state").update({ dang_chay_tu: now.toISOString() })
        .eq("page_id", pageId).or(`dang_chay_tu.is.null,dang_chay_tu.lt.${cu}`).select("page_id");
      if (error) throw loi("giu_khoa");
      return (data ?? []).length > 0;
    },
    // ponytail: nhả khoá không kiểm người giữ — một lượt chạy quá 5 phút có thể nhả khoá của lượt chiếm sau; đủ cho 1 job/page, thêm token khoá nếu chạy nhiều máy.
    async nhaKhoa(pageId, p) {
      const hang: Hang = { dang_chay_tu: null };
      if (p.lanChayCuoi !== undefined) hang.lan_chay_cuoi = p.lanChayCuoi;
      if (p.tokenLoiLuc !== undefined) hang.token_loi_luc = p.tokenLoiLuc;
      const { error } = await bang("pancake_sync_state").update(hang).eq("page_id", pageId);
      if (error) throw loi("nha_khoa");
    },
    async docHoiThoai(pageId, ids) {
      const ketQua = new Map<string, DongHoiThoai>();
      for (let i = 0; i < ids.length; i += LO_ID) {
        const { data, error } = await bang("pancake_conversations").select(COT).eq("page_id", pageId)
          .in("conversation_id", ids.slice(i, i + LO_ID));
        if (error) throw loi("doc_hoi_thoai");
        for (const h of (data ?? []) as Hang[]) ketQua.set(h.conversation_id as string, veDong(h));
      }
      return ketQua;
    },
    async luuHoiThoai(d) {
      const { error } = await bang("pancake_conversations").upsert({
        page_id: d.pageId, conversation_id: d.conversationId, ten_khach: catNull(d.tenKhach, 200),
        tin_khach: cat(d.tinKhach, 4000),
        tin_khach_luc: d.tinKhachLuc, co_sdt: d.coSdt, nhom: d.nhom, gap: d.gap, tom_tat: catNull(d.tomTat, 80), ma_may: catNull(d.maMay, 64),
        phan_loai_luc: d.phanLoaiLuc, trang_thai: d.trangThai, cap_nhat_luc: bayGio(),
      }, { onConflict: "page_id,conversation_id" });
      if (error) throw loi("luu_hoi_thoai");
    },
    async danhDauXuLy(pageId, ids) {
      for (let i = 0; i < ids.length; i += LO_ID) {
        const { error } = await bang("pancake_conversations").update({ trang_thai: "da_xu_ly", cap_nhat_luc: bayGio() })
          .eq("page_id", pageId).eq("trang_thai", "cho").in("conversation_id", ids.slice(i, i + LO_ID));
        if (error) throw loi("danh_dau_xu_ly");
      }
    },
    async dsCho(pageId) {
      const { data, error } = await bang("pancake_conversations").select(COT).eq("page_id", pageId).eq("trang_thai", "cho")
        .order("tin_khach_luc", { ascending: true });
      if (error) throw loi("ds_cho");
      return ((data ?? []) as Hang[]).map(veDong);
    },
    async ghiBaoLuc(pageId, id, luc) {
      const { error } = await bang("pancake_conversations").update({ discord_bao_luc: luc, cap_nhat_luc: bayGio() })
        .eq("page_id", pageId).eq("conversation_id", id);
      if (error) throw loi("ghi_bao_luc");
    },
    async hetHanCho(pageId, truoc) {
      const moc = truoc.toISOString();
      const { error } = await bang("pancake_conversations").update({ trang_thai: "da_xu_ly", cap_nhat_luc: bayGio() })
        .eq("page_id", pageId).eq("trang_thai", "cho").lt("tin_khach_luc", moc);
      if (error) throw loi("het_han_cho");
      // Sổ cuộc là chữ suy từ lời khách → hết hạn thì xoá sổ (không xoá dòng).
      const { error: e2 } = await bang("pancake_conversations").update({ so_cuoc: null })
        .eq("page_id", pageId).lt("tin_khach_luc", moc);
      if (e2) throw loi("het_han_so_cuoc");
    },
    async ghiSoCuoc(pageId, id, so) {
      const sach = chuanSoCuoc(so);
      if (!sach) return;
      const { error } = await bang("pancake_conversations").update({ so_cuoc: sach }).eq("page_id", pageId).eq("conversation_id", id);
      if (error) throw loi("ghi_so_cuoc");
    },
  };
}
