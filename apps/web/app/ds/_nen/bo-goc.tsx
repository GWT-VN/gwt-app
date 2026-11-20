import { BO_GOC } from './du-lieu'
import { GiaTri, KhoiNen, TenBien, TrangNen, MoTa } from './khung-trang'

export function TrangBoGoc() {
  return (
    <TrangNen
      tieuDe="Bo góc"
      moTa="Control md bo 8, sm bo 6; Menu, Popover, Alert, Card bo 12; Dialog bo 16 (lựa chọn GWT); Button và Tabs mặc định pill. Trong vùng DS, rounded-* của Tailwind ăn theo thang này; bo tròn hẳn dùng biến --radius-full."
    >
      <KhoiNen id="thang" tieuDe={`Thang bo góc · ${BO_GOC.length}`}>
        <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-8 p-0 sm:grid-cols-[repeat(auto-fill,minmax(calc(var(--spacing)*44),1fr))]">
          {BO_GOC.map((t) => (
            <li key={t.ten} className="flex min-w-0 flex-col gap-2">
              <div
                className="size-20 border-2 border-solid border-foreground bg-muted"
                style={{ borderRadius: `var(${t.bien})` }}
              />
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
