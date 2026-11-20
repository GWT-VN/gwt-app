import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CARO, NHOM_MAU, SO_MAU, hienMau, type Token } from './du-lieu'
import { BangToken, MucNen, TrangNen, type Hang } from './khung-trang'

const NGUONG = 4.5

/**
 * Chip giá trị như artifact: nền xám nhạt bo radius-md, ô màu nhỏ + mã hex (+ % alpha, ô màu có nền caro của đúng theme
 * của cột) + tỉ lệ tương phản nếu là màu chữ. Ô màu tô bằng giá trị đã giải của theme cột (xem du-lieu.ts).
 */
function Chip({ gia, caro, tiLe }: { gia: string; caro: string[]; tiLe?: number }) {
  const { hex, phanTram } = hienMau(gia)
  const nen =
    phanTram === undefined
      ? gia
      : `linear-gradient(${gia}, ${gia}), repeating-conic-gradient(${caro[1]} 0 25%, ${caro[0]} 0 50%) 0 0 / calc(var(--spacing) * 2) calc(var(--spacing) * 2)`
  const dat = tiLe !== undefined && tiLe >= NGUONG
  return (
    <span className="ds-text-xs inline-flex items-center gap-2 rounded-(--radius-md) bg-muted px-2 py-1 whitespace-nowrap tabular-nums">
      <span aria-hidden="true" className="size-4 shrink-0 rounded-(--radius-xs) [box-shadow:inset_0_0_0_1px_var(--border)]" style={{ background: nen }} />
      <span className="font-medium">{hex}</span>
      {phanTram !== undefined && <span className="text-muted-foreground">{phanTram}%</span>}
      {tiLe !== undefined && (
        <span className={dat ? 'text-(--color-text-success)' : 'text-(--color-text-danger)'}>
          <span aria-hidden="true">{dat ? '✓' : '✗'} </span>
          {tiLe.toFixed(1)}:1
          <span className="sr-only">{dat ? ', đạt AA' : ', dưới AA'}</span>
        </span>
      )}
    </span>
  )
}

function hangMau(t: Token): Hang {
  const tro = t.tro && (t.tro.sang === t.tro.toi ? t.tro.sang : `${t.tro.sang ?? '—'} / ${t.tro.toi ?? '—'}`)
  const phu = [tro && `→ ${tro}`, t.tuongPhan && `chữ đo trên ${t.tuongPhan.nen}`].filter(Boolean).join(' · ')
  return {
    key: t.ten,
    ten: t.ten,
    phu: phu && <span className="ds-text-xs break-words text-muted-foreground">{phu}</span>,
    o: [
      <Chip key="s" gia={t.sang} caro={CARO.sang} tiLe={t.tuongPhan?.sang} />,
      t.sang === t.toi && !t.tuongPhan ? (
        <span key="t" className="ds-text-xs text-muted-foreground">
          Như Sáng
        </span>
      ) : (
        <Chip key="t" gia={t.toi} caro={CARO.toi} tiLe={t.tuongPhan?.toi} />
      ),
    ],
    bien: t.bien,
  }
}

/** Trang Màu: semantic shadcn → thang OpenAI → color-* theo vai, mọi màu trong tokens.json (test: du-lieu.test.ts). */
export function TrangMau() {
  return (
    <TrangNen
      tieuDe="Màu"
      moTa={
        <>
          {SO_MAU} token màu từ ds/nguon/tokens.json. Cột Sáng/Tối là giá trị của từng theme; màu trong suốt ghi % alpha
          trên nền caro; màu chữ ghi tỉ lệ tương phản WCAG (✓ khi đạt 4.5:1). Component dùng nhóm semantic shadcn; thang
          OpenAI chỉ đi qua token semantic.
        </>
      }
      muc={[
        { id: 'semantic', ten: 'Semantic shadcn' },
        { id: 'thang-gray', ten: 'Thang OpenAI' },
        { id: 'vai-chung', ten: 'color-* theo vai' },
        { id: 'tuong-phan', ten: 'Tương phản' },
      ]}
    >
      {NHOM_MAU.map((n) => (
        <MucNen key={n.id} id={n.id} tieuDe={`${n.ten} · ${n.mau.length}`}>
          <BangToken ten={n.ten} cot={['Sáng', 'Tối']} rong={170} hang={n.mau.map(hangMau)} />
        </MucNen>
      ))}
      <MucNen id="tuong-phan" tieuDe="Tương phản dưới WCAG — chấp nhận có chủ đích">
        <Alert color="warning">
          <AlertTitle>Giữ y màu nguồn ChatGPT, không “sửa giùm” trong tokens.css</AlertTitle>
          <AlertDescription>
            4 cặp dưới ngưỡng WCAG được CEO chấp nhận (19/11): chữ danger ở theme tối, viền input, viền Checkbox, chữ Badge
            soft. Số đo từng cặp ở trang Độ tương phản.
          </AlertDescription>
        </Alert>
      </MucNen>
    </TrangNen>
  )
}
