import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'
import { listTabView } from '@/app/actions'
import { boDau } from '@/bang'
import { apLoc, docTatCa, type TruongDuLieu } from '@/bang/locTruong'
import { BangDungSan } from '@/components/BangDungSan'
import type { CotBang } from '@/components/ui/use-cot-bang'
import { daCauHinhKho, kho, type DongTon } from '@/lib/kho/doc'
import { nhanCanhBao, tenKho } from '@/lib/kho/nhan'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { DA_CHOT_DAU_KY, ngayLuiVN, tomTatKho } from '@/lib/kho/tom-tat'
import { chanKho } from './_gac'
import { GhiChuKho, KhungBangKho, KhungKho, LinkMa, LoiKho, NutDauKho, TheSo, khoTu, ngayVN, sl, thu } from './_ui'
import { TAB_TON, TRUONG_TON } from './truong-kho'

export const metadata = { title: 'Tồn kho · GWT Kho' }
export const dynamic = 'force-dynamic'

const COT: CotBang[] = [
  { id: 'ma', ten: 'Mã', kieu: 'thuong', khoa: true },
  { id: 'ten', ten: 'Tên', kieu: 'thuong', rongToiDa: 320 },
  { id: 'danh_muc', ten: 'Danh mục', kieu: 'thuong', rongToiDa: 200 },
  { id: 'don_vi', ten: 'ĐVT', kieu: 'thuong' },
  { id: 'nhap', ten: 'Nhập', kieu: 'thuong', phai: true },
  { id: 'xuat', ten: 'Xuất', kieu: 'thuong', phai: true },
  { id: 'dieu_chinh', ten: 'Điều chỉnh', kieu: 'thuong', phai: true },
  { id: 'ton', ten: 'Tồn', kieu: 'thuong', phai: true, batBuoc: true },
  { id: 'toi_thieu', ten: 'Tối thiểu', kieu: 'thuong', phai: true },
  { id: 'canh_bao', ten: 'Cảnh báo', kieu: 'thuong' },
  { id: 'cap_nhat', ten: 'Phát sinh gần nhất', kieu: 'thuong' },
]
const DU_LIEU: TruongDuLieu<DongTon>[] = [
  { id: 'dm', kieu: 'chon', lay: (d) => d.danh_muc },
  { id: 'cb', kieu: 'chon', lay: (d) => d.canh_bao },
]
const CANH_BAO = [{ giaTri: 'sap_het', nhan: nhanCanhBao('sap_het') }, { giaTri: 'am', nhan: nhanCanhBao('am') }]

export default async function KhoTonPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await chanKho()
  const sp = await searchParams
  const k = khoTu(sp.kho)
  if (!daCauHinhKho()) return <KhungKho tieuDe="Tồn kho" kho={k}><LoiKho /></KhungKho>
  const [r, tabRieng, quyen] = await Promise.all([
    thu(() => kho().ton(k)),
    listTabView('kho_ton_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])
  if (!r.ok) return <KhungKho tieuDe="Tồn kho" kho={k}><LoiKho loi={r.loi} /></KhungKho>
  const { dong, tom, ghiGanNhat } = r.v
  // Tóm tắt cho CEO: nhật ký 30 ngày (đã duyệt) — vài trang là đủ; lỗi thì bỏ khung tóm tắt, bảng tồn vẫn hiện.
  const tuNgay = ngayLuiVN(30)
  const nk = await thu(async () => {
    const ra = []
    for (let trang = 1; trang <= 10; trang++) { const p = await kho().nhatKy({ kho: k, trangThai: 'approved', tuNgay, trang }); ra.push(...p.dong); if (ra.length >= p.tong) break }
    return ra
  })
  const tt = nk.ok ? tomTatKho({ ton: dong, nhatKy: nk.v, choDuyet: tom.choDuyet, daChot: DA_CHOT_DAU_KY[k] ?? false, tenKho: tenKho(k) }) : null

  // Lọc trong bộ nhớ như màn cũ (RPC trả đủ mọi mã). `cb=co` của ô lọc cũ = "có cảnh báo".
  const q = typeof sp.q === 'string' ? boDau(sp.q.trim()).toLowerCase() : ''
  const dk = docTatCa({ ...sp, cb: sp.cb === 'co' ? 'co~' : sp.cb }, TRUONG_TON)
  const loc = apLoc(dong.filter((d) => !q || boDau(d.internal_code).toLowerCase().includes(q) || boDau(d.ten ?? '').toLowerCase().includes(q)), dk, DU_LIEU)
  const danhMuc = [...new Set(dong.map((d) => d.danh_muc).filter(Boolean))].sort().map((x) => ({ giaTri: x!, nhan: x! }))
  const duongKho = (them: string) => `/kho?${k === 'NX' ? '' : `kho=${k}&`}${them}`

  return (
    <KhungBangKho>
      {/* Cảnh báo số liệu chưa chốt đầu kỳ: banner của cả trang (đặt trên đầu bảng để không chìm dưới vài trăm dòng). */}
      {tt?.canhBao && <Alert color="danger" className="mb-4"><AlertDescription>{tt.canhBao}</AlertDescription></Alert>}
      <Suspense>
        <BangDungSan
          tieuDe="Tồn kho"
          nhan="mã hàng"
          bang="kho_ton_tab"
          tabCoDinh={TAB_TON}
          tabRieng={tabRieng}
          quyenTabChung={quyen.viewChung}
          demTab={{ 'tat-ca': tom.soMa, 'sap-het': tom.sapHet, am: tom.am }}
          viDuTen="VD: Lõi lọc sắp hết"
          khu="Kho"
          timKiem="Tìm mã / tên hàng…"
          truong={TRUONG_TON.map((x) => ({ ...x, tuyChon: x.id === 'dm' ? danhMuc : CANH_BAO }))}
          cot={COT}
          dienThoai={{ tren: 'ten', duoi: 'ma', duoiPhai: 'ton' }}
          tong={loc.length}
          nutChinh={<NutDauKho kho={k} />}
          dong={loc.map((d) => ({
            khoa: d.internal_code,
            href: `/kho/ma/${encodeURIComponent(d.internal_code)}${k !== 'NX' ? `?kho=${k}` : ''}`,
            o: {
              ma: <LinkMa ma={d.internal_code} kho={k} />,
              ten: d.ten ?? '',
              danh_muc: <span className="text-muted-foreground">{d.danh_muc ?? ''}</span>,
              don_vi: <span className="text-muted-foreground">{d.don_vi ?? ''}</span>,
              nhap: sl(d.tong_nhap),
              xuat: sl(d.tong_xuat),
              dieu_chinh: <span className="text-muted-foreground">{d.dieu_chinh ? sl(d.dieu_chinh) : ''}</span>,
              ton: <span className={`font-semibold ${d.ton < 0 ? 'text-destructive' : ''}`}>{sl(d.ton)}</span>,
              toi_thieu: <span className="text-muted-foreground">{d.ton_toi_thieu ?? ''}</span>,
              canh_bao: d.canh_bao && <Badge variant="soft" color={d.canh_bao === 'am' ? 'danger' : 'warning'}>{nhanCanhBao(d.canh_bao)}</Badge>,
              cap_nhat: <span className="text-muted-foreground">{ngayVN(d.cap_nhat)}</span>,
            },
          }))}
          ghiChu={
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <TheSo nhan="Số mã có tồn / phát sinh" so={tom.soMa} />
                <TheSo nhan="Sắp hết" so={tom.sapHet} mau={tom.sapHet ? 'text-(--color-text-warning)' : ''}
                  phu={tom.sapHet ? <Link href={duongKho('cb=sap_het&view=sap-het')} className="underline underline-offset-2">Xem mã sắp hết</Link> : undefined} />
                <TheSo nhan="Tồn âm" so={tom.am} mau={tom.am ? 'text-destructive' : ''}
                  phu={tom.am ? <Link href={duongKho('cb=am&view=am')} className="underline underline-offset-2">Xem mã tồn âm</Link> : undefined} />
                <TheSo nhan="Dòng chờ duyệt mã" so={tom.choDuyet} mau={tom.choDuyet ? 'text-(--color-text-warning)' : ''}
                  phu={tom.choDuyet ? <Link href={`/kho/cho-duyet${k !== 'NX' ? `?kho=${k}` : ''}`} className="text-(--color-text-info) underline">xem — chưa tính vào tồn</Link> : 'không có'} />
              </div>
              {tt && (
                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-foreground">Luân chuyển gần đây</h2>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">{tt.cau.map((c) => <li key={c}>{c}</li>)}</ul>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-sm text-muted-foreground">
                    <span>Nhập 7 ngày: <b>{tt.nhap7.lan}</b> lần · {sl(tt.nhap7.sl)} đơn vị</span>
                    <span>Xuất 7 ngày: <b>{tt.xuat7.lan}</b> lần · {sl(tt.xuat7.sl)} đơn vị</span>
                    {tt.topXuat30.length > 0 && <span>Xuất nhiều nhất 30 ngày: {tt.topXuat30.map((x) => `${x.ten} (${sl(x.sl)})`).join(' · ')}</span>}
                  </div>
                </Card>
              )}
              <GhiChuKho moTa={`Tồn tính từ các dòng sổ đã duyệt mã · bot ghi gần nhất ${ngayVN(ghiGanNhat)}`} />
            </>
          }
        />
      </Suspense>
    </KhungBangKho>
  )
}
