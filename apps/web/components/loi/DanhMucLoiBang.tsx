'use client'

import { useId, useMemo, useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { TabView } from '@/app/actions'
import { TAB_DANH_MUC_LOI, TRUONG_DANH_MUC_LOI, TT_LOI } from '@/app/danh-muc-loi/truong-danh-muc-loi'
import { BangDanhSachF, type CotF } from '@/components/BangDanhSachF'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { TableCell, TableRow } from '@/components/ui/table'
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

type ThaoTac = { ban: boolean; sua: (d: LoiDanhMuc) => void; doi: (code: string, tt: TrangThaiLoi) => void }

function cotLoi(choSua: boolean, x: ThaoTac): CotF<LoiDanhMuc>[] {
  const cot: CotF<LoiDanhMuc>[] = [
    {
      id: 'code', ten: 'Mã', kieu: 'thuong', khoa: true,
      o: (d) => (
        <span className="tabular-nums font-medium">
          {d.code}{d.code === CHUA_PHAN_LOAI && <span className="ml-1 font-normal text-muted-foreground">(hệ thống)</span>}
        </span>
      ),
    },
    { id: 'ten', ten: 'Tên chuẩn', kieu: 'thuong', rongToiDa: 280, o: (d) => d.ten, title: (d) => d.ten },
    { id: 'nhom', ten: 'Nhóm', kieu: 'thuong', o: (d) => d.nhom ?? '—' },
    { id: 'ma_may', ten: 'Mã máy', kieu: 'thuong', rongToiDa: 240, o: (d) => d.ma_may.join(', ') || '—', title: (d) => d.ma_may.join(', ') },
    { id: 'aliases', ten: 'Các cách ghi', kieu: 'thuong', rongToiDa: 280, o: (d) => tomTatDanhSach(d.aliases) || '—', title: (d) => d.aliases.join(', ') },
    {
      id: 'huong_xu_ly', ten: 'Phương án xử lý', kieu: 'thuong', rongToiDa: 420, title: (d) => d.huong_xu_ly,
      o: (d) => (
        <span className="inline-flex items-center gap-1">
          {catNgan(d.huong_xu_ly) || '—'}
          {d.huong_xu_ly?.trim() && (d.huong_duyet
            ? <Badge variant="soft" color="success" title={d.huong_duyet_boi ? `Duyệt bởi ${d.huong_duyet_boi}` : undefined}>✓ đã duyệt</Badge>
            : <Badge variant="soft" color="warning" title="Chưa hiện trên ticket — chờ chuyên gia duyệt">chờ duyệt</Badge>)}
        </span>
      ),
    },
    { id: 'trang_thai', ten: 'Trạng thái', kieu: 'thuong', o: (d) => <Badge variant="soft" color={MAU[d.trang_thai]}>{NHAN_TRANG_THAI[d.trang_thai]}</Badge> },
  ]
  if (!choSua) return cot
  return [
    ...cot,
    {
      id: 'thao_tac', ten: 'Thao tác', kieu: 'thuong', batBuoc: true,
      o: (d) => d.code === CHUA_PHAN_LOAI ? null : (
        <span className="inline-flex gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={x.ban} onClick={() => x.sua(d)}>Sửa</Button>
          {d.trang_thai !== 'da_duyet' && <Button type="button" variant="ghost" size="sm" disabled={x.ban} onClick={() => x.doi(d.code, 'da_duyet')}>Duyệt</Button>}
          {d.trang_thai !== 'ngung' && <Button type="button" variant="ghost" size="sm" disabled={x.ban} onClick={() => x.doi(d.code, 'ngung')}>Ngừng dùng</Button>}
        </span>
      ),
    },
  ]
}

/**
 * Danh mục lỗi — khuôn bảng Ticket F (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md). Sửa tại chỗ: form mở thành dòng
 * phụ ngay dưới dòng đang sửa (nên không đổi sang ListView trên điện thoại — bảng cuộn ngang).
 */
export function DanhMucLoiBang({
  rows, tong = rows.length, choSua, nhomTuyChon = [], tabRieng = [], quyenTabChung = false, nutChinh,
}: {
  rows: LoiDanhMuc[]
  tong?: number
  choSua: boolean
  nhomTuyChon?: MucChon[]
  tabRieng?: TabView[]
  quyenTabChung?: boolean
  nutChinh?: ReactNode
}) {
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
  const f = (k: keyof FormLoi) => (e: { target: { value: string } }) => setForm((x) => x && { ...x, [k]: e.target.value })
  const cot = useMemo(
    () => cotLoi(choSua, {
      ban,
      sua: (d) => { setDangSua(d.code); setForm(formTuLoi(d)) },
      doi: (code, tt) => chay(async () => {
        const r = await datTrangThaiLoi(code, tt)
        if (!r.ok) return setLoi((l) => ({ ...l, [code]: r.error }))
        setLoi((l) => ({ ...l, [code]: '' })); router.refresh()
      }),
    }),
    [choSua, ban, router],
  )

  return (
    <BangDanhSachF
      tieuDe="Danh mục lỗi"
      nhan="mã lỗi"
      timKiem={{ placeholder: 'Mã, tên lỗi, cách ghi, mã máy…', nhan: 'Tìm mã lỗi' }}
      rows={rows}
      khoa={(d) => d.code}
      moTa={(d) => `mã lỗi ${d.code}`}
      cot={cot}
      // Danh mục không có trang chi tiết từng mã — menu dòng chỉ có sao chép mã.
      maDong={(d) => d.code}
      tenMa="mã lỗi"
      tong={tong}
      tab={{
        bang: 'danh_muc_loi_tab', coDinh: TAB_DANH_MUC_LOI, rieng: tabRieng, quyenChung: quyenTabChung,
        khu: 'CSKH', viDuTen: 'VD: Lỗi chờ duyệt máy RO',
      }}
      truong={TRUONG_DANH_MUC_LOI}
      locCot={{ trang_thai: 'tt' }}
      tuyChonLoc={{ tt: TT_LOI }}
      nutChinh={nutChinh}
      lopDong={(d) => (d.code === CHUA_PHAN_LOAI ? 'bg-muted' : undefined)}
      rong={{ tieuDe: 'Chưa có mã lỗi nào', moTa: 'Nhập danh mục từ Sheet đã duyệt để bắt đầu.' }}
      rongLoc={{ tieuDe: 'Không có mã lỗi nào khớp.', moTa: 'Thử đổi từ khoá hoặc bỏ bớt bộ lọc.' }}
      sauDong={(d, soCot) => (
        <>
          {loi[d.code] && (
            <TableRow><TableCell colSpan={soCot} className="text-(--color-text-danger)">{loi[d.code]}</TableCell></TableRow>
          )}
          {choSua && d.code !== CHUA_PHAN_LOAI && dangSua === d.code && form && (
            <TableRow className="bg-muted"><TableCell colSpan={soCot} className="whitespace-normal">
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
                  <span className="text-xs text-muted-foreground">Sửa nội dung → phương án về &quot;chờ duyệt&quot;, chỉ hiện trên ticket sau khi chuyên gia duyệt lại (Xuất / Nhập phương án).</span></label>
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
        </>
      )}
    />
  )
}
