import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { BoLocChon, OTimKiem, ThanhDangLoc, boDau } from '@/bang'
import { saoKeCuaKy, type SaoKeRow, type TongTaiKhoan } from '../actions'
import { danhSachMa } from '../../actions'
import { soSanhTaiKhoanVaThoiGian } from '@/lib/ke-toan/xuat/excel-thu-chi'
import { FormUploadSaoKe } from './FormUploadSaoKe'
import { DongSaoKe } from './DongSaoKe'

export const dynamic = 'force-dynamic'
type ThamSo = { q?: string; tk?: string; chieu?: string; khop?: string }

const TK_OPTS = [{ giaTri: 'VCB21', nhan: 'VCB21' }, { giaTri: 'VCB63', nhan: 'VCB63' }, { giaTri: 'TCB', nhan: 'TCB' }]
const CHIEU_OPTS = [{ giaTri: 'thu', nhan: 'Thu' }, { giaTri: 'chi', nhan: 'Chi' }]
const KHOP_OPTS = [
  { giaTri: 'chac', nhan: 'Khớp chắc' }, { giaTri: 'goi_y', nhan: 'Có gợi ý' }, { giaTri: 'chua', nhan: 'Chưa khớp' },
  { giaTri: 'khong', nhan: 'Không có HĐ' }, { giaTri: 'tay', nhan: 'Đã chốt tay' },
]

// match_conf='tay' xét TRƯỚC match_kind==='none': RPC set 'tay' trên MỌI lần chốt tay, kể cả
// chốt "Không có HĐ" hay sửa mã/ghi chú một dòng NOI_BO/LAI_NH (match_kind vẫn 'none') — xét
// 'none' trước sẽ làm những dòng đó không bao giờ lọt vào bộ lọc "Đã chốt tay" (review 16/09/2026).
function khopCuaDong(d: SaoKeRow): 'chac' | 'goi_y' | 'chua' | 'khong' | 'tay' {
  if (d.match_conf === 'tay') return 'tay'
  if (d.match_kind === 'none') return 'khong'
  if (d.match_conf === 'chac') return 'chac'
  if (d.match_conf === 'goi_y') return 'goi_y'
  return 'chua'
}

/** Màu cảnh báo: chắc → không tô; gợi ý → hổ phách nhạt; đang chờ & chưa có mã → hổ phách đậm hơn.
 *  edited_at (đã chốt tay) cộng thêm viền trái xanh — kết hợp được với hai loại tô trên. */
function mauDong(d: SaoKeRow): string {
  const mau = d.match_conf === 'chac' ? '' : d.match_conf === 'goi_y' ? 'bg-amber-50' : (d.match_kind === 'pending' && !d.code) ? 'bg-amber-100' : ''
  const bien = d.edited_at ? 'border-l-4 border-[#3f8a6a]' : ''
  return [mau, bien].filter(Boolean).join(' ')
}

/** VCB: header sao kê không có tổng nợ/có gốc (`sao-ke/actions.ts` tự lấy tổng bóc được làm header
 *  lúc upload) — nên "/ header" sẽ luôn khớp, tô "Σ / header" thừa; chỉ TCB mới có header thật để
 *  đối chiếu lệch. */
function TheTong({ t }: { t: TongTaiKhoan }) {
  return (
    <div className="min-w-[220px] flex-1 space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
      <div className="text-sm font-semibold">{t.taiKhoan}</div>
      <div className="text-slate-500">{t.fileName ?? 'chưa upload'}</div>
      <div>Số dư: {t.soDuDau?.toLocaleString('vi-VN') ?? '—'} → {t.soDuCuoi?.toLocaleString('vi-VN') ?? '—'}</div>
      {t.taiKhoan === 'TCB' ? (
        <>
          <div>Nợ: <span className={t.tongNo !== t.tongNoHeader ? 'font-medium text-red-600' : ''}>{t.tongNo.toLocaleString('vi-VN')} / {t.tongNoHeader?.toLocaleString('vi-VN') ?? '—'}</span></div>
          <div>Có: <span className={t.tongCo !== t.tongCoHeader ? 'font-medium text-red-600' : ''}>{t.tongCo.toLocaleString('vi-VN')} / {t.tongCoHeader?.toLocaleString('vi-VN') ?? '—'}</span></div>
        </>
      ) : (
        <>
          <div>Nợ Σ: {t.tongNo.toLocaleString('vi-VN')}</div>
          <div>Có Σ: {t.tongCo.toLocaleString('vi-VN')}</div>
        </>
      )}
    </div>
  )
}

export default async function SaoKeKyPage({ params, searchParams }: { params: Promise<{ ky: string }>; searchParams: Promise<ThamSo> }) {
  const { ky } = await params
  const { q = '', tk, chieu, khop } = await searchParams
  const { period, dong, tong, hoaDon } = await saoKeCuaKy(ky) // gác quyền trong action (chanKeToan → redirect)
  if (!period) redirect('/ke-toan')
  const maTatCa = await danhSachMa()
  const maChi = [
    ...maTatCa.filter((m) => m.gt.startsWith('cp.') || m.gt === 'DVVC'),
    { gt: 'NOI_BO', nhan: 'Chuyển tiền nội bộ' },
    { gt: 'HANG_HOA', nhan: 'HÀNG HOÁ' },
  ]

  const hoaDonMap = new Map(hoaDon.map((h) => [h.id, h]))
  const qd = boDau(q)
  // Sắp theo ngày → tài khoản → thời gian giao dịch thật trong TK (cùng quy tắc `soSanhTaiKhoanVaThoiGian`
  // dùng khi xuất Excel thu chi) — để TCB (row_order giảm = mới nhất trước) hiện cùng chiều thời gian với VCB.
  const rows = dong
    .filter((d) =>
      (!tk || d.account === tk) &&
      (!chieu || d.direction === chieu) &&
      (!khop || khopCuaDong(d) === khop) &&
      (!qd || boDau(`${d.description ?? ''} ${d.counter_name ?? ''} ${d.match_id != null ? (hoaDonMap.get(d.match_id)?.soHd ?? '') : ''}`).includes(qd))
    )
    .sort((a, b) => (a.txn_date !== b.txn_date ? a.txn_date.localeCompare(b.txn_date) : soSanhTaiKhoanVaThoiGian(a.account, a.row_order, b.account, b.row_order)))
  const dieuKien = [
    q ? { nhan: 'Tìm', giaTri: q } : null,
    tk ? { nhan: 'TK', giaTri: TK_OPTS.find((o) => o.giaTri === tk)?.nhan ?? tk } : null,
    chieu ? { nhan: 'Chiều', giaTri: CHIEU_OPTS.find((o) => o.giaTri === chieu)?.nhan ?? chieu } : null,
    khop ? { nhan: 'Khớp', giaTri: KHOP_OPTS.find((o) => o.giaTri === khop)?.nhan ?? khop } : null,
  ].filter(Boolean) as { nhan: string; giaTri: string }[]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1400px] space-y-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><Link href="/ke-toan" className="text-sm text-slate-500">← Kỳ</Link>
            <h1 className="text-xl font-semibold">Sao kê {period.ky}</h1></div>
          <div className="flex items-center gap-2">
            <Link href={`/ke-toan/hoa-don/${period.ky}`} className="text-sm text-slate-500">← Hoá đơn</Link>
            <a href={`/ke-toan/sao-ke/${period.ky}/xuat`} className="rounded border border-[#3f8a6a] px-3 py-1 text-[#3f8a6a]">Tải Excel thu chi</a>
          </div>
        </header>
        <FormUploadSaoKe ky={period.ky} />
        <div className="flex flex-wrap gap-3">
          {tong.map((t) => <TheTong key={t.taiKhoan} t={t} />)}
        </div>
        <Suspense fallback={<div className="h-16" />}>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <OTimKiem placeholder="Tìm nội dung / tên đối ứng / số HĐ khớp…" />
            <BoLocChon param="tk" nhan="Tài khoản" tuyChon={TK_OPTS} />
            <BoLocChon param="chieu" nhan="Chiều" tuyChon={CHIEU_OPTS} />
            <BoLocChon param="khop" nhan="Khớp" tuyChon={KHOP_OPTS} />
          </div>
        </Suspense>
        <ThanhDangLoc dieuKien={dieuKien} hienThi={rows.length} tong={dong.length} nhan="dòng" />
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-left"><tr>
              <th className="p-2">#</th><th className="p-2">TK</th><th className="p-2">Ngày</th><th className="p-2">Nội dung</th>
              <th className="p-2 text-right">Nợ</th><th className="p-2 text-right">Có</th><th className="p-2">Khớp HĐ</th>
              <th className="p-2">Mã</th><th className="p-2">Đối tượng</th><th className="p-2">Ghi chú</th><th className="p-2">Căn cứ</th>
            </tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={11} className="p-4 text-center text-slate-500">Chưa có dòng nào khớp bộ lọc.</td></tr> : null}
              {rows.map((d) => (
                <tr key={d.id} className={`border-t ${mauDong(d)}`}>
                  <td className="p-2 text-slate-400">{d.row_order}</td>
                  <td className="p-2">{d.account}</td>
                  <td className="p-2 whitespace-nowrap">{d.txn_date}</td>
                  <td className="p-2 max-w-[280px] truncate" title={d.description ?? ''}>
                    {d.description}
                    {d.counter_name ? <div className="truncate text-[11px] text-slate-400">{d.counter_name}</div> : null}
                  </td>
                  <td className="p-2 text-right tabular-nums">{d.debit ? d.debit.toLocaleString('vi-VN') : ''}</td>
                  <td className="p-2 text-right tabular-nums">{d.credit ? d.credit.toLocaleString('vi-VN') : ''}</td>
                  <DongSaoKe d={d} hoaDon={hoaDon} ma={maChi} ky={period.ky} />
                  <td className="p-2 min-w-[220px] max-w-[360px] text-slate-500">{d.engine_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
