import { NextResponse } from 'next/server'
import { dongCuaKy } from '../../../actions'
import { dungExcelHoaDon, type DongXuat } from '@/lib/ke-toan/xuat/excel-hoa-don'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// dongCuaKy() tự gác chanKeToan() (redirect nếu không có quyền) — không nhận email từ client.
export async function GET(_req: Request, ctx: { params: Promise<{ ky: string }> }) {
  const { ky } = await ctx.params
  const [vao, ra] = await Promise.all([dongCuaKy(ky, 'vao'), dongCuaKy(ky, 'ra')])
  if (!vao.period) return NextResponse.json({ error: 'Không có kỳ' }, { status: 404 })

  const toXuat = (rows: typeof vao.dong, firstSourceNexia: number | null): DongXuat[] =>
    rows.map((d) => ({
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
  const buf = await dungExcelHoaDon({
    headersVao: vao.headers,
    vao: toXuat(vao.dong, nguonNexia),
    headersRa: ra.headers,
    ra: toXuat(ra.dong, nguonNexia),
  })

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
