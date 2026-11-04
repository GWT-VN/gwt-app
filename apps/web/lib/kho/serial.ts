/**
 * Serial theo mã cho thẻ kho (/kho/ma/[ma]). Danh sách serial CHUẨN = serial_registry (DB app); sự kiện gần nhất lấy từ
 * serial_su_dung (gồm cả sự kiện bot kho ghi từ kênh Discord: nhập kho / xuất kho / tình trạng), BỎ dữ liệu thử (test_batch).
 * Serial bot gặp mà chưa có trong danh sách → serial_pending (chờ duyệt ở /serial) — hiện kèm để biết.
 * `ghepSerial` thuần (test); `serialTheoMa` đọc DB bằng dataClient (server, sau chanKho()).
 */
import { dataClient } from '@/lib/nen-tang/db'

export type DongSerial = {
  serial: string; trang_thai: string | null; trang_thai_nhan: string; cho_duyet: boolean
  su_kien_cuoi: string | null; luc_cuoi: string | null; ghi_chu_cuoi: string | null
}

export const NHAN_SU_KIEN: Record<string, string> = {
  kho_nhap: 'Nhập kho', kho_xuat: 'Xuất kho', tinh_trang: 'Tình trạng', lap_dat: 'Lắp đặt',
  dat_trung_bay: 'Trưng bày', dat_thu_hoi_bao_hanh: 'Thu hồi bảo hành', doi_may_lap_moi: 'Đổi máy',
}
export const nhanSuKien = (x: string | null | undefined) => (x ? NHAN_SU_KIEN[x] ?? x : '')

type Reg = { serial: string; trang_thai: string | null }
type SuKien = { serial: string; su_kien: string; luc: string; ghi_chu: string | null }
type Cho = { serial: string; created_at: string; ghi_chu: string | null }

/** Ghép danh sách serial + sự kiện mới nhất (sự kiện đã sắp mới nhất trước) + serial chờ duyệt. Sắp theo serial, chờ duyệt cuối. */
export function ghepSerial(reg: Reg[], suKien: SuKien[], cho: Cho[], nhanTT: Map<string, string>): DongSerial[] {
  const moi = new Map<string, SuKien>()
  for (const e of suKien) if (!moi.has(e.serial)) moi.set(e.serial, e)
  const coSan = new Set(reg.map((r) => r.serial))
  const ra: DongSerial[] = [...reg].sort((a, b) => a.serial.localeCompare(b.serial)).map((r) => {
    const e = moi.get(r.serial)
    return { serial: r.serial, trang_thai: r.trang_thai, trang_thai_nhan: (r.trang_thai && nhanTT.get(r.trang_thai)) || r.trang_thai || '—',
      cho_duyet: false, su_kien_cuoi: e?.su_kien ?? null, luc_cuoi: e?.luc ?? null, ghi_chu_cuoi: e?.ghi_chu ?? null }
  })
  for (const c of cho) if (!coSan.has(c.serial)) {
    const e = moi.get(c.serial)
    ra.push({ serial: c.serial, trang_thai: null, trang_thai_nhan: 'Chờ duyệt', cho_duyet: true,
      su_kien_cuoi: e?.su_kien ?? null, luc_cuoi: e?.luc ?? c.created_at, ghi_chu_cuoi: e?.ghi_chu ?? c.ghi_chu })
  }
  return ra
}

const KHUC = 150   // .in() theo khúc — tránh URL quá dài khi một mã có vài trăm serial

export async function serialTheoMa(ma: string): Promise<DongSerial[]> {
  const db = dataClient()
  const [{ data: reg, error: e1 }, { data: tt }, { data: cho }] = await Promise.all([
    db.from('serial_registry').select('serial, trang_thai').eq('internal_code', ma).limit(5000),
    db.from('serial_trang_thai').select('code, nhan'),
    db.from('serial_pending').select('serial, created_at, ghi_chu').eq('internal_code', ma).eq('trang_thai', 'cho_duyet').is('test_batch', null),
  ])
  if (e1) throw new Error(e1.message)
  const ds = [...(reg ?? []).map((r) => r.serial as string), ...(cho ?? []).map((r) => r.serial as string)]
  const suKien: SuKien[] = []
  for (let i = 0; i < ds.length; i += KHUC) {
    const { data, error } = await db.from('serial_su_dung').select('serial, su_kien, luc, ghi_chu')
      .in('serial', ds.slice(i, i + KHUC)).is('test_batch', null).order('luc', { ascending: false })
    if (error) throw new Error(error.message)
    suKien.push(...((data ?? []) as SuKien[]))
  }
  suKien.sort((a, b) => b.luc.localeCompare(a.luc))
  return ghepSerial((reg ?? []) as Reg[], suKien, (cho ?? []) as Cho[], new Map((tt ?? []).map((r) => [r.code as string, r.nhan as string])))
}
