import { HO_CHU, NHOM_CHU, type KieuChu } from './du-lieu'
import { KhoiNen, MucLucTrang, TenBien, TrangNen, MoTa } from './khung-trang'

// Mẫu dùng `font: var(--text-…)` + `font-feature-settings: inherit`: shorthand `font:` tự xoá cv11/ss03, dòng sau lấy lại
// từ DsRoot (y cách bundle.css bản 29 làm cho 20 rule shorthand).
const kieu = (k: KieuChu) => ({ font: `var(${k.bien})`, fontFeatureSettings: 'inherit' })

function DongKieu({ k }: { k: KieuChu }) {
  return (
    <li className="grid gap-x-6 gap-y-2 border-b py-4 md:grid-cols-[calc(var(--spacing)*64)_1fr]">
      <div className="flex min-w-0 flex-col gap-1">
        <TenBien bien={k.bien} />
        <p className="ds-text-xs m-0 text-muted-foreground tabular-nums">
          {k.co} / {k.dong} · {k.dam}
          {k.gianChu !== null && ` · ${k.gianChu}`} · lớp .{k.lop}
        </p>
        <MoTa chu={k.dung} />
      </div>
      <p className="m-0 min-w-0 break-words" style={kieu(k)}>
        {k.mau}
      </p>
    </li>
  )
}

const MAU_SO = ['1.204.000 ₫', '98.750.500 ₫', '11.111.111 ₫']

export function TrangChu() {
  return (
    <TrangNen
      tieuDe="Chữ"
      moTa="Inter (tự host qua next/font, gắn ở DsRoot) với cv11 + ss03 bật cho cả vùng DS. Cỡ chủ đạo của app nội bộ là text-sm 14/20; heading 3xl–5xl không dùng trong app. Mẫu dưới đây vẽ bằng chính biến --text-* của ds/tokens.css."
    >
      <MucLucTrang
        muc={[
          { id: 'ho-chu', ten: 'Họ chữ' },
          { id: 'tinh-nang', ten: 'cv11 · ss03' },
          { id: 'so', ten: 'Số' },
          ...NHOM_CHU.map((n) => ({ id: `chu-${n.ten.toLowerCase()}`, ten: n.ten })),
        ]}
      />
      <KhoiNen id="ho-chu" tieuDe="Họ chữ">
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {HO_CHU.map((h) => (
            <li key={h.ten} className="flex flex-col gap-1">
              <TenBien bien={h.bien} />
              <p className="ds-text-xs m-0 break-all text-muted-foreground">{h.giaTri}</p>
              <p className="ds-text-md m-0" style={{ fontFamily: `var(${h.bien})` }}>
                Bảo hành máy lọc nước — Đã giao 12 đơn
              </p>
            </li>
          ))}
        </ul>
        <p className="ds-text-sm m-0 text-muted-foreground">
          font-mono chỉ cho khối code/log. Mã đơn, serial, SKU, SĐT, tiền dùng Inter + tabular-nums, không dùng mono.
        </p>
      </KhoiNen>
      <KhoiNen
        id="tinh-nang"
        tieuDe="cv11 · ss03"
        moTa="DsRoot bật font-feature-settings cv11 (chữ a một tầng) và ss03 (dấu câu tròn); component không bao giờ reset — CEO chốt 19/11. Đo 20/11: file Inter đang nạp qua next/font chưa đổi glyph — hai dòng dưới còn giống nhau (việc mở)."
      >
        <dl className="m-0 grid gap-x-6 gap-y-2 md:grid-cols-[calc(var(--spacing)*40)_1fr]">
          <dt className="ds-text-sm text-muted-foreground">Bật (mặc định)</dt>
          <dd className="ds-text-lg m-0">“Bảo hành” a, g, 1, 4, 7 — tài khoản</dd>
          <dt className="ds-text-sm text-muted-foreground">Tắt (để so)</dt>
          <dd className="ds-text-lg m-0" style={{ fontFeatureSettings: 'normal' }}>
            “Bảo hành” a, g, 1, 4, 7 — tài khoản
          </dd>
        </dl>
      </KhoiNen>
      <KhoiNen id="so" tieuDe="Số" moTa="Số liệu trong bảng và KPI: tabular-nums, căn phải — chữ số thẳng cột.">
        <div className="grid max-w-md grid-cols-2 gap-6">
          {[
            { ten: 'tabular-nums', lop: 'tabular-nums' },
            { ten: 'Mặc định (so sánh)', lop: '' },
          ].map((c) => (
            <div key={c.ten} className="flex flex-col gap-1">
              <p className="ds-text-xs m-0 text-muted-foreground">{c.ten}</p>
              {MAU_SO.map((s) => (
                <p key={s} className={`ds-text-sm m-0 text-right ${c.lop}`}>
                  {s}
                </p>
              ))}
            </div>
          ))}
        </div>
      </KhoiNen>
      {NHOM_CHU.map((n) => (
        <KhoiNen key={n.ten} id={`chu-${n.ten.toLowerCase()}`} tieuDe={`${n.ten} · ${n.kieu.length}`}>
          <ul className="m-0 list-none border-t p-0">
            {n.kieu.map((k) => (
              <DongKieu key={k.ten} k={k} />
            ))}
          </ul>
        </KhoiNen>
      ))}
    </TrangNen>
  )
}
