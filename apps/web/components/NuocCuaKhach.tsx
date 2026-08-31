import { nuocCuaKhach } from '@/app/actions'
import { coDoNuoc } from '@/lib/nuoc'
import { ChiSoNuoc } from '@/components/ChiSoNuoc'
import { vnDate } from '@/components/Badge'

/**
 * Lịch sử chất lượng nước của MỘT khách — mỗi lần kiểm tra một dòng (CEO yêu cầu 31/08/2026).
 *
 * Server component: chỉ đọc, không có tương tác nào cần chạy ở trình duyệt.
 */
export async function NuocCuaKhach({ customerId }: { customerId: string }) {
  const rows = await nuocCuaKhach(customerId)
  if (!rows.length) return null

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-medium text-slate-900">Chất lượng nước qua các lần kiểm tra</h3>
      <p className="mb-2 text-xs text-slate-400">{rows.length} lần đã đo · mới nhất trước</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.visit_id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <div className="flex flex-wrap items-baseline gap-2 text-xs">
              <span className="font-medium text-slate-800">{r.ngay ? vnDate(r.ngay) : 'chưa rõ ngày'}</span>
              {r.lan_thu ? <span className="text-slate-400">lần {r.lan_thu}</span> : null}
              {r.bo_may && <span className="text-slate-500">{r.bo_may}</span>}
            </div>
            {coDoNuoc(r.do_nuoc) && <div className="mt-1"><ChiSoNuoc d={r.do_nuoc} /></div>}
          </div>
        ))}
      </div>
    </section>
  )
}
