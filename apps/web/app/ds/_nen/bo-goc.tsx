import { BO_GOC } from './du-lieu'
import { Muc, Tam } from '../_khung/tam'
import { BangToken } from '../_khung/bang'
import { hangToken } from './o-token'

export function TrangBoGoc() {
  return (
    <Tam
      tieuDe="Bo góc"
      moTa="Control md bo 8, sm bo 6; Menu, Popover, Alert, Card bo 12; Dialog bo 16 (lựa chọn GWT); Button và Tabs mặc định pill. Trong vùng DS, rounded-* của Tailwind ăn theo thang này; bo tròn hẳn dùng biến --radius-full."
    >
      <Muc id="thang" tieuDe={`Thang bo góc · ${BO_GOC.length}`}>
        <BangToken
          ten="Thang bo góc"
          cot={['Mẫu', 'Giá trị']}
          hang={BO_GOC.map((t) =>
            hangToken(
              t,
              <span
                className="block size-12 border-2 border-solid border-foreground bg-muted"
                style={{ borderRadius: `var(${t.bien})` }}
              />,
            ),
          )}
        />
      </Muc>
    </Tam>
  )
}
