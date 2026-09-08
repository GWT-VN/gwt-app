import { NextResponse } from 'next/server'
import { dongCuaKy, taiNguonNexiaMoiNhat } from '../../../actions'
import { dienExcelHoaDon, dungExcelHoaDon, type DongXuat } from '@/lib/ke-toan/xuat/excel-hoa-don'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// dongCuaKy()/taiNguonNexiaMoiNhat() tự gác chanKeToan() (redirect nếu không có quyền) — không nhận
// email từ client. Lỗi nghiệp vụ không trả JSON thô mà quay về màn kỳ với ?loi= để hiện banner.
export async function GET(req: Request, ctx: { params: Promise<{ ky: string }> }) {
  const { ky } = await ctx.params
  const veManKy = (loi: string) => NextResponse.redirect(new URL(`/ke-toan/hoa-don/${encodeURIComponent(ky)}?loi=${encodeURIComponent(loi)}`, req.url))
  const [vao, ra] = await Promise.all([dongCuaKy(ky, 'vao'), dongCuaKy(ky, 'ra')])
  if (!vao.period) return NextResponse.redirect(new URL('/ke-toan', req.url))

  // Đường chính: điền vào file NEXIA gốc (giữ nguyên định dạng kế toán quen). Dự phòng: dựng từ đầu
  // khi file gốc không còn trên Storage. Lệch dòng file ↔ DB thì BÁO LỖI, không âm thầm rơi về dự phòng.
  const nguon = await taiNguonNexiaMoiNhat(vao.period.id)
  // Nguồn NEXIA gốc của kỳ: file đang điền (mới nhất) — cùng quy ước cho tuHdct và cho ánh xạ dòng.
  // Không có file → lấy nguồn đầu tiên trong dữ liệu (đường dự phòng).
  const nexiaId = nguon?.id ?? (vao.dong.length ? Math.min(...vao.dong.map((d) => d.first_source_id ?? Number.MAX_SAFE_INTEGER)) : null)

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
        tuHdct: nexiaId != null && d.first_source_id != null && d.first_source_id !== nexiaId,
      }))
  const dsVao = toXuat(vao.dong)
  const dsRa = toXuat(ra.dong)

  let buf: Uint8Array
  if (nguon) {
    try {
      buf = await dienExcelHoaDon({ goc: nguon.goc, vao: dsVao, ra: dsRa })
    } catch (e) {
      return veManKy((e as Error).message)
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
