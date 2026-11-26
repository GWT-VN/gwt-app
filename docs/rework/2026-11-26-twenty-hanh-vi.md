# Twenty CRM — HÀNH VI data view (bảng · lọc/sắp · kanban · cột)

Nguồn: `twentyhq/twenty` commit `63ba48a` (AGPL-3.0). Chỉ mô tả hành vi, không chép code.
Ký hiệu đường dẫn: `fm/` = `packages/twenty-front/src/modules/`, `sh/` = `packages/twenty-shared/src/`.
"không tìm thấy" = đã tìm trong phần code đã checkout mà không thấy.

## 0. Nền chung (áp mọi mục)

| Hành vi | Chi tiết | Nguồn |
|---|---|---|
| Thư viện kéo thả | `@dnd-kit/react`; sensor = Pointer + **Keyboard** (kéo bằng bàn phím có sẵn) | `fm/ui/utilities/drag-and-drop/constants/DndKitSensors.ts` |
| Ngưỡng kích hoạt kéo | Chuột/bút: rê **8px** mới thành kéo (dưới 8px vẫn là click → mở record/link). Cảm ứng: giữ **250ms**, xê dịch ≤ **5px** (để vuốt vẫn cuộn được) | `fm/ui/utilities/drag-and-drop/utils/getDragActivationConstraints.ts` |
| Vùng không khởi kéo | input/select/textarea/button đang bật, contenteditable, phần tử gắn `data-dnd-drag-disable` (vd tay nắm resize). **Link KHÔNG bị loại** — cả thẻ vẫn kéo được | `fm/ui/utilities/drag-and-drop/utils/shouldPreventDragActivation.ts` |
| Vạch chỉ chỗ thả | Vạch xanh **2px**, bo nhỏ, hiện + scale 0.7→1 trong **120ms**; vùng đích tô nền xanh nhạt khi đang rê qua. Dọc cho cột, ngang cho thẻ/hàng | `fm/ui/utilities/drag-and-drop/components/DragDropItemDropTarget.tsx` |
| Thả | Tắt animation thả (không "bay về chỗ") | `.../constants/DndKitProviderPluginsWithoutDropAnimation.ts` (dùng ở mọi provider) |
| Ai được LƯU vào view | Có quyền `VIEWS` → lưu mọi view; không có → chỉ lưu view riêng (`isPrivate`) | `fm/views/hooks/useCanPersistViewChanges.ts` |
| View mặc định (key `INDEX`) | Không đổi được sang Kanban/Calendar, không Group, không xoá; đổi lọc/sắp chỉ có "Save as new view" | `fm/object-record/object-options-dropdown/components/ObjectOptionsDropdownLayoutContent.tsx`, `...CustomView.tsx`, `fm/views/components/UpdateViewButtonGroup.tsx` |

### Cái gì lưu ngay vs tạm (quan trọng nhất)

| Thao tác | Lưu vào view | Nguồn |
|---|---|---|
| Kéo đổi thứ tự cột, ẩn/hiện cột, thêm cột, đổi độ rộng | **Lưu NGAY** (gọi save view fields, không qua nút "Update view") | `useRecordTableHeaderDndKit.ts`, `useResizeTableHeader.ts`, `fm/object-record/record-field/hooks/useChangeRecordFieldVisibility.ts` |
| Ẩn/hiện/sắp nhóm kanban, ẩn nhóm rỗng, aggregate, compact, độ rộng cột kanban | **Lưu NGAY** | `fm/object-record/record-group/hooks/useRecordGroupVisibility.ts`, `useReorderRecordGroups.ts`, `fm/views/hooks/useUpdateViewAggregate.ts`, `useUpdateViewKanbanColumnWidth.ts` |
| Lọc, sắp xếp, tìm mọi trường, advanced filter | **TẠM** — áp ngay lên dữ liệu, view chưa đổi; hiện "Reset" + "Update view"/"Save as new view" | `fm/views/components/ViewBarDetails.tsx`, `UpdateViewButtonGroup.tsx` |
| Kéo record (hàng/thẻ) | Ghi thẳng vào **record** (`position`, trường group) — không phải view | `fm/object-record/record-drag/hooks/*` |

---

## 1. Kéo thả

### 1a. Đổi thứ tự cột bảng (kéo header)
- **Điểm vào:** kéo chính ô header cột (cả ô là vùng kéo). `fm/object-record/record-table/record-table-header/components/RecordTableHeaderDnd.tsx`
- **Luồng:** ấn-rê ≥8px → header đi theo trục X (`restrictMovementTo="x"`) → giữa mọi cặp cột có slot đích dọc, slot gần con trỏ sáng vạch xanh → thả → đổi vị trí → lưu view field ngay. `.../dnd/hooks/useRecordTableHeaderDndKit.ts`
- **Cột đầu (label identifier):** bị loại khỏi danh sách kéo (`visibleRecordFields.slice(1)`) → không kéo được, không thả được vào trước nó. Cùng file trên.
- **Disabled:** khi header ở chế độ chỉ đọc (`isRecordTableColumnHeadersReadOnly`). `RecordTableHeaderDnd.tsx`
- **Huỷ:** Esc/thả ngoài → không đổi (`event.canceled`). Trong lúc kéo tắt drag-select vùng chọn ô.
- **Bàn phím:** có (KeyboardSensor chung). Thay thế: menu header "Move left/Right" (mục 4).

### 1b. Đổi độ rộng cột
- **Tay nắm:** dải **10px** ở mép cột, `cursor: col-resize`, `role="separator"`; lúc đang kéo hiện vạch xanh **2px**. `fm/object-record/record-index/components/RecordColumnResizeHandle.tsx`
- **Min width = 104px** (cả cột đầu); mobile cột đầu min **180px**. `fm/object-record/record-table/constants/RecordTableColumnMinWidth.ts`
- **Luồng:** pointerdown → xoá chọn record → rê: cập nhật CSS variable độ rộng tức thì (không re-render), cột trống cuối co/giãn bù; kéo dưới 104 thì dừng cập nhật → nhả: làm tròn, `max(width,104)`, nếu khác cũ → lưu view field `size`. `.../record-table-header/hooks/useResizeTableHeader.ts`
- Hỗ trợ RTL + UI zoom (offset tính theo zoom). Cùng file.
- **Disabled trên mobile.** `RecordTableHeaderResizeHandler.tsx`
- Double-click để auto-fit: **không tìm thấy**. Resize bằng bàn phím: **không tìm thấy**.
- Cột drag-handle hàng rộng **12px**. `fm/object-record/record-table/constants/RecordTableColumnDragAndDropWidth.ts`

### 1c. Kéo hàng (đổi thứ tự record)
- **Có.** Tay nắm grip ở cột trái cùng; icon ẩn (`opacity 0`), hiện khi hover hàng (0.1s), luôn hiện khi đang kéo; `cursor: grab`. `fm/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop.tsx`
- **Kéo nhiều:** kéo một hàng đang được chọn (≥2 hàng chọn) → kéo cả nhóm chọn; overlay có chip đếm số. `fm/object-record/record-drag/hooks/useStartRecordDrag.ts`, `components/RecordDragMultiDragCounterChip.tsx`
- **Thả:** tính `position` mới (số thực chen giữa 2 hàng; thả cuối danh sách → sau hàng cuối; danh sách rỗng → 1,2,3…) rồi `updateOneRecord({position})` từng record. `record-drag/utils/computeDroppedRecordPositions.ts`, `hooks/useProcessRecordWithoutGroupDrop.ts`
- **Đang có sort:** không cho thả → mở hộp thoại "Remove sorting? — This is required to enable manual row reordering." [Remove Sorting] → xoá mọi sort. `fm/object-record/record-index/components/RecordIndexRemoveSortingModal.tsx`
- Bảng có group (sections) → kéo sang nhóm khác = đổi giá trị trường group. `record-drag/hooks/useProcessRecordGroupDrop.ts`
- Vùng thả sau record cuối riêng (`RecordDragEndDropZone`) để thả "xuống đáy" được. `record-drag/components/RecordDragEndDropZone.tsx`

### 1d. Kéo thẻ kanban (giữa cột & trong cột)
- **Điểm vào:** kéo cả thẻ (không cần tay nắm). Disabled khi ô board không sửa được hoặc trường group chỉ đọc. `fm/object-record/record-board/record-board-card/components/RecordBoardCardContextProvider.tsx`
- **Hiển thị:** thẻ gốc mờ, overlay theo con trỏ; kéo nhiều → overlay xếp chồng + chip số. Vạch xanh ngang giữa các thẻ chỉ chỗ thả. `RecordBoardCard.tsx`, `RecordBoardCardDragOverlayContent.tsx`, `record-board-column/components/RecordBoardColumnCardsContainer.tsx`
- **Ghi gì:** trường group (`select`/relation) = giá trị cột đích + `position` mới. `record-drag/hooks/useUpdateDroppedRecordOnBoard.ts`
- **Optimistic:** cập nhật store cục bộ (gỡ id khỏi cột cũ, chèn vào cột mới theo `position`, upsert record) TRƯỚC khi gọi mutation. Cờ "đang xử lý drop" giữ thêm **500ms** debounce để chặn race khi kéo liên tục. Cùng file + `useProcessBoardCardDrop.ts`.
- **Có sort:** sang cột KHÁC vẫn được (chỉ đổi trường group, không ghi position); đổi thứ tự TRONG cột → hộp thoại "Remove sorting?". `useProcessBoardCardDrop.ts`
- Thả cùng chỗ → không gọi gì.

### 1e. Đổi thứ tự cột kanban
- **Có.** Tay nắm = cả header cột (disabled nếu settings view chỉ đọc). `record-board-column/components/RecordBoardColumnHeader.tsx`
- Thả → `position` của view group, lưu view groups ngay. `fm/object-record/record-group/hooks/useReorderRecordGroups.ts`
- Nếu nhóm đang sort Alphabetical/Reverse → hộp thoại "Group sorting — Would you like to remove {X} group sorting?" [Remove] → chuyển `Manual` rồi mới đổi. `record-board-column/dnd/hooks/useRecordBoardColumnDndKit.ts`, `fm/object-record/record-group/components/RecordGroupReorderConfirmationModal.tsx`, `types/RecordGroupSort.ts`
- Thay thế không kéo: menu cột "Move left/Move right" (menu giữ mở sau khi bấm). `record-group/hooks/useRecordGroupActions.ts`
- Cũng kéo được trong Options → Group → "Visible groups". `object-options-dropdown/components/ObjectOptionsDropdownRecordGroupsContent.tsx`

### 1f. Kéo trong danh sách "Fields" (Options)
- Hàng cột đầu (label identifier) luôn đứng trên cùng, **mờ, có grip nhưng không kéo được**. `fm/views/components/ViewFieldsVisibleDropdownSection.tsx`
- Các trường hiển thị còn lại: grip luôn hiện, kéo đổi thứ tự = đổi thứ tự cột bảng / thứ tự trường trên thẻ kanban; lưu ngay. Cùng file, `object-options-dropdown/hooks/useProcessOptionDropdownDragEnd.ts`, `useObjectOptionsForBoard.ts`
- Cùng dnd-kit + KeyboardSensor. `fm/ui/layout/draggable-list/components/DraggableList.tsx`

---

## 2. Lọc + sắp xếp

### 2a. Thanh công cụ
- Hàng trên phải: **Filter** · **Sort** · **Options**. Hàng dưới (ViewBarDetails) chỉ hiện khi có sort/filter/tìm kiếm hoặc có thay đổi chưa lưu. `fm/views/components/ViewBar.tsx`, `ViewBarDetails.tsx`
- Hàng dưới, trái→phải: chip "Deleted" (nếu xem thùng rác) | chip sort … | vạch ngăn | chip "Any field" | chip advanced filter | chip filter … | nút **+ Add filter**. Phải: **Reset** (link mờ) + **Update view ▾** (view tuỳ biến; ▾ có "Create view") hoặc **Save as new view** (view mặc định). `ViewBarDetails.tsx`, `UpdateViewButtonGroup.tsx`
- "Reset" = trả filter, sort, filter group, any-field về đúng view đã lưu. Ẩn Reset/Update khi URL đang mang filter (`hasFiltersQueryParams`). `ViewBarDetails.tsx`
- "Save as new view"/"Create view" → mở view picker ở chế độ "create-from-current" (nhập tên, mang theo lọc/sắp hiện tại). `UpdateViewButtonGroup.tsx`
- "Update view" disabled khi không có quyền lưu.

### 2b. Luồng thêm filter
1. Bấm **Filter** → popover rộng ExtraLarge: tiêu đề "Filter" + nút X, ô **Search fields**, nhóm **Visible fields** / **Hidden fields** (trường hiện trong view lên trước), đáy: **Search any field** + **Advanced filter**. `fm/views/components/ViewBarFilterDropdownFieldSelectMenu.tsx`, `ViewBarFilterDropdownBottomMenu.tsx`
2. Chọn trường → chuyển trang nhập: ô chọn operand (dropdown trong) + vạch + ô giá trị theo kiểu. Operand mặc định = operand ĐẦU danh sách (bảng dưới). `fm/views/hooks/useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown.ts`, `fm/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput.tsx`
3. Trường đã có filter đơn → mở lại filter đó (không tạo trùng). Cùng hook.
4. Gõ/chọn → filter áp NGAY (text: mỗi phím; select: mỗi tick). Enter ở ô text = đóng. Debounce gõ: **không tìm thấy** ở frontend. `ObjectFilterDropdownTextInput.tsx`
5. Đóng/click ra ngoài khi giá trị rỗng → filter bị gỡ. `fm/views/components/ViewBarFilterDropdown.tsx`, `fm/object-record/record-filter/utils/isRecordFilterConsideredEmpty.ts`
- Operand không cần giá trị (Is empty, Is not empty, Is in past/future, Is today) → chỉ hiện ô operand. `ObjectFilterDropdownFilterInput.tsx`

### 2c. Operand theo kiểu trường (`sh/utils/filter/utils/filterOperandsMap.ts`, `compositeFieldFilterOperandsMap.ts`)

| Kiểu | Operand (thứ tự = thứ tự menu; đầu = mặc định) | Ô giá trị |
|---|---|---|
| TEXT | Contains · Doesn't contain · Is · Is not · Is empty · Is not empty | text |
| EMAILS, PHONES, LINKS, FULL_NAME, ADDRESS, FILES, RAW_JSON, ARRAY | Contains · Doesn't contain · Is empty · Is not empty | text |
| NUMBER | Is · Is not · ≥ · ≤ · empty · not empty | number |
| CURRENCY (số tiền) | ≥ · ≤ · Is · Is not · empty · not empty | number; mã tiền tệ: Is · Is not · empty… |
| RATING | Is · Is not · ≥ · ≤ · empty · not empty | rating |
| DATE / DATE_TIME | Is · Is relative · Is in past · Is in future · Is today · Is before · Is after (nhãn "Is after or equal") · empty · not empty | date picker / relative |
| SELECT | Is · Is not · empty · not empty | tìm + **multi-tick** option |
| MULTI_SELECT | Contains · Doesn't contain · empty · not empty | tìm + multi-tick |
| RELATION | Is · Is not · empty · not empty | tìm + multi-tick record, mục ghim **"Me"** (người đang đăng nhập) |
| ACTOR (Created by) | Contains · Doesn't contain · empty…; sub-field source/member: Is · Is not · empty… | text / chọn |
| BOOLEAN | Is (duy nhất) | True / False |
| UUID | Is · Is not · empty · not empty | — |

- Ngày tương đối: hướng **PAST / THIS / NEXT** × số nguyên dương × đơn vị SECOND…YEAR (DAY, WEEK, MONTH, QUARTER, YEAR); mặc định "This day". Hiển thị kiểu "Past 3 days", "This week". `sh/utils/filter/dates/utils/relativeDate*Schema.ts`, `sh/constants/DefaultRelativeDateFilterValue.ts`, `fm/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue.ts`
- Advanced filter: ngày mặc định **Is relative**. `fm/object-record/advanced-filter/utils/getDefaultAdvancedFilterOperand.ts`

### 2d. Chip filter
- Nhãn = `Tên trường` + operand rút gọn + giá trị: `: ` (Is/Contains), `: Not`, `: Empty`, `: NotEmpty`, ` ≥ `, ` ≤ `, ` < ` (before), `: Past`, `: Future`, `: Today`. `fm/object-record/object-filter-dropdown/utils/getOperandLabel.ts`
- Nhiều giá trị: >3 option → "N options"; >3 record → "N {đối tượng}"; ngược lại nối bằng ", ". `ObjectFilterDropdownOptionSelect.tsx`, `ObjectFilterDropdownRecordSelect.tsx`, `sh/constants/FieldMetadataMaxOptionsToDisplay.ts`
- Bấm chip → mở lại đúng popover nhập (đổi operand/giá trị); nút X trên chip → gỡ. Đóng khi rỗng → gỡ. `fm/views/editable-chip/components/EditableFilterDropdownButton.tsx`
- Danh sách record trong ô relation tải **10**. `ObjectFilterDropdownRecordSelect.tsx`
- Menu header cột → **Filter** = mở chip filter của trường đó. `fm/object-record/record-table/record-table-header/components/RecordTableColumnHeadDropdownMenu.tsx`

### 2e. Advanced filter (AND/OR)
- Điểm vào: đáy popover Filter → "Advanced filter". Lần đầu tạo 1 group gốc + 1 rule mặc định trên trường tiêu đề. `fm/views/components/ViewBarFilterDropdownAdvancedFilterButton.tsx`
- Một chip "advanced" trên thanh; mở panel rộng **650px**. `fm/object-record/advanced-filter/constants/AdvancedFilterDropdownContentWidth.ts`
- Mỗi hàng: cột trái = "Where" (hàng 0) / dropdown **And|Or** (hàng 1, đổi cho cả nhóm) / chữ tĩnh And/Or (hàng ≥2) → một nhóm chỉ một toán tử. `AdvancedFilterLogicalOperatorCell.tsx`, `constants/AdvancedFilterLogicalOperatorOptions.ts`
- Nút "Add filter rule" (gốc) → Add rule | **Add rule group**. Trong group con chỉ còn "Add rule" → **lồng tối đa 2 tầng**. `AdvancedFilterAddFilterRuleSelect.tsx`
- Menu ⋯ mỗi rule: "Remove rule"; mỗi group: "Remove rule group". `AdvancedFilterRecordFilterOptionsDropdown.tsx`, `AdvancedFilterRecordFilterGroupOptionsDropdown.tsx`
- Filter đơn (chip thường) và advanced cùng tồn tại; chip thường = filter không thuộc group. `ViewBarDetails.tsx`

### 2f. Sắp xếp
- **Sort** → popover: tiêu đề + X, ô chọn chiều **Ascending/Descending** (đặt TRƯỚC khi chọn trường), Search fields, Visible fields / Hidden fields. Chọn trường → thêm sort với chiều đã chọn, đóng popover. `fm/object-record/object-sort-dropdown/components/ObjectSortDropdownButton.tsx`
- **Nhiều sort:** có — thêm nối đuôi; trường đã có sort thì cập nhật tại chỗ. `fm/object-record/record-sort/hooks/useUpsertRecordSort.ts`
- Chip sort: icon ↑/↓; **bấm chip = đảo chiều**; X = gỡ. Trường ghép (vd Full name) bấm chip → chọn sub-field. `fm/views/editable-chip/components/EditableSortChip.tsx`
- Menu header cột → **Sort**: THAY toàn bộ sort bằng một sort trên cột đó; bấm lại = đảo ASC↔DESC. `fm/object-record/record-index/hooks/useHandleToggleColumnSort.ts`
- Sort đang bật chặn kéo tay (xem 1c/1d).

### 2g. Tìm kiếm
- Không có ô search luôn hiện; vào qua Filter → "Search any field" → ô "Search any field" tự focus, áp ngay mỗi phím, hiện chip "Any field: …"; lưu vào view được như filter. `fm/views/components/ViewBarFilterDropdownAnyFieldSearchButtonMenuItem.tsx`, `fm/object-record/object-filter-dropdown/components/ObjectFilterDropdownAnyFieldSearchInput.tsx`, `fm/views/components/AnyFieldSearchChip.tsx`, `fm/views/hooks/useSaveAnyFieldFilterToView.ts`
- Phím tắt mở tìm: **không tìm thấy** trong phần đã đọc.

### 2h. Bàn phím (lọc/sắp)
- Danh sách trường trong popover Filter là `SelectableList` (↑/↓ + Enter). Ô text: Enter đóng. `ViewBarFilterDropdownFieldSelectMenu.tsx`, `ObjectFilterDropdownTextInput.tsx`

### 2i. State rỗng
- Lọc không ra: "No {object} found — No records matching the filter criteria were found." + nút "Add a {object}". Không có quyền tạo: "No records found". `fm/object-record/record-index/components/RecordIndexEmptyState.tsx`
- Tìm trường không ra: "No results"; advanced: "No fields found".

---

## 3. Kanban (record board)

### 3a. Group by
- Chỉ group được theo **SELECT** hoặc **relation many-to-one** (không phải formula). MULTI_SELECT/boolean/date: không. `fm/object-record/record-group/utils/canGroupRecordsByFieldMetadataItem.ts`
- Kanban luôn phải có group; "None" chỉ cho Table/List. `record-group/utils/isRecordGroupingOptionalForViewType.ts`
- Options → Layout → Kanban (không có ở view mặc định); chưa có trường select → mục "Create Select…". Options → Group → **Group by** (tìm trường, "Create select field"). `object-options-dropdown/components/ObjectOptionsDropdownLayoutContent.tsx`, `ObjectOptionsDropdownRecordGroupFieldsContent.tsx`
- Group theo relation → thêm được "New group" (chọn record làm cột). `ObjectOptionsDropdownRecordGroupsContent.tsx`, `record-group/utils/canAddRecordGroupForFieldMetadataItem.ts`

### 3b. Cột
- Rộng mặc định **200px**, kéo chỉnh **150–400px**, lưu vào view. `fm/object-record/record-board/constants/RecordBoardColumn{Width,MinWidth,MaxWidth}.ts`, `record-board-column/hooks/useResizeBoardColumn.ts`
- Header: chip màu option (Tag màu = màu option select; relation/No value = trong suốt, chữ medium) + nút aggregate. `record-group/components/RecordGroupChip.tsx`
- Hover/focus header (hoặc menu đang mở) → hiện trượt **⋮ More options** và **+ Add new** (+ tạo record ở **đầu** cột, gán sẵn giá trị cột; ẩn nếu không có quyền tạo hoặc đang xem thùng rác). `record-board-column/components/RecordBoardColumnHeader.tsx`
- Bấm chip tên cột / ⋮ → menu: **Edit** (sang settings trường, chỉ người có quyền Data model) · **Move right** · **Move left** · **Hide**. `record-group/hooks/useRecordGroupActions.ts`
- Đáy cột: nút **"New"** → tạo record ở **cuối** cột. `record-board-column/components/RecordBoardColumnNewRecordButton.tsx`
- Tải **10** thẻ/trang, cuộn tới gần đáy tự tải thêm; skeleton 10 thẻ khi loading. `record-board/constants/RecordBoardQueryPageSize.ts`, `components/RecordBoardFetchMoreInViewTriggerComponent.tsx`

### 3c. Nhóm "No Value" & nhóm ẩn
- Có cột **"No Value"** (record trường group rỗng) — với select chỉ khi trường cho phép null. `fm/views/utils/mapViewGroupsToRecordGroupDefinitions.ts`
- Ẩn nhóm: menu cột → Hide, hoặc mắt trong Options → Group → "Visible groups". Nhóm ẩn KHÔNG thành cột trên board; nằm ở Options → Group → **"Hidden {tên trường}"** → trang liệt kê + mắt để hiện lại + "Edit field values". `ObjectOptionsDropdownHiddenRecordGroupsContent.tsx`, `record-group/components/RecordGroupVisibilityRow.tsx`
- **"Hide empty groups"** (toggle, lưu view). `ObjectOptionsDropdownRecordGroupsContent.tsx`, `record-group/hooks/useShouldHideRecordGroup.ts`
- Group **Sort**: Manual / Alphabetical / Reverse alphabetical (không có ở view mặc định). `record-group/types/RecordGroupSort.ts`
- **Load limit** mỗi nhóm: 8 / 25 / 50 / 100. `sh/constants/ViewGroupLoadLimitOptions.ts`

### 3d. Aggregate cột
- Nút cạnh tên cột hiện giá trị; menu chia: Count / Percent / Date / More options. Count áp ngay; phép khác → chọn trường. **Một phép cho cả board**, lưu vào view (`kanbanAggregateOperation` + field). `fm/object-record/record-group/components/RecordGroupAggregateDropdownContent.tsx`, `...OptionsContent.tsx`
- Phép có: COUNT, COUNT_EMPTY, COUNT_NOT_EMPTY, COUNT_UNIQUE_VALUES, COUNT_TRUE/FALSE, PERCENTAGE_EMPTY/NOT_EMPTY, EARLIEST/LATEST, MIN/MAX/AVG/SUM (theo kiểu trường). `fm/object-record/record-table/record-table-footer/constants/*AggregateOperationOptions.ts`

### 3e. Thẻ
- **Đầu thẻ:** chip tên record (label identifier) — bấm mở record (side panel hoặc trang, theo cài đặt; mouse-down để mở nhanh khi mở trang). Checkbox chọn (ẩn trên mobile; **Shift+click = chọn dải**). `record-board-card/components/RecordBoardCardHeader.tsx`
- **Thân thẻ:** mọi trường **visible** của view trừ label identifier, theo thứ tự view; mỗi dòng = **icon trường + giá trị** (tên trường nằm trong tooltip của icon, không hiện chữ nhãn); giá trị rộng tối đa **156px**; sửa inline tại chỗ. `RecordBoardCardBody.tsx`, `fm/object-record/record-inline-cell/components/RecordInlineCellContainer.tsx`
- **Trường rỗng KHÔNG ẩn**: hiện tên trường màu mờ làm placeholder. `record-inline-cell/components/RecordInlineCellDisplayMode.tsx`
- Trường bị giới hạn quyền → hiện dạng forbidden, chỉ đọc. `RecordBoardCardBody.tsx`
- Giới hạn số trường trên thẻ: **không tìm thấy** (theo số trường visible).
- **Compact view** (Options → Layout, lưu view `isCompact`): thẻ chỉ còn đầu; nút 👁 mở/thu từng thẻ; rời chuột **800ms** tự thu lại. `RecordBoardCard.tsx`, `RecordBoardCardHeader.tsx`
- Click thân thẻ → mở record; chuột phải → menu ngữ cảnh record. `RecordBoardCard.tsx`
- State thẻ: selected / focused / active (data-attr); đang kéo-nhiều → thẻ phụ mờ.

### 3f. Bàn phím board
- Mũi tên ←↑↓→ di chuyển focus thẻ; **x** chọn, **Shift+x** chọn dải; **Enter / Ctrl/Cmd+Enter** mở side panel; **Esc** bỏ focus + bỏ chọn; **Ctrl/Cmd+A** chọn hết. `fm/object-record/record-board/hooks/useRecordBoardCardHotkeys.ts`, `useRecordBoardArrowKeysEffect.ts`, `useRecordBoardSelectAllHotkeys.ts`
- Bảng: ↑/k, ↓/j di chuyển hàng; Ctrl/Cmd+A chọn hết. `fm/object-record/record-table/hooks/useRecordTableRowFocusHotkeys.ts`

---

## 4. Ẩn/hiện & thêm cột

### 4a. Nút "+" cuối header
- Ẩn nếu header chỉ đọc (thay bằng cột trống). `RecordTableHeaderDnd.tsx`
- Popover rộng ExtraLarge: ô **Search fields** (chỉ hiện khi còn trường để thêm) · vạch · danh sách trường **đang ẩn** (icon + tên, sắp A→Z, lọc không phân biệt hoa thường) chia mục **Fields / Belongs to / Has many** · vạch · **Customize fields** (⚙, sang trang settings đối tượng, nhớ URL để quay lại). Rỗng: "No results" hoặc "All fields are already visible". `fm/object-record/record-table/record-table-header/components/RecordTableHeaderPlusButtonContent.tsx`
- Chọn trường → hiện cột, đặt **cuối** (position = max+1), lưu view ngay. `fm/object-record/record-field/hooks/useChangeRecordFieldVisibility.ts`
- Relation many-to-one / one-to-many có trang con: cột lookup ("Belongs to → trường của bản ghi liên kết") hoặc cột tóm tắt ("Has many"). Cùng file.

### 4b. Menu header cột (bấm vào header)
Thứ tự: **Filter** · **Sort** · (vạch) · **Move left** · **Move right** · **Hide** · (Delete column / Edit summary column… cho cột phái sinh). `RecordTableColumnHeadDropdownMenu.tsx`
- Move left ẩn ở cột ngay sau cột đầu; Move right ẩn ở cột cuối.
- Filter/Sort chỉ khi trường lọc/sắp được.
- **Freeze/pin cột: không tìm thấy** (cột đầu luôn dính trái sẵn — `fm/object-record/record-table/components/RecordTableStyleWrapper.tsx`).
- Sort asc/desc riêng: không — chỉ một mục "Sort" bật/đảo (2f).

### 4c. Options → Fields
- Header "‹ Fields", ô Search fields (gõ → chuyển sang danh sách kết quả phẳng). Không gõ: mục visible (cột đầu mờ, khoá ở trên; còn lại có grip + nút 👁‑gạch "Hide field") · vạch · **Hidden Fields ›** → trang con: các trường ẩn + nút 👁 "Show field" + "Edit Fields" (sang settings). `fm/object-record/object-options-dropdown/components/ObjectOptionsDropdownFieldsContent.tsx`, `fm/views/components/ViewFieldsVisibleDropdownSection.tsx`, `ViewFieldsHiddenDropdownSection.tsx`, `ObjectOptionsDropdownHiddenFieldsContent.tsx`
- Mục menu Options hiển thị "Fields — N selected".
- Kanban dùng cùng danh sách nhưng điều khiển trường trên **thẻ**. `useObjectOptionsForBoard.ts`

### 4d. Luật cột đầu (label identifier)
| Luật | Nguồn |
|---|---|
| Không ẩn được (không có "Hide") | `RecordTableColumnHeadDropdownMenu.tsx` (`canHide`) |
| Không Move left/right, không kéo | cùng file (`canMove`), `useRecordTableHeaderDndKit.ts` |
| Dính trái khi cuộn ngang | `RecordTableStyleWrapper.tsx` |
| Vẫn resize được (min 104; mobile 180) | `RecordTableColumnMinWidth.ts` |
| Header có nút "+" tạo record mới ở **đầu** danh sách | `RecordTableHeaderLabelIdentifierCellPlusButton.tsx` |
| Trên kanban = tên/chip đầu thẻ, không nằm trong thân | `RecordBoardCardBody.tsx` |

---

## 5. Nên chép cho app CSKH ticket (nhỏ, người dùng Việt)

1. **Tách "lưu ngay" vs "tạm"**: cột/độ rộng/ẩn lưu ngay; lọc/sắp là tạm, có Reset + "Cập nhật view"/"Lưu thành view mới". Người dùng thử lọc thoải mái mà không phá view chung. (`ViewBarDetails.tsx`)
2. **Ngưỡng kéo 8px (cảm ứng: giữ 250ms)**: cả thẻ kéo được mà click vẫn mở ticket; link không chặn kéo. (`getDragActivationConstraints.ts`)
3. **Kéo thẻ kanban optimistic** + chặn race 500ms: đổi trạng thái ticket cảm giác tức thì. (`useUpdateDroppedRecordOnBoard.ts`)
4. **Sort chặn kéo tay → hỏi "Bỏ sắp xếp?"** thay vì kéo xong nhảy về chỗ cũ. (`RecordIndexRemoveSortingModal.tsx`)
5. **Chip lọc gọn + gỡ khi rỗng**: "Trạng thái: Mới, Đang xử lý", >3 giá trị thành "N lựa chọn"; mục ghim **"Tôi"** khi lọc người phụ trách. (`getOperandLabel.ts`, `ObjectFilterDropdownRecordSelect.tsx`)
6. **Trường rỗng trên thẻ hiện tên trường mờ** (không ẩn) → layout thẻ ổn định, biết bấm vào đâu để điền. (`RecordInlineCellDisplayMode.tsx`)

## 6. Dư thừa với quy mô này (bỏ)

1. **Advanced filter AND/OR lồng 2 tầng** (panel 650px, rule group): CSKH ticket chỉ cần chip AND đơn giản. (`fm/object-record/advanced-filter/`)
2. **Cột lookup/summary qua relation ("Belongs to / Has many")** và aggregate 15 phép: thừa; giữ Count trên cột kanban là đủ. (`RecordTableHeaderPlusButtonContent.tsx`, `record-table-footer/constants/`)
3. **Group load limit 8/25/50/100, group sort Alphabetical, compact mode từng thẻ, nhiều view type (Calendar/List)**: bỏ ở lát đầu; một board theo trạng thái + một bảng là đủ.

## Chưa kiểm / ngoài phạm vi
- Không chạy app Twenty, chỉ đọc code → mọi "hiện/ẩn khi hover" suy từ CSS, chưa thấy bằng mắt.
- Không đọc: view picker (tạo/đổi tên view), side panel mở record, tab nhóm (Tabs/Sections) của bảng, bảng có group, calendar.
- Debounce query khi gõ lọc/tìm: không thấy ở frontend (có thể nằm ở tầng query chưa checkout).
