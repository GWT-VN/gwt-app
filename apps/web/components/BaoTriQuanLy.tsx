'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ganKhachBaoTri, goGanKhachBaoTri, lenLichBaoTri, datSoLanBaoTri, taoPlanBaoTri, boiCanhKhach, khachDayDu, type PlanChuaMap, type PlanDaMap, type SapHetGoi, type BoiCanhKhach } from '@/app/actions'
import { TimKhachChiTiet } from '@/components/TimKhachChiTiet'
import { SoSanhHoSo } from '@/components/SoSanhHoSo'
import { dangCo, type KhachDayDu } from '@/lib/gopKhach'
import { sinhLichBaoTri, vungTheoTinh, macDinhTheoBoMay, type Vung } from '@/lib/lichBaoTri'
import { tinCayThap } from '@/lib/khopPlanKhach'
import { KhachPicker } from '@/components/KhachPicker'
import { vnDate } from '@/components/Badge'

/** Nhãn trên ô (chữ nhỏ muted, ô DS ngay dưới). */
const NHAN = 'flex flex-col gap-1 text-xs text-muted-foreground'

const CHU_KY = [
  { v: '1', nhan: '1 tháng' }, { v: '2', nhan: '2 tháng' }, { v: '3', nhan: '3 tháng (mặc định)' },
  { v: '4', nhan: '4 tháng' }, { v: '6', nhan: '6 tháng' }, { v: '0', nhan: 'Chỉ 1 lần' },
]

/**
 * Quản lý lịch bảo trì (Đợt 1): map plan chưa gắn khách + lên lịch tự động.
 *  · Map: khớp SĐT gợi ý sẵn, hoặc chọn tay.
 *  · Lên lịch: chọn ngày bắt đầu (mặc định ngày lắp) + chu kỳ + số lần + vùng
 *    (né T7/CN theo miền); hệ tự sinh các mốc.
 */
export function BaoTriQuanLy({ chuaMap, daMap, sapHet, phan = 'all', moTaoKhach }: {
  chuaMap: PlanChuaMap[]; daMap: PlanDaMap[]; sapHet: SapHetGoi[]; phan?: 'map' | 'lenlich' | 'all'
  moTaoKhach?: { id: string; ctx: BoiCanhKhach }
}) {
  const hienMap = phan === 'map' || phan === 'all'
  const hienLen = phan === 'lenlich' || phan === 'all'
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [errTao, setErrTao] = useState<string | null>(null)   // lỗi của form "Tạo lịch mới" (hiện cạnh nút)
  // form tạo lịch MỚI (tặng / mua trực tiếp)
  const [moTao, setMoTao] = useState(!!moTaoKhach)
  const [tKhach, setTKhach] = useState(moTaoKhach?.id ?? '')
  const [tBoMay, setTBoMay] = useState('')
  const [tNgay, setTNgay] = useState('')
  const [tChuKy, setTChuKy] = useState('3')
  const [tLan, setTLan] = useState('4')
  const [tVung, setTVung] = useState('')
  const [tCtx, setTCtx] = useState<BoiCanhKhach | null>(moTaoKhach?.ctx ?? null)
  const [tDates, setTDates] = useState<string[]>([])   // mốc CS sửa tay (rỗng = dùng auto)

  async function tChonKhach(id: string) {
    setTKhach(id)
    const c = await boiCanhKhach(id); setTCtx(c)
  }
  async function taoMoi(ngayList: string[]) {
    setBusy('tao'); setErr(null); setMsg(null); setErrTao(null)
    const r = await taoPlanBaoTri(tKhach, {
      boMay: tBoMay || undefined, chuKyThang: tChuKy === '0' ? null : Number(tChuKy),
      tongLan: Number(tLan) || 1, ngayBatDau: tNgay, vung: tVung === 'bac' || tVung === 'nam' ? tVung : undefined,
      ngayList,
    })
    setBusy(null)
    if (!r.ok) { setErr(r.error); setErrTao(r.error); return }
    setMoTao(false); setTKhach(''); setTBoMay(''); setTCtx(null); setTDates([]); setMsg(`Đã tạo lịch mới ${r.so_lan} lượt.`); router.refresh()
  }
  const [chonTay, setChonTay] = useState<string | null>(null)     // plan id đang chọn khách tay
  // Ứng viên đang xem so sánh trước khi gán (null = chưa mở cái nào).
  const [xem, setXem] = useState<{ planId: string; dangTai: boolean; khach: KhachDayDu | null } | null>(null)
  // Mặc định giữ số đang có trong hồ sơ — đổi số chính là việc lớn hơn, phải do
  // người dùng chủ động chọn. Số còn lại vẫn xuống SĐT phụ, không mất.
  const [sdtChinh, setSdtChinh] = useState<'khach' | 'plan' | 'bo'>('khach')
  const [moLich, setMoLich] = useState<string | null>(null)       // plan id đang mở form lịch
  const [suaLan, setSuaLan] = useState<string | null>(null)       // plan id đang sửa số lần
  const [lanVal, setLanVal] = useState('')
  // form lịch
  const [ngay, setNgay] = useState('')
  const [chuKy, setChuKy] = useState('3')
  const [tongLan, setTongLan] = useState('')
  const [vung, setVung] = useState('')

  function moFormLich(p: PlanDaMap) {
    if (moLich === p.id) { setMoLich(null); return }
    const md = macDinhTheoBoMay(p.bo_may)
    setMoLich(p.id); setErr(null); setMsg(null); setSuaLan(null)
    setNgay(p.ngay_bat_dau ?? p.ngay_kich_hoat ?? '')
    setChuKy(String(p.chu_ky_thang ?? md?.chuKy ?? 3))
    setTongLan(String(p.tong_lan ?? md?.soLan ?? ''))
    setVung(p.vung ?? '')
  }

  async function luuSoLan(planId: string) {
    setBusy(planId); setErr(null); setMsg(null)
    const r = await datSoLanBaoTri(planId, Number(lanVal))
    setBusy(null)
    if (!r.ok) { setErr(r.error); return }
    setSuaLan(null); setMsg(r.them > 0 ? `Đã đặt số lần + nối thêm ${r.them} lượt.` : 'Đã cập nhật số lần.'); router.refresh()
  }

  /**
   * Gán khách cho plan — chỉ gọi được SAU khi CS đã mở khối so sánh và nhìn đủ
   * thông tin hai bên. Trước đây bấm gợi ý phát là gán luôn: các gợi ý xếp sát
   * nhau, bấm trượt một ô là plan dính vào khách sai mà không có gì báo, lại
   * không hoàn tác được.
   */
  async function gan(planId: string, customerId: string, tenKhach: string, sdt: 'khach' | 'plan' | 'bo') {
    setBusy(planId); setErr(null); setMsg(null)
    try {
      const r = await ganKhachBaoTri(planId, customerId, sdt)
      if (!r.ok) { setErr(r.error); return }
      setChonTay(null); setXem(null)
      setMsg(
        `Đã gán cho "${tenKhach}".` +
        (r.themSdtPhu ? ' SĐT trên lịch đã lưu thành SĐT phụ của khách.' : '') +
        ' Gán nhầm thì bấm "gỡ gán" ở danh sách bên dưới.',
      )
      router.refresh()
    } catch (e) {
      setErr('Không rõ kết quả — mở lại danh sách kiểm tra trước khi bấm lần nữa. ' +
        (e instanceof Error ? e.message : String(e)))
    } finally {
      setBusy(null)
    }
  }

  /** Mở khối so sánh cho một ứng viên: nạp hồ sơ khách đủ trường rồi mới vẽ. */
  async function moSoSanh(planId: string, customerId: string) {
    setErr(null); setMsg(null)
    setXem({ planId, dangTai: true, khach: null })
    const k = await khachDayDu(customerId)
    if (!k) { setXem(null); setErr('Không đọc được hồ sơ khách này.'); return }
    setXem({ planId, dangTai: false, khach: k })
  }

  async function goGan(planId: string, tenKhach: string | null) {
    if (!window.confirm(`Gỡ lịch bảo trì này khỏi khách "${tenKhach ?? '—'}"?\n\nLịch quay về nhóm "chưa khớp khách". Các lượt bảo trì đã có KHÔNG bị xoá.`)) return
    setBusy(planId); setErr(null); setMsg(null)
    const r = await goGanKhachBaoTri(planId)
    setBusy(null)
    if (!r.ok) { setErr(r.error); return }
    setMsg('Đã gỡ gán — lịch quay về nhóm chưa khớp khách.'); router.refresh()
  }
  async function lenLich(planId: string, macDinhLan: number | null) {
    setBusy(planId); setErr(null); setMsg(null)
    const r = await lenLichBaoTri(planId, {
      ngayBatDau: ngay || undefined,
      chuKyThang: chuKy === '0' ? null : Number(chuKy),
      tongLan: Number(tongLan) || macDinhLan || 1,
      vung: vung === 'bac' || vung === 'nam' ? vung : undefined,
    })
    setBusy(null)
    if (!r.ok) { setErr(r.error); return }
    setMoLich(null); setMsg(`Đã lên ${r.so_lan} lượt bảo trì.`); router.refresh()
  }

  return (
    <div className="space-y-5">
      {(msg || err) && <p className={`text-sm ${err ? 'text-destructive' : 'text-(--color-text-success)'}`}>{err ?? msg}</p>}

      {/* ── Sắp hết gói → nhắc chào gói mới ── */}
      {hienLen && sapHet.length > 0 && (
        <Card className="space-y-2 border-destructive/30">
          <h2 className="font-medium text-(--color-text-danger)">🔔 Sắp hết gói — chào gói mới ({sapHet.length})</h2>
          <p className="text-xs text-muted-foreground">Khách còn ≤1 lượt bảo trì chưa làm. Chào gói mới; tạo gói bằng nút &ldquo;Tạo lịch mới&rdquo; bên dưới (hoặc sửa số lần nếu khách mua/tặng thêm).</p>
          <ul className="divide-y border rounded-lg bg-card text-sm">
            {sapHet.map((s) => (
              <li key={s.plan_id} className="px-3 py-2 flex items-center justify-between gap-3">
                <span>
                  <Link href={`/khach/${s.customer_id}`} prefetch={false} className="text-foreground underline">{s.ten_khach ?? '(khách)'}</Link>
                  <span className="text-xs text-muted-foreground font-mono"> · {s.primary_phone ?? '—'}</span>
                  <span className="text-xs text-muted-foreground"> · {s.bo_may ?? '—'} · còn {s.con_lai} lượt{s.luot_cuoi ? ` · lượt cuối ${vnDate(s.luot_cuoi)}` : ''}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ── Cần map khách ── */}
      {hienMap && (
      <Card className="space-y-3">
        <div>
          <h2 className="font-medium text-foreground">🔗 Cần map khách ({chuaMap.length})</h2>
          <p className="text-xs text-muted-foreground">Lịch bảo trì (từ Asana) chưa gắn được vào hồ sơ khách. Map để bảo trì đi cùng khách kích hoạt máy.</p>
        </div>
        {chuaMap.length === 0 ? (
          <p className="text-sm text-(--color-text-success)">Tất cả plan đã map khách ✓</p>
        ) : (
          <ul className="divide-y border rounded-lg">
            {chuaMap.map((p) => (
              <li key={p.id} className="px-3 py-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <span className="text-sm text-foreground">{p.source_customer_name ?? '(không tên)'}</span>
                    <span className="text-xs text-muted-foreground font-mono"> · {p.source_phone ?? '—'}</span>
                    <div className="text-xs text-muted-foreground">{p.bo_may ?? '—'} · {p.tong_lan ?? '?'} lần · {p.loai_goi}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.goi_y.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {p.goi_y.map((g) => {
                          // Gợi ý chỉ dựa trên 1 tín hiệu mềm duy nhất (cùng tỉnh, hoặc ngày lắp
                          // lệch xa) trông giống hệt gợi ý trùng SĐT nếu vẽ cùng màu emerald đặc —
                          // CS dễ tưởng "chắc chắn" rồi gán nhầm khách. Đổi màu + chữ để phân biệt
                          // rõ, thay vì ẩn hẳn (vẫn còn giá trị hơn phải mò tay trong 400 khách).
                          const yeu = tinCayThap(g.diem)
                          return (
                            // Mục danh sách 2 dòng: ghost + h-auto + xuống dòng (Button mặc định cao cố định, nowrap → cắt chữ).
                            // Nền soft success (khớp SĐT) / warning (gợi ý yếu) giữ phân biệt mức tin cậy.
                            <Button key={g.id} variant="ghost" shape="rounded" disabled={busy === p.id}
                              onClick={() => moSoSanh(p.id, g.id)}
                              className={cn(
                                'h-auto max-w-full flex-col items-start gap-0.5 whitespace-normal py-1.5 text-left leading-snug',
                                yeu
                                  ? 'bg-(--color-background-warning-soft-alpha) text-(--color-text-warning-soft)'
                                  : 'bg-(--color-background-success-soft-alpha) text-(--color-text-success-soft)',
                              )}>
                              <span>{yeu ? 'Có thể là: ' : 'Xem & gán: '}{g.ten}{g.sdt ? ` (${g.sdt})` : ''}</span>
                              <span className="text-xs font-normal">
                                {yeu ? 'gợi ý yếu, kiểm tra kỹ trước khi gán — ' : ''}{g.lyDo.join(' · ')}
                              </span>
                            </Button>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-(--color-text-warning)">chưa đoán được khách — bấm &quot;Chọn khách khác&quot;</span>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setChonTay(chonTay === p.id ? null : p.id)}>Chọn khách khác</Button>
                  </div>
                </div>
                {chonTay === p.id && (
                  <div className="pt-1">
                    {/* Ô tìm hiện đủ tỉnh + địa chỉ; chọn xong vẫn đi qua khối so
                        sánh chứ không gán thẳng — cùng một đường với nút gợi ý. */}
                    <TimKhachChiTiet onChon={(k) => moSoSanh(p.id, k.id)} />
                  </div>
                )}

                {/* Khối so sánh: plan bên trái, khách ứng viên bên phải. Nút gán
                    nằm TRONG đây nên không thể gán mà chưa nhìn. */}
                {xem?.planId === p.id && (
                  <div className="pt-2">
                    {xem.dangTai || !xem.khach ? (
                      <p className="text-xs text-muted-foreground">Đang tải hồ sơ khách…</p>
                    ) : (
                      <SoSanhHoSo
                        trai={{
                          tieuDe: 'Lịch bảo trì (từ Asana)',
                          dong: [
                            { nhan: 'Tên', giaTri: p.source_customer_name ?? '' },
                            { nhan: 'SĐT', giaTri: p.source_phone ?? '' },
                            { nhan: 'Tỉnh/TP', giaTri: '' },
                            { nhan: 'Địa chỉ', giaTri: '' },
                            { nhan: 'Bộ máy', giaTri: p.bo_may ?? '' },
                            { nhan: 'Số lần', giaTri: p.tong_lan ? String(p.tong_lan) : '' },
                          ],
                        }}
                        phai={{
                          tieuDe: 'Khách trong hệ thống',
                          nhan: dangCo(xem.khach),
                          href: `/khach/${xem.khach.id}`,
                          dong: [
                            { nhan: 'Tên', giaTri: xem.khach.full_name },
                            { nhan: 'SĐT', giaTri: xem.khach.primary_phone ?? '' },
                            { nhan: 'Tỉnh/TP', giaTri: xem.khach.province ?? '' },
                            { nhan: 'Địa chỉ', giaTri: xem.khach.address ?? '' },
                            { nhan: 'Bộ máy', giaTri: `${xem.khach.so_may} máy đã lắp` },
                            { nhan: 'Số lần', giaTri: `${xem.khach.so_plan} lịch bảo trì đang có` },
                          ],
                        }}
                        hanhDong={
                          <>
                            {/* Hai SĐT khác nhau = cùng người, hai số — không phải
                                mâu thuẫn. Gán xong mà không giữ thì số trên lịch
                                mất hẳn (ca Đoàn Văn Hậu: lịch 032…, hồ sơ 093…). */}
                            {(() => {
                              const soPlan = (p.source_phone ?? '').replace(/\D/g, '')
                              const soKhach = (xem.khach?.primary_phone ?? '').replace(/\D/g, '')
                              if (!soPlan || soPlan.slice(-9) === soKhach.slice(-9)) return null
                              const o = (chon: boolean) => cn('flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-sm cursor-pointer', chon ? 'border-primary font-medium' : 'border-border')
                              return (
                                <div className="w-full rounded-lg bg-(--color-background-info-surface) px-3 py-2">
                                  <p className="text-sm text-(--color-text-info)">
                                    Hai số khác nhau — <b>số nào là số chính của khách?</b>{' '}
                                    Số còn lại tự xuống <b>SĐT phụ</b>, không mất.
                                  </p>
                                  <RadioGroup orientation="horizontal" aria-label="Số chính của khách" value={sdtChinh}
                                    onValueChange={(v) => setSdtChinh(v as 'khach' | 'plan' | 'bo')} className="mt-1.5 flex flex-wrap gap-2">
                                    <label className={o(sdtChinh === 'khach')}>
                                      <RadioGroupItem value="khach" />
                                      Giữ số hồ sơ <span className="font-mono">{xem.khach?.primary_phone || '—'}</span>
                                    </label>
                                    <label className={o(sdtChinh === 'plan')}>
                                      <RadioGroupItem value="plan" />
                                      Dùng số trên lịch <span className="font-mono">{p.source_phone}</span>
                                    </label>
                                    <label className={o(sdtChinh === 'bo')}>
                                      <RadioGroupItem value="bo" />
                                      Bỏ số trên lịch
                                    </label>
                                  </RadioGroup>
                                </div>
                              )
                            })()}
                            <Button size="sm" disabled={busy === p.id}
                              onClick={() => gan(p.id, xem.khach!.id, xem.khach!.full_name, sdtChinh)}>
                              {busy === p.id ? 'Đang gán…' : 'Đúng người, gán'}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setXem(null)}>
                              Không phải, đóng
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Gán nhầm vẫn gỡ được ở danh sách &ldquo;đã map&rdquo; bên dưới.
                            </span>
                          </>
                        }
                      />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      )}

      {/* ── Lên lịch ── */}
      {hienLen && (
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-medium text-foreground">📅 Lên lịch bảo trì ({daMap.length} plan đã map)</h2>
            <p className="text-xs text-muted-foreground">Bộ CŨ: lên lịch tự do. Chọn ngày bắt đầu + chu kỳ + số lần → hệ sinh mốc, né T7/CN theo miền.</p>
          </div>
          <Button onClick={() => { setMoTao(!moTao); setErr(null); setMsg(null); setErrTao(null) }} size="sm">
            + Tạo lịch mới cho khách
          </Button>
        </div>

        {moTao && (() => {
          const md = macDinhTheoBoMay(tBoMay)
          const vungHl: Vung = tVung === 'bac' || tVung === 'nam' ? tVung : vungTheoTinh(tCtx?.tinh ?? null)
          const auto = tNgay ? sinhLichBaoTri(tNgay, tChuKy === '0' ? null : Number(tChuKy), Number(tLan) || 0, vungHl) : []
          const preview = tDates.length ? tDates : auto
          const suaMoc = (i: number, val: string) => { const next = [...preview]; next[i] = val; setTDates(next) }
          return (
          <div className="rounded-lg border border-border bg-(--color-background-success-surface) p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Tạo lịch bảo trì MỚI cho khách (tặng thêm / mua trực tiếp — không qua Sales). <strong>Khách mới bắt buộc đã kích hoạt BH.</strong></p>
            {tKhach ? <p className="text-xs text-(--color-text-success)">✓ đã chọn khách <Button variant="link" className="ml-1 text-xs" onClick={() => { setTKhach(''); setTCtx(null) }}>đổi</Button></p> : <KhachPicker onPick={(id) => tChonKhach(id)} />}
            <div className="flex flex-wrap items-end gap-2">
              <label className={cn(NHAN, 'w-56')}>Bộ máy (của khách)
                {tCtx && tCtx.machines.length > 0 ? (
                  <NativeSelect value={tBoMay} onChange={(e) => setTBoMay(e.target.value)}>
                    <NativeSelectOption value="">— Chọn bộ máy —</NativeSelectOption>
                    {tCtx.machines.map((m) => <NativeSelectOption key={m.serial} value={m.nhan.split(' · ')[0]}>{m.nhan}</NativeSelectOption>)}
                  </NativeSelect>
                ) : (
                  <Input value={tBoMay} onChange={(e) => setTBoMay(e.target.value)} placeholder="VD: WH30A" />
                )}
              </label>
              <label className={cn(NHAN, 'w-40')}>Ngày bắt đầu
                <Input type="date" value={tNgay} onChange={(e) => { setTNgay(e.target.value); setTDates([]) }} />
              </label>
              <label className={cn(NHAN, 'w-44')}>Chu kỳ
                <NativeSelect value={tChuKy} onChange={(e) => { setTChuKy(e.target.value); setTDates([]) }}>
                  {CHU_KY.map((c) => <NativeSelectOption key={c.v} value={c.v}>{c.nhan}</NativeSelectOption>)}
                </NativeSelect>
              </label>
              <label className={cn(NHAN, 'w-20')}>Số lần
                <Input value={tLan} onChange={(e) => { setTLan(e.target.value); setTDates([]) }} inputMode="numeric" />
              </label>
              <label className={cn(NHAN, 'w-56')}>Vùng
                <NativeSelect value={tVung} onChange={(e) => { setTVung(e.target.value); setTDates([]) }}>
                  <NativeSelectOption value="">Tự theo tỉnh khách</NativeSelectOption>
                  <NativeSelectOption value="bac">Bắc + Đà Nẵng (T7+CN)</NativeSelectOption>
                  <NativeSelectOption value="nam">HCM + Nam Bộ (CN)</NativeSelectOption>
                </NativeSelect>
              </label>
            </div>
            {md && <p className="text-[11px] text-muted-foreground">Mặc định {tBoMay}: <strong>{md.soLan} lần × {md.chuKy} tháng</strong>. <Button onClick={() => { setTChuKy(String(md.chuKy)); setTLan(String(md.soLan)); setTDates([]) }} variant="ghost" size="sm">Dùng</Button></p>}
            {preview.length > 0 ? (
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground">Xem trước {preview.length} mốc (né cuối tuần vùng {vungHl}) — <strong>sửa từng mốc được</strong>{tDates.length > 0 && <> · <Button onClick={() => setTDates([])} variant="ghost" size="sm">tạo lại theo tham số</Button></>}:</p>
                <p className="text-[10px] text-muted-foreground">Mốc luôn nằm đúng tháng của chu kỳ; ngày có thể lệch vài hôm vì tháng ngắn/dài khác nhau và phải né T7/CN.</p>
                <div className="flex flex-wrap gap-1.5">
                  {preview.map((d, i) => (
                    <label key={i} className="inline-flex items-center gap-1 text-muted-foreground">
                      L{i + 1}
                      <Input type="date" aria-label={`Mốc lượt ${i + 1}`} value={d} onChange={(e) => suaMoc(i, e.target.value)} className="w-40" />
                    </label>
                  ))}
                </div>
              </div>
            ) : <p className="text-[11px] text-(--color-text-warning)">Chọn ngày bắt đầu để xem trước.</p>}
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" disabled={busy === 'tao' || !tKhach || preview.length === 0} onClick={() => taoMoi(preview)}>
                {busy === 'tao' ? 'Đang tạo…' : `Tạo lịch (${preview.length} lượt)`}
              </Button>
              <Button onClick={() => setMoTao(false)} variant="ghost" size="sm">Đóng</Button>
            </div>
            {/* Lỗi phải nằm NGAY CẠNH NÚT. Trước đây chỉ hiện ở đầu trang (cách đây cả
                màn hình) nên tạo lịch hỏng mà CS vẫn tưởng đã xong. */}
            {errTao && <p className="text-xs text-destructive bg-(--color-background-danger-surface) rounded px-2 py-1.5">Chưa tạo được lịch: {errTao}</p>}
          </div>
          )
        })()}
        {daMap.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có plan nào đã map.</p>
        ) : (
          <ul className="divide-y border rounded-lg">
            {daMap.map((p) => (
              <li key={p.id} className="px-3 py-2.5 space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <Link href={`/khach/${p.customer_id}`} prefetch={false} className="text-sm text-foreground underline">{p.ten_khach ?? '(khách)'}</Link>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-1.5">
                      <span>{p.bo_may ?? '—'} · đã xong {p.so_xong}/</span>
                      {suaLan === p.id ? (
                        <span className="inline-flex items-center gap-1">
                          <Input aria-label="Tổng số lần" value={lanVal} onChange={(e) => setLanVal(e.target.value)} inputMode="numeric" className="w-16" />
                          <Button size="xs" disabled={busy === p.id} onClick={() => luuSoLan(p.id)}>Lưu</Button>
                          <Button size="xs" variant="ghost" onClick={() => setSuaLan(null)}>Huỷ</Button>
                        </span>
                      ) : (
                        <span>
                          <strong>{p.tong_lan ?? '?'}</strong> lần (tặng+mua)
                          <Button variant="link" className="ml-1 text-xs" onClick={() => { setSuaLan(p.id); setLanVal(String(p.tong_lan ?? '')); setErr(null) }}>sửa</Button>
                        </span>
                      )}
                      <span>· đã lên {p.so_visit} lượt</span>
                      {p.ngay_bat_dau && <span>· bắt đầu {vnDate(p.ngay_bat_dau)}</span>}
                      {p.chu_ky_thang && <span>· mỗi {p.chu_ky_thang} tháng</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-2">
                      {/* Đường HOÀN TÁC cho lỡ gán nhầm khách — trước đây gán là một
                          chiều, sai thì phải nhờ kỹ thuật chạy SQL mới gỡ được. */}
                      <Button variant="ghost" size="sm" className="text-(--color-text-danger-ghost)" disabled={busy === p.id} onClick={() => goGan(p.id, p.ten_khach)}>
                        gỡ gán
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => moFormLich(p)}>
                        {p.so_visit > 0 ? 'Sinh lại lịch' : 'Lên lịch'}
                      </Button>
                    </div>
                    {p.so_may === 0 && <span className="text-xs text-(--color-text-warning)">khách chưa có máy kích hoạt BH</span>}
                  </div>
                </div>
                {moLich === p.id && (() => {
                  const md = macDinhTheoBoMay(p.bo_may)
                  const vungHl: Vung = vung === 'bac' || vung === 'nam' ? vung : vungTheoTinh(p.province)
                  const preview = ngay ? sinhLichBaoTri(ngay, chuKy === '0' ? null : Number(chuKy), Number(tongLan) || 0, vungHl) : []
                  return (
                  <div className="rounded-lg bg-muted border p-2.5 space-y-2">
                    {md && (
                      <p className="text-[11px] text-muted-foreground">
                        Mặc định {p.bo_may}: <strong>{md.soLan} lần × {md.chuKy} tháng</strong> từ ngày kích hoạt.
                        <Button variant="link" className="ml-1 text-xs" onClick={() => { setChuKy(String(md.chuKy)); setTongLan(String(md.soLan)); setNgay(p.ngay_kich_hoat ?? ngay) }}>Dùng mặc định</Button>
                      </p>
                    )}
                    <div className="flex flex-wrap items-end gap-2">
                      <label className={cn(NHAN, 'w-40')}>Ngày bắt đầu
                        <Input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} />
                      </label>
                      <label className={cn(NHAN, 'w-44')}>Chu kỳ
                        <NativeSelect value={chuKy} onChange={(e) => setChuKy(e.target.value)}>
                          {CHU_KY.map((c) => <NativeSelectOption key={c.v} value={c.v}>{c.nhan}</NativeSelectOption>)}
                        </NativeSelect>
                      </label>
                      <label className={cn(NHAN, 'w-20')}>Số lần
                        <Input value={tongLan} onChange={(e) => setTongLan(e.target.value)} inputMode="numeric" placeholder={String(p.tong_lan ?? '')} />
                      </label>
                      <label className={cn(NHAN, 'w-60')}>Vùng (né cuối tuần)
                        <NativeSelect value={vung} onChange={(e) => setVung(e.target.value)}>
                          <NativeSelectOption value="">Tự theo tỉnh{p.province ? ` (${p.province})` : ''}</NativeSelectOption>
                          <NativeSelectOption value="bac">Bắc + Đà Nẵng (nghỉ T7+CN)</NativeSelectOption>
                          <NativeSelectOption value="nam">HCM + Nam Bộ (nghỉ CN)</NativeSelectOption>
                        </NativeSelect>
                      </label>
                    </div>

                    {preview.length > 0 ? (
                      <div className="text-xs">
                        <p className="text-muted-foreground mb-1">Xem trước {preview.length} mốc (đã né cuối tuần) — sửa xong bấm Sinh lịch để lưu:</p>
                        <p className="text-[10px] text-muted-foreground mb-1">Mốc luôn nằm đúng tháng của chu kỳ; ngày có thể lệch vài hôm vì tháng ngắn/dài khác nhau và phải né T7/CN.</p>
                        <div className="flex flex-wrap gap-1">
                          {preview.map((d, i) => (
                            <span key={d + i} className="px-1.5 py-0.5 rounded bg-card border text-foreground">L{i + 1}: {vnDate(d)}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-(--color-text-warning)">Chọn ngày bắt đầu + số lần để xem trước.</p>
                    )}

                    <div className="flex items-center gap-2">
                      <Button size="sm" disabled={busy === p.id || preview.length === 0} onClick={() => lenLich(p.id, p.tong_lan)}>
                        {busy === p.id ? 'Đang lưu…' : `Sinh lịch (${preview.length} lượt)`}
                      </Button>
                      <Button onClick={() => setMoLich(null)} variant="ghost" size="sm">Đóng</Button>
                      {p.so_xong > 0 && <span className="text-[11px] text-(--color-text-warning)">Giữ {p.so_xong} lượt đã làm, chỉ thay lượt chưa làm.</span>}
                    </div>
                  </div>
                  )
                })()}
              </li>
            ))}
          </ul>
        )}
      </Card>
      )}
    </div>
  )
}
