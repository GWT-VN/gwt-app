import Link from 'next/link'
import type { ReactNode } from 'react'
import { linkTinDiscord, mauTrangThai, nhanTrangThai, tenKho } from '@/lib/kho/nhan'
import { TuLamMoi } from './_tu-lam-moi'

/** Google Sheet theo dõi sổ kho NX (cùng dữ liệu) — đổi Sheet thì sửa ở gwt-discord-bot/admin/kho/nx-chay.mjs (SHEET_NX) VÀ ở đây. */
export const LINK_SHEET_KHO = 'https://docs.google.com/spreadsheets/d/1etncdbnKDQg2jIsJjc556pvT1HI0HTrKnMbNDeRr4d0'

export function KhungKho({ tieuDe, moTa, phai, children, kho = 'NX' }: { tieuDe: string; moTa?: ReactNode; phai?: ReactNode; children: ReactNode; kho?: string }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1200px] space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{tieuDe} <span className="text-base font-normal text-slate-400">· {tenKho(kho)}</span></h1>
            {moTa && <p className="text-sm text-slate-500">{moTa}</p>}
          </div>
          <div className="flex items-center gap-2">
            <TuLamMoi />
            {phai}
            <a href={LINK_SHEET_KHO} target="_blank" rel="noreferrer"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              Mở Google Sheet ↗
            </a>
          </div>
        </header>
        <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
          Sổ do bot <b>Bắp</b> ghi từ tin nhắn kênh Discord kho (anh kỹ thuật nhắn “<i>ngày kho xuất/nhập</i> + tên : số lượng”), cập nhật liên tục (~20 giây).
          Người có quyền <b>Sửa sổ kho</b> sửa / huỷ dòng, duyệt mã, kiểm kê được ngay trên app (hoặc trên Google Sheet) — mọi thay đổi ghi vào{' '}
          <Link href="/kho/lich-su-sua" className="underline">Lịch sử sửa</Link>, Sheet tự cập nhật trong ~20 giây.
        </p>
        {children}
      </div>
    </main>
  )
}

export function TrangThai({ ma }: { ma: string | null | undefined }) {
  if (!ma) return null
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${mauTrangThai(ma)}`}>{nhanTrangThai(ma)}</span>
}

/** `cuon={false}`: bảng có ô chọn gợi ý (danh sách thả xuống) — khung cuộn ngang sẽ cắt mất danh sách, nên để tràn tự nhiên. */
export function Bang({ dau, children, trong, phai = [], cuon = true }: { dau: ReactNode[]; children: ReactNode; trong?: boolean; phai?: number[]; cuon?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${cuon ? 'overflow-hidden' : ''}`}>
      <div className={cuon ? 'overflow-x-auto' : ''}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{dau.map((d, i) => <th key={i} className={`whitespace-nowrap px-3 py-2.5 font-medium ${phai.includes(i) ? 'text-right' : ''}`}>{d}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trong ? <tr><td colSpan={dau.length} className="px-3 py-10 text-center text-slate-400">Chưa có dữ liệu.</td></tr> : children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const O = ({ children, cls = '' }: { children?: ReactNode; cls?: string }) => <td className={`px-3 py-2 align-top ${cls}`}>{children}</td>

export function TheSo({ nhan, so, phu, mau = '' }: { nhan: string; so: number | string; phu?: ReactNode; mau?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-xs text-slate-500">{nhan}</div>
      <div className={`text-2xl font-semibold text-slate-900 ${mau}`}>{so}</div>
      {phu && <div className="text-[11px] text-slate-400">{phu}</div>}
    </div>
  )
}

export function LinkMa({ ma, kho = 'NX' }: { ma: string | null; kho?: string }) {
  if (!ma) return <span className="text-slate-400">—</span>
  return <Link href={`/kho/ma/${encodeURIComponent(ma)}${kho !== 'NX' ? `?kho=${kho}` : ''}`} className="font-mono text-[13px] text-indigo-700 hover:underline">{ma}</Link>
}

export function LinkTin({ id }: { id: string | null }) {
  const u = linkTinDiscord(id)
  return u ? <a href={u} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 underline">tin ↗</a> : null
}

/** "sửa tay · <người> · <ngày>" — dòng đã sửa tay (app / Sheet), bot không ghi đè. */
export function NhanSuaTay({ luc, boi }: { luc: string | null; boi: string | null }) {
  if (!luc) return null
  const ten = (boi ?? '').split('@')[0] || '?'
  return <div className="mt-0.5 whitespace-nowrap text-[10px] text-slate-400" title={`Sửa tay bởi ${boi ?? '?'} lúc ${ngayVN(luc)} — bot không ghi đè dòng này`}>sửa tay · {ten} · {ngayVN(luc)}</div>
}

/** Số đẹp: 1.234; số âm có dấu. */
export const sl = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(n)

/** 2026-11-03 → 03/11/2026; ISO có giờ → dd/mm/yyyy hh:mm (giờ VN). */
export function ngayVN(x: string | null | undefined): string {
  if (!x) return '—'
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(x)
  if (d) return `${d[3]}/${d[2]}/${d[1]}`
  const t = new Date(x)
  if (Number.isNaN(t.getTime())) return x
  return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' }).format(t)
}

/** Khi chưa đặt KHO_DB_URL / DB lỗi: báo rõ thay vì trang trắng. */
export function LoiKho({ loi }: { loi?: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <b>Chưa đọc được sổ kho.</b>{' '}
      {loi ? loi : 'Chưa cấu hình KHO_DB_URL (kết nối chỉ đọc tới DB Masterdata, role kho_app_doc).'}
      <div className="mt-1 text-xs">Trong lúc chờ, xem bảng theo dõi trên <a className="underline" href={LINK_SHEET_KHO} target="_blank" rel="noreferrer">Google Sheet</a>.</div>
    </div>
  )
}

/** Gọi đọc kho; lỗi → trả {loi} để trang hiện LoiKho thay vì vỡ. */
export async function thu<T>(fn: () => Promise<T>): Promise<{ ok: true; v: T } | { ok: false; loi: string }> {
  try { return { ok: true, v: await fn() } } catch (e) { return { ok: false, loi: String((e as Error)?.message ?? e) } }
}

/** ?kho= hợp lệ (NX/HCM), mặc định NX. */
export const khoTu = (x?: string) => (x === 'HCM' ? 'HCM' : 'NX')
