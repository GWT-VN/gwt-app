import { NextResponse } from 'next/server'
import { saoKeCuaKy } from '../../actions'
import { dungExcelThuChi, type DongThuChi } from '@/lib/ke-toan/xuat/excel-thu-chi'
import type { TaiKhoan } from '@/lib/ke-toan/sao-ke/kieu'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// saoKeCuaKy() tự gác chanKeToan() (redirect nếu không có quyền). Kỳ chưa có/chưa có dòng sao kê
// nào thì quay về màn kỳ với ?loi= để hiện banner, không trả file rỗng.
export async function GET(req: Request, ctx: { params: Promise<{ ky: string }> }) {
  const { ky } = await ctx.params
  const veManKy = (loi: string) => NextResponse.redirect(new URL(`/ke-toan/sao-ke/${encodeURIComponent(ky)}?loi=${encodeURIComponent(loi)}`, req.url))
  const { dong, tong, hoaDon } = await saoKeCuaKy(ky)
  if (dong.length === 0) return veManKy('Chưa có sao kê')

  const soDuDau = Object.fromEntries(tong.map((t) => [t.taiKhoan, t.soDuDau])) as Record<TaiKhoan, number | null>
  const dongThuChi: DongThuChi[] = dong.map((d) => ({
    taiKhoan: d.account,
    rowOrder: d.row_order,
    ngay: d.txn_date,
    noiDung: d.description ?? '',
    no: d.debit,
    co: d.credit,
    soDu: d.balance,
    code: d.code,
    codeName: d.code_name,
    partyCode: d.party_code,
    hasInvoice: !!d.has_invoice,
    thueHoaDon: hoaDon.find((h) => h.id === d.match_id)?.thue ?? 0,
    note: d.note,
  }))

  const buf = await dungExcelThuChi({ ky, dong: dongThuChi, soDuDau })
  const [y, m] = ky.split('-')
  const ten = `Báo cáo thu chi - ${m}.${y}.xlsx`
  return new NextResponse(new Blob([buf as BlobPart]), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Bao cao thu chi - ${m}.${y}.xlsx"; filename*=UTF-8''${encodeURIComponent(ten)}`,
      'Cache-Control': 'no-store',
    },
  })
}
