'use client'

/**
 * Nối thẻ xem nhanh vào màn Việc: việc đang xem ở tham số URL `?xem=<id>` (tải lại / gửi link vẫn mở đúng việc), khung
 * DS `XemNhanh` (‹ › theo thứ tự đang hiện, ✕ / Esc đóng) + `the` dựng bởi `useTheViec` (components/work/v2/XemNhanh.tsx).
 * Tab của thẻ giữ ở đây: lật ‹ › / mở việc khác giữ tab, đóng thẻ về Tổng quan.
 */
import { useState, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { NenTang } from '@/app/work/actions'
import { XemNhanh as KhungXemNhanh } from '@/components/ui/xem-nhanh'
import { useTheViec, type TabViec } from './XemNhanh'

export function useXemViec() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const id = Number(sp.get('xem')) || null
  const dat = (v: number | null) => {
    const m = new URLSearchParams(sp.toString())
    if (v) m.set('xem', String(v))
    else m.delete('xem')
    router.replace(`${pathname}${m.size ? `?${m}` : ''}`, { scroll: false })
  }
  return { id, mo: (v: number) => dat(v), dong: () => dat(null) }
}

/** `ds` = việc đang hiện theo đúng thứ tự (cho ‹ ›); việc mở từ việc con / việc chặn không nằm trong `ds` vẫn mở được. */
export function KhungXemViec({
  ds,
  nenTang,
  children,
}: {
  ds: { id: number; ref: string }[]
  nenTang: NenTang
  children: ReactNode
}) {
  const router = useRouter()
  const { id, mo, dong } = useXemViec()
  const i = id ? ds.findIndex((v) => v.id === id) : -1
  const [tab, setTab] = useState<TabViec>('tong')
  const dongThe = () => {
    setTab('tong')
    dong()
  }
  const the = useTheViec({
    taskId: id,
    ma: ds[i]?.ref ?? `#${id}`,
    nenTang,
    tab,
    onTab: setTab,
    onDong: dongThe,
    onMoViec: mo,
    onDoi: () => router.refresh(),
  })
  return (
    <KhungXemNhanh
      the={the}
      onDong={dongThe}
      coDinh
      onTruoc={i > 0 ? () => mo(ds[i - 1].id) : undefined}
      onSau={i >= 0 && i < ds.length - 1 ? () => mo(ds[i + 1].id) : undefined}
    >
      {children}
    </KhungXemNhanh>
  )
}
