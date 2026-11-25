// chép ý từ GWT-ERP tests/chatbot/pancake-chi-doc.test.ts @c2f3719
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const THU_MUC = import.meta.dirname;
// Luật (2026-11-25, Task 6): POST sang API model (claude.ts, openai.ts…) được; kênh khách chỉ một cửa gui-khach.ts —
// reply_inbox chỉ ở đó, file nào khác chạm pages.fm chỉ được method GET.
const mon = () => readdirSync(THU_MUC).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

describe("guard: chỉ gui-khach.ts được gửi tin cho khách", () => {
  it("không file nào khác chứa reply_inbox", () => {
    for (const f of mon()) {
      if (f === "gui-khach.ts") continue;
      expect({ f, vi: /reply_inbox/.test(readFileSync(join(THU_MUC, f), "utf8")) }).toEqual({ f, vi: false });
    }
  });
  it("không file nào khác vừa chạm pages.fm vừa có khoá method:", () => {
    for (const f of mon()) {
      if (f === "gui-khach.ts") continue;
      const src = readFileSync(join(THU_MUC, f), "utf8");
      // doc.ts gọi pages.fm nhưng chỉ method GET (hợp lệ) → chỉ cấm method khác GET
      const lech = /pages\.fm/.test(src) && [...src.matchAll(/method:\s*["'`]?(\w+)/g)].some((m) => m[1].toUpperCase() !== "GET");
      expect({ f, lech }).toEqual({ f, lech: false });
    }
  });
  it("không file nào import server-only (chạy thẳng bằng Node)", () => {
    for (const f of mon()) expect({ f, vi: /server-only/.test(readFileSync(join(THU_MUC, f), "utf8")) }).toEqual({ f, vi: false });
  });
});
