import type { ComponentType } from 'react'
import { KhoiAlert } from '../_khoi/khoi-alert'
import { KhoiAvatar } from '../_khoi/khoi-avatar'
import { KhoiBadge } from '../_khoi/khoi-badge'
import { KhoiButton } from '../_khoi/khoi-button'
import { KhoiCard } from '../_khoi/khoi-card'
import { KhoiCheckbox } from '../_khoi/khoi-checkbox'
import { KhoiCombobox } from '../_khoi/khoi-combobox'
import { KhoiConfirmDialog } from '../_khoi/khoi-confirm-dialog'
import { KhoiContextMenu } from '../_khoi/khoi-context-menu'
import { KhoiDatePicker } from '../_khoi/khoi-date-picker'
import { KhoiDateRangePicker } from '../_khoi/khoi-date-range-picker'
import { KhoiDialog } from '../_khoi/khoi-dialog'
import { KhoiDropdownMenu } from '../_khoi/khoi-dropdown-menu'
import { KhoiFileUpload } from '../_khoi/khoi-file-upload'
import { KhoiFormLayout } from '../_khoi/khoi-form-layout'
import { KhoiInput } from '../_khoi/khoi-input'
import { KhoiInputAffix } from '../_khoi/khoi-input-affix'
import { KhoiKbd } from '../_khoi/khoi-kbd'
import { KhoiRadio } from '../_khoi/khoi-radio'
import { KhoiSelect } from '../_khoi/khoi-select'
import { KhoiSheet } from '../_khoi/khoi-sheet'
import { KhoiSwitch } from '../_khoi/khoi-switch'
import { KhoiTooltip } from '../_khoi/khoi-tooltip'
import { KHOI_T1 } from './dk-t1'
import { KHOI_T2 } from './dk-t2'
import { KHOI_T3 } from './dk-t3'
import { KHOI_T4 } from './dk-t4'
import { KHOI_T5 } from './dk-t5'
import { KHOI_T6 } from './dk-t6'
import { KHOI_T7 } from './dk-t7'
import { KHOI_T8 } from './dk-t8'
import { KHOI_T9 } from './dk-t9'
import { KHOI_T10 } from './dk-t10'
import { KHOI_T11 } from './dk-t11'
import { KHOI_T12 } from './dk-t12'
import { KHOI_T13 } from './dk-t13'
import { KHOI_L7_3 } from './dk-l7-3'
import { KHOI_L7_4 } from './dk-l7-4'
import { KHOI_SC_1 } from './dk-sc-1'
import { KHOI_SC_2 } from './dk-sc-2'
import { KHOI_SC_3 } from './dk-sc-3'
import { KHOI_SC_4 } from './dk-sc-4'
import { KHOI_SC_5 } from './dk-sc-5'
import { KHOI_SC_6 } from './dk-sc-6'
import { KHOI_SC_7 } from './dk-sc-7'
import { KHOI_SC_8 } from './dk-sc-8'
import type { NhomMuc } from './trang'

/** Khối lát 4–6: mỗi task một file `dk-t<N>.ts` (nhiều agent sửa song song không đụng nhau). */
const MOI: Record<string, ComponentType> = {
  ...KHOI_T1, ...KHOI_T2, ...KHOI_T3, ...KHOI_T4, ...KHOI_T5, ...KHOI_T6, ...KHOI_T7, ...KHOI_T8, ...KHOI_T9, ...KHOI_T10, ...KHOI_T11, ...KHOI_T12, ...KHOI_T13,
  ...KHOI_L7_3, ...KHOI_L7_4,
  ...KHOI_SC_1, ...KHOI_SC_2, ...KHOI_SC_3, ...KHOI_SC_4, ...KHOI_SC_5, ...KHOI_SC_6, ...KHOI_SC_7, ...KHOI_SC_8,
}
const m = (ten: string) => k(ten, MOI[ten])

type Khoi = { neo: string; ten: string; Khoi?: ComponentType }
const k = (ten: string, Khoi?: ComponentType): Khoi => ({
  neo: ten.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  ten,
  Khoi,
})

/**
 * Component của /ds theo nhóm của spec §6, theo thứ tự hiện. Mỗi khối một file `_khoi/khoi-<neo>.tsx` export
 * `Khoi<Ten>()` bọc `<section id="<neo>">` (neo = tên viết kebab). Khối chưa dựng: để trống → mục lục hiện chữ mờ
 * "chưa dựng", không có link chết — CEO nhìn một chỗ thấy hết đã làm / chưa làm.
 */
export const NHOM: { ten: string; lat: number; khoi: Khoi[] }[] = [
  {
    ten: 'Nền',
    lat: 1,
    khoi: [k('Button', KhoiButton), k('Badge', KhoiBadge), k('Avatar', KhoiAvatar), k('Kbd', KhoiKbd), k('Alert', KhoiAlert), k('Tooltip', KhoiTooltip), m('HoverCard'), k('Card', KhoiCard), m('Label'), m('Separator'), m('ButtonGroup'), m('Item')],
  },
  {
    ten: 'Overlay',
    lat: 2,
    khoi: [
      k('DropdownMenu', KhoiDropdownMenu),
      k('ContextMenu', KhoiContextMenu),
      m('Menubar'),
      k('Dialog', KhoiDialog),
      k('ConfirmDialog', KhoiConfirmDialog),
      k('Sheet', KhoiSheet),
      m('Drawer'),
    ],
  },
  {
    ten: 'Form',
    lat: 3,
    khoi: [
      k('Input', KhoiInput),
      k('InputAffix', KhoiInputAffix),
      k('Checkbox', KhoiCheckbox),
      k('Radio', KhoiRadio),
      k('Switch', KhoiSwitch),
      m('Slider'),
      k('Select', KhoiSelect),
      m('NativeSelect'),
      k('Combobox', KhoiCombobox),
      m('Calendar'),
      k('DatePicker', KhoiDatePicker),
      m('DateTimePicker'),
      m('InputOTP'),
      k('DateRangePicker', KhoiDateRangePicker),
      k('FileUpload', KhoiFileUpload),
      k('FormLayout', KhoiFormLayout),
    ],
  },
  { ten: 'Điều hướng', lat: 4, khoi: ['Tabs', 'Toggle', 'NavigationMenu', 'Sidebar'].map(m) },
  {
    ten: 'Data view',
    lat: 4,
    khoi: ['Table', 'DataViewToolbar', 'FilterBar', 'Pagination', 'BulkActionBar', 'SavedView', 'ListView', 'KanbanBoard', 'InlineEdit', 'RecordPicker'].map(m),
  },
  { ten: 'Trang chi tiết', lat: 5, khoi: ['Breadcrumb', 'PageHeader', 'PropertyList', 'Timeline', 'Composer', 'Attachment', 'DetailLayout'].map(m) },
  { ten: 'Phản hồi', lat: 5, khoi: ['EmptyState', 'Skeleton', 'Progress', 'Banner', 'Toast'].map(m) },
  { ten: 'Toàn app', lat: 6, khoi: ['Command', 'CommandPalette', 'StatCard'].map(m) },
  { ten: 'Thông báo', lat: 6, khoi: ['Count', 'NotificationCenter', 'NotificationMatrix'].map(m) },
  { ten: 'Bố cục', lat: 8, khoi: ['Accordion', 'Collapsible', 'ScrollArea', 'AspectRatio', 'Resizable'].map(m) },
  { ten: 'Biểu đồ & chat', lat: 8, khoi: ['Chart', 'Carousel', 'Message', 'Bubble', 'Marker'].map(m) },
  { ten: 'Mẫu ghép', lat: 7, khoi: ['MenuThuocTinh'].map(m) },
]
export const KHOI = NHOM.flatMap((n) => n.khoi)
export const SO_DA_DUNG = KHOI.filter((x) => x.Khoi).length

/** NHOM bỏ component (không qua được ranh giới server → client) — cho cột trái. */
export const NHOM_MUC: NhomMuc[] = NHOM.map((n) => ({
  ten: n.ten,
  lat: n.lat,
  muc: n.khoi.map((x) => ({ ten: x.ten, neo: x.neo, daDung: !!x.Khoi })),
}))
