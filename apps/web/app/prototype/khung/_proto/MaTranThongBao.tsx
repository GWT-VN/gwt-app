'use client'
// PROTOTYPE — `MaTranThongBao` (spec v2-mo-ta-app mục 5 + D6, màn Quản trị): hàng = loại thông báo gom theo khu,
// cột = Trong app (chuông, CEO chốt 19/11) · Discord tin riêng · Discord kênh. Bấm là lưu (không nút Lưu).
// Dựng từ DS: ui-table · ui-checkbox · Select (ui-select-trigger + Noi + MenuChon). Dữ liệu giả, tên kênh minh hoạ.
import { useId, useState, type Dispatch, type SetStateAction } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { MenuChon, Noi } from '../../bang/_bang/chung'
import type { LoaiTB } from './ThongBao'

const KENH = ['#viec', '#cskh', '#sales', '#kho', '#quan-tri', '#chung'] as const
export type Kenh = (typeof KENH)[number]
/** null = kênh không áp dụng cho loại này (vd tin tổng hợp chỉ đi kênh chung) */
export type DongTB = {
  id: string; khu: string; ten: string; gui: string; loai?: LoaiTB
  app: boolean | null; rieng: boolean | null; kenh: { bat: boolean; ten: Kenh } | null
}

export const CAU_HINH_TB: DongTB[] = [
  { id: 'giao', khu: 'Việc', ten: 'Được giao việc', gui: 'Người được giao', loai: 'giao', app: true, rieng: true, kenh: null },
  { id: 'han', khu: 'Việc', ten: 'Sắp tới hạn', gui: 'Người đang phải làm', loai: 'han', app: true, rieng: true, kenh: null },
  { id: 'quahan', khu: 'Việc', ten: 'Quá hạn', gui: 'Người làm và người giao', app: true, rieng: true, kenh: { bat: false, ten: '#viec' } },
  { id: 'nhac', khu: 'Việc', ten: 'Được @nhắc', gui: 'Người được nhắc', loai: 'nhac', app: true, rieng: true, kenh: null },
  { id: 'xong', khu: 'Việc', ten: 'Việc mình giao / việc chặn mình đã xong', gui: 'Người giao, người đang chờ', loai: 'xong', app: true, rieng: false, kenh: null },
  { id: 'gio', khu: 'Việc', ten: 'Nhắc việc theo giờ', gui: 'Người đặt nhắc', app: true, rieng: true, kenh: null },
  { id: 'gap', khu: 'CSKH', ten: 'Ticket Gấp chưa ai nhận', gui: 'Cả khu CSKH', loai: 'gap', app: true, rieng: null, kenh: { bat: true, ten: '#cskh' } },
  { id: 'lau', khu: 'CSKH', ten: 'Ticket mở quá 7 ngày', gui: 'Chủ ticket', loai: 'lau', app: true, rieng: false, kenh: { bat: true, ten: '#cskh' } },
  { id: 'bot', khu: 'CSKH', ten: 'Bắp tạo ticket, chờ người nhận', gui: 'Cả khu CSKH', loai: 'bot', app: true, rieng: null, kenh: { bat: true, ten: '#cskh' } },
  { id: 'ho', khu: 'Sales', ten: 'Đơn HO mới', gui: 'Cả khu Sales', app: true, rieng: null, kenh: { bat: true, ten: '#sales' } },
  { id: 'vtp', khu: 'Sales', ten: 'VTP giao đến / giao thành công', gui: 'Người tạo đơn', app: true, rieng: false, kenh: { bat: true, ten: '#sales' } },
  { id: 'ctkm', khu: 'Sales', ten: 'CTKM chờ duyệt', gui: 'Người duyệt', app: true, rieng: true, kenh: null },
  { id: 'kho', khu: 'Kho', ten: 'Kho sắp hết', gui: 'Cả khu Kho', app: true, rieng: null, kenh: { bat: true, ten: '#kho' } },
  { id: 'nv', khu: 'Quản trị', ten: 'Nhân viên mới chờ duyệt', gui: 'Quản trị', app: true, rieng: true, kenh: null },
  { id: 'tin', khu: 'Chung', ten: 'Tin tổng hợp 8h / 17h', gui: 'Mọi người', app: null, rieng: null, kenh: { bat: true, ten: '#chung' } },
]

/** Loại thông báo đang bật cột Trong app — chuông lọc theo đây */
export const batTrongApp = (ch: DongTB[], loai: LoaiTB) => ch.find((d) => d.loai === loai)?.app !== false

const COT = [{ k: 'app', ten: 'Trong app' }, { k: 'rieng', ten: 'Discord · tin riêng' }, { k: 'kenh', ten: 'Discord · kênh' }] as const

function KhongApDung() {
  return <><span className="ui-notif-matrix-na" aria-hidden>—</span><span className="ui-sr-only">Không áp dụng</span></>
}

function ChonKenh({ d, doi }: { d: DongTB & { kenh: NonNullable<DongTB['kenh']> }; doi: (k: Kenh) => void }) {
  const [mo, setMo] = useState(false)
  return (
    <span className="ui-notif-matrix-select">
      <button type="button" className="ui-select-trigger" aria-haspopup="menu" aria-expanded={mo} disabled={!d.kenh.bat}
        aria-label={`Kênh Discord cho “${d.ten}”: ${d.kenh.ten}`} onClick={() => setMo(!mo)}>
        <span className="ui-select-value">{d.kenh.ten}</span><CaretDown className="ui-icon" aria-hidden />
      </button>
      <Noi mo={mo} dong={() => setMo(false)} theoNeo>
        <MenuChon ds={KENH} gt={d.kenh.ten} chon={(v) => { doi(v); setMo(false) }} />
      </Noi>
    </span>
  )
}

export function MaTranThongBao({ ch, setCh }: { ch: DongTB[]; setCh: Dispatch<SetStateAction<DongTB[]>> }) {
  const id = useId()
  const [luu, setLuu] = useState('')
  const sua = (dId: string, f: (d: DongTB) => DongTB, chu: string) => { setCh((ds) => ds.map((d) => (d.id === dId ? f(d) : d))); setLuu(chu) }
  const khu = [...new Set(ch.map((d) => d.khu))]
  return (
    <>
      <div className="ui-table-wrap">
        <table className="ui-table ui-notif-matrix">
          <caption className="ui-sr-only">Cấu hình thông báo: loại thông báo theo kênh nhận</caption>
          <thead>
            <tr>
              <th scope="col">Loại thông báo</th>
              {COT.map((c) => <th key={c.k} scope="col" id={`${id}-c-${c.k}`}>{c.ten}</th>)}
            </tr>
          </thead>
          {khu.map((k) => (
            <tbody key={k}>
              <tr className="ui-notif-matrix-khu"><th scope="rowgroup" colSpan={4}><span>{k}</span></th></tr>
              {ch.filter((d) => d.khu === k).map((d) => (
                <tr key={d.id}>
                  <th scope="row"><span id={`${id}-r-${d.id}`}>{d.ten}</span><span className="ui-notif-matrix-gui" id={`${id}-g-${d.id}`}>Gửi cho: {d.gui}</span></th>
                  {COT.map((c) => {
                    const gt = c.k === 'kenh' ? d.kenh?.bat ?? null : d[c.k]
                    return (
                      <td key={c.k}>
                        {gt === null ? <KhongApDung /> : (
                          <span className="ui-notif-matrix-o">
                            <input type="checkbox" className="ui-checkbox" checked={gt} aria-labelledby={`${id}-c-${c.k} ${id}-r-${d.id}`} aria-describedby={`${id}-g-${d.id}`}
                              onChange={(e) => {
                                const v = e.target.checked
                                sua(d.id, (x) => (c.k === 'kenh' ? { ...x, kenh: { ...x.kenh!, bat: v } } : { ...x, [c.k]: v }),
                                  `Đã lưu: ${v ? 'bật' : 'tắt'} ${c.ten} — ${d.ten}`)
                              }} />
                            {c.k === 'kenh' && d.kenh && (
                              <ChonKenh d={d as DongTB & { kenh: NonNullable<DongTB['kenh']> }}
                                doi={(v) => v !== d.kenh?.ten && sua(d.id, (x) => ({ ...x, kenh: { ...x.kenh!, ten: v } }), `Đã lưu: ${d.ten} gửi vào ${v}`)} />
                            )}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <p className="ui-caption ui-notif-matrix-luu" role="status">{luu || 'Bấm là lưu — không có nút Lưu.'}</p>
    </>
  )
}
