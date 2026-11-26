'use client'

// PROTOTYPE vứt đi — /ticket?variant=A–F: 6 phương án danh sách ticket dựng từ DS v2 + thanh đổi phương án.
import { ThanhPhuongAn } from '@/app/prototype/_chung/ThanhPhuongAn'
import { ManV2 } from '@/components/khung/ManV2'
import { PHUONG_AN, type DuLieuTicket } from './chung'
import { TicketA } from './ds-a'
import { TicketB } from './ds-b'
import { TicketC } from './ds-c'
import { TicketD } from './ds-d'
import { TicketE } from './ds-e'
import { TicketF } from './ds-f'
import { TicketT } from './ds-t'

const PA = { A: TicketA, B: TicketB, C: TicketC, D: TicketD, E: TicketE, F: TicketF, T: TicketT }

export function TrangTicketPrototype({ variant, ...du }: DuLieuTicket & { variant: string }) {
  const C = PA[variant as keyof typeof PA] ?? TicketA
  return (
    <ManV2>
      <C {...du} />
      <ThanhPhuongAn ds={PHUONG_AN} hienTai={variant} />
    </ManV2>
  )
}
