import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Luat } from '../engine/kieu'

/** Luật lấy từ chính SQL seed (nguồn sự thật) — parse đơn giản từng dòng `(kind, pattern, target, condition, priority, origin)`.
 * Dùng chung cho test đầu vào và đầu ra (Task 6/7) — tách khỏi dau-vao.test.ts để khỏi chép trùng (Ruling R4). */
export function luatTuSeed(): Luat[] {
  const sql = readFileSync(fileURLToPath(new URL('../../../../../supabase/migrations/20260904040100_ke_toan_01_luat_seed.sql', import.meta.url)), 'utf8')
  const re = /^\s*\('(supplier|keyword|product_name)', '((?:[^']|'')*)', '((?:[^']|'')*)', (null|'(?:[^']|'')*'), (\d+), '(\w+)'\)/gm
  const out: Luat[] = []; let m: RegExpExecArray | null
  const un = (s: string) => s.replace(/''/g, "'")
  while ((m = re.exec(sql))) out.push({ kind: m[1] as Luat['kind'], pattern: un(m[2]), targetCode: un(m[3]), condition: m[4] === 'null' ? null : un(m[4].slice(1, -1)), priority: Number(m[5]), origin: m[6] as Luat['origin'], active: true })
  return out
}
