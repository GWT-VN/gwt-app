'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SerialTraCuu } from './SerialTraCuu'
import { DongMayNhap } from './DongMayNhap'
import { suaDongMay, themDongMay, xacNhanHuongXuLy, xoaDongMay } from '@/app/ticket/loi-actions'
import { CHUA_PHAN_LOAI, goiYHuongXuLy, nhanDongMay } from '@/lib/loi/dongMay'
import { chipTrangThai, CHIP_TRANG_THAI, coTheBoDong, dsLoiChon, nhanNguonHuongXuLy, quyetDinhXacNhan } from '@/lib/loi/dongMayTicket'
import { chuanHoaSerial } from '@/lib/loi/serial'
import { GIOI_HAN } from '@/lib/loi/kiemDauVao'
import type { DongMay, DongMayInput, LoiDanhMuc, TrangThaiDong } from '@/lib/loi/kieu'

type KQ = { ok: true } | { ok: false; error: string }

/** Các dòng máy + lỗi của ticket. Không có thao tác nào đổi trạng thái ticket. */
export function DongMayTicket({ code, dong, dsLoi, choSua }: { code: string; dong: DongMay[]; dsLoi: LoiDanhMuc[]; choSua: boolean }) {
  const router = useRouter()
  const [dangChay, batDau] = useTransition()
  const [loi, setLoi] = useState<string | null>(null)
  const [them, setThem] = useState<DongMayInput[] | null>(null)

  /** Chạy một action; lỗi hiện nguyên văn thông báo chung của server; xong thì làm mới trang. */
  function chay(tac: () => Promise<KQ>, xong?: () => void) {
    setLoi(null)
    batDau(async () => {
      try {
        const r = await tac()
        if (!r.ok) { setLoi(r.error); return }
        xong?.()
        router.refresh()
      } catch (e) {
        setLoi(e instanceof Error ? e.message : 'Không thực hiện được, vui lòng thử lại.')
      }
    })
  }

  return (
    <div className="space-y-3">
      {dong.map((d) => (
        <DongCard key={d.id} d={d} dsLoi={dsLoi} choSua={choSua} soDong={dong.length} dangChay={dangChay} chay={chay} />
      ))}
      {!dong.length && <p className="text-sm text-muted-foreground">Chưa có dòng máy.</p>}
      {loi && <p role="alert" className="text-sm text-(--color-text-danger)">{loi}</p>}
      {choSua && (them ? (
        <div className="space-y-2">
          <DongMayNhap dong={them} onChange={setThem} themNhieu={false} dsLoi={dsLoi.filter((l) => l.trang_thai !== 'ngung')} />
          <div className="flex gap-2">
            <Button type="button" size="sm" loading={dangChay}
              onClick={() => {
                const d = them[0] ?? {}
                chay(() => themDongMay(code, { ...d, serial: chuanHoaSerial(d.serial ?? '') || undefined, mo_ta: d.mo_ta?.trim() || undefined }), () => setThem(null))
              }}>Lưu máy này</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setThem(null)}>Huỷ</Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setThem([{}])}>＋ Thêm máy</Button>
      ))}
    </div>
  )
}

function DongCard({ d, dsLoi, choSua, soDong, dangChay, chay }: {
  d: DongMay; dsLoi: LoiDanhMuc[]; choSua: boolean; soDong: number; dangChay: boolean
  chay: (tac: () => Promise<KQ>, xong?: () => void) => void
}) {
  const [dangSua, setDangSua] = useState(false)
  const [suaHuong, setSuaHuong] = useState(false)
  const [f, setF] = useState({ serial: d.serial ?? d.source_serial ?? '', loi_code: d.loi_code, mo_ta: d.mo_ta ?? '', trang_thai: d.trang_thai })
  const goiY = goiYHuongXuLy(d, dsLoi.find((l) => l.code === d.loi_code) ?? null, d.loi_code)
  const [nd, setNd] = useState(goiY ?? d.huong_xu_ly ?? '')
  const chip = chipTrangThai(d.trang_thai)
  const bo = coTheBoDong(soDong)
  const tuyChon = dsLoiChon(dsLoi, d.loi_code).map((l) => ({ gt: l.code, nhan: l.ten, phu: l.ma_may.join(', ') }))

  const luuHuong = () => {
    const q = quyetDinhXacNhan(nd, goiY)
    if (!q) return
    chay(() => xacNhanHuongXuLy(d.id, q.noiDung, q.tuDanhMuc), () => setSuaHuong(false))
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-foreground">{nhanDongMay(d)}</span>
        {d.serial ? (
          <Link href={`/may/${encodeURIComponent(d.serial)}`} prefetch={false} className="font-mono text-xs underline text-foreground">{d.serial}</Link>
        ) : d.source_serial ? <span className="font-mono text-xs text-muted-foreground">{d.source_serial}</span> : null}
        <span className={`text-xs rounded-full px-2 py-0.5 ${chip.lop}`}>{chip.nhan}</span>
      </div>
      {d.mo_ta && !dangSua && <p className="text-sm text-foreground">{d.mo_ta}</p>}

      {dangSua && (
        <div className="space-y-2 rounded-lg bg-muted p-3">
          <SerialTraCuu value={f.serial} onChange={(v) => setF({ ...f, serial: v })} />
          <Combobox value={f.loi_code === CHUA_PHAN_LOAI ? null : f.loi_code} options={tuyChon} aria-label="Loại lỗi" placeholder="Chưa phân loại"
            onValueChange={(gt) => setF({ ...f, loi_code: gt ?? CHUA_PHAN_LOAI })} />
          <Input value={f.mo_ta} maxLength={GIOI_HAN.text} onChange={(e) => setF({ ...f, mo_ta: e.target.value })}
            aria-label="Mô tả lỗi của máy này" placeholder="Mô tả lỗi của máy này" />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CHIP_TRANG_THAI) as TrangThaiDong[]).map((t) => (
              <Button key={t} size="sm" type="button" aria-pressed={f.trang_thai === t}
                variant={f.trang_thai === t ? 'secondary' : 'outline'} onClick={() => setF({ ...f, trang_thai: t })}>
                {CHIP_TRANG_THAI[t].nhan}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" loading={dangChay}
              onClick={() => chay(() => suaDongMay(d.id, {
                serial: chuanHoaSerial(f.serial), loi_code: f.loi_code, mo_ta: f.mo_ta.trim(), trang_thai: f.trang_thai,
              }), () => setDangSua(false))}>Lưu</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setDangSua(false)}>Huỷ</Button>
          </div>
        </div>
      )}

      {goiY && (
        <div className="rounded-lg bg-(--color-background-info-surface) border border-(--color-border-info-surface) p-3 text-sm space-y-2">
          <div className="text-xs font-medium text-(--color-text-info)">Hướng xử lý đề xuất (chuyên gia đã duyệt)</div>
          {choSua ? (
            <>
              <Textarea aria-label="Hướng xử lý" value={nd} onChange={(e) => setNd(e.target.value)} rows={3} maxLength={GIOI_HAN.text} />
              <Button type="button" size="sm" loading={dangChay} disabled={!nd.trim()} onClick={luuHuong}>Xác nhận</Button>
            </>
          ) : <p className="whitespace-pre-wrap text-foreground">{goiY}</p>}
        </div>
      )}

      {d.huong_xu_ly && (
        <div className="text-sm space-y-1">
          <div className="text-xs text-muted-foreground">
            Hướng xử lý <span className="rounded bg-muted px-1.5 py-0.5">{nhanNguonHuongXuLy(d.huong_xu_ly_nguon)}</span>
          </div>
          {suaHuong ? (
            <>
              <Textarea aria-label="Hướng xử lý" value={nd} onChange={(e) => setNd(e.target.value)} rows={3} maxLength={GIOI_HAN.text} />
              <div className="flex gap-2">
                <Button type="button" size="sm" loading={dangChay} disabled={!nd.trim()} onClick={luuHuong}>Lưu</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setSuaHuong(false)}>Huỷ</Button>
              </div>
            </>
          ) : (
            <p className="whitespace-pre-wrap text-foreground">
              {d.huong_xu_ly}
              {choSua && <> <button type="button" onClick={() => { setNd(d.huong_xu_ly ?? ''); setSuaHuong(true) }} className="text-xs underline text-muted-foreground">Sửa</button></>}
            </p>
          )}
        </div>
      )}

      {choSua && !dangSua && (
        <div className="flex gap-3 text-xs">
          <button type="button" onClick={() => setDangSua(true)} className="underline text-foreground">Sửa dòng</button>
          <button type="button" disabled={!bo.duocBo || dangChay} title={bo.goiY ?? undefined}
            onClick={() => { if (confirm('Bỏ dòng máy này khỏi ticket?')) chay(() => xoaDongMay(d.id)) }}
            className="text-(--color-text-danger) hover:underline disabled:opacity-40 disabled:no-underline">Bỏ dòng</button>
        </div>
      )}
    </div>
  )
}
