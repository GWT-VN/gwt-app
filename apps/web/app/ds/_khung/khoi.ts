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
import type { NhomMuc } from './trang'

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
    khoi: [k('Button', KhoiButton), k('Badge', KhoiBadge), k('Avatar', KhoiAvatar), k('Kbd', KhoiKbd), k('Alert', KhoiAlert), k('Tooltip', KhoiTooltip), k('Card', KhoiCard)],
  },
  {
    ten: 'Overlay',
    lat: 2,
    khoi: [
      k('DropdownMenu', KhoiDropdownMenu),
      k('ContextMenu', KhoiContextMenu),
      k('Dialog', KhoiDialog),
      k('ConfirmDialog', KhoiConfirmDialog),
      k('Sheet', KhoiSheet),
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
      k('Select', KhoiSelect),
      k('Combobox', KhoiCombobox),
      k('DatePicker', KhoiDatePicker),
      k('DateRangePicker', KhoiDateRangePicker),
      k('FileUpload', KhoiFileUpload),
      k('FormLayout', KhoiFormLayout),
    ],
  },
  { ten: 'Điều hướng', lat: 4, khoi: ['Tabs', 'Sidebar'].map((t) => k(t)) },
  {
    ten: 'Data view',
    lat: 4,
    khoi: ['Table', 'DataViewToolbar', 'FilterBar', 'Pagination', 'BulkActionBar', 'SavedView', 'ListView', 'KanbanBoard', 'InlineEdit', 'RecordPicker'].map((t) => k(t)),
  },
  { ten: 'Trang chi tiết', lat: 5, khoi: ['Breadcrumb', 'PageHeader', 'PropertyList', 'Timeline', 'Composer', 'DetailLayout'].map((t) => k(t)) },
  { ten: 'Phản hồi', lat: 5, khoi: ['EmptyState', 'Skeleton', 'Banner', 'Toast'].map((t) => k(t)) },
  { ten: 'Toàn app', lat: 6, khoi: ['CommandPalette', 'StatCard'].map((t) => k(t)) },
  { ten: 'Thông báo', lat: 6, khoi: ['Count', 'NotificationCenter', 'NotificationMatrix'].map((t) => k(t)) },
]
export const KHOI = NHOM.flatMap((n) => n.khoi)
export const SO_DA_DUNG = KHOI.filter((x) => x.Khoi).length

/** NHOM bỏ component (không qua được ranh giới server → client) — cho cột trái. */
export const NHOM_MUC: NhomMuc[] = NHOM.map((n) => ({
  ten: n.ten,
  lat: n.lat,
  muc: n.khoi.map((x) => ({ ten: x.ten, neo: x.neo, daDung: !!x.Khoi })),
}))
