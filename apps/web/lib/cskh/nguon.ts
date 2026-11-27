import { dataClient, mdClient } from '@/lib/nen-tang/db'

/**
 * Nguồn dữ liệu CSKH v2: 'md' = GWT-Masterdata (`customer_care.*`), 'st' = GWT-SalesTracking như trước. Chỉ đúng
 * `CSKH_NGUON=md` mới bật MD — trống / gõ sai đều về 'st' (app chạy y như cũ). Đọc env server → chỉ gọi phía server.
 */
export const cskhNguon = (): 'md' | 'st' => (process.env.CSKH_NGUON === 'md' ? 'md' : 'st')

/**
 * Client ĐỌC khách / máy / ticket CSKH theo nguồn (service_role — chỉ server, sau requireStaff()).
 * ponytail: chỉ phần đọc theo nguồn; ghi ticket / khách vẫn ở ST (`dataClient`) tới đợt 2 — bật md là đọc MD, ghi ST
 * (ghi chéo nguồn tạm thời: dòng mới tạo ở ST chưa hiện ở MD cho tới lần chép sau).
 */
export const cskhDb = () => (cskhNguon() === 'md' ? mdClient() : dataClient())
