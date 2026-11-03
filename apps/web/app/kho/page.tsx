import { Suspense } from 'react'
import { BoLocChon } from '@/bang'
import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { n } from '@/lib/kho/nhan'
import { chanKho } from './_gac'
import { Bang, KhungKho, LinkMay, LoiKho, Nhan, O, TheSo, thu } from './_ui'

export const metadata = { title: 'Tồn kho · GWT Kho' }
export const dynamic = 'force-dynamic'

export default async function KhoTonPage({ searchParams }: { searchParams: Promise<{ nd?: string; model?: string }> }) {
  await chanKho()
  const { nd, model } = await searchParams
  if (!daCauHinhKho()) return <KhungKho tieuDe="Tồn kho"><LoiKho /></KhungKho>
  const r = await thu(() => kho().tonKho())
  if (!r.ok) return <KhungKho tieuDe="Tồn kho"><LoiKho loi={r.loi} /></KhungKho>
  const { dong, theoModel } = r.v

  const noiDe = [...new Map(dong.map((d) => [d.dia_diem, d.dia_diem_ten])).entries()].map(([giaTri, nhan]) => ({ giaTri, nhan }))
  const loc = dong.filter((d) => (!nd || d.dia_diem === nd) && (!model || d.internal_code === model))
  const tong = (f: (x: (typeof theoModel)[number]) => number) => theoModel.reduce((s, x) => s + f(x), 0)

  return (
    <KhungKho tieuDe="Tồn kho" moTa="Máy theo serial, tính theo hồ sơ máy + sổ số lượng (dòng “chưa định danh” = máy có trong sổ nhưng chưa gắn serial).">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TheSo nhan="Trong kho" so={tong((x) => x.trongKho)} phu="kể cả máy chưa có serial" />
        <TheSo nhan="Máy công ty ở ngoài" so={tong((x) => x.ngoaiKho)} phu="trưng bày, test nước, quay, bảo hành…" />
        <TheSo nhan="Chưa gắn serial" so={tong((x) => x.chuaSerial)} phu="cần định danh / kiểm kê" />
        <TheSo nhan="Số model" so={theoModel.length} />
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Theo model</h2>
        <Bang dau={['Model', 'Tên', 'Trong kho', 'Ở ngoài', 'Chưa serial', 'Tổng']} trong={!theoModel.length}>
          {theoModel.map((m) => (
            <tr key={m.internal_code} className="hover:bg-slate-50">
              <O><a href={`/kho?model=${encodeURIComponent(m.internal_code)}`} className="font-medium text-indigo-700 hover:underline">{m.internal_code}</a></O>
              <O>{m.ten ?? ''}</O>
              <O cls="text-center">{m.trongKho}</O><O cls="text-center">{m.ngoaiKho}</O>
              <O cls="text-center">{m.chuaSerial || ''}</O><O cls="text-center font-semibold">{m.tong}</O>
            </tr>
          ))}
        </Bang>
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-700">Chi tiết theo nơi để · tình trạng{model ? ` — ${model}` : ''}</h2>
          <Suspense fallback={null}><BoLocChon param="nd" nhan="Mọi nơi để" tuyChon={noiDe} /></Suspense>
        </div>
        <Bang dau={['Model', 'Nơi để', 'Trong / ngoài kho', 'Tình trạng', 'SL', 'Serial']} trong={!loc.length}>
          {loc.map((d, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <O cls="font-medium">{d.internal_code}</O>
              <O>{d.dia_diem_ten}</O>
              <O cls="text-slate-500">{d.loai_dia_diem === 'kho' ? 'trong kho' : `ngoài kho (${n(d.loai_dia_diem)})`}</O>
              <O><Nhan ma={d.tinh_trang} /></O>
              <O cls="text-center font-semibold">{d.so_luong}</O>
              <O>
                <div className="flex max-w-[520px] flex-wrap gap-x-2 gap-y-0.5">
                  {d.serials.length ? d.serials.map((s) => <LinkMay key={s} serial={s} />) : <span className="text-slate-400">—</span>}
                </div>
              </O>
            </tr>
          ))}
        </Bang>
      </section>
    </KhungKho>
  )
}
