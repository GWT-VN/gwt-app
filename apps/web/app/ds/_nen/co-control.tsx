import { Gear } from '@phosphor-icons/react/ssr'
import { Button } from '@/components/ui/button'
import { CO_CONTROL, GHI_CHU } from './du-lieu'
import { BangToken, MucNen, TrangNen, hangToken } from './khung-trang'

export function TrangCoControl() {
  const cao = CO_CONTROL.filter((t) => t.ten.startsWith('control-size-'))
  const icon = CO_CONTROL.filter((t) => t.ten.startsWith('control-icon-size-'))
  return (
    <TrangNen tieuDe="Cỡ control" moTa={GHI_CHU.coControl}>
      <MucNen id="chieu-cao" tieuDe={`Chiều cao control · ${cao.length}`} moTa="Ô mẫu cao đúng bằng biến. Vùng chạm mobile tối thiểu control-size-2xl.">
        <BangToken
          ten="Chiều cao control"
          cot={['Mẫu', 'Giá trị']}
          hang={cao.map((t) =>
            hangToken(
              t,
              <span
                className="block w-16 rounded-(--radius-sm) bg-muted [box-shadow:inset_0_0_0_1px_var(--input)]"
                style={{ height: `var(${t.bien})` }}
              />,
            ),
          )}
        />
      </MucNen>
      <MucNen id="icon" tieuDe={`Cỡ icon trong control · ${icon.length}`} moTa="Button dùng md 18px; Input, Menu, Sidebar dùng sm 16px.">
        <BangToken
          ten="Cỡ icon trong control"
          cot={['Mẫu', 'Giá trị']}
          hang={icon.map((t) => hangToken(t, <Gear aria-hidden="true" style={{ width: `var(${t.bien})`, height: `var(${t.bien})` }} />))}
        />
      </MucNen>
      <MucNen id="button" tieuDe="Áp vào Button" moTa="Button thật của DS ở từng cỡ.">
        <BangToken
          ten="Áp vào Button"
          cot={['Mẫu', 'Chiều cao']}
          rong={100}
          hang={(
            [
              ['sm', 'control-size-sm'],
              ['default', 'control-size-md'],
              ['lg', 'control-size-lg'],
            ] as const
          ).map(([size, bien]) => ({
            key: size,
            ten: `size="${size}"`,
            o: [
              <Button key="m" size={size}>
                Lưu đơn
              </Button>,
              <span key="g" className="ds-text-sm">
                {bien}
              </span>,
            ],
          }))}
        />
      </MucNen>
    </TrangNen>
  )
}
