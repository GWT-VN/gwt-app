// chép ý từ GWT-ERP tests/chatbot/pancake-chi-doc.test.ts @c2f3719
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const THU_MUC = import.meta.dirname;
// claude.ts POST sang api.anthropic.com (không phải kênh khách) → miễn khỏi cấm POST, vẫn bị cấm reply_inbox/pages.fm.
const mon = () => readdirSync(THU_MUC).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
const CAM = [/reply_inbox/, /method:\s*["'`]POST/i];

describe("guard: chỉ gui-khach.ts được gửi tin cho khách", () => {
  it("không file nào khác chứa reply_inbox hoặc method POST", () => {
    for (const f of mon()) {
      if (f === "gui-khach.ts") continue;
      const src = readFileSync(join(THU_MUC, f), "utf8");
      const cam = f === "claude.ts" ? CAM.slice(0, 1) : CAM;
      expect({ f, vi: cam.filter((re) => re.test(src)).map(String) }).toEqual({ f, vi: [] });
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
