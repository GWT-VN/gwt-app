import Link from 'next/link'
import { theoMay, theoSerial, theoSku, tenNhom, tomTatNhom, type CaBaoCao } from '@/lib/loi/baoCaoNhom'

// Báo cáo lỗi theo 4 nhóm: server component, đi sâu bằng link (?n=…&s=… / ?m=…&mn=…), không cần JS.
export type Href = (doi: Record<string, string | null>) => string

const MAU: Record<string, { o: string; cham: string; thanh: string }> = {
  MAIN: { o: 'border-orange-500 ring-orange-500', cham: 'bg-orange-500', thanh: 'bg-orange-400' },
  'RO-RI-NUOC': { o: 'border-sky-600 ring-sky-600', cham: 'bg-sky-600', thanh: 'bg-sky-500' },
  'CHAT-LUONG-NUOC': { o: 'border-emerald-600 ring-emerald-600', cham: 'bg-emerald-600', thanh: 'bg-emerald-500' },
  APP: { o: 'border-violet-600 ring-violet-600', cham: 'bg-violet-600', thanh: 'bg-violet-500' },
}
const TT: Record<string, { nhan: string; lop: string }> = {
  Open: { nhan: 'Đang mở', lop: 'bg-amber-100 text-amber-800' },
  Done: { nhan: 'Đã xong', lop: 'bg-emerald-100 text-emerald-800' },
  Cancel: { nhan: 'Đã huỷ', lop: 'bg-slate-100 text-slate-500' },
}
const ngayVN = (d: string) => d.slice(0, 10).split('-').reverse().join('/')
const ChipTT = ({ st }: { st: string }) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TT[st]?.lop ?? 'bg-slate-100'}`}>{TT[st]?.nhan ?? st}</span>
const LinkTicket = ({ ma }: { ma: string }) => <Link href={`/ticket/${encodeURIComponent(ma)}`} prefetch={false} className="font-mono text-xs text-teal-700 underline">{ma}</Link>
const Vach = ({ phan, lop }: { phan: number; lop: string }) => (
  <div className="h-2 min-w-16 rounded bg-slate-100 overflow-hidden"><div className={`h-full ${lop}`} style={{ width: `${Math.round(phan * 100)}%` }} /></div>
)
const Th = ({ children, so }: { children?: React.ReactNode; so?: boolean }) => <th className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap ${so ? 'text-right' : 'text-left'}`}>{children}</th>

export function TheoNhom({ ca, n, s, href }: { ca: CaBaoCao[]; n: string | null; s: string | null; href: Href }) {
  const t = tomTatNhom(ca)
  const a = n ? ca.filter((c) => c.nhom === n) : []
  const may = theoSku(a)
  const maxT = Math.max(1, ...may.map((m) => m.ticket))
  const tk = s ? a.filter((c) => c.internal_code === s).sort((x, y) => y.ngay_bao.localeCompare(x.ngay_bao)) : []
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {t.nhom.map((g) => (
          <Link key={g.code} href={href({ n: n === g.code ? null : g.code, s: null })} prefetch={false} aria-current={n === g.code ? 'true' : undefined}
            className={`rounded-xl border bg-white p-4 flex flex-col gap-1.5 min-w-0 hover:border-slate-400 ${n === g.code ? `ring-2 ${MAU[g.code].o}` : ''}`}>
            <span className="flex items-center gap-2 font-semibold text-slate-900"><i className={`h-2.5 w-2.5 rounded-sm ${MAU[g.code].cham}`} />{g.ten}</span>
            <span className="text-3xl font-bold tabular-nums text-slate-900">{g.ticket}</span>
            <span className="text-xs text-slate-500">ticket · {g.may} máy · {g.dangMo} đang mở</span>
            <span className="flex flex-wrap gap-1">
              {g.con.slice(0, 4).map((c) => <span key={c.ten} className="rounded bg-slate-100 px-1.5 text-[11px] text-slate-600">{c.ten} {c.so}</span>)}
            </span>
          </Link>
        ))}
      </div>
      <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        <span>Không tính vào lỗi: <b className="text-slate-700">{t.khongPhaiLoi}</b> ticket &quot;Không phải lỗi&quot; (bảo trì, thay lõi, hướng dẫn)</span>
        <span><b className="text-slate-700">{t.chuaPhanLoai}</b> ticket chưa phân loại — xếp nhóm ở Danh mục lỗi</span>
      </p>

      <section className="rounded-xl border bg-white">
        {!n ? <p className="p-6 text-center text-sm text-slate-500">Bấm vào một nhóm lỗi để xem các máy (SKU) gặp lỗi đó.</p> : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
              <h2 className="font-medium text-slate-900">{tenNhom(n)}: máy nào gặp lỗi này</h2>
              <span className="text-xs text-slate-500">bấm tên máy để xem ticket</span>
            </div>
            {!may.length ? <p className="p-6 text-center text-sm text-slate-500">Không có ticket nào trong khoảng này.</p> : (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b"><Th>Máy (SKU)</Th><Th so>Ticket</Th><Th /><Th so>Máy lỗi</Th><Th so>Đang mở</Th><Th>Lỗi con</Th></tr></thead>
                <tbody>{may.map((m) => (
                  <tr key={m.sku} className={`border-b last:border-0 ${s === m.sku ? 'bg-teal-50' : ''}`}>
                    <td className="px-3 py-2"><Link href={href({ s: m.sku })} prefetch={false} className="font-semibold text-slate-900 underline">{m.sku}</Link></td>
                    <td className="px-3 py-2 text-right tabular-nums">{m.ticket}</td>
                    <td className="px-3 py-2 w-32"><Vach phan={m.ticket / maxT} lop={MAU[n]?.thanh ?? 'bg-teal-500'} /></td>
                    <td className="px-3 py-2 text-right tabular-nums">{m.may}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{m.dangMo}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{m.con.map((c) => `${c.ten} ${c.so}`).join(' · ')}</td>
                  </tr>))}
                </tbody></table></div>
            )}
          </>
        )}
      </section>

      {n && s && tk.length > 0 && (
        <section className="rounded-xl border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <p className="text-sm text-slate-500">{tenNhom(n)} › <b className="text-slate-900">{s}</b> › {new Set(tk.map((c) => c.ticket_code)).size} ticket</p>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b"><Th>Mã ticket</Th><Th>Ngày báo</Th><Th>Lỗi</Th><Th>Serial</Th><Th>Trạng thái</Th></tr></thead>
            <tbody>{tk.map((c, i) => (
              <tr key={`${c.ticket_code}-${i}`} className="border-b last:border-0">
                <td className="px-3 py-2"><LinkTicket ma={c.ticket_code} /></td>
                <td className="px-3 py-2 tabular-nums">{ngayVN(c.ngay_bao)}</td>
                <td className="px-3 py-2">{c.loi_ten}</td>
                <td className="px-3 py-2 font-mono text-xs">{c.may ?? '—'}</td>
                <td className="px-3 py-2"><ChipTT st={c.state} /></td>
              </tr>))}
            </tbody></table></div>
        </section>
      )}
    </div>
  )
}

export function TheoMay({ ca, dangChay, m, mn, href }: { ca: CaBaoCao[]; dangChay: Record<string, number>; m: string | null; mn: string | null; href: Href }) {
  const rows = theoMay(ca, dangChay)
  const maxTl = Math.max(0.0001, ...rows.map((r) => r.tyLe ?? 0))
  const dong = m ? rows.find((r) => r.sku === m) : undefined
  const nhomCua = dong ? Object.entries(dong.theoNhom).sort((a, b) => b[1] - a[1]) : []
  const nhomChon = mn && dong?.theoNhom[mn] ? mn : nhomCua[0]?.[0]
  const serial = dong && nhomChon ? theoSerial(ca.filter((c) => c.internal_code === m && c.nhom === nhomChon)) : []
  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="font-medium text-slate-900">Máy nào hay lỗi</h2>
          <span className="text-xs text-slate-500">tỷ lệ = máy từng báo lỗi ÷ máy đang chạy · bấm tên máy để xem nhóm lỗi</span>
        </div>
        {!rows.length ? <p className="p-6 text-center text-sm text-slate-500">Không có ticket lỗi nào trong khoảng này.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b"><Th>Máy (SKU)</Th><Th so>Đang chạy</Th><Th so>Máy từng lỗi</Th><Th so>Tỷ lệ</Th><Th /><Th so>Ticket</Th><Th>Nhóm lỗi</Th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.sku} className={`border-b last:border-0 ${m === r.sku ? 'bg-teal-50' : ''}`}>
                <td className="px-3 py-2"><Link href={href({ m: r.sku, mn: null })} prefetch={false} className="font-semibold text-slate-900 underline">{r.sku}</Link></td>
                <td className="px-3 py-2 text-right tabular-nums">{r.dangChay || '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.mayLoi}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.tyLe == null ? '—' : `${Math.round(r.tyLe * 100)}%`}</td>
                <td className="px-3 py-2 w-28">{r.tyLe != null && <Vach phan={r.tyLe / maxTl} lop="bg-teal-500" />}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.ticket}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{Object.entries(r.theoNhom).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${tenNhom(k)} ${v}`).join(' · ')}</td>
              </tr>))}
            </tbody></table></div>
        )}
      </section>

      {dong && nhomChon && (
        <section className="rounded-xl border bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <p className="text-sm text-slate-500"><b className="text-slate-900">{m}</b> › chọn nhóm lỗi:</p>
            {nhomCua.map(([k, v]) => (
              <Link key={k} href={href({ mn: k })} prefetch={false} aria-current={k === nhomChon ? 'true' : undefined}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${k === nhomChon ? `ring-1 font-semibold ${MAU[k]?.o ?? ''}` : 'text-slate-600'}`}>
                <i className={`h-2 w-2 rounded-sm ${MAU[k]?.cham ?? 'bg-slate-400'}`} />{tenNhom(k)} · {v}
              </Link>
            ))}
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b"><Th>Serial</Th><Th so>Số lần báo</Th><Th>Lỗi</Th><Th>Ticket</Th><Th>Mới nhất</Th></tr></thead>
            <tbody>{serial.map((x) => (
              <tr key={x.serial ?? '-'} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono text-xs">{x.serial ?? '(chưa có serial)'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{x.lan}</td>
                <td className="px-3 py-2">{x.loi.join(' · ')}</td>
                <td className="px-3 py-2"><span className="flex flex-wrap gap-2">{x.ticket.map((t) => <LinkTicket key={t} ma={t} />)}</span></td>
                <td className="px-3 py-2 whitespace-nowrap"><ChipTT st={x.moiNhat.state} /> <span className="text-xs text-slate-500">{ngayVN(x.moiNhat.ngay)}</span></td>
              </tr>))}
            </tbody></table></div>
        </section>
      )}
    </div>
  )
}
