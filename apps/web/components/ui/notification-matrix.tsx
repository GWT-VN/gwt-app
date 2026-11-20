'use client'

import { useId, useRef, useState } from 'react'
import { Checkbox } from './checkbox'
import {
  maTranChon,
  maTranGui,
  maTranLuu,
  maTranNa,
  maTranO,
  maTranOChon,
  maTranTenKhu,
  maTranThCot,
  maTranThHang,
  maTranThKhu,
} from './notif-styles'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from './table'

/** Cột = kênh nhận. `luaChon` → ô có thêm Select chọn kênh (Discord · kênh), tắt khi bỏ tick. */
export type KenhThongBao = { id: string; ten: string; luaChon?: readonly string[] }
/** Hàng = loại thông báo, gom theo `khu` (thứ tự khu = thứ tự xuất hiện). */
export type LoaiThongBao = { id: string; khu: string; ten: string; guiCho: string }
/** Một ô: bật/tắt + kênh đang chọn (nếu cột có `luaChon`). */
export type OThongBao = { bat: boolean; chon?: string }
/** `giaTri[loai][kenh]` — vắng = ô KHÔNG ÁP DỤNG ("—" + chữ ẩn "Không áp dụng"). */
export type GiaTriMaTran = Record<string, Record<string, OThongBao | undefined>>
export type ThayDoiThongBao = { loai: string; kenh: string } & OThongBao

const datO = (g: GiaTriMaTran, loai: string, kenh: string, o: OThongBao): GiaTriMaTran => ({
  ...g,
  [loai]: { ...g[loai], [kenh]: o },
})

/**
 * NotificationMatrix — ma trận cấu hình thông báo ở màn Quản trị (README NotificationMatrix): hàng = loại gom theo khu,
 * cột = kênh nhận. Dựng trên Table DS (`table.tsx`) + phần riêng `.ui-notif-matrix*` của ds/nguon/bundle.css.
 * - Bấm là lưu (không nút Lưu): `onDoi(giaTriMoi)` ngay, rồi `onLuu(thayDoi)`; xong → dòng `role="status"` báo "Đã lưu: …".
 *   `onLuu` trả Promise bị từ chối → CHỈ ô đó trả về như cũ (trên giá trị MỚI NHẤT — ô khác bấm trong lúc chờ không bị
 *   đè; ô đó đã bị đổi tiếp thì để nguyên) + báo "Chưa lưu được: …. Thử lại."
 * - Ô = Checkbox DS, tên đọc = cột + loại (`aria-labelledby`), "Gửi cho: …" qua `aria-describedby`. Cột có `luaChon`:
 *   thêm Select rộng 120 (tên "Kênh Discord cho “…”: #kênh"), tắt khi bỏ tick.
 * - `<caption>` ẩn; `th scope` col / row / rowgroup. Hẹp: cột tên ghim trái, bảng cuộn ngang trong khung.
 * - Tắt cột "Trong app" → bên gọi lọc loại đó khỏi `NotificationCenter`.
 */
export function NotificationMatrix({
  loai,
  kenh,
  giaTri,
  onDoi,
  onLuu,
  caption = 'Cấu hình thông báo: loại thông báo theo kênh nhận',
}: {
  loai: LoaiThongBao[]
  kenh: KenhThongBao[]
  giaTri: GiaTriMaTran
  onDoi(giaTriMoi: GiaTriMaTran): void
  onLuu?(thayDoi: ThayDoiThongBao): void | Promise<unknown>
  caption?: string
}) {
  const id = useId()
  const [bao, setBao] = useState('Bấm là lưu — không có nút Lưu.')
  const khu = [...new Set(loai.map((l) => l.khu))]

  // Giá trị mới nhất (props có thể chưa kịp render lại giữa hai lần bấm, và hoàn tác chạy sau await).
  const moiNhat = useRef(giaTri)
  moiNhat.current = giaTri
  const doi = (g: GiaTriMaTran) => {
    moiNhat.current = g
    onDoi(g)
  }

  const luu = async (l: LoaiThongBao, k: KenhThongBao, cu: OThongBao, o: OThongBao, chu: string) => {
    doi(datO(moiNhat.current, l.id, k.id, o))
    try {
      await onLuu?.({ loai: l.id, kenh: k.id, ...o })
      setBao(`Đã lưu: ${chu}`)
    } catch {
      const nay = moiNhat.current[l.id]?.[k.id]
      if (nay?.bat === o.bat && nay?.chon === o.chon) doi(datO(moiNhat.current, l.id, k.id, cu))
      setBao(`Chưa lưu được: ${chu}. Thử lại.`)
    }
  }

  return (
    <div className="border-none border-current">
      <TableWrap vien data-slot="notif-matrix-khung">
        <Table data-slot="notif-matrix">
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className={maTranThCot}>
                Loại thông báo
              </TableHead>
              {kenh.map((k) => (
                <TableHead key={k.id} scope="col" id={`${id}-c-${k.id}`} className={maTranThCot}>
                  {k.ten}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {khu.map((ten) => (
            <TableBody key={ten}>
              <TableRow>
                <TableHead scope="rowgroup" colSpan={kenh.length + 1} className={maTranThKhu}>
                  <span className={maTranTenKhu}>{ten}</span>
                </TableHead>
              </TableRow>
              {loai
                .filter((l) => l.khu === ten)
                .map((l) => (
                  <TableRow key={l.id}>
                    <TableHead scope="row" className={maTranThHang}>
                      <span id={`${id}-r-${l.id}`} className="border-none border-current">
                        {l.ten}
                      </span>
                      <span id={`${id}-g-${l.id}`} className={maTranGui}>
                        Gửi cho: {l.guiCho}
                      </span>
                    </TableHead>
                    {kenh.map((k) => {
                      const o = giaTri[l.id]?.[k.id]
                      return (
                        <TableCell key={k.id} className={maTranO}>
                          {!o ? (
                            <>
                              <span aria-hidden="true" className={maTranNa}>
                                —
                              </span>
                              <span className="sr-only">Không áp dụng</span>
                            </>
                          ) : (
                            <span className={maTranOChon}>
                              <Checkbox
                                checked={o.bat}
                                aria-labelledby={`${id}-c-${k.id} ${id}-r-${l.id}`}
                                aria-describedby={`${id}-g-${l.id}`}
                                onCheckedChange={(v) =>
                                  luu(l, k, o, { ...o, bat: v === true }, `${v === true ? 'bật' : 'tắt'} ${k.ten} — ${l.ten}`)
                                }
                              />
                              {k.luaChon && (
                                <Select
                                  value={o.chon}
                                  disabled={!o.bat}
                                  onValueChange={(v) => v !== o.chon && luu(l, k, o, { ...o, chon: v }, `${l.ten} gửi vào ${v}`)}
                                >
                                  <SelectTrigger aria-label={`Kênh Discord cho “${l.ten}”: ${o.chon ?? 'chưa chọn'}`} className={maTranChon}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {k.luaChon.map((c) => (
                                      <SelectItem key={c} value={c}>
                                        {c}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
            </TableBody>
          ))}
        </Table>
      </TableWrap>
      <p role="status" className={maTranLuu}>
        {bao}
      </p>
    </div>
  )
}
