'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useCauHinh } from './CauHinh'

/**
 * Gõ tới đâu lọc tới đó, hoãn 300ms để không bắn truy vấn mỗi phím.
 *
 * Dùng router.replace() chứ KHÔNG push: push thì mỗi ký tự là một mục lịch sử,
 * gõ "hương" xong phải bấm Back 5 lần mới thoát. Đổi lại Back sẽ rời trang chứ
 * không xoá từ khoá — nên đường về là nút "Xoá lọc" ở ThanhDangLoc.
 */
export function OTimKiem({
  placeholder,
  'aria-label': ten,
}: {
  placeholder: string
  /** Tên đọc của ô. Không truyền → dùng placeholder (như trước: ô chỉ có placeholder làm tên). */
  'aria-label'?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [, batDau] = useTransition()
  const { giaoDien: gd, bieuTuong } = useCauHinh()

  useEffect(() => {
    // 🐛 Đã từng gây lỗi "bấm Sau → không sang trang được": searchParams nằm trong
    // deps, nên MỌI thay đổi URL đều chạy lại effect này — kể cả khi người dùng
    // bấm chuyển trang hay đổi tab lọc. Nó lại luôn xoá ?trang= nên vừa sang
    // trang 2 là bị đá ngược về trang 1.
    //
    // Chốt chặn: URL đã khớp ô nhập nghĩa là lần chạy này KHÔNG phải do gõ phím
    // -> không đụng vào URL.
    if (q === (searchParams.get('q') ?? '')) return

    const hen = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString())
      if (q) sp.set('q', q)
      else sp.delete('q')
      sp.delete('trang')          // đổi từ khoá thì về trang 1
      batDau(() => router.replace(`${pathname}?${sp}`))
    }, 300)
    return () => clearTimeout(hen)
  }, [q, pathname, router, searchParams])

  return (
    <div className={gd.oTimKiem_khung}>
      {/* KHÔNG type="search": Chrome/Safari tự xoá chữ khi bấm Esc → onChange → xoá `q` khỏi URL,
          đổi hành vi màn cũ (người điều phối chốt 20/11). Tên đọc qua aria-label là đủ. */}
      <input
        aria-label={ten ?? placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className={gd.oTimKiem_input}
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ('')}
          aria-label="Xoá từ khoá"
          className={gd.oTimKiem_nutXoa}
        >
          {bieuTuong.boLoc ?? '×'}
        </button>
      )}
    </div>
  )
}
