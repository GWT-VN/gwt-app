// chép từ GWT-ERP lib/chatbot/chat/ho-tro.ts @c2f3719
/**
 * Ý định "cần gặp NGƯỜI/kỹ thuật" + dò SĐT — tầng code thuần (chép phần hàm; các TEMPLATE_* không dùng ở bot này).
 */
const DAU_TO_HOP_VN = /[\u0300-\u036f]/g;
const boDauThuong = (v: string): string => v.normalize("NFD").replace(DAU_TO_HOP_VN, "").replace(/đ/gi, "d").toLowerCase();

// Cụm lấy từ LỜI KHÁCH trong 500 hội thoại thật + ca Bàn thử 2026-08-17.
// KHÔNG phỏng đoán thêm — cùng nguyên tắc TIN_HIEU_SU_CO.
// Yêu cầu số điện thoại: thay vì "cho xin so"/"cho anh so"/... đỏng ra oan "so sánh",
// dùng cụm đòi đuôi rõ: "cho (xin )?(anh |chi |minh |em |toi )?so (dt|dien thoai)".
// Cụm "xin sdt" đã cover "cho xin sdt" nên không cần dùng lại.
const Y_DINH_GAP_NGUOI_KHONG_KY_THUAT = new RegExp(
  [
    "\\bhotline\\b",
    "\\btong dai\\b",
    "\\bxin sdt\\b",
    "\\bxin so dien thoai\\b",
    "\\bcho (xin )?(anh |chi |minh |em |toi )?so (dt|dien thoai)\\b",
    "\\bgoi lai\\b",
    "\\blien he lai\\b",
    "\\bgoi cho minh\\b",
    "\\bgoi cho toi\\b",
    "\\bgoi cho anh\\b",
    "\\bgoi cho chi\\b",
    "\\bgoi cho em\\b",
    "\\bgap nguoi\\b",
    "\\bgap nhan vien\\b",
    "\\bcan ho tro truc tiep\\b",
  ].join("|"),
);

// Tách "ky thuat" riêng để tính có điều kiện (chỉ match nếu câu KHÔNG chứa "thong so").
// Đánh đổi: câu vừa hỏi spec ("thông số kỹ thuật") vừa đòi kỹ thuật sẽ bị bỏ qua — hiếm,
// nhánh sự cố vẫn đỡ qua các cụm "goi lai"/"gap nhan vien"/v.v.
const KY_THUAT_PATTERN = /\bky thuat\b/;
const THONG_SO_PATTERN = /\bthong so\b/;

// Mệnh đề khách TỪ CHỐI cho số ("chưa tiện cho số đt", "không cho số điện thoại đâu"). Phải gỡ
// TRƯỚC khi dò: chữ "cho so dt" trong lời từ chối khớp đúng luật xin-hotline ở trên, và bot đáp lại
// bằng chính câu XIN SỐ — đo ở lượt thử 2026-09-20 (KB-001 lượt 2), khách hỏi tiếp mà không ai đọc.
const TU_CHOI_CHO_SO = /\b(chua|khong|ko|k|khoi|dung|thoi)\b[^.,;!?]{0,24}\bso (dt|dien thoai)\b/g;

/**
 * Khách đang đòi gặp người/kỹ thuật — so trên bản bỏ dấu + thường.
 *
 * `chiCumRo`: chỉ nhận cụm ĐÒI RÕ (gọi lại, hotline, gặp nhân viên…), bỏ chữ "kỹ thuật" trần. Dùng khi
 * khách ĐÃ từ chối cho số: lúc đó "kỹ thuật bên em có ra công trình không" là một câu hỏi cần được
 * đọc, không phải cớ để xin số lần nữa (đo lại 2026-09-20, KB-020).
 */
export function coYDinhGapNguoi(cauHoi: string, chiCumRo = false): boolean {
  const chuanHoa = boDauThuong(cauHoi).replace(TU_CHOI_CHO_SO, " ");
  // Kiểm tra cụm không-kỹ-thuật trước
  if (Y_DINH_GAP_NGUOI_KHONG_KY_THUAT.test(chuanHoa)) {
    return true;
  }
  // Kiểm tra "ky thuat" CHỈ nếu câu không chứa "thong so"
  if (!chiCumRo && KY_THUAT_PATTERN.test(chuanHoa) && !THONG_SO_PATTERN.test(chuanHoa)) {
    return true;
  }
  return false;
}

/**
 * SĐT Việt Nam trong câu: 10 chữ số bắt đầu 0 (hoặc +84/84 + 9 số → chuẩn hoá
 * về 0…), cho phép cách/chấm/gạch/ngoặc giữa các cụm. Không hợp lệ → null,
 * KHÔNG đoán. Giá tiền kiểu "30.950.000" chỉ có 8 chữ số nên không dính.
 */
export function timSdt(cau: string): string | null {
  for (const m of cau.matchAll(/[+0-9][0-9 .\-()]{7,}[0-9]/g)) {
    const so = m[0].replace(/[^0-9+]/g, "");
    const chuan = so.startsWith("+84")
      ? `0${so.slice(3)}`
      : so.startsWith("84") && so.length === 11
        ? `0${so.slice(2)}`
        : so;
    if (/^0[0-9]{9}$/.test(chuan)) return chuan;
  }
  return null;
}
