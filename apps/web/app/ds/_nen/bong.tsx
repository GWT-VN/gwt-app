import { BONG, GHI_CHU } from './du-lieu'
import { GiaTri, KhoiNen, TenBien, TrangNen, MoTa } from './khung-trang'

const O = 'h-20 rounded-(--radius-xl) bg-popover'

export function TrangBong() {
  return (
    <TrangNen
      tieuDe="Bóng"
      moTa="Lớp nổi (Menu, Popover, Select, Combobox, Dialog) = shadow + shadow-hairline; Sheet = shadow-400 + hairline. Card phẳng, không bóng. Ô mẫu nền popover, tô bằng chính biến --shadow-*."
    >
      <KhoiNen id="lop-noi" tieuDe="Lớp nổi" moTa={GHI_CHU.bong}>
        <div className="flex max-w-md flex-col gap-2">
          <div className={O} style={{ boxShadow: 'var(--shadow), var(--shadow-hairline)' }} />
          <code className="ds-text-sm">box-shadow: var(--shadow), var(--shadow-hairline)</code>
        </div>
      </KhoiNen>
      <KhoiNen id="thang" tieuDe={`Thang bóng · ${BONG.length}`}>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(calc(var(--spacing)*64),1fr))] gap-x-6 gap-y-10 p-0">
          {BONG.map((t) => (
            <li key={t.ten} className="flex min-w-0 flex-col gap-2">
              <div className={`mb-2 ${O}`} style={{ boxShadow: `var(${t.bien})` }} />
              <TenBien bien={t.bien} />
              <GiaTri token={t} />
              <MoTa chu={t.dung} />
            </li>
          ))}
        </ul>
      </KhoiNen>
    </TrangNen>
  )
}
