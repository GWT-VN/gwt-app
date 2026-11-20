// File THƯỜNG (không 'use client'): hàm thuần của TabsList thu gọn (components/ui/tabs.tsx) — luật NGUON: hàm thuần ở lib/.

/**
 * Chỉ số tab phải ẩn khi thu gọn: vừa hết (kể cả khoảng cách) → không ẩn; không vừa → giữ tab đang chọn, rồi giữ lần lượt
 * từ đầu tới tab đầu tiên không vừa (chừa nút "Thêm" + một khoảng cách), ẩn từ đó về sau — thứ tự tab không xáo trộn.
 */
export function tinhThuGon({
  rong,
  cho,
  gap,
  rongThem,
  chon,
}: {
  rong: number[]
  cho: number
  gap: number
  rongThem: number
  chon: number
}): number[] {
  const tong = rong.reduce((a, b) => a + b, 0) + gap * Math.max(rong.length - 1, 0)
  if (tong <= cho) return []
  const tran = cho - rongThem - gap
  let dung = chon >= 0 ? rong[chon] : -gap
  const an: number[] = []
  for (let i = 0; i < rong.length; i++) {
    if (i === chon) continue
    if (an.length === 0 && dung + gap + rong[i] <= tran) dung += gap + rong[i]
    else an.push(i)
  }
  return an
}
