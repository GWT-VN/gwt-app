'use client'

// PROTOTYPE vứt đi — PA T "Theo Twenty" (CEO 26/11: "Chép y twenty luôn làm prototype. Menu nav thì giữ nguyên. Nhưng
// phần bảng làm y hệt họ", "tiêu đề cột làm y hệt twenty luôn, kể cả dưới chuẩn tương phản"). Bảng + panel dựng tay theo
// SỐ ĐO Twenty (ds-t.module.css), cố ý KHÔNG dùng Table/XemNhanh của DS. Cột theo yêu cầu kênh nội bộ: không Phụ trách,
// không cột Ngày (ngày gộp vào "Lỗi gần nhất"), ticket mới nhất lên đầu, view chỉ theo trạng thái. Không lưu gì.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowsOutSimple,
  CalendarBlank,
  CaretDown,
  CaretUp,
  CircleHalf,
  ClockCounterClockwise,
  Funnel,
  House,
  MapPin,
  Package,
  Plus,
  Rows,
  ShieldCheck,
  SlidersHorizontal,
  SortAscending,
  Ticket as IconTicket,
  User,
  WarningCircle,
  X,
} from '@phosphor-icons/react/ssr'
import type { Ticket } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cheSdt, chuaLuu, mayLoi, ngayNgan, tenKhach, useDatUrl, type DuLieuTicket } from './chung'
import s from './ds-t.module.css'

type Mau = 'gray' | 'red' | 'blue' | 'green' | 'orange' | 'purple'
const TT: Record<Ticket['state'], { nhan: string; c: Mau }> = {
  Open: { nhan: 'Đang mở', c: 'blue' },
  Done: { nhan: 'Đã xong', c: 'green' },
  Cancel: { nhan: 'Đã huỷ', c: 'gray' },
}
const VIEW = [
  { v: 'Open', ten: 'Đang mở' },
  { v: 'Done', ten: 'Đã xong' },
  { v: 'Cancel', ten: 'Đã huỷ' },
  { v: 'all', ten: 'Tất cả' },
] as const

const Tag = ({ c, children }: { c: Mau; children: React.ReactNode }) => (
  <span className={s.tag} data-c={c}>
    {children}
  </span>
)
const Av = ({ ten }: { ten: string }) => (
  <span className={s.av} aria-hidden="true">
    {ten.replace(/^(Công ty|Nhà hàng|Trường|Khách sạn|Văn phòng|Quán cà phê|Phòng khám|Anh|Chị)\s+(Demo\s+)?/i, '').charAt(0).toUpperCase()}
  </span>
)
const baoHanh = (t: Ticket): { nhan: string; c: Mau } | null =>
  !t.serial ? null : !t.warranty_activated ? { nhan: 'Chưa kích hoạt', c: 'gray' } : t.con_han_may ? { nhan: 'Còn BH', c: 'green' } : { nhan: 'Hết BH', c: 'orange' }

type Cot = { id: string; ten: string; icon: React.ReactNode; rong: number; o: (t: Ticket) => React.ReactNode }
const COT: Cot[] = [
  {
    id: 'khach',
    ten: 'Khách',
    icon: <User />,
    rong: 180,
    o: (t) => (
      <span className={s.chip}>
        <Av ten={tenKhach(t)} />
        <span className={s.chu}>{tenKhach(t)}</span>
      </span>
    ),
  },
  { id: 'may', ten: 'Máy', icon: <Package />, rong: 160, o: (t) => <span className={s.chu}>{t.product_name}</span> },
  {
    id: 'loi',
    ten: 'Lỗi gần nhất',
    icon: <WarningCircle />,
    rong: 230,
    o: (t) => (
      <span className={s.chu}>
        {mayLoi(t)} <span className={s.mo}>· {ngayNgan(t.created_at)}</span>
      </span>
    ),
  },
  {
    id: 'tt',
    ten: 'Trạng thái',
    icon: <CircleHalf />,
    rong: 140,
    o: (t) => (
      <>
        <Tag c={TT[t.state].c}>{TT[t.state].nhan}</Tag>
        {t.khan && t.state === 'Open' && <Tag c="red">Khẩn</Tag>}
      </>
    ),
  },
  {
    id: 'bh',
    ten: 'Bảo hành',
    icon: <ShieldCheck />,
    rong: 120,
    o: (t) => {
      const b = baoHanh(t)
      return b && <Tag c={b.c}>{b.nhan}</Tag>
    },
  },
  { id: 'tinh', ten: 'Tỉnh/TP', icon: <MapPin />, rong: 90, o: (t) => <span className={s.chu}>{t.province}</span> },
]

/** Cột đầu (mã ticket) + tổng bề rộng: tick 28 + cột đầu + các cột + "+" 32 — bảng `table-layout: fixed` cần rộng
 * đúng tổng, không thì trình duyệt bóp cột (cột tick sticky lệch, cột đầu đè ô kế). Vừa 1100 = vùng nội dung ở 1440. */
const COT_DAU = 120
const RONG_BANG = 28 + COT_DAU + COT.reduce((n, c) => n + c.rong, 0) + 32

// ── Panel bản ghi ───────────────────────────────────────────────────────────────────────────────────────────────────
function Truong({ icon, nhan, children }: { icon: React.ReactNode; nhan: string; children?: React.ReactNode }) {
  const rong = children === null || children === undefined || children === '' || children === false
  return (
    <div className={s.truong}>
      <span className={s.truongNhan}>
        {icon}
        {nhan}
      </span>
      {/* Trống: hiện tên trường màu "light" làm chỗ bấm (Twenty), không ghi "Chưa có". */}
      <span className={s.truongGt}>{rong ? <span className={s.trong}>{nhan}</span> : children}</span>
    </div>
  )
}

function Nhom({ ten, children }: { ten: string; children: React.ReactNode }) {
  const [mo, setMo] = useState(true)
  return (
    <>
      <button type="button" className={s.nhom} aria-expanded={mo} onClick={() => setMo(!mo)}>
        {ten}
        {mo ? <CaretUp aria-hidden="true" /> : <CaretDown aria-hidden="true" />}
      </button>
      {mo && children}
    </>
  )
}

function Panel({ t, onDong, onDoiTt }: { t: Ticket; onDong: () => void; onDoiTt: (v: Ticket['state']) => void }) {
  const [tab, setTab] = useState<'home' | 'lan' | 'hd'>('home')
  const b = baoHanh(t)
  const TAB = [
    { v: 'home', ten: 'Tổng quan', icon: <House /> },
    { v: 'lan', ten: 'Lần lỗi', icon: <WarningCircle /> },
    { v: 'hd', ten: 'Hoạt động', icon: <ClockCounterClockwise /> },
  ] as const
  return (
    <aside className={s.panel} aria-label={`Ticket ${t.ticket_code}`}>
      <div className={s.pDau}>
        <Av ten={t.ticket_code.replace(/^\D+-?/, '#')} />
        <span className={s.chu}>{t.ticket_code}</span>
        <span className={s.dan} />
        <Link className={s.nutIcon} href={`/ticket/${encodeURIComponent(t.ticket_code)}?variant=ref`} aria-label="Mở trang đầy đủ">
          <ArrowsOutSimple aria-hidden="true" />
        </Link>
        <button type="button" className={s.nutIcon} aria-label="Đóng (Esc)" onClick={onDong}>
          <X aria-hidden="true" />
        </button>
      </div>
      <div className={s.tabs} role="tablist" aria-label="Phần của ticket">
        {TAB.map((x) => (
          <button key={x.v} type="button" role="tab" aria-selected={tab === x.v} className={s.tab} onClick={() => setTab(x.v)}>
            {x.icon}
            {x.ten}
          </button>
        ))}
      </div>
      <div className={s.pThan} role="tabpanel">
        {tab === 'home' && (
          <>
            <div className={s.khoi}>
              <div className={s.khoiTen}>Thông tin</div>
              <Nhom ten="Ticket">
                <Truong icon={<CircleHalf />} nhan="Trạng thái">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className={s.nutTen} aria-label={`Trạng thái: ${TT[t.state].nhan} — đổi`}>
                        <Tag c={TT[t.state].c}>{TT[t.state].nhan}</Tag>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioGroup value={t.state} onValueChange={(v) => onDoiTt(v as Ticket['state'])}>
                        {(Object.keys(TT) as Ticket['state'][]).map((k) => (
                          <DropdownMenuRadioItem key={k} value={k}>
                            {TT[k].nhan}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Truong>
                <Truong icon={<WarningCircle />} nhan="Khẩn">
                  {t.khan && t.state === 'Open' && <Tag c="red">Khẩn</Tag>}
                </Truong>
                <Truong icon={<Rows />} nhan="Loại">{t.ticket_type}</Truong>
                <Truong icon={<CalendarBlank />} nhan="Ngày tạo">{ngayNgan(t.created_at)}</Truong>
              </Nhom>
              <Nhom ten="Phụ trách">
                <Truong icon={<User />} nhan="CS theo dõi">{t.cs_ten}</Truong>
                <Truong icon={<User />} nhan="Kỹ thuật">{t.ky_thuat_ten}</Truong>
              </Nhom>
              <Nhom ten="Máy">
                <Truong icon={<Package />} nhan="Model">{t.product_name}</Truong>
                <Truong icon={<Rows />} nhan="Serial">{t.source_serial}</Truong>
                <Truong icon={<ShieldCheck />} nhan="Bảo hành">{b && <Tag c={b.c}>{b.nhan}</Tag>}</Truong>
              </Nhom>
              <Nhom ten="Khách">
                <Truong icon={<User />} nhan="Tên">{t.customer_name}</Truong>
                <Truong icon={<Rows />} nhan="Điện thoại">{cheSdt(t.primary_phone)}</Truong>
                <Truong icon={<MapPin />} nhan="Tỉnh/TP">{t.province}</Truong>
              </Nhom>
            </div>
            <div className={s.khoi}>
              <div className={s.khoiTen}>Lỗi gần nhất</div>
              <span className={s.chip}>
                <Av ten={mayLoi(t)} />
                <span className={s.chu}>{mayLoi(t)}</span>
              </span>
              <p className={s.doan}>{t.description}</p>
            </div>
          </>
        )}
        {tab === 'lan' && (
          <div className={s.khoi}>
            <div className={s.khoiTen}>Lần 1 · khách báo {ngayNgan(t.created_at)}</div>
            <Truong icon={<WarningCircle />} nhan="Khách báo" />
            <p className={s.doan}>{t.description}</p>
            <Truong icon={<ClockCounterClockwise />} nhan="Xử lý" />
            <p className={s.doan}>{t.last_note ?? <span className={s.trong}>Chưa ghi xử lý</span>}</p>
          </div>
        )}
        {tab === 'hd' && (
          <div className={s.khoi}>
            {t.last_note && (
              <div className={s.hd}>
                <ClockCounterClockwise aria-hidden="true" />
                <span>{t.last_note}</span>
                <span className={s.hdNgay}>{ngayNgan(t.hoat_dong_cuoi)}</span>
              </div>
            )}
            <div className={s.hd}>
              <Plus aria-hidden="true" />
              <span>Tạo ticket</span>
              <span className={s.hdNgay}>{ngayNgan(t.created_at)}</span>
            </div>
          </div>
        )}
      </div>
      <div className={s.pChan}>
        <Link className={s.nutPhu} href={`/ticket/${encodeURIComponent(t.ticket_code)}?variant=ref`}>
          <ArrowsOutSimple aria-hidden="true" />
          Mở trang đầy đủ
        </Link>
      </div>
    </aside>
  )
}

// ── Trang ───────────────────────────────────────────────────────────────────────────────────────────────────────────
export function TicketT({ rows: goc, demo }: DuLieuTicket) {
  const sp = useSearchParams()
  const dat = useDatUrl()
  const [sua, setSua] = useState<Record<string, Ticket['state']>>({})
  const [chon, setChon] = useState<Set<string>>(new Set())
  const rows = goc
    .map((t) => ({ ...t, state: sua[t.ticket_code] ?? t.state }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at)) // mới nhất lên đầu (CSKH 25/11)
  const view = VIEW.find((x) => x.v === sp.get('tt'))?.v ?? 'Open'
  const dong = view === 'all' ? rows : rows.filter((t) => t.state === view)
  const xem = sp.get('xem')
  const t = xem ? rows.find((r) => r.ticket_code === xem) : undefined
  const mo = (ma: string | null) => dat({ xem: ma }, true)

  useEffect(() => {
    if (!t) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[data-ds-portal] [data-state="open"]')) mo(null)
    }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  })

  const tatCa = dong.length > 0 && dong.every((d) => chon.has(d.ticket_code))
  const daoChon = (ma: string) =>
    setChon((c) => {
      const n = new Set(c)
      if (n.has(ma)) n.delete(ma)
      else n.add(ma)
      return n
    })

  return (
    <div className={`${s.tw} ${t ? s.coPanel : ''}`}>
      <div className={s.dau}>
        <span className={s.dauTen}>
          <IconTicket aria-hidden="true" />
          <h1 style={{ font: 'inherit', margin: 0 }}>Ticket CSKH</h1>
        </span>
        <span className={s.dan} />
        <span className={s.dem}>Prototype T{demo ? ' · ticket Demo' : ''} — không lưu gì</span>
        <button type="button" className={s.nutTao} onClick={chuaLuu}>
          <Plus aria-hidden="true" />
          Tạo ticket
        </button>
      </div>
      <div className={s.thanh}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={s.nutChu}>
              <Rows aria-hidden="true" />
              {VIEW.find((x) => x.v === view)?.ten}
              <span className={s.dem}>· {dong.length}</span>
              <CaretDown aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup value={view} onValueChange={(v) => dat({ tt: v === 'Open' ? null : v, xem: null })}>
              {VIEW.map((x) => (
                <DropdownMenuRadioItem key={x.v} value={x.v}>
                  {x.ten} · {x.v === 'all' ? rows.length : rows.filter((r) => r.state === x.v).length}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className={s.dan} />
        {chon.size > 0 && <span className={s.dem}>Đã chọn {chon.size}</span>}
        <button type="button" className={s.nutChu} onClick={chuaLuu}>
          <Funnel aria-hidden="true" />
          Lọc
        </button>
        <button type="button" className={s.nutChu} onClick={chuaLuu}>
          <SortAscending aria-hidden="true" />
          Sắp xếp
        </button>
        <button type="button" className={s.nutChu} onClick={chuaLuu}>
          <SlidersHorizontal aria-hidden="true" />
          Tuỳ chọn
        </button>
      </div>
      <div className={s.cuon}>
        <table className={s.bang} aria-label="Ticket CSKH" style={{ width: `max(100%, ${RONG_BANG}px)` }}>
          <colgroup>
            <col style={{ width: 28 }} />
            <col style={{ width: COT_DAU }} />
            {COT.map((c) => (
              <col key={c.id} style={{ width: c.rong }} />
            ))}
            <col style={{ width: 32 }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className={`${s.th} ${s.oTick} ${s.thTick}`}>
                <span>
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả ticket trong view"
                    checked={tatCa}
                    onChange={() => setChon(tatCa ? new Set() : new Set(dong.map((d) => d.ticket_code)))}
                  />
                </span>
              </th>
              <th className={`${s.th} ${s.cotDau}`} scope="col">
                <span className={s.thNoi}>
                  <IconTicket aria-hidden="true" />
                  Ticket
                </span>
              </th>
              {COT.map((c) => (
                <th key={c.id} className={s.th} scope="col">
                  <span className={s.thNoi}>
                    <span aria-hidden="true" style={{ display: 'contents' }}>
                      {c.icon}
                    </span>
                    {c.ten}
                  </span>
                </th>
              ))}
              <th className={`${s.th} ${s.cotThem}`}>
                <span className={s.thNoi}>
                  <button type="button" className={s.nutIcon} aria-label="Thêm cột" onClick={chuaLuu}>
                    <Plus aria-hidden="true" />
                  </button>
                </span>
              </th>
              <th className={`${s.th} ${s.cotRong}`} aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {dong.map((d) => (
              <tr key={d.ticket_code} className={s.dong} data-chon={chon.has(d.ticket_code) || undefined} data-mo={d.ticket_code === xem || undefined}>
                <td className={`${s.td} ${s.oTick} ${s.tdTick}`}>
                  <span>
                    <input type="checkbox" aria-label={`Chọn ${d.ticket_code}`} checked={chon.has(d.ticket_code)} onChange={() => daoChon(d.ticket_code)} />
                  </span>
                </td>
                <td className={`${s.td} ${s.cotDau}`}>
                  <span className={s.tdNoi}>
                    <button type="button" className={s.nutTen} onClick={() => mo(d.ticket_code)} aria-label={`Mở ${d.ticket_code}`}>
                      <Av ten={d.ticket_code.replace(/^\D+-?/, '#')} />
                      <span className={s.chu}>{d.ticket_code}</span>
                    </button>
                  </span>
                </td>
                {COT.map((c) => (
                  <td key={c.id} className={s.td}>
                    <span className={s.tdNoi}>{c.o(d)}</span>
                  </td>
                ))}
                <td className={s.td} />
                <td className={`${s.td} ${s.cotRong}`} />
              </tr>
            ))}
            <tr>
              <td colSpan={COT.length + 4} style={{ padding: 0 }}>
                <div className={s.them} role="button" tabIndex={0} onClick={chuaLuu} onKeyDown={(e) => e.key === 'Enter' && chuaLuu()}>
                  <Plus aria-hidden="true" />
                  Thêm ticket
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot className={s.tong}>
            <tr>
              <td className={`${s.td} ${s.tdTick}`} />
              <td className={`${s.td} ${s.cotDau}`}>
                <span className={s.tdNoi}>
                  Đếm<span className={s.so}>{dong.length}</span>
                </span>
              </td>
              {COT.map((c) => (
                <td key={c.id} className={s.td}>
                  <span className={s.tdNoi}>
                    {c.id === 'tt' && (
                      <>
                        Khẩn<span className={s.so}>{dong.filter((x) => x.khan && x.state === 'Open').length}</span>
                      </>
                    )}
                    {c.id === 'bh' && (
                      <>
                        Hết BH<span className={s.so}>{dong.filter((x) => baoHanh(x)?.nhan === 'Hết BH').length}</span>
                      </>
                    )}
                    {c.id === 'khach' && (
                      <>
                        Trống<span className={s.so}>{Math.round((100 * dong.filter((x) => !x.customer_name).length) / Math.max(1, dong.length))}%</span>
                      </>
                    )}
                  </span>
                </td>
              ))}
              <td className={s.td} />
              <td className={`${s.td} ${s.cotRong}`} />
            </tr>
          </tfoot>
        </table>
      </div>
      {t && <Panel key={t.ticket_code} t={t} onDong={() => mo(null)} onDoiTt={(v) => (setSua((m) => ({ ...m, [t.ticket_code]: v })), chuaLuu())} />}
    </div>
  )
}
