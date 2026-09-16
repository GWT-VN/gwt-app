import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const doc = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
// chanKeToan()/goi()/duLieuEngine() giờ sống ở _chung.ts (lát 5, tách để cả hai file action dùng
// chung — 'use server' chỉ được export hàm async, không export được TOI_DA_BYTE/LO/KyRow) — gộp cả
// ba file vào MỘT nguồn duy nhất thì luật cũ (chưa đổi 1 dòng) áp được lên mọi file mới thêm sau này.
const FILES = ['../app/ke-toan/actions.ts', '../app/ke-toan/sao-ke/actions.ts', '../app/ke-toan/_chung.ts']
const src = FILES.map(doc).join('\n')

describe('khu Kế toán — mọi hàm chạm DB đều gác chanKeToan()', () => {
  const doan = src.split(/(?=async function )/)
  const viPham: string[] = []
  for (const p of doan) {
    const m = /\basync function (\w+)/.exec(p)
    if (!m || m[1] === 'chanKeToan' || m[1] === 'goi') continue
    if ((p.includes('dataClient(') || p.includes('goi<') || p.includes('goi(')) && !/\bchanKeToan\(/.test(p) && !/\bgoi[<(]/.test(p)) viPham.push(m[1])
  }
  it('không hàm nào chạm DB mà thiếu chanKeToan()/goi()', () => expect(viPham, viPham.join(', ')).toEqual([]))
  it('helper goi() luôn gọi chanKeToan()', () => {
    const goi = doan.find((p) => /async function goi\b/.test(p)) ?? ''
    expect(goi).toMatch(/chanKeToan\(\)/)
  })
  it('không nhận email từ tham số client', () => expect(src).not.toMatch(/p_email:\s*(email|form\.get)/))
  it('hàm nào có try { thì chanKeToan( đầu tiên phải đứng TRƯỚC try { đầu tiên (không nuốt redirect)', () => {
    const viPham2: string[] = []
    for (const p of doan) {
      const m = /\basync function (\w+)/.exec(p)
      if (!m || m[1] === 'chanKeToan' || m[1] === 'goi') continue
      const iTry = p.indexOf('try {')
      if (iTry === -1) continue
      const iGate = p.indexOf('chanKeToan(')
      if (iGate === -1 || iGate > iTry) viPham2.push(m[1])
    }
    expect(viPham2, viPham2.join(', ')).toEqual([])
  })
})
