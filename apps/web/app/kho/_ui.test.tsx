import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { Bang, KhungKho, LinkMa } from './_ui'

vi.mock('./_tu-lam-moi', () => ({ TuLamMoi: () => null }))

it('renders warehouse records in the DS and retains warehouse scope in the item link', () => {
  const html = renderToStaticMarkup(
    <KhungKho tieuDe="Tồn kho" kho="HCM">
      <Bang dau={['Mã', 'Tồn']} phai={[1]}>
        <tr><td><LinkMa ma="A/1" kho="HCM" /></td><td>1</td></tr>
      </Bang>
    </KhungKho>,
  )
  expect(html).toContain('Kho HCM')
  expect(html).toContain('/kho/ma/A%2F1?kho=HCM')
  expect(html).toContain('data-slot="page-header"')
  expect(html).toContain('data-slot="table"')
})
