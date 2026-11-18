# Review độ phức tạp thừa toàn App — chuẩn bị rework v2.0.0

Ngày 18/11/2026 · nhánh `rework/v2.0.0` (điểm tách `fa3f186`) · 4 agent đọc song song, mỗi phát hiện đã kiểm caller bằng grep.

Phạm vi: chỉ code thừa (chết, trùng, trừu tượng không cần, tự viết lại thứ đã có). Không review bug, bảo mật, hiệu năng — trừ 2 điểm nêu ở mục 0 vì không thể để qua.

## Tóm tắt

| Khu | Dòng code (ước) | Cắt được (ước) | Thay đổi lớn nhất |
| --- | --- | --- | --- |
| Sales + Kho | ~9.000 | ~1.200 | Gộp 3 nguồn đơn hàng vào view `v_sales_don` |
| CSKH / ticket | ~10.000 | ~1.950 | Tách `app/actions.ts` (5.476 dòng) theo feature; gộp 2 hệ phân loại lỗi |
| Marketing + Wiki | ~11.000 | ~1.550 (+2.445 file sinh) | Một pipeline tài liệu `.md` duy nhất |
| Nền tảng + Work | ~7.000 | ~1.700 code + ~9.600 script/migration lưu trữ | Bỏ chế độ chạy song song luật quyền cũ |
| **Tổng** | **~51.000** | **~6.400 code app** (~13%) + ~12.000 file lưu trữ/sinh | |

> **Cách dùng báo cáo này:** v2.0.0 dựng mới, lấy bản cũ (`main`) làm tham chiếu nghiệp vụ.
> Các mục dưới là **những thứ KHÔNG mang sang v2** (code thừa, trùng, tương thích cũ) và các
> quyết định cấu trúc cho v2. Lỗi của bản cũ do nhánh `main` tự sửa, không làm ở `rework/v2.0.0`.

## 0. Chuyển cho nhánh main (lỗi bản cũ, không làm ở rework)

1. **Migration Work nằm sai chỗ.** `work_13` → `work_17` (sau 19/08) nằm trong `db/work/migrations/` — folder đã đánh dấu lưu trữ. `supabase/migrations/` chỉ có tới `work_12`. Hệ quả: `supabase db reset` / branch không dựng được quyền sửa theo vai trò, xoá hàng loạt, cron công tác, việc con–phụ thuộc, watcher. Cần đối chiếu ledger live (GWT-SalesTracking) rồi đưa 5 file vào `supabase/migrations/` theo đúng số hiệu đã áp.
2. **Server action lộ ra ngoài.** `guiYeuCauThayDoi`, `kyThuatCuaToi`, `khachGon` được `export` từ file `'use server'` (`app/actions.ts`) nhưng chỉ dùng nội bộ → thành endpoint ai cũng gọi được. Bỏ `export`.

## 1. Thay đổi cấu trúc cho v2 (theo thứ tự đáng làm)

1. **Một luật quyền duy nhất.** Gỡ chế độ chạy song song luật cũ (`GateCu`, `ghiLech`, `BangLechQuyen`, bảng `nhat_ky_lech_quyen`) — 178 chỗ gọi đang phải truyền `'ADMIN'/'QUANLY'/'NHANVIEN'`. Gói mọi server action vào `hanhDong(maQuyen, fn)` tự lo xác thực + kiểm quyền + trả `KQ<T>`; khi đó bỏ được cả họ test quét mã nguồn (`cong-quyen`, `actions-guard`, phần lớn `work-guard`).
2. **Tách `app/actions.ts`** (5.476 dòng, ~10 miền, 104 file import) thành file theo feature như `app/ticket/*-actions.ts` đã làm. Chuyển ~830 dòng chú thích lịch sử sang `docs/adr/`.
3. **Mỗi module một folder** theo kiểu Sales: `app/<module>/{actions.ts,_components/,_lib/}`. `components/` và `lib/` chỉ giữ thứ dùng chung thật.
4. **Một nguồn cho mỗi khái niệm:**
   - Khách: Sales (`customers`) và CSKH (`cs_customers`) là 2 hệ song song → một bảng, một form, một ô tìm.
   - Lỗi: `issue_group` (regex) và `loi_danh_muc` (trigger) → một danh mục.
   - Danh sách khách: `/khach`, `/khach/kenh`, `/khach-hang` → `/khach-hang` có bộ lọc.
   - Migration: chỉ `supabase/migrations/`.
   - UI: `bang/` (Tailwind) và `components/work/ui.tsx` (CSS var) → một hệ.
5. **Đẩy tính toán xuống Postgres:** đơn hàng (view `v_sales_don`), DISTINCT kênh/SP, tóm tắt Kho, khớp SĐT 9 số cuối, mã ticket/số lần lỗi (sequence/RPC dưới khoá).
6. **Xoá mọi code chờ migration** (retry lỗi 42703, `docAnToan`, `coCotMoi`, "bảng chưa có → kiểu cũ") — migration đã áp hết.
7. **Dữ liệu sửa hàng tuần ra khỏi TS:** `ADS_WEEKS`, `cases-*.ts`, `luat-sua.ts` → bảng Postgres/JSON; file sinh `san-pham.ts` (722KB) không commit, sinh ở `prebuild`.

## 2. Danh sách chi tiết

Định dạng: `<số>. <file>:L<dòng>: <loại> <cái gì>. <thay bằng>. (~-dòng)` — loại: delete / reuse / native / stdlib / yagni / shrink. Đường dẫn tính từ `apps/web/` trừ khi ghi khác.

### Sales + Kho (net ~-1.200)

1. `app/sales/_types.ts:L56`: shrink: 31 ô Sheet bổ sung khai 8 lần (type, mặc định, nhãn, calc, `getOrderForEdit`, 31 `useState` ở OrderForm, test, `O_THEO_TAB`). Một mảng spec `{khoa, nhan, kieu, khoi, tab}` + một `useState<NewOrderInput>`. (~-150)
2. `app/can-don/page.tsx`: delete: route mồ côi, không menu nào trỏ tới; kéo theo `ticketThieuData`, `boComboThieuCon` (actions.ts:L4384-4428). (~-116)
3. `app/sales/actions.ts:L113`: native: `danhSachDon`/`donTang` kéo 9.000 dòng về JS để GROUP BY. View `v_sales_don`. (~-100)
4. `app/sales/actions.ts:L836`: delete: `chiTietKhach` query máy/bảo trì/ticket/bảo hành mà trang không hiển thị (cố ý). Chỉ giữ `daNoiCS`. (~-90)
5. `app/sales/actions.ts:L597`: shrink: `chiTietDon` 3 nhánh map dòng + logic "Sheet ưu tiên" chép lại ở `_db.ts:L219`. Một `docDonApp()` hoặc view. (~-60)
6. `app/sales/OrderForm.tsx:L64`: reuse: `ProductPicker` tự viết → `bang/OChonGoiY`. (~-60)
7. `app/sales/gia/doi-tac/GanBac.tsx:L177`: reuse: `TimKhach` + ô tìm khách OrderForm:L474 thiếu debounce/chặn kết quả trễ → `bang/OChonTimXa`. (~-70)
8. `app/kho/_tu-lam-moi.tsx`: reuse: bản `TuLamMoi` thứ hai + `lib/kho/tu-lam-moi.ts` → `components/TuLamMoi.tsx`. (~-45)
9. `lib/kho/tom-tat.ts:L19`: native: lặp 10 trang nhật ký để đếm 7/30 ngày → `wh_app_ton` trả số bằng GROUP BY. (~-45)
10. `app/sales/CustomerForm.tsx:L51`: shrink: 16 `useState` (CtkmForm 18) → một state object như HopSua bên Kho. (~-45)
11. `app/sales/_db.ts:L32`: reuse: `dim_channel` đọc 6 chỗ, 3 type, 4 hàm nhãn; trùng `kenhChon` CS. Một `lib/kenh.ts`. (~-40)
12. `app/sales/actions.ts:L245`: native: 3 hàm kéo 5.000 dòng để DISTINCT → `select distinct`/view. (~-35)
13. `app/sales/page.tsx:L37`: reuse: cổng `requireNhanSu()+coTheVaoSales()` chép 8 page + 3 hàm gác → `app/sales/_gac.ts` + `layout.tsx`. (~-35)
14. `app/sales/page.tsx:L13`: reuse: định dạng tiền/ngày chép ~10 bản dù `_ui.tsx` đã export. (~-35)
15. `app/sales/ctkm/actions.ts:L201`: reuse: `nhanBan` tự đọc 5 bảng → `luuNhap({...await chiTietCtkm(id)})`. (~-30)
16. `app/sales/actions.ts:L333`: yagni: `kenhTheoKhach` suy kênh vì `channel_id` từng rỗng — nay đã ghi. Đọc thẳng sau backfill. (~-30)
17. `app/sales/_types.ts:L112`: delete: `O_THEO_TAB`, `O_SHEET_GIU`, `kiemTraSdt` + `findCustomerByPhone` (0 caller). (~-30)
18. `app/sales/gia/actions.ts:L228`: shrink: `danhSachDoiTac`/`lichSuBac` cùng kiểu query → một hàm + embed `customers(name)`. (~-25)
19. `app/sales/ctkm/actions.ts:L291`: reuse: 3 hàm tìm khách server, luật khớp khác nhau → `searchCustomersForPicker`. (~-25)
20. `app/sales/_db.ts:L403`: native: `maKhachMoi` kéo 10.000 dòng khớp 9 số cuối SĐT → SQL `right(regexp_replace(...),9)`. (~-25)
21. `app/kho/actions.ts:L33`: shrink: 5 action cùng khung 7 dòng → wrapper `ghi(fn)`. (~-20)
22. `app/sales/gia/actions.ts:L14`: reuse: 4 bản "hôm nay YYYY-MM-DD" → `bang` `isoNgay()`. (~-15)
23. `app/sales/ctkm/actions.ts:L268`: yagni: `don_toi_thieu`/`sl_toi_thieu` lưu và hiện trên form nhưng không luật nào đọc — form hứa điều không có. (~-15)
24. `app/sales/gia/doi-tac/GanBac.tsx:L9`: reuse: nhãn bậc chép 4 lần → map chung trong `_ctkm.ts`. (~-15)
25. `app/sales/TaoKhachButton.tsx:L29`: native: modal tự viết (bản thứ 3) → `<dialog>` + `showModal()`. (~-15)
26. `lib/kho/sua.ts:L27`: reuse: `docSo` trùng `lib/so.ts`; `daCauHinhKho()` ở 7 trang thừa. (~-12)
27. `app/sales/gia/actions.ts:L132`: reuse: tính `pct`/`gia` trùng `capGiaVaPct`. (~-8)
28. `lib/kho/ghi.ts:L36`: delete: nhánh chờ migration Đợt 3, nuốt lỗi "bảng chưa có", fallback `province_moi`. (~-8)
29. `lib/kho/doc.ts:L14`: yagni: allowlist `Set` cho tên hàm đã là literal type + 5 type alias không ai dùng. (~-8)

### CSKH / ticket (net ~-1.950)

30. `app/actions.ts:L4693`: reuse: 2 hệ phân loại lỗi song song (`issue_group` regex/override/gợi ý gom và `loi_danh_muc` trigger). Giữ một danh mục trơn; bỏ `app/nhom-loi`, `NhomLoiForm`, `lib/goiYNhom.ts`. (~-600)
31. `app/actions.ts:L1`: shrink: ~830 dòng chú thích nhật ký ("CEO chốt…", số đo prod) → `docs/adr/`. (~-300)
32. `app/khach/page.tsx:L11`: reuse: "Khách cần dọn" chép `listKhachHang` → chip `?can_don=1` ở `/khach-hang`. (~-170)
33. `app/khach/kenh/page.tsx:L26`: reuse: trùng chip `kenh_tu_dong` ở `/khach-hang` → tham số lọc `kenh=`. (~-130)
34. `lib/loi/anToan.ts:L13`: delete: lớp tương thích migration chưa áp (`docAnToan`, `THIEU_*`, `coBangDongMay`, nhánh ticket kiểu cũ, `rongVi`). (~-115)
35. `components/GanNhomLoi.tsx:L16`: delete: không ai import; kéo theo `ganTicketVaoNhom`, `boGanNhom`. (~-109)
36. `app/actions.ts:L4210`: shrink: 4 bản dựng CSV + 4 nút Export bọc `NutXuat` → một `xuatBang(bang, loc, cot)`. (~-90)
37. `app/actions.ts:L3760`: delete: `timKhachTheoSdt` tự ghi "⚠️ CŨ" → `traKhachChung()`. (~-65)
38. `app/actions.ts:L1299`: delete: `doiLichTheoSection` cho lượt bảo trì mồ côi từ Asana → backfill `maintenance_plan` rồi chỉ giữ `doiLichTheoPlan`. (~-35)
39. `lib/loi/giaoDienDanhMuc.ts:L79`: yagni: 4 wrapper tiêm phụ thuộc, mỗi cái 1 caller. (~-35)
40. `app/actions.ts:L3050`: reuse: `themSerialKho` = `nhapSerialBang` với 1 dòng. (~-30)
41. `app/actions.ts:L3519`: delete: `thuHoiMay` không caller. (~-26)
42. `app/actions.ts:L1904`: reuse: `capTaiKhoanKyThuat` tự tạo user, thiếu cờ đổi mật khẩu → `moiNhanSu()`. (~-25)
43. `app/actions.ts:L4187`: delete: `ticketsCsv` không caller. (~-23)
44. `app/actions.ts:L496`: delete: `khachGon` → `khachDayDu`. (~-21)
45. `app/actions.ts:L2901`: delete: `serialKho` không caller. (~-20)
46. `app/actions.ts:L555`: shrink: `khachDayDu` map tay 20 trường. (~-18)
47. `app/actions.ts:L2210`: yagni: nhánh `plan.serial` (0/79 plan có serial). (~-15)
48. `app/actions.ts:L5366`: shrink: `nuocCuaKhach` chép `.or(...)` của `hoSoNuoc`. (~-15)
49. `app/actions.ts:L4287`: delete: input `serial`/`source_serial` của `createTicket` không ai gửi; nhánh `daChuan?` không chạy. (~-12)
50. `app/actions.ts:L4041`: yagni: `kichHoatNhanh` chỉ bọc `dangKyBaoHanh`. (~-12)
51. `app/actions.ts:L2627`: shrink: 3 hàm "đọc `v_tickets` theo 1 cột" → `ticketsTheo(cot, giaTri)`. (~-12)
52. `app/actions.ts:L4937`: reuse: `timGop` tự dựng truy vấn khách → `listKhachHang`. (~-12)
53. `app/actions.ts:L2267`: native: `dsLichKyThuat` join 3 truy vấn bằng Map → PostgREST embed. (~-10)
54. `app/actions.ts:L2926`: reuse: `mayKhoInfo`/`serialInfo` cùng đọc `v_serial_kho`. (~-10)
55. `app/ticket/loi-actions.ts:L210`: delete: `ticketCodesTheoLoi` không caller. (~-10)
56. `app/actions.ts:L3731`: reuse: `chuanHoaSdt` chép y nguyên `lib/sdt.ts`. (~-10)
57. `app/actions.ts:L4237`: reuse: `gomTatCa` chép vòng lặp `bang/gomKhoa.ts`. (~-8)
58. `app/actions.ts:L4330`: native: mã ticket "select max + 1" → sequence/RPC theo tháng. (~-8)
59. `app/ticket/lan-loi-actions.ts:L27`: native: số lần lỗi đọc-rồi-insert + retry 23505 → trigger/RPC dưới khoá. (~-8)
60. Đổi tên route `/loi` (thực ra là lịch thay **lõi**) → `/thay-loi`, tránh lẫn với các trang lỗi.

Thêm từ 3 PR CSKH mới trên `main` (#20–22, chưa có ở nhánh rework): retry 42703 ở `lan-loi-actions.ts`, cờ `coCotMoi`/`thieuCotMoi`, `docThemTicket` đọc riêng 2 cột (gộp vào `v_tickets`), 4 tên CS viết cứng ở cả code lẫn CHECK constraint (→ bảng `staff`). (~-26)

### Marketing + Wiki (net ~-1.550, ~-4.000 kể cả file sinh)

61. `lib/wiki/data/san-pham.ts:L1`: yagni: file sinh 2.445 dòng (722KB) commit vào repo, dữ liệu đã có ở `content/wiki/**` → sinh ở `prebuild`, gitignore. Đồng thời đang bị kéo vào bundle client qua `WikiShell`. (~-2.445 sinh)
62. `lib/marketing/content.ts:L1`: reuse: 2 pipeline markdown song song cho tài liệu Marketing, đã lệch nhau (2 tài liệu có 2 bản, 2 URL); script sync chép 412KB app không đọc → một pipeline `TAI_LIEU`. (~-330, -800KB)
63. `lib/wiki/wiki.test.ts:L298`: yagni: ~300 dòng test soát nội dung bài viết, không kiểm logic. (~-300)
64. `components/marketing/AnalysesView.tsx:L86` + `IdeasView.tsx:L89`: yagni: drawer xem trước lặp trang chi tiết `[id]` → dòng bảng là `<Link>`. (~-210)
65. `app/wiki/marketing/phan-tich-kenh/bs-phuc/page.tsx:L8` + `khung/seci`: shrink: 356 dòng nội dung tĩnh viết bằng TS/JSX → `.md`. (~-200)
66. `components/marketing/DataError.tsx:L2`: native: try/catch lặp 7 trang → `error.tsx`. (~-90)
67. `lib/marketing/supabase-mkt.ts:L24`: stdlib: tự viết client PostgREST → `@supabase/supabase-js` đã cài. (~-40)
68. `app/wiki/marketing/[slug]/page.tsx:L14`: reuse: bản chép của `wiki/[khu]/[slug]` → `TrangBai({khu, slug})`. (~-45)
69. `lib/marketing/data/frameworks.ts:L7`: reuse: `A5` lặp `TUYEN`. (~-42)
70. `lib/wiki/nav.ts:L23`: delete: trạng thái `"chua-co"` chết (9/9 khu có nội dung). (~-35)
71. `components/marketing/Drawer.tsx:L6`: native: modal tự viết → `<dialog>`. (~-30)
72. `components/marketing/ads/RankingTable.tsx:L70`: reuse: ô "số + chi phí/đơn vị" chép 3 nơi → `<CostCell>`. (~-30)
73. `app/wiki/marketing/kho-case/[slug]/page.tsx:L43`: reuse: `relatedLaws` + render nguyên tắc lặp 3 nơi → `findLaws()` + `<LawList>`. (~-25)
74. `lib/marketing/ads-analysis.ts:L120`: shrink: 4 hàm `costPer*` gần giống → `costPer(p, key)`. (~-23)
75. `lib/marketing/data/ads-results.ts:L8`: delete: `costPerResult` lưu 85 dòng không ai đọc, `range`, `formatVND` chết. (~-17)
76. `lib/marketing/supabase-mkt.ts:L203`: delete: 3 hàm `list*Ids` không caller. (~-17)
77. `components/marketing/Highlights.tsx:L4`: reuse: trùng dòng cue TranscriptView. (~-17)
78. `components/marketing/Markdown.tsx:L45`: reuse: `slugTieuDe` 2 bản (TSX + script) + test ép khớp → một module `.mjs`. (~-15)
79. `lib/marketing/nav.ts:L37`: delete: `crumbFor` không ai import; type trùng `lib/wiki/nav.ts`. (~-13)
80. `lib/marketing/format.ts:L2`: stdlib: `fmt` 1.2M/33K → `Intl.NumberFormat({notation:"compact"})`. (~-12)
81. `lib/marketing/search-index.ts:L11`: reuse: 2 bộ dựng chỉ mục tìm kiếm. (~-10)
82. `app/wiki/marketing/page.tsx:L10`: reuse: `CARDS` lặp `NAV`. (~-10)
83. `components/marketing/ads/shared.tsx:L14`: reuse: `pct`, `money`/`formatCost` trùng. (~-8)
84. `lib/marketing/data/a5-detail.ts:L18`: yagni: `slug` luôn = `cat.toLowerCase()`. (~-6)

### Nền tảng + Work (net ~-1.700 code, ~-9.600 lưu trữ)

85. `tools/migrate/` (gốc repo): delete: 25 script Python nhập dữ liệu một lần (tháng 7), không ai gọi. Git giữ lịch sử. (~-5.000)
86. `db/cs/migrations/`, `db/work/migrations/work_00…04b` (gốc repo): delete: migration lịch sử đã gộp baseline — **sau khi** xử lý mục 0.1. (~-4.640)
87. `lib/nen-tang/kiem-quyen.ts:L14`: yagni: chế độ chạy song song luật cũ + ma trận (xem mục 1.1). (~-450)
88. `lib/work-guard.test.ts:L18` + `lib/actions-guard.test.ts`: shrink: test grep chuỗi JSX/mã nguồn, tồn tại vì action phải tự nhớ gác → wrapper `hanhDong()`. (~-250)
89. `bang/giaoDien.ts:L1`: yagni: lớp theme "mang sang project khác" (40 khoá CSS, context `CauHinhBang`) không ai truyền. (~-230)
90. `lib/nen-tang/cong-quyen.test.ts:L30`: native: test regex kiểm mã quyền tồn tại — TypeScript literal type đã làm. (~-200)
91. `lib/nen-tang/vao-cua.ts:L92`: delete: 2 lớp bọc "giữ tên cũ" chỉ test gọi + 2 file test trùng. (~-125)
92. `components/work/ChonViecChan.tsx:L18`: reuse: tự viết ô tìm server, thiếu chặn kết quả trễ → `bang/OChonTimXa`. (~-85)
93. `bang/sql/khong_dau.sql:L1`: delete: bản thứ 3 của `public.khong_dau()`. (~-54)
94. `lib/nen-tang/phien.ts:L107`: shrink: `requireStaff`/`requireNhanSu` gần giống; nhánh "chờ duyệt" chép 4 nơi → `requireKhu(khu)`. (~-45)
95. `components/ThanhTaiKhoan.tsx:L16`: delete: không ai import. (~-37)
96. `lib/lichBaoTri.ts:L52`: reuse: hàm bỏ dấu chép tay 9 lần → `bang/timkiem.ts` `boDau()`. (~-25)
97. `lib/nen-tang/nhan-su.ts:L26`: reuse: `currentStaff` đọc lại đúng dòng `layNhanVien` đã cache; `createUser` chép 2 lần. (~-25)
98. `components/work/TuSinh.tsx:L19`: delete: prop `duocSuaLuat` luôn true, nhánh `!duocSuaLuat` chết. (~-20)
99. `components/work/BangTeam.tsx:L121`: shrink: `doi()` chép `nap()`; toggle chọn dòng chép 3 nơi → `useChonSet()`. (~-20)
100. `lib/nen-tang/kiem-quyen.ts:L118`: shrink: `quyenChoMan` và `hoiQuyen` cùng việc → giữ `hoiQuyen`. (~-15)
101. `lib/nen-tang/vai-tro.ts:L83`: yagni: `chuanHoaVaiTro` còn nhận chuỗi đơn trước migration 33. (~-15)
102. `lib/nen-tang/gac-cong.ts:L48`: delete: `chanNeuKhongPhaiAdmin`/`QuanLy` không ai gọi. (~-12)
103. `lib/nen-tang/vai-tro.ts:L168`: delete: `laKyThuat` chỉ test gọi. (~-10)
104. `app/work/actions.ts:L123`: delete: `bangTeamKQ`, `MAU_UU_TIEN`, `useTenCot` chết. (~-10)
105. `app/auth/callback/route.ts:L41`: shrink: chia đường sau đăng nhập đã có ở `app/page.tsx` → luôn về `/`. (~-8)
106. `app/login/page.tsx:L17`: reuse: `createBrowserClient` viết 3 lần → `trinhDuyetClient()`. (~-8)
107. `lib/nen-tang/quyen.ts:L120`: delete: 2 "quyền ma" `work.viec.xem_tao`, `work.viec.giao` không ai kiểm; `work.luat_tu_sinh` có 2 nguồn luật (ma trận + SQL cứng). (~-6)
108. `lib/nen-tang/gac-cong.ts:L14`: reuse: `coTheVaoSales` chép cứng vai trò → `coQuyen('sales.don.xem')`. (~-5)
109. `package.json:L11`: delete: script `env:local`/`env:prod` trỏ file không tồn tại. (~-2)

## 3. Ghi chú

- Dependency: `pg`, `xlsx`, `react-markdown`, `remark-gfm`, `server-only` đều có người dùng — không gỡ. Riêng `xlsx` 0.18.5 nên nâng (bản npm cũ, có lỗ hổng đã công bố).
- `dataClient()` dùng `service_role` bỏ qua RLS: an toàn hoàn toàn dựa vào từng action nhớ gọi gác cổng — lý do chính để làm wrapper `hanhDong()` ở mục 1.1.
- Số dòng là ước lượng của agent, cần đo lại khi thực sự xoá.
