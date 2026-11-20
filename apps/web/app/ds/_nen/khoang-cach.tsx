import { BOI_SPACING, DON_VI, GHI_CHU, KHOANG_CACH } from './du-lieu'
import { BangToken, MucNen, TrangNen, hangToken } from './khung-trang'

// Thanh mẫu: bề rộng = chính biến/biểu thức CSS; nền info nhạt để thấy rõ ở cả hai theme.
const THANH =
  'block h-4 rounded-(--radius-2xs) bg-(--color-background-info-soft-alpha) [box-shadow:inset_0_0_0_1px_var(--color-border-info-surface)]'

export function TrangKhoangCach() {
  const goc = KHOANG_CACH.find((t) => t.ten === 'spacing')!
  const conLai = KHOANG_CACH.filter((t) => t !== goc)
  return (
    <TrangNen tieuDe="Khoảng cách" moTa={GHI_CHU.khoangCach}>
      <MucNen
        id="don-vi"
        tieuDe="Đơn vị gốc"
        moTa={`Mọi padding/gap/margin là bội số của --spacing (${DON_VI}px). Trong vùng DS, p-3, gap-1.5… của Tailwind ăn theo đơn vị này. Hay dùng: 4, 6, 8, 12, 16, 20.`}
      >
        <BangToken
          ten="Đơn vị gốc"
          cot={['Mẫu', 'Giá trị']}
          rong={100}
          hang={[
            hangToken(goc, <span className={THANH} style={{ width: `var(${goc.bien})` }} />),
            ...BOI_SPACING.map(({ n, px }) => ({
              key: `n${n}`,
              ten: `spacing(${n})`,
              o: [
                <span key="m" className={THANH} style={{ width: `calc(var(--spacing) * ${n})` }} />,
                <span key="g" className="ds-text-sm tabular-nums">
                  {px}px
                </span>,
              ],
            })),
          ]}
        />
      </MucNen>
      <MucNen id="token" tieuDe={`Token khoảng cách · ${conLai.length}`} moTa="Padding cố định của control và khung (Menu, Alert, Dialog).">
        <BangToken
          ten="Token khoảng cách"
          cot={['Mẫu', 'Giá trị']}
          hang={conLai.map((t) => hangToken(t, <span className={THANH} style={{ width: `var(${t.bien})` }} />))}
        />
      </MucNen>
    </TrangNen>
  )
}
