'use client'

/**
 * Nút + hộp SỬA sổ kho (Đợt 3 — 04/11/2026). Trang chỉ vẽ các component này khi người xem có quyền 'kho.so.sua'
 * (hỏi bằng coTheSuaKho() ở _gac.ts — cùng cặp với Server Action), người khác thấy trang như cũ.
 *
 * Danh mục mã (vài trăm mục) truyền MỘT lần qua <KhuSuaKho>, các nút trong từng dòng đọc qua context — không nhân bản theo dòng.
 */
import { createContext, useContext, useMemo, useState, useTransition, type ReactNode } from 'react'
import { OChonGoiY, type MucChon } from '@/bang'
import type { MucDanhMuc } from '@/lib/kho/doc'
import { LOAI } from '@/lib/kho/nhan'
import { chuanTen, thayDoiSua } from '@/lib/kho/sua'
import { boQuaDongKho, duyetDongKho, huyDongKho, suaDongKho } from './actions'

const NgucCanh = createContext<MucChon[]>([])

export function KhuSuaKho({ danhMuc, children }: { danhMuc: MucDanhMuc[]; children: ReactNode }) {
  const ds = useMemo(() => danhMuc.map((d) => ({ gt: d.ma, nhan: d.ten ?? d.ma })), [danhMuc])
  return <NgucCanh.Provider value={ds}>{children}</NgucCanh.Provider>
}
const useDanhMuc = () => useContext(NgucCanh)

const O_NHAP = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
const NUT = 'rounded-lg px-2.5 py-1 text-xs font-medium disabled:opacity-50'

function Nhan({ ten, children, rong = false }: { ten: string; children: ReactNode; rong?: boolean }) {
  return <label className={`block space-y-1 ${rong ? 'sm:col-span-2' : ''}`}><span className="text-xs font-medium text-slate-600">{ten}</span>{children}</label>
}

function HopNoi({ tieuDe, phu, onDong, children }: { tieuDe: string; phu?: ReactNode; onDong: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/30 p-4 sm:items-center" onMouseDown={(e) => { if (e.target === e.currentTarget) onDong() }}>
      <div className="w-full max-w-xl space-y-3 rounded-xl bg-white p-4 shadow-xl" role="dialog" aria-modal="true">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{tieuDe}</h2>
            {phu && <div className="text-xs text-slate-500">{phu}</div>}
          </div>
          <button type="button" onClick={onDong} className="text-slate-400 hover:text-slate-700" aria-label="Đóng">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export type DongSuaDuoc = {
  id: number; ngay: string; loai: string; internal_code: string | null; raw_name: string; qty: number
  purpose: string | null; note: string | null; trang_thai: string
}

/** Nút Sửa / Huỷ ở cuối mỗi dòng nhật ký. Dòng đã huỷ / bỏ qua (rejected): không vẽ gì. */
export function NutSuaDong({ dong }: { dong: DongSuaDuoc }) {
  const [mo, setMo] = useState<'sua' | 'huy' | null>(null)
  if (dong.trang_thai === 'rejected') return null
  return (
    <div className="flex gap-1">
      <button type="button" onClick={() => setMo('sua')} className={`${NUT} border border-slate-200 text-slate-700 hover:bg-slate-50`}>Sửa</button>
      <button type="button" onClick={() => setMo('huy')} className={`${NUT} border border-red-200 text-red-700 hover:bg-red-50`}>Huỷ</button>
      {mo === 'sua' && <HopSua dong={dong} onDong={() => setMo(null)} />}
      {mo === 'huy' && <HopHuy dong={dong} onDong={() => setMo(null)} />}
    </div>
  )
}

function HopSua({ dong, onDong }: { dong: DongSuaDuoc; onDong: () => void }) {
  const danhMuc = useDanhMuc()
  const [f, setF] = useState({ ngay: dong.ngay, loai: dong.loai, internal_code: dong.internal_code ?? '', qty: String(dong.qty),
    purpose: dong.purpose ?? '', note: dong.note ?? '' })
  const [lyDo, setLyDo] = useState('')
  const [loi, setLoi] = useState<string | null>(null)
  const [dang, batDau] = useTransition()
  const doi = thayDoiSua(dong, f)
  const soDoi = Object.keys(doi).length
  const dat = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }))

  function luu() {
    setLoi(null)
    if (!soDoi) { setLoi('Chưa đổi gì.'); return }
    batDau(async () => {
      const r = await suaDongKho(dong.id, doi, lyDo)
      if (!r.ok) setLoi(r.error)
      else onDong()
    })
  }

  return (
    <HopNoi tieuDe={`Sửa dòng sổ #${dong.id}`} onDong={onDong}
      phu={<>Tên trong tin: <b>{dong.raw_name}</b>{dong.trang_thai === 'need_review' && ' · đang chờ duyệt — chọn mã là duyệt luôn'}</>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Nhan ten="Ngày"><input type="date" className={O_NHAP} value={f.ngay} onChange={(e) => dat('ngay')(e.target.value)} /></Nhan>
        <Nhan ten="Loại">
          <select className={O_NHAP} value={f.loai} onChange={(e) => dat('loai')(e.target.value)}>
            {LOAI.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </Nhan>
        <Nhan ten="Mã hàng" rong><OChonGoiY giaTri={f.internal_code || null} onChon={dat('internal_code')} tuyChon={danhMuc} choTrong="Gõ mã hoặc tên để tìm…" choPhepXoa={false} /></Nhan>
        <Nhan ten={f.loai === 'Điều chỉnh' ? 'Số lượng (âm = giảm tồn)' : 'Số lượng'}>
          <input inputMode="decimal" className={O_NHAP} value={f.qty} onChange={(e) => dat('qty')(e.target.value)} />
        </Nhan>
        <Nhan ten="Lý do / cho ai"><input className={O_NHAP} value={f.purpose} onChange={(e) => dat('purpose')(e.target.value)} /></Nhan>
        <Nhan ten="Ghi chú" rong><input className={O_NHAP} value={f.note} onChange={(e) => dat('note')(e.target.value)} /></Nhan>
        <Nhan ten="Lý do sửa (ghi vào lịch sử)" rong>
          <input className={O_NHAP} value={lyDo} onChange={(e) => setLyDo(e.target.value)} placeholder="vd: anh kỹ thuật nhắn nhầm SL" />
        </Nhan>
      </div>
      <p className="text-[11px] text-slate-500">Sửa xong dòng bị khoá: bot không ghi đè dù tin Discord gốc bị sửa. Sheet tự cập nhật trong ~20 giây.</p>
      {loi && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loi}</p>}
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto text-xs text-slate-500">{soDoi ? `Đổi ${soDoi} trường` : 'Chưa đổi gì'}</span>
        <button type="button" onClick={onDong} className={`${NUT} border border-slate-200 text-slate-600 hover:bg-slate-50`}>Thôi</button>
        <button type="button" onClick={luu} disabled={dang || !soDoi} className={`${NUT} bg-indigo-600 text-white hover:bg-indigo-700`}>{dang ? 'Đang lưu…' : 'Lưu'}</button>
      </div>
    </HopNoi>
  )
}

function HopHuy({ dong, onDong }: { dong: DongSuaDuoc; onDong: () => void }) {
  const [lyDo, setLyDo] = useState('')
  const [loi, setLoi] = useState<string | null>(null)
  const [dang, batDau] = useTransition()

  function huy() {
    setLoi(null)
    if (!lyDo.trim()) { setLoi('Cần ghi lý do huỷ.'); return }
    if (!window.confirm(`Huỷ dòng #${dong.id} (${dong.loai} ${dong.qty} · ${dong.raw_name})? Dòng không bị xoá, chỉ đánh dấu huỷ và không tính vào tồn nữa.`)) return
    batDau(async () => {
      const r = await huyDongKho(dong.id, lyDo)
      if (!r.ok) setLoi(r.error)
      else onDong()
    })
  }

  return (
    <HopNoi tieuDe={`Huỷ dòng sổ #${dong.id}`} onDong={onDong} phu={<>{dong.loai} <b>{dong.qty}</b> · {dong.raw_name}{dong.internal_code ? ` · ${dong.internal_code}` : ''}</>}>
      <Nhan ten="Lý do huỷ (bắt buộc)">
        <input autoFocus className={O_NHAP} value={lyDo} onChange={(e) => setLyDo(e.target.value)} placeholder="vd: ghi trùng với tin hôm trước" />
      </Nhan>
      <p className="text-[11px] text-slate-500">Dòng huỷ không bị xoá — vẫn thấy trong nhật ký (trạng thái “bỏ qua”) và trong Lịch sử sửa.</p>
      {loi && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loi}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDong} className={`${NUT} border border-slate-200 text-slate-600 hover:bg-slate-50`}>Thôi</button>
        <button type="button" onClick={huy} disabled={dang} className={`${NUT} bg-red-600 text-white hover:bg-red-700`}>{dang ? 'Đang huỷ…' : 'Huỷ dòng này'}</button>
      </div>
    </HopNoi>
  )
}

/** Ô chọn mã + "Nhớ tên" + Duyệt / Bỏ qua cho một dòng chờ duyệt. */
export function DuyetDong({ id, rawName, goiY }: { id: number; rawName: string; goiY: string | null }) {
  const danhMuc = useDanhMuc()
  const [ma, setMa] = useState(goiY ?? '')
  const [nho, setNho] = useState(true)
  const [loi, setLoi] = useState<string | null>(null)
  const [dang, batDau] = useTransition()

  function duyet() {
    setLoi(null)
    if (!ma) { setLoi('Chưa chọn mã.'); return }
    batDau(async () => {
      const r = await duyetDongKho(id, ma, nho ? chuanTen(rawName) : undefined)
      if (!r.ok) setLoi(r.error)
    })
  }
  function boQua() {
    setLoi(null)
    const ly = window.prompt(`Bỏ qua dòng “${rawName}” (không phải hàng kho)?\nLý do (không bắt buộc):`, '')
    if (ly === null) return
    batDau(async () => {
      const r = await boQuaDongKho(id, ly)
      if (!r.ok) setLoi(r.error)
    })
  }

  return (
    <div className="min-w-[260px] space-y-1.5">
      <OChonGoiY giaTri={ma || null} onChon={setMa} tuyChon={danhMuc} choTrong="Gõ mã / tên để chọn…"
        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-slate-600" title={`Bot nhớ “${chuanTen(rawName)}” = mã này, lần sau tự nhận`}>
          <input type="checkbox" checked={nho} onChange={(e) => setNho(e.target.checked)} /> Nhớ tên này cho lần sau
        </label>
        <span className="ml-auto flex gap-1">
          <button type="button" onClick={duyet} disabled={dang || !ma} className={`${NUT} bg-emerald-600 text-white hover:bg-emerald-700`}>{dang ? '…' : 'Duyệt'}</button>
          <button type="button" onClick={boQua} disabled={dang} className={`${NUT} border border-slate-200 text-slate-600 hover:bg-slate-50`}>Bỏ qua</button>
        </span>
      </div>
      {loi && <p className="text-xs text-red-700">{loi}</p>}
    </div>
  )
}
