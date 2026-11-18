'use client'
// PROTOTYPE — lượt 2 (bản gộp 18/11): MỘT màn bảng ticket, gộp cái tốt của 5 phương án cũ.
// Dùng chung: đầu trang, tab, lọc/sắp xếp ở tiêu đề cột, thanh công cụ (⚙ cài đặt hiển thị | Danh sách · Bảng · Kanban),
// menu ⋯ của dòng, sửa tại chỗ khi bấm vào nội dung ô, panel xem nhanh nổi bên phải khi bấm ticket.
// ?variant=A–E chỉ là 5 trạng thái mở sẵn của cùng một màn.
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent, type PointerEvent as PE, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDown, ArrowLeft, ArrowSquareOut, ArrowUp, CaretDown, CaretLeft, CaretRight, Check, Copy,
  Export, Eye, FloppyDisk, MagnifyingGlass, Plus, WarningCircle, Funnel, GearSix, Kanban, LinkSimple, ListBullets, PencilSimple, Rows, SidebarSimple, SortAscending, Table, X,
  type Icon,
} from '@phosphor-icons/react'
import { Khung } from '../../khung/_proto/VariantD'
import { LY_DO_CHO, NHAN_VIEN, TICKETS, TT_LIST, UU_LIST, type NhomLoi, type Ticket, type TrangThai, type UuTien } from './data'
import {
  Avatar, ChipTT, DauCot, DsLoc, Han, Khach, MenuChon, NguonTag, Nguoi, NhanDau, NhanLoi, Noi, OChon, OChonTatCa, Rong,
  SAP_TICKET, ThanhHangLoat, ThanhLoc, ChanTrang, Toast, UuTag, useBang, bo, MO, NHOM_LIST, type Bang, type Cot, type Loc,
} from './chung'

type BoCuc = 'ds' | 'bang' | 'kanban'
type NhomTheo = '' | 'tt' | 'uu' | 'nhom' | 'chu'
const BO_CUC: { id: BoCuc; ten: string; I: Icon }[] = [
  { id: 'ds', ten: 'Danh sách', I: ListBullets }, { id: 'bang', ten: 'Bảng', I: Table }, { id: 'kanban', ten: 'Kanban', I: Kanban },
]
const TEN_NHOM: Record<NhomTheo, string> = { '': 'Không nhóm', tt: 'Trạng thái', uu: 'Ưu tiên', nhom: 'Loại lỗi', chu: 'Chủ ticket' }
const TEN_SAP: Record<Cot, string> = { uu: 'Ưu tiên', han: 'Hạn', moNgay: 'Số ngày mở', ma: 'Thứ tự tạo' }

// ---------- cột của bố cục Bảng: đổi chỗ (kéo tiêu đề), co dãn (kéo mép), ẩn/hiện (⚙) ----------
type CotId = 'uu' | 'nhom' | 'ma' | 'khach' | 'may' | 'tt' | 'viec' | 'lam' | 'han' | 'chu' | 'mo' | 'nguon'
type DinhNghiaCot = { id: CotId; ten: string; w: number; sap?: Cot; loc?: Loc }
const COT: DinhNghiaCot[] = [
  { id: 'uu', ten: 'Ưu tiên', w: 76, sap: 'uu', loc: 'uu' }, { id: 'nhom', ten: 'Loại lỗi', w: 148, loc: 'nhom' },
  { id: 'ma', ten: 'Mã', w: 104, sap: 'ma' }, { id: 'khach', ten: 'Khách', w: 128 }, { id: 'may', ten: 'Máy · serial', w: 200 },
  { id: 'tt', ten: 'Trạng thái', w: 124 }, { id: 'viec', ten: 'Việc tiếp theo', w: 124 }, { id: 'lam', ten: 'Người làm', w: 132 },
  { id: 'han', ten: 'Hạn', w: 100, sap: 'han' }, { id: 'chu', ten: 'Chủ', w: 60, loc: 'chu' }, { id: 'mo', ten: 'Mở', w: 80, sap: 'moNgay' },
  { id: 'nguon', ten: 'Nguồn', w: 100 },
]
const AN_MAC_DINH: CotId[] = ['may', 'lam', 'mo', 'nguon']

// ---------- gom nhóm ----------
function gom(rows: Ticket[], theo: NhomTheo): { key: string; nhan: ReactNode; rows: Ticket[] }[] {
  if (!theo) return [{ key: '', nhan: null, rows }]
  const thuTu: readonly string[] = theo === 'tt' ? TT_LIST : theo === 'uu' ? UU_LIST : theo === 'nhom' ? NHOM_LIST : NHAN_VIEN
  const gt = (t: Ticket) => (theo === 'tt' ? t.tt : theo === 'uu' ? t.uu : theo === 'nhom' ? t.nhom : t.chu)
  return thuTu.map((k) => ({
    key: k,
    nhan: theo === 'tt' ? <ChipTT t={{ tt: k } as Ticket} nho /> : theo === 'uu' ? <UuTag u={k as UuTien} /> : theo === 'nhom' ? <NhanLoi n={k as NhomLoi} /> : <Nguoi ten={k} />,
    rows: rows.filter((t) => gt(t) === k),
  })).filter((g) => g.rows.length)
}

// ======================= sửa tại chỗ (bấm vào nội dung ô) =======================
function OSua({ nhan, children, menu, rong, an, lop }: { nhan: string; children: ReactNode; menu: (dong: () => void) => ReactNode; rong?: boolean; an?: boolean; lop?: string }) {
  const [mo, setMo] = useState(false)
  return (
    <span className="b-loc-o b-osua-wrap">
      <button className="b-osua" data-an-mui={an || undefined} aria-label={`Sửa ${nhan}`} aria-expanded={mo} aria-haspopup="menu" onClick={(e) => { e.stopPropagation(); setMo(!mo) }}>
        {children}<CaretDown className="b-osua-mui" aria-hidden />
      </button>
      <Noi mo={mo} dong={() => setMo(false)} className={lop ?? (rong ? 'b-noi-rong' : undefined)}>{menu(() => setMo(false))}</Noi>
    </span>
  )
}
function SuaChu({ t, b }: { t: Ticket; b: Bang }) {
  const [sua, setSua] = useState(false)
  const [v, setV] = useState(t.viecTiep)
  if (!sua) return (
    <button className="b-osua b-osua-chu" onClick={(e) => { e.stopPropagation(); setV(t.viecTiep); setSua(true) }} aria-label={`Sửa việc tiếp theo ${t.ma}`}>
      <span className="b-cat">{t.viecTiep}</span><PencilSimple className="b-osua-mui" aria-hidden />
    </button>
  )
  const luu = () => { setSua(false); if (v.trim() && v !== t.viecTiep) b.sua(t.ma, { viecTiep: v.trim() }, `${t.ma}: đã lưu việc tiếp theo`) }
  return (
    <input className="ui-input b-osua-input" autoFocus value={v} onChange={(e) => setV(e.target.value)} onBlur={luu} onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => { if (e.key === 'Enter') luu(); if (e.key === 'Escape') setSua(false) }} aria-label="Việc tiếp theo" />
  )
}
function SuaHan({ t, b }: { t: Ticket; b: Bang }) {
  const [ngay, gio] = t.han.split(' ')
  return (
    <span className="b-osua b-osua-han" onClick={(e) => e.stopPropagation()}>
      <Han t={t} />
      <input type="date" className="b-han-input" value={ngay} aria-label={`Đổi hạn ${t.ma}`}
        onChange={(e) => e.target.value && b.sua(t.ma, { han: `${e.target.value} ${gio}` }, `${t.ma}: đã dời hạn`)} />
    </span>
  )
}
/** Ô sửa được cho từng trường — dùng chung ở Danh sách, Bảng và panel xem nhanh. */
// danh sách khách GIẢ (prototype, không PII): gom từ ticket mẫu; mã KH, khu vực, đuôi SĐT là số bịa.
// Bản thật đọc bảng khách hàng — mỗi dòng phải đủ để phân biệt hai khách trùng/na ná tên.
type KhachMau = { ten: string; ma: string; loai: 'Cá nhân' | 'Doanh nghiệp'; khu: string; sdt: string; may: string[]; mo: number; luuY: boolean }
const KHU = ['Q.7', 'Thủ Đức', 'Bình Thạnh', 'Q.1', 'Cầu Giấy', 'Hà Đông', 'Biên Hoà']
const DS_KHACH: KhachMau[] = [...new Set(TICKETS.map((t) => t.khach))].sort((a, b) => a.localeCompare(b, 'vi')).map((ten, i) => {
  const ts = TICKETS.filter((t) => t.khach === ten)
  return {
    ten, ma: `KH-${String(1001 + i * 7).padStart(5, '0')}`,
    loai: /^(Công ty|Khách sạn|Trường|Nhà hàng)/.test(ten) ? 'Doanh nghiệp' : 'Cá nhân',
    khu: KHU[i % KHU.length], sdt: String(1000 + ((i * 2731) % 9000)),
    may: [...new Set(ts.map((t) => (t.serial ? `${t.may} · ${t.serial}` : t.may)))],
    mo: ts.filter(MO).length, luuY: ts.some((t) => !!t.luuY),
  }
})

function MenuKhach({ gt, chon }: { gt: string; chon: (k: KhachMau) => void }) {
  const [q, setQ] = useState('')
  const loc = DS_KHACH.filter((k) => !q || bo([k.ten, k.ma, k.sdt, k.khu, ...k.may].join(' ')).includes(bo(q)))
  return (
    <div className="b-kh">
      <div className="ui-menu-search">
        <MagnifyingGlass className="ui-icon" aria-hidden />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên, mã KH, 4 số cuối SĐT, serial…" aria-label="Tìm khách"
          onKeyDown={(e) => { if (e.key === 'Enter' && loc[0]) chon(loc[0]) }} />
      </div>
      <div className="ui-menu-label b-kh-dem">{q ? `${loc.length} khách khớp` : `${DS_KHACH.length} khách`} · Enter chọn dòng đầu</div>
      <div className="b-kh-ds" role="listbox" aria-label="Khách hàng">
        {loc.map((k) => (
          <button key={k.ma} className="ui-menu-item b-kh-muc" role="option" aria-selected={k.ten === gt} onClick={() => chon(k)}>
            <span className="b-kh-dong1">
              <span className="b-kh-ten b-cat">{k.ten}</span>
              {k.luuY && <WarningCircle weight="fill" className="b-kh-luuy" aria-label="Có lưu ý" />}
              <span className="b-kh-mo">{k.mo ? `${k.mo} ticket mở` : 'không ticket mở'}</span>
              {k.ten === gt && <Check className="b-tick" aria-hidden />}
            </span>
            <span className="b-kh-dong2 b-cat">{k.ma} · {k.loai} · {k.khu} · SĐT •••{k.sdt}</span>
            <span className="b-kh-dong2 b-cat">{k.may.join(', ')}</span>
          </button>
        ))}
        {!loc.length && <div className="b-kh-rong">Không thấy khách “{q}”</div>}
      </div>
      <div className="ui-menu-sep" />
      <button className="ui-menu-item"><Plus aria-hidden /> Tạo khách mới{q && ` “${q}”`}</button>
    </div>
  )
}

function OTruong({ id, t, b, gon }: { id: 'uu' | 'nhom' | 'tt' | 'viec' | 'lam' | 'han' | 'chu' | 'khach'; t: Ticket; b: Bang; gon?: boolean }) {
  if (id === 'khach') return (
    <OSua nhan={`khách ${t.ma}`} lop="b-noi-kh" menu={(d) => <MenuKhach gt={t.khach}
      chon={(k) => { b.sua(t.ma, { khach: k.ten, luuY: k.luuY }, `${t.ma}: đổi khách → ${k.ten}`); d() }} />}><Khach t={t} /></OSua>
  )
  if (id === 'uu') return (
    <OSua an nhan={`ưu tiên ${t.ma}`} menu={(d) => <MenuChon<UuTien> ds={UU_LIST} gt={t.uu} nhan={(v) => <UuTag u={v} />} chon={(v) => { b.sua(t.ma, { uu: v }, `${t.ma}: ưu tiên ${v}`); d() }} />}><UuTag u={t.uu} /></OSua>
  )
  if (id === 'nhom') return (
    <OSua an rong nhan={`loại lỗi ${t.ma}`} menu={(d) => <MenuChon ds={NHOM_LIST} gt={t.nhom} nhan={(v) => <NhanLoi n={v} />} chon={(v) => { b.sua(t.ma, { nhom: v }, `${t.ma}: loại lỗi ${v}`); d() }} />}><NhanLoi n={t.nhom} /></OSua>
  )
  if (id === 'tt') return (
    <OSua an nhan={`trạng thái ${t.ma}`} menu={(d) => (
      <>
        <MenuChon<TrangThai> ds={TT_LIST} gt={t.tt} nhan={(v) => <ChipTT t={{ ...t, tt: v, lyDoCho: undefined }} nho />}
          chon={(v) => { b.sua(t.ma, { tt: v, lyDoCho: v === 'Chờ' ? t.lyDoCho ?? 'khách' : undefined }, `${t.ma} → ${v}`); d() }} />
        {t.tt === 'Chờ' && (<><div className="ui-menu-sep" /><div className="ui-menu-label">Lý do chờ</div>
          <MenuChon ds={LY_DO_CHO} gt={t.lyDoCho ?? 'khách'} chon={(v) => { b.sua(t.ma, { lyDoCho: v }, `${t.ma}: chờ ${v}`); d() }} /></>)}
      </>
    )}><ChipTT t={t} nho mui /></OSua>
  )
  if (id === 'viec') return <SuaChu t={t} b={b} />
  if (id === 'han') return <SuaHan t={t} b={b} />
  const ten = id === 'lam' ? t.nguoiLam : t.chu
  const ds = id === 'lam' ? [...NHAN_VIEN, t.khach] : NHAN_VIEN.slice(0, 4)
  return (
    <OSua rong an={gon} nhan={`${id === 'lam' ? 'người làm' : 'chủ ticket'} ${t.ma}`}
      menu={(d) => <MenuChon ds={ds} gt={ten} tim chon={(v) => { b.sua(t.ma, id === 'lam' ? { nguoiLam: v } : { chu: v }, `${t.ma}: ${id === 'lam' ? 'giao cho' : 'chủ mới'} ${v}`); d() }} />}>
      {gon ? <span className="b-av-o" title={ten}><Avatar ten={ten} /></span> : <Nguoi ten={ten} />}
    </OSua>
  )
}

// ======================= menu ⋯ của dòng (chung mọi bố cục) =======================
// chuột phải vào dòng/thẻ (18/11, thay nút ⋯). Phím Menu / Shift+F10 trên dòng đang focus cũng mở (trình duyệt tự bắn contextmenu).
// Vẽ position:fixed NGOÀI .b-trang (container-type = khung chứa của fixed) nên không bị hàng dưới đè lên.
type ChuotPhai = { ma: string; x: number; y: number; banPhim: boolean }
function MenuChuotPhai({ cp, b, moTrang, xemNhanh, dong }: { cp: ChuotPhai; b: Bang; moTrang: (ma: string) => void; xemNhanh: (ma: string) => void; dong: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const t = b.rows.find((x) => x.ma === cp.ma)
  useEffect(() => {
    const ngoai = (e: Event) => { if (!ref.current?.contains(e.target as Node)) dong() }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') dong() }
    document.addEventListener('mousedown', ngoai); document.addEventListener('keydown', esc); document.addEventListener('scroll', dong, true)
    if (cp.banPhim) ref.current?.querySelector('button')?.focus() // mở bằng phím Menu/Shift+F10 → đưa focus vào menu
    const dongDang = document.querySelector(`[data-ma="${cp.ma}"]`); dongDang?.setAttribute('data-cp', '') // tô sáng dòng đang mở menu
    return () => { dongDang?.removeAttribute('data-cp'); document.removeEventListener('mousedown', ngoai); document.removeEventListener('keydown', esc); document.removeEventListener('scroll', dong, true) }
  }, [dong, cp.ma, cp.banPhim])
  if (!t) return null
  const lam = (f: () => void) => () => { f(); dong() }
  const x = Math.min(cp.x, window.innerWidth - 232), y = Math.min(cp.y, window.innerHeight - 196)
  return (
    <div ref={ref} className="ui-menu b-chuotphai" role="menu" aria-label={`Thao tác ${t.ma}`} style={{ left: x, top: y }}>
      <div className="ui-menu-label">{t.ma}</div>
      <button className="ui-menu-item" role="menuitem" onClick={lam(() => moTrang(t.ma))}><ArrowSquareOut aria-hidden /> Mở ticket</button>
      <button className="ui-menu-item" role="menuitem" onClick={lam(() => xemNhanh(t.ma))}><SidebarSimple mirrored aria-hidden /> Xem nhanh bên phải</button>
      <button className="ui-menu-item" role="menuitem" onClick={lam(() => b.setToast({ chu: `Đã sao chép ${t.ma}` }))}><Copy aria-hidden /> Sao chép mã</button>
      <div className="ui-menu-sep" />
      {MO(t)
        ? <button className="ui-menu-item" role="menuitem" onClick={lam(() => b.sua(t.ma, { tt: 'Đóng' }, `${t.ma} → Đóng`))}><Check aria-hidden /> Đóng ticket</button>
        : <button className="ui-menu-item" role="menuitem" onClick={lam(() => b.sua(t.ma, { tt: 'Đang xử lý' }, `${t.ma}: mở lại`))}>Mở lại ticket</button>}
    </div>
  )
}

// ======================= ⚙ cài đặt hiển thị (kiểu Notion) =======================
type Trang = '' | 'bocuc' | 'cot' | 'loc' | 'sap' | 'nhom'
type PropsCaiDat = {
  b: Bang; boCuc: BoCuc; setBoCuc: (v: BoCuc) => void; an: CotId[]; setAn: (v: CotId[]) => void; thuTu: CotId[]
  nhomTheo: NhomTheo; setNhomTheo: (v: NhomTheo) => void
}
function DongCd({ I, ten, gt, mui, onClick }: { I: Icon; ten: string; gt?: ReactNode; mui?: boolean; onClick: () => void }) {
  return (
    <button className="ui-menu-item b-cd-dong" onClick={onClick}>
      <I aria-hidden /> {ten}<span className="b-cd-gt">{gt}</span>{mui && <CaretRight className="b-cd-mui" aria-hidden />}
    </button>
  )
}
function CaiDat({ b, boCuc, setBoCuc, an, setAn, thuTu, nhomTheo, setNhomTheo }: PropsCaiDat) {
  const [mo, setMo] = useState(false)
  const [trang, setTrang] = useState<Trang>('')
  const soLoc = b.locUu.length + b.locNhom.length + b.locChu.length
  const dong = () => { setMo(false); setTrang('') }
  const dau = (ten: string) => (
    <div className="b-cd-dau"><button className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Quay lại" onClick={() => setTrang('')}><ArrowLeft aria-hidden /></button>{ten}</div>
  )
  return (
    <span className="b-loc-o">
      <button className="ui-btn ui-tip" data-variant="ghost" data-size="icon" aria-label="Cài đặt hiển thị" data-tip="Cài đặt hiển thị" aria-expanded={mo} data-on={soLoc > 0 || nhomTheo ? '' : undefined} onClick={() => (mo ? dong() : setMo(true))}>
        <GearSix aria-hidden />
      </button>
      <Noi mo={mo} dong={dong} className="b-noi-phai b-caidat">
        {trang === '' && (
          <>
            <div className="b-cd-tieude">Cài đặt hiển thị<button className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Đóng" onClick={dong}><X aria-hidden /></button></div>
            <DongCd I={Table} ten="Bố cục" gt={BO_CUC.find((x) => x.id === boCuc)!.ten} mui onClick={() => setTrang('bocuc')} />
            {boCuc === 'bang' && <DongCd I={Eye} ten="Cột hiển thị" gt={COT.length - an.length} mui onClick={() => setTrang('cot')} />}
            <DongCd I={Funnel} ten="Lọc" gt={soLoc || undefined} mui onClick={() => setTrang('loc')} />
            <DongCd I={SortAscending} ten="Sắp xếp" gt={TEN_SAP[b.sap.cot]} mui onClick={() => setTrang('sap')} />
            {boCuc !== 'kanban' && <DongCd I={Rows} ten="Nhóm theo" gt={nhomTheo ? TEN_NHOM[nhomTheo] : undefined} mui onClick={() => setTrang('nhom')} />}
            <DongCd I={LinkSimple} ten="Sao chép link view" onClick={() => { b.setToast({ chu: 'Đã sao chép link view (giữ bộ lọc, cột, sắp xếp)' }); dong() }} />
            <div className="ui-menu-sep" />
            <DongCd I={FloppyDisk} ten="Lưu thành view của tôi" onClick={() => { b.setToast({ chu: 'Đã lưu view “Của tôi”' }); dong() }} />
            <DongCd I={FloppyDisk} ten="Lưu view chung" gt="quản lý" onClick={() => { b.setToast({ chu: 'Đã lưu view chung' }); dong() }} />
            <DongCd I={Export} ten="Xuất Excel theo bộ lọc" onClick={() => { b.setToast({ chu: `Đang xuất ${b.thay.length} ticket…` }); dong() }} />
          </>
        )}
        {trang === 'bocuc' && (<>{dau('Bố cục')}{BO_CUC.map(({ id, ten, I }) => (
          <button key={id} className="ui-menu-item" role="menuitemradio" aria-checked={boCuc === id} onClick={() => { setBoCuc(id); setTrang('') }}><I aria-hidden /> {ten}{boCuc === id && <Check className="b-tick" aria-hidden />}</button>
        ))}</>)}
        {trang === 'cot' && (<>{dau('Cột hiển thị')}<div className="ui-menu-label">Kéo tiêu đề cột trên bảng để đổi chỗ</div>{thuTu.map((id) => {
          const c = COT.find((x) => x.id === id)!
          return (
            <label key={id} className="ui-menu-item b-menu-cb">
              <input type="checkbox" className="ui-checkbox" checked={!an.includes(id)} disabled={id === 'ma'} onChange={() => setAn(an.includes(id) ? an.filter((x) => x !== id) : [...an, id])} />{c.ten}
            </label>
          )
        })}</>)}
        {trang === 'loc' && (<>{dau('Lọc')}
          <div className="ui-menu-label">Ưu tiên</div><DsLoc b={b} loc="uu" />
          <div className="ui-menu-sep" /><div className="ui-menu-label">Loại lỗi</div><DsLoc b={b} loc="nhom" />
          <div className="ui-menu-sep" /><div className="ui-menu-label">Chủ ticket</div><DsLoc b={b} loc="chu" />
          {soLoc > 0 && <button className="ui-menu-item b-menu-xoa" onClick={() => { b.setLocUu([]); b.setLocNhom([]); b.setLocChu([]) }}>Xoá mọi bộ lọc</button>}
        </>)}
        {trang === 'sap' && (<>{dau('Sắp xếp')}<div className="ui-menu-label">Chỉ cột có thứ tự hoặc số lượng</div>{(Object.keys(TEN_SAP) as Cot[]).map((c) => {
          const on = b.sap.cot === c
          return (
            <button key={c} className="ui-menu-item" role="menuitemradio" aria-checked={on} onClick={() => b.setSap({ cot: c, chieu: on && b.sap.chieu === 'tang' ? 'giam' : 'tang' })}>
              {TEN_SAP[c]}{on && (b.sap.chieu === 'tang' ? <ArrowUp className="b-tick" aria-label="tăng dần" /> : <ArrowDown className="b-tick" aria-label="giảm dần" />)}
            </button>
          )
        })}</>)}
        {trang === 'nhom' && (<>{dau('Nhóm theo')}{(Object.keys(TEN_NHOM) as NhomTheo[]).map((k) => (
          <button key={k || 'khong'} className="ui-menu-item" role="menuitemradio" aria-checked={nhomTheo === k} onClick={() => { setNhomTheo(k); setTrang('') }}>{TEN_NHOM[k]}{nhomTheo === k && <Check className="b-tick" aria-hidden />}</button>
        ))}</>)}
      </Noi>
    </span>
  )
}

function ThanhCongCu(p: PropsCaiDat & { xemBat: boolean; setXemBat: (v: boolean) => void }) {
  return (
    <div className="b-cong-cu">
      <CaiDat {...p} />
      <span className="b-ngan" aria-hidden />
      <div className="b-bocuc" role="radiogroup" aria-label="Dạng xem">
        {BO_CUC.map(({ id, ten, I }) => (
          <button key={id} className="ui-btn ui-tip" data-variant="ghost" data-size="icon" role="radio" aria-checked={p.boCuc === id} aria-label={ten} data-tip={ten} onClick={() => p.setBoCuc(id)}><I aria-hidden /></button>
        ))}
      </div>
      <span className="b-ngan" aria-hidden />
      {/* như "Toggle pinned summary" của ChatGPT: ẩn hẳn thẻ xem nhanh, bấm ticket sẽ mở trang ticket */}
      <button className="ui-btn ui-tip" data-variant="ghost" data-size="icon" aria-pressed={p.xemBat} aria-label="Thẻ xem nhanh bên phải" data-tip={p.xemBat ? 'Ẩn thẻ xem nhanh' : 'Hiện thẻ xem nhanh'} onClick={() => p.setXemBat(!p.xemBat)}>
        <SidebarSimple mirrored aria-hidden />
      </button>
    </div>
  )
}

// ======================= bố cục: Danh sách =======================
function DanhSach({ b, nhomTheo, xem, dangXem }: { b: Bang; nhomTheo: NhomTheo; xem: (ma: string) => void; dangXem: string | null }) {
  const chan = (e: { stopPropagation: () => void }) => e.stopPropagation()
  return (
    <div className="b-ds" role="table" aria-label="Ticket">
      <div className="b-ds-hang b-ds-dau" role="row">
        <DauCot la="span" b={b} ten="Ticket" cot={SAP_TICKET} loc={['uu', 'nhom']} /><DauCot la="span" b={b} ten="Việc tiếp theo" />
        <DauCot la="span" b={b} ten="Trạng thái" /><DauCot la="span" b={b} ten="Hạn" cot="han" phai />
        <DauCot la="span" b={b} ten="Chủ" loc="chu" menuPhai />
      </div>
      {b.thay.length === 0 && <Rong b={b} />}
      {gom(b.hien, nhomTheo).map((g) => (
        <div key={g.key} role="rowgroup">
          {g.nhan && <div className="b-nhom-dau b-nhom-ds" role="row">{g.nhan}<span className="b-mo">{g.rows.length}</span></div>}
          {g.rows.map((t) => (
            <div key={t.ma} className="b-ds-hang" role="row" tabIndex={0} data-ma={t.ma} data-xem={dangXem === t.ma || undefined} onClick={() => xem(t.ma)} onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && xem(t.ma)}>
              <span className="b-ticket" onClick={chan}>
                <span className="b-nhan-dau"><OTruong id="uu" t={t} b={b} /><OTruong id="nhom" t={t} b={b} /></span>
                <button className="b-mo-ticket" onClick={() => xem(t.ma)} aria-label={`Mở ${t.ma}`}><span className="b-ma">{t.ma}</span></button>
                <OTruong id="khach" t={t} b={b} />
              </span>
              <span className="b-viec-o" onClick={chan}><OTruong id="viec" t={t} b={b} /></span>
              <span className="b-ds-tt" onClick={chan}><OTruong id="tt" t={t} b={b} /></span>
              <span className="b-phai" onClick={chan}><OTruong id="han" t={t} b={b} /></span>
              <span className="b-ds-chu" onClick={chan}><OTruong id="chu" t={t} b={b} gon /></span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ======================= bố cục: Bảng =======================
function BangCot({ b, nhomTheo, xem, dangXem, an, thuTu, setThuTu, rong, setRong }: {
  b: Bang; nhomTheo: NhomTheo; xem: (ma: string) => void; dangXem: string | null
  an: CotId[]; thuTu: CotId[]; setThuTu: (v: CotId[]) => void; rong: Record<CotId, number>; setRong: (v: Record<CotId, number>) => void
}) {
  const hien = thuTu.filter((id) => !an.includes(id)).map((id) => COT.find((c) => c.id === id)!)
  const [keo, setKeo] = useState<CotId | null>(null)
  const [tren, setTren] = useState<{ id: CotId; sau: boolean } | null>(null) // cột đang rê qua + thả bên phải hay trái
  const co = useRef<{ id: CotId; x: number; w: number } | null>(null)
  const tong = 36 + hien.reduce((s, c) => s + rong[c.id], 0)

  const tha = (e: DragEvent, dich: CotId) => {
    e.preventDefault(); const sau = tren?.sau; setTren(null)
    if (!keo || keo === dich) return
    const m = thuTu.filter((x) => x !== keo); m.splice(m.indexOf(dich) + (sau ? 1 : 0), 0, keo); setThuTu(m); setKeo(null)
  }
  // bóng kéo: nhãn cột dạng thẻ nhỏ đi theo chuột (thay ảnh mờ mặc định của trình duyệt)
  const batDauKeo = (e: DragEvent, c: (typeof COT)[number]) => {
    setKeo(c.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.ten)
    const bong = document.createElement('div'); bong.className = 'b-keo-bong'; bong.textContent = c.ten
    document.querySelector('.proto')?.appendChild(bong); e.dataTransfer.setDragImage(bong, 14, 14); setTimeout(() => bong.remove())
  }
  const veQua = (e: DragEvent, id: CotId) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'
    const r = e.currentTarget.getBoundingClientRect(); const sau = e.clientX > r.left + r.width / 2
    if (tren?.id !== id || tren.sau !== sau) setTren({ id, sau })
  }
  const vach = (id: CotId) => (keo && keo !== id && tren?.id === id ? (tren.sau ? 'phai' : 'trai') : undefined)
  const batDauCo = (e: PE, id: CotId) => { e.preventDefault(); e.stopPropagation(); (e.target as HTMLElement).setPointerCapture(e.pointerId); co.current = { id, x: e.clientX, w: rong[id] } }
  const keoCo = (e: PE) => { const c = co.current; if (c) setRong({ ...rong, [c.id]: Math.max(56, Math.round(c.w + e.clientX - c.x)) }) }

  const o = (t: Ticket, id: CotId): ReactNode => {
    switch (id) {
      case 'ma': return <button className="b-mo-ticket" onClick={() => xem(t.ma)} aria-label={`Mở ${t.ma}`}><span className="b-ma">{t.ma}</span><Eye className="b-mo-ticket-i" aria-hidden /></button>
      case 'khach': return <OTruong id="khach" t={t} b={b} />
      case 'may': return <span className="b-may b-cat">{t.may}{t.serial && <span className="b-mo"> · {t.serial}</span>}</span>
      case 'mo': return <span className="b-so">{MO(t) ? `${t.moNgay} ngày` : '—'}</span>
      case 'nguon': return <NguonTag t={t} />
      case 'lam': case 'chu': return <OTruong id={id} t={t} b={b} gon={rong[id] < 112} />
      default: return <OTruong id={id} t={t} b={b} />
    }
  }
  return (
    <div className="b-bang-khung">
      <table className="b-bang b-bang-c" style={{ width: tong, minWidth: '100%' }}>
        <colgroup><col style={{ width: 36 }} />{hien.map((c) => <col key={c.id} style={{ width: rong[c.id] }} />)}</colgroup>
        <thead>
          <tr>
            <th className="b-cot-chon"><OChonTatCa b={b} /></th>
            {hien.map((c) => (
              <th key={c.id} className={'b-th-keo' + (c.id === 'han' || c.id === 'mo' ? ' b-phai' : '')} draggable
                data-tren={vach(c.id)} data-keo={keo === c.id || undefined}
                onDragStart={(e) => batDauKeo(e, c)} onDragEnd={() => { setKeo(null); setTren(null) }}
                onDragOver={(e) => veQua(e, c.id)} onDrop={(e) => tha(e, c.id)}>
                <DauCot la="o" b={b} ten={c.ten} cot={c.sap} loc={c.loc} menuPhai={c.id === 'chu'} />
                <span className="b-co" role="separator" aria-label={`Đổi độ rộng cột ${c.ten}`} aria-orientation="vertical"
                  onPointerDown={(e) => batDauCo(e, c.id)} onPointerMove={keoCo} onPointerUp={() => { co.current = null }}
                  onDoubleClick={() => setRong({ ...rong, [c.id]: COT.find((x) => x.id === c.id)!.w })} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gom(b.hien, nhomTheo).map((g) => [
            g.nhan ? <tr key={'g' + g.key} className="b-nhom-tr"><td colSpan={hien.length + 1}><span className="b-nhom-dau">{g.nhan}<span className="b-mo">{g.rows.length}</span></span></td></tr> : null,
            ...g.rows.map((t) => (
              <tr key={t.ma} data-ma={t.ma} data-chon={b.chon.has(t.ma) || undefined} data-xem={dangXem === t.ma || undefined}>
                <td className="b-cot-chon"><OChon b={b} ma={t.ma} /></td>
                {hien.map((c) => <td key={c.id} className={c.id === 'han' || c.id === 'mo' ? 'b-phai' : undefined} data-tren={vach(c.id)} data-keo={keo === c.id || undefined}>{o(t, c.id)}</td>)}
              </tr>
            )),
          ])}
        </tbody>
      </table>
      {b.thay.length === 0 && <Rong b={b} />}
    </div>
  )
}

// ======================= bố cục: Kanban =======================
const COT_K: TrangThai[] = ['Mới', 'Đang xử lý', 'Chờ', 'Chờ khách xác nhận', 'Đóng']
function KanbanTT({ b, xem, dangXem }: { b: Bang; xem: (ma: string) => void; dangXem: string | null }) {
  const [keo, setKeo] = useState<string | null>(null)
  const [tren, setTren] = useState<TrangThai | null>(null)
  const tha = (e: DragEvent, tt: TrangThai) => {
    e.preventDefault(); setTren(null)
    const t = b.rows.find((x) => x.ma === keo); setKeo(null)
    if (t && t.tt !== tt) b.sua(t.ma, { tt, lyDoCho: tt === 'Chờ' ? 'khách' : undefined }, `${t.ma} → ${tt}`)
  }
  return (
    <div className="b-kanban">
      {COT_K.map((tt) => {
        const the = b.thay.filter((t) => t.tt === tt)
        return (
          <section key={tt} className="b-k-cot" data-tren={tren === tt || undefined} aria-label={tt}
            onDragOver={(e) => { e.preventDefault(); setTren(tt) }} onDragLeave={() => setTren(null)} onDrop={(e) => tha(e, tt)}>
            <header className="b-k-dau"><ChipTT t={{ tt } as Ticket} nho /><span className="b-mo">{the.length}</span></header>
            <div className="b-k-ds">
              {the.map((t) => (
                <article key={t.ma} className="ui-card b-the" draggable data-ma={t.ma} data-keo={keo === t.ma || undefined} data-xem={dangXem === t.ma || undefined} tabIndex={0}
                  onDragStart={() => setKeo(t.ma)} onDragEnd={() => { setKeo(null); setTren(null) }} onClick={() => xem(t.ma)} onKeyDown={(e) => e.key === 'Enter' && xem(t.ma)}>
                  <div className="b-the-dau"><NhanDau t={t} /></div>
                  <div className="b-the-khach"><Khach t={t} /></div>
                  <div className="b-the-viec">{t.viecTiep}</div>
                  <div className="b-the-chan"><span className="b-ma">{t.ma}</span><Han t={t} /><span style={{ flex: 1 }} /><Avatar ten={t.chu} nho /></div>
                </article>
              ))}
              {!the.length && <div className="b-k-rong">Kéo thẻ vào đây</div>}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ======================= panel xem nhanh (nổi bên phải, mọi bố cục) =======================
function XemNhanh({ b, ma, setMa, laTrang, moTrang }: { b: Bang; ma: string; setMa: (v: string | null) => void; laTrang?: boolean; moTrang?: (ma: string) => void }) {
  const t = b.rows.find((x) => x.ma === ma)
  const i = b.thay.findIndex((x) => x.ma === ma)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as Element).closest?.('input, textarea, [role=menu]')) return
      if (e.key === 'Escape') setMa(null)
      if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); const n = b.thay[i + 1]; if (n) setMa(n.ma) }
      if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); const n = b.thay[i - 1]; if (n) setMa(n.ma) }
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [b.thay, i, setMa])
  if (!t) return null
  return (
    <aside className={laTrang ? 'b-chitiet b-chitiet-trang' : 'b-chitiet'} aria-label={laTrang ? `Ticket ${t.ma}` : `Xem nhanh ${t.ma}`}>
      <div className="b-ct-dau">
        {laTrang && <><button className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Về danh sách ticket (Esc)" data-tip="Về danh sách" onClick={() => setMa(null)}><ArrowLeft aria-hidden /></button><button className="b-ct-ve" onClick={() => setMa(null)}>Ticket</button><span className="b-mo">/</span></>}
        <span className="b-ma">{t.ma}</span><span className="b-mo b-cat">· {t.moNgay ? `mở ${t.moNgay} ngày · ` : ''}cập nhật {t.capNhat}</span>
        <span style={{ flex: 1 }} />
        <button className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Ticket trước (↑)" disabled={i <= 0} onClick={() => setMa(b.thay[i - 1].ma)}><CaretLeft aria-hidden /></button>
        <button className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Ticket sau (↓)" disabled={i < 0 || i >= b.thay.length - 1} onClick={() => setMa(b.thay[i + 1].ma)}><CaretRight aria-hidden /></button>
        {!laTrang && <button className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Mở trang ticket" onClick={() => moTrang?.(t.ma)}><ArrowSquareOut aria-hidden /></button>}
        {!laTrang && <button className="ui-btn ui-tip" data-variant="ghost" data-size="icon-sm" aria-label="Đóng xem nhanh (Esc)" onClick={() => setMa(null)}><X aria-hidden /></button>}
      </div>
      <div className="b-ct-cuon">
        <div className="b-ct-nhan-dau"><OTruong id="uu" t={t} b={b} /><OTruong id="nhom" t={t} b={b} /></div>
        <h2 className="b-ct-ten">{t.khach}</h2>
        <div className="b-ct-phu">{t.may}{t.serial ? ` · ${t.serial}` : ' · chưa có serial'} · <NguonTag t={t} /></div>
        {t.luuY && <div className="b-ct-luuy" role="note"><b>Lưu ý khách — phải đọc</b><span>Khách khó tính, đã từng phàn nàn chậm phản hồi. Gọi trước khi KT tới.</span></div>}
        <div className="b-ct-luoi">
          <span className="b-ct-nhan">Trạng thái</span><OTruong id="tt" t={t} b={b} />
          <span className="b-ct-nhan">Chủ ticket</span><OTruong id="chu" t={t} b={b} />
          <span className="b-ct-nhan">Việc tiếp theo</span><OTruong id="viec" t={t} b={b} />
          <span className="b-ct-nhan">Người đang làm</span><OTruong id="lam" t={t} b={b} />
          <span className="b-ct-nhan">Hạn</span><OTruong id="han" t={t} b={b} />
        </div>
        <div className="b-ct-muc">Nhật ký theo lần báo</div>
        <ol className="b-nk">
          <li><b>Khách báo · 15/11</b><span>{t.nhom === 'Rò rỉ nước' ? 'Rò nước dưới đáy máy, đọng vũng nhỏ.' : 'Máy báo lỗi trên màn hình, khách gửi ảnh qua Zalo.'}</span></li>
          <li className="b-nk-xl"><b>Xử lý · 16/11 · {t.chu}</b><span>Gọi hướng dẫn khách tắt van cấp, chụp đáy máy.</span></li>
          <li className="b-nk-xl"><b>Xử lý · 17/11 · {t.nguoiLam}</b><span>{t.viecTiep}.</span></li>
        </ol>
      </div>
    </aside>
  )
}

// ======================= màn gộp =======================
type MoSan = { boCuc: BoCuc; nhomTheo?: NhomTheo; xem?: boolean }
function ManTicket({ moSan }: { moSan: MoSan }) {
  const b = useBang()
  const [boCuc, setBoCuc] = useState<BoCuc>(moSan.boCuc)
  const [nhomTheo, setNhomTheo] = useState<NhomTheo>(moSan.nhomTheo ?? '')
  const [an, setAn] = useState<CotId[]>(AN_MAC_DINH)
  const [thuTu, setThuTu] = useState<CotId[]>(COT.map((c) => c.id))
  const [rong, setRong] = useState(() => Object.fromEntries(COT.map((c) => [c.id, c.w])) as Record<CotId, number>)
  const [xem, setXemMa] = useState<string | null>(moSan.xem ? b.thay[0]?.ma ?? null : null)
  // 18/11: mặc định TẮT xem nhanh — bấm ticket mở trang chi tiết; người dùng bật nút trên thanh công cụ thì bấm mới ra thẻ bên phải
  const [xemBat, setXemBatRaw] = useState(!!moSan.xem)
  const [trang, setTrang] = useState<string | null>(null)
  const setXem = (ma: string | null) => (xemBat || !ma ? setXemMa(ma) : setTrang(ma))
  const xemNhanh = (ma: string) => { setXemBatRaw(true); setXemMa(ma) }
  const setXemBat = (v: boolean) => { setXemBatRaw(v); if (v && !xem) setXemMa(b.thay[0]?.ma ?? null) }
  const dangXem = xemBat ? xem : null
  const [cp, setCp] = useState<ChuotPhai | null>(null)
  const dongCp = useCallback(() => setCp(null), [])
  const moCp = (e: MouseEvent) => {
    const dong = (e.target as Element).closest<HTMLElement>('[data-ma]')
    if (!dong || (e.target as Element).closest('input, textarea, [role=menu]')) return
    e.preventDefault()
    const r = dong.getBoundingClientRect() // phím Menu bắn contextmenu không có toạ độ chuột → neo dưới dòng
    const banPhim = !e.clientX && !e.clientY
    setCp({ ma: dong.dataset.ma!, x: banPhim ? r.left + 16 : e.clientX, y: banPhim ? r.bottom : e.clientY, banPhim })
  }
  const congCu = useMemo(() => ({ b, boCuc, setBoCuc, an, setAn, thuTu, nhomTheo, setNhomTheo }), [b, boCuc, an, thuTu, nhomTheo])
  if (trang) return (
    <div className="b-trang">
      <XemNhanh b={b} ma={trang} setMa={setTrang} laTrang />
      <Toast b={b} />
    </div>
  )
  return (
    <>
    <div className={'b-trang' + (boCuc === 'kanban' ? ' b-trang-k' : '')} data-xem={dangXem ? '' : undefined} onContextMenu={moCp}>
      <ThanhLoc b={b} phai={<ThanhCongCu {...congCu} xemBat={xemBat} setXemBat={setXemBat} />} />
      {boCuc === 'ds' && <DanhSach b={b} nhomTheo={nhomTheo} xem={setXem} dangXem={dangXem} />}
      {boCuc === 'bang' && <BangCot b={b} nhomTheo={nhomTheo} xem={setXem} dangXem={dangXem} an={an} thuTu={thuTu} setThuTu={setThuTu} rong={rong} setRong={setRong} />}
      {boCuc !== 'kanban' && <ChanTrang b={b} />}
      {boCuc === 'kanban' && <KanbanTT b={b} xem={setXem} dangXem={dangXem} />}
      {boCuc === 'bang' && <ThanhHangLoat b={b} />}
      <Toast b={b} />
    </div>
    {/* ngoài .b-trang: .b-trang có container-type (layout containment) sẽ thành khung chứa của position:fixed */}
    {dangXem && <XemNhanh b={b} ma={dangXem} setMa={setXemMa} moTrang={setTrang} />}
    {cp && <MenuChuotPhai cp={cp} b={b} moTrang={setTrang} xemNhanh={xemNhanh} dong={dongCp} />}
    </>
  )
}

// ======================= thanh chuyển + trang =======================
const DS: { k: string; ten: string; moSan: MoSan }[] = [
  { k: 'A', ten: 'Danh sách — bấm ô để sửa, bấm dòng mở trang ticket, chuột phải: thao tác', moSan: { boCuc: 'ds' } },
  { k: 'B', ten: 'Bảng — kéo đổi chỗ cột, kéo mép co dãn, sửa tại chỗ', moSan: { boCuc: 'bang' } },
  { k: 'C', ten: 'Bảng nhóm theo trạng thái', moSan: { boCuc: 'bang', nhomTheo: 'tt' } },
  { k: 'D', ten: 'Danh sách + xem nhanh mở sẵn (↑ ↓ để lướt)', moSan: { boCuc: 'ds', xem: true } },
  { k: 'E', ten: 'Kanban — kéo thẻ đổi trạng thái', moSan: { boCuc: 'kanban' } },
]

export function BangPrototype({ variant }: { variant: string }) {
  const router = useRouter()
  const i = Math.max(0, DS.findIndex((d) => d.k === variant))
  const toi = (n: number) => router.replace(`?variant=${DS[(i + n + DS.length) % DS.length].k}`, { scroll: false })
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable], [role=menu]')) return
      if (document.querySelector('.b-chitiet')) return // đang xem nhanh: ← → không đổi phương án
      if (e.key === 'ArrowLeft') toi(-1)
      if (e.key === 'ArrowRight') toi(1)
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  })
  return (
    <>
      <Khung che="dock" mucChon="Ticket"><ManTicket key={DS[i].k} moSan={DS[i].moSan} /></Khung>
      {process.env.NODE_ENV !== 'production' && (
        <div className="p-switcher" role="toolbar" aria-label="Chuyển trạng thái mở sẵn">
          <button onClick={() => toi(-1)} aria-label="Trước"><CaretLeft size={16} aria-hidden /></button>
          <span><b>{DS[i].k}</b> · {DS[i].ten}</span>
          <button onClick={() => toi(1)} aria-label="Sau"><CaretRight size={16} aria-hidden /></button>
        </div>
      )}
    </>
  )
}
