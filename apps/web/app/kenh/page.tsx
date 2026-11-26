import { listKenh, type Kenh } from '@/app/actions'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'

export default async function KenhPage() {
  const kenh = await listKenh()
  const nhom = new Map<string, Kenh[]>()
  for (const k of kenh) {
    const g = nhom.get(k.channel_l1) ?? []
    g.push(k); nhom.set(k.channel_l1, g)
  }
  const tongGan = kenh.reduce((s, k) => s + (k.so_khach ?? 0), 0)

  return (
    <ManV2>
      <TrangDuLieu className="max-w-3xl">
        <div className="min-w-0 space-y-4">
          <PageHeader tieuDe="Kênh / đối tác" meta={[<>Đại lý/KTS/KOL quản lý khách — taxonomy dùng chung <span className="tabular-nums">dim_channel</span> với Sales
              (CSKH chỉ gắn khách, không sửa danh mục kênh). Đã gắn: <strong>{tongGan}</strong> khách.</>]} />

          {[...nhom.entries()].map(([l1, ks]) => (
            <section key={l1} className="bg-card rounded-(--radius-xl) border overflow-hidden">
              <div className="px-4 py-2.5 bg-muted border-b font-medium text-foreground">{l1}</div>
              <ul className="divide-y text-sm">
                {ks.map((k) => (
                  <li key={k.id} className="px-4 py-2 flex items-center justify-between gap-3">
                    <span className="text-foreground">{k.channel_l2 || <span className="text-muted-foreground">(không phân nhánh)</span>}</span>
                    <span className={`text-xs ${k.so_khach ? 'text-muted-foreground' : 'text-slate-300'}`}>
                      {k.so_khach ?? 0} khách
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </TrangDuLieu>
    </ManV2>
  )
}
