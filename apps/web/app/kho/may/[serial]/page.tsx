import Link from 'next/link'
import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { n, nhanLoaiPhieu } from '@/lib/kho/nhan'
import { chanKho } from '../../_gac'
import { KhungKho, LoiKho, Nhan, ngayVN, thu } from '../../_ui'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ serial: string }> }) {
  return { title: `${decodeURIComponent((await params).serial)} · GWT Kho` }
}

export default async function KhoMayChiTiet({ params }: { params: Promise<{ serial: string }> }) {
  await chanKho()
  const serial = decodeURIComponent((await params).serial)
  if (!daCauHinhKho()) return <KhungKho tieuDe={serial}><LoiKho /></KhungKho>
  const r = await thu(() => kho().traSerial(serial))
  if (!r.ok) return <KhungKho tieuDe={serial}><LoiKho loi={r.loi} /></KhungKho>
  const h = r.v
  if (!h.tim_thay) {
    return (
      <KhungKho tieuDe={serial}>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Chưa có hồ sơ kho cho serial này. Máy được tạo hồ sơ khi bot ghi nhập / định danh / kiểm kê.{' '}
          <Link href="/kho/may" className="text-indigo-700 underline">Về danh sách máy</Link>
        </div>
      </KhungKho>
    )
  }
  const m = h.may as Record<string, string | null>
  const truong: [string, React.ReactNode][] = [
    ['Model', <span key="m"><b>{m.internal_code}</b> {h.ten_model ? `· ${h.ten_model}` : ''}</span>],
    ['Tình trạng', <Nhan key="t" ma={m.tinh_trang} />],
    ['Trạng thái', <Nhan key="s" ma={m.trang_thai} />],
    ['Nơi để', `${h.dia_diem_ten ?? m.dia_diem_ma ?? ''}${m.dia_diem_chi_tiet ? ` · ${m.dia_diem_chi_tiet}` : ''}`],
    ['Sở hữu', n(m.so_huu)],
    ['Mục đích hiện tại', n(m.muc_dich_hien_tai) || '—'],
    ['Phương án', n(m.phuong_an) || '—'],
    ['Đã lắp cho khách (serial CSKH)', m.installed_serial ?? '—'],
    ['Ghi chú', m.ghi_chu ?? '—'],
  ]

  return (
    <KhungKho tieuDe={`Máy ${m.serial}`} moTa={<Link href="/kho/may" className="text-indigo-700 hover:underline">← Danh sách máy</Link>}>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <section className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Hồ sơ máy</h2>
          <dl className="space-y-1.5 text-sm">
            {truong.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[130px_1fr] gap-2"><dt className="text-slate-500">{k}</dt><dd className="text-slate-900">{v}</dd></div>
            ))}
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Hành trình ({h.lich_su.length} lần)</h2>
          <ol className="relative space-y-4 border-l border-slate-200 pl-5">
            {[...h.lich_su].reverse().map((b, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 ring-1 ring-indigo-200" />
                <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <b className="text-slate-900">{nhanLoaiPhieu(b.loai, b.muc_dich)}</b>
                  <span className="text-slate-500">{ngayVN(b.ngay)}</span>
                  <span className="font-mono text-xs text-slate-400">{b.phieu}</span>
                </div>
                <div className="text-sm text-slate-700">{b.tu ?? '—'} → {b.den ?? '—'}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                  {b.tinh_trang_truoc && b.tinh_trang_truoc !== b.tinh_trang_sau ? <><Nhan ma={b.tinh_trang_truoc} /> →</> : null}
                  <Nhan ma={b.tinh_trang_sau} />
                  {b.trang_thai_sau && <Nhan ma={b.trang_thai_sau} />}
                  {b.serial_truoc && b.serial_sau && b.serial_truoc !== b.serial_sau && <span>serial {b.serial_truoc} → {b.serial_sau}</span>}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Đề xuất: {b.de_xuat ?? '—'} · Xác nhận: {b.xac_nhan ?? '—'}
                  {b.nguoi_phu_trach ? ` · Phụ trách: ${b.nguoi_phu_trach}` : ''}
                  {b.nguon ? <> · <a href={b.nguon} target="_blank" rel="noreferrer" className="text-indigo-700 underline">tin Discord</a></> : null}
                </div>
                {(b.ghi_chu || b.ly_do) && <div className="mt-0.5 text-xs text-slate-600">{[b.ghi_chu, b.ly_do && `Lý do: ${b.ly_do}`].filter(Boolean).join(' · ')}</div>}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </KhungKho>
  )
}
