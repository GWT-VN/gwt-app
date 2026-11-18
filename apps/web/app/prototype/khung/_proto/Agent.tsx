'use client'
// PROTOTYPE — ruột hội thoại với agent "Bắp" (kịch bản cứng). Mỗi phương án đặt nó ở một chỗ khác.
import { useState } from 'react'
import { Bell, Clock, Send, UserRound, Check, FileText } from 'lucide-react'
import { GOI_Y_BAP, traLoiMau, type Tin } from './data'

export function TheTraLoi({ tin }: { tin: Tin }) {
  const [daXacNhan, setDaXacNhan] = useState(false)
  if (tin.the === 'nhac')
    return (
      <div className="p-the">
        <div className="p-the-dong"><Clock className="ui-icon" aria-hidden /> 16:00 hôm nay, 18/11</div>
        <div className="p-the-dong"><UserRound className="ui-icon" aria-hidden /> Nhắc: Hiệp · có nhắc cả người giao</div>
        <div className="p-the-dong"><FileText className="ui-icon" aria-hidden /> Gọi lại anh An báo giá linh kiện</div>
        <div className="p-the-dong"><Bell className="ui-icon" aria-hidden /> Gắn: TK-2611-042 · gửi qua Discord</div>
        {daXacNhan ? (
          <span className="ui-badge" data-color="success"><Check size={12} aria-hidden /> Đã tạo lời nhắc</span>
        ) : (
          <div className="ui-row">
            <button className="ui-btn" data-size="sm" onClick={() => setDaXacNhan(true)}>Xác nhận</button>
            <button className="ui-btn" data-size="sm" data-variant="outline">Sửa</button>
          </div>
        )}
      </div>
    )
  if (tin.the === 'tom-tat')
    return (
      <div className="p-the">
        <div className="p-the-dong"><b>TK-2611-042</b> · Nguyễn Văn An · Rò nước đáy CTS20</div>
        <div className="p-the-dong">Mở 2 ngày · 2 lần báo · chưa cử KT · khách có lưu ý đỏ “muốn xác nhận chi phí bằng tin nhắn trước khi làm”.</div>
        <div className="p-the-dong">Gợi ý: tạo phiếu việc KT hôm nay, nhắn báo giá trước.</div>
        <div className="ui-row"><button className="ui-btn" data-size="sm">Tạo phiếu việc KT</button></div>
      </div>
    )
  return null
}

export function KhungChat({ boiCanh, tinDau = [] }: { boiCanh: string; tinDau?: Tin[] }) {
  const [tin, setTin] = useState<Tin[]>(tinDau)
  const [o, setO] = useState('')
  const gui = (cau: string) => {
    if (!cau.trim()) return
    setTin((t) => [...t, { ai: 'nguoi', noiDung: cau }, traLoiMau(cau)])
    setO('')
  }
  return (
    <div className="p-chat">
      <div className="p-boicanh">Đang xem: {boiCanh}</div>
      <div className="p-chat-ds">
        {tin.length === 0 && (
          <p className="p-chat-rong">Hỏi Bắp về ticket, khách, việc — hoặc nhờ tạo việc, nhắc việc. Bắp đọc được màn bạn đang mở.</p>
        )}
        {tin.map((t, i) => (
          <div key={i} className={'p-tin ' + t.ai}>
            <div className="p-tin-noidung">{t.noiDung}</div>
            {t.the && <TheTraLoi tin={t} />}
          </div>
        ))}
      </div>
      <div className="p-goiy">
        {GOI_Y_BAP.map((g) => (
          <button key={g} className="ui-btn" data-variant="outline" data-size="sm" onClick={() => gui(g)}>{g}</button>
        ))}
      </div>
      <form className="p-chat-o" onSubmit={(e) => { e.preventDefault(); gui(o) }}>
        <input className="ui-input" value={o} onChange={(e) => setO(e.target.value)} placeholder="Nhờ Bắp… vd: nhắc Hiệp 16h gọi lại anh An" aria-label="Nhắn cho Bắp" />
        <button className="ui-btn" data-size="icon" aria-label="Gửi"><Send aria-hidden /></button>
      </form>
    </div>
  )
}
