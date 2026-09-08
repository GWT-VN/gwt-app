'use client'

import { useActionState, useState } from 'react'
import { KHU_HOP_LE } from '@/lib/wiki-ingest/kiem-tra'
import { hanhDongDeXuat, type DeXuatRow } from './actions'

const TEN_KHU: Record<string, string> = {
  'cong-viec-chung': 'Công việc chung', sales: 'Sales', cskh: 'CSKH', 'van-hanh': 'Vận hành',
  'tai-chinh': 'Tài chính', 'kien-thuc-nen': 'Kiến thức nền', 'san-pham': 'Sản phẩm (→ PKB, không publish)',
}

/**
 * Một đề xuất = một form: sửa câu hỏi/trả lời/khu, tick PII, rồi Lưu · Duyệt · Từ chối (cùng
 * một server action, phân nhánh theo `hanh_dong`). Duyệt tự lưu sửa trước.
 */
export function DongDeXuat({ row, tenKhu }: { row: DeXuatRow; tenKhu: string }) {
  const [kq, act, dang] = useActionState(hanhDongDeXuat, null)
  const [khu, setKhu] = useState(row.khu)
  const [moLyDo, setMoLyDo] = useState(false)
  const laSanPham = khu === 'san-pham'
  const daXong = kq?.ok && (kq.hanhDong === 'duyet' || kq.hanhDong === 'tu_choi')
  return (
    <form action={act} className={`card ${row.can_pkb ? 'border-amber-300' : ''}`} style={{ display: 'grid', gap: 8, opacity: daXong ? 0.55 : 1 }}>
      <input type="hidden" name="id" value={row.id} />
      <div className="wiki-the-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span className="chip">#{row.id}</span>
        <span className="chip">{row.status === 'pending' ? 'Chờ duyệt' : row.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}</span>
        {row.can_pkb ? <span className="chip" style={{ background: '#fbeed8' }}>Về sản phẩm — cần đưa vào PKB</span> : null}
        {row.khu_goi_y && row.khu_goi_y !== row.khu ? <span className="chip" title="Routine đoán">gợi ý: {row.khu_goi_y}</span> : null}
        {row.confidence != null ? <span className="chip mono" title="Độ tin cậy routine">{Math.round(row.confidence * 100)}%</span> : null}
        <span className="text-xs text-slate-500">{row.answered_by ?? '—'} · {row.answered_at ? new Date(row.answered_at).toLocaleString('vi-VN') : ''}</span>
        <a className="text-xs underline" href={row.jump_link} target="_blank" rel="noreferrer">Mở tin Discord ↗</a>
        {row.reviewed_by_email ? <span className="text-xs text-slate-500" style={{ marginLeft: 'auto' }}>{row.status === 'rejected' ? 'Từ chối' : 'Duyệt'} bởi {row.reviewed_by_email}{row.reject_reason ? ` — ${row.reject_reason}` : ''}</span> : null}
      </div>

      <label className="text-sm">Câu hỏi
        <textarea name="question" defaultValue={row.question} rows={2} required className="mt-1 w-full rounded border px-2 py-1 text-sm" />
      </label>
      <label className="text-sm">Trả lời (markdown)
        <textarea name="answer" defaultValue={row.answer} rows={5} required className="mt-1 w-full rounded border px-2 py-1 text-sm" />
      </label>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label>Khu{' '}
          <select name="khu" value={khu} onChange={(e) => setKhu(e.target.value)} className="rounded border px-2 py-1">
            {KHU_HOP_LE.map((k) => <option key={k} value={k}>{TEN_KHU[k] ?? k}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" name="pii_checked" defaultChecked={row.pii_checked} /> Đã rà PII (tên/SĐT khách)
        </label>
        <span className="text-xs text-slate-500">khu hiện tại: {tenKhu}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button name="hanh_dong" value="sua" disabled={dang || row.status === 'rejected'} className="rounded border px-3 py-1 text-sm disabled:opacity-50">Lưu</button>
        <button name="hanh_dong" value="duyet" disabled={dang || row.status !== 'pending' || laSanPham}
          title={laSanPham ? 'Q&A về sản phẩm không publish ở đây — đưa vào PKB' : undefined}
          className="rounded bg-[#0e8c9a] px-3 py-1 text-sm font-medium text-white disabled:opacity-50">Duyệt & đăng</button>
        {!moLyDo ? (
          <button type="button" onClick={() => setMoLyDo(true)} disabled={dang || row.status === 'rejected'} className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 disabled:opacity-50">
            {row.status === 'approved' ? 'Gỡ khỏi wiki' : 'Từ chối'}
          </button>
        ) : (
          <>
            <input name="ly_do" placeholder="Lý do (tuỳ chọn)" className="rounded border px-2 py-1 text-sm" />
            <button name="hanh_dong" value="tu_choi" disabled={dang} className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50">Xác nhận từ chối</button>
          </>
        )}
        {dang ? <span className="text-sm text-slate-500">Đang xử lý…</span> : null}
        {kq?.ok ? <span className="text-sm text-emerald-700">{kq.hanhDong === 'duyet' ? 'Đã duyệt & đăng.' : kq.hanhDong === 'tu_choi' ? 'Đã từ chối.' : 'Đã lưu.'}</span> : null}
        {kq && !kq.ok ? <span className="text-sm text-red-600">{kq.error}</span> : null}
      </div>
    </form>
  )
}
