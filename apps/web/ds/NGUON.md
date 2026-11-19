# Nguồn token DS v2

Artifact **"GWT — OpenAI + shadcn"**, **bản 26** — https://claude.ai/artifact/BooHz9v7SKXnLHesvW3Lkr

File trong `nguon/` chép **nguyên byte** từ artifact bản 26. Không sửa tay.

| File | sha256 |
|---|---|
| `nguon/tokens.json` | `a6dc379bf515623fac52bb8559e10ca5bc0e914fe105de80883383b67a75d221` |
| `nguon/tokens.css` | `45230c507af3efd5507f16e82a2911679fadf68b8ed2e5583e84d14f92bc44b5` |
| `nguon/bundle.css` | `99d035e25e8c14a34a9db0d73ef2a6487c458c14f59f94bacf39bb9359c9e85c` |
| `nguon/components/Button/preview.html` | `177935133068d688891289c9b853d7a5cf847dcf34b5c0f4636a5e7b0486052c` |

`.gitattributes` trong thư mục này ép LF để sha256 trên khớp ở mọi máy (repo bật `core.autocrlf`).

**Thang Tailwind trong vùng DS:** trong `[data-ds="v2"]` DS khai lại `--radius-*` và `--spacing` → utility mặc định
`rounded-*` / `p-*`… của Tailwind ăn theo thang DS ở đó (vd `rounded-md` = 8px). Cố ý; ngoài vùng DS không đổi gì.

## Tương phản — chấp nhận có chủ đích

Giữ y màu nguồn ChatGPT; 4 cặp dưới WCAG (danger chữ tối 3.52, viền input 1.42/2.28, viền Checkbox 1.6, chữ Badge
3.81–4.39) là chấp nhận có chủ đích — CEO 19/11. Không "sửa giùm" trong `tokens.css`.

## Cập nhật khi artifact đổi

1. Chép bản mới của 4 file vào `nguon/` (giữ nguyên byte), ghi số bản + sha256 mới vào bảng trên
   (`sha256sum nguon/tokens.json nguon/tokens.css nguon/bundle.css nguon/components/Button/preview.html`).
2. Sửa số bản trong dòng đầu `sinh-token.mjs` (hằng `DAU`), rồi chạy script (cwd `apps/web`):
   `node ds/sinh-token.mjs` → ghi đè `ds/tokens.css`.
3. Chạy so khớp: `npm run test -- ds/sinh-token` (mỗi màu trong `tokens.json` có mặt đúng giá trị; `tokens.css` = đầu ra
   script).
