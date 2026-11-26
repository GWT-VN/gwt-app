import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { theoMay, theoSerial, theoSku, tenNhom, tomTatNhom, type CaBaoCao } from '@/lib/loi/baoCaoNhom'
import { hienNgay } from '@/lib/dinh-dang-ngay'

// Báo cáo lỗi theo 4 nhóm: server component, đi sâu bằng link (?n=…&s=… / ?m=…&mn=…), không cần JS.
export type Href = (doi: Record<string, string | null>) => string

const MAU: Record<string, { o: string; cham: string; thanh: string }> = {
  MAIN: { o: 'border-orange-500 ring-orange-500', cham: 'bg-orange-500', thanh: 'bg-orange-400' },
  'RO-RI-NUOC': { o: 'border-sky-600 ring-sky-600', cham: 'bg-sky-600', thanh: 'bg-sky-500' },
  'CHAT-LUONG-NUOC': { o: 'border-emerald-600 ring-emerald-600', cham: 'bg-emerald-600', thanh: 'bg-emerald-500' },
  APP: { o: 'border-violet-600 ring-violet-600', cham: 'bg-violet-600', thanh: 'bg-violet-500' },
}
const TT: Record<string, { nhan: string; color: 'warning' | 'success' | 'secondary' }> = {
  Open: { nhan: 'Đang mở', color: 'warning' },
  Done: { nhan: 'Đã xong', color: 'success' },
  Cancel: { nhan: 'Đã huỷ', color: 'secondary' },
}
const ngayVN = (d: string) => hienNgay(d.slice(0, 10))
const ChipTT = ({ st }: { st: string }) => <Badge variant="soft" color={TT[st]?.color ?? 'secondary'}>{TT[st]?.nhan ?? st}</Badge>
const LinkTicket = ({ ma }: { ma: string }) => <Link href={`/ticket/${encodeURIComponent(ma)}`} prefetch={false} className="font-mono text-xs text-[var(--color-text-info)] underline underline-offset-2">{ma}</Link>
const Vach = ({ phan, lop }: { phan: number; lop: string }) => (
  <div className="h-2 min-w-16 rounded bg-muted overflow-hidden"><div className={`h-full ${lop}`} style={{ width: `${Math.round(phan * 100)}%` }} /></div>
)
const Th = ({ children, so }: { children?: React.ReactNode; so?: boolean }) => <TableHead scope="col" phai={so} className="whitespace-nowrap">{children}</TableHead>

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
            className={`rounded-xl border bg-card p-4 flex flex-col gap-1.5 min-w-0 hover:border-ring ${n === g.code ? `ring-2 ${MAU[g.code].o}` : ''}`}>
            <span className="flex items-center gap-2 font-semibold text-foreground"><i className={`h-2.5 w-2.5 rounded-sm ${MAU[g.code].cham}`} />{g.ten}</span>
            <span className="text-3xl font-bold tabular-nums text-foreground">{g.ticket}</span>
            <span className="text-xs text-muted-foreground">ticket · {g.may} máy · {g.dangMo} đang mở</span>
            <span className="flex flex-wrap gap-1">
              {g.con.slice(0, 4).map((c) => <span key={c.ten} className="rounded bg-muted px-1.5 text-[11px] text-muted-foreground">{c.ten} {c.so}</span>)}
            </span>
          </Link>
        ))}
      </div>
      <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span>Không tính vào lỗi: <b className="text-foreground">{t.khongPhaiLoi}</b> ticket &quot;Không phải lỗi&quot; (bảo trì, thay lõi, hướng dẫn)</span>
        <span><b className="text-foreground">{t.chuaPhanLoai}</b> ticket chưa phân loại — xếp nhóm ở Danh mục lỗi</span>
      </p>

      <Card className="overflow-hidden p-0">
        {!n ? <EmptyState size="sm" capTieuDe={2} tieuDe="Chọn nhóm lỗi" moTa="Bấm vào một nhóm lỗi để xem các máy (SKU) gặp lỗi đó." /> : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
              <h2 className="font-medium text-foreground">{tenNhom(n)}: máy nào gặp lỗi này</h2>
              <span className="text-xs text-muted-foreground">bấm tên máy để xem ticket</span>
            </div>
            {!may.length ? <EmptyState kieu="loc" size="sm" tieuDe="Không có ticket nào trong khoảng này." /> : (
              <Table variant="thuong">
                <TableHeader><TableRow><Th>Máy (SKU)</Th><Th so>Ticket</Th><Th /><Th so>Máy lỗi</Th><Th so>Đang mở</Th><Th>Lỗi con</Th></TableRow></TableHeader>
                <TableBody>{may.map((m) => (
                  <TableRow key={m.sku} className={`${s === m.sku ? 'bg-accent' : ''}`}>
                    <TableCell><Link href={href({ s: m.sku })} prefetch={false} className="font-semibold text-foreground underline">{m.sku}</Link></TableCell>
                    <TableCell phai className="tabular-nums">{m.ticket}</TableCell>
                    <TableCell className="w-32"><Vach phan={m.ticket / maxT} lop={MAU[n]?.thanh ?? 'bg-teal-500'} /></TableCell>
                    <TableCell phai className="tabular-nums">{m.may}</TableCell>
                    <TableCell phai className="tabular-nums">{m.dangMo}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.con.map((c) => `${c.ten} ${c.so}`).join(' · ')}</TableCell>
                  </TableRow>))}
                </TableBody></Table>
            )}
          </>
        )}
      </Card>

      {n && s && tk.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <p className="text-sm text-muted-foreground">{tenNhom(n)} › <b className="text-foreground">{s}</b> › {new Set(tk.map((c) => c.ticket_code)).size} ticket</p>
          </div>
          <Table variant="thuong">
            <TableHeader><TableRow><Th>Mã ticket</Th><Th>Ngày báo</Th><Th>Lỗi</Th><Th>Serial</Th><Th>Trạng thái</Th></TableRow></TableHeader>
            <TableBody>{tk.map((c, i) => (
              <TableRow key={`${c.ticket_code}-${i}`}>
                <TableCell><LinkTicket ma={c.ticket_code} /></TableCell>
                <TableCell className="tabular-nums">{ngayVN(c.ngay_bao)}</TableCell>
                <TableCell>{c.loi_ten}</TableCell>
                <TableCell className="font-mono text-xs">{c.may ?? '—'}</TableCell>
                <TableCell><ChipTT st={c.state} /></TableCell>
              </TableRow>))}
            </TableBody></Table>
        </Card>
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
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="font-medium text-foreground">Máy nào hay lỗi</h2>
          <span className="text-xs text-muted-foreground">tỷ lệ = máy từng báo lỗi ÷ máy đang chạy · bấm tên máy để xem nhóm lỗi</span>
        </div>
        {!rows.length ? <EmptyState kieu="loc" size="sm" tieuDe="Không có ticket lỗi nào trong khoảng này." /> : (
          <Table variant="thuong">
            <TableHeader><TableRow><Th>Máy (SKU)</Th><Th so>Đang chạy</Th><Th so>Máy từng lỗi</Th><Th so>Tỷ lệ</Th><Th /><Th so>Ticket</Th><Th>Nhóm lỗi</Th></TableRow></TableHeader>
            <TableBody>{rows.map((r) => (
              <TableRow key={r.sku} className={`${m === r.sku ? 'bg-accent' : ''}`}>
                <TableCell><Link href={href({ m: r.sku, mn: null })} prefetch={false} className="font-semibold text-foreground underline">{r.sku}</Link></TableCell>
                <TableCell phai className="tabular-nums">{r.dangChay || '—'}</TableCell>
                <TableCell phai className="tabular-nums">{r.mayLoi}</TableCell>
                <TableCell phai className="tabular-nums">{r.tyLe == null ? '—' : `${Math.round(r.tyLe * 100)}%`}</TableCell>
                <TableCell className="w-28">{r.tyLe != null && <Vach phan={r.tyLe / maxTl} lop="bg-teal-500" />}</TableCell>
                <TableCell phai className="tabular-nums">{r.ticket}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{Object.entries(r.theoNhom).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${tenNhom(k)} ${v}`).join(' · ')}</TableCell>
              </TableRow>))}
            </TableBody></Table>
        )}
      </Card>

      {dong && nhomChon && (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <p className="text-sm text-muted-foreground"><b className="text-foreground">{m}</b> › chọn nhóm lỗi:</p>
            {nhomCua.map(([k, v]) => (
              <Link key={k} href={href({ mn: k })} prefetch={false} aria-current={k === nhomChon ? 'true' : undefined}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${k === nhomChon ? `ring-1 font-semibold ${MAU[k]?.o ?? ''}` : 'text-muted-foreground'}`}>
                <i className={`h-2 w-2 rounded-sm ${MAU[k]?.cham ?? 'bg-slate-400'}`} />{tenNhom(k)} · {v}
              </Link>
            ))}
          </div>
          <Table variant="thuong">
            <TableHeader><TableRow><Th>Serial</Th><Th so>Số lần báo</Th><Th>Lỗi</Th><Th>Ticket</Th><Th>Mới nhất</Th></TableRow></TableHeader>
            <TableBody>{serial.map((x) => (
              <TableRow key={x.serial ?? '-'}>
                <TableCell className="font-mono text-xs">{x.serial ?? '(chưa có serial)'}</TableCell>
                <TableCell phai className="tabular-nums">{x.lan}</TableCell>
                <TableCell>{x.loi.join(' · ')}</TableCell>
                <TableCell><span className="flex flex-wrap gap-2">{x.ticket.map((t) => <LinkTicket key={t} ma={t} />)}</span></TableCell>
                <TableCell className="whitespace-nowrap"><ChipTT st={x.moiNhat.state} /> <span className="text-xs text-muted-foreground">{ngayVN(x.moiNhat.ngay)}</span></TableCell>
              </TableRow>))}
            </TableBody></Table>
        </Card>
      )}
    </div>
  )
}
