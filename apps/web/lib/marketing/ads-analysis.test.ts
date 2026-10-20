import { describe, it, expect } from "vitest";
import type { AdResult, AdsWeek } from "./data/ads-results";
import {
  buildCreatives,
  judgeCamp,
  periodDays,
  productGroupOf,
  type Camp,
} from "./ads-analysis";

function wk(from: string, to: string, ads: Partial<AdResult>[] = []): AdsWeek {
  return {
    id: `${from}--${to}`,
    label: from,
    range: from,
    from,
    to,
    ads: ads.map((a) => ({
      name: a.creative ?? "X",
      creative: "X",
      startDate: "01/1",
      budgetDaily: "100k",
      cost: null,
      results: null,
      costPerResult: null,
      sdt: null,
      note: "",
      status: "active",
      ...a,
    })),
  };
}

// 4 kỳ 1 tuần liền nhau, kỳ cuối là "kỳ gần nhất"
const W = [
  wk("2026-09-07", "2026-09-13"),
  wk("2026-09-14", "2026-09-20"),
  wk("2026-09-21", "2026-09-27"),
  wk("2026-09-28", "2026-10-04"),
];

/** Dựng 1 camp CTS (chuẩn 30k): mỗi kỳ [chi (k), result, SĐT, khách mua?]; null = kỳ đó không chạy. */
function camp(
  periods: ([number, number, number | null, number?] | null)[],
  opts: Partial<Pick<Camp, "status" | "startDate" | "creative">> = {},
): Camp {
  return {
    key: "k",
    creative: opts.creative ?? "CTS20 test",
    name: opts.creative ?? "CTS20 test",
    startDate: opts.startDate ?? "01/9",
    status: opts.status ?? "active",
    note: "",
    budgetDaily: "100k",
    periods: periods.map((p) => (p ? { cost: p[0], results: p[1], sdt: p[2], orders: p[3] ?? null } : null)),
  };
}

describe("productGroupOf", () => {
  it("creative WH là lọc tổng, chuẩn 40k", () => {
    expect(productGroupOf("WH lắp đặt").benchmarkCpr).toBe(40000);
  });
  it("creative CTS/CTD là máy lọc nước uống, chuẩn 30k", () => {
    expect(productGroupOf("CTD50 Dino").benchmarkCpr).toBe(30000);
  });
});

describe("periodDays", () => {
  const week = wk("2026-09-28", "2026-10-04");
  it("camp chạy cả kỳ: tính đủ 7 ngày", () => {
    expect(periodDays(week, "28/8")).toBe(7);
  });
  it("camp lên giữa kỳ: tính từ ngày lên", () => {
    expect(periodDays(week, "30/9")).toBe(5);
  });
  it("kỳ 2 tuần: 14 ngày", () => {
    expect(periodDays(wk("2026-10-05", "2026-10-18"))).toBe(14);
  });
});

describe("buildCreatives", () => {
  const weeks = [
    wk("2026-09-21", "2026-09-27", [
      { creative: "CTS20 Dino", name: "CTS20 Dino", startDate: "29/8", cost: 700, results: 14, sdt: 1, orders: 1, status: "off" },
    ]),
    wk("2026-09-28", "2026-10-04", [
      { creative: "CTS20 Dino", name: "CTS20 Dino", startDate: "5/10", cost: 300, results: 10, sdt: null, status: "new" },
      { creative: "WH lắp đặt", name: "WH lắp đặt", startDate: "02/4", cost: 6000, results: 150, sdt: 12 },
    ]),
  ];
  const groups = buildCreatives(weeks);
  const dino = groups.find((g) => g.name === "CTS20 Dino")!;

  it("gom các camp cùng creative, tách camp theo ngày lên, xếp theo ngày lên", () => {
    expect(dino.camps.map((c) => c.startDate)).toEqual(["29/8", "5/10"]);
  });
  it("số liệu creative mỗi kỳ = cộng mọi camp có số kỳ đó", () => {
    expect(dino.periods[0]).toEqual({ cost: 700, results: 14, sdt: 1, orders: 1 });
    expect(dino.periods[1]).toEqual({ cost: 300, results: 10, sdt: null, orders: null });
  });
  it("creative còn chạy khi có ít nhất 1 camp đang chạy", () => {
    expect(dino.running).toBe(true);
  });

  it("ghi chú camp lấy theo kỳ gần nhất, không kéo ghi chú cũ sang", () => {
    const g = buildCreatives([
      wk("2026-09-21", "2026-09-27", [{ creative: "A", name: "A", cost: 100, results: 5, note: "Tăng budget (29/9)" }]),
      wk("2026-09-28", "2026-10-04", [{ creative: "A", name: "A", cost: 100, results: 5, note: "" }]),
    ]);
    expect(g[0].camps[0].note).toBe("");
  });
});

describe("judgeCamp", () => {
  it("camp đã tắt thì không xét", () => {
    expect(judgeCamp(camp([null, null, null, [700, 10, 0]], { status: "off" }), W)).toBeNull();
  });

  it("ghi đang chạy mà kỳ gần nhất không có số → thiếu số", () => {
    expect(judgeCamp(camp([[700, 30, 1], [700, 30, 1], null, null]), W)!.decision).toBe("stale");
  });

  it("CPR ≥ 1,5 lần chuẩn → nên tắt", () => {
    // 2.300k / 50 = 46k so với chuẩn 30k
    expect(judgeCamp(camp([null, null, [1100, 30, 1], [2300, 50, 4]]), W)!.decision).toBe("off");
  });

  it("chạy ≥ 7 ngày mà dưới 5 result → nên tắt", () => {
    expect(judgeCamp(camp([null, null, [300, 10, 0], [100, 4, 0]]), W)!.decision).toBe("off");
  });

  it("rẻ hơn chuẩn ≥ 20%, có ≥ 2 kỳ số, không đắt lên quá 10% → tăng budget", () => {
    // 22k rồi 20k, chuẩn 30k
    expect(judgeCamp(camp([null, null, [660, 30, 1], [600, 30, 2]]), W)!.decision).toBe("scale");
  });

  it("rẻ nhưng mới có 1 kỳ số → theo dõi, chưa tăng budget", () => {
    expect(judgeCamp(camp([null, null, null, [600, 30, 2]]), W)!.decision).toBe("watch");
  });

  it("rẻ nhưng đắt lên ≥ 15% so với kỳ trước → theo dõi", () => {
    // 15k → 20k
    expect(judgeCamp(camp([null, null, [450, 30, 1], [600, 30, 1]]), W)!.decision).toBe("watch");
  });

  it("tăng 2 kỳ liên tiếp → theo dõi", () => {
    // 25k → 26k → 27k: mỗi kỳ tăng ít nhưng tăng đều
    expect(judgeCamp(camp([null, [750, 30, 1], [780, 30, 1], [810, 30, 1]]), W)!.decision).toBe("watch");
  });

  it("vượt chuẩn nhưng chưa tới ngưỡng tắt → theo dõi", () => {
    // 36k, chuẩn 30k
    expect(judgeCamp(camp([null, null, [1080, 30, 1], [1080, 30, 1]]), W)!.decision).toBe("watch");
  });

  it("không rơi vào luật nào → giữ nguyên", () => {
    // 27k rồi 27k, chuẩn 30k
    expect(judgeCamp(camp([null, null, [810, 30, 1], [810, 30, 1]]), W)!.decision).toBe("keep");
  });

  it("chuẩn theo nhóm sản phẩm: WH 38k là dưới chuẩn 40k", () => {
    const v = judgeCamp(camp([null, null, [1140, 30, 3], [1140, 30, 3]], { creative: "WH lắp đặt" }), W)!;
    expect(v.benchmark).toBe(40000);
    expect(v.decision).toBe("keep");
  });

  it("nhiều result mà SĐT dưới 2% → gắn cờ nhiều mess, ít SĐT", () => {
    const v = judgeCamp(camp([null, null, [2800, 97, 1], [2800, 97, 1]]), W)!;
    expect(v.flags).toContain("Nhiều mess, ít SĐT (1/97)");
  });

  it("đắt quá ngưỡng tắt nhưng có khách mua trong 2 kỳ gần nhất → theo dõi kỹ, chưa tắt", () => {
    // 46k so với chuẩn 30k, kỳ trước có 1 khách mua
    const v = judgeCamp(camp([null, null, [1100, 30, 1, 1], [2300, 50, 4]]), W)!;
    expect(v.decision).toBe("watch");
    expect(v.reasons[0]).toBe("Có 1 khách mua trong 2 kỳ gần nhất — cân nhắc trước khi tắt");
  });

  it("khách mua từ 3 kỳ trước không giữ camp lại", () => {
    expect(judgeCamp(camp([null, [700, 30, 1, 1], [1100, 30, 1], [2300, 50, 4]]), W)!.decision).toBe("off");
  });

  it("kỳ gần nhất chưa ghi SĐT → gắn cờ", () => {
    const v = judgeCamp(camp([null, null, [810, 30, 1], [810, 30, null]]), W)!;
    expect(v.flags).toContain("Chưa ghi SĐT");
  });
});
