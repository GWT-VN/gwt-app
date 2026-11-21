import { describe, expect, test } from 'vitest'
import { chonTheoBam } from './ChonDong'

const THU_TU = ['a', 'b', 'c', 'd', 'e']
const THUONG = { mod: false, shift: false }
const MOD = { mod: true, shift: false }
const SHIFT = { mod: false, shift: true }

describe('chonTheoBam', () => {
  test('bấm thường: giữ nguyên vùng chọn, chỉ dời neo', () => {
    expect(chonTheoBam(['a', 'b'], 'a', 'd', THU_TU, THUONG)).toEqual({ chon: ['a', 'b'], neo: 'd' })
  })

  test('Ctrl/⌘: bật dòng chưa chọn, tắt dòng đã chọn, neo về dòng vừa bấm', () => {
    expect(chonTheoBam(['a'], 'a', 'c', THU_TU, MOD)).toEqual({ chon: ['a', 'c'], neo: 'c' })
    expect(chonTheoBam(['a', 'c'], 'a', 'a', THU_TU, MOD)).toEqual({ chon: ['c'], neo: 'a' })
  })

  test('⇧: chọn dải từ neo — xuôi và ngược, neo giữ nguyên', () => {
    expect(chonTheoBam([], 'b', 'd', THU_TU, SHIFT)).toEqual({ chon: ['b', 'c', 'd'], neo: 'b' })
    expect(chonTheoBam([], 'd', 'b', THU_TU, SHIFT)).toEqual({ chon: ['b', 'c', 'd'], neo: 'd' })
  })

  test('⇧ thay vùng chọn cũ (bấm lại dải ngắn hơn thì co lại)', () => {
    expect(chonTheoBam(['b', 'c', 'd', 'e'], 'b', 'c', THU_TU, SHIFT)).toEqual({ chon: ['b', 'c'], neo: 'b' })
  })

  test('⇧ khi chưa có neo (hoặc neo không còn trên trang): chỉ dòng vừa bấm, neo = dòng đó', () => {
    expect(chonTheoBam([], null, 'c', THU_TU, SHIFT)).toEqual({ chon: ['c'], neo: 'c' })
    expect(chonTheoBam([], 'x', 'c', THU_TU, SHIFT)).toEqual({ chon: ['c'], neo: 'c' })
  })

  test('Ctrl+⇧: cộng dải vào vùng chọn sẵn có (giữ cả dòng ở trang khác)', () => {
    expect(chonTheoBam(['z', 'a'], 'c', 'e', THU_TU, { mod: true, shift: true })).toEqual({ chon: ['z', 'a', 'c', 'd', 'e'], neo: 'c' })
  })
})
