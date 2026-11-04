/**
 * Tóm tắt khu Kho cho CEO / người không dùng sổ hằng ngày — vài câu bằng lời + số nhập/xuất 7 ngày + hàng xuất nhiều nhất 30 ngày.
 * Cùng cách tính với tab "📊 Tóm tắt" trên Google Sheet (gwt-discord-bot admin/kho/nx-sheet.mjs tomTatKho). Thuần → test.
 */
import type { DongSo, DongTon } from './doc'

/** Đã chốt tồn đầu kỳ (kiểm kê lại kho) chưa — chưa thì số tồn chỉ để xem xu hướng. Chốt xong đổi thành true (khớp kenh/kho-nx.json da_chot_dau_ky). */
export const DA_CHOT_DAU_KY: Record<string, boolean> = { NX: false, HCM: false }

export type TomTatKho = {
  cau: string[]; canhBao: string | null
  nhap7: { lan: number; sl: number }; xuat7: { lan: number; sl: number }; topXuat30: { ten: string; sl: number }[]
}

const ngayIso = (d: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d)
/** Ngày (YYYY-MM-DD, giờ VN) cách hôm nay `n` ngày — gọi ngoài thân component (luật react-hooks/purity). */
export const ngayLuiVN = (n: number, tu = new Date()) => ngayIso(new Date(tu.getTime() - n * 864e5))

export function tomTatKho({ ton, nhatKy, choDuyet, homNay = new Date(), daChot = false, tenKho = 'Kho Nguyễn Xiển' }:
  { ton: DongTon[]; nhatKy: DongSo[]; choDuyet: number; homNay?: Date; daChot?: boolean; tenKho?: string }): TomTatKho {
  const hn = ngayIso(homNay), lui = (n: number) => ngayIso(new Date(homNay.getTime() - n * 864e5))
  const trong = (d: DongSo, n: number) => d.ngay.slice(0, 10) >= lui(n) && d.ngay.slice(0, 10) <= hn
  const daVao = nhatKy.filter((d) => d.trang_thai === 'approved')
  const dem = (l: DongSo[]) => ({ lan: l.length, sl: l.reduce((a, d) => a + Math.abs(d.qty), 0) })
  const nhap7 = dem(daVao.filter((d) => d.loai === 'Nhập' && trong(d, 7))), xuat7 = dem(daVao.filter((d) => d.loai === 'Xuất' && trong(d, 7)))
  const gom = new Map<string, { ten: string; sl: number }>()
  for (const d of daVao.filter((x) => x.loai === 'Xuất' && trong(x, 30))) {
    const k = d.internal_code ?? d.raw_name, o = gom.get(k) ?? { ten: d.ten ?? d.raw_name, sl: 0 }
    o.sl += d.qty; gom.set(k, o)
  }
  const topXuat30 = [...gom.values()].sort((a, b) => b.sl - a.sl).slice(0, 3)
  const coTon = ton.filter((d) => d.ton > 0).length, sapHet = ton.filter((d) => d.canh_bao === 'sap_het').length, am = ton.filter((d) => d.canh_bao === 'am').length
  const cau = [
    `${tenKho} hiện có ${coTon} mã hàng còn tồn.`,
    `7 ngày qua: nhập ${nhap7.lan} lần, xuất ${xuat7.lan} lần${topXuat30.length ? `; hàng xuất nhiều nhất tháng này là ${topXuat30[0].ten}` : ''}.`,
    sapHet ? `Có ${sapHet} mã xuống dưới mức tối thiểu, cần lên kế hoạch nhập thêm.` : 'Chưa có mã nào xuống dưới mức tối thiểu.',
    ...(am ? [`${am} mã đang âm trên sổ — cần kiểm kê để sửa số.`] : []),
    ...(choDuyet ? [`${choDuyet} dòng nhập/xuất đang chờ xác nhận mã hàng (chưa tính vào tồn).`] : []),
  ]
  return { cau, nhap7, xuat7, topXuat30,
    canhBao: daChot ? null : 'Số tồn CHƯA CHỐT ĐẦU KỲ (chưa kiểm kê lại kho): các con số chỉ phản ánh nhập/xuất bot ghi được, chưa phải tồn thực tế — dùng để theo dõi xu hướng, chưa dùng để quyết định mua hàng.' }
}
