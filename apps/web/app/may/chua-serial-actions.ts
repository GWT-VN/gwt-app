'use server'

// Kích hoạt bảo hành khi CHƯA có serial + bổ sung serial sau (chị Trang 18/11; migration 20261118110000_cs_bh_chua_serial).
// DB cấp mã tạm TAM… (installed_base.cho_serial = true). Bổ sung = đổi mã tạm → serial thật; bảo hành / ticket /
// lịch bảo trì đã gắn tự đi theo (FK ON UPDATE CASCADE). Quyền như đăng ký bảo hành (cs.may.kich_hoat_bh).
// Riêng file này — chỉ đụng app/actions.ts ở lapBoCombo (cho phép thiết bị chưa có serial).

import { revalidatePath } from 'next/cache'
import { dataClient } from '@/lib/nen-tang/db'
import { layNhanVien, requireStaff } from '@/lib/nen-tang/phien'
import { doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { DO_CHAC_NGAY_LAP, type DoChacNgayLap } from '@/lib/danhSach'

type KQ<T = object> = ({ ok: true } & T) | { ok: false; error: string }

const NGAY = /^\d{4}-\d{2}-\d{2}$/
/** Lỗi do RPC raise (tiếng Việt, cho người dùng) → giữ nguyên câu; lỗi khác → câu chung. */
const loiRpc = (e: { message?: string } | null) => {
  const m = e?.message ?? ''
  return /[À-ỹ]/.test(m) ? m.replace(/^.*?ERROR:\s*/, '') : 'Không thực hiện được, vui lòng thử lại.'
}

/** Lắp 1 máy lẻ + kích hoạt BH khi chưa có serial → mã tạm. Phải chọn MÁY (để tính hạn bảo hành). */
export async function kichHoatChuaSerial(input: {
  internal_code: string; customer_id: string; install_date: string; install_address?: string
  ngay_lap_do_chac?: DoChacNgayLap; ghi_chu?: string
}): Promise<KQ<{ serial: string }>> {
  await requireStaff()
  await doQuyen('cs.may.kich_hoat_bh')
  const ic = input.internal_code?.trim()
  if (!ic) return { ok: false, error: 'Chưa có serial thì phải chọn máy để tính hạn bảo hành.' }
  if (!input.customer_id) return { ok: false, error: 'Chọn khách.' }
  if (!NGAY.test(input.install_date ?? '')) return { ok: false, error: 'Ngày lắp không hợp lệ.' }
  const doChac = (DO_CHAC_NGAY_LAP as readonly string[]).includes(input.ngay_lap_do_chac ?? '') ? input.ngay_lap_do_chac : 'chinh_xac'
  const db = dataClient()
  // Như dangKyBaoHanh: chỉ kích hoạt BH cho MÁY, không cho lõi / vật tư.
  const { data: cat } = await db.from('catalog_item').select('"Danh mục cấp 1"').eq('Mã nội bộ', ic).limit(1).maybeSingle()
  const dm1 = (cat as Record<string, string | null> | null)?.['Danh mục cấp 1']
  if (dm1 && dm1 !== 'Machines') {
    return { ok: false, error: `Chỉ kích hoạt bảo hành cho MÁY. Mã "${ic}" thuộc "${dm1}" (lõi/vật tư).` }
  }
  const { data, error } = await db.rpc('kich_hoat_bh_chua_serial', {
    p_customer: input.customer_id, p_internal_code: ic, p_model: null, p_install_date: input.install_date,
    p_install_address: input.install_address?.trim() || null, p_ngay_lap_do_chac: doChac, p_ghi_chu: input.ghi_chu?.trim() || null,
  })
  if (error) return { ok: false, error: loiRpc(error) }
  const serial = data as string
  await ghiAudit('kich_hoat_bh_chua_serial', `serial:${serial}`, { customer_id: input.customer_id, internal_code: ic, install_date: input.install_date })
  revalidatePath('/'); revalidatePath('/bh-cho-kich-hoat'); revalidatePath(`/khach/${input.customer_id}`)
  return { ok: true, serial }
}

/** Máy đang chờ bổ sung serial? (installed_base.cho_serial — view v_installed_base chưa có cột này). */
export async function docChoSerial(serial: string): Promise<{ cho_serial: boolean; internal_code: string | null }> {
  await requireStaff()
  await doQuyen('cs.may.xem')
  const { data, error } = await dataClient().from('installed_base').select('cho_serial, internal_code').eq('serial', serial).maybeSingle()
  if (error) throw new Error(error.message)
  const r = data as { cho_serial: boolean; internal_code: string | null } | null
  return { cho_serial: !!r?.cho_serial, internal_code: r?.internal_code ?? null }
}

export type MayChoSerial = {
  serial: string; internal_code: string | null; parent_serial: string | null
  customer_id: string | null; ten_khach: string | null; install_date: string | null
}

/** Danh sách máy đã kích hoạt BH nhưng còn chờ bổ sung serial (cũ nhất trước). */
export async function dsMayChoSerial(): Promise<MayChoSerial[]> {
  await requireStaff()
  await doQuyen('cs.may.xem')
  const { data, error } = await dataClient().from('installed_base')
    .select('serial, internal_code, parent_serial, customer_id, install_date, cs_customers(full_name)')
    .eq('cho_serial', true).order('install_date').limit(500)
  if (error) throw new Error(error.message)
  type Dong = Omit<MayChoSerial, 'ten_khach'> & { cs_customers: { full_name: string | null } | null }
  return ((data ?? []) as unknown as Dong[]).map(({ cs_customers, ...x }) => ({ ...x, ten_khach: cs_customers?.full_name ?? null }))
}

/** Bổ sung serial thật cho máy đang chờ. Serial phải có trong kho, chưa lắp, đúng loại máy (DB kiểm). */
export async function boSungSerial(maTam: string, serial: string): Promise<KQ<{ serial: string }>> {
  await requireStaff()
  await doQuyen('cs.may.kich_hoat_bh')
  const s = serial?.trim()
  if (!maTam?.trim()) return { ok: false, error: 'Thiếu mã máy.' }
  if (!s) return { ok: false, error: 'Nhập serial thật.' }
  const db = dataClient()
  const { data: may } = await db.from('installed_base').select('customer_id').eq('serial', maTam).maybeSingle()
  const { error } = await db.rpc('bo_sung_serial', { p_tam: maTam, p_serial: s })
  if (error) return { ok: false, error: loiRpc(error) }
  const customer_id = (may as { customer_id: string | null } | null)?.customer_id ?? null
  // Lịch sử serial thật + trạng thái kho = đã lắp (như dangKyBaoHanh). Lỗi nhật ký không chặn nghiệp vụ chính.
  try {
    const nv = await layNhanVien()
    await db.from('serial_su_dung').insert({
      serial: s, su_kien: 'lap_dat', tu_trang_thai: 'ton_kho', den_trang_thai: 'da_lap', customer_id,
      ghi_chu: `Bổ sung serial cho máy đã kích hoạt bảo hành trước (mã tạm ${maTam})`, boi: nv?.email ?? null,
    })
    await db.from('serial_registry').update({ trang_thai: 'da_lap' }).eq('serial', s)
  } catch { /* bỏ qua */ }
  await ghiAudit('bo_sung_serial', `serial:${s}`, { ma_tam: maTam })
  revalidatePath('/'); revalidatePath('/bh-cho-kich-hoat')
  revalidatePath(`/may/${encodeURIComponent(maTam)}`); revalidatePath(`/may/${encodeURIComponent(s)}`)
  if (customer_id) revalidatePath(`/khach/${customer_id}`)
  return { ok: true, serial: s }
}

/** Toàn bộ MÁY trong catalog (Danh mục cấp 1 = Machines) — khi chưa có serial, máy có thể chưa có serial nào trong kho. */
export async function dsMayCatalog(): Promise<{ internal_code: string; ten: string | null; danh_muc: string | null }[]> {
  await requireStaff()
  await doQuyen('cs.may.xem')
  const { data, error } = await dataClient().from('catalog_item')
    .select('"Mã nội bộ","Tên ngắn gọn (đề xuất)","Danh mục cấp 2"').eq('Danh mục cấp 1', 'Machines')
  if (error) throw new Error(error.message)
  const theo = new Map<string, { internal_code: string; ten: string | null; danh_muc: string | null }>()
  for (const r of (data ?? []) as Record<string, string | null>[]) {
    const ic = (r['Mã nội bộ'] ?? '').trim()
    if (ic && !theo.has(ic)) theo.set(ic, { internal_code: ic, ten: r['Tên ngắn gọn (đề xuất)'], danh_muc: r['Danh mục cấp 2'] })
  }
  return [...theo.values()].sort((a, b) => (a.ten ?? a.internal_code).localeCompare(b.ten ?? b.internal_code, 'vi'))
}
