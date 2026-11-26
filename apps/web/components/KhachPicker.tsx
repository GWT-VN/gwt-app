'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchCustomers, taoKhachChoDuyet, timKhachTheoSdt, type KhachTom, type KhachKhopSdt } from '@/app/actions'
import { ChonTinh } from '@/components/ChonTinh'
import { canhBaoSdt, chuanHoaSdt } from '@/lib/sdt'

/** SĐT VN lưu được (chuẩn hoá 84/thiếu số 0 rồi kiểm) — khớp đúng rào ở server. */
const sdtHopLe = (raw: string): boolean => chuanHoaSdt(raw).hopLe

/**
 * Chọn khách (tìm trong cs_customers) hoặc tạo mới -> chờ admin duyệt.
 * onPick trả (id, nhãn hiển thị, khách). Không setState đồng bộ trong effect (tránh lỗi eslint).
 *
 * Tạo khách mới: SĐT **KHÔNG bắt buộc** (CEO chốt 22/08/2026), nhưng CÓ gõ thì phải
 * đúng định dạng và không trùng. Nhập xong SĐT sẽ tra:
 *  - đã là khách CS  -> mời chọn luôn, không tạo trùng;
 *  - khớp khách Sales -> tự điền info (dùng luôn), cho sửa lại địa chỉ.
 *
 * ⚠️ Ô này dùng ở 7 màn (đổi khách của máy · lắp bộ · đăng ký BH · tạo ticket · lịch kỹ
 * thuật · bảo trì). CEO báo 24/08: ở màn *máy đã lắp → Đổi khách*, bỏ trống SĐT thì nút
 * **Tạo khách** không sáng. Nguyên nhân: trang `/khach/moi` và server `taoKhachChoDuyet()`
 * đã bỏ rào SĐT từ 22/08, riêng ô này còn sót rào cũ ⇒ cùng một việc mà hai đường vào
 * hai luật. Nay khớp lại đúng luật của trang tạo khách.
 */
export function KhachPicker(
  { onPick }: { onPick: (id: string, nhan: string, khach?: KhachTom) => void }
) {
  const [q, setQ] = useState('')
  const [chon, setChon] = useState<string | null>(null)   // nhãn khách đã chọn
  const [ketQua, setKetQua] = useState<{ tuKhoa: string; ds: KhachTom[]; loi?: boolean } | null>(null)
  const oTim = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [taoMo, setTaoMo] = useState(false)
  const [f, setF] = useState({ full_name: '', primary_phone: '', address: '', province: '' })
  const [khop, setKhop] = useState<KhachKhopSdt | null>(null)   // kết quả tra SĐT
  const [dangTra, setDangTra] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  /** Có gõ số hay không — quyết định mọi rào SĐT bên dưới. Trống = hợp lệ. */
  const coGoSdt = f.primary_phone.trim() !== ''

  useEffect(() => {
    const t = q.trim()
    if (!open || !t) return
    let huy = false
    const id = setTimeout(async () => {
      try {
        const ds = await searchCustomers(t, 8)
        if (!huy) setKetQua({ tuKhoa: t, ds })
      } catch {
        if (!huy) setKetQua({ tuKhoa: t, ds: [], loi: true })
      }
    }, 250)
    return () => { huy = true; clearTimeout(id) }
  }, [q, open])

  function pick(k: KhachTom) {
    const nhan = `${k.full_name}${k.primary_phone ? ` · ${k.primary_phone}` : ''}`
    setChon(nhan); onPick(k.id, nhan, k); setOpen(false)
  }

  /** Chọn 1 khách ĐÃ CÓ (từ tra SĐT) — không tạo bản trùng. */
  function chonCoSan(k: KhachKhopSdt) {
    if (!k.id) return
    const ten = k.full_name ?? 'Khách'
    const nhan = `${ten}${k.primary_phone ? ` · ${k.primary_phone}` : ''}`
    setChon(nhan)
    onPick(k.id, nhan, {
      id: k.id, full_name: ten, primary_phone: k.primary_phone ?? null,
      trang_thai: k.trang_thai ?? 'da_duyet', address: k.address ?? null, province: k.province ?? null,
    })
    setTaoMo(false)
  }

  /** Nhập xong SĐT -> tra khách CS/Sales. */
  async function traSdt() {
    const sdt = f.primary_phone.trim()
    if (!sdt || !sdtHopLe(sdt)) { setKhop(null); return }
    setDangTra(true)
    const r = await timKhachTheoSdt(sdt)
    setDangTra(false)
    setKhop(r)
    // Khớp khách Sales -> dùng luôn info; địa chỉ cho sửa lại nếu có cập nhật.
    if (r.nguon === 'sales') {
      setF((cur) => ({
        ...cur,
        full_name: r.full_name ?? cur.full_name,
        address: r.address ?? cur.address,
        province: r.province ?? cur.province,
      }))
    }
  }

  async function taoMoi() {
    // Bỏ TRỐNG thì cho qua; có gõ mà sai định dạng mới chặn — nhận số sai còn tệ hơn để trống.
    if (coGoSdt && !sdtHopLe(f.primary_phone)) {
      setErr('SĐT không đúng định dạng (vd 0xxxxxxxxx). Bỏ trống cũng được.'); return
    }
    setBusy(true); setErr(null)
    const r = await taoKhachChoDuyet(f)
    setBusy(false)
    if (!r.ok) {
      setErr(r.error)
      // Server bắt trùng (backstop) -> mời chọn khách đã có.
      if (r.existingId) setKhop({ nguon: 'cs', id: r.existingId, full_name: f.full_name.trim() || undefined, primary_phone: f.primary_phone.trim() })
      return
    }
    const nhan = `${f.full_name.trim()}${f.primary_phone.trim() ? ` · ${f.primary_phone.trim()}` : ''}`
    setChon(nhan)
    onPick(r.id, nhan, {
      id: r.id, full_name: f.full_name.trim(), primary_phone: f.primary_phone.trim() || null,
      trang_thai: 'da_duyet', address: f.address.trim() || null, province: f.province.trim() || null,
    })
    setTaoMo(false)
  }

  if (chon) {
    return (
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2 border-border bg-(--color-background-success-surface)">
        <span className="min-w-0 break-words text-sm text-foreground">{chon}</span>
        <button type="button" onClick={() => { setChon(null); setQ(''); setKetQua(null) }}
          className="ml-auto shrink-0 text-sm text-muted-foreground underline">đổi</button>
      </div>
    )
  }

  const tuKhoa = q.trim()
  const ketQuaHienTai = ketQua?.tuKhoa === tuKhoa ? ketQua : null

  return (
    <div className="space-y-2">
      <div className="relative" onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }} onKeyDown={(e) => {
        if (e.key === 'Escape' && open && tuKhoa) {
          e.stopPropagation()
          oTim.current?.focus()
          setOpen(false)
        }
      }}>
        <Input ref={oTim} aria-label="Tìm khách hàng"
          value={q}
          onChange={(e) => { setQ(e.target.value); setKetQua(null); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm khách theo tên hoặc SĐT…"
        />
        {open && tuKhoa && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
            {ketQuaHienTai?.ds.map((k) => (
              <li key={k.id}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(k)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                  {k.full_name}
                  {k.primary_phone && <span className="font-mono text-xs text-muted-foreground"> · {k.primary_phone}</span>}
                  {k.trang_thai === 'cho_duyet' && <span className="text-[10px] text-(--color-text-warning)"> · chờ duyệt</span>}
                </button>
              </li>
            ))}
            {!ketQuaHienTai?.ds.length && (
              <li className="px-3 py-2 text-sm text-muted-foreground" role="status">
                {!ketQuaHienTai ? 'Đang tìm…' : ketQuaHienTai.loi ? 'Chưa tìm được khách. Hãy thử lại.' : 'Không tìm thấy khách phù hợp.'}
              </li>
            )}
          </ul>
        )}
      </div>

      {!taoMo ? (
        <Button type="button" variant="ghost" onClick={() => setTaoMo(true)}>＋ Tạo khách mới</Button>
      ) : (
        <div className="space-y-2 rounded-lg border border-border bg-muted p-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })}
              aria-label="Tên khách" aria-required placeholder="Tên khách *" />
            <Input value={f.primary_phone}
              onChange={(e) => { setF({ ...f, primary_phone: e.target.value }); setKhop(null) }}
              onBlur={traSdt} inputMode="tel"
              aria-label="SĐT" placeholder="SĐT (để trống được)" className="font-mono" />
            <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })}
              aria-label="Địa chỉ" placeholder="Địa chỉ" className="sm:col-span-2" />
            <ChonTinh value={f.province} onChange={(v) => setF({ ...f, province: v })} />
          </div>

          {dangTra && <p className="text-xs text-muted-foreground">Đang kiểm tra SĐT…</p>}
          {coGoSdt && !sdtHopLe(f.primary_phone) && (
            <p className="text-xs text-(--color-text-warning)">SĐT chưa đúng định dạng (vd 0xxxxxxxxx).</p>
          )}
          {/* Cùng câu nhắc với trang `/khach/moi` — một tình huống thì cả app nói một câu. */}
          {!coGoSdt && f.full_name.trim() !== '' && (
            <p className="rounded-lg bg-(--color-background-warning-surface) px-2 py-1 text-xs text-(--color-text-warning)">
              Chưa có SĐT — vẫn tạo được. Hồ sơ sẽ vào danh sách <strong>“Cần xin lại SĐT”</strong>
              {' '}ở bảng khách để CS gọi xin sau. Đừng gõ số bừa cho qua.
            </p>
          )}
          {/* Cảnh báo mềm: lưu được nhưng chưa đúng chuẩn 10 số bắt đầu bằng 0. */}
          {sdtHopLe(f.primary_phone) && canhBaoSdt(f.primary_phone) && (
            <p className="text-xs text-(--color-text-warning)">{canhBaoSdt(f.primary_phone)}</p>
          )}

          {khop?.nguon === 'cs' && khop.id && (
            <div className="rounded-lg bg-(--color-background-warning-surface) text-(--color-text-warning) px-3 py-2 text-sm space-y-1.5">
              <p>SĐT này đã là khách: <strong>{khop.full_name ?? '—'}</strong>
                {khop.trang_thai === 'cho_duyet' && ' (chờ duyệt)'} — không tạo trùng.</p>
              <Button type="button" size="sm" onClick={() => chonCoSan(khop)}>Chọn khách này</Button>
            </div>
          )}
          {khop?.nguon === 'sales' && (
            <p className="text-xs bg-(--color-background-info-surface) text-(--color-text-info) rounded-lg px-3 py-2">
              Khớp khách đơn Sales — đã điền tên/tỉnh, sửa lại địa chỉ nếu cần rồi bấm Tạo (sẽ tự liên kết mã KH Sales).
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={taoMoi} loading={busy}
              disabled={!f.full_name.trim() || (coGoSdt && !sdtHopLe(f.primary_phone)) || khop?.nguon === 'cs'}>
              {busy ? 'Đang tạo…' : 'Tạo khách'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setTaoMo(false); setKhop(null) }}>Đóng</Button>
            {err && <span role="alert" className="basis-full text-sm text-(--color-text-danger)">{err}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
