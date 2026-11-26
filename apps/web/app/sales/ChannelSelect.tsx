'use client'

import type { MucChon } from '@/bang'
import { Combobox } from '@/components/ui/combobox'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

export function ChannelSelect({
  id, label, value, emptyLabel, options, onChange,
}: {
  id?: string
  label?: string
  value: string
  emptyLabel: string
  options: MucChon[]
  onChange: (value: string) => void
}) {
  if (options.length > 10) {
    return (
      <Combobox id={id} aria-label={label} value={value || null} options={options}
        placeholder={emptyLabel} onValueChange={(next) => onChange(next ?? '')} />
    )
  }

  return (
    <NativeSelect id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <NativeSelectOption value="">{emptyLabel}</NativeSelectOption>
      {options.map(({ gt, nhan }) => <NativeSelectOption key={gt} value={gt}>{nhan}</NativeSelectOption>)}
    </NativeSelect>
  )
}
