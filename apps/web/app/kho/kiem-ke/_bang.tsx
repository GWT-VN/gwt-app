'use client'

import { useMemo, useState } from 'react'
import { boDau } from '@/bang'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import type { MucDanhMuc } from '@/lib/kho/doc'
import type { KetQuaKiemKe } from '@/lib/kho/ghi'
import { chuanHoaKiemKe } from '@/lib/kho/sua'
import { kiemKeKho } from '../actions'

type DongKiem = { ma: string; ten: string | null; don_vi: string | null; ton: number | null }

const so = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(n)

/** Bảng tồn theo mã + ô "SL đếm". Gửi các ô đã điền → hiện bảng kết quả (tồn trước, đếm, chênh). */
export function BangKiemKe({ kho, dong, danhMuc }: { kho: string; dong: DongKiem[]; danhMuc: MucDanhMuc[] }) {
  const [them, setThem] = useState<DongKiem[]>([])
  const [dem, setDem] = useState<Record<string, string>>({})
  const [q, setQ] = useState('')
  const [loi, setLoi] = useState<string | null>(null)
  const [ketQua, setKetQua] = useState<KetQuaKiemKe[] | null>(null)
  const [xacNhan, setXacNhan] = useState<ReturnType<typeof chuanHoaKiemKe> | null>(null)

  const tatCa = useMemo(() => [...them, ...dong], [them, dong])
  const coSan = useMemo(() => new Set(tatCa.map((d) => d.ma)), [tatCa])
  const tuyChonThem = useMemo(() => danhMuc.filter((d) => !coSan.has(d.ma)).map((d) => ({ gt: d.ma, nhan: d.ten ?? d.ma })), [danhMuc, coSan])
  const s = boDau(q.trim())
  const hien = s ? tatCa.filter((d) => boDau(d.ma).includes(s) || boDau(d.ten ?? '').includes(s) || (dem[d.ma] ?? '') !== '') : tatCa
  const soDaDien = Object.values(dem).filter((v) => v.trim() !== '').length

  function themMa(ma: string) {
    if (!ma || coSan.has(ma)) return
    const m = danhMuc.find((d) => d.ma === ma)
    setThem((x) => [{ ma, ten: m?.ten ?? null, don_vi: null, ton: null }, ...x])
  }

  function chuanBi() {
    setLoi(null)
    try {
      setXacNhan(chuanHoaKiemKe(Object.entries(dem).map(([internal_code, so_dem]) => ({ internal_code, so_dem }))))
    } catch (e) {
      setLoi((e as Error).message)
    }
  }

  async function gui() {
    if (!xacNhan) return
    setLoi(null)
    const r = await kiemKeKho(xacNhan, kho)
    if (!r.ok) {
      setLoi(r.error)
      throw new Error(r.error)
    }
    setKetQua(r.ketQua)
    setDem({})
    setThem([])
  }


  const tenCua = (ma: string) => tatCa.find((d) => d.ma === ma)?.ten ?? danhMuc.find((d) => d.ma === ma)?.ten ?? ''

  return (
    <div className="space-y-3">
      {ketQua && (
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <b className="text-sm text-(--color-text-success)">Đã ghi kiểm kê {ketQua.length} mã · {ketQua.filter((x) => x.chenh !== 0).length} mã lệch → có dòng Điều chỉnh</b>
            <Button type="button" size="sm" variant="ghost" onClick={() => setKetQua(null)}>Đóng</Button>
          </div>
          <TableWrap vien>
            <Table variant="thuong">
              <TableHeader>
                <TableRow><TableHead scope="col">Mã</TableHead><TableHead scope="col">Tên</TableHead><TableHead phai scope="col">Tồn trước</TableHead><TableHead phai scope="col">Đếm</TableHead><TableHead phai scope="col">Chênh</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {ketQua.map((x) => (
                  <TableRow key={x.internal_code}>
                    <TableCell className="font-mono text-[13px]">{x.internal_code}</TableCell>
                    <TableCell className="whitespace-normal">{tenCua(x.internal_code)}</TableCell>
                    <TableCell phai>{so(x.ton_truoc)}</TableCell>
                    <TableCell phai>{so(x.so_dem)}</TableCell>
                    <TableCell className={`text-right font-semibold ${x.chenh > 0 ? 'text-(--color-text-success)' : x.chenh < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {x.chenh === 0 ? 'khớp' : (x.chenh > 0 ? '+' : '') + so(x.chenh)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        </Card>
      )}

      <Card className="flex flex-wrap items-center gap-2">
        <Input aria-label="Lọc mã hoặc tên" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lọc mã / tên…"
          className="w-56 max-w-full" />
        <div className="w-72 max-w-full">
          <Combobox aria-label="Thêm mã chưa có trong bảng" value={null} onValueChange={(ma) => { if (ma) themMa(ma) }} options={tuyChonThem}
            placeholder="+ Thêm mã chưa có trong bảng…" />
        </div>
        <span className="ml-auto text-xs text-muted-foreground">Đã điền {soDaDien} mã</span>
        <Button type="button" onClick={chuanBi} disabled={!soDaDien}>Ghi kiểm kê</Button>
      </Card>
      {loi && !xacNhan && <Alert color="danger"><AlertDescription>{loi}</AlertDescription></Alert>}
      <ConfirmDialog
        open={xacNhan !== null}
        onOpenChange={(open) => { if (!open) setXacNhan(null) }}
        tieuDe={`Ghi kiểm kê ${xacNhan?.length ?? 0} mã?`}
        moTa="Các mã bị lệch sẽ có dòng Điều chỉnh trong sổ kho ngay khi ghi."
        nutXacNhan="Ghi vào sổ"
        pha
        loi={loi}
        onXacNhan={gui}
      />

      <TableWrap vien>
          <Table variant="thuong">
            <TableHeader>
              <TableRow><TableHead scope="col">Mã</TableHead><TableHead scope="col">Tên</TableHead><TableHead scope="col">ĐVT</TableHead>
                <TableHead phai scope="col">Tồn sổ</TableHead><TableHead phai scope="col">SL đếm</TableHead><TableHead phai scope="col">Chênh (dự kiến)</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {!hien.length && <TableRow><TableCell colSpan={6} className="px-3 py-10 text-center text-muted-foreground">Không có mã nào khớp.</TableCell></TableRow>}
              {hien.map((d) => {
                const v = dem[d.ma] ?? ''
                const n = v.trim() === '' ? null : Number(v.replace(',', '.'))
                const chenh = n !== null && Number.isFinite(n) ? n - (d.ton ?? 0) : null
                return (
                  <TableRow key={d.ma} chon={v !== ''}>
                    <TableCell className="font-mono text-[13px]">{d.ma}</TableCell>
                    <TableCell className="whitespace-normal">{d.ten ?? ''}</TableCell>
                    <TableCell className="text-muted-foreground">{d.don_vi ?? ''}</TableCell>
                    <TableCell className={`text-right ${d.ton !== null && d.ton < 0 ? 'text-destructive' : ''}`}>{d.ton === null ? <span className="text-muted-foreground">0 (mới)</span> : so(d.ton)}</TableCell>
                    <TableCell phai>
                      <Input inputMode="decimal" className="ml-auto w-24 text-right" value={v} onChange={(e) => setDem((x) => ({ ...x, [d.ma]: e.target.value }))} aria-label={`SL đếm ${d.ma}`} />
                    </TableCell>
                    <TableCell className={`text-right text-xs ${chenh ? (chenh > 0 ? 'text-(--color-text-success)' : 'text-destructive') : 'text-muted-foreground'}`}>
                      {chenh === null ? '' : chenh === 0 ? 'khớp' : (chenh > 0 ? '+' : '') + so(chenh)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
      </TableWrap>
    </div>
  )
}
