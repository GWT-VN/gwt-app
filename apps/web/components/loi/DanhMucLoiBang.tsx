'use client'

import { Fragment, useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import type { MucChon } from '@/bang'
import { luuLoi, datTrangThaiLoi } from '@/app/ticket/loi-actions'
import { CHUA_PHAN_LOAI } from '@/lib/loi/dongMay'
import type { LoiDanhMuc, TrangThaiLoi } from '@/lib/loi/kieu'
import { catNgan, formTuLoi, loiTuForm, NHAN_TRANG_THAI, tomTatDanhSach, type FormLoi } from '@/lib/loi/giaoDienDanhMuc'

const MAU: Record<TrangThaiLoi, 'warning' | 'success' | 'secondary'> = {
  cho_duyet: 'warning',
  da_duyet: 'success',
  ngung: 'secondary',
}

export function DanhMucLoiBang({ rows, choSua, nhomTuyChon = [] }: { rows: LoiDanhMuc[]; choSua: boolean; nhomTuyChon?: MucChon[] }) {
  const router = useRouter()
  const nhanNhom = useId()
  const [dangSua, setDangSua] = useState<string | null>(null)
  const [form, setForm] = useState<FormLoi | null>(null)
  const [loi, setLoi] = useState<Record<string, string>>({})
  const [ban, chay] = useTransition()

  const dat = (code: string, e?: string) => setLoi((l) => ({ ...l, [code]: e ?? '' }))
  const luu = (code: string) => form && chay(async () => {
    const r = await luuLoi(loiTuForm(form))
    if (!r.ok) return dat(code, r.error)
    dat(code); setDangSua(null); router.refresh()
  })
  const doi = (code: string, tt: TrangThaiLoi) => chay(async () => {
    const r = await datTrangThaiLoi(code, tt)
    if (!r.ok) return dat(code, r.error)
    dat(code); router.refresh()
  })
  const f = (k: keyof FormLoi) => (e: { target: { value: string } }) => setForm((x) => x && { ...x, [k]: e.target.value })

  return (
    <TableWrap vien>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Mã</TableHead><TableHead scope="col">Tên chuẩn</TableHead><TableHead scope="col">Nhóm</TableHead>
            <TableHead scope="col">Mã máy</TableHead><TableHead scope="col">Các cách ghi</TableHead>
            <TableHead scope="col">Phương án xử lý</TableHead><TableHead scope="col">Trạng thái</TableHead>
            {choSua && <TableHead scope="col"><span className="sr-only">Thao tác</span></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={choSua ? 8 : 7}><EmptyState kieu="loc" size="sm" capTieuDe={2} tieuDe="Không có mã lỗi nào khớp." /></TableCell></TableRow>
          )}
          {rows.map((d) => {
            const heThong = d.code === CHUA_PHAN_LOAI
            return (
              <Fragment key={d.code}>
                <TableRow className={`align-top ${heThong ? 'bg-muted' : ''}`}>
                  <TableCell className="font-mono text-xs">{d.code}{heThong && <span className="ml-1 text-muted-foreground">(hệ thống)</span>}</TableCell>
                  <TableCell>{d.ten}</TableCell>
                  <TableCell>{d.nhom ?? '—'}</TableCell>
                  <TableCell className="text-xs">{d.ma_may.join(', ') || '—'}</TableCell>
                  <TableCell className="text-xs">{tomTatDanhSach(d.aliases) || '—'}</TableCell>
                  <TableCell className="text-xs">
                    {catNgan(d.huong_xu_ly) || '—'}
                    {d.huong_xu_ly?.trim() && (d.huong_duyet
                      ? <Badge className="ml-1" variant="soft" color="success" title={d.huong_duyet_boi ? `Duyệt bởi ${d.huong_duyet_boi}` : undefined}>✓ đã duyệt</Badge>
                      : <Badge className="ml-1" variant="soft" color="warning" title="Chưa hiện trên ticket — chờ chuyên gia duyệt">chờ duyệt</Badge>)}
                  </TableCell>
                  <TableCell><Badge variant="soft" color={MAU[d.trang_thai]}>{NHAN_TRANG_THAI[d.trang_thai]}</Badge></TableCell>
                  {choSua && (
                    <TableCell className="whitespace-nowrap space-x-2">
                      {!heThong && (<>
                        <Button type="button" variant="ghost" size="sm" disabled={ban}
                          onClick={() => { setDangSua(d.code); setForm(formTuLoi(d)) }}>Sửa</Button>
                        {d.trang_thai !== 'da_duyet' && <Button type="button" variant="ghost" size="sm" disabled={ban} onClick={() => doi(d.code, 'da_duyet')}>Duyệt</Button>}
                        {d.trang_thai !== 'ngung' && <Button type="button" variant="ghost" size="sm" disabled={ban} onClick={() => doi(d.code, 'ngung')}>Ngừng dùng</Button>}
                      </>)}
                    </TableCell>
                  )}
                </TableRow>
                {loi[d.code] && (
                  <TableRow><TableCell colSpan={choSua ? 8 : 7} className="px-3 pb-2 text-sm text-destructive">{loi[d.code]}</TableCell></TableRow>
                )}
                {choSua && !heThong && dangSua === d.code && form && (
                  <TableRow className="bg-muted"><TableCell colSpan={8} className="p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs">Tên chuẩn<Input value={form.ten} onChange={f('ten')} /></label>
                      <div className="space-y-1 text-xs">
                        <span id={nhanNhom}>Nhóm lỗi</span>
                        <Combobox aria-labelledby={nhanNhom} value={form.nhom || null} options={nhomTuyChon}
                          placeholder="Chọn nhóm lỗi…" searchPlaceholder="Gõ để tìm nhóm lỗi…"
                          onValueChange={(gt) => setForm((x) => x && { ...x, nhom: gt ?? '' })} />
                      </div>
                      <label className="text-xs">Các cách ghi (mỗi dòng một cách)<Textarea rows={3} value={form.aliases} onChange={f('aliases')} /></label>
                      <label className="text-xs">Mã máy áp dụng (mỗi dòng một mã)<Textarea rows={3} value={form.ma_may} onChange={f('ma_may')} /></label>
                      <label className="text-xs">Dấu hiệu<Textarea rows={2} value={form.dau_hieu} onChange={f('dau_hieu')} /></label>
                      <label className="text-xs">Phương án xử lý chuẩn<Textarea rows={2} value={form.huong_xu_ly} onChange={f('huong_xu_ly')} />
                        <span className="text-[11px] text-muted-foreground">Sửa nội dung → phương án về &quot;chờ duyệt&quot;, chỉ hiện trên ticket sau khi chuyên gia duyệt lại (Xuất / Nhập phương án).</span></label>
                      <label className="text-xs">Nguồn<Input value={form.nguon} onChange={f('nguon')} /></label>
                      <label className="text-xs">Thứ tự<Input value={form.thu_tu} onChange={f('thu_tu')} /></label>
                      <label className="text-xs">Trạng thái
                        <NativeSelect className="w-full" value={form.trang_thai} onChange={f('trang_thai')}>
                          {(Object.keys(NHAN_TRANG_THAI) as TrangThaiLoi[]).map((k) => <NativeSelectOption key={k} value={k}>{NHAN_TRANG_THAI[k]}</NativeSelectOption>)}
                        </NativeSelect>
                      </label>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button type="button" size="sm" disabled={ban} onClick={() => luu(d.code)}>Lưu</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setDangSua(null)}>Huỷ</Button>
                    </div>
                  </TableCell></TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </TableWrap>
  )
}
