import { Badge } from '@/components/ui/badge'
import { Suspense } from 'react'
import { listTabView } from '@/app/actions'
import { docTatCa } from '@/bang/locTruong'
import { BangDungSan } from '@/components/BangDungSan'
import type { CotBang } from '@/components/ui/use-cot-bang'
import { daCauHinhKho, kho, MOI_TRANG } from '@/lib/kho/doc'
import { mauLoai } from '@/lib/kho/nhan'
import { HANH_DONG_SUA, NGUON_SUA, moTaDoi, nhanHanhDong, nhanNguon } from '@/lib/kho/sua'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { chanKho } from '../_gac'
import { GhiChuKho, KhungBangKho, KhungKho, LinkMa, LinkTin, LoiKho, NutDauKho, ngayVN, thu } from '../_ui'
import { motGiaTri, TAB_LICH_SU, TRUONG_LICH_SU } from '../truong-kho'

export const metadata = { title: 'Lịch sử sửa · GWT Kho' }
export const dynamic = 'force-dynamic'

const MAU_HANH_DONG: Record<string, 'info' | 'danger' | 'success' | 'secondary' | 'warning'> = {
  sua: 'info', huy: 'danger', duyet: 'success', bo_qua: 'secondary', kiem_ke: 'warning',
}
const COT: CotBang[] = [
  { id: 'luc', ten: 'Lúc', kieu: 'thuong', khoa: true },
  { id: 'hanh_dong', ten: 'Hành động', kieu: 'thuong' },
  { id: 'nguon', ten: 'Nguồn', kieu: 'thuong' },
  { id: 'nguoi', ten: 'Người', kieu: 'thuong' },
  { id: 'dong', ten: 'Dòng / mã', kieu: 'thuong', rongToiDa: 320 },
  { id: 'doi', ten: 'Thay đổi', kieu: 'thuong', rongToiDa: 360 },
  { id: 'ly_do', ten: 'Lý do', kieu: 'thuong', rongToiDa: 240 },
]
const KHONG_HO_TRO = {
  tieuDe: 'Sổ kho chỉ lọc được một giá trị mỗi trường',
  moTa: 'Chọn đúng một Nguồn / một Hành động (hoặc dùng tab), rồi lọc lại.',
}

export default async function KhoLichSuSuaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await chanKho()
  const sp = await searchParams
  if (!daCauHinhKho()) return <KhungKho tieuDe="Lịch sử sửa"><LoiKho /></KhungKho>
  const trang = Math.max(1, Number(sp.trang) || 1)
  const dk = docTatCa(sp, TRUONG_LICH_SU)
  // RPC wh_app_lich_su_sua lọc ở DB, mỗi trường MỘT giá trị (truong-kho `motGiaTri`).
  const nguon = motGiaTri(dk.find((d) => d.truong === 'nguon'), NGUON_SUA.map((x) => x.giaTri))
  const hd = motGiaTri(dk.find((d) => d.truong === 'hd'), HANH_DONG_SUA.map((x) => x.giaTri))
  const khongLoc = nguon === 'nhieu' || hd === 'nhieu'
  const gt = (x: typeof nguon) => (typeof x === 'object' ? x.gt : undefined)
  const [r, tabRieng, quyen] = await Promise.all([
    khongLoc || nguon === 'rong' || hd === 'rong'
      ? ({ ok: true, v: { tong: 0, dong: [] } } as const)
      : thu(() => kho().lichSuSua({ nguon: gt(nguon), hanhDong: gt(hd), trang })),
    listTabView('kho_lich_su_tab'),
    hoiQuyen({ viewChung: ['he_thong.view_chung', 'QUANLY'] }),
  ])
  if (!r.ok) return <KhungKho tieuDe="Lịch sử sửa"><LoiKho loi={r.loi} /></KhungKho>
  const { tong, dong } = r.v

  return (
    <KhungBangKho>
      <Suspense>
        <BangDungSan
          tieuDe="Lịch sử sửa"
          nhan="lần sửa"
          bang="kho_lich_su_tab"
          tabCoDinh={TAB_LICH_SU}
          tabRieng={tabRieng}
          quyenTabChung={quyen.viewChung}
          viDuTen="VD: Sửa trên Sheet"
          khu="Kho"
          truong={TRUONG_LICH_SU.map((x) => ({ ...x, tuyChon: x.id === 'nguon' ? NGUON_SUA : HANH_DONG_SUA }))}
          locCot={{ hanh_dong: 'hd' }}
          cot={COT}
          dienThoai={{ tren: 'dong', duoi: 'luc', duoiPhai: 'hanh_dong' }}
          tong={tong}
          trang={trang}
          soTrang={Math.max(1, Math.ceil(tong / MOI_TRANG))}
          moiTrang={MOI_TRANG}
          nutChinh={<NutDauKho />}
          rong={khongLoc ? KHONG_HO_TRO : undefined}
          dong={dong.map((d) => {
            const doi = moTaDoi(d.truoc, d.sau)
            return {
              khoa: String(d.id),
              ma: d.internal_code ?? undefined,
              o: {
                luc: <span className="text-muted-foreground">{ngayVN(d.luc)}</span>,
                hanh_dong: <Badge variant="soft" color={MAU_HANH_DONG[d.hanh_dong] ?? 'secondary'}>{nhanHanhDong(d.hanh_dong)}</Badge>,
                nguon: nhanNguon(d.nguon),
                nguoi: <span title={d.nguoi ?? ''}>{(d.nguoi ?? '').split('@')[0] || '—'}</span>,
                dong: (
                  <>
                    <div className="flex flex-wrap items-center gap-x-2">
                      <LinkMa ma={d.internal_code} />
                      {d.dong_id && <span className="text-xs text-muted-foreground">dòng #{d.dong_id}</span>}
                      <LinkTin id={d.discord_msg_id} />
                    </div>
                    {(d.raw_name || d.loai) && (
                      <div className="text-xs text-muted-foreground">
                        {d.loai && <span className={`font-medium ${mauLoai(d.loai)}`}>{d.loai}</span>}{d.ngay && ` · ${ngayVN(d.ngay)}`}{d.raw_name && ` · ${d.raw_name}`}
                      </div>
                    )}
                  </>
                ),
                doi: doi.length ? <ul className="space-y-0.5 text-xs">{doi.map((x, i) => <li key={i}>{x}</li>)}</ul> : <span className="text-muted-foreground">—</span>,
                ly_do: <span className="text-xs text-muted-foreground">{d.ly_do && d.ly_do !== d.hanh_dong ? d.ly_do : ''}</span>,
              },
            }
          })}
          ghiChu={<GhiChuKho moTa="Các lần sửa sổ (app / Google Sheet / Portal), mới nhất trước — dòng bot ghi từ Discord không nằm ở đây" />}
        />
      </Suspense>
    </KhungBangKho>
  )
}
