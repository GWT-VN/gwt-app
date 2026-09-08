import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Cùng khuôn lib/ke-toan-guard.test.ts: mọi hàm chạm DB trong actions màn duyệt phải gác chanDuyetWiki().
const src = readFileSync(fileURLToPath(new URL('../app/wiki/de-xuat/actions.ts', import.meta.url)), 'utf8')

describe('wiki/de-xuat/actions.ts — mọi hàm chạm DB đều gác chanDuyetWiki()', () => {
  const doan = src.split(/(?=async function )/)
  const viPham: string[] = []
  for (const p of doan) {
    const m = /\basync function (\w+)/.exec(p)
    if (!m || m[1] === 'chanDuyetWiki' || m[1] === 'goi') continue
    if ((p.includes('dataClient(') || p.includes('goi<') || p.includes('goi(')) && !/\bchanDuyetWiki\(/.test(p) && !/\bgoi[<(]/.test(p)) viPham.push(m[1])
  }
  it('không hàm nào chạm DB mà thiếu chanDuyetWiki()/goi()', () => expect(viPham, viPham.join(', ')).toEqual([]))
  it('helper goi() luôn gọi chanDuyetWiki()', () => {
    const goi = doan.find((p) => /async function goi\b/.test(p)) ?? ''
    expect(goi).toMatch(/chanDuyetWiki\(\)/)
  })
  it('không nhận email từ tham số client', () => expect(src).not.toMatch(/p_email:\s*(email|form\.get)/))
  it('hàm nào có try { thì chanDuyetWiki( phải đứng TRƯỚC try { (không nuốt redirect)', () => {
    const viPham2: string[] = []
    for (const p of doan) {
      const m = /\basync function (\w+)/.exec(p)
      if (!m || m[1] === 'chanDuyetWiki' || m[1] === 'goi') continue
      const iTry = p.indexOf('try {')
      if (iTry === -1) continue
      const iGate = p.indexOf('chanDuyetWiki(')
      if (iGate === -1 || iGate > iTry) viPham2.push(m[1])
    }
    expect(viPham2, viPham2.join(', ')).toEqual([])
  })
  it('endpoint ingest nằm trong đường công khai của proxy (route tự gác bearer)', () => {
    const proxy = readFileSync(fileURLToPath(new URL('../proxy.ts', import.meta.url)), 'utf8')
    expect(proxy).toMatch(/DUONG_CONG_KHAI = \[[^\]]*'\/api\/wiki-ingest'/)
  })
})
