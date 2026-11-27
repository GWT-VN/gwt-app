import { Alert, AlertDescription } from '@/components/ui/alert'
import { Suspense } from 'react'
import { listTabView } from '@/app/actions'
import { docTatCa } from '@/bang/locTruong'
import { BangDungSan } from '@/components/BangDungSan'
import type { CotBang } from '@/components/ui/use-cot-bang'
import { daCauHinhKho, kho, MOI_TRANG } from '@/lib/kho/doc'
import { LOAI, mauLoai } from '@/lib/kho/nhan'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { chanKho, coTheSuaKho } from '../_gac'
import { KhuSuaKho, NutSuaDong } from '../_sua'
import { GhiChuKho, KhungBangKho, KhungKho, LinkMa, LinkTin, LoiKho, NhanSuaTay, NutDauKho, TrangThai, khoTu, ngayVN, sl, thu } from '../_ui'
import { khoangNgay, motGiaTri, TAB_NHAT_KY, TRANG_THAI_SO, TRUONG_NHAT_KY } from '../truong-kho'

export const metadata = { title: 'Nhật ký kho · GWT Kho' }
export const dynamic = 'force-dynamic'

const COT: CotBang[] = [
  { id: 'ngay', ten: 'Ngày', kieu: 'thuong', khoa: true },
  { id: 'loai', ten: 'Loại', kieu: 'thuong' },
  { id: 'ma', ten: 'Mã', kieu: 'thuong', rongToiDa: 240 },
  { id: 'raw_name', ten: 'Tên ghi trong tin', kieu: 'thuong', rongToiDa: 280 },
  { id: 'qty', ten: 'SL', kieu: 'thuong', phai: true },
  { id: 'purpose', ten: 'Lý do / cho ai', kieu: 'thuong', rongToiDa: 220 },
  { id: 'note', ten: 'Ghi chú', kieu: 'thuong', rongToiDa: 220 },
  { id: 'keeper', ten: 'Người nhắn', kieu: 'thuong' },
  { id: 'trang_thai', ten: 'Trạng thái', kieu: 'thuong' },
  { id: 'tin', ten: 'Tin Discord', kieu: 'thuong' },
]
const COT_SUA: CotBang = { id: 'sua', ten: 'Sửa', kieu: 'thuong', batBuoc: true }
const KHONG_HO_TRO = {
  tieuDe: 'Sổ kho chỉ lọc được một giá trị mỗi trường',
  moTa: 'Chọn đúng một Loại / một Trạng thái (hoặc dùng tab), rồi lọc lại.',
}

export default async function KhoNhatKyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await chanKho()
  const sp = await searchParams
  const k = khoTu(sp.kho)
  if (!daCauHinhKho()) return <KhungKho tieuDe="Nhật ký nhập / xuất" kho={k}><LoiKho /></KhungKho>
  const trang = Math.max(1, Number(sp.trang) || 1)
  const dk = docTatCa(sp, TRUONG_NHAT_KY)
  const theo = (id: string) => dk.find((d) => d.truong === id)
  // RPC wh_app_nhat_ky lọc ở DB nhưng mỗi trường MỘT giá trị (truong-kho `motGiaTri`).
  const loai = motGiaTri(theo('loai'), LOAI)
  const tt = motGiaTri(theo('tt'), TRANG_THAI_SO.map((x) => x.giaTri))
  const ngay = khoangNgay(theo('ngay'))
  const khongLoc = loai === 'nhieu' || tt === 'nhieu'
  const gt = (x: typeof loai) => (typeof x === 'object' ? x.gt : undefined)
  const n = ngay === 'rong' ? {} as { tu?: string; den?: string } : ngay
  const rong = khongLoc || loai === 'rong' || tt === 'rong' || ngay === 'rong'
  const sua = await coTheSuaKho()
  const [r, dm, tabRieng, quyen] = await Promise.all([
    rong ? ({ ok: true, v: { tong: 0, dong: [] } } as const)
      : thu(() => kho().nhatKy({
        kho: k, tuKhoa: sp.q, loai: gt(loai), trangThai: gt(tt), tuNgay: n.tu, denNgay: n.den, trang,
      })),
    sua ? thu(() => kho().danhMuc()) : null,
    listTabView('kho_nhat_ky_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])
  if (!r.ok) return <KhungKho tieuDe="Nhật ký nhập / xuất" kho={k}><LoiKho loi={r.loi} /></KhungKho>
  const { tong, dong } = r.v
  const danhMuc = dm?.ok ? dm.v : []

  return (
    <KhungBangKho>
      <KhuSuaKho danhMuc={danhMuc}>
        <Suspense>
          <BangDungSan
            tieuDe="Nhật ký nhập / xuất"
            nhan="dòng sổ"
            bang="kho_nhat_ky_tab"
            tabCoDinh={TAB_NHAT_KY}
            tabRieng={tabRieng}
            quyenTabChung={quyen.viewChung}
            viDuTen="VD: Xuất tháng này"
            khu="Kho"
            timKiem="Tìm tên trong tin / mã / tên hàng…"
            truong={TRUONG_NHAT_KY.map((x) => ({
              ...x,
              tuyChon: x.id === 'loai' ? LOAI.map((g) => ({ giaTri: g, nhan: g })) : x.id === 'tt' ? TRANG_THAI_SO : undefined,
            }))}
            cot={sua ? [...COT, COT_SUA] : COT}
            dienThoai={{ tren: 'ma', duoi: 'ngay', duoiPhai: 'qty' }}
            tong={tong}
            trang={trang}
            soTrang={Math.max(1, Math.ceil(tong / MOI_TRANG))}
            nutChinh={<NutDauKho kho={k} />}
            rong={khongLoc ? KHONG_HO_TRO : undefined}
            dong={dong.map((d) => ({
              khoa: String(d.id),
              o: {
                ngay: ngayVN(d.ngay),
                loai: <span className={`font-medium ${mauLoai(d.loai)}`}>{d.loai}</span>,
                ma: <><LinkMa ma={d.internal_code} kho={k} />{d.ten && <div className="text-xs text-muted-foreground">{d.ten}</div>}</>,
                raw_name: d.raw_name,
                qty: <span className="font-semibold">{sl(d.qty)}</span>,
                purpose: <span className="text-muted-foreground">{d.purpose ?? ''}</span>,
                note: <span className="text-xs text-muted-foreground">{d.note ?? ''}</span>,
                keeper: d.keeper ?? '',
                trang_thai: <><TrangThai ma={d.trang_thai} /><NhanSuaTay luc={d.sua_tay_luc} boi={d.sua_tay_boi} /></>,
                tin: <LinkTin id={d.discord_msg_id} />,
                sua: sua && <NutSuaDong dong={{ id: d.id, ngay: d.ngay, loai: d.loai, internal_code: d.internal_code, raw_name: d.raw_name, qty: d.qty,
                  purpose: d.purpose, note: d.note, trang_thai: d.trang_thai }} />,
              },
            }))}
            ghiChu={
              <>
                {dm && !dm.ok && <Alert color="warning"><AlertDescription>Chưa tải được danh mục mã ({dm.loi}) — ô chọn mã khi sửa sẽ trống.</AlertDescription></Alert>}
                <GhiChuKho moTa={'Mới nhất trước · "Điều chỉnh" = chênh lệch sau kiểm kê'} />
              </>
            }
          />
        </Suspense>
      </KhuSuaKho>
    </KhungBangKho>
  )
}
