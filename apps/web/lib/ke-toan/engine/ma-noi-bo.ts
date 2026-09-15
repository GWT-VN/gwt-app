import { sd, boNgoac } from '../chuan-hoa'
import type { Luat } from './kieu'

/**
 * Gợi ý mã nội bộ từ tên hàng — port `match_code` (gwt_ketoan/nexia.py). Tách khỏi `dau-vao.ts`
 * (lát 2, Task 6) để `hoa-don-ra` (đầu ra) dùng chung. Hàm thuần: không DB, không React.
 */
export type GoiYMa = { ma: string; conf: 'cao' | 'trung binh' | 'can gan tay' | 'trong'; canCu: string }

const STOP = new Set('loc nuoc may ge cho bo loi filter use for machine dung cua phan bphan the he generation cai chiec va don gia hang tang khong tinh tien mua ban thiet bi bung 2nd showerhead shower'.split(' '))
const KWSET = new Set(['cpf', 'pcf', 'pcfb', 'pcff', 'nf', 'cfnc', 'pp', 'pac', 'sparkling', 'sen', 'muoi', 'aromatherapy'])

function chuKy(name: string): string | null {
  const s = sd(name).replace(/[^a-z0-9 ]/g, ' ')
  const toks = s.split(' ').filter((t) => t && !STOP.has(t) && t.length >= 2 && !/^\d+$/.test(t))
  const keep = toks.filter((t) => /\d/.test(t) || KWSET.has(t))
  return keep.length ? [...new Set(keep)].sort().join('+') : null
}

export function taoGoiYMaNoiBo(luat: Luat[]): (tenHang: unknown) => GoiYMa {
  const ovName = new Map(luat.filter((l) => l.origin === 'override_json' && l.kind === 'product_name').sort((a, b) => a.priority - b.priority).map((l) => [l.pattern, l.targetCode]))
  const n2c = new Map<string, string>(); for (const l of luat) if (l.origin === 'history' && l.kind === 'product_name') n2c.set(l.pattern, l.targetCode)
  // chữ ký từ lịch sử tên hàng: sig → mã áp đảo
  const sigCount = new Map<string, Map<string, number>>()
  for (const [name, code] of n2c) { const g = chuKy(name); if (!g) continue; const m = sigCount.get(g) ?? new Map(); m.set(code, (m.get(code) ?? 0) + 1); sigCount.set(g, m) }
  const sig = new Map<string, string>(); for (const [g, m] of sigCount) sig.set(g, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0])
  // Lệch Python có chủ đích: nexia.py.match_code() đọc mặc định từ khoá override RIÊNG
  // `_OV.get("shipping_output_code", "DVVC")` — một khoá config tách biệt khỏi bảng tên hàng. Ở đây
  // dùng lại chính bảng override tên hàng (`ovName`) với pattern cố định 'dich vu van chuyen' thay vì
  // một khoá config riêng. Trung tính hôm nay vì chưa có override nào đặt khoá đó (Python) lẫn pattern
  // này (TS) — cả hai đều rơi về mặc định cứng 'DVVC'. Sẽ lệch nếu sau này ai thêm override qua khoá
  // `shipping_output_code` bên Python: TS sẽ không đọc được, vẫn dùng 'DVVC'.
  const shipping = ovName.get('dich vu van chuyen') ?? 'DVVC'

  return function goiYMaNoiBo(tenHang: unknown): GoiYMa {
    const s = sd(tenHang); if (!s) return { ma: '', conf: 'trong', canCu: '' }
    if (ovName.has(s)) return { ma: ovName.get(s)!, conf: 'cao', canCu: 'đã chốt tay' }
    if (n2c.has(s)) return { ma: n2c.get(s)!, conf: 'cao', canCu: 'khớp tên lịch sử' }
    const s2 = boNgoac(s)
    if (ovName.has(s2)) return { ma: ovName.get(s2)!, conf: 'cao', canCu: 'đã chốt tay' }
    if (n2c.has(s2)) return { ma: n2c.get(s2)!, conf: 'cao', canCu: 'khớp tên (bỏ ngoặc)' }
    if (s.includes('cts10')) { if (s.includes('trang')) return { ma: 'CTS10NW', conf: 'cao', canCu: 'CTS10 trắng' }; if (s.includes('den')) return { ma: 'CTS10NB', conf: 'cao', canCu: 'CTS10 đen' } }
    if (s.includes('aromatherapy') || s.includes('aromatheraphy')) { if (s.includes('hong')) return { ma: 'GEUS-00X06', conf: 'cao', canCu: 'vòi sen Hồng' }; if (s.includes('trang')) return { ma: 'GEUS-00X05', conf: 'cao', canCu: 'vòi sen Trắng' } }
    if (s.includes('van chuyen')) return { ma: shipping, conf: 'cao', canCu: 'dịch vụ vận chuyển' }
    const g = chuKy(String(tenHang ?? '')); if (g && sig.has(g)) return { ma: sig.get(g)!, conf: 'trung binh', canCu: 'khớp chữ ký ' + g }
    for (const [k, v] of n2c) if (k.length >= 12 && (s.includes(k) || k.includes(s))) return { ma: v, conf: 'trung binh', canCu: 'gần khớp tên' }
    return { ma: '', conf: 'can gan tay', canCu: 'chưa khớp' }
  }
}
