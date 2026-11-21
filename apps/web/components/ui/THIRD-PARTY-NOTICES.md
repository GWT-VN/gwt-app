# Ghi công mã bên thứ ba — DS v2 (`components/ui/`)

DS v2 chép khung component từ shadcn/ui, dựng hành vi trên Radix UI và lấy giá trị thiết kế (token, CSS) từ OpenAI Apps SDK UI.
Cả ba dùng giấy phép MIT — bản quyền và lời cho phép dưới đây phải đi kèm mã. Đối chiếu nguồn + link: `docs/rework/2026-11-21-doi-chieu-shadcn.md` §3.

| Nguồn | Phần dùng | Bản | Bản quyền |
|---|---|---|---|
| shadcn/ui (`shadcn-ui/ui`, style `new-york-v4`) | Khung component trong `components/ui/*.tsx` | commit `45bbf9ba23c9c0f63d38887947e5fb06f59c7da3` | Copyright (c) 2023 shadcn |
| Radix UI (`radix-ui`) | Hành vi (thư viện npm, không chép mã) | 1.8.1 | Copyright (c) 2022 WorkOS |
| OpenAI Apps SDK UI (`@openai/apps-sdk-ui`) | Giá trị token + CSS (`ds/nguon/bundle.css`), không dùng component React | 0.2.2 | Copyright 2025 OpenAI |

MIT không cấp quyền thương hiệu: không dùng tên/logo OpenAI, ChatGPT, Sora trên giao diện GWT.

## MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
