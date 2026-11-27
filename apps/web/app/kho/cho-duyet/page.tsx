import { Alert, AlertDescription } from '@/components/ui/alert'
import { Suspense } from 'react'
import { listTabView } from '@/app/actions'
import { boDau } from '@/bang'
import { apLoc, docTatCa, type TruongDuLieu } from '@/bang/locTruong'
import { BangDungSan } from '@/components/BangDungSan'
import type { CotBang } from '@/components/ui/use-cot-bang'
import { daCauHinhKho, kho, type DongChoDuyet } from '@/lib/kho/doc'
import { LOAI, mauLoai } from '@/lib/kho/nhan'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { chanKho, coTheSuaKho } from '../_gac'
import { DuyetDong, KhuSuaKho } from '../_sua'
import { GhiChuKho, KhungBangKho, KhungKho, LINK_SHEET_KHO, LinkTin, LoiKho, NutDauKho, khoTu, ngayVN, sl, thu } from '../_ui'
import { TAB_CHO_DUYET, TRUONG_CHO_DUYET } from '../truong-kho'

export const metadata = { title: 'Chờ duyệt mã · GWT Kho' }
export const dynamic = 'force-dynamic'

const COT: CotBang[] = [
  { id: 'ngay', ten: 'Ngày', kieu: 'thuong', khoa: true },
  { id: 'loai', ten: 'Loại', kieu: 'thuong' },
  { id: 'raw_name', ten: 'Tên ghi trong tin', kieu: 'thuong', rongToiDa: 280 },
  { id: 'qty', ten: 'SL', kieu: 'thuong', phai: true },
  { id: 'purpose', ten: 'Lý do / cho ai', kieu: 'thuong', rongToiDa: 220 },
  { id: 'goi_y', ten: 'Bot gợi ý mã', kieu: 'thuong', rongToiDa: 240 },
  { id: 'keeper', ten: 'Người nhắn', kieu: 'thuong' },
  { id: 'ghi_luc', ten: 'Bot ghi lúc', kieu: 'thuong' },
  { id: 'tin', ten: 'Tin Discord', kieu: 'thuong' },
]
const COT_DUYET: CotBang = { id: 'duyet', ten: 'Duyệt', kieu: 'thuong', batBuoc: true }
const DU_LIEU: TruongDuLieu<DongChoDuyet>[] = [{ id: 'loai', kieu: 'chon', lay: (d) => d.loai }]

export default async function KhoChoDuyetPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await chanKho()
  const sp = await searchParams
  const k = khoTu(sp.kho)
  if (!daCauHinhKho()) return <KhungKho tieuDe="Chờ duyệt mã" kho={k}><LoiKho /></KhungKho>
  const sua = await coTheSuaKho()
  const [r, dm, tabRieng, quyen] = await Promise.all([
    thu(() => kho().choDuyet(k)),
    sua ? thu(() => kho().danhMuc()) : null,
    listTabView('kho_cho_duyet_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])
  if (!r.ok) return <KhungKho tieuDe="Chờ duyệt mã" kho={k}><LoiKho loi={r.loi} /></KhungKho>
  // RPC trả đủ hàng chờ (vài chục dòng) → tìm + lọc trong bộ nhớ.
  const q = boDau((sp.q ?? '').trim()).toLowerCase()
  const ds = apLoc(
    r.v.filter((d) => !q || [d.raw_name, d.suggest_code, d.suggest_name, d.purpose, d.keeper].some((x) => boDau(x ?? '').toLowerCase().includes(q))),
    docTatCa(sp, TRUONG_CHO_DUYET),
    DU_LIEU,
  )

  return (
    <KhungBangKho>
      <KhuSuaKho danhMuc={dm?.ok ? dm.v : []}>
        <Suspense>
          <BangDungSan
            tieuDe="Chờ duyệt mã"
            nhan="dòng chờ duyệt"
            bang="kho_cho_duyet_tab"
            tabCoDinh={TAB_CHO_DUYET}
            tabRieng={tabRieng}
            quyenTabChung={quyen.viewChung}
            viDuTen="VD: Xuất chờ duyệt"
            khu="Kho"
            timKiem="Tìm tên trong tin / mã gợi ý / người nhắn…"
            truong={TRUONG_CHO_DUYET.map((x) => ({ ...x, tuyChon: LOAI.map((g) => ({ giaTri: g, nhan: g })) }))}
            cot={sua ? [...COT, COT_DUYET] : COT}
            dienThoai={{ tren: 'raw_name', duoi: 'ngay', duoiPhai: 'qty' }}
            tong={ds.length}
            nutChinh={<NutDauKho kho={k} />}
            dong={ds.map((d) => ({
              khoa: String(d.id),
              o: {
                ngay: ngayVN(d.ngay),
                loai: <span className={`font-medium ${mauLoai(d.loai)}`}>{d.loai}</span>,
                raw_name: <span className="font-medium">{d.raw_name}</span>,
                qty: <span className="font-semibold">{sl(d.qty)}</span>,
                purpose: <span className="text-muted-foreground">{d.purpose ?? ''}</span>,
                goi_y: d.suggest_code
                  ? <><span className="font-mono">{d.suggest_code}</span><div className="text-xs text-muted-foreground">{d.suggest_name ?? ''}</div></>
                  : <span className="text-muted-foreground">—</span>,
                keeper: d.keeper ?? '',
                ghi_luc: <span className="text-muted-foreground">{ngayVN(d.ghi_luc)}</span>,
                tin: <LinkTin id={d.discord_msg_id} />,
                duyet: sua && <DuyetDong id={d.id} rawName={d.raw_name} goiY={d.suggest_code} />,
              },
            }))}
            ghiChu={
              <>
                {dm && !dm.ok && <Alert color="warning"><AlertDescription>Chưa tải được danh mục mã ({dm.loi}) — ô chọn mã sẽ trống.</AlertDescription></Alert>}
                <GhiChuKho moTa="Dòng có tên hàng bot chưa biết mã — CHƯA tính vào tồn">
                  {sua
                    ? <>Duyệt <b>ngay tại bảng</b>: chọn mã (đã điền sẵn mã bot gợi ý nếu có) rồi bấm <b>Duyệt</b>; không phải hàng kho thì <b>Bỏ qua</b>.
                      Giữ tick <b>“Nhớ tên này”</b> để lần sau bot tự nhận tên đó.{' '}</>
                    : <>Người có quyền <b>Sửa sổ kho</b> duyệt được ngay trên trang này.{' '}</>}
                  Hoặc duyệt trên Google Sheet, tab <b>“Chờ duyệt”</b>: chọn mã ở ô vàng <b>“Mã duyệt”</b> (hoặc gõ <b>BỎ QUA</b>).
                  Trong ~20 giây bot ghi sổ, nhớ tên đó và đổi biểu tượng tin Discord ⏳ → ✅.{' '}
                  <a href={LINK_SHEET_KHO} target="_blank" rel="noreferrer" className="font-medium underline">Mở Sheet ↗</a>{' '}
                </GhiChuKho>
              </>
            }
          />
        </Suspense>
      </KhuSuaKho>
    </KhungBangKho>
  )
}
