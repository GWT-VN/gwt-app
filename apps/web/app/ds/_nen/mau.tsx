import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { NHOM_MAU, SO_MAU, type NhomMau, type Token } from './du-lieu'
import { GiaTri, KhoiNen, MucLucTrang, TenBien, TrangNen, MoTa } from './khung-trang'

// Ô mẫu tô bằng chính biến CSS → theme đổi là mẫu đổi theo. Viền trong 1px (box-shadow inset, không đổi kích thước)
// để ô trắng trên nền trắng / ô trong suốt vẫn thấy mép.
const O_MAU = 'rounded-(--radius-md) [box-shadow:inset_0_0_0_1px_var(--border)]'

function Tro({ token }: { token: Token }) {
  if (!token.tro) return null
  const { sang, toi } = token.tro
  return (
    <p className="ds-text-xs m-0 break-words text-muted-foreground">
      → {sang === toi ? sang : `${sang ?? token.sang} / ${toi ?? token.toi}`}
    </p>
  )
}

function OMau({ token, lon }: { token: Token; lon?: boolean }) {
  return (
    <li className="flex min-w-0 flex-col gap-1">
      <div className={`${lon ? 'mb-1 h-16' : 'h-10'} ${O_MAU}`} style={{ background: `var(${token.bien})` }} />
      <TenBien bien={token.bien} />
      <GiaTri token={token} />
      <Tro token={token} />
      {lon && <MoTa chu={token.dung} />}
    </li>
  )
}

const LUOI = 'm-0 grid list-none gap-x-4 gap-y-6 p-0'
const LUOI_LON = `${LUOI} grid-cols-[repeat(auto-fill,minmax(calc(var(--spacing)*64),1fr))]`
const LUOI_NHO = `${LUOI} grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(calc(var(--spacing)*52),1fr))]`

function KhoiNhom({ nhom, lon }: { nhom: NhomMau; lon?: boolean }) {
  // Thang OpenAI: bậc trong suốt (`-aNN`) xuống hàng riêng dưới bậc đặc.
  const trong = nhom.mau.filter((t) => /-a\d/.test(t.ten))
  const dac = nhom.mau.filter((t) => !trong.includes(t))
  return (
    <KhoiNen id={nhom.id} tieuDe={`${nhom.ten} · ${nhom.mau.length}`}>
      {[dac, trong]
        .filter((hang) => hang.length > 0)
        .map((hang, i) => (
          <ul key={i} className={lon ? LUOI_LON : LUOI_NHO} aria-label={i ? 'Bậc trong suốt' : undefined}>
            {hang.map((t) => (
              <OMau key={t.ten} token={t} lon={lon} />
            ))}
          </ul>
        ))}
    </KhoiNen>
  )
}

/** Trang Màu: semantic shadcn → thang OpenAI → color-* theo vai, mọi màu trong tokens.json (test: du-lieu.test.ts). */
export function TrangMau() {
  return (
    <TrangNen
      tieuDe="Màu"
      moTa={
        <>
          {SO_MAU} token màu từ ds/nguon/tokens.json. Ô mẫu tô bằng chính biến CSS của ds/tokens.css nên tự đổi theo theme;
          giá trị Sáng/Tối giải từ JSON, dòng mũi tên là token nó trỏ tới. Component dùng nhóm semantic shadcn; thang
          OpenAI chỉ đi qua token semantic.
        </>
      }
    >
      <MucLucTrang
        muc={[
          { id: 'semantic', ten: 'Semantic shadcn' },
          { id: 'thang-gray', ten: 'Thang OpenAI' },
          { id: 'vai-chung', ten: 'color-* theo vai' },
          { id: 'tuong-phan', ten: 'Tương phản' },
        ]}
      />
      {NHOM_MAU.map((n) => (
        <KhoiNhom key={n.id} nhom={n} lon={n.id === 'semantic'} />
      ))}
      <KhoiNen id="tuong-phan" tieuDe="Tương phản dưới WCAG — chấp nhận có chủ đích">
        <Alert color="warning">
          <AlertTitle>Giữ y màu nguồn ChatGPT, không “sửa giùm” trong tokens.css</AlertTitle>
          <AlertDescription>
            4 cặp dưới ngưỡng WCAG được CEO chấp nhận (19/11): chữ danger ở theme tối, viền input, viền Checkbox, chữ Badge
            soft. Số đo từng cặp ở ds/NGUON.md mục “Tương phản”.
          </AlertDescription>
        </Alert>
      </KhoiNen>
    </TrangNen>
  )
}
