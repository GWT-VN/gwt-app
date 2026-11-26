'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTicket } from '@/app/actions'
import { datNgayBao } from '@/app/ticket/dau-ticket-actions'
import { LanLoiTiepTheo, MucLanLoi, NoiDungLanLoi, O2Cot, ONgay } from '@/components/loi/CapLoiXuLy'
import { ChonLoaiTicket } from '@/components/ticket/ChonLoaiTicket'
import { ngayCuaLan, ngayVNHomNay } from '@/lib/loi/ngayTicket'
import { lanTiepTheo, type LanLoi } from '@/lib/loi/lanLoi'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DetailHeading } from '@/components/ui/detail-layout'

/**
 * Khối "Các lần lỗi": Lần 1 (tickets.description ↔ last_note, ngày = ngay_bao | ngày tạo) +
 * các lần sau. Mặc định mở lần gần nhất; sửa loại, nội dung và ngày báo trong lần 1.
 * Trạng thái / Khẩn / CS / Kỹ thuật nằm ở thanh đầu trang (DauTicket), không ở đây.
 */
export function TicketEditor({
  code, lastNote, ticketType, description, loaiList = [], ngayBao, ngayTao = null,
  choSua = true, coNgayBao = true, lanLoi = [], thieuLanLoi = false,
}: {
  code: string
  lastNote: string | null
  ticketType: string | null
  description: string | null
  loaiList?: string[]
  // Ngày khách báo lần 1 ('YYYY-MM-DD'); null → dùng ngày tạo ticket.
  ngayBao: string | null
  ngayTao?: string | null
  choSua?: boolean
  // false = DB chưa có cột ngay_bao (chưa áp migration) → ẩn ô chọn ngày.
  coNgayBao?: boolean
  lanLoi?: LanLoi[]
  thieuLanLoi?: boolean
}) {
  const ngayLan1 = ngayCuaLan(ngayBao, ngayTao)
  const [edit, setEdit] = useState(false)
  const [note, setNote] = useState(lastNote ?? '')
  const [loai, setLoai] = useState(ticketType ?? '')
  const [moTa, setMoTa] = useState(description ?? '')
  const [ngay, setNgay] = useState(ngayLan1 ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function save() {
    if (!loai.trim() || !moTa.trim()) { setErr('Phân loại và Mô tả không được trống.'); return }
    setBusy(true); setErr(null)
    const r = await updateTicket(code, { last_note: note, ticket_type: loai, description: moTa })
    const r2 = r.ok && coNgayBao && ngay !== (ngayLan1 ?? '') ? await datNgayBao(code, ngay || null) : r
    setBusy(false)
    if (!r.ok) setErr(r.error)
    else if (!r2.ok) setErr(r2.error)
    else { setEdit(false); router.refresh() }
  }

  function huy() {
    setNote(lastNote ?? ''); setLoai(ticketType ?? ''); setMoTa(description ?? ''); setNgay(ngayLan1 ?? '')
    setErr(null); setEdit(false)
  }

  const lanDau = (
    <MucLanLoi id="lan-1" lan={1} ngay={ngayLan1} moTa={description} xuLy={lastNote}>
      {edit && choSua ? (
        <Card className="space-y-3">
          <DetailHeading cap={3}>Sửa loại &amp; lần 1</DetailHeading>
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-full sm:w-56">
              <span className="text-muted-foreground">Phân loại *</span>
              <ChonLoaiTicket value={loai} onChange={setLoai} loaiList={loaiList} className="mt-1" />
            </div>
            {coNgayBao && <ONgay ngay={ngay} setNgay={setNgay} homNay={ngayVNHomNay()} />}
          </div>
          <O2Cot moTa={moTa} setMoTa={setMoTa} xuLy={note} setXuLy={setNote} />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={save} loading={busy}>Lưu</Button>
            <Button variant="outline" onClick={huy} disabled={busy}>Huỷ</Button>
          </div>
          {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
        </Card>
      ) : (
        <div className="space-y-3">
          <NoiDungLanLoi moTa={description} xuLy={lastNote} />
          {choSua && <Button size="sm" variant="outline" onClick={() => setEdit(true)}>Sửa loại / lần 1</Button>}
        </div>
      )}
    </MucLanLoi>
  )

  return (
    <section className="space-y-2" aria-labelledby="cac-lan-loi">
      <DetailHeading id="cac-lan-loi">Các lần lỗi · {lanLoi.length + 1}</DetailHeading>
      <LanLoiTiepTheo code={code} ds={lanLoi} choSua={choSua && !thieuLanLoi} lanKe={lanTiepTheo(lanLoi)} lanDau={lanDau} />
      {thieuLanLoi && (
        <Alert color="warning">
          <AlertDescription>Chưa tải được các lần lỗi sau. Báo kỹ thuật nếu tình trạng kéo dài.</AlertDescription>
        </Alert>
      )}
    </section>
  )
}
