import { describe, expect, it } from 'vitest'
import { chuanHoaSerial, kiemDangSerial } from './serial'

describe('lib/loi/serial', () => {
  it('chuẩn hoá: viết hoa, bỏ khoảng trắng', () => {
    expect(chuanHoaSerial(' z12345678 abc12345678 ')).toBe('Z12345678ABC12345678')
  })
  it('đúng dạng 1 chữ + 8 số + 3 chữ/số + 8 số', () => {
    expect(kiemDangSerial('Z12345678AB912345678')).toEqual({ chuan: 'Z12345678AB912345678', hopLe: true, loi: null })
  })
  it('thiếu ký tự → nói rõ đang có bao nhiêu', () => {
    const r = kiemDangSerial('Z1234567')
    expect(r.hopLe).toBe(false)
    expect(r.loi).toBe('Serial phải đủ 20 ký tự (đang có 8).')
  })
  it('đủ 20 nhưng sai khuôn', () => {
    expect(kiemDangSerial('112345678ABC12345678').loi).toBe('Sai dạng: 1 chữ + 8 số + 3 chữ/số + 8 số.')
  })
  it('rỗng → không hợp lệ, không có câu lỗi (chưa gõ)', () => {
    expect(kiemDangSerial('  ')).toEqual({ chuan: '', hopLe: false, loi: null })
  })
  it('serial cũ đã có trong hệ thống được chấp nhận dù sai dạng', () => {
    expect(kiemDangSerial('OLD-1', { daCo: true })).toEqual({ chuan: 'OLD-1', hopLe: true, loi: null })
  })
})
