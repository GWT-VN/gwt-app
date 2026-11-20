import type { ReactNode } from 'react'
import { Gear } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { CO_CONTROL, GHI_CHU, type Token } from './du-lieu'
import { GiaTri, KhoiNen, TenBien, TrangNen, MoTa } from './khung-trang'

function Dong({ t, mau }: { t: Token; mau: ReactNode }) {
  return (
    <li className="grid items-center gap-x-6 gap-y-2 md:grid-cols-[calc(var(--spacing)*64)_calc(var(--spacing)*16)_1fr]">
      <div className="flex min-w-0 flex-col gap-1">
        <TenBien bien={t.bien} />
        <GiaTri token={t} />
      </div>
      <div className="flex items-center">{mau}</div>
      <MoTa chu={t.dung} />
    </li>
  )
}

const DANH_SACH = 'm-0 flex list-none flex-col gap-5 p-0'

export function TrangCoControl() {
  const cao = CO_CONTROL.filter((t) => t.ten.startsWith('control-size-'))
  const icon = CO_CONTROL.filter((t) => t.ten.startsWith('control-icon-size-'))
  return (
    <TrangNen tieuDe="Cỡ control" moTa={GHI_CHU.coControl}>
      <KhoiNen
        id="chieu-cao"
        tieuDe={`Chiều cao control · ${cao.length}`}
        moTa="Ô mẫu cao đúng bằng biến. Vùng chạm mobile tối thiểu control-size-2xl."
      >
        <ul className={DANH_SACH}>
          {cao.map((t) => (
            <Dong
              key={t.ten}
              t={t}
              mau={<span className="block w-16 rounded-(--radius-sm) bg-muted [box-shadow:inset_0_0_0_1px_var(--input)]" style={{ height: `var(${t.bien})` }} />}
            />
          ))}
        </ul>
      </KhoiNen>
      <KhoiNen id="icon" tieuDe={`Cỡ icon trong control · ${icon.length}`} moTa="Button dùng md 18px; Input, Menu, Sidebar dùng sm 16px.">
        <ul className={DANH_SACH}>
          {icon.map((t) => (
            <Dong key={t.ten} t={t} mau={<Gear aria-hidden="true" style={{ width: `var(${t.bien})`, height: `var(${t.bien})` }} />} />
          ))}
        </ul>
      </KhoiNen>
      <KhoiNen id="button" tieuDe="Áp vào Button" moTa="Button thật của DS: size sm = control-size-sm, mặc định = control-size-md, lg = control-size-lg.">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Cỡ sm</Button>
          <Button>Mặc định</Button>
          <Button size="lg">Cỡ lg</Button>
        </div>
      </KhoiNen>
    </TrangNen>
  )
}
