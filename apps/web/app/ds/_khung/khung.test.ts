import { expect, test } from 'vitest'
import { khop, locMucLuc } from './loc'
import { chiaMuc, docNguon, motDong, neoTieuDe, readmeComponent, TAI_LIEU } from './readme'

test('khop: không dấu, không hoa thường, ô trống khớp hết', () => {
  expect(khop('', 'Màu')).toBe(true)
  expect(khop('mau', 'Màu')).toBe(true)
  expect(khop('KHOANG cach', 'Khoảng cách')).toBe(true)
  expect(khop('do', 'Độ tương phản')).toBe(true) // đ → d
  expect(khop('colors', 'Màu', 'colors color')).toBe(true)
  expect(khop('mau', 'Chữ', 'typography')).toBe(false)
})

test('locMucLuc: trang theo từ khoá, nhóm khớp tên giữ cả nhóm, nhóm rỗng bị bỏ', () => {
  const trang = [
    { ten: 'Màu', tuKhoa: 'colors' },
    { ten: 'Chữ', tuKhoa: 'typography' },
  ]
  const nhom = [
    { ten: 'Form', muc: [{ ten: 'Input' }, { ten: 'Select' }] },
    { ten: 'Nền', muc: [{ ten: 'Button' }, { ten: 'Badge' }] },
  ]
  expect(locMucLuc(trang, nhom, 'color').trang.map((t) => t.ten)).toEqual(['Màu'])
  expect(locMucLuc(trang, nhom, 'form').nhom).toEqual([nhom[0]])
  const b = locMucLuc(trang, nhom, 'bu')
  expect(b.trang).toEqual([])
  expect(b.nhom).toEqual([{ ten: 'Nền', muc: [{ ten: 'Button' }] }])
  expect(locMucLuc(trang, nhom, '')).toEqual({ trang, nhom })
})

test('chiaMuc: phần đầu + tiêu đề → thân, mục rỗng ở cuối file', () => {
  const { dau, muc } = chiaMuc('Mở đầu\n\n## Một\nthân 1\n\n## Hai, ba\n- a\n## Cuối')
  expect(dau).toBe('Mở đầu')
  expect([...muc]).toEqual([
    ['Một', 'thân 1'],
    ['Hai, ba', '- a'],
    ['Cuối', ''],
  ])
})

test('neoTieuDe', () => {
  expect(neoTieuDe('Ánh xạ token shadcn → OpenAI')).toBe('anh-xa-token-shadcn-openai')
  expect(neoTieuDe('Tích hợp vào gwt-app (rework/v2.0.0)')).toBe('tich-hop-vao-gwt-app-rework-v2-0-0')
})

test('mỗi mục README dự án thuộc đúng một trang chữ của /ds', () => {
  const tieuDe = [...chiaMuc(docNguon('README.md')).muc.keys()]
  const daGan = Object.values(TAI_LIEU).flatMap((t) => t.muc)
  expect([...daGan].sort()).toEqual([...tieuDe].sort())
})

test('motDong: dòng chữ đầu, bỏ đậm và backtick; README component có/không', () => {
  expect(motDong('\nshadcn `Button` mặc áo **OpenAI**.\n\nThân')).toBe('shadcn Button mặc áo OpenAI.')
  expect(motDong(readmeComponent('Button') ?? '')).toMatch(/^shadcn Button/)
  expect(readmeComponent('Table')).toBeNull()
})
