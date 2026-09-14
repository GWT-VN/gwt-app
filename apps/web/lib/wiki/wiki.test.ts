import { describe, expect, it } from "vitest";
import { SAN_PHAM, TAI_LIEU } from "./data/san-pham";
import { CONG_BO, NHOM, phanCuaNhom, type SanPham } from "./kieu";
import { KHU, crumbFor, khuCua, navCuaKhu, navSanPham, navTaiLieu } from "./nav";
import { slugTieuDe } from "../../components/marketing/Markdown";

const ush10 = SAN_PHAM.find((s) => s.ma === "ush10") as SanPham;

describe("dữ liệu PKB bóc từ pkb.md", () => {
  it("có ít nhất một sản phẩm và USH10 nằm trong đó", () => {
    expect(SAN_PHAM.length).toBeGreaterThan(0);
    expect(ush10).toBeDefined();
  });

  it("USH10 có đủ 10 phần, phần nào cũng có nội dung", () => {
    expect(ush10.phan).toHaveLength(10);
    expect(ush10.phan.filter((p) => p.coNoiDung)).toHaveLength(10);
    expect(ush10.phan.map((p) => p.so)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("mỗi phần cắt ra đúng tiêu đề của nó, không nuốt sang phần sau", () => {
    for (const p of ush10.phan) {
      expect(p.noiDung.startsWith(`# PHẦN ${p.so}`), `phần ${p.so}`).toBe(true);
      // Chỉ được chứa ĐÚNG MỘT mốc `# PHẦN` — nhiều hơn là cắt hụt.
      expect(p.noiDung.match(/^#\s+PHẦN\s+\d+\s*[—–-]/gm) ?? []).toHaveLength(1);
    }
  });

  it("mã dữ kiện không trùng nhau", () => {
    const ma = ush10.facts.map((f) => f.ma);
    expect(new Set(ma).size).toBe(ma.length);
  });

  it("MỌI dữ kiện đều có nhãn công bố hợp lệ", () => {
    // Đây là điểm an toàn: một dòng không nhãn là một dòng người đọc không biết
    // được nói với khách hay không. Nhóm K/L/M không có cột Công bố nên nhãn phải
    // được lấy từ tiêu đề nhóm.
    const khongNhan = ush10.facts.filter((f) => !CONG_BO[f.congBo]);
    expect(khongNhan.map((f) => f.ma)).toEqual([]);
  });

  it("nhãn công bố là emoji đủ, không phải nửa surrogate", () => {
    // Regex thiếu cờ `u` từng cắt 🔵 thành "\ud83d". Chốt lại bằng test.
    for (const f of ush10.facts) {
      expect([...f.congBo]).toHaveLength(1);
      expect(f.congBo.codePointAt(0)).toBeGreaterThan(0xffff);
    }
  });

  it("dữ kiện nhạy cảm được gắn đúng nhãn", () => {
    const lay = (ma: string) => ush10.facts.find((f) => f.ma === ma);
    // Mục K = dữ liệu kinh doanh, toàn bộ nội bộ.
    expect(lay("F-K01")?.congBo).toBe("🔵");
    // Mục M = dữ kiện đã xác định SAI, hạng X, cấm nói.
    expect(lay("F-M01")?.congBo).toBe("🔴");
    expect(lay("F-M01")?.hang).toBe("X");
    // Mục L = suy luận số học, hạng E, nội bộ.
    expect(lay("F-L03")?.hang).toBe("E");
    expect(lay("F-L03")?.congBo).toBe("🔵");
  });

  it("tên nhóm đã bỏ phần chú thích trong ngoặc", () => {
    const l = ush10.facts.find((f) => f.ma === "F-L01");
    expect(l?.tenNhom).toBe("SUY LUẬN SỐ HỌC");
    expect(l?.tenNhom).not.toContain("(");
  });

  it("số hiệu TÜV đã chốt là 1111279087, không còn 1111297087 như dữ kiện đúng", () => {
    const i01 = ush10.facts.find((f) => f.ma === "F-I01");
    expect(i01?.giaTri).toContain("1111279087");
    expect(i01?.hang).toBe("A");
  });
});

describe("chia nhóm thông tin theo người đọc", () => {
  it("Phần 1 (bảng sự thật) hiện trong CẢ BA nhóm nghiệp vụ", () => {
    for (const nhom of ["ky-thuat", "san-pham", "truyen-thong"] as const) {
      const so = phanCuaNhom(ush10, nhom).map((p) => p.so);
      expect(so, nhom).toContain(1);
      expect(so[0], `${nhom}: bảng sự thật phải đứng đầu`).toBe(1);
    }
  });

  it("nhóm Quản lý KHÔNG kèm Phần 1 — nó có Phần 0 và 8", () => {
    const so = phanCuaNhom(ush10, "quan-ly").map((p) => p.so);
    expect(so).toEqual([0, 8]);
  });

  it("mỗi nhóm nghiệp vụ có đúng các phần đã quy ước", () => {
    expect(phanCuaNhom(ush10, "ky-thuat").map((p) => p.so)).toEqual([1, 3, 4, 5]);
    expect(phanCuaNhom(ush10, "san-pham").map((p) => p.so)).toEqual([1, 6, 9]);
    expect(phanCuaNhom(ush10, "truyen-thong").map((p) => p.so)).toEqual([1, 2, 7]);
  });

  it("gộp 4 nhóm là phủ hết 10 phần, không sót phần nào", () => {
    const phu = new Set(NHOM.flatMap((n) => phanCuaNhom(ush10, n.ma).map((p) => p.so)));
    expect([...phu].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("điều hướng wiki", () => {
  it("nhận đúng khu từ đường dẫn", () => {
    expect(khuCua("/wiki")).toBeNull();
    expect(khuCua("/wiki/marketing")?.ma).toBe("marketing");
    expect(khuCua("/wiki/marketing/luat/ad-compliance-vn")?.ma).toBe("marketing");
    expect(khuCua("/wiki/san-pham")?.ma).toBe("san-pham");
    expect(khuCua("/wiki/san-pham/ush10/tra-cuu")?.ma).toBe("san-pham");
  });

  it("khu chưa có nội dung thì KHÔNG có href — không dựng link chết", () => {
    for (const k of KHU) {
      if (k.trangThai === "chua-co") expect(k.href, k.ma).toBeUndefined();
      else expect(k.href, k.ma).toBeTruthy();
    }
    // Phải còn chỗ cho các phòng ban khác, không chỉ 2 khu.
    expect(KHU.length).toBeGreaterThan(2);
    expect(KHU.map((k) => k.ma)).toContain("cskh");
  });

  it("mã khu không trùng nhau", () => {
    expect(new Set(KHU.map((k) => k.ma)).size).toBe(KHU.length);
  });

  it("mọi href trong nav đều nằm dưới /wiki", () => {
    for (const k of KHU) {
      for (const g of navCuaKhu(k)) {
        for (const i of g.items) expect(i.href.startsWith("/wiki/"), i.href).toBe(true);
      }
    }
  });

  it("nav khu Sản phẩm có mỗi máy một nhóm, kèm Tổng quan và Tra cứu", () => {
    const nav = navSanPham();
    expect(nav).toHaveLength(SAN_PHAM.length);
    const nhan = nav[0].items.map((i) => i.label);
    expect(nhan).toContain("Tổng quan");
    expect(nhan).toContain("Tra cứu dữ kiện");
  });

  it("breadcrumb khớp đường dài nhất, và trang gốc khu không nuốt trang con", () => {
    expect(crumbFor("/wiki/san-pham/ush10/tra-cuu")).toBe("Tra cứu dữ kiện");
    expect(crumbFor("/wiki/san-pham/ush10")).toBe("Tổng quan");
    // `/wiki/marketing` là gốc nhánh — không được thành breadcrumb của mọi trang con.
    expect(crumbFor("/wiki/marketing/kho-case")).toBe("Kho case WIN / FAIL");
  });
});

describe("dọn HTML thô khỏi PKB", () => {
  const moiPhan = () => SAN_PHAM.flatMap((sp) => sp.phan.map((p) => p.noiDung)).join("\n");

  it("không còn thẻ neo <a id> nào lọt ra trang", () => {
    // react-markdown không hiểu HTML thô — sót lại là hiện nguyên văn `<a id="q26"></a>`
    // giữa trang, đúng lỗi CEO báo 28/08.
    expect(moiPhan()).not.toMatch(/<a\s+id=/i);
  });

  it("không còn <br> nào lọt ra trang", () => {
    expect(moiPhan()).not.toMatch(/<br\s*\/?>/i);
  });

  it("không còn thẻ HTML thô nào khác", () => {
    // Bỏ qua nội dung trong dấu nháy ngược: `<ID>` trong một mẫu URL là chữ, không phải thẻ.
    const con = moiPhan().replace(/`[^`]*`/g, "").match(/<\/?[a-zA-Z][^>]*>/g) ?? [];
    expect(con).toEqual([]);
  });

  it("link mục lục đã trỏ sang slug tiêu đề, và slug đó có thật ở đâu đó trong PKB", () => {
    // Mục lục nằm ở phần BÌA (trước `# PHẦN 0`), trỏ xuyên suốt cả tài liệu — nên phải
    // đối chiếu với tiêu đề của MỌI phần, không riêng phần nào.
    const coSlug = new Set(
      [ush10.bia, ...ush10.phan.map((p) => p.noiDung)]
        .flatMap((md) => [...md.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)])
        .map((m) => slugTieuDe(m[1])),
    );
    const link = [...ush10.bia.matchAll(/\]\(#([a-z0-9-]+)\)/g)].map((m) => m[1]);
    expect(link.length).toBeGreaterThan(30); // mục lục Q1–Q40 + các mục Phần 0–9
    expect(link.filter((l) => !coSlug.has(l))).toEqual([]);
  });

  it("slugTieuDe bỏ dấu tiếng Việt đúng", () => {
    expect(slugTieuDe("Q20. Chi phí dùng máy trong 5 năm khoảng bao nhiêu?")).toBe(
      "q20-chi-phi-dung-may-trong-5-nam-khoang-bao-nhieu",
    );
    expect(slugTieuDe("Đèn đỏ — thay lõi")).toBe("den-do-thay-loi");
  });
});

describe("khu tài liệu dạng trang", () => {
  it("mọi khu có tài liệu đều được bật lên và có href", () => {
    for (const k of TAI_LIEU) {
      const meta = KHU.find((x) => x.ma === k.khu);
      expect(meta, `khu "${k.khu}" có ${k.bai.length} bài nhưng KHÔNG có trong KHU`).toBeDefined();
      expect(meta!.trangThai, k.khu).toBe("co-noi-dung");
      expect(meta!.href, k.khu).toBe(`/wiki/${k.khu}`);
    }
  });

  it("khu Công việc chung đã có nội dung — gồm bài văn hoá làm việc", () => {
    const k = TAI_LIEU.find((x) => x.khu === "cong-viec-chung");
    expect(k, "khu Công việc chung phải có tài liệu").toBeDefined();
    const vh = k!.bai.find((b) => b.slug === "van-hoa-lam-viec");
    expect(vh).toBeDefined();
    expect(vh!.hang).toBe("A");
    // Nội dung CEO bổ sung 28/08 phải có mặt.
    expect(vh!.noiDung).toContain("Không nhắn riêng công việc");
    expect(vh!.noiDung).toContain("sếp lớn, quan chức, người nổi tiếng");
  });

  it("mọi bài đều có tiêu đề, slug duy nhất trong khu, và nội dung không rỗng", () => {
    for (const k of TAI_LIEU) {
      const slugs = k.bai.map((b) => b.slug);
      expect(new Set(slugs).size, `${k.khu}: slug trùng`).toBe(slugs.length);
      for (const b of k.bai) {
        expect(b.tieuDe.trim(), `${k.khu}/${b.slug}`).not.toBe("");
        expect(b.noiDung.length, `${k.khu}/${b.slug} rỗng`).toBeGreaterThan(50);
      }
    }
  });

  it("tài liệu Deep Research đều mang hạng D và có khối cảnh báo", () => {
    // Nội dung AI tổng hợp mà không gắn nhãn thì nhân viên sẽ tưởng chắc như HDSD hãng.
    const ktn = TAI_LIEU.find((x) => x.khu === "kien-thuc-nen");
    expect(ktn).toBeDefined();
    for (const b of ktn!.bai) {
      expect(b.hang, `${b.slug}`).toBe("D");
      expect(b.noiDung, `${b.slug} thiếu cảnh báo`).toContain("không đọc con số");
    }
  });

  it("không có bài hạng D nào lọt vào khu KHÁC mà thiếu cảnh báo", () => {
    for (const k of TAI_LIEU.filter((x) => x.khu !== "kien-thuc-nen")) {
      for (const b of k.bai.filter((x) => x.hang === "D")) {
        expect(b.noiDung, `${k.khu}/${b.slug}`).toContain("không đọc con số");
      }
    }
  });

  it("sidebar khu tài liệu dựng đúng số bài", () => {
    for (const k of TAI_LIEU) {
      const tong = navTaiLieu(k.khu).flatMap((g) => g.items).length;
      expect(tong, k.khu).toBe(k.bai.length);
    }
    expect(navCuaKhu(KHU.find((k) => k.ma === "cong-viec-chung")!).length).toBeGreaterThan(0);
  });

  it("training Sales đã mang bản USH10 ĐÃ SỬA, không phải bản cũ sai", () => {
    const b = TAI_LIEU.find((k) => k.khu === "sales")!.bai.find((x) => x.slug === "training-sales-cskh")!;
    expect(b.noiDung).toContain("Âm tủ bếp (under-sink)");
    expect(b.noiDung).not.toContain("Để bàn (không sparkling)");
    expect(b.noiDung).not.toContain("Thường **hết hàng**");
  });
});

describe("dọn nội dung trước khi lên prod (CEO báo 31/08)", () => {
  const bai = (khu: string, slug: string) =>
    TAI_LIEU.find((k) => k.khu === khu)!.bai.find((b) => b.slug === slug)!;

  it("KHÔNG còn mục chỉ-nội-bộ nào lọt lên prod", () => {
    // Nhật ký biên tập / cần kiểm chứng là sổ tay người soạn — giữ trong .md và backlog,
    // không đẩy cho nhân viên đọc. Nặng hơn: mục "cần kiểm chứng" đặt cạnh nội dung chính
    // làm người đọc không biết phần nào đã chốt.
    for (const k of TAI_LIEU) {
      for (const b of k.bai) {
        const nhan = `${k.khu}/${b.slug}`;
        expect(b.noiDung, nhan).not.toMatch(/^#{1,6}.*nhật ký biên tập/im);
        expect(b.noiDung, nhan).not.toMatch(/^#{1,6}.*ghi chú biên tập/im);
        expect(b.noiDung, nhan).not.toMatch(/^#{1,6}.*cần bổ sung/im);
        expect(b.noiDung, nhan).not.toMatch(/^#{1,6}.*kiểm chứng/im);
      }
    }
  });

  it("không còn link .md tương đối — đó là nguyên nhân trang Danh mục folder bị 404", () => {
    for (const k of TAI_LIEU) {
      for (const b of k.bai) {
        const xau = b.noiDung.match(/\]\(\.?\/?[A-Za-z0-9._-]+\.md[)#]/g) ?? [];
        expect(xau, `${k.khu}/${b.slug}`).toEqual([]);
      }
    }
    expect(bai("cong-viec-chung", "van-hoa-lam-viec").noiDung)
      .toContain("(/wiki/cong-viec-chung/danh-muc-folder-drive)");
  });

  it("mục lục sinh lại: neo khớp đúng id mà trình render đặt lên tiêu đề", () => {
    for (const k of TAI_LIEU) {
      for (const b of k.bai) {
        if (!/^##\s+Mục lục/im.test(b.noiDung)) continue;
        const coSlug = new Set(
          [...b.noiDung.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((m) => slugTieuDe(m[1])),
        );
        const neo = [...b.noiDung.matchAll(/\]\(#([a-z0-9-]+)\)/g)].map((m) => m[1]);
        expect(neo.length, `${k.khu}/${b.slug}`).toBeGreaterThan(0);
        expect(neo.filter((x) => !coSlug.has(x)), `${k.khu}/${b.slug}`).toEqual([]);
      }
    }
  });

  it("bảng sản phẩm Sales khớp masterdata thay lõi", () => {
    const md = bai("sales", "training-sales-cskh").noiDung;
    expect(md).toMatch(/\*\*B04\*\*.*Để bàn/);            // B04 là để bàn, không phải âm tủ
    expect(md).toMatch(/\*\*CTS10\*\*.*1 lõi duy nhất.*CFNC/);
    expect(md).toMatch(/\*\*GN620\*\*.*PCF \+ NF/);       // GN620 có CẢ HAI lõi
    expect(md).toMatch(/\*\*DN810\*\*.*PPF \+ PCFB \+ NF/);
  });

  it("đã bỏ mục QA/training chatbot AI — hiện không áp dụng", () => {
    const md = bai("sales", "training-sales-cskh").noiDung;
    expect(md).not.toMatch(/^##.*QA \/ training cho chatbot/im);
  });

  it("trang Công cụ làm việc: bỏ Asana, chat là Discord", () => {
    const md = bai("cong-viec-chung", "cong-cu-lam-viec").noiDung;
    expect(md).toContain("Discord");
    expect(md).toContain("Asana đã ngừng dùng");
    // Không còn hướng dẫn thao tác Asana, và không còn bảo nhắn Zalo riêng —
    // trái với nguyên tắc "không nhắn riêng công việc".
    expect(md).not.toMatch(/tạo task trên Asana/i);
    expect(md).not.toMatch(/qua Zalo cá nhân/i);
  });
});

describe("kho video & kịch bản đã quay", () => {
  const kho = () => TAI_LIEU.find((k) => k.khu === "kho-video")!;

  it("khu đã bật và có trang hướng dẫn tổ chức kho", () => {
    expect(KHU.find((k) => k.ma === "kho-video")?.trangThai).toBe("co-noi-dung");
    expect(kho().bai.map((b) => b.slug)).toContain("cach-to-chuc-kho");
  });

  it("kịch bản CTS20 có link file gốc trên Drive", () => {
    const b = kho().bai.find((x) => x.slug === "kich-ban-cts20-chuyen-gia-2026-01")!;
    expect(b.noiDung).toContain("drive.google.com/file/d/156l0AzlhmPh6vznd1gncj2DDpT7M6odD");
  });

  it("kịch bản đã quay có câu vi phạm PHẢI kèm cảnh báo, không được lặng lẽ đăng", () => {
    // Video đã phát nên transcript giữ nguyên văn — nhưng phải gắn cảnh báo, nếu không
    // người viết kịch bản sau sẽ bốc nguyên câu cấm sang bài mới.
    const b = kho().bai.find((x) => x.slug === "kich-ban-cts20-chuyen-gia-2026-01")!;
    expect(b.noiDung).toContain("tốt cho tiêu hoá");        // giữ nguyên văn
    expect(b.noiDung).toContain("ĐỌC TRƯỚC KHI DÙNG LẠI");  // và có cảnh báo
    expect(b.noiDung).toMatch(/Claim y khoa/i);
    expect(b.noiDung).toMatch(/bất kỳ % diệt khuẩn nào/i);
  });

  it("tuổi thọ lõi CTS20 nêu theo masterdata, không theo lời nói trong video", () => {
    // Video đọc "12–24 tháng" cho lõi tiền xử lý — đảo ngược so với masterdata.
    const b = kho().bai.find((x) => x.slug === "kich-ban-cts20-chuyen-gia-2026-01")!;
    expect(b.noiDung).toMatch(/PCF.*6–12 tháng/);
    expect(b.noiDung).toMatch(/NF.*12–24 tháng/);
    expect(b.noiDung).toMatch(/ĐẢO NGƯỢC so với/i);
  });
});

describe("sổ tay viết Hook (khu Marketing video)", () => {
  const so = () => TAI_LIEU.find((k) => k.khu === "marketing")!.bai
    .find((b) => b.slug === "so-tay-viet-hook")!;

  it("nằm trong khu Marketing video và hiện trên sidebar khu đó", () => {
    expect(so()).toBeDefined();
    const nav = navCuaKhu(KHU.find((k) => k.ma === "marketing")!);
    expect(nav.flatMap((g) => g.items).map((i) => i.href))
      .toContain("/wiki/marketing/so-tay-viet-hook");
  });

  it("cú pháp Obsidian [[#...]] đã chuyển hết — không lọt ra trang", () => {
    // Team Marketing soạn trong Obsidian; react-markdown không hiểu [[...]] nên để nguyên
    // là hiện lù lù giữa trang, đúng lỗi thẻ <a id> hôm 28/08.
    for (const k of TAI_LIEU) {
      for (const b of k.bai) expect(b.noiDung, `${k.khu}/${b.slug}`).not.toContain("[[#");
    }
  });

  it("giữ nguyên nội dung sổ tay: 14 nhóm hook, 4 công thức, checklist", () => {
    const md = so().noiDung;
    expect(md).toContain("14 nhóm hook");
    expect(md).toContain("Anti-hook");
    expect(md).toContain("knowledge gap");
    expect(md).toMatch(/Checklist trước khi chốt/i);
  });

  it("có cảnh báo: câu chạm sản phẩm vẫn phải qua cổng claim", () => {
    // Sổ tay dạy viết HAY; được nói gì thì PKB quyết. Hai ví dụ hook trong sổ tay đang
    // trích dữ kiện sản phẩm nên phải trỏ về mã F-xxx.
    const md = so().noiDung;
    expect(md).toContain("/wiki/san-pham");
    expect(md).toMatch(/O-02/);
    expect(md).toMatch(/F-I08/);
  });
});

describe("kịch bản Lọc tổng · Nước mềm 04/2026", () => {
  const b = () => TAI_LIEU.find((k) => k.khu === "kho-video")!.bai
    .find((x) => x.slug === "kich-ban-loc-tong-nuoc-mem-2026-04")!;

  it("có link thư mục Drive", () => {
    expect(b().noiDung).toContain("drive.google.com/drive/folders/1rKSXxzYP1iSIh8RPXt7yKv_cFjQasbp0");
  });

  it("4 câu so sánh tuyệt đối giữ nguyên văn NHƯNG phải có cảnh báo", () => {
    const md = b().noiDung;
    expect(md).toContain("chỉ số iodine cao nhất trên thị trường"); // nguyên văn
    expect(md).toContain("ĐỌC TRƯỚC KHI DÙNG LẠI");                  // và có cảnh báo
    expect(md).toMatch(/So sánh tuyệt đối/i);
    expect(md).toMatch(/gấp 3–4 lần/);
    expect(md).toMatch(/top 20 trên toàn thế giới/);
  });

  it("bảng độ cứng theo vùng có kèm cảnh báo thiếu đơn vị", () => {
    // Số dùng bán hàng được ngay, nhưng video không nói đơn vị — đọc cho khách mà sai
    // đơn vị là hỏng niềm tin ngay tại điểm chốt.
    const md = b().noiDung;
    expect(md).toMatch(/sông Đuống/);
    expect(md).toMatch(/không nói rõ đơn vị/i);
    expect(md).toMatch(/mg\/L CaCO/);
  });

  it("ghi lại bài học dựng: bản focus mạnh hơn bản có người dẫn", () => {
    expect(b().noiDung).toMatch(/bản focus mạnh hơn/i);
    const huongDan = TAI_LIEU.find((k) => k.khu === "kho-video")!.bai
      .find((x) => x.slug === "cach-to-chuc-kho")!;
    expect(huongDan.noiDung).toMatch(/Quay cả 2 bản khi nội dung là chuyên môn/);
  });

  it("có bảng chính tả cần sửa khi trích lại", () => {
    const md = b().noiDung;
    expect(md).toMatch(/KDF55/);
    expect(md).toMatch(/inox 316L/);
    expect(md).toMatch(/chỉ số iốt/);
  });
});

describe("kịch bản Riverside 07/2025 + bảng claim trôi", () => {
  const kho = () => TAI_LIEU.find((k) => k.khu === "kho-video")!;
  const rs = () => kho().bai.find((x) => x.slug === "kich-ban-riverside-loc-tong-2025-07")!;

  it("có link Drive và mã đặt tên theo quy ước", () => {
    expect(rs().noiDung).toContain("drive.google.com/drive/folders/1RvviOClizkKiKNENm4bgf58el2S0K1Np");
    expect(rs().noiDung).toMatch(/LOCTONG_showcase_ngang_202507/);
  });

  it("claim ung thư giữ nguyên văn NHƯNG phải nằm dưới cảnh báo cấm tuyệt đối", () => {
    // Đây là vi phạm nặng nhất trong kho — gọi đích danh bệnh ung thư.
    const md = rs().noiDung;
    expect(md).toContain("ung thư bàng quang");           // nguyên văn, để đối chiếu
    expect(md).toMatch(/VI PHẠM NẶNG NHẤT TRONG KHO/);
    expect(md).toMatch(/Cấm tuyệt đối — claim y khoa/);
    expect(md).toMatch(/Không kể \*\*bệnh gì\*\*/);
  });

  it("nêu đủ 4 nhóm lỗi: y khoa · tuyệt đối · sai dữ kiện · claim trôi", () => {
    const md = rs().noiDung;
    expect(md).toMatch(/cao nhất thị trường/);
    expect(md).toMatch(/NSF\/ANSI là bộ TIÊU CHUẨN, không phải giải thưởng/);
    expect(md).toMatch(/QCVN 01-1:2018\/BYT/);
    expect(md).toMatch(/claim bị TRÔI giữa các video/i);
  });

  it("bảng claim trôi ở trang tổ chức kho đối chiếu đủ 3 video", () => {
    // Sửa từng video không giải quyết được — phải thấy nó lặp lại mới chốt được bộ số.
    const md = kho().bai.find((x) => x.slug === "cach-to-chuc-kho")!.noiDung;
    expect(md).toMatch(/Claim đang trôi giữa các video/i);
    expect(md).toMatch(/gấp \*\*4–5 lần\*\*/);
    expect(md).toMatch(/gấp \*\*3–4 lần\*\*/);
    expect(md).toMatch(/99,9%/);
  });

  it("đánh dấu 3 đoạn dùng lại được — không phải chỉ toàn cấm", () => {
    // Kho tư liệu mà chỉ có cảnh báo thì không ai dùng; phải chỉ rõ chỗ nào lấy được.
    const md = rs().noiDung;
    expect(md).toMatch(/dùng lại được ngay/);
    expect(md).toMatch(/"Sự đồng bộ" là luận điểm mạnh và an toàn/);
    expect(md).toMatch(/Đoạn IoT này rất mạnh/);
  });
});

describe("transcript kho video phải ĐẦY ĐỦ, không cắt xén", () => {
  // CEO báo 07/09: bản đăng lên đang là bản rút gọn. Kho tư liệu mà thiếu câu thì lần sau
  // người viết kịch bản bốc lại sẽ thiếu theo, và không ai biết là đã thiếu.
  const kho = () => TAI_LIEU.find((k) => k.khu === "kho-video")!;
  /** Bỏ dấu trích dẫn đầu dòng + gộp khoảng trắng — transcript được ngắt dòng cho dễ đọc. */
  const phang = (slug: string) =>
    kho().bai.find((b) => b.slug === slug)!.noiDung.replace(/^>\s?/gm, "").replace(/\s+/g, " ");

  const MOC: Record<string, string[]> = {
    "kich-ban-cts20-chuyen-gia-2026-01": [
      "Đây Nutiqa em thấy không", "máy siêu âm bốn chiều", "Nano Silver",
      "ga R600", "năm gam trên một lít", "hai trăm năm tư nanomet",
      "giữ lại những giá trị tự nhiên của nước",
    ],
    "kich-ban-loc-tong-nuoc-mem-2026-04": [
      "len lỏi qua các tầng khí quyển", "nước sông Đuống", "hơn bốn nghìn bài báo",
      "thiết bị về quân sự", "mọi thứ phía sau mới thực sự thay đổi",
    ],
    "kich-ban-riverside-loc-tong-2025-07": [
      "Alex Long và Mai Anh", "nhà máy khử mặn Desalina", "gáo dừa Sri Lanka",
      "Oscar của ngành thiết kế", "em đang ở Mũi Né", "bình chứa kháng khuẩn",
      "tham khảo hệ thống lọc tổng của GE",
    ],
  };

  for (const [slug, moc] of Object.entries(MOC)) {
    it(`${slug} giữ đủ câu mốc đầu–giữa–cuối`, () => {
      const md = phang(slug);
      expect(moc.filter((x) => !md.includes(x)), "câu bị cắt mất").toEqual([]);
    });
  }

  it("mỗi transcript đủ dài — chặn việc vô tình rút gọn lại", () => {
    const toiThieu: Record<string, number> = {
      "kich-ban-cts20-chuyen-gia-2026-01": 9000,
      "kich-ban-loc-tong-nuoc-mem-2026-04": 19000,
      "kich-ban-riverside-loc-tong-2025-07": 18000,
    };
    for (const [slug, n] of Object.entries(toiThieu)) {
      const b = kho().bai.find((x) => x.slug === slug)!;
      expect(b.noiDung.length, slug).toBeGreaterThan(n);
    }
  });
});

describe("video ads Lọc tổng 09/2026", () => {
  const kho = () => TAI_LIEU.find((k) => k.khu === "kho-video")!;
  const ads = () => kho().bai.find((x) => x.slug === "kich-ban-ads-loc-tong-2026-09")!;
  const phang = (md: string) => md.replace(/^>\s?/gm, "").replace(/\s+/g, " ");

  it("có link Drive và đánh dấu rõ là video ADS", () => {
    const md = ads().noiDung;
    expect(md).toContain("drive.google.com/drive/folders/1YBQJA9W-ILGJwXBbIwIj1-GZzCdTy2f3");
    // Ads chạy ra công chúng — rủi ro khác hẳn nội dung nội bộ, phải nói rõ.
    expect(md).toMatch(/VIDEO \*\*ADS\*\* — RỦI RO CAO NHẤT/);
  });

  it("cam kết bảo hành 10 năm phải đối chiếu với F-G02 và O-10 của PKB", () => {
    // PKB ghi 5 năm bơm+bo, hạng D, O-10 chưa đóng vì "không có văn bản dẫn chứng".
    // Video ads đã phát ra công chúng con số 10 năm.
    const md = ads().noiDung;
    expect(md).toMatch(/bảo hành tới \*\*mười năm\*\*/);
    expect(md).toMatch(/F-G02/);
    expect(md).toMatch(/O-10/);
    expect(md).toMatch(/chưa có văn bản/i);
  });

  it("chỉ rõ mâu thuẫn độ cứng đầu ra 1–3 mg/L vs < 17 mg/L", () => {
    const md = ads().noiDung;
    expect(md).toMatch(/1–3 mg\/L/);
    expect(md).toMatch(/17 mg\/L/);
    expect(md).toMatch(/cam kết/);
  });

  it("bắt lỗi iF Design Award là của ĐỨC, không phải Mỹ", () => {
    expect(ads().noiDung).toMatch(/iF Design Award là của ĐỨC/);
  });

  it("transcript giữ đủ cả bản cắt ngắn lẫn bản phỏng vấn đầy đủ", () => {
    const md = phang(ads().noiDung);
    // Bản ads
    expect(md).toContain("nó tự động nó switch sang cái chế độ kỳ nghỉ");
    // Bản đầy đủ — mốc đầu, giữa, cuối
    expect(md).toContain("chổi hút xoay ba trăm sáu mươi độ không điểm mù");
    expect(md).toContain("màng biofilm bám trên bề mặt hạt nhựa");
    expect(md).toContain("leakage là rò rỉ ion");
    expect(md).toContain("để bên ngoài, để bên trong đều có thể được");
    expect(ads().noiDung.length).toBeGreaterThan(14000);
  });

  it("bảng claim trôi đã mở rộng lên 4 video và nêu 3 việc phải chốt", () => {
    const md = kho().bai.find((x) => x.slug === "cach-to-chuc-kho")!.noiDung;
    expect(md).toMatch(/Rà \*\*4 video\*\*/);
    expect(md).toMatch(/Ba việc phải chốt, không phải ba video phải sửa/);
    expect(md).toMatch(/Bảo hành: 5 năm hay 10 năm/);
  });
});

describe("khung hình dọc/ngang trong kho video", () => {
  const kho = () => TAI_LIEU.find((k) => k.khu === "kho-video")!;
  const bai = (slug: string) => kho().bai.find((b) => b.slug === slug)!;

  it("MỌI trang kịch bản đều khai báo khung hình", () => {
    // Footage ngang không cắt sang dọc được — đi tìm tư liệu thì đây là câu hỏi đầu tiên,
    // trước cả "về máy nào". Thiếu ô này là trang đó vô dụng cho việc tái dùng.
    for (const b of kho().bai) {
      if (!b.slug.startsWith("kich-ban-")) continue;
      expect(b.noiDung, `${b.slug} thiếu ô Khung hình`).toMatch(/\| \*\*Khung hình\*\* \|/);
    }
  });

  it("video ads 09/2026 là video DỌC duy nhất, 3 video kia ngang", () => {
    expect(bai("kich-ban-ads-loc-tong-2026-09").noiDung).toMatch(/\*\*DỌC\*\* \(9:16\)/);
    for (const slug of [
      "kich-ban-cts20-chuyen-gia-2026-01",
      "kich-ban-riverside-loc-tong-2025-07",
      "kich-ban-loc-tong-nuoc-mem-2026-04",
    ]) {
      expect(bai(slug).noiDung, slug).toMatch(/\*\*Ngang\*\* \(16:9\)/);
    }
  });

  it("quy ước đặt tên đã có khung hình, và giải thích vì sao nó quan trọng", () => {
    const md = bai("cach-to-chuc-kho").noiDung;
    expect(md).toMatch(/<MÃ MÁY>_<ĐỊNH DẠNG>_<KHUNG HÌNH>_<YYYYMM>/);
    expect(md).toMatch(/chỉ có hai giá trị: `ngang` \(16:9\) hoặc `doc` \(9:16\)/);
    expect(md).toMatch(/Footage quay \*\*ngang\*\* không cắt sang \*\*dọc\*\* được/);
  });
});
