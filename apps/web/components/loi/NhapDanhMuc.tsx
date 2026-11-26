'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { nhapDanhMuc, xemTruocNhapDanhMuc } from '@/app/ticket/loi-actions'
import { chayNhap, chayXemTruoc, duocNhap, nhanDoiTrangThai, nhanNutNhap, NHAN_TRANG_THAI, type TomTatXemTruoc } from '@/lib/loi/giaoDienDanhMuc'

export function NhapDanhMuc() {
  const router = useRouter()
  const [mo, setMo] = useState(false)
  const [tomTat, setTomTat] = useState<TomTatXemTruoc | null>(null)
  const [loi, setLoi] = useState('')
  const [xong, setXong] = useState('')
  const [ban, chay] = useTransition()
  const [coFile, setCoFile] = useState(false)
  const fdRef = useRef<FormData | null>(null)

  const xemTruoc = (fd: FormData) => {
    setTomTat(null); setLoi(''); setXong('')
    chay(async () => {
      const r = await chayXemTruoc(fd, xemTruocNhapDanhMuc)
      if ('loi' in r) setLoi(r.loi); else setTomTat(r.tomTat)
    })
  }
  const chonFile = (input: HTMLInputElement) => {
    const file = input.files?.[0]
    input.value = '' // chọn lại cùng file vẫn kích hoạt onChange
    fdRef.current = null; setCoFile(false); setTomTat(null); setLoi(''); setXong('')
    if (!file) return
    const fd = new FormData(); fd.set('file', file); fdRef.current = fd; setCoFile(true)
    xemTruoc(fd)
  }
  const nhap = () => fdRef.current && chay(async () => {
    const r = await chayNhap(fdRef.current!, tomTat, nhapDanhMuc)
    if ('loi' in r) return setLoi(r.loi)
    setXong(r.thongBao); setTomTat(null); setLoi(''); router.refresh()
  })

  if (!mo) return <Button type="button" onClick={() => setMo(true)} variant="outline" size="sm">Nhập từ Sheet</Button>
  return (
    <Card className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-foreground">Nhập danh mục từ Sheet đã duyệt</h2>
        <Button type="button" onClick={() => setMo(false)} variant="ghost" size="sm">Đóng</Button>
      </div>
      <input aria-label="Tệp danh mục từ Sheet" type="file" accept=".xlsx,.csv" onChange={(e) => chonFile(e.target)} />
      {coFile && <Button type="button" disabled={ban} onClick={() => xemTruoc(fdRef.current!)} variant="outline" size="sm" className="ml-2">Xem trước lại</Button>}
      {ban && <p className="text-sm text-muted-foreground">Đang xử lý…</p>}
      {loi && <p className="text-sm text-destructive whitespace-pre-line">{loi}</p>}
      {xong && <p className="text-sm text-(--color-text-success)">{xong}</p>}
      {tomTat && (
        <div className="space-y-2">
          <p className="text-sm">
            {tomTat.daDuyet} đã duyệt · {tomTat.choDuyet} chờ duyệt · {tomTat.soGan} ticket được gán lỗi ·{' '}
            <strong>{tomTat.soDongSeDoi} dòng máy sẽ đổi</strong>
            {nhanDoiTrangThai(tomTat) && <> · <strong>{nhanDoiTrangThai(tomTat)}</strong></>}
          </p>
          <p className="text-xs text-muted-foreground">Mã đã có mà cột Duyệt để trống thì giữ nguyên trạng thái; chỉ ghi Duyệt / Ngừng mới đổi.</p>
          {tomTat.coLoi && (
            <ul className="text-sm text-destructive list-disc pl-5">
              {tomTat.loi.map((l) => <li key={l}>{l}</li>)}
              {tomTat.soLoiKhac > 0 && <li>+{tomTat.soLoiKhac} lỗi khác</li>}
            </ul>
          )}
          <Table variant="thuong">
            <TableHeader><TableRow><TableHead scope="col">Mã</TableHead><TableHead scope="col">Tên chuẩn</TableHead><TableHead scope="col">Nhóm</TableHead><TableHead scope="col">Trạng thái</TableHead></TableRow></TableHeader>
            <TableBody>
              {tomTat.mau.map((m) => (
                <TableRow key={m.code}><TableCell className="font-mono">{m.code}</TableCell><TableCell>{m.ten}</TableCell><TableCell>{m.nhom ?? '—'}</TableCell><TableCell>{NHAN_TRANG_THAI[m.trang_thai]}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
          {tomTat.soMa > tomTat.mau.length && <p className="text-xs text-muted-foreground">Chỉ hiện {tomTat.mau.length} mã đầu.</p>}
          <Button type="button" disabled={ban || !duocNhap(tomTat)} onClick={nhap}
            size="sm">
            {nhanNutNhap(tomTat)}
          </Button>
        </div>
      )}
    </Card>
  )
}
