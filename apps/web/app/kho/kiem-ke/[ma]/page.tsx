import Link from 'next/link'
import { daCauHinhKho, kho } from '@/lib/kho/doc'
import { n } from '@/lib/kho/nhan'
import { chanKho } from '../../_gac'
import { Bang, KhungKho, LinkMay, LoiKho, Nhan, O, thu } from '../../_ui'

export const dynamic = 'force-dynamic'

type DoiChieu = {
  dot_ma: string; dia_diem: string; trang_thai: string
  dong: { serial: string; internal_code: string; tinh_trang: string; ket_qua: string | null; he_thong: { dia_diem: string; tinh_trang: string; internal_code: string } | null }[]
  thieu: { serial: string; internal_code: string; tinh_trang: string }[]
  so_luong: { internal_code: string; ton_so: number; dem_serial: number; dem_khong_serial: number; dieu_chinh: number; kieu: string; ghi_so: boolean }[]
}
const KET_QUA: Record<string, string> = {
  moi: 'máy mới có hồ sơ', sai_vi_tri: 'sai vị trí', sai_tinh_trang: 'sai tình trạng', sai_model: 'sai model',
  sai_trang_thai: 'sai trạng thái', xung_dot_so_huu: 'đang thuộc khách / đã thanh lý',
}

export default async function KhoKiemKeChiTiet({ params }: { params: Promise<{ ma: string }> }) {
  await chanKho()
  const ma = decodeURIComponent((await params).ma)
  if (!daCauHinhKho()) return <KhungKho tieuDe={ma}><LoiKho /></KhungKho>
  const r = await thu(() => kho().doiChieuKiemKe(ma) as Promise<DoiChieu>)
  if (!r.ok) return <KhungKho tieuDe={ma}><LoiKho loi={r.loi} /></KhungKho>
  const d = r.v

  return (
    <KhungKho tieuDe={`Kiểm kê ${d.dot_ma}`} moTa={<Link href="/kho/kiem-ke" className="text-indigo-700 hover:underline">← Các đợt kiểm kê</Link>}>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Theo model — đếm so với sổ</h2>
        <Bang dau={['Model', 'Tồn sổ', 'Đếm có serial', 'Đếm chưa serial', 'Chênh', 'Loại', 'Ghi vào sổ']} trong={!d.so_luong.length}>
          {d.so_luong.map((x) => (
            <tr key={x.internal_code}>
              <O cls="font-medium">{x.internal_code}</O><O cls="text-center">{x.ton_so}</O><O cls="text-center">{x.dem_serial}</O>
              <O cls="text-center">{x.dem_khong_serial}</O>
              <O cls={`text-center font-semibold ${x.dieu_chinh ? 'text-red-700' : 'text-emerald-700'}`}>{x.dieu_chinh > 0 ? '+' : ''}{x.dieu_chinh}</O>
              <O>{x.kieu === 'dau_ky' ? 'khởi tạo số dư đầu kỳ' : 'đối soát với sổ hiện có'}</O>
              <O>{x.ghi_so ? 'có' : 'không (mã đang chuẩn bị — sổ do luồng cũ)'}</O>
            </tr>
          ))}
        </Bang>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Máy đã đếm ({d.dong.length})</h2>
        <Bang dau={['Serial', 'Model', 'Tình trạng đếm', 'Kết quả', 'Hệ thống đang ghi']} trong={!d.dong.length}>
          {d.dong.map((x) => (
            <tr key={x.serial}>
              <O><LinkMay serial={x.serial} /></O><O>{x.internal_code}</O><O><Nhan ma={x.tinh_trang} /></O>
              <O>{x.ket_qua ? <span className="text-amber-800">{x.ket_qua.split(',').map((k) => KET_QUA[k] ?? k).join(', ')}</span> : <span className="text-emerald-700">khớp</span>}</O>
              <O cls="text-xs text-slate-500">{x.he_thong ? `${x.he_thong.internal_code} · ${x.he_thong.dia_diem} · ${n(x.he_thong.tinh_trang)}` : '—'}</O>
            </tr>
          ))}
        </Bang>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Hệ thống có mà không đếm thấy ({d.thieu.length})</h2>
        <Bang dau={['Serial', 'Model', 'Tình trạng hệ thống']} trong={!d.thieu.length}>
          {d.thieu.map((x) => (
            <tr key={x.serial}><O><LinkMay serial={x.serial} /></O><O>{x.internal_code}</O><O><Nhan ma={x.tinh_trang} /></O></tr>
          ))}
        </Bang>
      </section>
    </KhungKho>
  )
}
