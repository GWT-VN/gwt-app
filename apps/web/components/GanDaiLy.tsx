'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ganDaiLyChoMay, type DonDaiLy, type DoiTac } from '@/app/actions'
import { OChonGoiY } from '@/bang/OChonGoiY'

/**
 * Nối một con máy với ĐỐI TÁC đã bán ra nó (đại lý · KTS · KOL), và — NẾU BIẾT — cả đơn của họ.
 *
 * CEO dump 22/08/2026: khách kích hoạt bảo hành trên CS thường **không có bên Sales** vì họ không
 * mua trực tiếp — người mua là **đại lý**. Cần biết khách này của đại lý nào để tính hoa hồng và
 * để biết gọi ai khi máy có vấn đề trong thời gian bảo hành.
 *
 * ⚠️ ĐƠN LÀ TUỲ CHỌN — CEO sửa lại bản đầu của tôi, nguyên văn: *"Sẽ có trường hợp ko biết là
 * thuộc về đơn nào đâu (đa phần POE sẽ biết vì cần bảo trì, nhưng POU ko biết khách có vấn đề
 * hoặc mua lõi liên hệ, chỉ biết khách của bên đại lý do đại lý báo chứ ko biết khách mua đơn
 * nào)."* Bắt chọn đơn mới gắn được đại lý là ép CS hoặc bỏ trống hẳn (mất dấu đại lý), hoặc
 * chọn bừa một đơn — cái sau tệ hơn, vì dữ liệu bịa trông y như dữ liệu thật.
 *
 * Đặt ở MÁY chứ không ở hồ sơ khách: một khách có thể mua máy lọc tổng qua đại lý A rồi mua thêm
 * máy uống qua đại lý B. (Hồ sơ khách sẽ có mối nối riêng — xem `docs/thiet-ke-khach-va-dai-ly.md`
 * §4.2 — cho ca chỉ biết đại lý mà không biết máy nào.)
 */
export function GanDaiLy({
  serial, daiLyTen, daiLyDon, doiTacList, donList,
}: {
  serial: string
  daiLyTen: string | null
  daiLyDon: string | null
  doiTacList: DoiTac[]
  donList: DonDaiLy[]
}) {
  const router = useRouter()
  const [chonDoiTac, setChonDoiTac] = useState(daiLyTen ?? '')
  const [chonDon, setChonDon] = useState(daiLyDon ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function luu(doiTac: string | null, don: string | null) {
    setBusy(true); setErr(null); setMsg(null)
    const r = await ganDaiLyChoMay(serial, doiTac, don)
    setBusy(false)
    if (!r.ok) { setErr(r.error); return }
    setMsg(doiTac
      ? (don ? 'Đã gắn đại lý + đơn.' : 'Đã gắn đại lý. Chưa gắn đơn — bổ sung sau cũng được.')
      : 'Đã gỡ.')
    router.refresh()
  }

  // Chỉ hiện đơn của ĐÚNG đối tác đang chọn — 130 đơn mà không lọc thì CS phải tự dò.
  const donCuaDoiTac = chonDoiTac
    ? donList.filter((d) => d.dai_ly.toLowerCase().includes(chonDoiTac.toLowerCase()))
    : donList

  return (
    <section className="mb-4 space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-medium text-slate-900">Máy này bán qua đại lý nào?</h3>
        <p className="text-xs text-slate-400">
          Khách kích hoạt bảo hành thường không mua trực tiếp — người mua là đại lý, KTS hoặc KOL.
        </p>
      </div>

      {daiLyTen ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <span>Đại lý: <strong>{daiLyTen}</strong></span>
          {daiLyDon
            ? <span className="font-mono text-xs">· đơn {daiLyDon}</span>
            : <span className="text-xs text-emerald-700/70">· chưa rõ đơn nào</span>}
          <button type="button" onClick={() => { setChonDoiTac(''); setChonDon(''); luu(null, null) }} disabled={busy}
            className="ml-auto text-xs text-slate-500 underline hover:text-red-600 disabled:opacity-50">
            gỡ
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Chưa gắn đại lý nào.</p>
      )}

      <div className="space-y-2">
        <label className="block">
          <span className="text-xs font-medium text-slate-700">
            Đại lý / KTS / KOL <span className="text-red-600">*</span>
          </span>
          <div className="mt-1">
            <OChonGoiY
              giaTri={chonDoiTac || null}
              onChon={(v) => { setChonDoiTac(v); setChonDon('') }}
              tuyChon={doiTacList.map((d) => ({ gt: d.ten, nhan: d.ten, phu: d.loai }))}
              choTrong="Gõ tên đại lý…"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-700">Đơn của đại lý</span>
          <span className="ml-1 text-xs text-slate-400">— không bắt buộc, chưa biết thì bỏ trống</span>
          <div className="mt-1">
            <OChonGoiY
              giaTri={chonDon || null}
              onChon={setChonDon}
              tuyChon={donCuaDoiTac.map((d) => ({
                gt: d.order_code,
                nhan: `${d.dai_ly} · ${d.order_code}`,
                // Gõ tên khách trên đơn cũng ra — CS thường nhớ tên khách hơn mã đơn.
                phu: [d.ngay, d.khach_tren_don, d.mat_hang].filter(Boolean).join(' · '),
              }))}
              choTrong={chonDoiTac ? 'Gõ mã đơn hoặc tên khách trên đơn…' : 'Chọn đại lý trước'}
            />
          </div>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => luu(chonDoiTac || null, chonDon || null)}
            disabled={busy || !chonDoiTac}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
            {busy ? 'Đang lưu…' : 'Lưu'}
          </button>
          {msg && <span className="text-sm text-emerald-700">{msg}</span>}
          {err && <span className="text-sm text-red-600">{err}</span>}
        </div>
      </div>
    </section>
  )
}
