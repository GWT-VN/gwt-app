// chép từ GWT-ERP lib/chatbot/kenh/pancake/doc.ts @c2f3719
// Task 1: chỉ kiểu; client đọc Pancake (taoPancake, PancakeError) vào Task 2.

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
