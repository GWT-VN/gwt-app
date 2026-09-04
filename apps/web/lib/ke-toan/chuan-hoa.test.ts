import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { norm, sd, hard, boNgoac, boTuNgoac, khoaDong } from './chuan-hoa'

const cases = JSON.parse(readFileSync(fileURLToPath(new URL('./__fixtures__/chuan-hoa-cases.json', import.meta.url)), 'utf8')) as {
  norm: [string, string][]; sd: [string, string][]; hard: [string, string][]
}

describe('chuan-hoa khớp Python', () => {
  it('norm: bỏ dấu, đ→d', () => { for (const [i, o] of cases.norm) expect(norm(i), i).toBe(o) })
  it('sd: bỏ dấu, giữ đ', () => { for (const [i, o] of cases.sd) expect(sd(i), i).toBe(o) })
  it('hard: chỉ a-z0-9', () => { for (const [i, o] of cases.hard) expect(hard(i), i).toBe(o) })
  it('null/undefined/số → chuỗi', () => {
    expect(norm(null)).toBe(''); expect(sd(undefined)).toBe(''); expect(norm(12.5)).toBe('12.5')
  })
})

describe('ngoặc', () => {
  it('boNgoac bỏ từng cặp', () => expect(boNgoac('vòi sen (hồng) xịn (2nd)')).toBe('vòi sen  xịn'))
  it('boTuNgoac bỏ từ ( tới hết kể cả chưa đóng', () => expect(boTuNgoac('cút vesbo 25mm (màu đen')).toBe('cút vesbo 25mm'))
})

describe('khoaDong', () => {
  it('ổn định, 40 hex, khác nhau khi đổi thành tiền', () => {
    const a = khoaDong('vao', 'C26MTS', ' 487', 'Má giòn mù tạt', 87000)
    expect(a).toMatch(/^[0-9a-f]{40}$/)
    expect(khoaDong('vao', 'C26MTS', '487', 'MÁ GIÒN MÙ TẠT ', 87000.4)).toBe(a)
    expect(khoaDong('vao', 'C26MTS', '487', 'Má giòn mù tạt', 88000)).not.toBe(a)
    expect(khoaDong('ra', 'C26MTS', '487', 'Má giòn mù tạt', 87000)).not.toBe(a)
  })
})
