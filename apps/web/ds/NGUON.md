# Nguồn token DS v2

Artifact **"GWT — OpenAI + shadcn"**, **bản 26** — https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr

File trong `nguon/` chép **nguyên byte** từ artifact bản 26; riêng `bundle.css` lấy **bản 43** (20/11; bản 43 đồng bộ ngược từ code lát 4–6: Breadcrumb mục trước không co, `.b-osua` trần `calc(100% + 12px)`, `.b-khach` trần 100%; bản 40 thêm `.ui-card-*` cho Card; bản 38 sửa lỗi đặc hiệu theme tối; bản 37 thêm lề tiêu đề Dialog/Sheet; bản 36 chỉ đổi index; bản 29 của 19/11 đã thêm `font-feature-settings: inherit` vào 20 rule shorthand `font:`, CEO chốt), 10 `preview.html` của lát 2 lấy **bản 31** (19/11) trừ Tooltip và ContextMenu lấy **bản 33** (20/11); 11 `preview.html` + README của lát 3 (Form) lấy **bản 37** (20/11), trừ `Combobox/preview.html` + README gốc và README Button/InputAffix/Combobox/DatePicker/DateRangePicker/Checkbox/Radio lấy **bản 38** (20/11). Chép bằng `cp` — không qua Python/Node chế độ chữ vốn đổi LF → CRLF trên Windows; sha256 đo trước và sau khi chép trùng nhau, file LF. Không sửa tay.

Bản 33–34 đồng bộ ngược 5 điểm từ code lát 2 vào artifact: tooltip line-height 16 (cả tooltip sidebar); mục menu disabled ở theme tối không sáng nền khi trỏ; aria-label của preview Tooltip không lặp `data-tip`; icon ContextMenu 16px màu muted; `.b-noi .ui-menu-item` khớp menu-styles.

Bản 35 (CEO chốt 20/11, "theo đề xuất"): chữ `.ui-avatar` `gray-600` → `muted-foreground` (đạt AA cả hai theme trên
`alpha-08`: sáng 5.57:1, tối 5.81:1 — `gray-600` tối chỉ 3.94:1); `.ui-dialog-close` top/right 12 → 19 (tâm ✕ thẳng tâm
dòng tiêu đề: padding 20 + (26 − 28) / 2; dùng chung Dialog + Sheet); `@media (max-width: 640px) { .ui-sheet { width: 100% } }`
(artifact khớp code, bỏ 7 `lyDo` width@390 ở `so-khop/sheet.json`). Không preview.html nào đổi.

Bản 48 (23/11, CEO: "check code xong cập nhật lại lên artifact"): đợt chép khung shadcn lên artifact — 28 component mới
(README + `preview.html`), mục cuối "Đổi khi chép khung shadcn" ở 31 README cũ, README dự án thêm mục "Đợt chép khung
shadcn" + quyết định mở 14–17. **Preview của 28 component mới là ảnh chụp DOM thật** của khối `/ds/tron` (không vẽ tay
`ui-*`), stylesheet Tailwind đã lọc theo class dùng ở `components/v2.css` (sha256 `9b4e403f614050ea07f097686a8de38a07a2ad76022b44988eb0647a00aac6f3`; bỏ biến trùng tên
token của artifact để `tokens.css` của artifact quyết định sáng/tối). Sinh lại bằng script chụp CDP (bản dùng ở phiên
23/11 nằm ngoài repo) — đừng sửa tay; cổng so khớp không cần cho 28 cái này vì preview = code. File trong `nguon/` trùng
byte với bản 48.

Bản 50–51 (23/11, CEO: "Đưa vào DS" — từ góp ý thiết kế màn Work): thêm 3 biến thể vào `bundle.css`, không đổi token:
`.ui-input[data-shape="pill"]` (bo `radius-full`, ô tìm đầu trang dữ liệu — code `<Input shape="pill">`);
`.ui-bulkbar[data-variant="surface"]` (mặt `popover`, `shadow-hairline` + `shadow-300`, ghost rê `alpha-05`/nhấn `alpha-08`,
cảnh báo `color-text-warning` — code `<CauHinhBangDs thanhHangLoat="surface">`, bộ ghép đè `THANH_HANG_LOAT_SURFACE`);
`.b-ticket > .b-nhan-dau[data-gon]` (khung nhãn đầu ôm chữ khi danh sách chỉ một nhãn — code `<NhanDau gon>`). README
Input/BulkActionBar/ListView thêm một dòng; preview Input thêm ô `#i7` ở CUỐI lưới (bản 51 dời từ giữa xuống cuối để
`nth-child` của so khớp không lệch), preview BulkActionBar thêm mục thứ 3. Biến thể tên `surface`, không `light`: ở theme
tối mặt nổi là popover tối, không trắng.

Bản 52 (23/11, CEO duyệt khung trên app thật): khung F lắp vào app — `bundle.css` thêm `.pD-mui` (mũi tên mục nhóm), `.pD-con`
(danh sách trang con kiểu SidebarMenuSub), `.pD-taikhoan` (avatar mở menu tài khoản); README Sidebar thêm mục "Khung lắp vào
app" (`MucMenu.con`, `Khu.day`, `nguoiDung.menu`). Preview Sidebar không đổi (so khớp không ảnh hưởng).

Bản 54 (25/11, CEO: "Đẩy các thay đổi DS lên artifact đi"): đồng bộ ngược đợt màn Work 23–25/11 — `bundle.css`: chữ a
HAI tầng (body chỉ `"ss03"`, bỏ `cv11`); ô chọn dòng ẩn chờ rê (`.b-cot-chon > input`) + cột chọn ra LỀ ngoài bảng từ 768
(khung lùi −44 = −8 sẵn có − 36); `.b-thanh` dưới 16; `.ui-filterbar` cách bảng 12; `.b-chitiet[data-co-dinh]` (fixed,
mép 12, nhường 464); `.ui-props` căn đầu. README: dự án (font), BulkActionBar, DataViewToolbar, FilterBar, InputAffix,
ListView, PropertyList, Sidebar, Table. Preview Table: khung mẫu chừa lề trái 44 (`padding:0 0 0 44px`) để cột chọn ở lề
không bị cắt. Cổng so khớp bỏ lớp bật lại cv11 (hai bên cùng ss03); bỏ `lyDo` đã hết lệch (Table cột chọn ×6,
BulkActionBar width 0,5px). 50/50 cổng 0 lệch chưa giải thích.

**Chờ đồng bộ lên artifact** (26/11, CEO: "Thêm vào DS" — từ prototype trang ticket theo ref Shopify): biến thể
DetailLayout `benKhiHep="duoi"` — ≤960 cột thuộc tính ở DƯỚI nội dung (giữ thứ tự DOM, chỉ bỏ `order: -1`), cho trang mà
nội dung chính phải thấy trước. Code: `detailAsideDuoi` (`notif-styles.ts`) + prop `benKhiHep` (`detail-layout.tsx`, gốc
mang `data-ben-hep="duoi"`), test ở `detail-layout.test.tsx`. Khi đẩy lên artifact: `bundle.css` thêm
`@media (max-width: 960px) { .ui-detail[data-ben-hep="duoi"] > .ui-detail-aside { order: 0 } }`; README DetailLayout thêm
một dòng; preview không đổi (mặc định vẫn "trên") → so khớp không ảnh hưởng.

Cột Bảng học hành vi Twenty (26/11, spec `docs/rework/2026-11-26-f-hoc-hanh-vi-twenty.md` A–C, dùng ở prototype ticket
F): (A) `ThemCot` (`them-cot.tsx`) — ô "+" cuối hàng tiêu đề, pop Popover + Command: ô "Tìm cột" · cột đang ẩn · vạch ·
"Tuỳ chỉnh cột…" (mở ⚙ qua `CaiDatRef.mo('cot')`); cột `<col>` rộng `RONG_THEM_COT` 40. (B) `TieuDeCot menuCot` — menu
tiêu đề thêm (sau vạch) Dời sang trái / Dời sang phải / Ẩn cột, tắt ở mép (`itemDisabled`), câu đọc qua `BaoCotCtx` của
`KeoCot`. (C) ⚙ → Cột hiển thị = `CotHienThi` (`cot-hien-thi.tsx`): nhóm "Đang hiện" (tay kéo dnd-kit + mắt "Ẩn …") /
"Đang ẩn" (mắt gạch "Hiện …") thay cho danh sách checkbox; dòng `cdDongCot`/`cdKeChua` (`data-view-styles.ts`). Kèm
`useGanMucSang` + `trongPop*` (command.tsx / command-styles.ts, gom từ Combobox). Khi đẩy lên artifact: `bundle.css` thêm
`.b-th-them` (ô "+": nút ghost icon-sm trong `th` rộng 40) và `.b-cd-cot` (dòng `.ui-menu-item` đệm 2, không nền rê, cao
32; `[data-keo]` nền mục sáng + `--shadow-hairline, --shadow-300`; ô trống bằng nút icon-sm); README Table thêm mục "Nút +
thêm cột" + 3 mục menu tiêu đề; README DataViewToolbar sửa trang "Cột hiển thị" (hai nhóm, kéo, mắt); preview
DataViewToolbar vẽ lại trang con Cột hiển thị (hiện là checkbox → so khớp `trangCon › muc/o/mucKhoa` báo thiếu phần tử tới
khi preview đổi), preview Table thêm ô "+" + menu cột có mục dời/ẩn. (D) Cột GHIM: cột `khoa` đứng đầu (`laGhim`) dính trái
khi bảng cuộn ngang — `thGhim`/`oGhim` + `CHON_BANG_GHIM` (`table-styles.ts`), `TableCell ghim`, `data-ghim`; nền đục =
`--background` + màu trạng thái dòng qua biến `--nen-dong` mà `tr` đặt. Khi đẩy lên artifact: `bundle.css` thêm
`.b-bang [data-ghim] { position: sticky; left: 0 }` (+ `left: 36px` khi bảng có `.b-cot-chon`, cột chọn cũng sticky
`left: 0`, tiêu đề cột chọn z 30), nền `linear-gradient(var(--nen-dong), var(--nen-dong)), var(--background)`, và
`--nen-dong` theo hover/chọn/đang trỏ trên `tr`; README Table thêm mục "Cột ghim"; KHÔNG kẻ vạch dọc mép phải (CEO 26/11 bỏ vạch học từ Twenty — bảng DS chỉ kẻ ngang).

Bộ lọc theo trường học hành vi Twenty (26/11, cùng spec mục D, dùng ở prototype ticket F): `NutLoc` + `ChipLoc`
(`bo-loc-truong.tsx`), logic thuần `bang/locTruong.ts` (URL `[phép~]giá trị` — CHUAN-FILTER mục "Lọc theo trường").
`NutLoc` = nút icon ghost 32 (Funnel 18 + tooltip "Lọc theo trường") ở khe MỚI `loc` của `DataViewToolbar`/`CongCuXem`
(đứng trước ⚙) → pop rộng 280 (tối đa 100vw − 32, `collisionPadding` 16): Command "Tìm trường" (icon theo kiểu + tên)
→ trang sửa: hàng đầu `cdDau` (← + tên trường) · Select phép · giá trị (chọn/người: Command có ô tìm kẻ trên, tick ✓
`menuCheck`, `aria-checked`, người ghim "Tôi" + vạch; ngày: DatePicker / DateRangePicker lồng; chữ: Input). `ChipLoc` =
khung `.ui-chip` (`chipKhung`, xuất từ `bang-styles.ts`) chứa nút chữ (đệm trái 10, vòng focus ring sát mép) + `.ui-chip-x`;
pop sửa neo vào chip. `ThanhDangLoc` thêm `dieuKien[].chip` (chip tự dựng thay chip mặc định). Đo 26/11: chip mới trùng số
chip cũ (cao 28, đệm 10/4, tâm chữ −0,5, tâm × 0). Khi đẩy lên artifact: preview DataViewToolbar thêm nút Lọc trước ⚙
(so khớp `congCu` báo thừa phần tử tới khi preview đổi) + README thêm mục "Lọc theo trường"; preview FilterBar thêm chip
bấm được (nút chữ trong `.ui-chip`) + pop sửa điều kiện; `bundle.css` thêm `.ui-chip > button:first-child` (reset nút,
`height: 100%`, `padding-left: 10px`, vòng focus) và khung pop `.ui-menu.b-loc-truong` (rộng 280).

Hàng tab tràn (26/11, prototype ticket F, CEO duyệt "gộp tab ít dùng vào Thêm"): dùng `TabsList thuGon` có sẵn (tự đo,
tab không vừa vào "Thêm ▾", tab đang chọn luôn hiện — kiểu GitHub). Sửa: chọn từ "Thêm" khi giá trị về TRỄ (URL qua
`router.replace`) → focus tạm ở "Thêm" rồi sang tab khi nó hiện (trước rơi về body; test `tabs.dom.test`). **Chờ đồng bộ
lên artifact:** `.b-thanh` thêm `flex-wrap`, `.b-tabs-cuon` `min-width: min(100%, 272px)` thay `0`, `.b-thanh-phai`
`margin-left: auto` (`data-view-styles.ts` `dvThanh/dvTabs/dvThanhPhai`) — khung hẹp (375: hàng tab còn 79px, 900: 204px)
thì cụm công cụ xuống dòng canh phải thay vì bóp hàng tab; 1440 không đổi. README DataViewToolbar thêm một dòng.
**Chờ đồng bộ lên artifact** (CEO 27/11, bảng ticket F): (1) **Lọc hiện ở nhãn cột** — cột đang lọc: nhãn thành chip (`thChipLoc`: cao 24, đệm ngang 4 toả ra ngoài bằng `-ml-1` nên chữ vẫn thẳng mép chữ ô, nền `info-surface`, chữ `text-info`, icon `SlidersHorizontal` Phosphor regular 12; rê → nền `info-soft-alpha`, bấm → mở thẳng pop lọc của cột, kéo vẫn đổi chỗ cột); vùng rê/kéo của nút tiêu đề (`thSort`) nới 6px mỗi bên vào đệm ô. Màn đã có nhãn-chip thì bỏ hàng chip lọc (`ThanhDangLoc`). (2) Icon lọc toàn DS: `Funnel` → `SlidersHorizontal` (nút Lọc, menu cột, ListView). (3) Chip lọc (`chipKhung`/`chipX`) cả nhãn và giá trị màu `text-info` trên nền `info-surface`. (4) **DataViewToolbar `dem`** = Badge soft secondary (số, hoặc "x / y" khi khác) thay chữ "đang thấy x / y". (5) **TabsCount pill** = badge trung tính: cao 18, tối thiểu 18, đệm 6, bo tròn, nền `secondary-soft-alpha`, chữ `text-secondary-soft` (danger giữ chữ đỏ). (6) **PhanTrang `luonHien`**: hiện cả khi 1 trang — màn ticket F bỏ số ở tiêu đề + tab, lấy "1–N trên N ticket" ở phân trang làm bộ đếm duy nhất. **Sửa sau (CEO 27/11 ảnh Figma 12 + 8):** bảng ghim (khuôn F) — `th` đệm 12 + nút tiêu đề `thSort` đệm 8 = chữ ở 20; `td` đệm 20 (trừ cột ô chọn); chip lọc `-ml-2 px-2 gap-1.5 font-semibold` lấp đúng đệm 8 của nút; phân trang `md:pl-2` thẳng ô tick; tab pill chưa chọn rê → nền `--alpha-04`. **Tiêu đề cột lọc được (`TieuDeCot moLoc`)**: bấm = mở THẲNG pop lọc của cột (không còn menu cột: bỏ Dời trái/phải — kéo thay; bỏ "Lọc…"), cuối pop có vạch + "Ẩn cột" (`MoLocRef.mo(id, neo, { anCot })`, chỉ khi mở từ tiêu đề). Cột không lọc được giữ menu cũ. **ComboboxPanel / OSuaChon `onTaoMoi`** (27/11, ô Lỗi ticket): chân pop "＋ Thêm <loại> "…"" (kiểu chân RecordPicker) khi đã gõ mà không mục nào trùng tên (bỏ dấu); không mục nào khớp thì Enter cũng thêm; OSuaChon nhận mục mới rồi chọn luôn (lạc quan + Hoàn tác). **CEO chốt 27/11: bảng dạng DÒNG (inline — không viền cột, kẻ ngang mờ, khuôn ticket F) là chuẩn cho MỌI bảng.** **TableWrap `luoi`** (bản "table": khung viền + vạch dọc cột, bo 12 (CEO 27/11, trước 24), xem /ticket?bang=luoi) giữ làm biến thể phụ, chưa màn nào dùng mặc định.
**Chờ đồng bộ lên artifact** (CEO 26/11 "siết padding của các tab này", commit ec0a6b6): `.ui-tabs-pill .ui-tabs-trigger
{ height: 32px; padding: 0 12px }` (`tabsTriggerPill` — cả nút "Thêm ▾" của `thuGon`).
**Chờ đồng bộ lên artifact** (26/11, CEO duyệt thẻ Xem nhanh học bố cục panel bản ghi Twenty — prototype ticket F,
`app/ticket/_prototype/xem-nhanh-f.tsx`): (1) **Tabs `line`** — icon trước chữ (con đầu của `TabsTrigger`, `[&_svg]`
cỡ `--control-icon-size-md` 18, icon tự đặt `size-*` giữ cỡ); tab line đệm ngang 12 (trước 16), không xuống dòng/không co;
rãnh line chỉ đệm dọc (mép tab đầu = mép khung); `thuGon` chạy cả với `line`: khung `tabsKhungLine` (không cuộn,
`overflow-x: clip` để vạch chọn thò 5px không bị cắt), nút `tabsThemLine` ghi "+N Thêm ▾" (N = số tab đang ẩn; pill vẫn
"Thêm ▾"). Test `tabs.dom.test` (gom/nhả khi đổi bề rộng, chọn từ menu → focus, ←/→/Home/End). (2) **XemNhanh** —
`the.tab` (hàng tab line `thuGon` dưới đầu thẻ, đứng yên khi cuộn: `xnTabs`/`xnHangTab`/`xnCuon`; gạch chân 1px alpha-05,
vạch chọn đè đúng gạch), `the.chan` (thanh thao tác dính đáy `xnChan`: cao 52, đệm 0 24, dồn phải, gạch trên), `the.co`
(cờ sau mã, vd icon Khẩn). (3) **PropertyRow `trong`** — chữ thay cho "Chưa có" khi rỗng (Xem nhanh: tên trường, mờ;
sr vẫn "Chưa có"). Khi đẩy lên artifact: `bundle.css` thêm `.ui-tabs-list[data-variant="line"]` + `.ui-tabs-line
.ui-tabs-trigger` (vạch 2px `::after`, icon 18) và `.b-ct-tabs` / `.b-ct-chan` cho thẻ chi tiết; README Tabs thêm mục
"Line + icon + thu gọn", README DataViewToolbar mục Xem nhanh thêm tab + thanh đáy, README PropertyList một dòng `trong`;
preview Tabs thêm mẫu line có icon (hiện CHƯA có → so khớp không ảnh hưởng tới khi thêm).

Lọc từ menu tiêu đề cột (26/11, học Twenty "menu cột → Filter", prototype ticket F): `TieuDeCot moLoc={{ dang, onMo }}` →
mục "Lọc…" (Funnel) đầu menu, menu đóng xong mới gọi `onMo(nút tiêu đề)`; `dang` → phễu trên tiêu đề (không số). Nối bằng
`useMoLoc()` (`bo-loc-truong.tsx`): `<NutLoc ref={nut}>`, `<ChipLoc ref={chip(id)}>`, `mo(id, neo)` — trường đã có chip
→ mở chip đó; chưa có → pop NutLoc mở thẳng trang sửa trường đó (đủ phép + "Tôi"), neo dưới tiêu đề cột (Radix
`virtualRef`). Đóng (kể cả chip bị gỡ vì rỗng) → focus về tiêu đề cột. Thay cho `loc` (tick nhanh "là") ở màn có bộ lọc
theo trường. Test `bo-loc-truong-cot.dom.test`. Khi đẩy lên artifact: preview Table thêm mục "Lọc…" đầu menu cột + README
Table một dòng; không đổi `bundle.css`.

Co dãn cột học Twenty (26/11, CEO: "sao interaction resize ngược thế?"): trước đây một cột thật (khách ở F, Việc ở Work)
không đặt `<col>` rộng → ăn phần dư; kéo cột khác thì nó co bù, mép trái cột đang kéo chạy ngược, tay co không theo
chuột. Giờ `ColCotBang` (`tieu-de-cot.tsx`): MỌI cột (kể cả cột khoá đầu, cũng co dãn được) rộng cố định theo `doRong`, một
`<col>` CUỐI không đặt rộng ăn phần dư (F: cột "+"; Work: ô trống `cotDem` ở tiêu đề + mọi hàng); `Table minWidth =
RONG_O_CHON + useCotBang().tongRong (+ cột cuối)` → vượt khung thì cuộn ngang. Đo 1440: kéo Máy +60 → chỉ Máy 184→244,
cột sau dời +60, tâm tay co lệch chuột 0,2px. Ngưỡng kéo đổi chỗ cột (KeoCot) 4 → 8px như Twenty. Giữ tối thiểu 56 (Twenty
104) — cột chỉ avatar/ưu tiên của DS hẹp hơn 104 có chủ đích. Không đổi `bundle.css` (artifact không có co dãn).

**Chờ đồng bộ lên artifact** — độ rộng cột mặc định = nội dung dài nhất (26/11, CEO: "chiều rộng cột sẽ = chiều dài của
content dài nhất để tránh bị cắt thông tin"; kế hoạch `docs/rework/2026-11-26-ticket-f-dung-that.md` bước 2): `CotBang.rong`
thành TUỲ CHỌN — không khai = cột tự vừa `max(tiêu đề, mọi ô đang vẽ) + đệm ô`, sàn 56; `rongToiDa` = trần cho cột chữ tự
do (tên khách, tên việc) — quá trần mới cắt, ô bị cắt có `title`. Đo: `<Table ref={useCotBang().refBang}>` →
`doVuaNoiDung` (`use-cot-bang.ts`) thả con của ô `width: max-content` một lượt ghi + một lượt đọc rồi trả lại; chạy trước
khi vẽ khi bảng gắn / cột hiện đổi, gom theo khung hình khi nội dung ô đổi (MutationObserver dòng + chữ) hoặc font tải
xong; bảng đang ẩn (Suspense `display:none`) thì chờ ResizeObserver báo hiện mới đo; kéo co dãn KHÔNG kích đo lại. Kéo
tay thắng (`keoTay`, URL `cot_rong` chỉ ghi cột đã kéo); nhấp đúp tay co → `coDan(id, null)` = về mặc định (vừa nội
dung), không về số cố định cũ. Tổng vượt khung → bảng cuộn ngang (minWidth = tổng), không bóp/cắt; cột trống cuối vẫn ăn
phần dư khi tổng nhỏ hơn khung. Trước lần đo đầu (HTML server) cột tự vừa rộng `RONG_CHO_DO` 120. Áp: ticket F (mọi cột
tự vừa; khách trần 400, máy 480, lỗi/loại/tỉnh 240), Work cột Việc (trần 480; cột khác giữ số khai). Đo 1440 F: khách 303 ·
máy 406 · lỗi 186 · trạng thái 106 · phụ trách 102, 80/80 ô không cắt, bảng 1179 > khung 927 → cuộn ngang. Test
`cot-vua-noi-dung.dom.test`. Khi đẩy lên artifact: README Table mục "Co dãn cột" thêm "mặc định vừa nội dung, `rongToiDa`,
nhấp đúp về vừa nội dung"; preview Table bỏ độ rộng gõ tay ở cột chữ (khối JS đo như trên — `bundle.css` không đổi).

**Chờ đồng bộ lên artifact** — bổ sung cột tự vừa (26/11): (1) cộng `KHOANG_CUOI_COT` 8px cuối mỗi cột tự vừa trước khi kẹp
trần (CEO "add thêm 8px spacing ở các đoạn cuối cột" — chữ dài nhất dính sát cột kế); (2) chưa đo lần nào (HTML server,
trước hydrate) → `useCotBang().choDo` + `<ColCotBang choDo>` gắn `colgroup[data-cho-do]`, `tableFixed` ẩn bảng giữ chỗ
(`visibility: hidden`) tới lượt đo đầu — hết cảnh cột 120px rồi nhảy (thử `table-layout: auto` thay thế: lệch 20–110px, bỏ).

**Chờ đồng bộ lên artifact** — tab `line` bo `radius-sm` (không `radius-full`): vòng focus ôm tab thành ô chữ nhật bo nhẹ;
vòng viên thuốc quanh tab gạch chân trông lạc (CEO 26/11 "trạng thái focus tròn này ko hợp lý"). `triggerChung` bỏ bo,
segmented + pill tự khai `radius-full`, line + nút "+N Thêm" khai `radius-sm`.

**Chờ đồng bộ lên artifact** — chữ tiêu đề bảng cột ghim (44/600 viết hoa) hạ từ `muted` xuống `color-text-tertiary` như
Twenty (CEO 26/11 "hạ sắc độ label xuống giống twenty"). Đo nền trắng: 3,23:1 — DƯỚI AA 4,5:1 cho chữ 12px (muted cũ
6,5:1); chấp nhận theo lệnh CEO, ghi lại để quyết khi đẩy artifact.

**Chờ đồng bộ lên artifact** — focus đến từ CHUỘT không vẽ vòng focus (26/11, CEO ảnh tiêu đề cột: "Nhớ sửa trạng thái
focus"): Radix đóng menu/pop thì trả focus về nút mở (DS giữ — form đi tiếp bằng Tab), Chrome coi đó là `:focus-visible`
→ vòng xanh dù chỉ bấm chuột. `focus-chuot.ts` gắn `data-focus-chuot` lên phần tử nhận focus khi lần nhập cuối là chuột,
gõ phím gỡ ngay; `DsRoot` tắt `outline` của `[data-focus-chuot]:focus-visible` (chỉ outline — viền ô nhập vẽ bằng
box-shadow giữ nguyên). Đo: đóng menu "Loại lỗi" bằng chuột → nút có focus, outline none; gõ phím → outline 2px ring.

**Luật — cột `khoa` đứng yên** (26/11, CEO "Align giữ nguyên bản gốc chứ sao đẩy lệch thế này"): kéo thả cho thả cột
khác TRƯỚC cột khoá → mất `th[data-ghim]` → mất cả bộ kiểu bảng ghim (ô tick thụt 8, tiêu đề viết hoa, kẻ trên, lề khung).
`giuCotKhoa` (use-cot-bang.ts) đưa cột khoá về đúng vị trí khai báo ở MỌI đường đổi thứ tự (kéo thả, menu dời, URL
`cot_thu_tu` cũ). Đổi gì ở bảng ghim: đo lại mép ô tick = mép chữ tab đầu, mép khung = mép chữ tiêu đề trang.

**Chờ đồng bộ lên artifact** — mục chọn dạng CHIP (26/11, CEO "khi chọn trạng thái ko cần cho hover thế này mà phải hiện
hover ở chip", commit 9d88415): `MucRadio chip` — dòng rê/được phím đánh dấu nền trong suốt; `Badge` soft trong dòng đang
đánh dấu hiện viền 1px inset cùng màu chữ chip (không đậm nền: nền `*-soft-alpha-hover` làm "Đã xong" còn ~3,5:1). Mục chữ
thường (người, loại lỗi) giữ nền dòng. Badge "Đang mở" dùng `warning` — token ra CAM, tối 4,37:1 (dưới AA): chờ CEO quyết
màu vàng riêng.

**Chờ đồng bộ lên artifact** — đổi DS đi kèm màn Khách hàng (27/11, commit 37e331c, soát lại 27/11):
`CotBang.batBuoc` (luôn hiện, vẫn đổi chỗ — vd SĐT) + `anDuoc(c)`; menu cột / ⚙ Cột hiển thị / ThemCot không cho ẩn cột
`batBuoc` (`MenuCot.onAn` tuỳ chọn → không có mục "Ẩn cột"); `useCotBang().datCotHien(ids)` áp cột của chế độ xem đã lưu
(không còn id hợp lệ → về mặc định); `SapCot.macDinh` ẩn "Bỏ sắp xếp" khi đang là sắp mặc định; `CongCuXem` /
`CaiDatHienThi` cho bỏ `onDoiXem` / `onXemNhanh` (màn chỉ có Bảng: không nút dạng xem, không trang "Bố cục"); `SavedView.onLuu`
async, trả `{ loi }` → hiện FieldError, nút Lưu `loading`, khoá bấm đúp; bộ đếm "đang thấy X / Y" của DataViewToolbar
`aria-live="polite"`. `docUrlCot` bỏ qua id cột lạ trong `cot_an` (link cũ không làm sập trang). Prop `PopoverContent
noiTuyen` (bỏ portal) đã GỠ: ngoài DsRoot không có token, lách vô ích. Khi đẩy lên artifact: README Table (batBuoc), README
DataViewToolbar (toolbar không dạng xem), README SavedView (lỗi lưu); không đổi `bundle.css`.

**Chờ đồng bộ lên artifact** — hàng tab view (27/11, CEO: "button thêm view thì nên ở cạnh tab" · "view tạo ra còn ko có
trạng thái active"): `TabsList cuoi` (pill / line thu gọn) = khe nút ngay SAU tab cuối (học Twenty "+ Add view"), nằm
ngoài `tablist`, bề rộng trừ vào chỗ của tab khi thu gọn. Icon dạng xem trên tab: đã thử, CEO bỏ ("hơi rối") — tab view
chỉ chữ + số đếm. Bẫy: bọc `TabsTrigger` bằng `ContextMenuTrigger asChild` làm `data-state="closed"` đè
`data-state="active"` → tab đang chọn mất kiểu; bọc qua `<span className="contents">`. Khi đẩy lên artifact: README +
preview Tabs (khe cuối "+").

**Chờ đồng bộ lên artifact** — KHUÔN F là mặc định MỌI bảng dữ liệu (27/11, CEO "áp dụng hết… lưu vào DS trước", commit
85357de): `th` cao 44, 12/18 600 VIẾT HOA tertiary, kẻ trên + dưới, đệm 20 = `td`; nút tiêu đề (`thSort`) lùi −8 hai bên
(vùng rê/chip lọc rộng hơn, chữ vẫn ở 20). Cột ô chọn TRONG bảng, luôn hiện, dính trái (`CHON_BANG` = `CHON_BANG_GHIM`
cũ; bỏ lề âm −36 của `tableWrap` và ẩn-chờ-rê của bảng). Lọc ở NHÃN CỘT: `moLocCot` → nhãn thành chip "TÊN: GIÁ TRỊ";
`NutLoc onXoaHet` (nút "✕ Xoá bộ lọc", điện thoại chỉ icon) + `coCot` (trường không có cột đang hiện → `ChipLoc` cạnh nút
Xoá); hàng chip `ThanhDangLoc` bỏ khỏi màn danh sách. KHÔNG số đếm trên tab / cạnh tiêu đề (`useHangTab` bỏ `demTab`,
`DataViewToolbar` bỏ `dem`) — bộ đếm duy nhất là `PhanTrang` (mặc định luôn hiện khi có `tong`, thẳng ô tick). `TableRow
menu/tenMenu` = ContextMenu chuột phải của dòng. `ListView` đầu cột cũng 600 viết hoa tertiary. Bảng LƯỚI (`TableWrap
luoi`) là biến thể phụ: viền khung bo 12, vạch cột alpha-05, chữ 14/10. Khi đẩy lên artifact: preview Table/DataViewToolbar/
FilterBar/BulkActionBar theo khuôn này, README Table ("ô chọn trong bảng", "menu dòng"), DataViewToolbar (bỏ đếm), FilterBar
(chip ở nhãn cột thay hàng chip).

**Luật — Ô tìm trong menu/pop (`CommandInput`, CEO 26/11 phê 2 lần, "lỗi rất nhiều, ghi thành rule"):** ô tìm trong
menu, dropdown, pop lọc, "Tìm cột"… luôn TỰ FOCUS khi mở, nên MỌI chỉ báo focus của nó hiện thường trực và trông như lỗi.
Do đó: (a) gạch dưới hàng tìm GIỮ `border` khi focus — không đậm lên (`commandInputWrapper` bỏ `focus-within` alpha-50,
khác nguồn artifact `.ui-menu-search:focus-within`); (b) không outline/ring/box-shadow quanh ô; (c) caret ẩn khi ô trống
(`placeholder-shown:caret-transparent`). Sửa ở `command-styles.ts` (gốc của 16 chỗ dùng), KHÔNG vá từng màn. Ô tìm đứng
riêng trên trang (`OTimKiem`, `Input shape="pill"`) vẫn có viền focus alpha-50 như input thường — luật này chỉ cho ô nằm
TRONG lớp nổi. Kiểm: mở thật menu, `getComputedStyle(hàng).borderBottomColor` lúc focus = lúc không focus.

Kanban học hành vi Twenty (26/11, spec mục F + G, prototype ticket F; giao diện giữ DS — không vạch dọc/lưới): (G) ngưỡng
kéo chuột 4 → 8px, thêm `TouchSensor` giữ 250ms lệch ≤ 5px (giữ rồi thả tại chỗ → menu "Chuyển sang…"; ContextMenu tắt
trong lúc kéo), phím dùng `CamBienPhimKeo`; không xếp thứ tự thẻ trong cột. (F) `KanbanBoard menuCot` → nút ⋯ (Button ghost
icon-xs, `cotMenu`) đầu cột: "Thêm …" · "Ẩn nhóm" (ẩn xong focus sang ⋯ cột kế bên, kể cả khi bên gọi ẩn trễ);
`NoiDungTheTruong` + `TruongThe` — thẻ dạng trường: dòng đầu mã (14/20 500), mỗi trường icon 14 tertiary + giá trị 12/18
(`ds-text-xs`), trường rỗng hiện TÊN trường mờ (`data-rong`, sr "tên: trống"); tối đa một nhãn màu/thẻ (CEO 26/11).
⚙ `CaiDatHienThi`: `nhom.kanban` (Nhóm theo chỉ ở Kanban, không "Không nhóm"), `nhomAn` → trang "Nhóm đang ẩn" (dòng
`cdDongCot` + mắt "Hiện …"). Test: kanban-board.dom.test (ngưỡng, cảm ứng, phím + visibilitychange, menu cột, thẻ trường),
cai-dat-kanban.dom.test. Khi đẩy lên artifact: README KanbanBoard thêm "Menu đầu cột", "Thẻ dạng trường", ngưỡng kéo; preview
KanbanBoard thêm nút ⋯ + một thẻ dạng trường; `bundle.css` thêm `.b-k-menu` (dồn phải, lề dọc −1) và `.b-the-truong*`
(dòng flex cách 8, icon 14 tertiary, rỗng tertiary); README DataViewToolbar thêm trang "Nhóm đang ẩn".

Tập dạng xem theo màn (26/11, CEO "Bỏ, giữ 2 dạng" ở ticket F): `DataViewToolbar`/`CongCuXem` + `CaiDatHienThi` thêm
`dangXemCo?: DangXem[]` (mặc định đủ ba như cũ — Work v2 không đổi). F truyền `['bang', 'kanban']`: cụm chọn và ⚙ Bố cục
chỉ 2 mục; ListView chỉ còn là cách hiện tự động khi khung < 640. Khi đẩy lên artifact: README DataViewToolbar thêm một dòng
"màn có thể giới hạn dạng xem"; preview không đổi.

Bản 37 (CEO chốt 20/11, "làm luôn"): tiêu đề chừa lề phải cho ✕ (✕ chiếm 19–47px từ mép phải) —
`.ui-dialog:has(> .ui-dialog-close) .ui-dialog-title { padding-right: 36px }` (cần ≥ 47 − 20 + 8 = 35 → 36 = 9 × `--spacing`,
chữ cách ✕ 9px; chỉ hộp có ✕, ConfirmDialog/AlertDialog trọn bề ngang) và `.ui-sheet-header` phải 52 → 56 (52 chỉ còn 5px từ
bản 35). Code: `chuaNutDong` (`dialog-styles.ts`, gắn khi `showClose`) + header Sheet `pr-14`. README Dialog/Sheet thêm 1 dòng;
không preview.html nào đổi.

Bản 38 (CEO duyệt 20/11, "Sửa artifact luôn" — đồng bộ ngược lát 3; bản 39 chỉ đổi index `lastChange`): sửa lỗi đặc
hiệu theme tối/trạng thái của `bundle.css` mà DS đã KHÔNG chép — hover chỉ ở trạng thái thường bằng `:not(:where(…))`
(không cộng đặc hiệu): ô nhập/textarea/Select trigger (dùng chung DatePicker/DateRangePicker) loại tắt/focus/mở/lỗi; rule
lỗi tối loại `:disabled` (tắt > lỗi); InputAffix: hover khung loại `:focus-within`, lỗi tối của khung loại con tắt, reset ô
trong khung thêm `[aria-invalid]` (hết viền đỏ đôi); Switch hover loại `:disabled`; Checkbox/Radio hover tối loại
chọn/tắt/lỗi, lỗi loại `:disabled`. Không đổi token. Kiểm bằng Chrome headless (chuột/phím CDP thật): 37 ca × 2 theme đúng
ở bản mới (bản 37 sai 21 ca). Bỏ 9 `lyDo` (input, inputaffix, checkbox ×2, radio ×2, switch, select, datepicker). README
thêm quyết định đã chốt (Inter chính chủ, Button loading, ô tiền dán phần lẻ/không âm, Combobox khớp chuỗi con + tên
trigger, DatePicker/DateRangePicker trần cao pop + kẹp tháng, mô tả Checkbox/Radio `aria-describedby`); preview Combobox
đổi sang 34 tỉnh/thành (NQ 202/2025/QH15) và bỏ khớp chữ cái đầu.

Bản 40 (CEO duyệt 20/11 — DS thiếu Card thì build vào DS trước; bản 41 chỉ đổi index `lastChange`): thêm component Card
(`Card/preview.html` + README) và 7 rule phần Card ngay sau `.ui-card-pad` trong `bundle.css` (`ui-card-header`/`-title`/
`-desc`/`-action`/`-content`/`-footer`); `.ui-card`, `.ui-card-pad` giữ nguyên → `bundle.css` lấy **bản 40**. Preview nhóm
`Data display` (nhóm tiếng Anh như các preview khác; /ds xếp Card ở nhóm Nền).

Lát 4–6 (20/11): `preview.html` + README của 27 component còn lại (Tabs … NotificationMatrix) lấy **bản 41**, chép bằng
`cp`. Riêng `Table` và `ListView` (README + preview) artifact lưu CRLF → repo lưu LF (`.gitattributes`); bảng dưới ghi sha
bản repo, kèm sha bản artifact. `bundle.css` bản 43 (bản 41 không đổi CSS); README Toast/InlineEdit/ListView lấy bản 43 (đồng bộ ngược, ListView chuyển LF).

| File | sha256 |
|---|---|
| `nguon/tokens.json` | `a6dc379bf515623fac52bb8559e10ca5bc0e914fe105de80883383b67a75d221` |
| `nguon/tokens.css` | `45230c507af3efd5507f16e82a2911679fadf68b8ed2e5583e84d14f92bc44b5` |
| `nguon/bundle.css` (bản 54) | `83c8157f31be392cede16022cad9afeb138853350555ea88f6a45fe6ebb7fe2d` |
| `nguon/components/Button/preview.html` | `177935133068d688891289c9b853d7a5cf847dcf34b5c0f4636a5e7b0486052c` |
| `nguon/components/Badge/preview.html` (bản 31) | `f58ca05c625e32fe41b9493f5e906ffdc81d25c51fc742087ada5a72f4ccc06c` |
| `nguon/components/Avatar/preview.html` (bản 31) | `1af306836e66a39a844904f9f90e09555ab94decca55a4b0852e176f4f900259` |
| `nguon/components/Kbd/preview.html` (bản 31) | `9a5fcaee5823786d85afef6f07afffcc9ce8d68989c34995e5abc607f2b14b3f` |
| `nguon/components/Alert/preview.html` (bản 31) | `22cce7f4fdce13943e52729d70092bce3c9cd319c390cda718ef4995897ce4ab` |
| `nguon/components/Tooltip/preview.html` (bản 33) | `46decec67c623e0895c84d3505ed9c93e58686c66ebecdda768a97c8c40f2427` |
| `nguon/components/DropdownMenu/preview.html` (bản 31) | `6afae375e5581ea6e7df670a84fbc9e070d6a23db4103d07f7a6ec6ceab45a45` |
| `nguon/components/ContextMenu/preview.html` (bản 33) | `135fe520b997456b6deb7fab94069c4d2ccbc8b784e1b1d30cbb4b118b46ac3b` |
| `nguon/components/Dialog/preview.html` (bản 31) | `727c5eba30eb50a884300e4337a6b32d1b39b418505e58bb01f6c41bcfe8b2b7` |
| `nguon/components/ConfirmDialog/preview.html` (bản 31) | `4a13f54f975888e58984a84209e7bd65bcae842af2df36ba589025f3972fd7ec` |
| `nguon/components/Sheet/preview.html` (bản 31) | `421eac8dd26abecbc212a6beb5931a73a8403cceb5f290377eaa644d5d90a24f` |
| `nguon/components/Input/preview.html` (bản 51) | `df5e056ed5403311399f9ffa7684f3e0674b8002191aa12212053d18b57f3f1d` |
| `nguon/components/InputAffix/preview.html` (bản 37) | `d451f0bae471985a97b34340556fe1453c8a807994e32855004e172172464793` |
| `nguon/components/Checkbox/preview.html` (bản 37) | `e374b6579be84531451f724c2cea980b60c5a6d50537f03f3d92c8738dfabd10` |
| `nguon/components/Radio/preview.html` (bản 37) | `c345332155acc101844d432bd8486ae12547134fd848c050742b2ec5e47a8743` |
| `nguon/components/Switch/preview.html` (bản 37) | `e8489c3891fa016ee5def8f7d49c7079508b38d601d6a6f48739339602c166d5` |
| `nguon/components/Select/preview.html` (bản 37) | `2db038aae769479a473a9f1151863bcf190d9147dfc9756b1892517858fbb4a6` |
| `nguon/components/Combobox/preview.html` (bản 38) | `4e9f82c0079b2649c5d69a80e50b91152fb0b98f11c12ec1bebc36dc7cdf58af` |
| `nguon/components/DatePicker/preview.html` (bản 37) | `fc39754c75bb053fc7ce95a921278209a217f256fec23c6f3a5f081bbe7c1212` |
| `nguon/components/DateRangePicker/preview.html` (bản 37) | `4af2927ade5a4a0ce7ab6bfc13442f427d2ffbaebe527d61b3859b6cebb29a04` |
| `nguon/components/FileUpload/preview.html` (bản 37) | `20fb1d1ad2ddb757e4bf8b01e7f96fd3571ad56dff9f11020242a56e8a3643ab` |
| `nguon/components/Card/preview.html` (bản 40) | `258137b798b64bf96f637b14dc11dc24cabcdad256928c466a190e3eaae85f86` |
| `nguon/components/FormLayout/preview.html` (bản 37) | `9b10b2fec50fabda5418c14c6765bd3c921624a87c30c79670ce85e29c0621f0` |
| `nguon/README.md` (bản 54) | `02852c8829cfff4fa280645b9b473cfe41007d05751736a528e98f32536daeb4` |
| `nguon/components/Alert/README.md` (bản 37) | `6c43cfce0fe38d1142ec6b2b9dba9d6cd303246d2b6eea2ccf405a66e2b1eae5` |
| `nguon/components/Avatar/README.md` (bản 37) | `1c96c7dc37ca072574340859677e57acdab3e9db5a9b4224d981eac458c2b7fa` |
| `nguon/components/Badge/README.md` (bản 37) | `8d46db52bed6a44d72998f9dd9c179ad8634ebd1131d451ebad9eebdc4ef2db0` |
| `nguon/components/Button/README.md` (bản 38) | `7c4d765de3fe02a32f24018c9ed1e64ce9842e98ddb66c3e55feae9e477e918b` |
| `nguon/components/Card/README.md` (bản 40) | `601e90af3c906d2f8071fc5e2b82ce38c172566ae14c0ea5cb1d271f17b986db` |
| `nguon/components/Checkbox/README.md` (bản 38) | `0f34e20be1686968560d4e29e8b509eabc42e3135d16608bbab7b385b247996f` |
| `nguon/components/Combobox/README.md` (bản 38) | `495c777aa0daf6f6f30c041a406f219a5a584386f02b15f83773a169089e0810` |
| `nguon/components/ConfirmDialog/README.md` (bản 37) | `248bf80fa9b9de0b996faaa33ac2b2f267839a9553eaf902d363f01857b3318b` |
| `nguon/components/ContextMenu/README.md` (bản 37) | `088c1cbe787cc7b8733b9ad0e6b76a2bec1af0ea64846bbd80816f1aadd799ad` |
| `nguon/components/DatePicker/README.md` (bản 38) | `dad40ee70250e18a136f8acfd51ba5683c9275b11c29e8cf5dc0e5998af9bf9f` |
| `nguon/components/DateRangePicker/README.md` (bản 38) | `80834ce79bb5396898cab475d29c738586194922314bba20f19f332b8a30dd93` |
| `nguon/components/Dialog/README.md` (bản 37) | `83ecfd3b3a6183d01b1a425638b3380987c503ed19c952be22b583484b24c9b7` |
| `nguon/components/DropdownMenu/README.md` (bản 37) | `d47d89bde8bc826d043e035c62a3adc067ed474f047f175f29dbc83428059871` |
| `nguon/components/FileUpload/README.md` (bản 37) | `e85ea46db97771f580342ca82bc007bf06c356fe3fca6756e6702b73a4878660` |
| `nguon/components/FormLayout/README.md` (bản 37) | `c7509a2d4f3d5dbbd4a99c2496d738bc6a6558d8379033cfcf5f5d581e632f98` |
| `nguon/components/Input/README.md` (bản 51) | `74877769c31f2329ee91b1f898d7e0584d9d02ba3459901f52cf6c86f2387b39` |
| `nguon/components/InputAffix/README.md` (bản 54) | `2499ec0dc2109e763ebb06c342fe357425811b9974c6a80106c41c6b0b4f30d8` |
| `nguon/components/Kbd/README.md` (bản 37) | `7fce49f5b25ab4124497cfefcc8e625f38f2e17296e25ab4313dd4548d2b4014` |
| `nguon/components/Radio/README.md` (bản 38) | `11fcbde03ccbd9c837321ceb48e36d346cec557a62377274da5c1f7db94d0287` |
| `nguon/components/Select/README.md` (bản 37) | `392e3e868604d2bcdfbcab9f3ed749e3a768659e1d6aa21eec667761dd5e646a` |
| `nguon/components/Sheet/README.md` (bản 37) | `53427ff7e087ffb8fc3232054afb5b598d2c2244d4e55987d79cf07f1be55fbf` |
| `nguon/components/Switch/README.md` (bản 37) | `36e09dcbec0756dfcbe9ad61cec14f55a3d25c252aab7c3cf232b4a3be0b9c9e` |
| `nguon/components/Tooltip/README.md` (bản 37) | `73a26e39131dcbba9af30105d1477e5b96c8d62d43c42cc279860f04fe1cb6d2` |
| `nguon/components/Tabs/preview.html` (bản 41) | `13bb9d529c99dd892d715695f92ba7d2d550ca7fa021f2d5540bd51ffbe61ecc` |
| `nguon/components/Tabs/README.md` (bản 41) | `a9e763969b67f3320e3d50d36914e46718550624dae5b0af849e5e48df487116` |
| `nguon/components/Sidebar/preview.html` (bản 41) | `23a6be08adc96178a6239ce70ea8c9f2c5abd802b1cba31cfaba4a58a262f507` |
| `nguon/components/Sidebar/README.md` (bản 54) | `08d74d3bd7b6ac7bf63003219fdc2c10c703646abd7c2b29a53556be2665ccfc` |
| `nguon/components/Table/preview.html` (bản 54) | `3f39e4a8cbf920c025249c0e37706806e26ed717b5e6dfab9f271eda68e2b2fb` = bản CRLF trên đĩa + artifact; git lưu LF (sha `e0d9e7dca8b68bb65a7dc6f2f6e1f93f…`) |
| `nguon/components/Table/README.md` (bản 54) | `2925eef71674242b775dfcfe8d08bde703272b5bd1a7ac26ea32a31db455eb81` |
| `nguon/components/DataViewToolbar/preview.html` (bản 41) | `c5618b59ccefe0edaa7f41c6e6ce0824337a084fc818233994d0449e85a9a6d0` |
| `nguon/components/DataViewToolbar/README.md` (bản 54) | `048a4c666419918afcfe85c18c07c1350bb15b8ffa63c9d5d83361619f5dff84` |
| `nguon/components/FilterBar/preview.html` (bản 41) | `0d5df10be82277fba749cfa1d4e9097a316fb4f936ca1e43192c29f8f26ba480` |
| `nguon/components/FilterBar/README.md` (bản 54) | `002a289ccec10c087e70be396784d72689f4c566304ed82f14fb4ca914f972f6` |
| `nguon/components/Pagination/preview.html` (bản 41) | `a37728697de08d3753cc45af5b9a5a4cb9a48ae076b961d894f05f6cf0148976` |
| `nguon/components/Pagination/README.md` (bản 41) | `59b21916e4677fbd3ec005fede7450d53c71ded9a7a52af8190c4991bf818667` |
| `nguon/components/BulkActionBar/preview.html` (bản 51) | `82e988bf5feadc9ed583a965db2556e29e49b4aed11521a451dffcfd6bfbe0d6` |
| `nguon/components/BulkActionBar/README.md` (bản 54) | `099cf8b8d355ac29bb6c0285bfa15e1d28ae1afde0ace5f4e0102f9b2be245b0` |
| `nguon/components/SavedView/preview.html` (bản 41) | `b8177b69bad36c8f6abcc5dbd776af6fb6b216ad05464dc5ed032837a61ef46d` |
| `nguon/components/SavedView/README.md` (bản 41) | `d2233c740dfd0d37000e705820c8802981672c3473764bfa2293e69ebcc0b0d7` |
| `nguon/components/ListView/preview.html` (bản 41) | `a1e126b4c73922e2ca3f80ccd4fe20fe6c8137174657ae0c7ed786402945c3e8` artifact lưu CRLF — sha bản artifact `b9eeae18bbc196ddf8df7780a8f1d7adb311e04163dd2c647456394e6790e226` |
| `nguon/components/ListView/README.md` (bản 54) | `f863ffc63486d6b8e6e56df6b124c2bf6c94b7d01726d9555072fb9422bfafd8` |
| `nguon/components/KanbanBoard/preview.html` (bản 41) | `28fc265ff8924d72a2d1d55c640a7c99346e7587e7f5d0e7216de1a28a651dee` |
| `nguon/components/KanbanBoard/README.md` (bản 41) | `b6c8cd2707763ea66f18a01d32d0538aa6b7fcfb12083fd3d34008adbeaa8866` |
| `nguon/components/InlineEdit/preview.html` (bản 41) | `9a54a662853fb188b8170e3bcba12ec9082c785cc03bbc958f69d3dd264e145a` |
| `nguon/components/InlineEdit/README.md` (bản 43) | `a17f4814b6f1bcbaf011ef0be0de999096ed8cfa6395b0282cb983f2476e0c91` |
| `nguon/components/RecordPicker/preview.html` (bản 41) | `9da530eec012176824334d76ea4799a6ecb8fc924bbe6c4c5af9920381589546` |
| `nguon/components/RecordPicker/README.md` (bản 41) | `e43ff951d073162fa4bca5549d0313c1e0e77339d1b888488601f7737fea0ea6` |
| `nguon/components/Breadcrumb/preview.html` (bản 41) | `d62b871ac5ec426bc7f014fb19d1b43c446fbbd5b12e8dee0a50722c4c2134c2` |
| `nguon/components/Breadcrumb/README.md` (bản 41) | `1b9acf39572ebf227345ddf07396c6c654ac6ebca52d689e9ed65d67e791e83f` |
| `nguon/components/PageHeader/preview.html` (bản 41) | `5fcf1361485ed26195a8ba6d96c2a3a6de6f3125d6edb13db06344c8c13b93e4` |
| `nguon/components/PageHeader/README.md` (bản 41) | `d8966ef5b9e38e19efb33aa02e7ee59661ee17e71e3cddd752c2b033b1268331` |
| `nguon/components/PropertyList/preview.html` (bản 41) | `3e3a3a6f7eed46d4bb11d572ec8765e43775b22edb803a5ebbda854a8a2a31f8` |
| `nguon/components/PropertyList/README.md` (bản 54) | `b52d40d5adc50ead94f8cabdc1141bda3d32728b67834087b9eb555169188a15` |
| `nguon/components/Timeline/preview.html` (bản 41) | `8e3e584a280eff95784b56d34b8e5737c18a70a864eb009a68c8f776edea97d8` |
| `nguon/components/Timeline/README.md` (bản 41) | `69ae0d7d7a4382802139d4f644a18fe80d7b568333e6a6304f4c9fa88f742312` |
| `nguon/components/Composer/preview.html` (bản 41) | `4d1e97f3c05a20e90f71804a308c5bda8661f9e21fb982e61a765104c86c5378` |
| `nguon/components/Composer/README.md` (bản 41) | `46ef4e51f6dc8598cfc0c0f43319ef1b002e1a03d876e218bacfb3af0eae876e` |
| `nguon/components/DetailLayout/preview.html` (bản 41) | `1f4dda3cbd0ccbdf8ce1dc7f6530b9b58ac1a7d64cd282f8c2efb63911da720c` |
| `nguon/components/DetailLayout/README.md` (bản 41) | `ce041c29ddcb01ab835e9f27cc86f8d9b986790d0e1b2857d3766f6e7a2c6566` |
| `nguon/components/EmptyState/preview.html` (bản 41) | `56144586beed2fe0df89d5f9ffc95b808c882b2893dfcb8242178d9fc4aba398` |
| `nguon/components/EmptyState/README.md` (bản 41) | `66bc0c1e7a8b67287b40706df8e5865d464c498ea2d296f0498ff8e1e2b5c6a5` |
| `nguon/components/Skeleton/preview.html` (bản 41) | `9df0fab4c45917f65789f95c26edb70079d166a8db2e516d8239e885c71b23c4` |
| `nguon/components/Skeleton/README.md` (bản 41) | `0898bdc79873ec1f51b74758bfeaf065ea3b3e394fadb5f76c008f293a0a0042` |
| `nguon/components/Banner/preview.html` (bản 41) | `0d43637e844bc0682d6a14bcbbfe8a6dcceda697a6b56d726aad3910ee73a2d0` |
| `nguon/components/Banner/README.md` (bản 41) | `b9cf08dd20fd7c6929dd9552a9197756b43fa593545883a0f743f373d00a02ab` |
| `nguon/components/Toast/preview.html` (bản 41) | `2caffb6a72b41b291e39e44394cc6bea97d74ab1f6b344fa29d794c072402d01` |
| `nguon/components/Toast/README.md` (bản 43) | `af747404df89ac6754896e5a6826e6a0b313e72c1c563cd7f9cbf4d3d44d8ad7` |
| `nguon/components/CommandPalette/preview.html` (bản 41) | `a80fb0952a5b284cf270d81b21ab3c98387fc357ff7df514faea6fa3fa510e1a` |
| `nguon/components/CommandPalette/README.md` (bản 41) | `3d46952b3830b86c4c3c0f5337f9f3e3292aec8dddda8b708e56604c821bcfba` |
| `nguon/components/StatCard/preview.html` (bản 41) | `bda59316b9f847e45ccc0a2186c46dc2009762382412de182e4c2fe85a9b3fcc` |
| `nguon/components/StatCard/README.md` (bản 41) | `8ec97ff78487aae97963f50d71f3f50c67c9bf5ea8e020ac8d38252242207933` |
| `nguon/components/Count/preview.html` (bản 41) | `125631e5083b09b22c69a4ca1d97b4c91541d65b08ae13470a7955b6b1da1b4b` |
| `nguon/components/Count/README.md` (bản 41) | `80e45c5ef271fa7ab61a15aa500cca645400c69c18e07c8787aad4f184ab7bf1` |
| `nguon/components/NotificationCenter/preview.html` (bản 41) | `2fdca387ccbf9d10e3412b4583a95e77594023f12d3ce30fb55eaa4fca049fc4` |
| `nguon/components/NotificationCenter/README.md` (bản 41) | `4053b199785b51e7eeb75ce4b242210e6f1752b605a2da0e370e5c7cc10efce4` |
| `nguon/components/NotificationMatrix/preview.html` (bản 41) | `b12f6e872245bfa4c06111a313dc03015f175f2ddd5b72416d76d2f8bea0f1b2` |
| `nguon/components/NotificationMatrix/README.md` (bản 41) | `cd0af813da77c63ddc98a9059fe92a0442f176dcc122af1348b47685ce44a10c` |

`.gitattributes` trong thư mục này ép LF để sha256 trên khớp ở mọi máy (repo bật `core.autocrlf`).

**Thang Tailwind trong vùng DS:** trong `[data-ds="v2"]` DS khai lại `--radius-*` và `--spacing` → utility mặc định
`rounded-*` / `p-*`… của Tailwind ăn theo thang DS ở đó (vd `rounded-md` = 8px). Cố ý; ngoài vùng DS không đổi gì.

**Đã đo: màn cũ không đổi CSS ngoài vùng DS** (review cuối lát 1, 19/11). Cách đo: `git worktree add` tạm bản `f990707`
(trước lát 1) ra ngoài repo, nội dung quét = mã màn cũ của bản đó; biên dịch `app/globals.css` qua `@tailwindcss/postcss`
(`base` = thư mục đó, `optimize: false`) hai lần — CSS của `f990707` và CSS của lát 1 (`globals.css` + `ds/tokens.css` +
`ds/theme.css` chép đè; file `.css` không bị Tailwind quét nên nội dung giữ nguyên). Trải phẳng thành từng khai báo
(chuỗi @-rule › selector › thuộc tính: giá trị), bỏ selector chứa `data-ds`/`.ds-`, so tập. Kết quả: **mất 0, thêm 3** —
chỉ biến `@theme` ở `:root` (`--font-sans: var(--font-geist-sans)`, `--color-border: var(--border)`,
`--color-ring: var(--ring)`; Tailwind xuất vì `tokens.css` có `var(...)` tới chúng), và **0 khai báo ngoài vùng DS đọc
3 biến này**. Không utility mới nào sinh ra từ mã màn cũ (không màn cũ nào dùng `bg-primary`, `border-input`…). Đo lại
khi đổi `theme.css`/`globals.css`.

## Luật cho component lát 2

Gom từ review lát 1 — đọc trước khi dựng component mới trong `components/ui/`:

- **Font:** Inter đi kèm `DsRoot` (`components/ui/font-inter.ts`, biến `--font-inter` gắn trên chính phần tử gốc) → màn
  nào bọc `<DsRoot>` cũng có Inter; không nạp font ở layout.
- **font-feature-settings (CEO 25/11 đổi):** `DsRoot` chỉ bật `ss03` — BỎ `cv11` để chữ a HAI tầng (dễ đọc); artifact
  còn `cv11`, cổng so khớp bật lại `cv11` bên DS lúc ĐO (so hình học đúng artifact). Bản cũ dưới đây giữ để biết lịch sử.
- **font-feature-settings (cũ):** component **không bao giờ reset** (`cv11`/`ss03` kế thừa từ `DsRoot` — CEO chốt 19/11
  "bật cho đồng bộ"). Artifact bản 29 đã sửa theo: 20 rule dùng shorthand `font:` trong `bundle.css` thêm
  `font-feature-settings: inherit` → so khớp không còn lệch dòng này, không cần `lyDo`.
- **Viền:** Button base là `border-none` (khớp `.ui-btn{border:0}`) → cần viền thì thêm `border-solid`. Component khác
  đọc khối `.ui-*` của nó trong `bundle.css` trước khi chọn.
- **Thang trong vùng DS:** `rounded-*`/`p-*`/`gap-*` theo thang DS (mục trên). Nhưng `--breakpoint-*` khai trong vùng
  **không có tác dụng** — media query biên dịch lúc build từ `@theme` toàn app → `sm:`/`md:`… vẫn là mốc mặc định của
  Tailwind (vd `md` = 48rem), không phải 768px của DS (trùng số, khác `xs`/`sm`). Cần mốc DS thì viết `max-[576px]:`.
- **Không chạy `npx shadcn add` thẳng** (xem spec §5.3): chép tay từ registry, hoặc chạy rồi bỏ mọi thay đổi `globals.css`.
- **Portal:** mọi Radix Portal truyền `container={useDsPortal()}`; component đầu tiên dùng portal phải có bằng chứng mở
  thật trong vùng (spec §5.1).
- **Không lồng chéo với CSS cũ:** không đặt component cũ trong `<DsRoot>`, không đặt `<DsRoot>` trong
  `[data-khu="work"]`/`[data-khu="wiki"]` — trùng tên `--muted`/`--accent`/`--border`/`--shadow` (spec §5.1).
- **So khớp:** mỗi component có `so-khop/<c>.json` + chạy `node ds/so-khop.mjs <C>` thoát 0; trạng thái nào preview
  không có thì ghi vào `chuaDo` (in ra `<C>.md`), không để con số khớp tự nói "khớp hết".
- **Overlay trong so khớp:** khoá có `buoc` (bấm / chuột phải / rê / `tab` / phím / `cho`, CDP thật) mở overlay trên
  trang nạp lại mới trước khi đo; focus trong overlay đo bằng bước `{ "tab": sel }`, KHÔNG bằng `trangThai: focus`
  (config bị từ chối). Vùng DS **luôn kiểm** cho mọi phần tử bên DS (ngoài `[data-ds="v2"]` = lỗi, không lyDo nào miễn;
  `trongVung` cũ vẫn nhận, không tác dụng thêm). `pseudo` khi bên artifact vẽ bằng `::after` (tooltip). Ảnh overlay:
  `anhTuongTac.buoc` mở overlay ngay trước khi chụp + `khung.ds` dạng mảng (`["#<neo> > div", "[data-ds-portal] > *"]`)
  → ảnh DS có overlay đang mở cạnh preview. Cú pháp đầy đủ ở đầu `so-khop.mjs`.
- **Thang z (một chỗ duy nhất — component mới đọc ở đây, không tự chọn số):** bulkbar **55** (`.ui-bulkbar`) · toast
  **56** (`.ui-toast`) · tip thanh bên / sheet đáy điện thoại **60** (`.pD-icon` tip, `.b-caidat`) · dialog + overlay
  (Dialog, AlertDialog/ConfirmDialog, Sheet, Drawer) **70** (`dialog-styles.ts`; artifact dùng top layer của `<dialog>` —
  trên mọi lớp trang) · tooltip **80** (`.ui-tip::after`) · menu **90** (`.b-noi`, `.b-chuotphai`). Tooltip/menu > dialog
  vì mở được BÊN TRONG hộp. **Toast < 70** như artifact (toast nằm dưới hộp đang mở): Sonner gốc 999999999 → ghi đè 56
  (đo lát 5), khoá `zIndex` trong so khớp Toast. Lớp cục bộ (lát 4–6, ngoài thang vì chỉ xếp trong khối của mình):
  thẻ xem nhanh **44** / **50** (`data-view-styles.ts`); khung Sidebar **45** / **46** trong `isolate` + tip thanh bên **60**
  (`sidebar-styles.ts`); tiêu đề dính của Table **2**, cột ghim ma trận **3**; bóng kéo dnd **90** (lớp menu).
- **Tooltip trên nút icon:** chữ tooltip là MÔ TẢ thêm, không lặp nguyên `aria-label` của nút — Radix gắn
  `aria-describedby` → trình đọc màn hình đọc hai lần (vd nút "Thao tác" + tooltip "Mở thao tác cho đơn").
- **Menu (DropdownMenu, ContextMenu — dùng `components/ui/menu-styles.ts`):** item `disabled` theo WAI-ARIA APG — vẫn
  hiện, vẫn focus được (↑/↓, gõ chữ đầu dừng ở nó), không kích hoạt; KHÔNG truyền `disabled` cho Radix (Radix loại khỏi
  bàn phím) mà dùng `itemDisabled()`. Lý do chặn ghi ngay trong chữ ("Chuyển kho (không có quyền)"). Nền sáng chỉ theo
  `data-highlighted` (một mục), không theo `:hover`. Menu chọn cột / tuỳ chọn nhiều: giữ menu mở khi tick
  (`onSelect={(e) => e.preventDefault()}` trên CheckboxItem). Khung menu có trần cao `min(420px, 100vh − 16px)` + cuộn
  bên trong (`.b-noi`, trong `menuContent`); ContextMenu chỉ đóng khi cuộn NGOÀI `[role=menu]`.
- **Tên prop:** primitive (khung shadcn/Radix: `Dialog*`, `Sheet*`, `DropdownMenu*`, `Button`…) giữ tên tiếng Anh của
  shadcn/Radix (`open`, `onOpenChange`, `variant`, `size`, `disabled`, `asChild`); component GHÉP nghiệp vụ của DS (vd
  `ConfirmDialog`) dùng tên tiếng Việt cho phần nghiệp vụ (`tieuDe`, `hauQua`, `nutXacNhan`, `onXacNhan`…). Riêng màu
  theo `variant` của shadcn khi có. `color` (`Alert`, `Badge`, `ConfirmDialog`) là prop mở rộng của GWT, giá trị theo token.
- **Focus trong overlay (Dialog, Sheet, AlertDialog/ConfirmDialog):**
  - *Focus ban đầu:* Dialog → nút AN TOÀN (Huỷ) mang `data-autofocus` (qua `onOpenAutoFocus` của Radix; `autoFocus` của
    React làm Radix bỏ qua `onOpenAutoFocus` → không dùng). Sheet → mặc định nút ✕ (phần tử focus được đầu tiên); màn
    cần ô lọc đầu nhận focus thì `data-autofocus` lên ô đó (hoặc `onOpenAutoFocus`). ConfirmDialog → `pha` thì nút Huỷ,
    không `pha` thì nút xác nhận; con mang `data-autofocus` (ô gõ mã) thắng cả hai.
  - *Trả focus khi đóng:* hook chung `components/ui/use-nut-mo.ts` (DialogContent/SheetContent/AlertDialogContent đã gắn
    sẵn — màn KHÔNG tự viết `onCloseAutoFocus`): về phần tử đã MỞ overlay, kể cả hộp điều khiển bằng `open` không có
    Trigger, hộp mount sẵn mở, hộp mở từ mục menu (về nút ⋯ / dòng đã mở menu — mục menu đã bị gỡ khỏi DOM). Phần tử đó
    đã mất → để Radix lo (Trigger nếu có), không bao giờ focus node chết.
  - *Sheet bộ lọc + form:* `<form id>` bọc THÂN (`SheetBody`), nút Áp dụng trong `SheetFooter` dùng thuộc tính
    `form="<id>"` — không bọc cả panel bằng form (header/footer là con trực tiếp của panel flex cột). Nút ✕ nằm cuối
    `SheetHeader` → mọi Sheet phải có `SheetHeader`.
- **Test hành vi (focus, Esc, bàn phím):** file `*.dom.test.tsx` mở đầu `// @vitest-environment jsdom` + Testing
  Library / user-event; polyfill Radix ở `vitest.setup-dom.ts` (chỉ chạy khi có `window`). Test còn lại vẫn môi trường node.
- **`/ds`:** mỗi component một file `app/ds/_khoi/khoi-<neo>.tsx` (`export function Khoi<Ten>()`, `<section id="<neo>"
  className="scroll-mt-6">` + `<h2>` link `#<neo>`), rồi gắn `Khoi` vào mục của nhóm tương ứng trong mảng `NHOM` của
  `app/ds/_khung/khoi.ts` (mục lục cột trái tự thành link; chưa gắn = chữ mờ "chưa dựng"). `/ds` = trang Components
  trong khung tài liệu (cột trái, `Tam`/`Muc`); `/ds/[trang]` = trang chữ + 7 trang nền token; `/ds/tron` = khối trần KHÔNG
  khung — cổng so khớp đo ở đây, đừng thêm khung vào nó. README nguồn ở `ds/nguon/` (Tailwind KHÔNG quét — `@source not`
  trong `app/globals.css`).

- **Tailwind quét cả file test và file .md trong apps/web:** chuỗi trông như class (vd variant tuỳ biến có ngoặc nhọn bên trong) trong `*.test.tsx` hay `ds/*.md` cũng được sinh CSS — chuỗi hỏng làm dev server 500 (gặp 20/11). Trong test/tài liệu viết mô tả bằng lời, đừng dán class có ngoặc nhọn/chỗ trống; lỡ dính thì sửa chuỗi rồi `touch ds/tokens.css` để Tailwind quét lại.

- **Thứ tự biến thể Tailwind 4 ≠ thứ tự cascade bundle.css (lát 3):** CSS biên dịch xếp `focus-within` < `hover` (bọc
  `@media (hover:hover)`) < `focus-visible` < `disabled` < `has-*` < `aria-*`. Trạng thái chồng nhau (tắt + lỗi, focus +
  hover) phải chặn bằng `not-*`/`enabled:` — không trông vào thứ tự viết class. Mẫu: `control-styles.ts`.
- **Comment trong `.ts/.tsx` cũng bị Tailwind quét** — tả mẫu class bằng lời, đừng viết dạng ngoặc vuông có dấu ba chấm.
- **bundle.css lỗi đặc hiệu theme tối:** `[data-theme=dark] X:hover` (0,3,0) từng thắng `:disabled`/`:focus` (0,2,0) →
  ô tắt/đang focus đổi viền khi rê ở tối. DS không chép; **artifact bản 38 đã sửa** (hover loại trạng thái khác bằng
  `:not(:where(…))`), lyDo đã bỏ. Gặp lỗi đặc hiệu nguồn mới: ghi `lyDo` + gom đồng bộ ngược như cũ.


### Luật thêm từ lát 3 (Form)

- **Tên config so khớp** = tên component viết thường, KHÔNG gạch nối (`fileupload.json`, `daterangepicker.json`).
- **Preview gắn sẵn class `is-hover`/`is-focus`** → khoá đo trạng thái dùng `buoc` (rê / tab thật), không dùng
  `trangThai`. Phần tử không vẽ chữ (nguồn `<input>`, DS `<button>`: Switch, Checkbox, Radio) dùng `boChu: true`;
  cần hẹp hơn dùng `props`. Phần tử ẩn nhìn (input file 1px) đo qua `con` với `props` rút gọn.
- **Radix RovingFocus** (RadioGroup, sau này Tabs/ToggleGroup): item `tabIndex=-1` tới khi nhóm nhận focus → bước `tab`
  không nhảy thẳng tới được; bấm phần tử ngay trước rồi Tab thật, ghi `chuaDo`.
- **Đo sau khi đổi trạng thái bằng script phải chờ hết transition** (đa số 150ms), không thì đọc ra giá trị đầu.
- **Bo tròn:** dùng biến `--radius-full` (9999px của nguồn); utility tròn mặc định của Tailwind 4 ra `calc(infinity)`.
- **Preflight của app gắn viền cho cả `::before`/`::after`** → pseudo tự vẽ phải tắt viền như phần tử thường. Viền một
  cạnh trên div: tắt viền chung rồi viết riêng cạnh cần, không dùng utility viền cạnh kèm kiểu solid (làm cạnh khác
  thành solid).
- **Khối `/ds` là server component:** con đi qua ranh giới server → client thành phần tử lười → KHÔNG `cloneElement`
  lên children trong primitive (SSR 500). Hàng/khung truyền id cho con qua context (SwitchRow, ChoiceLabel). Không truyền
  hàm (`onClick`…) từ khối server vào client component.
- **Trạng thái chọn/bật tách hover theo `data-state`:** biến thể hover kèm `enabled:` có đặc hiệu cao hơn
  biến thể theo data-state và đè mất màu "bật".
- **Overlay focus thẳng vào phần tử bên trong khi mở** (Select, Calendar): mở bằng chuột Chrome vẫn tính là
  `:focus-visible` → dùng hook `use-mo-bang-chuot.ts` (gỡ khi có phím đầu tiên).
- **react-day-picker 10:** `stopPropagation` phím trong lưới → handler phím khung bọc dùng capture; `mode="range"` đánh
  dấu cả khoảng là selected → loại `range_middle` khỏi `data-selected`; `aria-selected` nằm ở `td` còn focus ở nút →
  `labelDayButton` tự viết phải đọc trạng thái ("đã chọn", "ngày bắt đầu"…).
- **cmdk 1.1.1:** mục sáng chỉ tính lại khi chữ ô tìm đổi → phải kiểm soát `value` (mục sáng) và tự gắn lại
  `aria-activedescendant` (xem `combobox.tsx`). Áp cho CommandPalette lát 6.
- **`selectTrigger` đã gộp sẵn qua `cn`** — dùng thô được; trigger có icon đầu thì giá trị `flex-1`.
- **Form:** `FormLayout` mặc định `noValidate`; lưu lỗi = `flushSync` bật cờ đã gửi rồi `focusLoiDau(form)`; câu trạng
  thái chân form `aria-live="polite"`. Vùng live phải có sẵn trước khi nội dung đổi; chữ cần được đọc lại thì đổi key.
- **Test:** jsdom không có jest-dom (dùng `getAttribute`/`textContent`); test có DsRoot/Tooltip phải mock
  `next/font/google`; tên/mô tả a11y kiểm bằng `getByRole(…, { name, description })`, KHÔNG import `dom-accessibility-api`
  (tsc TS7016). Repo không có config prettier → không chạy prettier. Test giờ VN: đặt `process.env.TZ` trong
  `vi.hoisted` (mẫu `date-picker.dom.test.tsx`).
- **Ô tiền `OTien`:** chỉ khi DÁN mới hiểu 1–2 chữ số sau dấu cuối là phần lẻ (làm tròn); khi gõ chỉ lấy chữ số.

- **Hằng/hàm thuần KHÔNG đặt trong file `'use client'`** (server component gọi sẽ lỗi "Attempted to call … from the
  server"): chuỗi class ở `*-styles.ts`/`button-variants.ts`, hàm ở `lib/`/`bang/`; file component re-export.
- **Trigger mở pop là nút thường** (Combobox, DatePicker, DateRangePicker): tên đọc = nhãn + giá trị qua
  `use-trigger-chon.ts`. FileDrop có `FieldLabel` → truyền id nhãn vào `aria-labelledby` (thắng `<label for>`).
- **Pop nổi lấy trần cao theo `--radix-popover-content-available-height`** (có dự phòng) + cuộn trong pop.
- **Trước khi "sửa" khoá cuộn/focus của Radix: đo bằng Chrome thật có đối chứng** (pop trong Dialog/Sheet cuộn được với
  radix-ui 1.8.1 — giữ Popover không modal). Focus của nút disabled/loading không tin jsdom.
- **Font:** Inter CHÍNH CHỦ (`components/ui/fonts/InterVariable.woff2`, rsms v4.1, OFL) qua next/font/local — bản Google
  Fonts cắt mất cv11/ss03. Test: `next/font/local` được mock chung trong `vitest.setup-dom.ts`.

### Luật thêm từ lát 4–6 (Điều hướng, Data view, Trang chi tiết, Phản hồi, Toàn app, Thông báo)

Ruling (20/11): **R8** không TanStack Table — sắp/lọc/phân trang chạy phía server trong `bang/`, trạng thái cột (thứ tự,
độ rộng, ẩn hiện) là hook `useCotBang`; kéo đổi chỗ cột + Kanban dùng dnd-kit cổ điển (`@dnd-kit/core` 6.3.1,
`sortable` 10.0.0, `utilities` 3.2.2; `@dnd-kit/react` còn 0.x). **R9** `bang/` vẫn chỉ import `react` + `next/navigation`
— DS bơm Select vào `BoLocChon`/`LocNgay` qua khe `OChon` của `CauHinh` (`CauHinhBangDs`); không bơm = `<select>` cũ.
**R10** `<Toaster>` (sonner 2.0.8) đặt TRONG `DsRoot` bởi layout, một cái mỗi trang. **R11** demo không PII, SĐT chỉ
`•••` + 4 số cuối. **R12** toast xong/đang chạy KHÔNG gắn `role="status"` (vùng `aria-live` của Sonner đã đọc), lỗi giữ
`role="alert"` — lệch README có chủ đích; toast lỗi còn nằm trong vùng polite của Sonner → có thể bị đọc hai lần trên
NVDA/JAWS (chưa thử máy đọc thật).

- **Tailwind 4: `outline-none` cùng `focus-visible:outline-2` vẫn ra `outline-style: none` → MẤT vòng focus.** Muốn vòng
  thì không reset, hoặc `[outline:none]` + `focus-visible:outline-solid`. jsdom không bắt — đo bằng Tab thật trên Chrome.
- **cmdk sống trên mặt nằm sẵn cuộn CẢ TRANG lúc mount** (`scrollIntoView` mục sáng). Mặt tĩnh của `/ds` dùng prop `tinh`
  (`CommandPanel`, `RecordPicker`, `ComboboxPanel`): cùng DOM/class, `inert`, không cmdk, ô tìm chỉ đọc. Test spy
  `Element.prototype.scrollIntoView`.
- **Esc và lựa chọn dòng:** `bang/ChonDong.tsx` nghe Esc ở `window` pha nổi (chặng cuối) và bỏ qua khi
  `defaultPrevented`. Mọi lớp xử lý Esc phải `preventDefault`: Radix DismissableLayer tự làm; lớp tự viết nghe `document`
  pha capture + `preventDefault` (`XemNhanh`); đang kéo (mọi cảm biến dnd-kit) dùng `useEscKhiKeo` (`tieu-de-cot.tsx`,
  đặt `data-dang-keo` trên body). **Không quét DOM tìm `role=menu/listbox/dialog` để đoán overlay mở** — DS có listbox/menu
  thường trực; muốn biết lớp Radix đang mở thì chỉ xét `[data-state=open|delayed-open|instant-open]` trong ô portal DS.
- **dnd-kit + Radix trigger:** dnd-kit bỏ qua `pointerdown` đã `preventDefault` → gọi listener của dnd TRƯỚC rồi mới chặn
  Radix. dnd-kit tự trả focus khi thả bằng phím, nhưng chuyển qua menu/hộp thoại thì phần tử cũ bị gỡ → tự focus thẻ mới
  (tìm trong ref của bảng, không `document.querySelector`). Kanban dùng `MouseSensor` (cảm ứng = cuộn ngang qua cột 82%,
  chuyển thẻ bằng nhấn giữ → "Chuyển sang…"). jsdom: DragOverlay đo con đầu tiên → mock `getBoundingClientRect`.
- **Tooltip bọc Trigger asChild đè `data-state`** của Toggle/PopoverTrigger → trạng thái bật/mở chỉ tin `aria-pressed` /
  `aria-checked` / `aria-expanded`. Radix Slot nối `aria-describedby` → tooltip trùng tên nút thì chữ tooltip `aria-hidden`.
  Trigger asChild đè `data-slot` của Button → chọn Button theo `data-variant`.
- **Câu trạng thái ("Đang tải…") nằm NGOÀI vùng `aria-busy`** (`VungDoc` ở `skeleton.tsx`); vùng live phải có sẵn trước
  khi chữ đổi → component client gắn rỗng rồi điền.
- **`sr-only` / phần tử `absolute` trong vùng `overflow` cuộn cần tổ tiên `relative` BÊN TRONG vùng đó** — thiếu thì cả
  trang tràn ngang mà không phần tử nhìn thấy nào lộ ra (gặp ở Kanban 390: scrollWidth 887). Đo `documentElement.scrollWidth`
  ở 390 cho mọi khối có vùng cuộn ngang.
- **Viền một cạnh:** `[border-style:none_none_solid] border-current border-b-(--border)` (cạnh trái
  `none_none_none_solid`); `border-solid` làm cạnh khác thành solid. `span` cũng dính preflight → `border-none border-current`.
  `tr:last-child` dính cả thead → `[tbody>tr:last-child>&]`.
- **Chrome bắn `focusout` khi gỡ phần tử đang focus, jsdom thì không** → logic "trả focus khi gỡ" phải thử Chrome thật.
  Radix Popper đo khung 0 trong jsdom → không bật `hideWhenDetached` (pop thành hidden trong test).
- **React Compiler lint (`react-hooks/*`, CI chạy `npm run lint` trên PR vào main):** không đọc/ghi `ref.current` trong
  render (đồng bộ ref bằng `useLayoutEffect`); ref không nằm chung object context với state (tách context riêng / callback
  ref); không gán thuộc tính lên giá trị lấy từ context; `eslint-disable-next-line` chỉ cho dương tính giả, kèm lý do.
  **Mỗi đợt chạy `npm run lint`**, không chỉ `tsc`.
- **Gọi `buttonVariants()` trực tiếp phải bọc `cn()`** (gap của base vs size). Class Tailwind không ghép bằng template
  string (tiền tố biến thể ghép từ biến thì không sinh CSS) — viết nguyên văn.
- **Sonner:** z gốc 999999999 → ghi đè 56; Sonner không cho đặt role lên `li` → `toast.custom` tự vẽ; dừng hẹn giờ khi focus
  phím = gọi lại `toast.custom(cùng id, duration Infinity)`; toast tự đẩy lên 124 / 236 (≤767) khi trong vùng DS có
  `.ds-thanh-hang-loat` (`:has`); test: tua đồng hồ từng nhịp 50ms mỗi nhịp một `act`, `thongBao.dong()` trong `afterEach`.
- **Table hai vẻ:** `variant="du-lieu"` (mặc định, `.b-bang` của prototype) và `"thuong"` (`.ui-table` — bảng thường như
  NotificationMatrix). Thanh cuộn trong `TableWrap` ẩn (README Table).
- **Ngoại lệ Sheet không `SheetHeader`:** ngăn kéo menu Sidebar (điện thoại) — nút "Đóng menu" (`SheetClose`,
  `data-autofocus`) nằm trong đầu panel, tên hộp là `SheetTitle` sr-only; thêm header + ✕ thành hai nút đóng. Sheet có
  `side="left"`.
- **Cổng so khớp:** lỗi chạy (mã 2) ghi đè `<C>.md` đã commit bằng ghi chú lỗi → chạy lại tới thoát 0 rồi `git diff` trước
  commit. Mỗi lượt nạp chờ sự kiện tải của đúng loader Chrome, rồi chờ dấu hydrate của DsRoot trước khi đo hoặc bấm.
  Khoá có `buoc` dồn cuối config vì mỗi khoá nạp lại trang. Phím Enter qua CDP cần gửi ký tự xuống dòng.
  Chụp và đo với `mobile: false`. Đo focus item RovingFocus: `bam` item rồi một phím không di chuyển (bấm link `#neo` làm mất focus). Vùng
  `overflow-x:auto` cắt vòng focus con → đệm + lề âm. `artifactThat` chạy mọi bước ở cả hai bên — bước chỉ DS dùng
  `{ artifact, ds }`. Mỗi task/agent một thư mục con scratchpad riêng.

### Lát 7 và đợt chuyển sang khung shadcn

- **R13 (thay quyết định 17:30):** A4 đặt lịch trên, ô ngày và giờ bên dưới. Chỉ chọn ngày lưu `YYYY-MM-DD`.
  Chỉ có giờ khi người dùng chọn, khi giá trị cũ có giờ hoặc khi bên gọi truyền `gioMacDinh`. Xoá giờ giữ lại ngày.
  Xong hoặc Enter hợp lệ mới lưu nháp. Huỷ, Esc ngoài danh sách giờ và bấm ngoài bỏ nháp. Xoá cả hạn có hiệu lực ngay.
- **R14:** menu con dùng collision của Radix, giới hạn rộng theo khung nhìn. Mở menu con kiểu thay chỗ menu cha trên điện thoại còn mở.
- **R15:** phím tắt theo vùng dùng `lib/phim-tat.ts`. Bỏ qua ô nhập, `contenteditable`, phím bổ trợ và bộ gõ đang ghép.
- **R16:** `bang/ChonDong.tsx` quản lý Ctrl/⇧ + bấm chọn dòng. Table vẽ dòng đang trỏ. Menu thuộc tính dùng phím tắt theo
  dòng, hiển thị số dòng đang chọn và cho Hoàn tác sau khi cập nhật.
- **R17:** `TimeInput` hỗ trợ giờ 24h, gợi ý và phím ↑/↓. Esc ở danh sách phục hồi giờ trước lần gõ. Xử lý ở sự kiện Esc
  của lớp Popover vì Radix chặn sự kiện trước khi ô nhập nhận nó. DateTimePicker chỉ chốt Enter do TimeInput xác nhận.
  Khi thiếu chiều cao, vùng lịch cuộn và hàng nhập cùng chân pop vẫn thấy. Gợi ý giờ mở phía trên ô để chừa Huỷ và Xong.
- **R18:** dùng shadcn `new-york-v4` nhánh Radix, commit `45bbf9b`. Gán token DS sau khi chép khung.
- **R19:** ưu tiên `variant` và `size` theo shadcn. Giữ nguyên tên export, prop và `data-slot` gốc. `color` và các phần mở rộng
  nghiệp vụ là phần GWT thêm. Menu giả lập tìm kiếm, Kbd, phím tắt và hành vi dùng chung của DropdownMenu, ContextMenu,
  Menubar nằm ở `menu-them.tsx`. Dialog và Sheet dùng `showCloseButton` cho nút ✕.
- **R20:** Tooltip export Provider, Root, Trigger, Content. `DsRoot` cung cấp Provider mặc định, `TooltipNhanh` ghép sẵn cho
  nút có mô tả. Trigger asChild có thể thay `data-slot` của nút, dùng `aria-*` cho trạng thái.
- **R21:** Combobox giữ cmdk. RecordPicker ghép từ Command của DS. Form tiếp tục dùng FormLayout và server action đến khi có
  màn cần xét lại.
- **R22:** tên file theo shadcn, tên khối và cổng giữ tên artifact (InputAffix, Toast, EmptyState). Nhãn Menu thuộc tính
  tách khỏi khoá README và neo `#menu-thuoc-tinh`.
- **R23:** chuyển các chỗ gọi trong `components/ui`, `app/ds` và `app/prototype` cùng đợt.

- **Căn hàng bảng:** căn checkbox con trực tiếp của ô ở Table, cả Checkbox DS và ô chọn từ `bang/`. Ô đã bọc flex chỉ cần
  bỏ độ dời dọc. Checkbox dùng với ChoiceLabel giữ căn riêng của nó. Đo tâm từng phần tử nhìn thấy so với tâm nội dung
  của hàng (trừ viền phân cách), ngưỡng 0,5px đối với hàng một dòng.
- **CSS chuyển động:** đặt keyframes dùng chung trong `ds/chuyen-dong.css` vì Tailwind chỉ phát biến animation khi quét thấy
  utility. `ds/theme.css` chỉ chứa màu, có test khoá nội dung.

### Đang mở

- ~~Đồng bộ README, preview cho component mới lên artifact~~ — xong bản 48 (23/11). Script chụp preview chưa đưa vào `ds/`.
- Chốt token biểu đồ `--chart-1` đến `--chart-5`, Combobox Base UI, Form dùng react-hook-form và zod, menu con kiểu drill-in.

## Tương phản — chấp nhận có chủ đích

Giữ y màu nguồn ChatGPT; 4 cặp dưới WCAG (danger chữ tối 3.52, viền input 1.42/2.28, viền Checkbox 1.6, chữ Badge
3.81–4.39) là chấp nhận có chủ đích — CEO 19/11. Không "sửa giùm" trong `tokens.css`.

## Cập nhật khi artifact đổi

1. Chép bản mới vào `nguon/` bằng `cp` (giữ nguyên byte — đừng ghi qua Python/Node chế độ chữ: trên Windows LF thành
   CRLF), ghi số bản + sha256 mới vào bảng trên (`sha256sum nguon/tokens.json nguon/tokens.css nguon/bundle.css
   nguon/components/*/preview.html`; đo cả ở nguồn trước khi chép, hai bên phải trùng).
2. Sửa số bản trong dòng đầu `sinh-token.mjs` (hằng `DAU`), rồi chạy script (cwd `apps/web`):
   `node ds/sinh-token.mjs` → ghi đè `ds/tokens.css`.
3. Chạy so khớp: `npm run test -- ds/sinh-token` (mỗi màu trong `tokens.json` có mặt đúng giá trị; `tokens.css` = đầu ra
   script).
