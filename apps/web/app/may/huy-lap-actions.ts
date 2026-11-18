'use server'

// Huỷ bộ / máy đã lắp (nhập nhầm) + sửa ngày bảo hành cả bộ (18/11/2026; migration 20261118130000).
// Làm được BẤT CỨ LÚC NÀO (anh Dũng 18/11). DB chặn khi đã có ticket / lịch bảo trì, và thiết bị trong bộ không huỷ
// lẻ; app bắt ghi lý do (audit).

import { revalidatePath } from 'next/cache'
import { dataClient } from '@/lib/nen-tang/db'
import { requireStaff } from '@/lib/nen-tang/phien'
import { doQuyen } from '@/lib/nen-tang/kiem-quyen'
import { ghiAudit } from '@/lib/nen-tang/nhat-ky'
import { kiemLyDoHuy, kiemNgayBo } from '@/lib/bh/huyLap'

type KQ<T = object> = ({ ok: true } & T) | { ok: false; error: string }

const loiRpc = (e: { message?: string } | null) => {
  const m = e?.message ?? ''
  return /[À-ỹ]/.test(m) ? m.replace(/^.*?ERROR:\s*/, '') : 'Không thực hiện được, vui lòng thử lại.'
}

export type ThietBiBo = { serial: string; internal_code: string | null; cho_serial: boolean; full_end: string | null }
export type ThongTinLap = {
  la_bo: boolean
  bo_cha: string | null
  con: ThietBiBo[]
  install_date: string | null
  // Máy lẻ hoặc bộ (không phải thiết bị trong bộ). DB kiểm ticket / lịch bảo trì khi bấm.
  huy_duoc: boolean
}

/** Bộ / thiết bị + còn huỷ được không. Chưa áp migration / cột cũng đọc được (chỉ dùng cột có sẵn). */
export async function docThongTinLap(serial: string): Promise<ThongTinLap> {
  await requireStaff()
  await doQuyen('cs.may.xem')
  const db = dataClient()
  const [{ data: m, error }, { data: con, error: e2 }] = await Promise.all([
    db.from('installed_base').select('serial, parent_serial, install_date, created_at').eq('serial', serial).maybeSingle(),
    db.from('installed_base').select('serial, internal_code, cho_serial, created_at, warranty(full_end)').eq('parent_serial', serial).order('serial'),
  ])
  if (error || e2) throw new Error((error ?? e2)!.message)
  const may = m as { parent_serial: string | null; install_date: string | null; created_at: string } | null
  type Con = { serial: string; internal_code: string | null; cho_serial: boolean; created_at: string; warranty: { full_end: string | null }[] | { full_end: string | null } | null }
  const dsCon = ((con ?? []) as Con[])
  return {
    la_bo: dsCon.length > 0,
    bo_cha: may?.parent_serial ?? null,
    con: dsCon.map((c) => ({
      serial: c.serial, internal_code: c.internal_code, cho_serial: !!c.cho_serial,
      full_end: (Array.isArray(c.warranty) ? c.warranty[0]?.full_end : c.warranty?.full_end) ?? null,
    })),
    install_date: may?.install_date ?? null,
    huy_duoc: !!may && !may.parent_serial,
  }
}

/** Huỷ máy lẻ hoặc cả bộ vừa lắp (nhập nhầm). Bắt buộc lý do. Serial thật trả về kho. */
export async function huyLapMay(serial: string, lyDo: string): Promise<KQ<{ customer_id: string | null; so_may: number }>> {
  await requireStaff()
  await doQuyen('cs.may.kich_hoat_bh')
  const ld = kiemLyDoHuy(lyDo)
  if (!ld.ok) return ld
  if (!serial?.trim()) return { ok: false, error: 'Thiếu mã máy.' }
  const { data, error } = await dataClient().rpc('huy_lap_may', { p_serial: serial, p_so_gio: null })
  if (error) return { ok: false, error: loiRpc(error) }
  const r = (data ?? {}) as { so_may?: number; serials?: string[]; tra_kho?: string[]; customer_id?: string | null }
  await ghiAudit('huy_lap_may', `serial:${serial}`, { ly_do: ld.lyDo, serials: r.serials ?? [], tra_kho: r.tra_kho ?? [] })
  revalidatePath('/'); revalidatePath('/bh-cho-kich-hoat')
  for (const s of r.serials ?? []) revalidatePath(`/may/${encodeURIComponent(s)}`)
  if (r.customer_id) revalidatePath(`/khach/${r.customer_id}`)
  return { ok: true, customer_id: r.customer_id ?? null, so_may: r.so_may ?? 0 }
}

/** Sửa ngày bắt đầu bảo hành cho cả bộ: ngày lắp bộ + mọi thiết bị, tính lại hạn từng thiết bị đã kích hoạt. */
export async function suaNgayBaoHanhBo(bo: string, ngay: string): Promise<KQ<{ so_thiet_bi: number }>> {
  await requireStaff()
  await doQuyen('cs.may.kich_hoat_bh')
  const n = kiemNgayBo(ngay)
  if (!n.ok) return n
  const { data, error } = await dataClient().rpc('sua_ngay_bh_bo', { p_bo: bo, p_ngay: n.ngay })
  if (error) return { ok: false, error: loiRpc(error) }
  await ghiAudit('sua_ngay_bh_bo', `serial:${bo}`, { ngay: n.ngay, so_thiet_bi: data })
  revalidatePath(`/may/${encodeURIComponent(bo)}`); revalidatePath('/')
  return { ok: true, so_thiet_bi: (data as number) ?? 0 }
}
