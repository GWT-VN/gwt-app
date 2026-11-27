'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { thGhim } from '@/components/ui/table-styles'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

import { Fragment, useRef, useState, useTransition } from 'react'
import { datLaiVaiTro, datQuyen } from '@/lib/nen-tang/ma-tran'
import {
  HO_SO_QUYEN, NHAN_NHOM, QUYEN, type MaQuyen, type NhomQuyen,
} from '@/lib/nen-tang/quyen'
import { HO_SO_VAI_TRO, NHAN_BO_PHAN, NHAN_VAI_TRO, VAI_TRO, type VaiTro } from '@/lib/nen-tang/vai-tro'

/** Nhiều quyền (45) nhưng ít vai trò (13) -> quyền làm DÒNG, vai trò làm CỘT. */
const NHOM_QUYEN: { nhom: NhomQuyen; ds: MaQuyen[] }[] = []
for (const q of QUYEN) {
  const n = HO_SO_QUYEN[q].nhom
  const cuoi = NHOM_QUYEN[NHOM_QUYEN.length - 1]
  if (cuoi && cuoi.nhom === n) cuoi.ds.push(q)
  else NHOM_QUYEN.push({ nhom: n, ds: [q] })
}

const TEN_COT: Record<VaiTro, string> = {
  ceo: 'CEO', admin: 'Toàn quyền', quan_tri_ht: 'QT Hệ thống',
  kt_giam_doc: 'GĐ KT', ky_thuat: 'NV KT', ctv_lap_dat: 'CTV',
  cs_manager: 'Trưởng CS', cs: 'NV CS', sua_ds_nguoi: 'Sửa DS người',
  sales_manager: 'Trưởng SL', sales: 'NV SL',
  marketing: 'MKT', kho: 'Kho', ke_toan: 'Kế toán', tai_chinh: 'Tài chính',
}

/** Ma trận quyền × vai trò — chỉ kiểu ô Table DS (không thanh công cụ): cột "Được làm gì" dính trái khi kéo ngang. */

export function MaTranQuyen({ maTran }: { maTran: Record<string, MaQuyen[]> }) {
  const [ghiDe, setGhiDe] = useState<Record<string, boolean>>({})
  const [loi, setLoi] = useState<string | null>(null)
  const luot = useRef<Record<string, number>>({})
  const [, batDau] = useTransition()

  const khoa = (v: VaiTro, q: MaQuyen) => `${v}|${q}`
  const coQuyen = (v: VaiTro, q: MaQuyen) =>
    v === 'admin' ? true : (ghiDe[khoa(v, q)] ?? (maTran[v] ?? []).includes(q))

  function tick(v: VaiTro, q: MaQuyen) {
    if (v === 'admin') return
    const k = khoa(v, q)
    const bat = !coQuyen(v, q)
    const cuaToi = (luot.current[k] ?? 0) + 1
    luot.current[k] = cuaToi

    setGhiDe((g) => ({ ...g, [k]: bat }))
    setLoi(null)
    batDau(async () => {
      const r = await datQuyen(v, q, bat)
      if (luot.current[k] !== cuaToi) return
      if (!r.ok) setLoi(r.error ?? 'Không lưu được.')
      setGhiDe((g) => Object.fromEntries(Object.entries(g).filter(([x]) => x !== k)))
    })
  }

  function datLai(v: VaiTro) {
    setLoi(null)
    batDau(async () => {
      const r = await datLaiVaiTro(v)
      if (!r.ok) setLoi(r.error ?? 'Không đặt lại được.')
      else setGhiDe({})
    })
  }

  return (
    <div className="space-y-2">
      {loi && <Alert color="danger"><AlertDescription>{loi}</AlertDescription></Alert>}

      <TableWrap vien tabIndex={0} role="region" aria-label="Vùng cuộn ma trận quyền">
        <Table variant="thuong" aria-label="Ma trận quyền">
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className={cn(thGhim, 'z-2')}>
                Được làm gì
              </TableHead>
              {VAI_TRO.map((v) => (
                <TableHead
                  key={v}
                  scope="col"
                  title={`${NHAN_VAI_TRO[v]} · ${NHAN_BO_PHAN[HO_SO_VAI_TRO[v].boPhan]}`}
                  className="text-center"
                >
                  {TEN_COT[v]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {NHOM_QUYEN.map(({ nhom, ds }) => (
              <Fragment key={nhom}>
                  <TableRow>
                    <TableCell ghim className="text-xs font-semibold text-muted-foreground">
                      {NHAN_NHOM[nhom]}
                    </TableCell>
                    <TableCell colSpan={VAI_TRO.length} />
                  </TableRow>
                  {ds.map((q) => (
                    <TableRow key={q}>
                      <TableCell ghim className="h-auto py-2">
                        <div className="text-foreground">{HO_SO_QUYEN[q].nhan}</div>
                        <div className="font-mono text-xs text-muted-foreground">{q}</div>
                      </TableCell>
                      {VAI_TRO.map((v) =>
                        // Cột Quản trị: vẽ dấu tích đặc thay vì ô khoá. Ô checkbox bị
                        // disabled render mờ tới mức đọc nhầm thành "không có quyền".
                        v === 'admin' ? (
                          <TableCell
                            key={v}
                            title="Quản trị hệ thống luôn có toàn quyền"
                            className="text-center text-muted-foreground"
                          >
                            ✓
                          </TableCell>
                        ) : (
                          <TableCell key={v} className="text-center">
                            <Checkbox
                              aria-label={`${NHAN_VAI_TRO[v]} — ${HO_SO_QUYEN[q].nhan}`}
                              checked={coQuyen(v, q)}
                              onCheckedChange={() => tick(v, q)}
                            />
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))}
              </Fragment>
            ))}

            <TableRow>
              <TableCell ghim className="text-xs text-muted-foreground">
                Trả vai trò về mặc định
              </TableCell>
              {VAI_TRO.map((v) => (
                <TableCell key={v} className="text-center">
                  <Button variant="ghost" size="sm"
                    type="button"
                    disabled={v === 'admin'}
                    onClick={() => datLai(v)}
                  >
                    đặt lại
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableWrap>
    </div>
  )
}
