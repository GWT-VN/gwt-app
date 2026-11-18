'use client'
// PROTOTYPE — `TimToanCuc` (spec v2-mo-ta-app mục 3 + bảng component): gõ SĐT / tên / serial / mã đơn / mã ticket →
// gợi ý theo loại → Enter mở. Mở bằng nút 🔍 trên thanh điều hướng hoặc ⌘K / Ctrl+K. Dữ liệu giả, không đọc DB.
// Mẫu APG Combobox + listbox: focus luôn ở ô gõ, ↑↓ đổi dòng đang chọn (aria-activedescendant), Enter mở.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight, ClockCounterClockwise, Cpu, MagnifyingGlass, Package, Sparkle, Ticket as IconTicket, User, type Icon,
} from '@phosphor-icons/react'
import { HopGoc } from './HopGoc'
import { GAN_DAY } from './data'
import { bo } from '../../bang/_bang/chung'
import { DS_KHACH, TICKETS } from '../../bang/_bang/data'

export type LoaiKQ = 'ticket' | 'khach' | 'may' | 'don' | 'trang' | 'bap'
export type KetQua = { loai: LoaiKQ; id: string; ten: string; phu?: string; tim: string }

const ICON: Record<LoaiKQ, Icon> = { ticket: IconTicket, khach: User, may: Cpu, don: Package, trang: ArrowRight, bap: Sparkle }
const TEN_NHOM: Record<LoaiKQ, string> = { ticket: 'Ticket', khach: 'Khách hàng', may: 'Máy (serial)', don: 'Đơn hàng', trang: 'Đi tới', bap: 'Nhờ Bắp' }

// ---------- dữ liệu tìm (giả) ----------
const DS_TIM: KetQua[] = [
  ...TICKETS.map((t) => ({ loai: 'ticket' as const, id: t.ma, ten: `${t.ma} · ${t.khach}`, phu: `${t.tt}${t.lyDoCho ? ' · ' + t.lyDoCho : ''} · ${t.viecTiep}`, tim: `${t.ma} ${t.khach} ${t.viecTiep} ${t.serial ?? ''}` })),
  ...DS_KHACH.map((k) => ({ loai: 'khach' as const, id: k.ma, ten: k.ten, phu: `${k.ma} · ${k.loai} · ${k.khu} · SĐT …${k.sdt}`, tim: `${k.ten} ${k.ma} ${k.sdt} ${k.khu}` })),
  ...[...new Map(TICKETS.filter((t) => t.serial).map((t) => [t.serial!, t])).values()].map((t) => ({ loai: 'may' as const, id: t.serial!, ten: t.serial!, phu: `${t.may} · ${t.khach}`, tim: `${t.serial} ${t.may} ${t.khach}` })),
  ...[
    { id: '261118-E004', phu: 'Shopee · VTP đã giao · Nguyễn Văn An' }, { id: 'HO-1123', phu: 'Hannah Olala · CTS20 × 1 · Hà Nội · chờ xử lý' },
    { id: '261117-S002', phu: 'Website · chờ lắp · Công ty TNHH Minh Phát' }, { id: '261115-A019', phu: 'Đại lý · đã lắp · Trường MN Hoa Mai' },
  ].map((d) => ({ loai: 'don' as const, id: d.id, ten: `Đơn ${d.id}`, phu: d.phu, tim: `${d.id} ${d.phu}` })),
]
const DI_TOI: KetQua[] = ['Việc hôm nay', 'Danh sách ticket', 'Tạo ticket', 'Khách hàng', 'Máy & bảo hành'].map((t) => ({ loai: 'trang', id: 'trang:' + t, ten: t, tim: t }))
const GAN_DAY_KQ: KetQua[] = GAN_DAY.map((g) => ({ loai: g.loai as LoaiKQ, id: 'gd:' + g.ten, ten: g.ten, tim: g.ten }))

/** Thứ tự nhóm theo dạng chữ gõ: toàn số → SĐT/mã đơn trước; "TK…" → ticket; chữ + số dài → serial */
function thuTuNhom(q: string): LoaiKQ[] {
  const k = q.replace(/[\s.+-]/g, '') // SĐT gõ kiểu 0909.123 / 0909-123 vẫn là số
  if (/^\d{3,}$/.test(k)) return ['khach', 'don', 'ticket', 'may']
  if (/^tk/i.test(k)) return ['ticket', 'khach', 'may', 'don']
  if (/^(?=.*\d)(?=.*[a-z])[a-z0-9-]{5,}$/i.test(k)) return ['may', 'ticket', 'don', 'khach']
  return ['ticket', 'khach', 'may', 'don']
}
const MOI_NHOM = 5

/** Tô đậm đoạn khớp, so không dấu nhưng giữ nguyên chữ gốc (ánh xạ từng ký tự gốc → ký tự đã bỏ dấu) */
export function danhDau(s0: string, q: string): ReactNode {
  const s = s0.normalize('NFC') // NFD (dấu tách rời) làm dấu của ký tự cuối rơi ra ngoài <mark>
  const k = bo(q.trim()); if (!k) return s
  let n = ''; const vt: number[] = []
  for (let i = 0; i < s.length; i++) for (const c of bo(s[i])) { n += c; vt.push(i) }
  const o = n.indexOf(k); if (o < 0) return s
  const a = vt[o], b = vt[o + k.length - 1] + 1
  return <>{s.slice(0, a)}<mark>{s.slice(a, b)}</mark>{s.slice(b)}</>
}

function NoiDungTim({ chon }: { chon: (k: KetQua) => void }) {
  const [q, setQ] = useState('')
  const [dang, setDang] = useState(0)
  const ds = useRef<HTMLDivElement>(null)
  const id = useId()
  const nhom = useMemo((): { loai: LoaiKQ | 'ganday'; ten: string; muc: KetQua[]; tong: number }[] => {
    if (!q.trim()) return [{ loai: 'ganday', ten: 'Gần đây', muc: GAN_DAY_KQ, tong: GAN_DAY_KQ.length }, { loai: 'trang', ten: TEN_NHOM.trang, muc: DI_TOI, tong: DI_TOI.length }]
    const k = bo(q.trim()), laSo = /^[\d\s.+-]+$/.test(q.trim()), so = q.replace(/\D/g, '')
    // gõ toàn số (SĐT có dấu cách/chấm) → so theo chữ số; có chữ cái (mã đơn HO-1123) thì KHÔNG, tránh khớp nhầm mọi thứ chứa 1123
    const khop = (x: KetQua) => bo(x.tim).includes(k) || (laSo && so.length >= 3 && x.tim.split(/\s+/).some((t) => t.replace(/\D/g, '').includes(so))) // từng trường riêng — không khớp nối qua ranh giới 2 trường
    const kq = thuTuNhom(q).map((l) => { const m = DS_TIM.filter((x) => x.loai === l && khop(x)); return { loai: l, ten: TEN_NHOM[l], muc: m.slice(0, MOI_NHOM), tong: m.length } }).filter((g) => g.muc.length)
    return [...kq, { loai: 'bap' as const, ten: TEN_NHOM.bap, muc: [{ loai: 'bap' as const, id: 'bap', ten: `Hỏi Bắp: “${q.trim()}”`, tim: q }], tong: 1 }]
  }, [q])
  const phang = nhom.flatMap((g) => g.muc)
  const i = Math.min(dang, phang.length - 1)
  const idMuc = (n: number) => `${id}-m${n}`
  useEffect(() => { ds.current?.querySelector(`#${CSS.escape(idMuc(i))}`)?.scrollIntoView({ block: 'nearest' }) }, [i]) // eslint-disable-line react-hooks/exhaustive-deps
  const coKetQua = nhom.some((g) => g.loai !== 'bap')
  const soKetQua = nhom.filter((g) => g.loai !== 'bap').reduce((t, g) => t + g.tong, 0)
  const dau = nhom.map((_, k) => nhom.slice(0, k).reduce((t, g) => t + g.muc.length, 0)) // vị trí phẳng của mục đầu mỗi nhóm
  return (
    <>
      <div className="ui-command-input">
        <MagnifyingGlass className="ui-icon" aria-hidden />
        <input data-autofocus role="combobox" aria-expanded aria-controls={id + '-ds'} aria-activedescendant={phang.length ? idMuc(i) : undefined} aria-autocomplete="list"
          aria-label="Tìm toàn cục" placeholder="Tìm SĐT, tên khách, serial, mã đơn, mã ticket…" value={q} spellCheck={false} autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setDang(0) }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return // Telex gạch chân (macOS/Windows): Enter đang chốt chữ, không phải mở kết quả
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (phang.length) setDang((i + (e.key === 'ArrowDown' ? 1 : -1) + phang.length) % phang.length) }
            if (e.key === 'Enter' && phang[i]) { e.preventDefault(); chon(phang[i]) }
          }} />
        <kbd className="ui-kbd ui-command-esc">Esc</kbd>
      </div>
      {/* trình đọc màn hình: đọc số kết quả mỗi lần gõ (aria-activedescendant giữ nguyên id mục đầu nên không tự đọc lại) */}
      <div role="status" className="ui-sr-only">{q.trim() ? (coKetQua ? `${soKetQua} kết quả` : `Không thấy “${q.trim()}”`) : ''}</div>
      {q.trim() && !coKetQua && <div className="ui-menu-empty ui-command-rong">Không thấy “{q.trim()}” trong ticket, khách, serial, đơn. Thử bỏ bớt chữ, hoặc hỏi Bắp.</div>}
      <div className="ui-command-list" id={id + '-ds'} role="listbox" aria-label="Kết quả" ref={ds}>
        {nhom.map((g, gi) => (
          <div key={g.loai} role="group" aria-labelledby={`${id}-${g.loai}`}>
            <div className="ui-menu-label" id={`${id}-${g.loai}`}>
              {g.loai === 'ganday' && <ClockCounterClockwise className="ui-icon" aria-hidden />}{g.ten}
              {g.tong > g.muc.length && <span className="ui-command-dem"> · {g.muc.length}/{g.tong}</span>}
            </div>
            {g.muc.map((m, mi) => {
              const so = dau[gi] + mi, I = ICON[m.loai]
              return (
                <div key={m.id} id={idMuc(so)} role="option" aria-selected={so === i} className="ui-command-item"
                  onMouseMove={() => { if (so !== i) setDang(so) }} onClick={() => chon(m)}>
                  <I className="ui-icon" aria-hidden />
                  <span className="ui-command-text">
                    <span className="ui-command-ten">{danhDau(m.ten, q)}</span>
                    {m.phu && <span className="ui-command-phu">{danhDau(m.phu, q)}</span>}
                  </span>
                  {so === i && <kbd className="ui-kbd" aria-hidden>↵</kbd>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="ui-command-foot" aria-hidden>
        <span><kbd className="ui-kbd">↑</kbd><kbd className="ui-kbd">↓</kbd> chọn</span>
        <span><kbd className="ui-kbd">↵</kbd> mở</span>
        <span><kbd className="ui-kbd">Esc</kbd> đóng</span>
        <span className="ui-command-foot-phai">Tìm không cần gõ dấu</span>
      </div>
    </>
  )
}

/** Ô tìm toàn cục. `chon` nhận kết quả đã chọn — trang gọi tự điều hướng. */
export function TimToanCuc({ mo, dong, chon }: { mo: boolean; dong: () => void; chon: (k: KetQua) => void }) {
  return (
    <HopGoc mo={mo} dong={dong} className="ui-command" nhan="Tìm toàn cục">
      <NoiDungTim chon={(k) => { dong(); chon(k) }} />
    </HopGoc>
  )
}

/** ⌘K / Ctrl+K mở ô tìm ở bất kỳ đâu trong app */
export function usePhimTim(mo: () => void) {
  const f = useRef(mo)
  useEffect(() => { f.current = mo })
  useEffect(() => {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform)
    const k = (e: KeyboardEvent) => {
      if (e.isComposing || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'k') return
      if (mac ? !e.metaKey || e.ctrlKey : !e.ctrlKey || e.metaKey) return // Mac: ⌘K — Ctrl+K trong ô nhập macOS là "xoá tới cuối dòng"
      e.preventDefault(); f.current()
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
}
