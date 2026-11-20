import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { hienKhoang, kepNgay } from '@/bang/ngay'
import { kichThuocDoc, kiemTep } from '@/lib/tep'
import * as nut from './button'
import { buttonVariants } from './button-variants'
import { calendarFoot, calendarFootClear, calendarPop } from './calendar-styles'
import { selectTrigger, selectValue } from './control-styles'
import * as ngay from './date-picker'
import * as khoang from './date-range-picker'
import * as tep from './file-upload'
import * as chon from './select'

// Hằng/hàm thuần mà server component (vd `<Link className={buttonVariants()}>`) hay server action (`kiemTep`) cần gọi:
// file 'use client' biến mọi export thành tham chiếu client → gọi ở server ném lỗi. Nên chúng sống ở file THƯỜNG.
const THUAN = [
  './button-variants.ts',
  './calendar-styles.ts',
  './control-styles.ts',
  '../../bang/ngay.ts',
  '../../lib/tep.ts',
]

test('file hằng/hàm thuần không mang "use client"', () => {
  for (const f of THUAN) {
    const nguon = readFileSync(new URL(f, import.meta.url), 'utf8')
    expect(nguon, f).not.toMatch(/^\s*['"]use client['"]/)
  }
})

test('gọi được trong môi trường node (không DOM, không React)', () => {
  expect(buttonVariants({ variant: 'outline', size: 'sm' })).toContain('h-(--control-size-sm)')
  expect(selectTrigger).toContain('font-medium')
  expect(selectValue).toContain('truncate')
  expect(calendarPop).toContain('rounded-(--radius-4xl)')
  expect(calendarFoot).toContain('justify-between')
  expect(calendarFootClear).toContain('underline')
  expect(kepNgay('2026-01-01', '2026-02-01')).toBe('2026-02-01')
  expect(hienKhoang({ tu: '2026-11-01', den: '2026-11-18' })).toBe('01/11/2026 – 18/11/2026')
  expect(kichThuocDoc(2_411_725)).toBe('2,3 MB')
  expect(kiemTep(new File(['x'], 'a.exe'), { accept: '.pdf', toiDaMB: 1 })).toBe('Chỉ nhận PDF')
})

test('file component cũ re-export đúng cùng tham chiếu (import cũ không gãy)', () => {
  expect(nut.buttonVariants).toBe(buttonVariants)
  expect(chon.selectTrigger).toBe(selectTrigger)
  expect(chon.selectValue).toBe(selectValue)
  expect(ngay.calendarPop).toBe(calendarPop)
  expect(ngay.calendarFoot).toBe(calendarFoot)
  expect(ngay.calendarFootClear).toBe(calendarFootClear)
  expect(ngay.kepNgay).toBe(kepNgay)
  expect(khoang.hienKhoang).toBe(hienKhoang)
  expect(tep.kiemTep).toBe(kiemTep)
  expect(tep.kichThuocDoc).toBe(kichThuocDoc)
})
