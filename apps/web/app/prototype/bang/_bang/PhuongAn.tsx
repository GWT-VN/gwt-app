'use client'
// PROTOTYPE — lượt 2: 5 phương án bảng ticket CSKH trong khung F (đã chốt). ?variant=A|B|C|D|E
import { useEffect, useState, type DragEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  CaretDown, CaretLeft, CaretRight, Columns, DotsThree, Export, PencilSimple, X,
} from '@phosphor-icons/react'
import { Khung } from '../../khung/_proto/VariantD'
import { LY_DO_CHO, NHAN_VIEN, TT_LIST, UU_LIST, type Ticket, type TrangThai, type UuTien } from './data'
import {
  Avatar, ChipTT, DauCot, Han, NhanDau, SAP_TICKET, Khach, MenuChon, NguonTag, Nguoi, NhanLoi, Noi, NutLoc, OChon, OChonTatCa, Rong, ThanhHangLoat, ThanhLoc,
  Toast, UuTag, useBang, MO, NHOM_LIST, type Bang, type Cot, type Loc,
} from './chung'

// ======================= A. Danh sách nhẹ =======================
function A() {
  const b = useBang()
  return (
    <div className="b-trang">
      <ThanhLoc b={b} />
      <div className="b-ds" role="table" aria-label="Ticket">
        <div className="b-ds-hang b-ds-dau" role="row">
          <DauCot la="span" b={b} ten="Ticket" cot={SAP_TICKET} loc={['uu', 'nhom']} /><DauCot la="span" b={b} ten="Việc tiếp theo" />
          <DauCot la="span" b={b} ten="Trạng thái" /><DauCot la="span" b={b} ten="Hạn" cot="han" phai />
          <DauCot la="span" b={b} ten="Chủ" loc="chu" menuPhai />
        </div>
        {b.thay.length === 0 && <Rong b={b} />}
        {b.thay.map((t) => (
          <div key={t.ma} className="b-ds-hang" role="row" tabIndex={0}>
            <span className="b-ticket"><NhanDau t={t} /><span className="b-ticket-chu"><span className="b-ma">{t.ma}</span><Khach t={t} /></span></span>
            <span className="b-cat b-viec">{t.viecTiep}</span>
            <span><ChipTT t={t} nho /></span>
            <span className="b-phai"><Han t={t} /></span>
            <span className="b-ds-chu" title={`Chủ ticket: ${t.chu}`}><Avatar ten={t.chu} /></span>
            <span className="b-ds-hd"><button className="ui-btn" data-variant="ghost" data-size="icon-sm" aria-label={`Thao tác ${t.ma}`}><DotsThree aria-hidden /></button></span>
          </div>
        ))}
      </div>
      <Toast b={b} />
    </div>
  )
}

// ======================= B. Bảng dữ liệu đầy đủ =======================
const COT_B = [
  { id: 'uu', ten: 'Ưu tiên', sap: 'uu', loc: 'uu' }, { id: 'nhom', ten: 'Loại lỗi', loc: 'nhom' },
  { id: 'ma', ten: 'Mã', sap: 'ma' }, { id: 'khach', ten: 'Khách' }, { id: 'may', ten: 'Máy · serial' },
  { id: 'tt', ten: 'Trạng thái' },
  { id: 'viec', ten: 'Việc tiếp theo' }, { id: 'lam', ten: 'Người đang làm' }, { id: 'han', ten: 'Hạn', sap: 'han' },
  { id: 'chu', ten: 'Chủ', loc: 'chu' }, { id: 'mo', ten: 'Mở', sap: 'moNgay' }, { id: 'nguon', ten: 'Nguồn' },
] as const
type CotB = (typeof COT_B)[number]['id']


function B() {
  const b = useBang()
  const [an, setAn] = useState<CotB[]>(['lam', 'nguon', 'mo'])
  const [moCot, setMoCot] = useState(false)
  const [trang, setTrang] = useState(0)
  const CO = 50 // 18/11: trang 50 dòng — 10 dòng là quá ít, phải bấm trang liên tục
  const hien = COT_B.filter((c) => !an.includes(c.id))
  const soTrang = Math.max(1, Math.ceil(b.thay.length / CO))
  const tr = Math.min(trang, soTrang - 1) // bộ lọc làm ít trang đi → lùi về trang cuối còn có
  const trangRows = b.thay.slice(tr * CO, tr * CO + CO)
  const o = (t: Ticket, id: CotB) => ({
    ma: <span className="b-ma">{t.ma}</span>, khach: <Khach t={t} />,
    may: <span className="b-may">{t.may}{t.serial && <span className="b-mo"> · {t.serial}</span>}</span>,
    nhom: <NhanLoi n={t.nhom} />, uu: <UuTag u={t.uu} />, tt: <ChipTT t={t} nho />,
    viec: <span className="b-cat">{t.viecTiep}</span>, lam: <Nguoi ten={t.nguoiLam} />, han: <Han t={t} />, chu: <Nguoi ten={t.chu} />,
    mo: <span className="b-so">{MO(t) ? `${t.moNgay} ngày` : '—'}</span>, nguon: <NguonTag t={t} />,
  })[id]
  return (
    <div className="b-trang b-trang-rong">
      <ThanhLoc b={b} phai={(
        <div className="b-cong-cu">
          <div className="b-loc-o">
            <button className="b-nut-icon" aria-label="Chọn cột hiển thị" data-tip="Chọn cột" aria-expanded={moCot} onClick={() => setMoCot(!moCot)}><Columns aria-hidden /></button>
            <Noi mo={moCot} dong={() => setMoCot(false)} className="b-noi-phai">
              <div className="ui-menu-label">Hiện cột · lưu vào view của tôi</div>
              {COT_B.map((c) => (
                <label key={c.id} className="ui-menu-item b-menu-cb">
                  <input type="checkbox" className="ui-checkbox" checked={!an.includes(c.id)} disabled={c.id === 'ma'}
                    onChange={() => setAn(an.includes(c.id) ? an.filter((x) => x !== c.id) : [...an, c.id])} />{c.ten}
                </label>
              ))}
            </Noi>
          </div>
          <span className="b-ngan" aria-hidden />
          <button className="b-nut-icon" aria-label="Xuất Excel theo bộ lọc" data-tip="Xuất Excel"><Export aria-hidden /></button>
        </div>
      )} />
      <div className="b-bang-khung">
        <table className="b-bang">
          <thead>
            <tr>
              <th className="b-cot-chon"><OChonTatCa b={b} /></th>
              {hien.map((c) => <DauCot key={c.id} b={b} cot={'sap' in c ? (c.sap as Cot) : undefined} loc={'loc' in c ? (c.loc as Loc) : undefined} ten={c.ten} phai={c.id === 'han' || c.id === 'mo'} />)}
              <th aria-label="Thao tác" />
            </tr>
          </thead>
          <tbody>
            {trangRows.map((t) => (
              <tr key={t.ma} data-chon={b.chon.has(t.ma) || undefined}>
                <td className="b-cot-chon"><OChon b={b} ma={t.ma} /></td>
                {hien.map((c) => <td key={c.id} className={c.id === 'han' || c.id === 'mo' ? 'b-phai' : c.id === 'viec' ? 'b-cot-viec' : undefined}>{o(t, c.id)}</td>)}
                <td className="b-cot-hd"><button className="ui-btn" data-variant="ghost" data-size="icon-sm" aria-label={`Thao tác ${t.ma}`}><DotsThree aria-hidden /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {b.thay.length === 0 && <Rong b={b} />}
      </div>
      <div className="b-chan">
        <span>Hiển thị {b.thay.length ? tr * CO + 1 : 0}–{Math.min(b.thay.length, tr * CO + CO)} / {b.thay.length}</span>
        <span style={{ flex: 1 }} />
        <button className="ui-btn" data-variant="ghost" data-size="icon-sm" disabled={tr === 0} onClick={() => setTrang(tr - 1)} aria-label="Trang trước"><CaretLeft aria-hidden /></button>
        <span className="b-so">Trang {tr + 1} / {soTrang}</span>
        <button className="ui-btn" data-variant="ghost" data-size="icon-sm" disabled={tr + 1 >= soTrang} onClick={() => setTrang(tr + 1)} aria-label="Trang sau"><CaretRight aria-hidden /></button>
      </div>
      <ThanhHangLoat b={b} />
      <Toast b={b} />
    </div>
  )
}

// ======================= C. Sửa tại chỗ =======================
function OSua({ nhan, children, menu, rong }: { nhan: string; children: ReactNode; menu: (dong: () => void) => ReactNode; rong?: boolean }) {
  const [mo, setMo] = useState(false)
  return (
    <span className="b-loc-o b-osua-wrap">
      <button className="b-osua" aria-label={`Sửa ${nhan}`} aria-expanded={mo} aria-haspopup="menu" onClick={() => setMo(!mo)}>
        {children}<CaretDown className="b-osua-mui" aria-hidden />
      </button>
      <Noi mo={mo} dong={() => setMo(false)} className={rong ? 'b-noi-rong' : undefined}>{menu(() => setMo(false))}</Noi>
    </span>
  )
}

function SuaChu({ t, b }: { t: Ticket; b: Bang }) {
  const [sua, setSua] = useState(false)
  const [v, setV] = useState(t.viecTiep)
  if (!sua) return (
    <button className="b-osua b-osua-chu" onClick={() => { setV(t.viecTiep); setSua(true) }} aria-label={`Sửa việc tiếp theo ${t.ma}`}>
      <span className="b-cat">{t.viecTiep}</span><PencilSimple className="b-osua-mui" aria-hidden />
    </button>
  )
  const luu = () => { setSua(false); if (v.trim() && v !== t.viecTiep) b.sua(t.ma, { viecTiep: v.trim() }, `${t.ma}: đã lưu việc tiếp theo`) }
  return (
    <input className="ui-input b-osua-input" autoFocus value={v} onChange={(e) => setV(e.target.value)} onBlur={luu}
      onKeyDown={(e) => { if (e.key === 'Enter') luu(); if (e.key === 'Escape') setSua(false) }} aria-label="Việc tiếp theo" />
  )
}

function SuaHan({ t, b }: { t: Ticket; b: Bang }) {
  const [ngay, gio] = t.han.split(' ')
  return (
    <span className="b-osua b-osua-han">
      <Han t={t} />
      <input type="date" className="b-han-input" value={ngay} aria-label={`Đổi hạn ${t.ma}`}
        onChange={(e) => e.target.value && b.sua(t.ma, { han: `${e.target.value} ${gio}` }, `${t.ma}: đã dời hạn`)} />
    </span>
  )
}

function C() {
  const b = useBang()
  return (
    <div className="b-trang b-trang-rong">
      <ThanhLoc b={b} />
      <div className="b-bang-khung">
        <table className="b-bang b-bang-c">
          {/* độ rộng cột cố định: bảng không tự bóp ô thành "H.." — cột Việc tiếp theo nhận phần còn lại */}
          <colgroup><col className="c-chon" /><col className="c-ticket" /><col className="c-tt" /><col /><col className="c-lam" /><col className="c-han" /><col className="c-chu" /></colgroup>
          <thead>
            <tr>
              <th className="b-cot-chon"><OChonTatCa b={b} /></th>
              <DauCot b={b} ten="Ticket" cot={SAP_TICKET} loc={['uu', 'nhom']} /><DauCot b={b} ten="Trạng thái" />
              <th>Việc tiếp theo</th><th title="Người đang phải làm">Làm</th><DauCot b={b} ten="Hạn" cot="han" /><DauCot b={b} ten="Chủ" loc="chu" menuPhai />
            </tr>
          </thead>
          <tbody>
            {b.thay.map((t) => (
              <tr key={t.ma} data-chon={b.chon.has(t.ma) || undefined}>
                <td className="b-cot-chon"><OChon b={b} ma={t.ma} /></td>
                <td>
                  <span className="b-ticket">
                    <span className="b-nhan-dau">
                      <OSua nhan={`ưu tiên ${t.ma}`} menu={(dong) => <MenuChon<UuTien> ds={UU_LIST} gt={t.uu} nhan={(v) => <UuTag u={v} />} chon={(v) => { b.sua(t.ma, { uu: v }, `${t.ma}: ưu tiên ${v}`); dong() }} />}>
                        <UuTag u={t.uu} />
                      </OSua>
                      <OSua nhan={`loại lỗi ${t.ma}`} rong menu={(dong) => <MenuChon ds={NHOM_LIST} gt={t.nhom} nhan={(v) => <NhanLoi n={v} />} chon={(v) => { b.sua(t.ma, { nhom: v }, `${t.ma}: loại lỗi ${v}`); dong() }} />}>
                        <NhanLoi n={t.nhom} />
                      </OSua>
                    </span>
                    <span className="b-ticket-chu"><span className="b-ma">{t.ma}</span><Khach t={t} /></span>
                  </span>
                </td>
                <td>
                  <OSua nhan="trạng thái" menu={(dong) => (
                    <>
                      <MenuChon<TrangThai> ds={TT_LIST} gt={t.tt} nhan={(v) => <ChipTT t={{ ...t, tt: v, lyDoCho: undefined }} nho />}
                        chon={(v) => { b.sua(t.ma, { tt: v, lyDoCho: v === 'Chờ' ? t.lyDoCho ?? 'khách' : undefined }, `${t.ma} → ${v}`); dong() }} />
                      {t.tt === 'Chờ' && (
                        <>
                          <div className="ui-menu-sep" /><div className="ui-menu-label">Lý do chờ</div>
                          <MenuChon ds={LY_DO_CHO} gt={t.lyDoCho ?? 'khách'} chon={(v) => { b.sua(t.ma, { lyDoCho: v }, `${t.ma}: chờ ${v}`); dong() }} />
                        </>
                      )}
                    </>
                  )}><ChipTT t={t} nho /></OSua>
                </td>
                <td className="b-cot-viec"><SuaChu t={t} b={b} /></td>
                <td>
                  <OSua nhan="người đang làm" rong menu={(dong) => <MenuChon ds={[...NHAN_VIEN, t.khach]} gt={t.nguoiLam} tim chon={(v) => { b.sua(t.ma, { nguoiLam: v }, `${t.ma}: giao cho ${v}`); dong() }} />}>
                    <Nguoi ten={t.nguoiLam} />
                  </OSua>
                </td>
                <td><SuaHan t={t} b={b} /></td>
                <td>
                  <OSua nhan={`chủ ticket ${t.chu}`} rong menu={(dong) => <MenuChon ds={NHAN_VIEN.slice(0, 4)} gt={t.chu} tim chon={(v) => { b.sua(t.ma, { chu: v }, `${t.ma}: chủ mới ${v}`); dong() }} />}>
                    <span title={`Chủ ticket: ${t.chu}`}><Avatar ten={t.chu} /></span>
                  </OSua>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {b.thay.length === 0 && <Rong b={b} />}
      </div>
      <ThanhHangLoat b={b} />
      <Toast b={b} />
    </div>
  )
}

// ======================= D. Danh sách + panel chi tiết =======================
function D() {
  const b = useBang()
  const [ma, setMa] = useState<string | null>(null)
  const t = b.rows.find((x) => x.ma === ma) ?? null
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, [role=menu]')) return
      const i = b.thay.findIndex((x) => x.ma === ma)
      if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); setMa(b.thay[i < 0 ? 0 : Math.min(b.thay.length - 1, i + 1)]?.ma ?? ma) }
      if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); setMa(b.thay[Math.max(0, i - 1)]?.ma ?? ma) }
      if (e.key === 'Escape') setMa(null)
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [b.thay, ma])
  return (
    <div className="b-tach" data-mo={t ? '' : undefined}>
      <div className="b-tach-trai">
        <div className="b-trang b-trang-tach">
          <ThanhLoc b={b} phai={<NutLoc b={b} />} />
          <div className="b-dsd" role="listbox" aria-label="Ticket">
            {b.thay.length === 0 && <Rong b={b} />}
            {b.thay.map((x) => (
              <button key={x.ma} className="b-dsd-hang" role="option" aria-selected={x.ma === ma} onClick={() => setMa(x.ma)}>
                <span className="b-dsd-giua">
                  <span className="b-dsd-dong1"><UuTag u={x.uu} /><NhanLoi n={x.nhom} /><Khach t={x} /></span>
                  <span className="b-dsd-dong2 b-cat"><span className="b-ma">{x.ma}</span> · {x.viecTiep}</span>
                </span>
                <span className="b-dsd-phai"><Han t={x} /><Avatar ten={x.chu} nho /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {!t && (
        <aside className="b-chitiet b-ct-trong" aria-label="Chi tiết ticket">
          <div className="b-rong"><div className="b-rong-tieude">Chọn một ticket để xem</div><div className="b-rong-mo">Bấm vào dòng bên trái, hoặc dùng ↑ ↓ để lướt qua từng ticket mà không rời danh sách.</div></div>
        </aside>
      )}
      {t && (
        <aside className="b-chitiet" aria-label={`Chi tiết ${t.ma}`}>
          <div className="b-ct-dau">
            <span className="b-ma">{t.ma}</span><span className="b-mo b-cat">· {t.moNgay ? `mở ${t.moNgay} ngày · ` : ''}cập nhật {t.capNhat}</span>
            <span style={{ flex: 1 }} />
            <button className="ui-btn" data-variant="ghost" data-size="sm">Mở trang</button>
            <button className="ui-btn" data-variant="ghost" data-size="icon-sm" aria-label="Đóng chi tiết" onClick={() => setMa(null)}><X aria-hidden /></button>
          </div>
          <div className="b-ct-cuon">
            <h2 className="b-ct-ten">{t.khach}</h2>
            <div className="b-ct-phu">{t.may}{t.serial ? ` · ${t.serial}` : ' · chưa có serial'} · {t.nhom} · <NguonTag t={t} /></div>
            {t.luuY && <div className="b-ct-luuy" role="note"><b>Lưu ý khách — phải đọc</b><span>Khách khó tính, đã từng phàn nàn chậm phản hồi. Gọi trước khi KT tới.</span></div>}
            <div className="b-ct-luoi">
              <span className="b-ct-nhan">Trạng thái</span>
              <OSua nhan="trạng thái" menu={(dong) => <MenuChon<TrangThai> ds={TT_LIST} gt={t.tt} chon={(v) => { b.sua(t.ma, { tt: v }, `${t.ma} → ${v}`); dong() }} />}><ChipTT t={t} /></OSua>
              <span className="b-ct-nhan">Ưu tiên</span>
              <OSua nhan="ưu tiên" menu={(dong) => <MenuChon<UuTien> ds={UU_LIST} gt={t.uu} chon={(v) => { b.sua(t.ma, { uu: v }, `${t.ma}: ưu tiên ${v}`); dong() }} />}><UuTag u={t.uu} /></OSua>
              <span className="b-ct-nhan">Chủ ticket</span>
              <OSua nhan="chủ" rong menu={(dong) => <MenuChon ds={NHAN_VIEN.slice(0, 4)} gt={t.chu} tim chon={(v) => { b.sua(t.ma, { chu: v }, `${t.ma}: chủ mới ${v}`); dong() }} />}><Nguoi ten={t.chu} /></OSua>
              <span className="b-ct-nhan">Việc tiếp theo</span>
              <SuaChu t={t} b={b} />
              <span className="b-ct-nhan">Người đang làm</span>
              <OSua nhan="người làm" rong menu={(dong) => <MenuChon ds={[...NHAN_VIEN, t.khach]} gt={t.nguoiLam} tim chon={(v) => { b.sua(t.ma, { nguoiLam: v }, `${t.ma}: giao cho ${v}`); dong() }} />}><Nguoi ten={t.nguoiLam} /></OSua>
              <span className="b-ct-nhan">Hạn</span>
              <SuaHan t={t} b={b} />
            </div>
            <div className="b-ct-muc">Nhật ký theo lần báo</div>
            <ol className="b-nk">
              <li><b>Khách báo · 15/11</b><span>{t.viecTiep.includes('rò') ? 'Rò nước dưới đáy máy, đọng vũng nhỏ.' : 'Máy báo lỗi trên màn hình, khách gửi ảnh qua Zalo.'}</span></li>
              <li className="b-nk-xl"><b>Xử lý · 16/11 · {t.chu}</b><span>Gọi hướng dẫn khách tắt van cấp, chụp đáy máy.</span></li>
              <li className="b-nk-xl"><b>Xử lý · 17/11 · {t.nguoiLam}</b><span>{t.viecTiep}.</span></li>
            </ol>
          </div>
        </aside>
      )}
      <Toast b={b} />
    </div>
  )
}

// ======================= E. Kanban theo trạng thái =======================
const COT_K: TrangThai[] = ['Mới', 'Đang xử lý', 'Chờ', 'Chờ khách xác nhận', 'Đóng']
function E() {
  const b = useBang()
  const [keo, setKeo] = useState<string | null>(null)
  const [tren, setTren] = useState<TrangThai | null>(null)
  const [menu, setMenu] = useState<string | null>(null)
  useEffect(() => { if (b.tab === 'mo') b.setTab('tat-ca') }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const tha = (e: DragEvent, tt: TrangThai) => {
    e.preventDefault(); setTren(null)
    const t = b.rows.find((x) => x.ma === keo); setKeo(null)
    if (t && t.tt !== tt) b.sua(t.ma, { tt, lyDoCho: tt === 'Chờ' ? 'khách' : undefined }, `${t.ma} → ${tt}`)
  }
  return (
    <div className="b-trang b-trang-rong b-trang-k">
      <ThanhLoc b={b} phai={<NutLoc b={b} />} />
      <div className="b-kanban">
        {COT_K.map((tt) => {
          const the = b.thay.filter((t) => t.tt === tt)
          return (
            <section key={tt} className="b-k-cot" data-tren={tren === tt || undefined} aria-label={tt}
              onDragOver={(e) => { e.preventDefault(); setTren(tt) }} onDragLeave={() => setTren(null)} onDrop={(e) => tha(e, tt)}>
              <header className="b-k-dau"><ChipTT t={{ tt } as Ticket} nho /><span className="b-mo">{the.length}</span></header>
              <div className="b-k-ds">
                {the.map((t) => (
                  <article key={t.ma} className="b-the" draggable data-keo={keo === t.ma || undefined}
                    onDragStart={() => setKeo(t.ma)} onDragEnd={() => { setKeo(null); setTren(null) }}>
                    <div className="b-the-dau"><UuTag u={t.uu} /><NhanLoi n={t.nhom} /><span style={{ flex: 1 }} />
                      <span className="b-loc-o">
                        <button className="ui-btn" data-variant="ghost" data-size="icon-sm" aria-label={`Chuyển ${t.ma}`} onClick={() => setMenu(menu === t.ma ? null : t.ma)}><DotsThree aria-hidden /></button>
                        <Noi mo={menu === t.ma} dong={() => setMenu(null)} className="b-noi-phai">
                          <div className="ui-menu-label">Chuyển sang</div>
                          <MenuChon<TrangThai> ds={TT_LIST} gt={t.tt} chon={(v) => { b.sua(t.ma, { tt: v }, `${t.ma} → ${v}`); setMenu(null) }} />
                        </Noi>
                      </span>
                    </div>
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
      <Toast b={b} />
    </div>
  )
}

// ======================= thanh chuyển + trang =======================
const DS = [
  { k: 'A', ten: 'Danh sách nhẹ — đọc nhanh, bấm dòng mở ticket', C: A },
  { k: 'B', ten: 'Bảng dữ liệu đầy đủ — sắp xếp, chọn cột, chọn nhiều, phân trang', C: B },
  { k: 'C', ten: 'Sửa tại chỗ — bấm ô là sửa, lưu ngay, có Hoàn tác', C: C },
  { k: 'D', ten: 'Danh sách + panel chi tiết — xem/sửa không rời danh sách', C: D },
  { k: 'E', ten: 'Kanban theo trạng thái — kéo thẻ để đổi', C: E },
]

export function BangPrototype({ variant }: { variant: string }) {
  const router = useRouter()
  const i = Math.max(0, DS.findIndex((d) => d.k === variant))
  const toi = (n: number) => router.replace(`?variant=${DS[(i + n + DS.length) % DS.length].k}`, { scroll: false })
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable], [role=menu]')) return
      if (e.key === 'ArrowLeft') toi(-1)
      if (e.key === 'ArrowRight') toi(1)
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  })
  const { C: V } = DS[i]
  return (
    <>
      <Khung che="dock" mucChon="Ticket"><V key={DS[i].k} /></Khung>
      {process.env.NODE_ENV !== 'production' && (
        <div className="p-switcher" role="toolbar" aria-label="Chuyển phương án bảng">
          <button onClick={() => toi(-1)} aria-label="Phương án trước"><CaretLeft size={16} aria-hidden /></button>
          <span><b>{DS[i].k}</b> · {DS[i].ten}</span>
          <button onClick={() => toi(1)} aria-label="Phương án sau"><CaretRight size={16} aria-hidden /></button>
        </div>
      )}
    </>
  )
}
