// chép từ GWT-ERP lib/chatbot/chat/so-lieu-chu.ts @c2f3719
/**
 * MỘT chỗ cho luật "từ SỐ LIỆU máy, viết ra CHỮ".
 *
 * Trước 2026-09-22 ba hàm này nằm trong `db/masterdata.ts` — tệp có nghề đọc Supabase. Nên "bot nói
 * thế nào" trải trên `prompt.ts`, `ho-tro.ts` VÀ một tệp `db/`, còn `answer.ts` (tự khai "không được
 * biết đường tới DB") phải import chéo xuống tầng DB chỉ để lấy chữ. Nay `db/masterdata.ts` chỉ đọc
 * số + giữ kiểu; mọi mặt chữ dựng từ `SoLieuMay` ở đây, cạnh `prompt.ts`/`ho-tro.ts`.
 *
 * Đây là DỜI NGUYÊN VĂN: không một ký tự đầu ra nào đổi so với bản cũ. Chữ ở đây đã được đo từng
 * dòng trên hội thoại thật — sửa mặt chữ phải có số đo đi kèm.
 */
import type { SoLieuMay } from "./masterdata.ts";

// Chốt 2026-09-20: nói dứt khoát "không cần thay lõi", KHÔNG kèm "định kỳ" (khách dễ hiểu thành "thỉnh thoảng vẫn thay").
const CAU_TU_SUC_RUA = "tự động sục rửa, không cần thay lõi";

/** 30950000 → "30.950.000 đ". Để model khỏi tự chấm câu cho một dãy số trần. */
function tienViet(so: number): string {
  return `${so.toLocaleString("vi-VN")} đ`;
}

/**
 * Câu báo giá các dòng cho câu hỏi giá chung chung (đã chốt 2026-10-20, thay quy tắc xin số 2026-10-15 — NV thật gửi bảng giá
 * ngay): giá niêm yết từ Masterdata theo nhóm, rồi hỏi nhu cầu để gợi ý dòng, rồi (còn được mời) mời để số. Máy không có giá
 * (ngừng bán, biến thể lệch) bị bỏ; không máy nào có giá → null, nơi gọi lùi về khuôn xin số. `soLieu` = cùng các dòng giá,
 * để Bắp thấy số là dữ liệu thật. Biến thể khác giá → "từ <giá thấp nhất>".
 */
export function traLoiGiaDanhMuc(
  nhom: ReadonlyArray<{ ten: string; ds: ReadonlyArray<SoLieuMay | null> }>,
  o: { xinSo: boolean; daCoSo: boolean },
): { answer: string; soLieu: string } | null {
  let coKm = false;
  const dong = nhom.flatMap((n) => {
    const may = n.ds.flatMap((sl) => {
      const gia = [...new Set((sl?.gia ?? []).map((g) => g.dong))].sort((a, b) => a - b);
      if (!sl || gia.length === 0) return [];
      const goc = `${gia.length > 1 ? "từ " : ""}${tienViet(gia[0])}`;
      const km = sl.khuyenMai?.giaSauKm;
      if (km) coKm = true;
      // Đã chốt 2026-10-21: máy đang khuyến mãi báo GIÁ SAU KM làm giá chính (giá khách trả), niêm yết chỉ để so.
      return [km ? `${sl.ten} khuyến mãi còn ${tienViet(km)} (giá gốc ${goc})` : `${sl.ten} ${goc}`];
    });
    return may.length ? [`- ${n.ten}: ${may.join(", ")}`] : [];
  });
  if (dong.length === 0) return null;
  const cuoi = o.daCoSo ? " Chuyên gia bên em cũng sẽ liên hệ theo số anh/chị đã để lại ạ."
    : o.xinSo ? " Hoặc anh/chị để lại số điện thoại, chuyên gia bên em sẽ tư vấn kỹ hơn ạ." : "";
  return {
    answer: [
      coKm ? "Dạ, em gửi anh/chị giá tháng này (đã gồm VAT) các dòng máy bên em ạ:" : "Dạ, em gửi anh/chị giá niêm yết (đã gồm VAT) các dòng máy bên em ạ:",
      ...dong,
      `Anh/chị cho em biết nhà mình mấy người dùng và đang dùng nước máy hay nước giếng để em gợi ý dòng hợp nhất ạ.${cuoi}`,
    ].join("\n"),
    soLieu: [
      coKm ? "BẢNG GIÁ MASTERDATA (đã gồm VAT; máy có khuyến mãi tháng này ghi giá sau khuyến mãi, kèm giá gốc niêm yết):"
        : "BẢNG GIÁ NIÊM YẾT MASTERDATA (đã gồm VAT):",
      ...dong,
    ].join("\n"),
  };
}

/**
 * Khối chữ đưa vào lời dặn, hoặc chuỗi rỗng.
 *
 * CỐ Ý KHÔNG đánh số như đoạn tài liệu. `docKetQua` kiểm `nguon` phải nằm trong
 * 1..số đoạn; cho khối này một số nữa thì hoặc phải nới luật kiểm (mất khả năng
 * bắt bịa nguồn) hoặc model dẫn một số hợp lệ trỏ vào chỗ không phải đoạn. Nhãn
 * chữ "MASTERDATA" tách bạch mà không đụng vào cách đánh số đang chạy.
 */
export function khoiSoLieu(sl: SoLieuMay | null): string {
  if (!sl) return "";
  const d: string[] = [`SỐ LIỆU MASTERDATA cho ${sl.ten} (chính xác, ưu tiên hơn đoạn tài liệu):`];
  // Giá lên ĐẦU: đây là chủ đề khách hỏi nhiều nhất (1.572 tin, sổ v1.6 sheet 7).
  // Nêu rõ "đã gồm VAT" — thiếu vế đó thì khách hiểu là chưa gồm và hụt 10%.
  for (const g of sl.gia) d.push(`- Giá niêm yết ${g.ten}: ${tienViet(g.dong)} (đã gồm VAT)`);
  // "12 tháng một lần" chứ KHÔNG phải "thay mỗi 12 tháng". Model chép gần
  // như nguyên văn mặt chữ ở khối này, nên chữ ở đây quyết định câu nó nói ra.
  // "thay mỗi 12 tháng" là lối dịch cứng từ "every 12 months" — đúng nghĩa nhưng
  // người Việt không nói thế, và khách đọc ra ngay là máy viết. Dạng dưới đây
  // đọc xuôi cho cả giá trị đơn ("12 tháng") lẫn khoảng ("6 - 12 tháng").
  //
  // Nhãn "Chu kỳ thay" ĐỨNG ĐẦU dòng là bắt buộc (đo 2026-08-17): bản cũ
  // "- Bộ lọc GE CFNC…: 12 tháng thay một lần" không nói giá trị là gì, nên khi
  // khách hỏi GIÁ lõi, model quét khối ưu-tiên-cao này thấy đúng dòng CFNC và
  // dán ra "có giá là 12 tháng thay một lần". Dòng phải tự khai nó là chu kỳ.
  // Giá lõi đi CÙNG dòng lõi: model có nguồn MASTERDATA đúng cho câu hỏi giá lõi,
  // thay vì nhặt con số "trị giá …" của quà CTKM ở đoạn tài liệu (đo 2026-09-18).
  for (const l of sl.loi) {
    d.push(l.khongThayDinhKy
      ? `- ${l.tenLoi}: KHÔNG CẦN THAY (${CAU_TU_SUC_RUA})`
      : `- Chu kỳ thay ${l.tenLoi}: ${l.chuKy} một lần` + (l.gia !== null ? ` (giá ${tienViet(l.gia)})` : ""));
  }
  if (sl.baoHanh) {
    const b = sl.baoHanh;
    if (b.nguyenVan) d.push(`- Bảo hành: ${b.nguyenVan}`);
    else if (b.namToanMay !== null) {
      d.push(`- Bảo hành: ${b.namToanMay} năm toàn máy`
        + (b.namLoi !== null ? `, ${b.namLoi} năm ${b.phamViLoi || "lõi"}` : ""));
    }
  }
  // Khuyến mãi tháng hiện tại (đã lọc còn hiệu lực, ưu tiên kênh GWT ở view). Số CTKM
  // là volatile nên CHỈ nói khi có dòng — máy không có KM thì không nhắc, không bịa.
  const k = sl.khuyenMai;
  if (k) {
    const ve: string[] = [];
    if (k.giamPct != null) ve.push(`giảm ${k.giamPct}%`);
    if (k.giaSauKm != null) ve.push(`còn ${tienViet(k.giaSauKm)}`);
    d.push(`- Khuyến mãi tháng này${k.kenh ? ` (kênh ${k.kenh})` : ""}: ${ve.join(", ") || "đang có ưu đãi"}`);
    if (k.quaMoTa) d.push(`  Quà tặng: ${k.quaMoTa}`);
    if (k.dieuKien) d.push(`  Điều kiện: ${k.dieuKien}`);
  }
  return d.join("\n");
}

/** Một đoạn của tài liệu masterdata_sync (một mục `## …` của chatbot_doc_md). */
export type DoanThongSo = { ma: string; muc: string; noiDung: string; thuTu: number };

const MUC_THONG_SO = ["Thông số kỹ thuật", "Kích thước & khối lượng", "Điều kiện lắp đặt"];

/**
 * Thông số máy cho tra_may. Đo 2026-11-27: kích thước / khối lượng chỉ nằm ở mẩu tài liệu ~100 ký tự, tim_tai_lieu
 * lúc lấy được lúc không → cùng câu "cho xin thông số" khi trả lời đủ, khi chuyển NV vì "tài liệu chưa có kích thước".
 * Biến thể cùng thông số (CTS10NB/NW) gộp một dòng; khác nhau thì ghi mã để không trộn số của hai máy.
 */
export function khoiThongSo(doan: DoanThongSo[]): string {
  const chon = doan.filter((d) => MUC_THONG_SO.includes(d.muc) && d.noiDung.trim())
    .sort((a, b) => MUC_THONG_SO.indexOf(a.muc) - MUC_THONG_SO.indexOf(b.muc) || a.thuTu - b.thuTu || a.ma.localeCompare(b.ma));
  const dong = new Map<string, DoanThongSo>();
  for (const d of chon) if (!dong.has(`${d.muc}|${d.noiDung.trim()}`)) dong.set(`${d.muc}|${d.noiDung.trim()}`, d);
  if (!dong.size) return "";
  const nhieuMa = new Set([...dong.values()].map((d) => d.ma)).size > 1;
  return ["THÔNG SỐ MASTERDATA (chính xác, ưu tiên hơn đoạn tài liệu):",
    ...[...dong.values()].map((d) => `- ${nhieuMa ? `${d.ma} · ` : ""}${d.muc}: ${d.noiDung.trim()}`)].join("\n");
}
