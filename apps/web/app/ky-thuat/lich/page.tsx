import { chanNeuThieuQuyen } from '@/lib/nen-tang/kiem-quyen'
import Link from 'next/link'
import { dsKyThuat, dsLichKyThuat } from '@/app/actions'
import { LichKyThuatList } from '@/components/LichKyThuatList'
import { LichKyThuatCalendar } from '@/components/LichKyThuatCalendar'
import { BangDieuPhoiKT } from '@/components/BangDieuPhoiKT'
import { LOAI_VIEC_KT } from '@/lib/danhSach'

const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Thứ Hai của tuần chứa `d` (UTC, tuần bắt đầu T2). */
function thuHai(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dow = (x.getUTCDay() + 6) % 7 // T2=0 … CN=6
  x.setUTCDate(x.getUTCDate() - dow)
  return x
}

export default async function XemLichKyThuatPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; tu?: string; den?: string; kt?: string; thang?: string; tuan?: string; loai?: string; tinh?: string }>
}) {
  await chanNeuThieuQuyen('cs.ky_thuat.xep_lich', 'QUANLY')
  // Trang này còn đọc DANH SÁCH kỹ thuật, vốn đòi cs.ky_thuat.ho_so — một quyền
  // KHÁC với quyền gác trang. Không gác cả hai thì ai được tick "xếp lịch" mà
  // không được tick "hồ sơ kỹ thuật viên" sẽ vào tới nơi rồi mới bị đá ra giữa
  // chừng, không hiểu vì sao. Mà thiếu danh sách kỹ thuật thì trang cũng vô nghĩa.
  await chanNeuThieuQuyen('cs.ky_thuat.ho_so', 'QUANLY')
  const { view = 'list', tu: tuRaw, den: denRaw, kt, thang: thangRaw, tuan: tuanRaw, loai, tinh } = await searchParams
  const laCalendar = view === 'calendar'
  const laBoard = view === 'board'
  const now = new Date()
  const thang = /^\d{4}-\d{2}$/.test(thangRaw ?? '') ? thangRaw! : now.toISOString().slice(0, 7)
  const tu = /^\d{4}-\d{2}-\d{2}$/.test(tuRaw ?? '') ? tuRaw! : iso(new Date(now.getTime() - 7 * 86400000))
  const den = /^\d{4}-\d{2}-\d{2}$/.test(denRaw ?? '') ? denRaw! : iso(new Date(now.getTime() + 45 * 86400000))

  // View điều phối: tuần T2..CN chứa `tuan` (mặc định tuần này).
  const moc = /^\d{4}-\d{2}-\d{2}$/.test(tuanRaw ?? '') ? new Date(`${tuanRaw}T00:00:00Z`) : now
  const t2 = thuHai(moc)
  const days = Array.from({ length: 7 }, (_, i) => iso(new Date(t2.getTime() + i * 86400000)))
  const tuanTruoc = iso(new Date(t2.getTime() - 7 * 86400000))
  const tuanSau = iso(new Date(t2.getTime() + 7 * 86400000))

  const dsKt = await dsKyThuat(true)

  // Lọc theo TỈNH — CEO yêu cầu 24/08 ("thêm kĩ thuật theo tỉnh nào và lọc đc theo tỉnh").
  // Chỉ dựng chip cho tỉnh THẬT SỰ có kỹ thuật: cả app mới vài người, bày đủ 64 tỉnh là
  // 60 chip rỗng. Nhờ vậy cũng không vướng luật "quá 10 mục phải gõ để tìm".
  const dsTinh = [...new Set(dsKt.map((k) => (k.tinh ?? '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'vi'))
  // Chặn giá trị rác trong đường dẫn: tỉnh không có ai phụ trách thì coi như không lọc.
  const tinhOk = tinh && dsTinh.includes(tinh) ? tinh : undefined
  const ktTrongTinh = tinhOk ? dsKt.filter((k) => (k.tinh ?? '').trim() === tinhOk) : dsKt
  const idTrongTinh = new Set(ktTrongTinh.map((k) => k.id))

  const rowsAll = laBoard
    ? await dsLichKyThuat(days[0], days[6], kt || undefined)
    : laCalendar
      ? await dsLichKyThuat(`${thang}-01`, `${thang}-31`, kt || undefined)
      : await dsLichKyThuat(tu, den, kt || undefined)
  const rows = rowsAll.filter((r) => {
    // Lọc theo loại việc: giữ chuyến có ÍT NHẤT 1 việc thuộc loại đó.
    if (loai && !r.viec.some((v) => v.loai_viec === loai)) return false
    if (!tinhOk) return true
    // Chuyến ĐÃ gán -> xét tỉnh của người được gán. Chuyến CHƯA gán ai thì xét tỉnh của
    // chính chuyến đó — cố ý giữ lại, vì đó đúng là thứ người điều phối cần thấy khi đang
    // hỏi "tỉnh này còn việc nào chưa có người?".
    return r.ky_thuat_id ? idTrongTinh.has(r.ky_thuat_id) : (r.tinh ?? '').trim() === tinhOk
  })

  // Base params luôn mang theo: kt + loai + tinh (đổi view / tuần không được mất bộ lọc kia).
  const giuLoc: Record<string, string> = { ...(kt ? { kt } : {}), ...(loai ? { loai } : {}), ...(tinhOk ? { tinh: tinhOk } : {}) }
  const giuKt = (extra: Record<string, string>) => new URLSearchParams({ ...giuLoc, ...extra }).toString()
  // Tham số cửa sổ thời gian theo view — để nút lọc KT giữ nguyên khoảng đang xem.
  const cuaSo: Record<string, string> = laBoard ? { tuan: days[0] } : laCalendar ? { thang } : { tu, den }
  const chiLoai: Record<string, string> = { ...(loai ? { loai } : {}), ...(tinhOk ? { tinh: tinhOk } : {}) }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Lịch kỹ thuật đã lên</h1>
            <p className="text-sm text-slate-500">Xem các chuyến đã gán cho kỹ thuật. Gán chuyến mới ở <Link href="/ky-thuat" className="underline">Gán lịch kỹ thuật</Link>.</p>
          </div>
          <div className="flex gap-1.5">
            <Link href={`/ky-thuat/lich?${giuKt({ view: 'list' })}`} className={`px-3 py-1.5 rounded-lg text-sm border ${!laCalendar && !laBoard ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600'}`}>Danh sách</Link>
            <Link href={`/ky-thuat/lich?${giuKt({ view: 'board' })}`} className={`px-3 py-1.5 rounded-lg text-sm border ${laBoard ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600'}`}>▦ Điều phối</Link>
            <Link href={`/ky-thuat/lich?${giuKt({ view: 'calendar', thang })}`} className={`px-3 py-1.5 rounded-lg text-sm border ${laCalendar ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600'}`}>📅 Calendar</Link>
          </div>
        </header>

        {/* Lọc theo TỈNH của kỹ thuật — chỉ hiện tỉnh có người, ẩn hẳn khi chưa ai điền tỉnh */}
        {dsTinh.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide mr-0.5">Tỉnh</span>
            <Link href={`/ky-thuat/lich?${new URLSearchParams({ view, ...(loai ? { loai } : {}), ...cuaSo })}`}
              className={`px-2.5 py-1 rounded-lg text-xs border ${!tinhOk ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600'}`}>Tất cả</Link>
            {dsTinh.map((t) => (
              <Link key={t} href={`/ky-thuat/lich?${new URLSearchParams({ view, tinh: t, ...(loai ? { loai } : {}), ...cuaSo })}`}
                className={`px-2.5 py-1 rounded-lg text-xs border ${tinhOk === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600'}`}>{t}</Link>
            ))}
          </div>
        )}

        {/* Lọc theo kỹ thuật */}
        <div className="flex gap-1.5 flex-wrap">
          <Link href={`/ky-thuat/lich?${new URLSearchParams({ view, ...chiLoai, ...cuaSo })}`}
            className={`px-2.5 py-1 rounded-lg text-xs border ${!kt ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600'}`}>Tất cả KT</Link>
          {ktTrongTinh.map((k) => (
            <Link key={k.id} href={`/ky-thuat/lich?${new URLSearchParams({ view, kt: k.id, ...chiLoai, ...cuaSo })}`}
              className={`px-2.5 py-1 rounded-lg text-xs border ${kt === k.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600'}`}>
              {k.ten}{k.tinh && !tinhOk && <span className="text-[10px] opacity-60"> · {k.tinh}</span>}
            </Link>
          ))}
        </div>

        {/* Lọc theo loại việc */}
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-[11px] text-slate-400 uppercase tracking-wide mr-0.5">Loại việc</span>
          <Link href={`/ky-thuat/lich?${new URLSearchParams({ view, ...(kt ? { kt } : {}), ...(tinhOk ? { tinh: tinhOk } : {}), ...cuaSo })}`}
            className={`px-2.5 py-1 rounded-lg text-xs border ${!loai ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600'}`}>Tất cả</Link>
          {LOAI_VIEC_KT.map((lv) => (
            <Link key={lv.v} href={`/ky-thuat/lich?${new URLSearchParams({ view, ...(kt ? { kt } : {}), ...(tinhOk ? { tinh: tinhOk } : {}), loai: lv.v, ...cuaSo })}`}
              className={`px-2.5 py-1 rounded-lg text-xs border ${loai === lv.v ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600'}`}>{lv.nhan}</Link>
          ))}
        </div>

        {laBoard ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <Link href={`/ky-thuat/lich?${new URLSearchParams({ view: 'board', tuan: tuanTruoc, ...giuLoc })}`} className="rounded-lg border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">← Tuần trước</Link>
              <span className="text-sm text-slate-600">Tuần {days[0].slice(8)}/{days[0].slice(5, 7)} – {days[6].slice(8)}/{days[6].slice(5, 7)}</span>
              <Link href={`/ky-thuat/lich?${new URLSearchParams({ view: 'board', tuan: tuanSau, ...giuLoc })}`} className="rounded-lg border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Tuần sau →</Link>
            </div>
            <BangDieuPhoiKT kts={kt ? ktTrongTinh.filter((k) => k.id === kt) : ktTrongTinh} rows={rows} days={days} />
          </>
        ) : laCalendar ? (
          <LichKyThuatCalendar thang={thang} rows={rows} kt={kt || undefined} loai={loai || undefined} />
        ) : (
          <>
            <form className="flex items-end gap-2 text-xs text-slate-600">
              <label>Từ<br /><input type="date" name="tu" defaultValue={tu} className="mt-0.5 rounded border px-2 py-1 text-sm" /></label>
              <label>Đến<br /><input type="date" name="den" defaultValue={den} className="mt-0.5 rounded border px-2 py-1 text-sm" /></label>
              <input type="hidden" name="view" value="list" />
              {kt && <input type="hidden" name="kt" value={kt} />}
              {loai && <input type="hidden" name="loai" value={loai} />}
              <button className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm">Lọc</button>
            </form>
            <LichKyThuatList rows={rows} />
          </>
        )}
      </div>
    </main>
  )
}
