import { BONG, GHI_CHU } from './du-lieu'
import { Muc, Tam } from '../_khung/tam'
import { BangToken } from '../_khung/bang'
import { hangToken } from './o-token'

// Ô mẫu nền popover (lớp nổi), tô bằng chính biến --shadow-* → theo theme đang xem.
const O = 'm-2 block h-10 w-24 rounded-(--radius-md) bg-popover'

export function TrangBong() {
  return (
    <Tam
      tieuDe="Bóng"
      moTa="Lớp nổi (Menu, Popover, Select, Combobox, Dialog) = shadow + shadow-hairline; Sheet = shadow-400 + hairline. Card phẳng, không bóng. Ô mẫu vẽ bằng chính biến --shadow-* của theme đang xem; cột Giá trị ghi cả Sáng/Tối."
    >
      <Muc id="lop-noi" tieuDe="Lớp nổi" moTa={GHI_CHU.bong}>
        <BangToken
          ten="Lớp nổi"
          cot={['Mẫu', 'Giá trị']}
          doRong={['w-1/3', 'w-36']}
          hang={[
            {
              key: 'lop-noi',
              ten: 'shadow + shadow-hairline',
              o: [
                <span key="m" className={O} style={{ boxShadow: 'var(--shadow), var(--shadow-hairline)' }} />,
                <code key="g" className="ds-text-sm">
                  box-shadow: var(--shadow), var(--shadow-hairline)
                </code>,
              ],
            },
          ]}
        />
      </Muc>
      <Muc id="thang" tieuDe={`Thang bóng · ${BONG.length}`}>
        <BangToken
          ten="Thang bóng"
          cot={['Mẫu', 'Giá trị']}
          rong={160}
          doRong={['w-1/3', 'w-36']}
          hang={BONG.map((t) => hangToken(t, <span className={O} style={{ boxShadow: `var(${t.bien})` }} />))}
        />
      </Muc>
    </Tam>
  )
}
