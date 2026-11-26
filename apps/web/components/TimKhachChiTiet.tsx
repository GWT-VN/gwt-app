'use client'

import { useId, useState } from 'react'
import { Input } from '@/components/ui/input'
import { searchCustomers, type KhachTom } from '@/app/actions'

/**
 * Ô tìm khách hiện ĐỦ tỉnh + địa chỉ, không chỉ tên + SĐT.
 *
 * Vì sao tách riêng khỏi KhachPicker: KhachPicker gánh thêm việc TẠO khách mới
 * (tra SĐT chống trùng, gửi chờ duyệt). Ở những chỗ chỉ cần CHỌN một khách có sẵn
 * — gán plan bảo trì, gộp hồ sơ trùng — thì phần tạo mới là thừa và gây nhầm.
 * Quan trọng hơn: nhiều khách KHÔNG có SĐT, nên tên + SĐT không đủ để dám bấm;
 * phải thấy tỉnh và địa chỉ mới phân biệt được hai người trùng tên.
 */
export function TimKhachChiTiet({
  nhan,
  onChon,
  tuDongXoaSauKhiChon = true,
}: {
  nhan?: string
  onChon: (k: KhachTom) => void
  tuDongXoaSauKhiChon?: boolean
}) {
  const id = useId()
  const [q, setQ] = useState('')
  const [ds, setDs] = useState<KhachTom[]>([])
  const [dangTim, setDangTim] = useState(false)

  async function tim(v: string) {
    setQ(v)
    const t = v.trim()
    // Dưới 2 ký tự thì mọi khách đều khớp — trả về danh sách vô nghĩa, tốn truy vấn.
    if (t.length < 2) { setDs([]); return }
    setDangTim(true)
    try {
      setDs(await searchCustomers(t, 8))
    } finally {
      setDangTim(false)
    }
  }

  return (
    <div>
      {nhan && <label htmlFor={id} className="text-sm font-medium text-foreground">{nhan}</label>}
      <Input id={id} aria-label={nhan ? undefined : 'Tìm khách hàng'}
        value={q}
        onChange={(e) => tim(e.target.value)}
        placeholder="Gõ tên hoặc SĐT…"
        className="mt-1"
      />
      {dangTim && <p className="mt-1 text-xs text-muted-foreground">Đang tìm…</p>}
      {!dangTim && q.trim().length >= 2 && ds.length === 0 && (
        <p className="mt-1 text-xs text-muted-foreground">Không thấy khách nào khớp.</p>
      )}
      {ds.length > 0 && (
        <ul className="mt-1 divide-y divide-border rounded-lg border border-border bg-popover">
          {ds.map((k) => (
            <li key={k.id}>
              <button
                type="button"
                onClick={() => {
                  onChon(k)
                  if (tuDongXoaSauKhiChon) { setQ(''); setDs([]) }
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span className="font-medium text-foreground">{k.full_name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {k.primary_phone
                    ? <span className="font-mono">{k.primary_phone}</span>
                    : <span className="text-(--color-text-warning)">thiếu SĐT</span>}
                  {k.province ? ` · ${k.province}` : ''}
                  {k.address ? ` · ${k.address}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
