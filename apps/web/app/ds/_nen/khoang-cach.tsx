import { BOI_SPACING, DON_VI, GHI_CHU, KHOANG_CACH } from './du-lieu'
import { GiaTri, KhoiNen, TenBien, TrangNen, MoTa } from './khung-trang'

// Thanh mẫu: bề rộng = chính biến/biểu thức CSS, nền ring nhạt để thấy rõ trên cả hai theme.
const THANH = 'h-4 shrink-0 rounded-(--radius-2xs) bg-(--color-background-info-soft-alpha) [box-shadow:inset_0_0_0_1px_var(--color-border-info-surface)]'

export function TrangKhoangCach() {
  const goc = KHOANG_CACH.find((t) => t.ten === 'spacing')!
  const conLai = KHOANG_CACH.filter((t) => t !== goc)
  return (
    <TrangNen tieuDe="Khoảng cách" moTa={GHI_CHU.khoangCach}>
      <KhoiNen
        id="don-vi"
        tieuDe="Đơn vị gốc"
        moTa={`Mọi padding/gap/margin là bội số của --spacing (${DON_VI}px). Trong vùng DS, p-3, gap-1.5… của Tailwind ăn theo đơn vị này. Hay dùng: 4, 6, 8, 12, 16, 20.`}
      >
        <TenBien bien={goc.bien} />
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {BOI_SPACING.map(({ n, px }) => (
            <li key={n} className="grid grid-cols-[calc(var(--spacing)*40)_1fr] items-center gap-4">
              <span className="ds-text-sm whitespace-nowrap tabular-nums">
                spacing({n}) <span className="text-muted-foreground">= {px}px</span>
              </span>
              <span className={THANH} style={{ width: `calc(var(--spacing) * ${n})` }} />
            </li>
          ))}
        </ul>
      </KhoiNen>
      <KhoiNen id="token" tieuDe={`Token khoảng cách · ${conLai.length}`} moTa="Padding cố định của control và khung (Menu, Alert, Dialog).">
        <ul className="m-0 flex list-none flex-col gap-5 p-0">
          {conLai.map((t) => (
            <li key={t.ten} className="grid gap-x-6 gap-y-2 md:grid-cols-[calc(var(--spacing)*64)_1fr]">
              <div className="flex min-w-0 flex-col gap-1">
                <TenBien bien={t.bien} />
                <GiaTri token={t} />
                <MoTa chu={t.dung} />
              </div>
              <span className={`${THANH} self-center`} style={{ width: `var(${t.bien})` }} />
            </li>
          ))}
        </ul>
      </KhoiNen>
    </TrangNen>
  )
}
