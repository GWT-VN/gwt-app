import { NextResponse } from 'next/server'
import { dongCuaKy, nguonNexiaMoiNhat, taiFileNguon } from '../../../actions'
import { dienExcelHoaDon, dungExcelHoaDon, type DongXuat } from '@/lib/ke-toan/xuat/excel-hoa-don'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// dongCuaKy()/nguonNexiaMoiNhat()/taiFileNguon() tự gác chanKeToan() (redirect nếu không có quyền) —
// không nhận email từ client.
export async function GET(_req: Request, ctx: { params: Promise<{ ky: string }> }) {
  const { ky } = await ctx.params
  const [vao, ra] = await Promise.all([dongCuaKy(ky, 'vao'), dongCuaKy(ky, 'ra')])
  if (!vao.period) return NextResponse.json({ error: 'Không có kỳ' }, { status: 404 })

  const toXuat = (rows: typeof vao.dong, firstSourceNexia: number | null): DongXuat[] =>
    rows.map((d) => ({
      rowOrder: d.row_order,
      soHd: d.so_hd,
      raw: d.raw,
      code: d.code,
      codeName: d.code_name,
      tkNo: d.tk_no,
      tkCo: d.tk_co,
      vat1331: d.vat_1331,
      note: d.note_for_accountant,
      engineConf: d.engine_conf,
      engineKind: d.engine_kind,
      tuHdct: firstSourceNexia != null && d.first_source_id != null && d.first_source_id !== firstSourceNexia,
    }))

  const nguonNexia = vao.dong.length ? Math.min(...vao.dong.map((d) => d.first_source_id ?? Number.MAX_SAFE_INTEGER)) : null
  const dsVao = toXuat(vao.dong, nguonNexia)
  const dsRa = toXuat(ra.dong, nguonNexia)

  // Đường chính: điền vào file NEXIA gốc (giữ nguyên định dạng kế toán quen). Dự phòng: dựng từ đầu
  // khi file gốc không còn trên Storage. Lệch dòng file ↔ DB thì TRẢ LỖI, không âm thầm rơi về dự phòng.
  let buf: Uint8Array
  const nguon = await nguonNexiaMoiNhat(vao.period.id)
  const goc = nguon?.storage_path ? await taiFileNguon(nguon.storage_path) : null
  if (goc) {
    try {
      buf = await dienExcelHoaDon({ goc, vao: dsVao, ra: dsRa })
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 409 })
    }
  } else {
    buf = await dungExcelHoaDon({ headersVao: vao.headers, vao: dsVao, headersRa: ra.headers, ra: dsRa })
  }

  const [y, m] = ky.split('-')
  const ten = `${m}.${y} - GWT - NEXIA_DAXULY.xlsx`
  return new NextResponse(new Blob([buf as BlobPart]), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="NEXIA_DAXULY_${m}-${y}.xlsx"; filename*=UTF-8''${encodeURIComponent(ten)}`,
      'Cache-Control': 'no-store',
    },
  })
}
