// chép từ GWT-ERP lib/chatbot/db/cong-cu-tra.ts @c2f3719 (bỏ giaDanhMuc — chỉ cho thẻ; một client Masterdata cho mọi nguồn)
/**
 * Công cụ CHỈ ĐỌC cho model tự tra khi soạn nháp: truy hồi kho tài liệu, số liệu máy Masterdata (khối chữ như lõi),
 * bảng giá các dòng, tồn Shopee. Không ghi gì.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { CONFIG } from "./config.ts";
import { NGUNG_BAN, nhomBaoGia } from "./danh-muc.ts";
import { docSoLieuMay } from "./masterdata.ts";
import { retrieveChunks, type RpcFn } from "./retrieve.ts";
import { khoiSoLieu, traLoiGiaDanhMuc } from "./so-lieu-chu.ts";
import { tomTatTon, type DongTon } from "./ton-kho.ts";

export type NhomGia = "de_ban" | "am_tu" | "loc_tong" | "tat_ca";

export interface CongCuTra {
  timTaiLieu(cau: string): Promise<{ tieuDe: string; noiDung: string }[]>;
  traMay(ma: string): Promise<string>;
  bangGia(nhom: NhomGia): Promise<string>;
  tonKho(ma: string): Promise<string>;
}

const CAU_NHOM: Record<NhomGia, string> = { de_ban: "máy để bàn", am_tu: "âm tủ", loc_tong: "lọc tổng", tat_ca: "" };

/** `sb`: client Masterdata (schema mặc định chatbot) — RPC truy hồi; `.schema("api"|"public"|"sales")` cho số liệu máy và tồn. */
export function taoCongCuTra(sb: SupabaseClient): CongCuTra {
  const rpc: RpcFn = (name, args) => sb.rpc(name, args) as never;
  const docMay = (ma: string) => docSoLieuMay(ma.trim().slice(0, 40) || null, sb as never);
  return {
    timTaiLieu: async (cau) => (await retrieveChunks(cau.slice(0, 300), CONFIG.TOP_K, rpc)).chunks.slice(0, 6)
      .map((c) => ({ tieuDe: c.documentTitle, noiDung: c.content })),
    traMay: async (ma) => {
      const khoi = khoiSoLieu(await docMay(ma));
      // Máy ngừng bán: số liệu vẫn trả (lõi, bảo hành cho khách cũ), kèm một dòng để model không báo giá máy như còn bán.
      return khoi && NGUNG_BAN.has(ma.trim().toUpperCase()) ? `LƯU Ý: máy ${ma.trim().toUpperCase()} đã NGỪNG BÁN — vẫn bán lõi, vẫn bảo hành; không báo giá máy.\n${khoi}` : khoi;
    },
    bangGia: async (nhom) => {
      const ds = await Promise.all(nhomBaoGia(CAU_NHOM[nhom] ?? "").map(async (n) => ({
        ten: n.ten, ds: await Promise.all(n.dsMay.map((m) => docMay(m).catch(() => null))),
      })));
      return traLoiGiaDanhMuc(ds, { xinSo: false, daCoSo: false })?.soLieu ?? "";
    },
    // Tồn Shopee tạm: Bắp ghi sales.shopee_stocks 15 phút/lần; chỉ service_role đọc được. Đọc hỏng → nơi gọi báo lỗi tra.
    tonKho: async (ma) => {
      const { data, error } = await sb.schema("sales").from("shopee_stocks")
        .select("item_name,model_name,item_sku,model_sku,item_status,stock,synced_at").limit(5000);
      if (error) throw new Error("TON_KHO_DOC");
      return tomTatTon(ma, (data ?? []) as DongTon[], new Date());
    },
  };
}
