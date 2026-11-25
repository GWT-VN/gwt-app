// chép từ GWT-ERP lib/chatbot/db/masterdata.ts @c2f3719

/**
 * Đọc SỐ LIỆU CHÍNH XÁC từ Masterdata cho một máy: chu kỳ thay lõi và bảo hành.
 *
 * VÌ SAO CẦN — đo trên chính bản thử ngày 2026-07-31:
 *   Hỏi "máy CTS10 dùng lõi lọc gì"      → đúng, 4 cấp lọc của CTS10.
 *   Hỏi tiếp "bao lâu thay lõi một lần"  → bot liệt kê lõi của GN610, B04,
 *     USH10, PCFCF — KHÔNG có CTS10 — mà vẫn tự chấm "chắc chắn cao".
 *
 * Ghim tên máy chỉ sửa được TRUY VẤN, không lọc được đoạn trả về. Khi kho không
 * có đoạn nào nói về máy đang hỏi, truy hồi trả về máy gần nhất và model trả
 * lời đúng theo đoạn nó cầm — tức hỏng ở KHÂU TRA, không phải khâu viết. Số
 * liệu kiểu này vốn không nên nằm trong kho cắt đoạn: spec §6.5 nói rõ thông số
 * và chính sách phải đọc lúc chạy qua contract, "không bao giờ để LLM tự nhớ".
 *
 * QUY MÔ: sổ dữ liệu hội thoại (v1.6, sheet 7) đếm được 716 tin khách hỏi chu
 * kỳ thay lõi và 555 tin hỏi bảo hành — hai trong ba chủ đề đông nhất.
 *
 * CHỈ ĐỌC, và chỉ qua CONTRACT. Không chạm bảng nghiệp vụ gốc, đúng luật
 * "không được truy vấn trực tiếp bảng masterdata" của roadmap. Ba nguồn dùng ở
 * đây đều đã tồn tại sẵn, KHÔNG tạo mới cái nào:
 *   - `product_code_alias`      (bảng)  alias khách gõ → internal_code
 *   - `v_chatbot_machine_filter` (view)  internal_code → lõi + chu kỳ
 *   - `v_chatbot_warranty`       (view)  internal_code → bảo hành
 *
 * CHƯA LÀM ĐƯỢC: giá. Chủ đề đông nhất (1.572 tin) nhưng `v_chatbot_catalog`
 * không có cột giá, nên cần view mới bên repo Masterdata — việc phải xin phép,
 * không tự làm.
 */

interface KhachBang {
  // Client mặc định schema chatbot → đọc masterdata phải chỉ schema: "public" (product_code_alias), "api" (chatbot_* view).
  schema: (ten: string) => {
    from: (bang: string) => {
      select: (cot: string) => {
        in: (cot: string, gt: readonly string[]) => Promise<{ data: unknown; error: unknown }>;
      };
    };
  };
}

/** Một dòng lõi lọc của máy. Chuỗi thô giữ nguyên để hiển thị đúng như Masterdata. */
export interface LoiLoc {
  tenLoi: string;
  chuKy: string;
  /**
   * Giá lõi từ `api.chatbot_price` — khớp theo TÊN (`product_name` ↔ `filter_name`),
   * vì bảng giá không mang mã lõi theo máy. Không khớp → `null` (lõi WH-family
   * GTEC/GTEF/GTEP hiện không có dòng giá cùng tên) → nơi gọi phải HOÃN, không mượn
   * số ở nguồn khác.
   */
  gia: number | null;
  /** Lõi TỰ SỤC RỬA, không thay định kỳ (xem `LOI_TU_SUC_RUA`). Khi bật, `chuKy` để rỗng và KHÔNG được đọc ra. */
  khongThayDinhKy?: true;
}

/**
 * Lõi mà chu kỳ trong `product_filter` là MỐC QUẢN LÝ NỘI BỘ, không phải hạn thay của hãng. Tiền lọc GTEP-50A01 (hệ
 * WH15A/WH30A) tự động sục rửa, không thay lõi định kỳ; masterdata ghi "1 năm" CÓ CHỦ ĐÍCH — cột "Chu kỳ thực tế (VN)"
 * của chính dòng đó nói rõ, và view dự báo lõi `v_core_forecast` dùng mốc ấy — nên KHÔNG sửa dữ liệu, chỉ không đọc nó
 * cho khách (chủ sản phẩm bắt 2026-09-20; doc WH15A/WH30A cũng ghi "không phải thay thế lõi lọc định kỳ").
 * ponytail: hằng số theo MÃ LÕI; có lõi thứ hai kiểu này thì chuyển thành một cột cờ ở view `api.chatbot_machine_filter`
 * (migration ở repo GWT-Masterdata).
 */
const LOI_TU_SUC_RUA: ReadonlySet<string> = new Set(["GTEP-50A01-LOI"]);
export const danhDauLoiTuRua = (maLoi: unknown): boolean => typeof maLoi === "string" && LOI_TU_SUC_RUA.has(maLoi.trim());

export interface BaoHanh {
  namToanMay: number | null;
  namLoi: number | null;
  phamViLoi: string;
  nguyenVan: string;
}

/**
 * Giá của MỘT biến thể.
 *
 * Phải theo biến thể chứ không gộp thành một số: "CTS10" ứng CTS10NB (đen) và
 * CTS10NW (trắng). Hôm nay hai màu cùng giá nên gộp lại nhìn vô hại, nhưng ngày
 * hai màu lệch giá thì gộp là nói sai một trong hai — mà không ai thấy.
 */
export interface Gia {
  ten: string;
  dong: number;
}

/** Khuyến mãi (CTKM) còn hiệu lực tháng hiện tại của một máy — từ view api.chatbot_promotion. */
export interface KhuyenMai {
  kenh: string | null;
  giamPct: number | null;
  giaSauKm: number | null;
  quaGiaTri: number | null;
  quaMoTa: string;
  tongGiaTri: number | null;
  pctSaving: number | null;
  dieuKien: string;
}

export interface SoLieuMay {
  /** Cụm chữ NGƯỜI TA GÕ, ví dụ "CTS10". Giữ lại để nhắc đúng tên khách dùng. */
  ten: string;
  /** Mã nội bộ khớp được — một tên thương mại có thể ứng nhiều mã (CTS10NB/NW). */
  maNoiBo: string[];
  loi: LoiLoc[];
  baoHanh: BaoHanh | null;
  gia: Gia[];
  khuyenMai: KhuyenMai | null;
  /**
   * ≥2 mã nội bộ có giá/lõi LỆCH nhau (đo 2026-09-18: "WH30" → WH30A 5 năm ≠ WH30AECO 3-6
   * tháng). Gộp là trộn hai máy vào một câu → số liệu để TRỐNG, nơi gọi phải hỏi lại biến thể.
   * Không có trường này = một máy, hoặc các biến thể chỉ khác màu (CTS10NB/NW) và đã gộp.
   */
  bienTheMoHo?: string[];
}

/**
 * Bản đồ alias → internal_code, nhớ trong tiến trình.
 *
 * Tách khỏi `docAliasSanPham` (chỉ trả danh sách chuỗi để DÒ tên) vì ở đây cần
 * chiều ngược lại: từ tên tra ra mã. Cùng một bảng, hai mục đích khác nhau —
 * gộp lại thì một bên phải mang theo dữ liệu bên kia không dùng tới.
 */
let banDo: Map<string, string[]> | null = null;

/** Xoá bộ nhớ. Chỉ để test. */
export function quenMasterdata(): void {
  banDo = null;
}

async function docBanDo(khach: KhachBang): Promise<Map<string, string[]>> {
  if (banDo) return banDo;

  let data: unknown;
  try {
    // `.in()` với danh sách rỗng là cách lấy TẤT CẢ mà vẫn dùng chung một hình
    // dạng client với các lượt gọi khác — nhưng PostgREST trả rỗng, nên ở đây
    // đọc thẳng bằng select không điều kiện qua cùng cửa `.from`.
    const ket = await (khach.schema("public").from("product_code_alias").select("alias_norm, internal_code") as unknown as
      Promise<{ data: unknown; error: unknown }>);
    if (ket.error) throw ket.error;
    data = ket.data;
  } catch (loi) {
    console.error("[masterdata] không đọc được product_code_alias:", loi);
    return new Map();   // KHÔNG nhớ bản đồ rỗng — lần sau còn thử lại được.
  }

  const m = new Map<string, string[]>();
  for (const h of Array.isArray(data) ? data : []) {
    const a = typeof h?.alias_norm === "string" ? h.alias_norm.trim().toUpperCase() : "";
    const ma = typeof h?.internal_code === "string" ? h.internal_code.trim() : "";
    if (!a || !ma) continue;
    const cu = m.get(a) ?? [];
    if (!cu.includes(ma)) cu.push(ma);
    m.set(a, cu);
  }
  banDo = m;
  return m;
}

/**
 * Mã nội bộ ứng với cụm chữ khách gõ.
 *
 * Khớp theo TIỀN TỐ, cùng lý lẽ đã áp cho `doTenMay`: bảng có `CTS10NB` và
 * `CTS10NW` nhưng KHÔNG có `CTS10` trơn, mà đó mới là thứ khách gõ. Khớp chính
 * xác thì trượt ngay ca phổ biến nhất.
 */
function maCuaTen(ten: string, m: Map<string, string[]>): string[] {
  const T = ten.trim().toUpperCase();
  if (!T) return [];
  const ra = new Set<string>();
  const dungY = m.get(T);
  if (dungY) dungY.forEach((x) => ra.add(x));
  if (ra.size === 0) {
    for (const [alias, ds] of m) if (alias.startsWith(T)) ds.forEach((x) => ra.add(x));
  }
  return [...ra];
}

/**
 * Số liệu Masterdata cho MỘT máy, hoặc `null` khi không tra được.
 *
 * Trả `null` chứ không trả object rỗng: nơi gọi cần phân biệt "không biết máy
 * nào" với "biết máy nhưng Masterdata không có số liệu" — hai ca đó nói với
 * khách khác nhau.
 *
 * Mọi lỗi đều nuốt và trả `null`. Đây là tầng BỔ SUNG; làm sập lượt hỏi vì nó
 * là quá tay — đúng bài học đã vấp với `docAliasSanPham`.
 */
export async function docSoLieuMay(
  ten: string | null,
  khach: KhachBang,
): Promise<SoLieuMay | null> {
  if (!ten) return null;

  let ma: string[];
  try {
    ma = maCuaTen(ten, await docBanDo(khach));
  } catch (loi) {
    console.error("[masterdata] tra mã hỏng:", loi);
    return null;
  }
  if (ma.length === 0) return null;

  // `loc`/`gt` để mở: bảng giá phải tra được CẢ theo tên sản phẩm (giá lõi), không chỉ
  // theo `internal_code` — lõi lọc không mang mã máy trong bảng giá.
  const doc = async (bang: string, cot: string, loc = "internal_code", gt: readonly string[] = ma) => {
    try {
      const ket = await khach.schema("api").from(bang).select(cot).in(loc, gt);
      if (ket.error) throw ket.error;
      return Array.isArray(ket.data) ? ket.data : [];
    } catch (loi) {
      console.error(`[masterdata] không đọc được ${bang}:`, loi);
      return [];
    }
  };

  const [hangLoi, hangBh, hangGiaTho, hangKm] = await Promise.all([
    doc("chatbot_machine_filter", "internal_code, filter_code, filter_name, chu_ky_raw"),
    doc("chatbot_warranty", "full_years, core_years, core_scope, warranty_text"),
    doc("chatbot_price", "internal_code, product_name, gia_ban"),
    // View đã lọc "còn hiệu lực tháng hiện tại" + mỗi mã 1 dòng ưu tiên kênh GWT.
    doc("chatbot_promotion", "kenh, pct_giam, gia_sau_km, qua_gia_tri, qua_mo_ta, tong_gia_tri, pct_saving, dieu_kien"),
  ]);

  // Lọc giá MÁY theo `internal_code` NGAY TRONG CODE: bảng giá chứa cả dòng LÕI (mã
  // LX-…), và lượt tra giá lõi bên dưới dùng chung bảng đó. Không lọc ở đây thì một
  // dòng giá lõi lọt vào `gia` của máy — khách nhận giá lõi làm giá máy.
  const hangGia = hangGiaTho.filter((h) => ma.includes(String(h?.internal_code ?? "")));

  // Biến thể LỆCH dữ liệu (Q3): so "vân tay" giá+lõi của từng mã; khác nhau → không gộp.
  // Mã có alias nhưng KHÔNG có dòng nào (ngừng KD / phụ kiện / chưa nhập số) có vân tay rỗng
  // → bỏ khỏi phép so, kẻo một mã "ma" biến câu hỏi thường thành mơ hồ (review T3 2026-09-18).
  // Tất cả rỗng → không vào đây, rơi xuống guard `return null` như cũ.
  if (ma.length >= 2) {
    const vanTay = (code: string) => JSON.stringify({
      gia: hangGia.filter((h) => h?.internal_code === code).map((h) => String(h?.gia_ban ?? "")).sort(),
      loi: hangLoi.filter((h) => h?.internal_code === code)
        .map((h) => `${String(h?.filter_name ?? "").trim()}|${String(h?.chu_ky_raw ?? "").trim()}`).sort(),
    });
    const RONG = JSON.stringify({ gia: [], loi: [] });
    const coDuLieu = ma.map((c) => [c, vanTay(c)] as const).filter(([, k]) => k !== RONG);
    if (coDuLieu.length >= 2 && coDuLieu.some(([, k]) => k !== coDuLieu[0][1])) {
      return { ten, maNoiBo: ma, loi: [], baoHanh: null, gia: [], khuyenMai: null, bienTheMoHo: coDuLieu.map(([c]) => c) };
    }
  }

  // GIÁ LÕI: bảng giá không mang mã lõi theo máy, chỉ khớp được theo TÊN
  // (`product_name` ↔ `filter_name`; live có tên thừa dấu cách cuối nên trim cả hai
  // phía). Lượt gọi RIÊNG, chạy sau vì danh sách tên chỉ biết được từ `hangLoi`;
  // máy mơ hồ đã thoát ở trên nên không tốn lượt này.
  const tenLoiDs = [...new Set(hangLoi.map((h) => String(h?.filter_name ?? "").trim()).filter(Boolean))];
  const hangGiaLoi = tenLoiDs.length > 0
    ? await doc("chatbot_price", "product_name, gia_ban", "product_name", tenLoiDs)
    : [];
  const giaLoiTheoTen = new Map<string, number>();
  for (const h of hangGiaLoi) {
    const t = String(h?.product_name ?? "").trim().toLowerCase();
    const d = Number(h?.gia_ban ?? 0);
    if (t && Number.isFinite(d) && d > 0) giaLoiTheoTen.set(t, d);
  }

  // Gộp trùng: CTS10NB và CTS10NW dùng CHUNG bộ lọc, nên tra hai mã ra hai dòng
  // giống hệt. Không gộp thì lời dặn nhắc lại cùng một lõi hai lần và model
  // tưởng đó là hai lõi khác nhau.
  const thay = new Map<string, LoiLoc>();
  for (const h of hangLoi) {
    const tenLoi = String(h?.filter_name ?? "").trim();
    const chuKy = String(h?.chu_ky_raw ?? "").trim();
    if (tenLoi && danhDauLoiTuRua(h?.filter_code)) {
      thay.set(`${tenLoi}|`, { tenLoi, chuKy: "", gia: null, khongThayDinhKy: true });
    } else if (tenLoi && chuKy) {
      thay.set(`${tenLoi}|${chuKy}`, { tenLoi, chuKy, gia: giaLoiTheoTen.get(tenLoi.toLowerCase()) ?? null });
    }
  }

  const b = hangBh[0];
  const baoHanh = b
    ? {
      namToanMay: typeof b.full_years === "number" ? b.full_years : null,
      namLoi: typeof b.core_years === "number" ? b.core_years : null,
      phamViLoi: String(b.core_scope ?? "").trim(),
      nguyenVan: String(b.warranty_text ?? "").trim(),
    }
    : null;

  // Giá GIỮ THEO BIẾN THỂ. Gộp trùng theo cặp tên+giá thôi, không gộp về một số:
  // "CTS10" ứng CTS10NB (đen) và CTS10NW (trắng). Hôm nay hai màu cùng
  // 30.950.000 nên gộp nhìn vô hại, nhưng ngày hai màu lệch giá thì gộp là nói
  // sai một trong hai — và đây là con số khách quyết định mua bằng nó.
  const giaTheoMa = new Map<string, Gia>();
  for (const h of hangGia) {
    const t = String(h?.product_name ?? "").trim();
    const d = Number(h?.gia_ban ?? 0);
    if (t && Number.isFinite(d) && d > 0) giaTheoMa.set(`${t}|${d}`, { ten: t, dong: d });
  }

  // CTKM: view trả ≤1 dòng mỗi mã (ưu tiên GWT). Nhiều biến thể (CTS10NB/NW) thường
  // cùng CTKM → lấy dòng đầu là đủ; không gộp số vì mỗi dòng đã là một offer trọn.
  const km = hangKm[0] as Record<string, unknown> | undefined;
  // % giảm và giá sau KM phải KHỚP giá niêm yết; lệch (sheet CTKM tính trên giá gốc cũ) thì bỏ cặp số, giữ quà —
  // câu hỏi CTKM của máy đó đi xuống đuôi hoãn thay vì đọc hai con số đá nhau cho khách (KB-015).
  const kmKhop = kmKhopGia([...giaTheoMa.values()].map((g) => g.dong), soHoac(km?.pct_giam), soHoac(km?.gia_sau_km));
  if (!kmKhop) console.warn(`[masterdata] CTKM ${ma.join("/")} lệch giá niêm yết — bỏ % giảm và giá sau KM`);
  const khuyenMai: KhuyenMai | null = km
    ? {
      kenh: String(km.kenh ?? "").trim() || null,
      giamPct: kmKhop ? soHoac(km.pct_giam) : null,
      giaSauKm: kmKhop ? soHoac(km.gia_sau_km) : null,
      quaGiaTri: soHoac(km.qua_gia_tri),
      quaMoTa: moTaQua(String(km.qua_mo_ta ?? "").trim()),
      tongGiaTri: soHoac(km.tong_gia_tri),
      pctSaving: soHoac(km.pct_saving),
      dieuKien: String(km.dieu_kien ?? "").trim(),
    }
    : null;

  const loi = [...thay.values()];
  const gia = [...giaTheoMa.values()];
  if (loi.length === 0 && !baoHanh && gia.length === 0 && !khuyenMai) return null;
  return { ten, maNoiBo: ma, loi, baoHanh, gia, khuyenMai };
}

/**
 * Ô quà của sheet CTKM mở bằng TỔNG trị giá combo ("Combo 8.500.000VNĐ; 1. …" — scripts/chatbot/_ctkm-fb.mjs) → "combo trị giá
 * 8.500.000VNĐ, gồm: 1. …" để chữ "Combo" không thành tên quà (đo 2026-10-24: nháp "được tặng combo quà Combo 8.500.000VNĐ").
 * Số dưới 5 ký tự ("Combo 6tr") hay combo có tên ("Combo phụ kiện…") giữ nguyên.
 */
export function moTaQua(s: string): string {
  const m = /^combo\s*([\d.,]{5,}(?![\d.,])\s*(?:vnđ|vnd|đồng|đ)?)(?!\p{L})[\s;:,-]*([\s\S]*)$/iu.exec(s);
  return m ? `combo trị giá ${m[1].trim()}${m[2]?.trim() ? `, gồm: ${m[2].trim()}` : ""}` : s;
}

/** numeric/bigint qua PostgREST có thể về dạng chuỗi — ép an toàn về number hoặc null. */
export function soHoac(x: unknown): number | null {
  const n = typeof x === "number" ? x : typeof x === "string" && x.trim() !== "" ? Number(x) : NaN;
  return Number.isFinite(n) ? n : null;
}

/** Giá sau KM có khớp (±1%) với MỘT giá niêm yết × (1 − %giảm) không. Thiếu dữ kiện → true (không kết luận). */
export function kmKhopGia(giaNiemYet: readonly number[], pct: number | null, giaSau: number | null): boolean {
  if (giaNiemYet.length === 0 || pct === null || giaSau === null) return true;
  return giaNiemYet.some((g) => Math.abs(g * (1 - pct / 100) - giaSau) <= g * 0.01);
}
