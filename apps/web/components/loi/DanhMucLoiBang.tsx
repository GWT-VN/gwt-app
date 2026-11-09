'use client'

import { Fragment, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { OChonGoiY, type MucChon } from '@/bang'
import { luuLoi, datTrangThaiLoi } from '@/app/ticket/loi-actions'
import { CHUA_PHAN_LOAI } from '@/lib/loi/dongMay'
import type { LoiDanhMuc, TrangThaiLoi } from '@/lib/loi/kieu'
import { catNgan, formTuLoi, loiTuForm, NHAN_TRANG_THAI, tomTatDanhSach, type FormLoi } from '@/lib/loi/giaoDienDanhMuc'

const MAU: Record<TrangThaiLoi, string> = {
  cho_duyet: 'bg-amber-100 text-amber-800',
  da_duyet: 'bg-emerald-100 text-emerald-800',
  ngung: 'bg-slate-100 text-slate-600',
}
const o = 'w-full rounded-lg border border-slate-300 px-2 py-1 text-sm'

export function DanhMucLoiBang({ rows, choSua, nhomTuyChon = [] }: { rows: LoiDanhMuc[]; choSua: boolean; nhomTuyChon?: MucChon[] }) {
  const router = useRouter()
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-3 py-2">Mã</th><th className="px-3 py-2">Tên chuẩn</th><th className="px-3 py-2">Nhóm</th>
            <th className="px-3 py-2">Mã máy</th><th className="px-3 py-2">Các cách ghi</th>
            <th className="px-3 py-2">Phương án xử lý</th><th className="px-3 py-2">Trạng thái</th>
            {choSua && <th className="px-3 py-2" />}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={choSua ? 8 : 7} className="px-3 py-6 text-center text-slate-500">Không có mã lỗi nào khớp.</td></tr>
          )}
          {rows.map((d) => {
            const heThong = d.code === CHUA_PHAN_LOAI
            return (
              <Fragment key={d.code}>
                <tr className={`border-t border-slate-100 align-top ${heThong ? 'bg-slate-50' : ''}`}>
                  <td className="px-3 py-2 font-mono text-xs">{d.code}{heThong && <span className="ml-1 text-slate-500">(hệ thống)</span>}</td>
                  <td className="px-3 py-2">{d.ten}</td>
                  <td className="px-3 py-2">{d.nhom ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{d.ma_may.join(', ') || '—'}</td>
                  <td className="px-3 py-2 text-xs">{tomTatDanhSach(d.aliases) || '—'}</td>
                  <td className="px-3 py-2 text-xs">{catNgan(d.huong_xu_ly) || '—'}</td>
                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${MAU[d.trang_thai]}`}>{NHAN_TRANG_THAI[d.trang_thai]}</span></td>
                  {choSua && (
                    <td className="px-3 py-2 whitespace-nowrap space-x-2">
                      {!heThong && (<>
                        <button type="button" disabled={ban} className="text-slate-700 underline"
                          onClick={() => { setDangSua(d.code); setForm(formTuLoi(d)) }}>Sửa</button>
                        {d.trang_thai !== 'da_duyet' && <button type="button" disabled={ban} className="text-emerald-700 underline" onClick={() => doi(d.code, 'da_duyet')}>Duyệt</button>}
                        {d.trang_thai !== 'ngung' && <button type="button" disabled={ban} className="text-slate-600 underline" onClick={() => doi(d.code, 'ngung')}>Ngừng dùng</button>}
                      </>)}
                    </td>
                  )}
                </tr>
                {loi[d.code] && (
                  <tr><td colSpan={choSua ? 8 : 7} className="px-3 pb-2 text-sm text-red-600">{loi[d.code]}</td></tr>
                )}
                {choSua && !heThong && dangSua === d.code && form && (
                  <tr className="bg-slate-50"><td colSpan={8} className="p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs">Tên chuẩn<input className={o} value={form.ten} onChange={f('ten')} /></label>
                      <div className="text-xs">Nhóm lỗi
                        <OChonGoiY giaTri={form.nhom || null} tuyChon={nhomTuyChon} choTrong="Gõ để tìm nhóm lỗi…"
                          onChon={(gt) => setForm((x) => x && { ...x, nhom: gt })} />
                      </div>
                      <label className="text-xs">Các cách ghi (mỗi dòng một cách)<textarea className={o} rows={3} value={form.aliases} onChange={f('aliases')} /></label>
                      <label className="text-xs">Mã máy áp dụng (mỗi dòng một mã)<textarea className={o} rows={3} value={form.ma_may} onChange={f('ma_may')} /></label>
                      <label className="text-xs">Dấu hiệu<textarea className={o} rows={2} value={form.dau_hieu} onChange={f('dau_hieu')} /></label>
                      <label className="text-xs">Phương án xử lý chuẩn<textarea className={o} rows={2} value={form.huong_xu_ly} onChange={f('huong_xu_ly')} /></label>
                      <label className="text-xs">Nguồn<input className={o} value={form.nguon} onChange={f('nguon')} /></label>
                      <label className="text-xs">Thứ tự<input className={o} value={form.thu_tu} onChange={f('thu_tu')} /></label>
                      <label className="text-xs">Trạng thái
                        <select className={o} value={form.trang_thai} onChange={f('trang_thai')}>
                          {(Object.keys(NHAN_TRANG_THAI) as TrangThaiLoi[]).map((k) => <option key={k} value={k}>{NHAN_TRANG_THAI[k]}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button type="button" disabled={ban} onClick={() => luu(d.code)} className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm">Lưu</button>
                      <button type="button" onClick={() => setDangSua(null)} className="rounded-lg border px-3 py-1.5 text-sm">Huỷ</button>
                    </div>
                  </td></tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
