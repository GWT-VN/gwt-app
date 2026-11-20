import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CHU } from '../_khung/chu'
import { KHOI, SO_DA_DUNG } from '../_khung/khoi'
import { KhungDs, layTheme } from '../_khung/khung-ds'
import { Md } from '../_khung/md'
import { chiaMuc, docNguon } from '../_khung/readme'
import { TrangTaiLieu } from '../_khung/tai-lieu'
import { duongDan, TRANG, type Theme } from '../_khung/trang'
import { TrangBoGoc } from '../_nen/bo-goc'
import { TrangBong } from '../_nen/bong'
import { TrangChu } from '../_nen/chu'
import { TrangCoControl } from '../_nen/co-control'
import { TrangKhoangCach } from '../_nen/khoang-cach'
import { TrangMau } from '../_nen/mau'
import { TrangMocManHinh } from '../_nen/moc-man-hinh'

/** Trang nền token — do `_nen/*` vẽ (server component không prop, tự bọc nội dung). */
const NEN: Record<string, () => ReactNode> = {
  mau: TrangMau,
  chu: TrangChu,
  'khoang-cach': TrangKhoangCach,
  'bo-goc': TrangBoGoc,
  bong: TrangBong,
  'co-control': TrangCoControl,
  'moc-man-hinh': TrangMocManHinh,
}
const CHU_TRANG = ['nguyen-tac', 'giong-van', 'anh-xa', 'tuong-phan', 'gwt'] as const

/** /ds/<slug> — mọi trang của /ds trừ Components (/ds) và /ds/tron. Slug lạ → 404. */
export default async function DsTrang({
  params,
  searchParams,
}: {
  params: Promise<{ trang: string }>
  searchParams: Promise<{ theme?: string }>
}) {
  const [{ trang }, theme] = await Promise.all([params, layTheme(searchParams)])
  const Nen = NEN[trang]
  let noiDung: ReactNode
  if (trang === 'tong-quan') noiDung = <TongQuan theme={theme} />
  else if (Nen) noiDung = <Nen />
  else if ((CHU_TRANG as readonly string[]).includes(trang)) noiDung = <TrangTaiLieu slug={trang} />
  else notFound()
  return (
    <KhungDs theme={theme} trang={trang}>
      {noiDung}
    </KhungDs>
  )
}

/** Tổng quan: phần mở đầu README dự án + thẻ dẫn tới từng trang. */
function TongQuan({ theme }: { theme: Theme }) {
  return (
    <article>
      <h1 className={`m-0 mb-4 ${CHU.h1}`}>Design system v2</h1>
      <Md md={chiaMuc(docNguon('README.md')).dau} />
      <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {TRANG.filter((t) => t.slug !== 'tong-quan').map(({ slug, ten, icon: Icon, moTa }) => (
          <li key={slug} className="flex">
            <Link
              href={duongDan(slug, theme)}
              className="flex w-full flex-col gap-1 rounded-xl border border-(--border) p-4 hover:bg-(--alpha-04) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className={`flex items-center gap-2 ${CHU.h3}`}>
                <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                {ten}
              </span>
              <span className={`text-muted-foreground ${CHU.sm}`}>
                {slug === 'components' ? `Đã dựng ${SO_DA_DUNG}/${KHOI.length} component` : moTa}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
