# GWT design system — nền tham chiếu

Hướng đã được người dùng chọn: **component và block mẫu của shadcn/ui; hệ thiết kế thị giác theo OpenAI Apps SDK UI**.

OpenAI Apps SDK UI là một design system dành cho ứng dụng trong ChatGPT: có token, style nền, component và tài liệu. Trong GWT, dùng nó làm nguồn tham chiếu cho màu, chữ, spacing, kích thước, border, radius, shadow và trạng thái tương tác; dùng shadcn/ui làm nền component và bố cục.

Thư mục này lưu bộ nguồn tham chiếu và brief để giao cho Claude Design. Chưa triển khai theme shadcn, chưa ánh xạ token, chưa áp DS mới vào runtime của GWT App. Những phần đó cần được thiết kế và kiểm chứng trên các màn hình được xác nhận tiếp theo.

## Bắt đầu

1. Đọc [brief cho Claude Design](CLAUDE-DESIGN-BRIEF.txt).
2. Đọc token gốc trong [reference/openai-apps-sdk-ui/styles](reference/openai-apps-sdk-ui/styles).
3. Đọc [nguồn và checksum](reference/openai-apps-sdk-ui/SOURCE.json) để biết chính xác snapshot.
4. Giải nén [toàn bộ UI kit 0.2.2](archives/openai-apps-sdk-ui-0.2.2.zip) vào thư mục tạm bên ngoài mã ứng dụng khi cần xem component, icon, Storybook và cấu hình build gốc.

## Nội dung

| Đường dẫn | Vai trò |
| --- | --- |
| `CLAUDE-DESIGN-BRIEF.txt` | Mô tả công việc, các quyết định đã chọn và những phạm vi chưa chốt |
| `reference/openai-apps-sdk-ui/styles/*.css` | Bản sao nguyên trạng của primitive, semantic, component token và Tailwind utilities |
| `reference/openai-apps-sdk-ui/LICENSE` | Giấy phép MIT của nguồn OpenAI được lưu tại đây |
| `reference/openai-apps-sdk-ui/SOURCE.json` | Repository, phiên bản, commit, đường dẫn gốc và SHA-256 từng tài nguyên |
| `archives/openai-apps-sdk-ui-0.2.2.zip` | Toàn bộ 1.059 file được Git quản lý tại snapshot, không kèm `.git`, `node_modules`, bản build hoặc file Figma |

## Cách dùng khi triển khai

- Ánh xạ semantic token shadcn sang token OpenAI theo đúng vai trò. Không đồng nhất `accent` với màu thương hiệu nếu ý nghĩa khác nhau.
- Áp cả typography, kích thước control, padding, radius, border, shadow và focus; đổi riêng màu chưa đủ.
- Các CSS ở `reference/` là nguồn tham chiếu, không phải entrypoint đã build để import trực tiếp. Nguồn OpenAI có cú pháp và xử lý PostCSS riêng; xem cấu hình trong archive trước khi sử dụng.
- Duy trì một lớp reset và hệ theme thống nhất. Kiểm tra xung đột với global styles và bộ bảng `apps/web/bang/` trước khi áp dụng.
- Giữ nghiệp vụ và phân quyền hiện có. Tên token hoặc quy tắc bổ sung riêng cho GWT phải được ghi rõ là phần mở rộng.
- Giữ giấy phép khi sao chép hoặc phân phối lại nguồn. Giấy phép mã nguồn trong thư mục này không thay thế điều kiện áp dụng riêng cho tài nguyên Figma hoặc nhận diện thương hiệu.

## Nguồn chính thức

- [OpenAI Apps SDK UI source](https://github.com/openai/apps-sdk-ui/tree/0f00143c7a639906f1621fe58e1b6be7b5bea46d)
- [OpenAI UI demo](https://openai.github.io/apps-sdk-ui/)
- [OpenAI UI guidelines](https://developers.openai.com/plugins/concepts/ui-guidelines)
- [Figma kit được OpenAI dẫn tới](https://www.figma.com/community/file/1625636989296445101)
- [shadcn components](https://ui.shadcn.com/docs/components)
- [shadcn blocks](https://ui.shadcn.com/blocks)
- [shadcn theming](https://ui.shadcn.com/docs/theming)

Snapshot được tải ngày 18/11/2026. Không tự thay nguồn tham chiếu bằng bản mới nhất mà không cập nhật provenance, checksum và kiểm tra tác động.

## Đưa vào menu Design systems của Claude Design

Commit tài liệu vào GitHub không tự đăng ký DS trong tài khoản Claude.

1. Trong menu `Choose design system...`, chọn `Make a new design system first`. Có thể quản lý các DS đã tạo qua `Manage design systems`.
2. Tạo DS bằng Claude, cung cấp brief và archive trong thư mục này qua upload hoặc nguồn kết nối mà giao diện hỗ trợ. Tên đề xuất: `GWT — OpenAI + shadcn`.
3. Yêu cầu Claude trích token OpenAI, dùng component shadcn và tạo bảng ánh xạ cùng mẫu component. Sau khi tạo xong, chọn DS đó cho thiết kế tiếp theo. Cấu hình chia sẻ hoặc mặc định của tổ chức phụ thuộc quyền tài khoản.

Prompt khởi đầu:

> Tạo design system tên GWT — OpenAI + shadcn từ các tài liệu đính kèm. Dùng token và quy tắc thị giác trong OpenAI Apps SDK UI làm nguồn cho màu, typography, spacing, kích thước, border, radius, shadow và trạng thái tương tác. Dùng shadcn/ui làm nền component và block mẫu. Đọc brief trước; lập bảng ánh xạ token từ nguồn thật, ghi rõ phần mở rộng riêng của GWT và tạo mẫu component để kiểm tra tính nhất quán. Các thư viện chưa có trong nguồn đính kèm phải được đọc từ tài liệu chính thức hoặc yêu cầu bổ sung. Tạo DS trước khi thiết kế màn hình nghiệp vụ.

Với DS React đã được triển khai trong codebase, hướng dẫn chính thức đề xuất `/design-sync` trong Claude Code. Snapshot ở đây mới là nền tham chiếu; chưa có bộ component shadcn đã áp theme OpenAI để đồng bộ hoàn chỉnh bằng cách đó.

Nguồn: [Set up your design system in Claude Design](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design).
