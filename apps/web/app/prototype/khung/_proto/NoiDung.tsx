'use client'
// PROTOTYPE — nội dung màn "Việc hôm nay" dùng chung cho 3 phương án (chỉ khung khác nhau).
import { AlertTriangle, ArrowUpRight, Sparkles } from 'lucide-react'
import { VIEC_HOM_NAY, type Dong } from './data'

const MAU_BADGE = { danger: 'danger', warning: 'warning', info: 'info', secondary: undefined } as const

export function NoiDung({ hoiBap }: { hoiBap?: (d: Dong) => void }) {
  const tong = VIEC_HOM_NAY.reduce((s, k) => s + k.dong.length, 0)
  return (
    <div className="p-noidung">
      <header className="p-dautrang">
        <div>
          <h1 className="p-h1">Việc hôm nay</h1>
          <p className="p-phu">Thứ Tư, 18/11/2026 · {tong} việc · dữ liệu demo</p>
        </div>
        <div className="ui-row">
          <button className="ui-btn" data-variant="outline" data-size="sm">Bàn giao ca</button>
          <button className="ui-btn" data-size="sm">Tạo ticket</button>
        </div>
      </header>

      <div className="p-dem">
        {VIEC_HOM_NAY.map((k) => (
          <a key={k.id} href={'#' + k.id} className="p-dem-o">
            <span className="p-dem-so" data-tone={k.tone}>{k.dong.length}</span>
            <span className="p-dem-nhan">{k.ten}</span>
          </a>
        ))}
      </div>

      {VIEC_HOM_NAY.map((k) => (
        <section key={k.id} id={k.id} className="ui-card p-khoi">
          <h2 className="p-khoi-tieude">
            {k.ten} <span className="ui-badge" data-color={MAU_BADGE[k.tone]}>{k.dong.length}</span>
            <span className="p-khoi-mo">{k.mo}</span>
          </h2>
          <ul className="p-dong-ds">
            {k.dong.map((d) => (
              <li key={k.id + d.ma + d.viec} className="p-dong">
                <span className="p-ma">{d.ma}</span>
                <span className="p-khach">
                  {d.khach}
                  {d.luuYDo && (
                    <span className="p-luuy" title="Khách có lưu ý Phải đọc">
                      <AlertTriangle className="ui-icon" aria-hidden /> lưu ý
                    </span>
                  )}
                </span>
                <span className="p-viec">{d.viec}</span>
                <span className={'p-han' + (d.treHan ? ' tre' : '')}>{d.han}</span>
                <span className="p-chu">{d.chu}</span>
                <span className="p-nguon">
                  {d.nguon === 'Discord' && (
                    <span className="ui-badge" data-variant="outline">Discord <ArrowUpRight size={12} aria-hidden /></span>
                  )}
                </span>
                {hoiBap && (
                  <button className="ui-btn p-hoibap" data-variant="ghost" data-size="sm" data-shape="rounded" onClick={() => hoiBap(d)}>
                    <Sparkles aria-hidden /> Hỏi Bắp
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
