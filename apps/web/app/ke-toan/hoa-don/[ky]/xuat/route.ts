import { NextResponse } from 'next/server'
import { dongCuaKy, taiNguonNexiaMoiNhat } from '../../../actions'
import { dienExcelHoaDon, type DongXuat } from '@/lib/ke-toan/xuat/excel-hoa-don'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// dongCuaKy()/taiNguonNexiaMoiNhat() tự gác chanKeToan() (redirect nếu không có quyền) — không nhận
// email từ client. Lỗi nghiệp vụ không trả JSON thô mà quay về màn kỳ với ?loi= để hiện banner.
export async function GET(req: Request, ctx: { params: Promise<{ ky: string }> }) {
  const { ky } = await ctx.params
  const veManKy = (loi: string) => NextResponse.redirect(new URL(`/ke-toan/hoa-don/${encodeURIComponent(ky)}?loi=${encodeURIComponent(loi)}`, req.url))
  const [vao, ra] = await Promise.all([dongCuaKy(ky, 'vao'), dongCuaKy(ky, 'ra')])
  if (!vao.period) return NextResponse.redirect(new URL('/ke-toan', req.url))

  // Điền vào file NEXIA gốc (giữ nguyên định dạng kế toán quen). File gốc không còn trên Storage hay
  // lệch dòng file ↔ DB → BÁO LỖI về màn kỳ, không dựng file khác.
  const nguon = await taiNguonNexiaMoiNhat(vao.period.id)
  if (!nguon) return veManKy('Kỳ chưa có file NEXIA gốc trên Storage — upload file NEXIA rồi xuất.')

  const toXuat = (rows: typeof vao.dong): DongXuat[] =>
    rows
      .filter((d) => !d.missing_in_last_upload) // dòng không còn trong file mới nhất → không gửi kế toán
      .map((d) => ({
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
        customerCode: d.customer_code,
        productGroup: d.product_group,
        channelL1: d.channel_l1,
        channelL2: d.channel_l2,
        dealerName: d.dealer_name,
        // Task 10 R14: first_source_kind null/'nexia' → nexia; 'hdtq_*' → hdtq; còn lại (hdct_*) → hdct.
        nguon: d.first_source_kind == null || d.first_source_kind === 'nexia' ? 'nexia' : d.first_source_kind.startsWith('hdtq') ? 'hdtq' : 'hdct',
      }))

  let buf: Uint8Array
  try {
    buf = await dienExcelHoaDon({ goc: nguon.goc, vao: toXuat(vao.dong), ra: toXuat(ra.dong) })
  } catch (e) {
    return veManKy((e as Error).message)
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
