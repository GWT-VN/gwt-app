'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { OChonGoiY } from '@/bang'
import { SerialTraCuu } from './SerialTraCuu'
import { DongMayNhap } from './DongMayNhap'
import { suaDongMay, themDongMay, xacNhanHuongXuLy, xoaDongMay } from '@/app/ticket/loi-actions'
import { goiYHuongXuLy, nhanDongMay } from '@/lib/loi/dongMay'
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
      {!dong.length && <p className="text-sm text-slate-500">Chưa có dòng máy.</p>}
      {loi && <p role="alert" className="text-sm text-red-600">{loi}</p>}
      {choSua && (them ? (
        <div className="space-y-2">
          <DongMayNhap dong={them} onChange={(x) => setThem(x.slice(0, 1))} dsLoi={dsLoi.filter((l) => l.trang_thai !== 'ngung')} />
          <div className="flex gap-2">
            <button type="button" disabled={dangChay} className="text-sm rounded-lg bg-slate-900 text-white px-3 py-1.5 disabled:opacity-50"
              onClick={() => {
                const d = them[0] ?? {}
                chay(() => themDongMay(code, { ...d, serial: chuanHoaSerial(d.serial ?? '') || undefined, mo_ta: d.mo_ta?.trim() || undefined }), () => setThem(null))
              }}>Lưu máy này</button>
            <button type="button" onClick={() => setThem(null)} className="text-sm rounded-lg border px-3 py-1.5 bg-white">Huỷ</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setThem([{}])} className="text-sm rounded-lg border px-3 py-1.5 bg-white">＋ Thêm máy</button>
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
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-slate-900">{nhanDongMay(d)}</span>
        {d.serial ? (
          <Link href={`/may/${encodeURIComponent(d.serial)}`} prefetch={false} className="font-mono text-xs underline text-slate-700">{d.serial}</Link>
        ) : d.source_serial ? <span className="font-mono text-xs text-slate-500">{d.source_serial}</span> : null}
        <span className={`text-xs rounded-full px-2 py-0.5 ${chip.lop}`}>{chip.nhan}</span>
      </div>
      {d.mo_ta && !dangSua && <p className="text-sm text-slate-700">{d.mo_ta}</p>}

      {dangSua && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-3">
          <SerialTraCuu value={f.serial} onChange={(v) => setF({ ...f, serial: v })} />
          <OChonGoiY giaTri={f.loi_code} tuyChon={tuyChon} choPhepXoa={false} choTrong="Loại lỗi…"
            onChon={(gt) => setF({ ...f, loi_code: gt || f.loi_code })} />
          <input value={f.mo_ta} maxLength={GIOI_HAN.text} onChange={(e) => setF({ ...f, mo_ta: e.target.value })}
            placeholder="Mô tả lỗi của máy này" className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white" />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CHIP_TRANG_THAI) as TrangThaiDong[]).map((t) => (
              <button key={t} type="button" onClick={() => setF({ ...f, trang_thai: t })}
                className={`text-xs rounded-full border px-3 py-1 ${f.trang_thai === t ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                {CHIP_TRANG_THAI[t].nhan}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={dangChay} className="text-sm rounded-lg bg-slate-900 text-white px-3 py-1.5 disabled:opacity-50"
              onClick={() => chay(() => suaDongMay(d.id, {
                serial: chuanHoaSerial(f.serial), loi_code: f.loi_code, mo_ta: f.mo_ta.trim(), trang_thai: f.trang_thai,
              }), () => setDangSua(false))}>Lưu</button>
            <button type="button" onClick={() => setDangSua(false)} className="text-sm rounded-lg border px-3 py-1.5 bg-white">Huỷ</button>
          </div>
        </div>
      )}

      {goiY && (
        <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 text-sm space-y-2">
          <div className="text-xs font-medium text-sky-900">Hướng xử lý đề xuất (theo danh mục lỗi)</div>
          {choSua ? (
            <>
              <textarea value={nd} onChange={(e) => setNd(e.target.value)} rows={3} maxLength={GIOI_HAN.text}
                className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white" />
              <button type="button" disabled={dangChay || !nd.trim()} onClick={luuHuong}
                className="text-sm rounded-lg bg-sky-700 text-white px-3 py-1.5 disabled:opacity-50">Xác nhận</button>
            </>
          ) : <p className="whitespace-pre-wrap text-slate-800">{goiY}</p>}
        </div>
      )}

      {d.huong_xu_ly && (
        <div className="text-sm space-y-1">
          <div className="text-xs text-slate-500">
            Hướng xử lý <span className="rounded bg-slate-100 px-1.5 py-0.5">{nhanNguonHuongXuLy(d.huong_xu_ly_nguon)}</span>
          </div>
          {suaHuong ? (
            <>
              <textarea value={nd} onChange={(e) => setNd(e.target.value)} rows={3} maxLength={GIOI_HAN.text}
                className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white" />
              <div className="flex gap-2">
                <button type="button" disabled={dangChay || !nd.trim()} onClick={luuHuong}
                  className="text-sm rounded-lg bg-slate-900 text-white px-3 py-1.5 disabled:opacity-50">Lưu</button>
                <button type="button" onClick={() => setSuaHuong(false)} className="text-sm rounded-lg border px-3 py-1.5 bg-white">Huỷ</button>
              </div>
            </>
          ) : (
            <p className="whitespace-pre-wrap text-slate-800">
              {d.huong_xu_ly}
              {choSua && <> <button type="button" onClick={() => { setNd(d.huong_xu_ly ?? ''); setSuaHuong(true) }} className="text-xs underline text-slate-600">Sửa</button></>}
            </p>
          )}
        </div>
      )}

      {choSua && !dangSua && (
        <div className="flex gap-3 text-xs">
          <button type="button" onClick={() => setDangSua(true)} className="underline text-slate-700">Sửa dòng</button>
          <button type="button" disabled={!bo.duocBo || dangChay} title={bo.goiY ?? undefined}
            onClick={() => { if (confirm('Bỏ dòng máy này khỏi ticket?')) chay(() => xoaDongMay(d.id)) }}
            className="text-red-600 hover:underline disabled:opacity-40 disabled:no-underline">Bỏ dòng</button>
        </div>
      )}
    </div>
  )
}
