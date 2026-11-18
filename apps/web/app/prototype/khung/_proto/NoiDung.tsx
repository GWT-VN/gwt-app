'use client'
// PROTOTYPE — nội dung màn "Việc hôm nay" dùng chung mọi phương án.
// Bản 2 (18/11): bảng "nhẹ" theo ảnh tham chiếu — không khung thẻ, kẻ dòng rất mờ, rê chuột = nền xám bo tròn,
// bộ lọc là tab chữ, ô tìm dạng viên thuốc, icon công cụ mờ.
import { useMemo, useState, type ComponentType } from 'react'
import {
  AlertTriangle, ArrowRightLeft, ArrowUpRight, Clock, Columns3, Handshake, Hourglass, LayoutList, ListFilter,
  MoreHorizontal, Search, Siren, Sparkles, Wrench,
} from 'lucide-react'
import { VIEC_HOM_NAY, type Dong } from './data'

const ICON_KHOI: Record<string, ComponentType<{ 'aria-hidden'?: boolean }>> = {
  khan: Siren, 'qua-han': Clock, 'loi-hua': Handshake, 'lich-kt': Wrench, cho: Hourglass, 'ban-giao': ArrowRightLeft,
}
const TEN_TAB: Record<string, string> = {
  khan: 'Ca khẩn', 'qua-han': 'Quá hạn', 'loi-hua': 'Lời hứa', 'lich-kt': 'Lịch KT', cho: 'Chờ xem lại', 'ban-giao': 'Bàn giao ca',
}
const bo = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()

export function NoiDung({ hoiBap }: { hoiBap?: (d: Dong) => void }) {
  const [tab, setTab] = useState('tat-ca')
  const [q, setQ] = useState('')
  const [kieu, setKieu] = useState<'ds' | 'bang'>('ds')
  const tong = VIEC_HOM_NAY.reduce((s, k) => s + k.dong.length, 0)

  const khoi = useMemo(() => {
    const k = bo(q.trim())
    return VIEC_HOM_NAY
      .filter((x) => tab === 'tat-ca' || x.id === tab)
      .map((x) => ({ ...x, dong: x.dong.filter((d) => !k || bo(`${d.ma} ${d.khach} ${d.viec} ${d.chu}`).includes(k)) }))
      .filter((x) => x.dong.length > 0)
  }, [tab, q])
  const thay = khoi.reduce((s, k) => s + k.dong.length, 0)

  return (
    <div className="n-trang">
      <header className="n-dau">
        <div className="n-dau-chu">
          <h1 className="n-h1">Việc hôm nay</h1>
          <span className="n-phu">Thứ Tư, 18/11 · dữ liệu demo</span>
        </div>
        <label className="n-tim">
          <Search aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm mã, khách, việc…" aria-label="Tìm trong việc hôm nay" />
        </label>
        <button className="ui-btn">Tạo ticket</button>
      </header>

      <div className="n-thanh">
        <div className="n-tabs" role="tablist" aria-label="Lọc theo khối">
          <button role="tab" className="n-tab" aria-selected={tab === 'tat-ca'} onClick={() => setTab('tat-ca')}>
            Tất cả <span className="n-tab-so">{tong}</span>
          </button>
          {VIEC_HOM_NAY.map((x) => (
            <button key={x.id} role="tab" className="n-tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)}>
              {TEN_TAB[x.id]} <span className="n-tab-so" data-gap={x.tone === 'danger' ? '' : undefined}>{x.dong.length}</span>
            </button>
          ))}
        </div>
        <div className="n-cong-cu">
          <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Bộ lọc"><ListFilter aria-hidden /></button>
          <span className="n-ke" aria-hidden />
          <button className="ui-btn n-kieu" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Xem dạng danh sách" aria-pressed={kieu === 'ds'} onClick={() => setKieu('ds')}><LayoutList aria-hidden /></button>
          <button className="ui-btn n-kieu" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label="Xem dạng bảng Kanban (chưa làm)" aria-pressed={kieu === 'bang'} onClick={() => setKieu('bang')}><Columns3 aria-hidden /></button>
        </div>
      </div>

      <div className="n-bang" role="table" aria-label="Việc hôm nay">
        <div className="n-hang n-tieude" role="row">
          <span role="columnheader" className="n-o-icon-cho" />
          <span role="columnheader">Mã</span>
          <span role="columnheader">Khách</span>
          <span role="columnheader">Việc cần làm</span>
          <span role="columnheader" className="n-han">Hạn</span>
          <span role="columnheader">Người làm</span>
          <span role="columnheader" className="n-nguon">Nguồn</span>
        </div>

        {thay === 0 && (
          <div className="n-rong" role="row">
            <div className="n-rong-tieude">Không có việc nào khớp “{q}”</div>
            <div className="n-rong-mo">Tìm theo mã ticket, tên khách hoặc nội dung việc — không cần gõ dấu.</div>
            <button className="ui-btn" data-variant="outline" data-size="sm" onClick={() => { setQ(''); setTab('tat-ca') }}>Xoá tìm</button>
          </div>
        )}

        {khoi.map((k) => {
          const I = ICON_KHOI[k.id]
          return (
            <div key={k.id} role="rowgroup" className="n-nhom">
              <div className="n-nhom-ten" role="row">
                <span className="n-cham" data-tone={k.tone} aria-hidden />
                {k.ten} <span className="n-nhom-so">{k.dong.length}</span>
                <span className="n-nhom-mo">· {k.mo}</span>
              </div>
              {k.dong.map((d) => (
                <div key={k.id + d.ma + d.viec} className="n-hang" role="row" tabIndex={0}>
                  <span className="n-chon"><input type="checkbox" className="ui-checkbox" aria-label={`Chọn ${d.ma}`} /></span>
                  <span className="n-o-icon" data-tone={k.tone}><I aria-hidden /></span>
                  <span className="n-ma">{d.ma}</span>
                  <span className="n-khach">
                    <span className="n-cat">{d.khach}</span>
                    {d.luuYDo && <span className="n-luuy" title="Khách có lưu ý Phải đọc"><AlertTriangle aria-hidden /> lưu ý</span>}
                  </span>
                  <span className="n-viec">{d.viec}</span>
                  <span className={'n-han' + (d.treHan ? ' tre' : '')}>{d.han || '—'}</span>
                  <span className="n-chu">{d.chu}</span>
                  <span className="n-nguon">
                    {d.nguon === 'Discord' ? <a href="#" className="n-link">Discord <ArrowUpRight aria-hidden /></a> : '—'}
                  </span>
                  <span className="n-hanh-dong">
                    {hoiBap && (
                      <button className="ui-btn" data-variant="ghost" data-size="sm" data-shape="rounded" onClick={() => hoiBap(d)}><Sparkles aria-hidden /> Hỏi Bắp</button>
                    )}
                    <button className="ui-btn" data-variant="ghost" data-size="icon-sm" data-shape="rounded" aria-label={`Thao tác với ${d.ma}`}><MoreHorizontal aria-hidden /></button>
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
