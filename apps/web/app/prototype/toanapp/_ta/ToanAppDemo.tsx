'use client'
// PROTOTYPE — nhóm Toàn app: TimToanCuc (⌘K) + StatCard (màn Tổng quan). Class ở khối "BỔ SUNG DS TOÀN APP" (khung/_proto/ui.css).
// Số liệu Tổng quan: 2 số đầu khớp dữ liệu mẫu bảng ticket; còn lại minh hoạ.
import { useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUp, MagnifyingGlass, Minus, Moon, Sun } from '@phosphor-icons/react'
import { Khoi } from '../../form/_form/FormDemo'
import { TimToanCuc, usePhimTim, type KetQua } from '../../khung/_proto/TimToanCuc'
import { MO } from '../../bang/_bang/chung'
import { HOM_NAY, TICKETS } from '../../bang/_bang/data'

type Stat = { nhan: string; so?: string; donVi?: string; doi?: { chieu: 'len' | 'xuong' | 'giu'; so?: string; nghia?: 'tot' | 'xau'; so_voi: string }; chan?: string; href?: string; trong?: string }

function StatCard({ s }: { s: Stat }) {
  const I = s.doi?.chieu === 'len' ? ArrowUp : s.doi?.chieu === 'xuong' ? ArrowDown : Minus
  const loi = s.doi && (s.doi.chieu === 'giu' ? `Không đổi ${s.doi.so_voi}` : `${s.doi.chieu === 'len' ? 'Tăng' : 'Giảm'} ${s.doi.so} ${s.doi.so_voi}${s.doi.nghia === 'tot' ? ', tốt' : s.doi.nghia === 'xau' ? ', cần chú ý' : ''}`)
  const ruot = (
    <>
      <span className="ui-kpi-label">{s.nhan}</span>
      <span className="ui-kpi-value">{s.so ?? '—'}{s.so && s.donVi && <span className="ui-stat-unit">{s.donVi}</span>}</span>
      {s.trong ? <span className="ui-stat-delta">{s.trong}</span> : s.doi && (
        <span className="ui-stat-delta" data-nghia={s.doi.nghia}>
          <b aria-hidden><I />{s.doi.so}</b><span aria-hidden>{s.doi.chieu === 'giu' ? 'không đổi ' : ''}{s.doi.so_voi}</span>
          <span className="ui-sr-only">{loi}</span>
        </span>
      )}
      {s.chan && <span className="ui-stat-foot">{s.chan}<ArrowRight aria-hidden /></span>}
    </>
  )
  return s.href ? <a className="ui-stat" href={s.href}>{ruot}</a> : <div className="ui-stat">{ruot}</div>
}

function StatDangTai() {
  return (
    <div className="ui-stat" role="status" aria-busy>
      <span className="ui-sr-only">Đang tải số liệu</span>
      <span className="ui-skeleton" data-w="1/2" /><span className="ui-skeleton" data-shape="title" data-w="1/3" /><span className="ui-skeleton" data-w="2/3" />
    </div>
  )
}

export function ToanAppDemo({ toi }: { toi?: boolean }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(toi ? 'dark' : 'light')
  const [tim, setTim] = useState(false)
  const [daChon, setDaChon] = useState<KetQua | null>(null)
  usePhimTim(() => setTim(true))
  const dangMo = TICKETS.filter(MO).length
  const quaHan = TICKETS.filter((t) => MO(t) && t.han.slice(0, 10) < HOM_NAY).length
  const STAT: Stat[] = [
    { nhan: 'Ticket đang mở', so: String(dangMo), doi: { chieu: 'len', so: '3', nghia: 'xau', so_voi: 'so với hôm qua' }, chan: `Xem ${dangMo} ticket`, href: '/prototype/bang?variant=A' },
    { nhan: 'Quá hạn', so: String(quaHan), doi: { chieu: 'xuong', so: '1', nghia: 'tot', so_voi: 'so với hôm qua' }, chan: 'Xem ticket quá hạn', href: '/prototype/bang?variant=A' },
    { nhan: 'Phản hồi đầu trung bình', so: '42', donVi: 'phút', doi: { chieu: 'xuong', so: '8 phút', nghia: 'tot', so_voi: 'so với tuần trước' } },
    { nhan: 'Khách phải hỏi lại (tuần này)', so: '7', donVi: 'lần', doi: { chieu: 'len', so: '2', nghia: 'xau', so_voi: 'so với tuần trước' } },
    { nhan: 'Giữ lời hẹn', so: '92', donVi: '%', doi: { chieu: 'giu', so_voi: 'so với tuần trước' } },
    { nhan: 'Báo cáo sau dịch vụ đã gửi', trong: 'Chưa có dữ liệu — tính năng Đợt 2' },
  ]
  return (
    <div className="proto fm" data-theme={theme}>
      <header className="fm-dau">
        <div>
          <h1 className="fm-h1">Toàn app — component DS</h1>
          <p className="ui-caption" style={{ margin: 0 }}>Prototype · dữ liệu minh hoạ · không lưu</p>
        </div>
        <button type="button" className="ui-btn ui-tip" data-variant="outline" data-size="icon" aria-label="Đổi giao diện sáng/tối" data-tip={theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon /> : <Sun />}</button>
      </header>

      <Khoi id="tim" ten="Tìm toàn cục (TimToanCuc)" mo="Spec mục 3: gõ SĐT, tên khách, serial, mã đơn, mã ticket → gợi ý theo loại → Enter mở. Mở bằng nút dưới, Ctrl K (⌘K trên Mac) hoặc nút 🔍 ở khung F.">
        <div className="ta-tim">
          <button type="button" className="ui-btn" data-variant="outline" aria-haspopup="dialog" onClick={() => setTim(true)}>
            <MagnifyingGlass aria-hidden /> Tìm… <kbd className="ui-kbd">Ctrl</kbd><kbd className="ui-kbd">K</kbd>
          </button>
          <span className="ui-caption">Thử gõ: <b>sen vang</b> (không dấu) · <b>TK-2611-04</b> · <b>V9L</b> (serial) · <b>HO-1123</b> (đơn) · <b>4462</b> (đuôi SĐT)</span>
        </div>
        <p className="ui-caption ta-chon" aria-live="polite">{daChon ? <>Đã chọn: <b>{daChon.ten}</b> ({daChon.loai}) — trong khung F sẽ mở đúng màn.</> : 'Chưa chọn gì.'}</p>
      </Khoi>

      <Khoi id="stat" ten="StatCard — màn Tổng quan" mo="Màu theo NGHĨA, không theo chiều: quá hạn GIẢM là tốt (xanh), khách hỏi lại TĂNG là xấu (đỏ). Thẻ có liên kết → bấm mở danh sách đã lọc.">
        <div className="ui-stat-grid">
          {STAT.map((s) => <StatCard key={s.nhan} s={s} />)}
          <StatDangTai />
        </div>
      </Khoi>

      <TimToanCuc mo={tim} dong={() => setTim(false)} chon={setDaChon} />
    </div>
  )
}
