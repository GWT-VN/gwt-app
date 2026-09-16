'use client'

import { useState, useTransition } from 'react'
import { OChonGoiY, type MucChon } from '@/bang'
import { suaSaoKe, type SaoKeRow } from '../actions'
import type { HoaDonTom } from '@/lib/ke-toan/sao-ke/kieu'

/** Thu: 4 mục cố định (không đi qua danhSachMa() — không phải KMCP/catalog). */
const MA_THU: MucChon[] = [
  { gt: 'BAN_HANG', nhan: 'Bán hàng' },
  { gt: 'NOI_BO', nhan: 'Chuyển tiền nội bộ' },
  { gt: 'LAI_NH', nhan: 'Lãi ngân hàng' },
  { gt: 'HOAN_TIEN', nhan: 'Hoàn tiền' },
]

/** nhan dạng "mã · tên" (danhSachMa()) → lấy phần tên cho code_name; nhan trơn thì dùng nguyên. */
function tenTuNhan(nhan: string): string {
  const i = nhan.indexOf(' · ')
  return i === -1 ? nhan : nhan.slice(i + 3)
}

type Patch = Partial<{
  matchKind: SaoKeRow['match_kind']; matchId: number | null; code: string | null; codeName: string | null
  partyCode: string | null; customerCode: string | null; hasInvoice: boolean | null; note: string | null
}>

/**
 * 4 ô sửa tại chỗ của một dòng sao kê: Khớp HĐ · Mã · Đối tượng · Ghi chú. Mỗi lần lưu gửi ĐỦ các
 * trường hiện tại của dòng (RPC ke_toan_sao_ke_sua ghi đè toàn bộ, không merge phía server) — patch
 * chỉ đổi phần đang sửa, còn lại lấy từ `d` (props, refresh theo revalidatePath sau mỗi lần lưu).
 */
export function DongSaoKe({ d, hoaDon, ma, ky }: { d: SaoKeRow; hoaDon: HoaDonTom[]; ma: MucChon[]; ky: string }) {
  const [note, setNote] = useState(d.note ?? '')
  const [noteGoc, setNoteGoc] = useState(d.note)
  const [partyCode, setPartyCode] = useState(d.party_code ?? '')
  const [partyGoc, setPartyGoc] = useState(d.party_code)
  const [tb, setTb] = useState<{ ok: boolean; msg: string } | null>(null)
  const [dang, batDau] = useTransition()

  // Đồng bộ lại ô nhập khi server trả dữ liệu mới (upload lại, hoặc sửa từ ô khác) — chỉnh state
  // NGAY TRONG RENDER khi prop gốc đổi (khuyến nghị của React thay vì useEffect), không đè lúc đang
  // gõ dở giữa hai lần blur vì chỉ chạy khi giá trị gốc từ server thực sự đổi.
  if (d.note !== noteGoc) { setNoteGoc(d.note); setNote(d.note ?? '') }
  if (d.party_code !== partyGoc) { setPartyGoc(d.party_code); setPartyCode(d.party_code ?? '') }

  function baoXanh(msg: string) {
    setTb({ ok: true, msg }); setTimeout(() => setTb(null), 2000)
  }

  // Spread merge — patch chỉ ghi đè đúng trường có mặt (kể cả khi trị mới là null), trường vắng
  // mặt giữ nguyên từ d. Tránh phải phân biệt "không truyền" với "truyền null" bằng non-null assertion.
  function luu(patch: Patch, msg = 'Đã lưu') {
    batDau(async () => {
      const merged = {
        matchKind: d.match_kind, matchId: d.match_id, code: d.code, codeName: d.code_name,
        partyCode: d.party_code, customerCode: d.customer_code, hasInvoice: d.has_invoice, note: d.note,
        ...patch,
      }
      const r = await suaSaoKe({ lineId: d.id, ky, ...merged })
      if (!r.ok) { setTb({ ok: false, msg: r.error }); return }
      baoXanh(msg)
    })
  }

  const huongHd = d.direction === 'chi' ? 'vao' : 'ra'
  const cungHuong = hoaDon.filter((h) => h.direction === huongHd)
  const matched = d.match_id != null ? hoaDon.find((h) => h.id === d.match_id) : undefined
  const tuyChonMa = d.direction === 'chi' ? ma : MA_THU

  return (
    <>
      <td className="p-1 min-w-[220px]">
        {d.match_kind === 'invoice' ? (
          matched ? (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-800">
              HĐ {matched.soHd} · {matched.ten} · {matched.tongTt.toLocaleString('vi-VN')}
              <button type="button" disabled={dang} aria-label="Bỏ khớp" title="Bỏ khớp"
                onClick={() => luu({ matchKind: 'pending', matchId: null, hasInvoice: false }, 'Đã bỏ khớp')}
                className="text-slate-400 hover:text-rose-600">×</button>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-400">
              HĐ #{d.match_id} (không thấy trong danh sách)
              <button type="button" disabled={dang} aria-label="Bỏ khớp" title="Bỏ khớp"
                onClick={() => luu({ matchKind: 'pending', matchId: null, hasInvoice: false }, 'Đã bỏ khớp')}
                className="text-slate-400 hover:text-rose-600">×</button>
            </span>
          )
        ) : (
          <div className="space-y-1">
            {(d.suggestions ?? []).slice(0, 3).map((s, i) => (
              s.hoaDonId === 0 ? (
                <span key={i} className="block truncate text-slate-400" title={s.canCu}>{s.ten} · {s.tongTt.toLocaleString('vi-VN')} ({s.canCu})</span>
              ) : (
                <button key={i} type="button" disabled={dang}
                  onClick={() => luu({ matchKind: 'invoice', matchId: s.hoaDonId, hasInvoice: true, partyCode: s.mst ?? d.party_code, code: d.code ?? s.code })}
                  className="block w-full truncate rounded border border-slate-200 px-1 py-0.5 text-left hover:bg-slate-50" title={s.canCu}>
                  {s.kyHieu} {s.soHd} · {s.ten} · {s.tongTt.toLocaleString('vi-VN')}
                </button>
              )
            ))}
            <div className="flex items-center gap-1">
              <OChonGoiY giaTri={null} choPhepXoa={false} choTrong="Chọn HĐ…" className="text-xs" toiDa={30}
                tuyChon={cungHuong.map((h) => ({ gt: String(h.id), nhan: `${h.soHd} · ${h.ten}`, phu: h.tongTt.toLocaleString('vi-VN') }))}
                onChon={(gt) => { const h = cungHuong.find((x) => String(x.id) === gt); if (!h) return; luu({ matchKind: 'invoice', matchId: h.id, hasInvoice: true, partyCode: h.mst ?? d.party_code, code: d.code ?? h.code }) }} />
              <button type="button" disabled={dang} onClick={() => luu({ matchKind: 'none', matchId: null, hasInvoice: false }, 'Đã đánh dấu không có HĐ')}
                className="shrink-0 text-[11px] text-slate-500 underline">Không có HĐ</button>
            </div>
          </div>
        )}
      </td>
      <td className="p-1 min-w-[200px]">
        <OChonGoiY giaTri={d.code} tuyChon={tuyChonMa} choTrong="Gõ mã / tên…" className="text-xs"
          onChon={(gt) => { const opt = tuyChonMa.find((m) => m.gt === gt); luu({ code: gt || null, codeName: opt ? tenTuNhan(opt.nhan) : null }) }} />
        {d.code_name ? <div className="px-1 text-[11px] text-slate-500">{d.code_name}</div> : null}
      </td>
      <td className="p-1 min-w-[120px]">
        <input value={partyCode} onChange={(e) => setPartyCode(e.target.value)}
          onBlur={() => partyCode !== (d.party_code ?? '') && luu({ partyCode: partyCode || null })}
          placeholder="—" aria-label="Đối tượng" className="w-full rounded border px-1 py-0.5 text-xs" />
        {d.customer_code ? <div className="px-1 text-[11px] text-slate-400">{d.customer_code}</div> : null}
      </td>
      <td className="p-1 min-w-[160px]">
        <input value={note} onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== (d.note ?? '') && luu({ note: note || null })}
          placeholder="Ghi chú" aria-label="Ghi chú" className="w-full rounded border px-1 py-0.5 text-xs" />
        {tb ? <div role={tb.ok ? undefined : 'alert'} className={`px-1 text-[11px] ${tb.ok ? 'text-emerald-700' : 'text-red-600'}`}>{tb.msg}</div> : null}
      </td>
    </>
  )
}
