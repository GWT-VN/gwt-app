'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { addTicketNote, updateTicketNote, deleteTicketNote, type TicketNote } from '@/app/actions'
import { capLinkTaiLen, donTepCuaNote, themNhatKyKemTep, xoaTepNhatKy, type TepDaTai } from '@/app/ticket/tep-actions'
import { vnDateTime } from '@/components/TicketBadge'
import { KHO_TEP, NHAN_LOAI, SO_TEP_TOI_DA, docKichThuoc, kieuTep, kiemTep, type TepNhatKy } from '@/lib/loi/tepNhatKy'

// "YYYY-MM-DDTHH:MM" theo GIỜ ĐỊA PHƯƠNG cho input datetime-local
function nowLocal() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
function toLocal(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
// datetime-local (local) -> ISO UTC để lưu
const toIso = (local: string) => (local ? new Date(local).toISOString() : undefined)

const khoTrinhDuyet = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).storage.from(KHO_TEP)

type KQ = { ok: true } | { ok: false; error: string }

/**
 * Nhật ký trao đổi: thêm (chọn giờ + nội dung + file ảnh/video/PDF) + sửa/xoá dòng cũ.
 * `choTep=false` (kho/bảng file chưa sẵn sàng) → ẩn phần đính kèm, nhật ký chạy như cũ.
 */
export function TicketNotes({ code, notes, teps = [], choTep = false }: {
  code: string; notes: TicketNote[]; teps?: TepNhatKy[]; choTep?: boolean
}) {
  const [text, setText] = useState('')
  const [khi, setKhi] = useState(nowLocal())
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [tienDo, setTienDo] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [suaId, setSuaId] = useState<string | null>(null)
  const router = useRouter()

  const tepCua = (id: string) => teps.filter((t) => t.note_id === id)

  function chon(e: React.ChangeEvent<HTMLInputElement>) {
    const moi = Array.from(e.target.files ?? [])
    e.target.value = ''
    setErr(null)
    for (const f of moi) {
      const k = kiemTep({ ten: f.name, loai: f.type, kich_thuoc: f.size })
      if (!k.ok) { setErr(k.error); return }
    }
    const gop = [...files, ...moi]
    if (gop.length > SO_TEP_TOI_DA) { setErr(`Tối đa ${SO_TEP_TOI_DA} file mỗi lần.`); return }
    setFiles(gop)
  }

  async function taiVaGhi(): Promise<KQ> {
    const vao = files.map((f) => ({ ten: f.name, loai: f.type, kich_thuoc: f.size }))
    const cap = await capLinkTaiLen(code, vao)
    if (!cap.ok) return cap
    const kho = khoTrinhDuyet()
    const daTai: TepDaTai[] = []
    for (let i = 0; i < files.length; i++) {
      setTienDo(`Đang tải file ${i + 1}/${files.length}…`)
      const { duong_dan, token } = cap.links[i]
      const { error } = await kho.uploadToSignedUrl(duong_dan, token, files[i], { contentType: files[i].type })
      if (error) return { ok: false, error: `Tải "${files[i].name}" lỗi: ${error.message}` }
      daTai.push({ ...vao[i], duong_dan })
    }
    setTienDo('Đang lưu…')
    return themNhatKyKemTep(code, text, toIso(khi), daTai)
  }

  async function add() {
    setBusy(true); setErr(null)
    const r: KQ = files.length ? await taiVaGhi() : await addTicketNote(code, text, toIso(khi))
    setBusy(false); setTienDo(null)
    if (!r.ok) setErr(r.error)
    else { setText(''); setKhi(nowLocal()); setFiles([]); router.refresh() }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border p-3 space-y-2 bg-slate-50">
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={2}
          placeholder="Nội dung trao đổi với khách…"
          className="w-full rounded-lg border px-3 py-2 text-slate-900"
        />
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-1.5 rounded-lg border bg-white px-2 py-1 text-xs text-slate-700">
                <span>{kieuTep(f.type) === 'anh' ? '🖼️' : kieuTep(f.type) === 'video' ? '🎬' : '📄'}</span>
                <span className="max-w-[12rem] truncate">{f.name}</span>
                <span className="text-slate-400">{docKichThuoc(f.size)}</span>
                <button onClick={() => setFiles(files.filter((_, j) => j !== i))} disabled={busy}
                  className="text-red-500 hover:text-red-700" aria-label={`Bỏ ${f.name}`}>×</button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm text-slate-600 flex items-center gap-1.5">
            Thời gian
            <input type="datetime-local" value={khi} onChange={(e) => setKhi(e.target.value)}
              className="rounded-lg border px-2 py-1.5 text-sm" />
          </label>
          {choTep && (
            <label className={`rounded-lg border bg-white px-3 py-1.5 text-sm text-slate-700 ${busy ? 'opacity-50' : 'cursor-pointer hover:bg-slate-100'}`}>
              📎 Đính kèm
              <input type="file" accept={NHAN_LOAI} multiple onChange={chon} disabled={busy} className="hidden" />
            </label>
          )}
          <button onClick={add} disabled={busy || (!text.trim() && !files.length)}
            className="rounded-lg bg-slate-900 text-white px-4 py-1.5 font-medium disabled:opacity-50">
            {busy ? (tienDo ?? 'Đang thêm…') : 'Thêm'}
          </button>
        </div>
        {choTep && <p className="text-[11px] text-slate-400">Ảnh, video hoặc PDF · tối đa 50 MB/file, {SO_TEP_TOI_DA} file mỗi lần.</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-slate-400">Chưa có ghi chú nào.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) =>
            suaId === n.id ? (
              <NoteEdit key={n.id} code={code} note={n} teps={tepCua(n.id)} onXong={() => setSuaId(null)} />
            ) : (
              <li key={n.id} className="border-l-2 border-slate-200 pl-3 py-0.5 group">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  {vnDateTime(n.created_at)}{n.tac_gia && ` · ${n.tac_gia}`}
                  <button onClick={() => setSuaId(n.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-900 underline">sửa</button>
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{n.noi_dung}</p>
                <DanhSachTep teps={tepCua(n.id)} />
              </li>
            )
          )}
        </ul>
      )}
    </div>
  )
}

/** File của một dòng nhật ký: ảnh hiện thumbnail, video/PDF hiện thẻ tên. Bấm để mở tab mới. */
export function DanhSachTep({ teps, onXoa }: { teps: TepNhatKy[]; onXoa?: (t: TepNhatKy) => void }) {
  if (!teps.length) return null
  return (
    <ul className="mt-1.5 flex flex-wrap gap-2">
      {teps.map((t) => {
        const kieu = kieuTep(t.loai)
        const noiDung = kieu === 'anh' && t.url
          // eslint-disable-next-line @next/next/no-img-element -- signed URL Supabase, không qua next/image
          ? <img src={t.url} alt={t.ten} className="h-20 w-20 rounded border object-cover" />
          : (
            <span className="flex h-20 w-32 flex-col justify-center gap-0.5 rounded border bg-white px-2 text-xs text-slate-700">
              <span>{kieu === 'video' ? '🎬 Video' : kieu === 'pdf' ? '📄 PDF' : '🖼️ Ảnh'}</span>
              <span className="truncate">{t.ten}</span>
              <span className="text-slate-400">{docKichThuoc(t.kich_thuoc)}</span>
            </span>
          )
        return (
          <li key={t.id} className="relative">
            {t.url
              ? <a href={t.url} target="_blank" rel="noopener noreferrer" title={t.ten}>{noiDung}</a>
              : <span title="Không tạo được link xem">{noiDung}</span>}
            {onXoa && (
              <button onClick={() => onXoa(t)} aria-label={`Xoá ${t.ten}`}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full border bg-white text-xs leading-none text-red-600">×</button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function NoteEdit({ code, note, teps, onXong }: { code: string; note: TicketNote; teps: TepNhatKy[]; onXong: () => void }) {
  const [text, setText] = useState(note.noi_dung)
  const [khi, setKhi] = useState(toLocal(note.created_at))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function luu() {
    setBusy(true); setErr(null)
    const r = await updateTicketNote(note.id, code, { noi_dung: text, khi: toIso(khi) })
    setBusy(false)
    if (!r.ok) setErr(r.error)
    else { onXong(); router.refresh() }
  }
  async function xoa() {
    if (!window.confirm(teps.length ? `Xoá ghi chú này và ${teps.length} file đính kèm?` : 'Xoá ghi chú này?')) return
    setBusy(true); setErr(null)
    if (teps.length) {
      const d = await donTepCuaNote(note.id, code)
      if (!d.ok) { setBusy(false); setErr(d.error); return }
    }
    const r = await deleteTicketNote(note.id, code)
    setBusy(false)
    if (!r.ok) setErr(r.error)
    else { onXong(); router.refresh() }
  }
  async function xoaTep(t: TepNhatKy) {
    if (!window.confirm(`Xoá file "${t.ten}"?`)) return
    setBusy(true); setErr(null)
    const r = await xoaTepNhatKy(t.id, code)
    setBusy(false)
    if (!r.ok) setErr(r.error)
    else router.refresh()
  }

  return (
    <li className="border-l-2 border-slate-900 pl-3 py-1 space-y-1.5 bg-slate-50 rounded-r-lg">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2}
        className="w-full rounded-lg border px-2 py-1 text-sm text-slate-900" />
      <DanhSachTep teps={teps} onXoa={busy ? undefined : xoaTep} />
      <div className="flex items-center gap-2 flex-wrap">
        <input type="datetime-local" value={khi} onChange={(e) => setKhi(e.target.value)}
          className="rounded-lg border px-2 py-1 text-sm" />
        <button onClick={luu} disabled={busy}
          className="rounded-lg bg-slate-900 text-white px-3 py-1 text-sm disabled:opacity-50">Lưu</button>
        <button onClick={onXong} className="text-xs text-slate-500 underline">Huỷ</button>
        <button onClick={xoa} disabled={busy}
          className="text-xs text-red-500 hover:text-red-700 underline ml-auto">Xoá</button>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </li>
  )
}
