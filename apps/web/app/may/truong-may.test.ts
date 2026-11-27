import { expect, test } from 'vitest'
import { docTatCa } from '@/bang/locTruong'
import { dieuKienMay, khoangXuat, TRUONG_MAY } from './truong-may'
import { dieuKienLoi, SAP, TRUONG_LOI } from '@/app/loi/truong-loi'
import { dieuKienBaoTri, TRUONG_BAO_TRI } from '@/app/bao-tri/truong-bao-tri'

const nhom = (sp: Record<string, string>, truong: typeof TRUONG_MAY, f: typeof dieuKienMay) =>
  docTatCa(sp, truong).flatMap((d) => f(d, '2026-11-27'))

test('link cũ một giá trị (sp, bh) = phép "là" — cùng nghĩa .eq() của bản cũ', () => {
  expect(nhom({ sp: 'GN610' }, TRUONG_MAY, dieuKienMay)).toEqual(['internal_code.in.("GN610")'])
  expect(nhom({ bh: 'chua_kich_hoat' }, TRUONG_MAY, dieuKienMay)).toEqual(['warranty_activated.eq.false'])
  expect(nhom({ bh: 'het_ca_hai' }, TRUONG_MAY, dieuKienMay)).toEqual([
    'and(warranty_activated.eq.true,co_chinh_sach_bh.eq.true,con_han_may.eq.false,con_han_loi.eq.false)',
  ])
})

test('bảo hành: nhiều giá trị = HOẶC trong một nhóm; "không là" = phủ định từng nhánh; giá trị lạ bị bỏ', () => {
  expect(nhom({ bh: 'chua_kich_hoat,con_han_may,rac' }, TRUONG_MAY, dieuKienMay)).toEqual([
    'warranty_activated.eq.false,and(warranty_activated.eq.true,co_chinh_sach_bh.eq.true,con_han_may.eq.true)',
  ])
  expect(nhom({ bh: 'khong-la~chua_kich_hoat' }, TRUONG_MAY, dieuKienMay)).toEqual(['warranty_activated.eq.true'])
  expect(nhom({ bh: 'rac' }, TRUONG_MAY, dieuKienMay)).toEqual([])
})

test('ngày lắp → install_date; lõi/bảo trì: tt + hạn đúng cột', () => {
  expect(nhom({ lap: 'khoang~2026-11-01..2026-11-20' }, TRUONG_MAY, dieuKienMay)).toEqual([
    'install_date.gte.2026-11-01T00:00:00+07:00',
    'install_date.lt.2026-11-21T00:00:00+07:00',
  ])
  expect(nhom({ tt: 'QUÁ HẠN', han: 'trong~' }, TRUONG_LOI, dieuKienLoi)).toEqual(['tinh_trang.in.("QUÁ HẠN")', 'han_som.is.null'])
  expect(nhom({ tt: `${SAP},đã xong` }, TRUONG_BAO_TRI, dieuKienBaoTri)).toEqual([`tinh_trang.in.("${SAP}","đã xong")`])
  expect(nhom({ han: 'sau~2026-12-01' }, TRUONG_BAO_TRI, dieuKienBaoTri)).toEqual(['due_date.gte.2026-12-01T00:00:00+07:00'])
})

test('khoangXuat: trường ngày → ngtu/ngden của nút Xuất cũ', () => {
  expect(khoangXuat('khoang~2026-11-01..2026-11-20')).toEqual({ ngtu: '2026-11-01', ngden: '2026-11-20' })
  expect(khoangXuat('truoc~2026-11-20')).toEqual({ ngden: '2026-11-19' })
  expect(khoangXuat('sau~2026-11-20')).toEqual({ ngtu: '2026-11-20' })
  expect(khoangXuat('hom-nay~', '2026-11-27')).toEqual({ ngtu: '2026-11-27', ngden: '2026-11-27' })
  expect(khoangXuat(undefined)).toEqual({})
  expect(khoangXuat('trong~')).toEqual({})
})
