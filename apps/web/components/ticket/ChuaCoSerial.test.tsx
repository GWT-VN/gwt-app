import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ChuaCoSerial } from './ChuaCoSerial'

describe('ChuaCoSerial', () => {
  it('chưa có serial → nhắc bấm Sửa dòng để bổ sung', () => {
    const h = renderToStaticMarkup(<ChuaCoSerial coSerial={false} />)
    expect(h).toContain('Chưa có serial')
    expect(h).toContain('Sửa dòng')
  })
  it('đã có serial → không hiện gì', () => {
    expect(renderToStaticMarkup(<ChuaCoSerial coSerial />)).toBe('')
  })
})
