'use client'
// PROTOTYPE — thanh chuyển phương án (← →, phím mũi tên). Ẩn ở production.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VariantA, TEN_A } from './VariantA'
import { VariantB, TEN_B } from './VariantB'
import { VariantC, TEN_C } from './VariantC'

const DS = [
  { k: 'A', ten: TEN_A, C: VariantA },
  { k: 'B', ten: TEN_B, C: VariantB },
  { k: 'C', ten: TEN_C, C: VariantC },
]

export function KhungPrototype({ variant }: { variant: string }) {
  const router = useRouter()
  const i = Math.max(0, DS.findIndex((d) => d.k === variant))
  const toi = (n: number) => router.replace(`?variant=${DS[(i + n + DS.length) % DS.length].k}`, { scroll: false })

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'ArrowLeft') toi(-1)
      if (e.key === 'ArrowRight') toi(1)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  const { C } = DS[i]
  return (
    <>
      <C key={DS[i].k} />
      {process.env.NODE_ENV !== 'production' && (
        <div className="p-switcher" role="toolbar" aria-label="Chuyển phương án prototype">
          <button onClick={() => toi(-1)} aria-label="Phương án trước"><ChevronLeft size={16} aria-hidden /></button>
          <span><b>{DS[i].k}</b> · {DS[i].ten}</span>
          <button onClick={() => toi(1)} aria-label="Phương án sau"><ChevronRight size={16} aria-hidden /></button>
        </div>
      )}
    </>
  )
}
