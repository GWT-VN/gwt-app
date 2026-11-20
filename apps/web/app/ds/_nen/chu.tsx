import { HO_CHU, NHOM_CHU, type KieuChu } from './du-lieu'
import { Muc, Tam } from '../_khung/tam'
import { BangToken, type Hang } from '../_khung/bang'
import { MoTa } from './o-token'

// Mẫu dùng `font: var(--text-…)` + `font-feature-settings: inherit`: shorthand `font:` tự xoá cv11/ss03, dòng sau lấy lại
// từ DsRoot (y cách bundle.css bản 29 làm cho 20 rule shorthand).
const kieu = (k: KieuChu) => ({ font: `var(${k.bien})`, fontFeatureSettings: 'inherit' })

const hangKieu = (k: KieuChu): Hang => ({
  key: k.ten,
  ten: k.ten,
  phu: <MoTa chu={k.dung} />,
  o: [
    <span key="m" className="block break-words" style={kieu(k)}>
      {k.mau}
    </span>,
    <span key="t" className="ds-text-xs flex flex-col whitespace-nowrap tabular-nums">
      <span>
        {k.co} / {k.dong} · {k.dam}
      </span>
      <span className="text-muted-foreground">.{k.lop}</span>
    </span>,
  ],
  bien: k.bien,
})

const MAU_SO = ['1.204.000 ₫', '98.750.500 ₫', '11.111.111 ₫']
const MAU_TINH_NANG = '“Bảo hành” a, g, 1, 4, 7 — tài khoản'

export function TrangChu() {
  return (
    <Tam
      tieuDe="Chữ"
      moTa="Inter chính chủ (rsms v4.1, tự host qua next/font/local, gắn ở DsRoot) với cv11 + ss03 bật cho cả vùng DS. Cỡ chủ đạo của app nội bộ là text-sm 14/20; heading 3xl–5xl không dùng trong app. Mẫu vẽ bằng chính biến --text-* của ds/tokens.css."
      muc={[
        { id: 'ho-chu', ten: 'Họ chữ' },
        { id: 'tinh-nang', ten: 'cv11 · ss03' },
        { id: 'so', ten: 'Số' },
        ...NHOM_CHU.map((n) => ({ id: `chu-${n.ten.toLowerCase()}`, ten: n.ten })),
      ]}
    >
      <Muc
        id="ho-chu"
        tieuDe="Họ chữ"
        moTa="font-mono chỉ cho khối code/log. Mã đơn, serial, SKU, SĐT, tiền dùng Inter + tabular-nums, không dùng mono."
      >
        <BangToken
          ten="Họ chữ"
          cot={['Mẫu', 'Giá trị']}
          doRong={['w-1/4']}
          hang={HO_CHU.map((h) => ({
            key: h.ten,
            ten: `font-${h.ten}`,
            o: [
              <span key="m" className="ds-text-md" style={{ fontFamily: `var(${h.bien})` }}>
                Bảo hành máy lọc nước — Đã giao 12 đơn
              </span>,
              <span key="g" className="ds-text-xs break-words text-muted-foreground">
                {h.giaTri}
              </span>,
            ],
            bien: h.bien,
          }))}
        />
      </Muc>
      <Muc
        id="tinh-nang"
        tieuDe="cv11 · ss03"
        moTa="DsRoot bật font-feature-settings cv11 (chữ a một tầng) và ss03 (dấu câu tròn); component không bao giờ reset — CEO chốt 19/11. Dòng Tắt chỉ để so."
      >
        <BangToken
          ten="cv11 · ss03"
          cot={['Mẫu']}
          rong={100}
          hang={[
            { key: 'bat', ten: 'Bật (mặc định)', o: [<span key="m" className="ds-text-lg">{MAU_TINH_NANG}</span>] },
            {
              key: 'tat',
              ten: 'Tắt',
              o: [
                <span key="m" className="ds-text-lg" style={{ fontFeatureSettings: 'normal' }}>
                  {MAU_TINH_NANG}
                </span>,
              ],
            },
          ]}
        />
      </Muc>
      <Muc id="so" tieuDe="Số" moTa="Số liệu trong bảng và KPI: tabular-nums, căn phải — chữ số thẳng cột.">
        <BangToken
          ten="Số"
          cot={['Mẫu']}
          rong={80}
          hang={[
            { key: 'tab', ten: 'tabular-nums', lop: 'tabular-nums' },
            { key: 'mac', ten: 'Mặc định (so)', lop: '' },
          ].map((c) => ({
            key: c.key,
            ten: c.ten,
            o: [
              <span key="m" className={`ds-text-sm flex w-32 flex-col text-right ${c.lop}`}>
                {MAU_SO.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </span>,
            ],
          }))}
        />
      </Muc>
      {NHOM_CHU.map((n) => (
        <Muc key={n.ten} id={`chu-${n.ten.toLowerCase()}`} tieuDe={`${n.ten} · ${n.kieu.length}`}>
          <BangToken ten={n.ten} cot={['Mẫu', 'Thông số']} rong={170} doRong={['w-1/4', undefined, 'w-36']} hang={n.kieu.map(hangKieu)} />
        </Muc>
      ))}
    </Tam>
  )
}
