import { expect, test } from 'vitest'
import type { MaQuyen } from '@/lib/nen-tang/quyen'
import { danhDauDangO, khuCuaDuong, lapKhu, mucCuaDuong, type DauVaoKhung, type MucBanDo } from './ban-do-menu'

const dv = (q: MaQuyen[] = [], ghiDe: Partial<DauVaoKhung> = {}): DauVaoKhung => ({
  co: (ma) => q.includes(ma),
  chiKyThuat: false,
  vaoCS: true,
  vaoSales: true,
  suaDs: false,
  ...ghiDe,
})
const ids = (v: DauVaoKhung) => lapKhu(v).map((k) => k.id)
const hrefs = (ds: MucBanDo[]): string[] => ds.flatMap((x) => (x.con ? hrefs(x.con) : [x.href!]))

test('khu theo quyền: không vào CS/Sales/Kho thì không có khu đó; Quản trị chỉ khi có ít nhất một trang quản trị', () => {
  expect(ids(dv([], { vaoCS: false, vaoSales: false }))).toEqual(['viec', 'wiki', 'nhan-su', 'ke-toan'])
  expect(ids(dv(['kho.ton.xem', 'he_thong.nhat_ky']))).toEqual(['viec', 'cskh', 'sales', 'kho', 'wiki', 'nhan-su', 'ke-toan', 'quan-tri'])
  const qt = lapKhu(dv(['he_thong.nhat_ky'])).find((k) => k.id === 'quan-tri')!
  expect(qt.day).toBe(true)
  expect(hrefs(qt.menu)).toEqual(['/audit'])
})

test('menu lọc theo quyền như thanh menu cũ; nhóm rỗng sau lọc thì bỏ hẳn', () => {
  const cs = (v: DauVaoKhung) => lapKhu(v).find((k) => k.id === 'cskh')!.menu
  expect(cs(dv()).some((x) => x.id === 'ky-thuat')).toBe(false)
  expect(hrefs(cs(dv(['cs.ky_thuat.xep_lich'])))).toContain('/ky-thuat/lich')
  expect(hrefs(cs(dv()))).not.toContain('/bao-tri/map')
  expect(hrefs(cs(dv(['cs.bao_tri.tao_plan'])))).toContain('/bao-tri/map')
  expect(hrefs(cs(dv([], { suaDs: true })))).toContain('/danh-sach-nguoi')
  expect(hrefs(cs(dv([], { chiKyThuat: true })))).toEqual(['/ky-thuat/cua-toi'])
  const viec = (v: DauVaoKhung) => hrefs(lapKhu(v)[0].menu)
  expect(viec(dv())).toEqual(['/work', '/work/team'])
  expect(viec(dv(['work.luat_tu_sinh']))).toContain('/work/tu-sinh')
})

test('mục đang ở: trùng hẳn > tiền tố dài nhất > bảng CHA; "/work/team" không làm sáng "/work"', () => {
  const k = lapKhu(dv(['kho.ton.xem']))
  const menu = (id: string) => k.find((x) => x.id === id)!.menu
  expect(mucCuaDuong('/work/team', menu('viec'))?.href).toBe('/work/team')
  expect(mucCuaDuong('/work', menu('viec'))?.href).toBe('/work')
  expect(mucCuaDuong('/kho/ma/ABC', menu('kho'))?.href).toBe('/kho')
  expect(mucCuaDuong('/khach/gop/12', menu('cskh'))?.href).toBe('/khach/gop')
  expect(mucCuaDuong('/khach/123', menu('cskh'))?.href).toBe('/khach-hang')
  expect(mucCuaDuong('/may/SN-1', menu('cskh'))?.href).toBe('/')
  expect(mucCuaDuong('/ticket/TK-1', menu('cskh'))?.href).toBe('/ticket')
  expect(mucCuaDuong('/tim', menu('cskh'))).toBeUndefined()
  const d = danhDauDangO(menu('cskh'), '/serial')
  const may = d.find((x) => x.id === 'may')!
  expect(may.con!.filter((x) => (x as { dangO?: boolean }).dangO).map((x) => x.href)).toEqual(['/serial'])
  expect(d.filter((x) => (x as { dangO?: boolean }).dangO)).toEqual([])
})

test('khu của đường dẫn: "/sales/khach/1" là Sales (không lẫn khách CSKH); "/" và trang lạ về CSKH, không vào CS thì Việc', () => {
  const k = lapKhu(dv(['kho.ton.xem', 'he_thong.nhan_su.xem']))
  expect(khuCuaDuong('/sales/khach/1', k)).toBe('sales')
  expect(khuCuaDuong('/khach', k)).toBe('cskh')
  expect(khuCuaDuong('/', k)).toBe('cskh')
  expect(khuCuaDuong('/work/team', k)).toBe('viec')
  expect(khuCuaDuong('/wiki/san-pham/may-loc', k)).toBe('wiki')
  expect(khuCuaDuong('/nhan-vien', k)).toBe('quan-tri')
  expect(khuCuaDuong('/tim', k)).toBe('cskh')
  expect(khuCuaDuong('/tim', lapKhu(dv([], { vaoCS: false })))).toBe('viec')
})
