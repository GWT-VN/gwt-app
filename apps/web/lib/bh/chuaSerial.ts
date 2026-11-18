// Kích hoạt bảo hành khi CHƯA có serial (chị Trang 18/11): DB cấp mã tạm TAM + YYYYMM + số, cờ installed_base.cho_serial;
// bổ sung serial thật sau (bo_sung_serial) — bảo hành / ticket / lịch bảo trì tự theo (FK ON UPDATE CASCADE).

/** Mã tạm do DB cấp (cs_ma_serial_tam): 'TAM' + YYYYMM + ≥3 số. */
export function laMaTam(serial: string | null | undefined): boolean {
  return !!serial && /^TAM\d{9,}$/.test(serial)
}

type ThietBi = { internal_code: string; serial: string }

/**
 * Danh sách thiết bị gửi lap_bo_combo. `chuaSerial[i]` = thiết bị i đánh dấu "Chưa có serial" → gửi serial '' (DB cấp mã tạm).
 * Thiết bị không đánh dấu mà trống serial → báo chọn; serial trùng nhau → chặn.
 */
export function chuanBiThietBiCombo(ds: readonly ThietBi[], chuaSerial: readonly boolean[]):
  { ok: true; ds: ThietBi[]; soChuaSerial: number } | { ok: false; error: string } {
  if (!ds.length) return { ok: false, error: 'Bộ chưa có thiết bị nào.' }
  const ra: ThietBi[] = []
  const daCo = new Set<string>()
  for (let i = 0; i < ds.length; i++) {
    const ic = ds[i].internal_code?.trim() ?? ''
    if (!ic) return { ok: false, error: 'Thiết bị thiếu mã nội bộ.' }
    if (chuaSerial[i]) { ra.push({ internal_code: ic, serial: '' }); continue }
    const s = ds[i].serial?.trim() ?? ''
    if (!s) return { ok: false, error: `Chọn serial cho thiết bị ${ic} hoặc đánh dấu "Chưa có serial".` }
    if (daCo.has(s)) return { ok: false, error: `Serial ${s} bị chọn trùng cho hai thiết bị.` }
    daCo.add(s)
    ra.push({ internal_code: ic, serial: s })
  }
  return { ok: true, ds: ra, soChuaSerial: chuaSerial.filter(Boolean).length }
}
