export interface AdResult {
  name: string;
  startDate: string;
  budgetDaily: string;
  cost: number | null;
  results: number | null;
  costPerResult: number | null;
  sdt: number | null;
  note: string;
  status: "active" | "off" | "new" | "expensive";
}

export interface AdsWeek {
  id: string;
  label: string;
  range: string;
  ads: AdResult[];
}

export const ADS_WEEKS: AdsWeek[] = [
  {
    id: "2025-08-31--09-06",
    label: "31/8 – 6/9",
    range: "31/8 – 6/9/2025",
    ads: [
      { name: "CTS10 Dino", startDate: "01/6", budgetDaily: "300k", cost: 2097, results: 257, costPerResult: 8159, sdt: null, note: "Cost/Result thấp nhất", status: "active" },
      { name: "CTS20 người dùng", startDate: "28/8", budgetDaily: "300k", cost: 2055, results: 107, costPerResult: 19206, sdt: null, note: "Tốt nhất tuần", status: "active" },
      { name: "CTD50 người dùng", startDate: "28/8", budgetDaily: "300k (chung)", cost: 659, results: 24, costPerResult: 27458, sdt: null, note: "Chung camp với CG", status: "active" },
      { name: "WH lắp đặt", startDate: "02/4", budgetDaily: "900k", cost: 6283, results: 206, costPerResult: 30500, sdt: null, note: "Chạy lâu, ổn định", status: "active" },
      { name: "CTD50 Dino", startDate: "29/8", budgetDaily: "100k", cost: 695, results: 17, costPerResult: 40882, sdt: null, note: "", status: "active" },
      { name: "WH Dino Dọc", startDate: "28/8", budgetDaily: "100k", cost: 699, results: 15, costPerResult: 46600, sdt: null, note: "", status: "active" },
      { name: "CTD50 chuyên gia", startDate: "28/8", budgetDaily: "300k (chung)", cost: 1458, results: 30, costPerResult: 48600, sdt: null, note: "Chung camp với ND", status: "active" },
      { name: "CTS20 Dino", startDate: "29/8", budgetDaily: "100k", cost: 696, results: 14, costPerResult: 49714, sdt: null, note: "", status: "active" },
      { name: "WH lọc tổng 050926", startDate: "7/9", budgetDaily: "100k", cost: null, results: null, costPerResult: null, sdt: null, note: "Mới bắt đầu", status: "new" },
      { name: "CTS20 chuyên gia", startDate: "7/9", budgetDaily: "100k", cost: null, results: null, costPerResult: null, sdt: null, note: "Mới bắt đầu", status: "new" },
    ],
  },
  {
    id: "2025-09-06--09-14",
    label: "6/9 – 14/9",
    range: "6/9 – 14/9/2025",
    ads: [
      { name: "CTS10 Dino", startDate: "01/9", budgetDaily: "300k", cost: 2516, results: 329, costPerResult: 7647, sdt: 4, note: "Mess hệ thống đếm", status: "active" },
      { name: "WH Riverside", startDate: "8/9", budgetDaily: "100k", cost: 578, results: 68, costPerResult: 8500, sdt: null, note: "Mess hệ thống đếm · Mới", status: "new" },
      { name: "CTD50 chuyên gia", startDate: "28/8", budgetDaily: "300k (chung)", cost: 310, results: 12, costPerResult: 25833, sdt: 1, note: "Chung camp với ND", status: "active" },
      { name: "CTS20 người dùng", startDate: "28/8", budgetDaily: "300k", cost: 2500, results: 97, costPerResult: 25773, sdt: 9, note: "", status: "active" },
      { name: "WH lọc tổng 260905", startDate: "7/9", budgetDaily: "100k", cost: 683, results: 24, costPerResult: 28458, sdt: 2, note: "", status: "active" },
      { name: "CTD50 người dùng", startDate: "28/8", budgetDaily: "300k (chung)", cost: 2211, results: 66, costPerResult: 33500, sdt: 8, note: "Chung camp với CG", status: "active" },
      { name: "CTD50 Dino", startDate: "29/8", budgetDaily: "100k", cost: 860, results: 22, costPerResult: 39091, sdt: 4, note: "", status: "active" },
      { name: "CTS20 Dino", startDate: "29/8", budgetDaily: "100k", cost: 850, results: 21, costPerResult: 40476, sdt: 2, note: "", status: "active" },
      { name: "WH lắp đặt", startDate: "02/4", budgetDaily: "900k", cost: 7452, results: 186, costPerResult: 40065, sdt: 20, note: "SĐT cao nhất", status: "active" },
      { name: "WH Dino2", startDate: "28/8", budgetDaily: "100k", cost: 842, results: 20, costPerResult: 42100, sdt: 2, note: "", status: "active" },
      { name: "CTS20 chuyên gia", startDate: "7/9", budgetDaily: "100k", cost: 503, results: 8, costPerResult: 62875, sdt: 2, note: "Đã tắt", status: "off" },
      { name: "WH nước mềm", startDate: "11/9", budgetDaily: "100k", cost: 322, results: 3, costPerResult: 107333, sdt: null, note: "Rất đắt", status: "expensive" },
    ],
  },
  {
    id: "2025-09-14--09-20",
    label: "14/9 – 20/9",
    range: "14/9 – 20/9/2025",
    ads: [
      { name: "CTS10 Dino", startDate: "01/6", budgetDaily: "200k", cost: 2041, results: 233, costPerResult: 8760, sdt: 5, note: "Tắt 22/9 — chuyển đổi đếm lead qua conversation, không phải conversation thật → CPR rẻ ảo", status: "off" },
      { name: "WH Riverside", startDate: "8/9", budgetDaily: "100k", cost: 674, results: 69, costPerResult: 9768, sdt: null, note: "Tắt 21/9 — test lên camp chung với Lắp đặt", status: "off" },
      { name: "CTS20 chuyên gia", startDate: "7/9", budgetDaily: "100k", cost: 688, results: 36, costPerResult: 19111, sdt: 0, note: "Mở lại", status: "active" },
      { name: "CTS20 người dùng", startDate: "28/8", budgetDaily: "300k", cost: 2088, results: 83, costPerResult: 25157, sdt: 7, note: "", status: "active" },
      { name: "WH lọc tổng 260905", startDate: "7/9", budgetDaily: "100k", cost: 687, results: 20, costPerResult: 34350, sdt: 0, note: "Tắt 22/9 — cùng lý do CTS10: chuyển đổi lead qua conversation, lên lại", status: "off" },
      { name: "CTD50 người dùng", startDate: "28/8", budgetDaily: "200k", cost: 1916, results: 54, costPerResult: 35481, sdt: 6, note: "Giảm budget từ 300k→200k (21/9)", status: "active" },
      { name: "CTD50 Dino", startDate: "29/8", budgetDaily: "150k", cost: 705, results: 19, costPerResult: 37105, sdt: 3, note: "Tăng budget 100k→150k (21/9)", status: "active" },
      { name: "WH lắp đặt", startDate: "02/4", budgetDaily: "900k", cost: 6186, results: 149, costPerResult: 41517, sdt: 15, note: "SĐT cao nhất", status: "active" },
      { name: "WH Dino2", startDate: "28/8", budgetDaily: "100k", cost: 693, results: 15, costPerResult: 46200, sdt: 0, note: "", status: "active" },
      { name: "CTS20 Dino", startDate: "29/8", budgetDaily: "100k", cost: 710, results: 14, costPerResult: 50714, sdt: 0, note: "Tắt từ 21/9", status: "off" },
      { name: "CTD50 chuyên gia", startDate: "28/8", budgetDaily: "300k (chung)", cost: 179, results: 3, costPerResult: 59667, sdt: 0, note: "Tắt từ 21/9 — lên camp mới", status: "off" },
    ],
  },
  {
    id: "2025-09-18--09-21",
    label: "18/9 – 21/9",
    range: "18/9 – 21/9/2025",
    ads: [
      { name: "CTD50 Dino", startDate: "29/8", budgetDaily: "100k", cost: 300, results: 9, costPerResult: 33333, sdt: null, note: "", status: "active" },
      { name: "CTS20 Dino", startDate: "29/8", budgetDaily: "100k", cost: 298, results: 6, costPerResult: 49667, sdt: null, note: "", status: "active" },
      { name: "WH Dino2", startDate: "28/8", budgetDaily: "100k", cost: 316, results: 4, costPerResult: 79000, sdt: null, note: "Chỉ 3 ngày, 4 result", status: "active" },
    ],
  },
];

export function getLatestWeek(): AdsWeek {
  return ADS_WEEKS[ADS_WEEKS.length - 1];
}

export function formatCost(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return v.toLocaleString("vi-VN");
}

export function formatVND(v: number): string {
  return v.toLocaleString("vi-VN") + "đ";
}
