import { norm, sd, hard, boNgoac, boTuNgoac } from '../chuan-hoa'
import type { DoTinCay, KetQuaDauVao, Luat, MucCatalog, MucKmcp, ThongKeHoc } from './kieu'

/**
 * Engine phân loại HĐ ĐẦU VÀO — port 1:1 từ gwt_ketoan/engine.py (Classifier.suggest) và
 * gwt_ketoan/nexia.py (_is_goods, match_code, classify_input_row). Thứ tự tầng GIỮ NGUYÊN:
 *   goods? → 0) override NCC → override từ khoá → A) rule NCC (khớp dài nhất) → B) rule từ khoá
 *   → C) học lịch sử (NCC ≥70%, tiền tố diễn giải ≥80%; lát 2 mới có dữ liệu) → không rõ.
 * Hàm thuần: không DB, không React. Mọi input đã là dữ liệu đọc từ DB/fixture.
 */
export const MA_DICH_VU_KHONG_PHAI_HANG = ['DVVC', 'DVBT', 'DVLD', 'DVSC'] as const
export const TINH_CHAT_TK: Record<string, string> = { 'Hàng hóa': '1561', 'Thành phẩm': '1561', 'Nguyên vật liệu': '152', 'Công cụ dụng cụ': '153' }
export const TK_NHAN: Record<string, string> = { '1561': 'HÀNG HOÁ', '152': 'VẬT TƯ (NVL)', '153': 'CCDC' }
const TK_HANG_MAC_DINH = '1561'

const STOP = new Set('loc nuoc may ge cho bo loi filter use for machine dung cua phan bphan the he generation cai chiec va don gia hang tang khong tinh tien mua ban thiet bi bung 2nd showerhead shower'.split(' '))
const KWSET = new Set(['cpf', 'pcf', 'pcfb', 'pcff', 'nf', 'cfnc', 'pp', 'pac', 'sparkling', 'sen', 'muoi', 'aromatherapy'])

function chuKy(name: string): string | null {
  const s = sd(name).replace(/[^a-z0-9 ]/g, ' ')
  const toks = s.split(' ').filter((t) => t && !STOP.has(t) && t.length >= 2 && !/^\d+$/.test(t))
  const keep = toks.filter((t) => /\d/.test(t) || KWSET.has(t))
  return keep.length ? [...new Set(keep)].sort().join('+') : null
}
function tienTo(desc: unknown, n = 5): string { return norm(desc).split(' ').slice(0, n).join(' ') }

export function taoEngineDauVao(input: { luat: Luat[]; catalog: MucCatalog[]; kmcp: MucKmcp[]; thongKe?: ThongKeHoc }) {
  const L = input.luat.filter((l) => l.active)
  const byPri = (a: Luat, b: Luat) => a.priority - b.priority
  const ovSup = L.filter((l) => l.origin === 'override_json' && l.kind === 'supplier').sort(byPri)
  const ovKw = L.filter((l) => l.origin === 'override_json' && l.kind === 'keyword').sort(byPri)
  const ovName = new Map(L.filter((l) => l.origin === 'override_json' && l.kind === 'product_name').sort(byPri).map((l) => [l.pattern, l.targetCode]))
  const ruleSup = L.filter((l) => l.origin === 'rule_excel' && l.kind === 'supplier').sort(byPri)
  const ruleKw = L.filter((l) => l.origin === 'rule_excel' && l.kind === 'keyword').sort(byPri)
  const appSup = L.filter((l) => l.origin === 'app' && l.kind === 'supplier').sort(byPri)   // "Đặt thành luật" (lát 2) — ưu tiên như override
  const appKw = L.filter((l) => l.origin === 'app' && l.kind === 'keyword').sort(byPri)
  const n2c = new Map<string, string>(); for (const l of L) if (l.origin === 'history' && l.kind === 'product_name') n2c.set(l.pattern, l.targetCode)
  const kmTen = new Map(input.kmcp.map((k) => [k.ma, k.ten])); const kmTk = new Map(input.kmcp.map((k) => [k.ma, k.tkNoDefault]))
  const thongKe: ThongKeHoc = input.thongKe ?? { nccToMa: {}, prefixToMa: {} }

  // catalog: khớp đúng (sd) / khớp cứng (hard); bỏ mã dịch vụ & mã cp.*
  // Lệch Python có chủ đích: nexia.py._is_goods() KHÔNG lọc trước khi dựng _CAT_EXACT/_CAT_HARD
  // (catalog_lookup thấy mọi dòng catalog), chỉ loại 4 mã DVVC/DVBT/DVLD/DVSC SAU lookup (dòng laHangHoa()
  // dưới cũng làm vậy). Ở đây lọc `cp.*`/tính chất "Dịch vụ" NGAY khi dựng catExact/catHard/catTc —
  // trung tính với catalog hiện tại vì đúng 4 dòng "Dịch vụ" trong `expense_category` chính là 4 mã đó
  // (không có mã Dịch vụ nào khác lọt catalog). Masterdata thêm dòng tính chất "Dịch vụ" mã khác 4 mã
  // trên → hai bên lệch (TS sẽ loại nó ở catalogLookup, Python vẫn cho catalog_lookup khớp rồi mới lọc).
  const catExact = new Map<string, MucCatalog>(); const catHard = new Map<string, MucCatalog>(); const catTc = new Map<string, string>()
  for (const c of input.catalog) {
    if (c.ma.startsWith('cp.') || c.tinhChat === 'Dịch vụ') continue
    if (!catExact.has(sd(c.ten))) catExact.set(sd(c.ten), c)
    if (!catHard.has(hard(c.ten))) catHard.set(hard(c.ten), c)
    catTc.set(c.ma, c.tinhChat)
  }
  function catalogLookup(name: string): MucCatalog | null {
    const s = sd(name); if (catExact.has(s)) return catExact.get(s)!
    const h = hard(name); if (h && catHard.has(h)) return catHard.get(h)!
    const s2 = boTuNgoac(s); if (s2 && catExact.has(s2)) return catExact.get(s2)!
    const h2 = hard(s2); if (h2 && catHard.has(h2)) return catHard.get(h2)!
    return null
  }
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

  function goiYMaNoiBo(tenHang: unknown): { ma: string; conf: 'cao' | 'trung binh' | 'can gan tay' | 'trong'; canCu: string } {
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

  function laHangHoa(desc: unknown): { ma: string; tk: string; nhan: string } | null {
    const s = sd(desc)
    if (['phi ', 'phi(', 'dich vu', 'cuoc', 'hoa hong'].some((w) => s.includes(w))) return null
    const cat = catalogLookup(String(desc ?? ''))
    if (cat && !(MA_DICH_VU_KHONG_PHAI_HANG as readonly string[]).includes(cat.ma)) {
      const tk = TINH_CHAT_TK[cat.tinhChat] ?? TK_HANG_MAC_DINH; return { ma: cat.ma, tk, nhan: TK_NHAN[tk] ?? 'HÀNG HOÁ' }
    }
    const g = goiYMaNoiBo(desc)
    if (g.ma && (g.conf === 'cao' || g.conf === 'trung binh') && !['SHIP', 'DVVC', 'BT'].includes(g.ma)) {
      const tk = TINH_CHAT_TK[catTc.get(g.ma) ?? 'Hàng hóa'] ?? TK_HANG_MAC_DINH; return { ma: g.ma, tk, nhan: TK_NHAN[tk] ?? 'HÀNG HOÁ' }
    }
    return null
  }

  function suggest(seller: unknown, desc: unknown): { kmcp: string; conf: DoTinCay; reason: string; nguon: string } {
    const p = norm(seller), d = norm(desc)
    for (const l of [...ovSup, ...appSup]) if (l.pattern && p.includes(l.pattern)) return { kmcp: l.targetCode, conf: 'cao', reason: `Đã chốt tay: NCC ~«${l.pattern}» → ${l.targetCode}`, nguon: 'override_ncc' }
    for (const l of [...ovKw, ...appKw]) if (l.pattern && d.includes(l.pattern)) return { kmcp: l.targetCode, conf: 'cao', reason: `Đã chốt tay: từ khoá «${l.pattern}» → ${l.targetCode}`, nguon: 'override_kw' }
    let best: { len: number; l: Luat } | null = null
    for (const l of ruleSup) {
      if (l.pattern.length < 5) continue
      if (p.includes(l.pattern) || (p.length >= 8 && l.pattern.includes(p))) if (!best || l.pattern.length > best.len) best = { len: l.pattern.length, l }
    }
    if (best) { const dk = best.l.condition ?? ''; return { kmcp: best.l.targetCode, conf: dk ? 'trung binh' : 'cao', reason: `NCC khớp Rule «${best.l.pattern}»` + (dk ? ` — điều kiện tách: ${dk.slice(0, 50)}` : ''), nguon: 'rule_ncc' } }
    for (const l of ruleKw) if (l.pattern && d.includes(l.pattern)) { const nl = l.condition ?? ''; return { kmcp: l.targetCode, conf: nl ? 'can review' : 'trung binh', reason: `Từ khoá khớp «${l.pattern}» → ${l.targetCode}` + (nl ? ` (ngoại lệ: ${nl.slice(0, 50)})` : ''), nguon: 'rule_kw' } }
    if (p.length >= 6 && thongKe.nccToMa[p]) return { kmcp: thongKe.nccToMa[p], conf: 'trung binh', reason: `NCC này trong lịch sử luôn vào '${thongKe.nccToMa[p]}'`, nguon: 'hoc_ncc' }
    const pref = tienTo(desc); if (thongKe.prefixToMa[pref]) return { kmcp: thongKe.prefixToMa[pref], conf: 'trung binh', reason: `Diễn giải cùng mẫu «${pref}…» → '${thongKe.prefixToMa[pref]}'`, nguon: 'hoc_prefix' }
    return { kmcp: '', conf: 'khong ro', reason: 'Không khớp Rule/lịch sử — cần gán tay', nguon: '' }
  }

  function phanLoai(seller: unknown, desc: unknown, thue: number | null): KetQuaDauVao {
    const vat = thue && thue > 0 ? '1331' : ''
    const hh = laHangHoa(desc)
    if (hh) return { kind: 'goods', code: hh.ma, codeName: hh.nhan, tkNo: hh.tk, tkCo: '331', vat1331: vat, conf: 'cao', reason: 'Mua vào (mã nội bộ) — không phải chi phí', nguon: 'goods' }
    const sg = suggest(seller, desc)
    if (sg.kmcp === 'cp.muahang') return { kind: 'muahang', code: 'cp.muahang', codeName: 'CP mua hàng nhập khẩu', tkNo: '156', tkCo: '331', vat1331: vat, conf: sg.conf, reason: sg.reason, nguon: sg.nguon }
    if (sg.kmcp) return { kind: 'kmcp', code: sg.kmcp, codeName: kmTen.get(sg.kmcp) ?? '', tkNo: kmTk.get(sg.kmcp) ?? '', tkCo: '331', vat1331: vat, conf: sg.conf, reason: sg.reason, nguon: sg.nguon }
    return { kind: 'unknown', code: '', codeName: '', tkNo: '', tkCo: '', vat1331: vat, conf: 'khong ro', reason: sg.reason, nguon: '' }
  }

  return { phanLoai, goiYMaNoiBo }
}
