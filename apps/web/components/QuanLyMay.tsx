'use client'

import { OChonGoiY } from '@/bang/OChonGoiY'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  datTrangThaiSerial, doiMayChoKhach, doiKhachMay, doiSerialMay, xoaMayDaLap,
  lapMayChoKhach, suaSuKien, xoaSuKien, serialsTheoMay, type SuDungSerial, type SerialKho, type TrangThai,
} from '@/app/actions'
import { MAU_TRANG_THAI } from '@/lib/danhSach'
import { KhachPicker } from '@/components/KhachPicker'
import { vnDateTime } from '@/components/TicketBadge'

type KetQua = { ok: true; applied?: boolean; ma_moi?: string } | { ok: false; error: string }
type Panel = '' | 'doi_may' | 'doi_serial' | 'doi_khach' | 'go' | 'lap' | 'doi_tt'

/**
 * MỘT chỗ quản lý máy: trạng thái + nhật ký + thao tác.
 *  · Máy ở khách: Đổi máy / Sửa serial / Đổi khách / Gỡ về kho.
 *  · Máy ở kho: đổi trạng thái (kèm mô tả + NGÀY) hoặc LẮP cho khách (tuỳ chọn kích BH).
 *  · Nhật ký: admin sửa được MỐC NGÀY từng sự kiện (backfill/chỉnh lịch sử).
 */
export function QuanLyMay({
  serial, internalCode, trangThai, suKien, dangLap, choLapThuDoi, choSuaKhach, choKhoSerial, ds,
}: {
  serial: string; internalCode: string | null; trangThai: string | null
  suKien: SuDungSerial[]; dangLap: boolean
  /** Đổi máy cho khách (thu hồi/lắp thay) — cs.may.lap_thu_doi */
  choLapThuDoi: boolean
  /** Sửa serial gõ nhầm · đổi khách · gỡ khỏi khách — cs.khach.xin_xoa */
  choSuaKhach: boolean
  /** Đổi trạng thái kho + sửa ngày sự kiện vòng đời — cs.serial.kho */
  choKhoSerial: boolean
  ds: TrangThai[]
}) {
  const router = useRouter()
  const [panel, setPanel] = useState<Panel>('')
  const [dsMoi, setDsMoi] = useState<SerialKho[]>([])
  const [serialMoi, setSerialMoi] = useState('')
  const [den, setDen] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [ngay, setNgay] = useState('')
  const [khachId, setKhachId] = useState('')
  const [kichBH, setKichBH] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  // sửa 1 sự kiện vòng đời: ngày + mô tả + trạng thái
  const [suaId, setSuaId] = useState<string | null>(null)
  const [sNgay, setSNgay] = useState('')
  const [sGhi, setSGhi] = useState('')
  const [sDen, setSDen] = useState('')

  const mapTT = new Map(ds.map((t) => [t.code, t]))
  const nhan = (code: string | null | undefined) => (code ? mapTT.get(code)?.nhan ?? code : '—')
  const mauClass = (code: string | null | undefined) =>
    MAU_TRANG_THAI[mapTT.get(code ?? '')?.mau ?? 'slate'] ?? MAU_TRANG_THAI.slate
  const datTayList = ds.filter((t) => t.cho_dat_tay && t.hoat_dong && t.code !== trangThai)

  function mo(p: Panel) {
    setPanel(p); setErr(null); setMsg(null); setSerialMoi(''); setKhachId(''); setKichBH(false); setGhiChu(''); setNgay('')
    if ((p === 'doi_may' || p === 'doi_serial') && internalCode) {
      serialsTheoMay(internalCode).then((r) => setDsMoi(r.filter((s) => s.serial !== serial)))
    }
  }
  async function chay(fn: () => Promise<KetQua>, confirmMsg: string, okMsg: string) {
    if (!window.confirm(confirmMsg)) return
    setBusy(true); setErr(null); setMsg(null)
    const r = await fn()
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setMsg('applied' in r && r.applied === false ? 'Đã gửi chờ admin duyệt.' : okMsg)
    setPanel(''); setGhiChu(''); setNgay(''); setKhachId(''); router.refresh()
  }
  async function luuSuaMoc() {
    if (!suaId || !sNgay) return
    setBusy(true); setErr(null); setMsg(null)
    const r = await suaSuKien(suaId, sNgay, sGhi, sDen || undefined)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setSuaId(null); setMsg('Đã sửa.'); router.refresh()
  }
  async function xoaMoc(id: string) {
    if (!window.confirm('Xoá dòng trạng thái này khỏi lịch sử? Trạng thái hiện tại của máy sẽ tính lại theo dòng mới nhất còn lại.')) return
    setBusy(true); setErr(null); setMsg(null)
    const r = await xoaSuKien(id)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setSuaId(null); setMsg('Đã xoá dòng trạng thái.'); router.refresh()
  }

  const nut = 'rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50'
  // Gõ-để-tìm thay `<select>` trần. Danh sách đã lọc theo ĐÚNG loại máy, nhưng đo prod 22/08:
  // **19/31 loại có hơn 10 serial tồn kho**, loại nhiều nhất **340 serial** — quá ngưỡng luật
  // CEO chốt 22/08 (`docs/CHUAN-FILTER.md` Luật 2). Serial là chuỗi dài dễ đọc nhầm, cuộn tìm
  // bằng mắt trong 340 dòng là chỗ chắc chắn bấm nhầm.
  const oSerial = (
    <div className="min-w-[280px]">
      <OChonGoiY
        giaTri={serialMoi || null}
        onChon={setSerialMoi}
        tuyChon={dsMoi.map((s) => ({ gt: s.serial, nhan: s.serial }))}
        choTrong="Gõ serial để tìm (tồn kho, cùng loại)…"
      />
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Trạng thái:</span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${mauClass(trangThai)}`}>{nhan(trangThai)}</span>
      </div>

      {/*
        Bốn nút này TRƯỚC ĐÂY chung một cờ laAdmin, nhưng phía sau chúng là HAI
        quyền khác nhau: "Đổi máy cho khách" gọi doiMayChoKhach (cs.may.lap_thu_doi),
        ba nút còn lại gọi doiSerialMay/doiKhachMay/xoaMayDaLap (cs.khach.xin_xoa).
        Gộp lại thì giao diện nói dối theo cả hai chiều — nay tách theo đúng quyền.
      */}
      {(choLapThuDoi || choSuaKhach) && dangLap && (
        <div className="rounded-lg border p-3 space-y-2 bg-slate-50">
          <p className="text-xs font-medium text-slate-600">Máy đang ở khách — thao tác:</p>
          <div className="flex flex-wrap gap-2">
            {choLapThuDoi && <button onClick={() => mo(panel === 'doi_may' ? '' : 'doi_may')} className={`${nut} border-slate-300 text-slate-800`}>Đổi máy cho khách (máy lỗi)</button>}
            {choSuaKhach && <button onClick={() => mo(panel === 'doi_serial' ? '' : 'doi_serial')} className={`${nut} text-slate-700`}>Sửa serial gõ nhầm</button>}
            {choSuaKhach && <button onClick={() => mo(panel === 'doi_khach' ? '' : 'doi_khach')} className={`${nut} text-slate-700`}>Đổi khách</button>}
            {choSuaKhach && <button onClick={() => mo(panel === 'go' ? '' : 'go')} className={`${nut} border-red-200 text-red-600`}>Gỡ khỏi khách (về kho)</button>}
          </div>

          {panel === 'doi_may' && (
            <div className="rounded-lg border bg-white p-2.5 space-y-2">
              <p className="text-xs text-slate-500">Thay máy MỚI cho khách: máy này về <strong>Thu hồi bảo hành</strong>, máy mới nối tiếp <strong>bảo hành + khách cũ</strong>.</p>
              <div className="flex flex-wrap items-center gap-2">
                {oSerial}
                <input value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Lý do (tuỳ chọn)" className="rounded-lg border px-3 py-1.5 text-sm text-slate-900" />
                <button disabled={busy || !serialMoi} onClick={() => chay(() => doiMayChoKhach(serial, serialMoi, ghiChu || undefined), `Đổi máy ${serial} → ${serialMoi} cho khách?`, 'Đã đổi máy.')} className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm disabled:opacity-50">Đổi máy</button>
              </div>
            </div>
          )}
          {panel === 'doi_serial' && (
            <div className="rounded-lg border bg-white p-2.5 space-y-2">
              <p className="text-xs text-slate-500">Chỉ SỬA serial gõ sai (giữ khách + BH): serial cũ về <strong>tồn kho</strong>, serial đúng thành <strong>đã lắp</strong>.</p>
              <div className="flex flex-wrap items-center gap-2">
                {oSerial}
                <button disabled={busy || !serialMoi} onClick={() => chay(() => doiSerialMay(serial, serialMoi), `Sửa serial ${serial} → ${serialMoi} (giữ khách)?`, 'Đã sửa serial.')} className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm disabled:opacity-50">Sửa</button>
              </div>
            </div>
          )}
          {panel === 'doi_khach' && (
            <div className="rounded-lg border bg-white p-2.5 space-y-2">
              <p className="text-xs text-slate-500">Cùng serial, gắn sang khách khác.</p>
              <KhachPicker onPick={(id) => chay(() => doiKhachMay(serial, id), `Đổi khách cho serial ${serial}?`, 'Đã đổi khách.')} />
            </div>
          )}
          {panel === 'go' && (
            <div className="rounded-lg border border-red-200 bg-white p-2.5 space-y-2">
              <p className="text-xs text-slate-500">Chỉ <strong>bỏ gán khách</strong> (KHÔNG xoá khách); serial về <strong>tồn kho</strong>, gỡ BH + lịch lõi của máy này.</p>
              <button disabled={busy} onClick={() => chay(() => xoaMayDaLap(serial), `Gỡ máy ${serial} khỏi khách, trả serial về kho?`, 'Đã gỡ về kho.')} className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-sm hover:bg-red-50 disabled:opacity-50">Gỡ về kho</button>
            </div>
          )}
        </div>
      )}

      {choKhoSerial && !dangLap && (
        <div className="rounded-lg border p-3 space-y-2 bg-slate-50">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => mo(panel === 'doi_tt' ? '' : 'doi_tt')} className={`${nut} text-slate-700`}>Đổi trạng thái</button>
            <button onClick={() => mo(panel === 'lap' ? '' : 'lap')} className={`${nut} border-emerald-300 text-emerald-800`}>Lắp cho khách (từ kho)</button>
          </div>

          {panel === 'doi_tt' && (
            <div className="rounded-lg border bg-white p-2.5 space-y-2">
              <p className="text-xs text-slate-500">Bắt buộc mô tả hiện trạng, được chỉnh ngày. Đổi xong lịch sử trạng thái cũ vẫn giữ nguyên.</p>
              <div className="flex flex-wrap items-center gap-2">
                <select value={den} onChange={(e) => setDen(e.target.value)} className="rounded-lg border px-3 py-1.5 text-sm bg-white text-slate-900">
                  <option value="">— Chọn trạng thái —</option>
                  {datTayList.map((t) => <option key={t.code} value={t.code}>{t.nhan}</option>)}
                </select>
                <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} title="Ngày (bỏ trống = hôm nay)" className="rounded-lg border px-2 py-1.5 text-sm text-slate-900" />
                <input value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Vị trí / mô tả hiện trạng — vd: Kho Vạn Bảo (bắt buộc)" className="rounded-lg border px-3 py-1.5 text-sm text-slate-900 min-w-72" />
                <button disabled={busy || !den || !ghiChu.trim()} onClick={() => chay(() => datTrangThaiSerial(serial, den, ghiChu, ngay || undefined), `Đổi trạng thái serial ${serial} → ${nhan(den)}?`, 'Đã cập nhật.')} className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm disabled:opacity-50">Đặt</button>
              </div>
            </div>
          )}

          {panel === 'lap' && (
              <div className="rounded-lg border bg-white p-2.5 space-y-2">
                <p className="text-xs text-slate-500">Gắn máy này cho khách → thành <strong>Đã lắp</strong>, hiện ở &ldquo;Máy đã lắp&rdquo;. Bỏ tick BH cho ca <strong>lắp nội bộ</strong> (không kích hoạt bảo hành).</p>
                {khachId ? <p className="text-xs text-emerald-700">✓ đã chọn khách</p> : <KhachPicker onPick={(id) => setKhachId(id)} />}
                <div className="flex flex-wrap items-center gap-2">
                  <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} title="Ngày lắp" className="rounded-lg border px-2 py-1.5 text-sm text-slate-900" />
                  <label className="flex items-center gap-1.5 text-sm text-slate-700"><input type="checkbox" checked={kichBH} onChange={(e) => setKichBH(e.target.checked)} />Kích hoạt bảo hành</label>
                  <input value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Ghi chú (tuỳ chọn)" className="rounded-lg border px-3 py-1.5 text-sm text-slate-900" />
                  <button disabled={busy || !khachId || !ngay} onClick={() => chay(() => lapMayChoKhach(serial, khachId, ngay, kichBH, ghiChu || undefined), `Lắp ${serial} cho khách${kichBH ? ' + kích BH' : ' (nội bộ, không BH)'}?`, 'Đã lắp cho khách.')} className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm disabled:opacity-50">Lắp</button>
                </div>
                {!ngay && <p className="text-[11px] text-amber-600">Chọn ngày lắp.</p>}
              </div>
            )}
        </div>
      )}

      {(msg || err) && <p className={`text-sm ${err ? 'text-red-600' : 'text-emerald-700'}`}>{err ?? msg}</p>}

      {suKien.length > 0 ? (
        <div>
          <p className="text-xs text-slate-500 mb-1">Nhật ký vòng đời</p>
          <ul className="border rounded-lg divide-y text-sm">
            {suKien.map((s) => (
              <li key={s.id} className="px-3 py-2">
                {suaId === s.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={sDen} onChange={(e) => setSDen(e.target.value)} className="rounded border px-2 py-1 text-sm bg-white text-slate-900">
                      <option value="">(giữ trạng thái)</option>
                      {ds.filter((t) => t.hoat_dong).map((t) => <option key={t.code} value={t.code}>{t.nhan}</option>)}
                    </select>
                    <input type="date" value={sNgay} onChange={(e) => setSNgay(e.target.value)} className="rounded border px-2 py-1 text-sm" />
                    <input value={sGhi} onChange={(e) => setSGhi(e.target.value)} placeholder="Vị trí / mô tả" className="flex-1 min-w-40 rounded border px-2 py-1 text-sm" />
                    <button disabled={busy || !sNgay} onClick={luuSuaMoc} className="rounded bg-slate-900 text-white px-2.5 py-1 text-sm disabled:opacity-50">Lưu</button>
                    <button onClick={() => setSuaId(null)} className="text-slate-500 underline text-sm">Huỷ</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-semibold text-slate-900">
                        {nhan(s.den_trang_thai) !== '—' ? nhan(s.den_trang_thai) : s.su_kien}
                        {s.tu_trang_thai && s.den_trang_thai && (
                          <span className="text-xs font-normal text-slate-400"> ({nhan(s.tu_trang_thai)} → {nhan(s.den_trang_thai)})</span>
                        )}
                      </span>
                      <span className="flex items-center gap-2 flex-none">
                        <span className="text-base font-medium text-slate-700">{vnDateTime(s.luc)}</span>
                        {choKhoSerial && (
                          <>
                            <button onClick={() => { setSuaId(s.id); setSNgay(s.luc.slice(0, 10)); setSGhi(s.ghi_chu ?? ''); setSDen(s.den_trang_thai ?? ''); setErr(null) }}
                              className="text-[11px] text-slate-500 underline">sửa</button>
                            <button onClick={() => xoaMoc(s.id)} disabled={busy}
                              className="text-[11px] text-red-600 underline disabled:opacity-50">xoá</button>
                          </>
                        )}
                      </span>
                    </div>
                    {s.ghi_chu && <div className="text-xs text-slate-500">{s.ghi_chu}</div>}
                    {s.boi && <div className="text-[10px] text-slate-400">{s.boi}</div>}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Chưa có sự kiện vòng đời nào.</p>
      )}
    </div>
  )
}
