// Ticket chưa có serial (17/11, chị Trang): khách báo lỗi trước, thợ qua kiểm tra mới có serial.
// Vẫn bắt buộc khách; serial bổ sung sau ở "Sửa dòng" máy & lỗi.

/** Lỗi đầu vào khi tạo ticket (null = hợp lệ). KHÔNG còn bắt buộc serial. */
export function kiemTaoTicket(i: { customer_id?: string; ticket_type?: string; description?: string; state?: string }): string | null {
  if (!i.customer_id?.trim()) return 'Bắt buộc chọn khách.'
  if (!i.ticket_type?.trim()) return 'Chọn loại ticket.'
  if (!i.description?.trim()) return 'Nhập mô tả sự cố.'
  if (i.state && !['Open', 'Done', 'Cancel'].includes(i.state)) return 'Trạng thái không hợp lệ.'
  return null
}

type Sr = { serial: string | null; source_serial: string | null }

/**
 * Khi CS điền serial cho một dòng máy: nếu ticket CHƯA có serial nào thì ghi luôn lên ticket
 * (để khối Máy / Bảo hành / trang máy hiện đúng). Ticket đã có serial → null (không đụng).
 */
export function serialBoSungChoTicket(ticket: Sr, dong: Sr): Sr | null {
  const daCo = Boolean(ticket.serial || ticket.source_serial?.trim())
  const moi = dong.serial || dong.source_serial?.trim()
  if (daCo || !moi) return null
  return { serial: dong.serial, source_serial: dong.serial ?? dong.source_serial }
}
