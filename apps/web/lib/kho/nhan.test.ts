import { describe, expect, it } from 'vitest'
import { chungTuEton } from './nhan'

describe('chungTuEton', () => {
  it('lấy mã chứng từ từ eton_key', () => expect(chungTuEton('eton:SOGWTN6GGYPSN|CTD50NG|SO_PACKED|1')).toBe('SOGWTN6GGYPSN'))
  it('id Discord số → null', () => expect(chungTuEton('1484056527173062737')).toBeNull())
  it('kiemke → null', () => expect(chungTuEton('kiemke:abc-123')).toBeNull())
  it('null → null', () => expect(chungTuEton(null)).toBeNull())
})
