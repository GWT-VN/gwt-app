'use client'

import { Checkbox } from '@/components/ui/checkbox'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { Table, TableWrap, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { luuOChinhSach, luuHangLoat, type DongChinhSach, type DongLichSuGia } from './actions'
import { capGiaVaPct, type Bac } from '../_ctkm'

const vnd = new Intl.NumberFormat('vi-VN')
const BAC: { ma: Bac; nhan: string }[] = [
  { ma: 'NPP', nhan: 'Cấp 1 · NPP' },
  { ma: 'DAI_LY', nhan: 'Cấp 2 · Đại lý' },
  { ma: 'GIOI_THIEU', nhan: 'Cấp 3 · Giới thiệu' },
]

export function BangChinhSach({
  ds, lichSu, coQuyenSoan,
}: { ds: DongChinhSach[]; lichSu: DongLichSuGia[]; coQuyenSoan: boolean }) {
  const router = useRouter()
  const [dangChay, batDau] = useTransition()
  const giaKhiFocus = useRef('')
  const oChuaLuu = useRef(new Set<string>())
  const [loi, setLoi] = useState<string | null>(null)
  /** Giá trị đang gõ, chưa lưu — khoá `${ma}|${bac}|${pct|gia}`. */
  const [nhap, setNhap] = useState<Record<string, string>>({})
  /** Mã đang tick để sửa hàng loạt. */
  const [tick, setTick] = useState<Set<string>>(new Set())
  const [bacHL, setBacHL] = useState<Bac>('DAI_LY')
  const [pctHL, setPctHL] = useState('')
  const [xemLichSu, setXemLichSu] = useState(false)

  function doiTick(ma: string) {
    setTick((t) => { const n = new Set(t); if (n.has(ma)) n.delete(ma); else n.add(ma); return n })
  }
  const tickHet = ds.length > 0 && tick.size === ds.length

  function apHangLoat() {
    const v = pctHL.trim()
    const so = v === '' ? null : Number(v)
    if (v !== '' && !Number.isFinite(so)) { setLoi('Mức giảm không phải số.'); return }
    setLoi(null)
    batDau(async () => {
      const r = await luuHangLoat(bacHL, [...tick], 'PCT', so)
      if (!r.ok) setLoi(r.error)
      else { setTick(new Set()); setPctHL(''); setNhap({}); oChuaLuu.current.clear(); router.refresh() }
    })
  }

  const khoa = (ma: string, bac: Bac, o: 'pct' | 'gia') => `${ma}|${bac}|${o}`

  function o(dong: DongChinhSach, bac: Bac, kieu: 'pct' | 'gia'): string {
    const k = khoa(dong.ma, bac, kieu)
    if (k in nhap) return nhap[k]
    const c = dong.bac[bac]
    if (!c) return ''
    const v = kieu === 'pct' ? c.giam_pct : c.gia_ban
    return v == null ? '' : String(v)
  }

  function goVao(dong: DongChinhSach, bac: Bac, kieu: 'pct' | 'gia', v: string) {
    const so = v === '' ? null : Number(v)
    const cap = capGiaVaPct(dong.niem_yet, kieu === 'pct' ? 'PCT' : 'GIA', so)
    setNhap((n) => ({
      ...n,
      [khoa(dong.ma, bac, kieu)]: v,
      // Ô kia tự tính theo — CEO chốt: điền một ô, ô còn lại tự ra.
      [khoa(dong.ma, bac, kieu === 'pct' ? 'gia' : 'pct')]:
        v === '' ? '' : String(kieu === 'pct' ? (cap.gia ?? '') : (cap.pct ?? '')),
    }))
  }

  function luu(dong: DongChinhSach, bac: Bac, kieu: 'pct' | 'gia') {
    if (!coQuyenSoan) return
    const v = o(dong, bac, kieu)
    const idO = khoa(dong.ma, bac, kieu)
    if (v === giaKhiFocus.current && !oChuaLuu.current.has(idO)) return
    const so = v === '' ? null : Number(v)
    setLoi(null)
    batDau(async () => {
      const r = await luuOChinhSach(bac, dong.ma, kieu === 'pct' ? 'PCT' : 'GIA', so, dong.niem_yet)
      if (!r.ok) {
        oChuaLuu.current.add(idO)
        setLoi(`${r.error} Rời ô giá vừa sửa để thử lại.`)
      } else {
        oChuaLuu.current.delete(idO)
        router.refresh()
      }
    })
  }

  const inpO = 'text-right tabular-nums'

  return (
    <div className="space-y-2">
      {loi && <Alert color="danger"><AlertDescription>{loi}</AlertDescription></Alert>}

      {/* SỬA HÀNG LOẠT — CEO chốt 22/08: các mã thường giống nhau, phải đặt được một lượt. */}
      {coQuyenSoan && (
        <div className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 transition ${
          tick.size ? 'border-(--color-border-info-surface) bg-(--color-background-info-surface)' : 'border-border bg-card'}`}>
          <span className="text-sm font-semibold text-foreground">
            {tick.size ? `Đã chọn ${tick.size} mã` : 'Sửa hàng loạt'}
          </span>
          {tick.size === 0 ? (
            <span className="text-xs text-muted-foreground">Tick vào các mã bên dưới để đặt cùng một mức giảm.</span>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">đặt</span>
              <div className="min-w-40"><NativeSelect aria-label="Bậc áp hàng loạt" value={bacHL}
                onChange={(e) => setBacHL(e.target.value as Bac)}>
                {BAC.map((b) => <NativeSelectOption key={b.ma} value={b.ma}>{b.nhan}</NativeSelectOption>)}
              </NativeSelect></div>
              <span className="text-sm text-muted-foreground">giảm</span>
              <Input type="number" className="w-24 text-right tabular-nums"
                aria-label="Mức giảm áp hàng loạt" placeholder="%" value={pctHL} onChange={(e) => setPctHL(e.target.value)} />
              <Button disabled={dangChay} onClick={apHangLoat}>
                {dangChay ? 'Đang áp…' : `Áp cho ${tick.size} mã`}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setTick(new Set())}>Bỏ chọn</Button>
              <span className="w-full text-xs text-muted-foreground">
                Để trống ô % rồi bấm Áp = <b>bỏ chính sách</b> của {tick.size} mã này ở bậc trên. Bản cũ vẫn nằm trong lịch sử.
              </span>
            </>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <TableWrap tabIndex={0} aria-label="Bảng chính sách giá">
          <Table variant="thuong" aria-label="Chính sách giá theo sản phẩm và cấp đại lý">
            <TableHeader className="bg-muted text-[10px] uppercase tracking-wide text-muted-foreground">
              <TableRow>
                {coQuyenSoan && (
                  <TableHead rowSpan={2} className="border-b border-border px-3 py-2 align-bottom">
                    <Checkbox checked={tickHet}
                      aria-label={tickHet ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      onCheckedChange={() => setTick(tickHet ? new Set() : new Set(ds.map((d) => d.ma)))} />
                  </TableHead>
                )}
                <TableHead rowSpan={2} className="border-b border-border px-3 py-2 align-bottom font-bold">Sản phẩm</TableHead>
                <TableHead rowSpan={2} className="border-b border-border px-3 py-2 text-right align-bottom font-bold">Niêm yết</TableHead>
                {BAC.map((b) => (
                  <TableHead key={b.ma} colSpan={2} className="border-b border-l border-border px-3 py-2 text-center font-bold">{b.nhan}</TableHead>
                ))}
              </TableRow>
              <TableRow>
                {BAC.map((b) => (
                  <TableHead key={b.ma} className="border-b border-l border-border px-2 py-1.5 text-center font-medium" colSpan={2}>
                    <span className="mr-6">% giảm</span><span>Giá bán</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ds.map((d) => (
                <TableRow key={d.ma} className={tick.has(d.ma) ? 'bg-(--color-background-info-surface)' : 'hover:bg-muted'}>
                  {coQuyenSoan && (
                    <TableCell className="px-3 py-2">
                      <Checkbox aria-label={`Chọn ${d.ten}`} checked={tick.has(d.ma)} onCheckedChange={() => doiTick(d.ma)} />
                    </TableCell>
                  )}
                  <TableCell className="px-3 py-2">
                    <div className="font-medium text-foreground">{d.ten}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{d.ma}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-foreground">
                    {vnd.format(d.niem_yet)} ₫
                  </TableCell>
                  {BAC.map((b) => (
                    <TableCell key={b.ma} className="border-l border-border px-2 py-2" colSpan={2}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Input
                          type="number" className={inpO + ' w-[86px]'} disabled={!coQuyenSoan || dangChay}
                          aria-label={`${d.ten} (${d.ma}) · ${b.nhan} · % giảm`}
                          value={o(d, b.ma, 'pct')}
                          onFocus={(e) => { giaKhiFocus.current = e.currentTarget.value }}
                          onChange={(e) => goVao(d, b.ma, 'pct', e.target.value)}
                          onBlur={() => luu(d, b.ma, 'pct')}
                          placeholder="%"
                        />
                        <Input
                          type="number" className={inpO + ' w-[118px]'} disabled={!coQuyenSoan || dangChay}
                          aria-label={`${d.ten} (${d.ma}) · ${b.nhan} · Giá bán`}
                          value={o(d, b.ma, 'gia')}
                          onFocus={(e) => { giaKhiFocus.current = e.currentTarget.value }}
                          onChange={(e) => goVao(d, b.ma, 'gia', e.target.value)}
                          onBlur={() => luu(d, b.ma, 'gia')}
                          placeholder="₫"
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </div>
      <p className="text-xs text-muted-foreground">
        📌 <b>Điền một ô, ô kia tự tính.</b> Gõ % giảm → ra giá bán; gõ giá bán → ra % giảm.
        Rời khỏi ô là lưu. Xoá trắng ô = bỏ chính sách của mã đó ở bậc đó.
      </p>
      {/* LỊCH SỬ PHIÊN BẢN — CEO chốt 22/08: phải biết đã đổi những gì, khi nào. */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Button type="button" variant="ghost" shape="rounded" aria-expanded={xemLichSu} onClick={() => setXemLichSu((v) => !v)}
          className="h-auto w-full justify-between rounded-none px-4 py-3 font-semibold">
          <span>Lịch sử thay đổi <span className="ml-1 font-normal text-muted-foreground">({lichSu.length} bản ghi)</span></span>
          <span className="text-muted-foreground">{xemLichSu ? '▲' : '▼'}</span>
        </Button>
        {xemLichSu && (
          <div className="overflow-x-auto border-t border-border">
            <Table variant="thuong">
              <TableHeader className="border-b border-border bg-muted text-[10px] uppercase tracking-wide text-muted-foreground">
                <TableRow>
                  <TableHead className="px-3 py-2 font-medium">Sản phẩm</TableHead>
                  <TableHead className="px-3 py-2 font-medium">Bậc</TableHead>
                  <TableHead className="px-3 py-2 text-right font-medium">% giảm</TableHead>
                  <TableHead className="px-3 py-2 text-right font-medium">Giá bán</TableHead>
                  <TableHead className="px-3 py-2 font-medium">Áp từ</TableHead>
                  <TableHead className="px-3 py-2 font-medium">Đến</TableHead>
                  <TableHead className="px-3 py-2 font-medium">Ai đặt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lichSu.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Chưa có thay đổi nào được ghi lại.</TableCell></TableRow>
                ) : lichSu.map((h, i) => {
                  const cu = h.trang_thai === 'thay_the'
                  return (
                    <TableRow key={i} className={cu ? 'text-muted-foreground' : 'hover:bg-muted'}>
                      <TableCell className="px-3 py-2">
                        <div className={cu ? '' : 'text-foreground'}>{h.ten}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{h.ma}</div>
                      </TableCell>
                      <TableCell className="px-3 py-2">{BAC.find((b) => b.ma === h.bac)?.nhan ?? h.bac}</TableCell>
                      <TableCell className="px-3 py-2 text-right tabular-nums">{h.giam_pct == null ? '—' : `${h.giam_pct}%`}</TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{h.gia_ban == null ? '—' : `${vnd.format(h.gia_ban)} ₫`}</TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-2 tabular-nums">{h.hieu_luc_tu}</TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-2 tabular-nums">
                        {cu ? h.hieu_luc_den
                            : <Badge variant="soft" color="success">đang áp</Badge>}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs">{h.boi ?? '—'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        📌 App lưu <b>cả hai</b> con số kèm ghi nhớ ô nào bạn gõ — để số hiển thị luôn đúng thứ đã duyệt,
        không lệch vài đồng vì tính lại từ phần trăm.
      </p>
    </div>
  )
}
