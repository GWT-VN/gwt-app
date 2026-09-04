import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const src = readFileSync(fileURLToPath(new URL('../app/ke-toan/actions.ts', import.meta.url)), 'utf8')

describe('ke-toan/actions.ts — mọi hàm chạm DB đều gác chanKeToan()', () => {
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
})
