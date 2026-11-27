'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { duyetYeuCau, duyetNhieuYeuCau, tuChoiYeuCau, type YeuCauThayDoi } from '@/app/actions'
import { hienNgay } from '@/lib/dinh-dang-ngay'

const NHAN_BANG: Record<string, string> = {
  cs_customers: 'Khách',
  customer_contacts: 'SĐT phụ',
  filter_replacement: 'Lịch thay lõi',
  installed_base: 'Máy đã lắp',
}
const NHAN_COT: Record<string, string> = {
  full_name: 'Tên', primary_phone: 'SĐT', address: 'Địa chỉ', province: 'Tỉnh/TP', notes: 'Ghi chú',
  filter_code: 'Mã lõi', replaced_at: 'Ngày thay', note: 'Ghi chú',
  phone: 'SĐT', contact_name: 'Tên', role: 'Vai trò', zalo_ok: 'Zalo',
  customer_id: 'Khách (id)', install_date: 'Ngày lắp', install_address: 'Địa chỉ lắp', serial_moi: 'Serial mới',
}
const NHAN_LOAI: Record<string, string> = { xoa: 'XOÁ', sua: 'SỬA', doi_serial: 'ĐỔI SERIAL', gop: 'GỘP' }

function tomTat(y: YeuCauThayDoi): string {
  if (y.loai === 'xoa') return 'Xoá'
  // Gộp khách: payload chỉ có gop_id (uuid) — hiện UUID thô cho người duyệt là vô nghĩa.
  // ly_do đã là câu tiếng Việt mô tả đúng việc sắp làm (xem moTaGop() ở lib/gopKhach.ts),
  // dùng lại thay vì bịa tóm tắt khác từ payload.
  if (y.loai === 'gop') return y.ly_do || 'Gộp 2 hồ sơ khách trùng thành một.'
  const p = y.payload ?? {}
  return Object.entries(p)
    .filter(([k]) => k !== 'needs_phone' && k !== 'notes')
    .map(([k, v]) => `${NHAN_COT[k] ?? k}: ${v ?? '—'}`).join(' · ')
}

/**
 * Hàng chờ duyệt yêu cầu SỬA/XOÁ (admin). Duyệt -> áp thật; Từ chối -> bỏ. Một khối trong trang /duyet (cùng khách chờ
 * duyệt + yêu cầu xuất) nên chỉ theo kiểu ô Table DS, không thanh công cụ riêng (docs/rework/2026-11-27-dong-bo-bang-khuon-f.md).
 */
export function DuyetList({ items }: { items: YeuCauThayDoi[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  // kind quyết định màu: thành công toàn bộ (emerald), có phần lỗi (amber),
  // thất bại toàn bộ (red) — để người dùng nhận ra kết quả mà không cần đọc số.
  const [msg, setMsg] = useState<{ text: string; kind: 'ok' | 'partial' | 'fail' } | null>(null)
  const [xacNhan, setXacNhan] = useState(false)
  const [chon, setChon] = useState<Set<string>>(new Set())

  // Danh sách items đổi sau mỗi lần duyệt (đơn lẻ hoặc hàng loạt), có thể còn id
  // đã biến mất khỏi `chon` từ trước đó — lọc lại ngay khi render thay vì set
  // state trong effect, để "Chọn tất cả" luôn khớp thực tế và duyệt hàng loạt
  // lần sau không gửi id đã duyệt/không còn tồn tại.
  const chonHopLe = useMemo(() => {
    const idsConLai = new Set(items.map((x) => x.id))
    return new Set([...chon].filter((id) => idsConLai.has(id)))
  }, [chon, items])

  const doiChon = (id: string) => setChon((c) => {
    const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n
  })

  async function lam(id: string, duyet: boolean) {
    setBusy(id); setErr(null); setMsg(null)
    const r = duyet ? await duyetYeuCau(id) : await tuChoiYeuCau(id)
    setBusy(null)
    if (!r.ok) setErr(r.error)
    else router.refresh()
  }

  async function duyetHangLoat() {
    const ids = [...chonHopLe]
    const r = await duyetNhieuYeuCau(ids)
    setErr(null)
    setMsg(null)
    // Không xoá lựa chọn ở đây: duyetNhieuYeuCau chỉ trả số lượng + thông điệp lỗi,
    // không trả id nào lỗi, nên không thể biết chính xác mục nào vẫn còn "cho_duyet".
    // Cứ để nguyên `chon` — mục đã duyệt xong sẽ tự rớt khỏi `items` sau router.refresh(),
    // và chonHopLe (useMemo phía trên) tự lọc theo items mới nên mục lỗi vẫn giữ được chọn
    // để bấm duyệt lại ngay, mục đã xong thì không còn trong danh sách để mà chọn nhầm.
    const kind: 'ok' | 'partial' | 'fail' =
      r.loi.length === 0 ? 'ok' : r.da_duyet === 0 ? 'fail' : 'partial'
    setMsg({ text: `Đã duyệt ${r.da_duyet}/${ids.length} yêu cầu.`, kind })
    if (r.loi.length) setErr(`${r.loi.length} yêu cầu lỗi: ${r.loi.join(' · ')}`)
    router.refresh()
  }

  if (!items.length) return <EmptyState size="sm" capTieuDe={2} tieuDe="Không có yêu cầu sửa/xoá nào chờ duyệt." />
  return (
    <div className="space-y-2">
      {err && <Alert color="danger"><AlertDescription>{err}</AlertDescription></Alert>}
      {msg && (
        <Alert color={msg.kind === 'ok' ? 'success' : msg.kind === 'fail' ? 'danger' : 'warning'}>
          <AlertDescription>{msg.text}</AlertDescription>
        </Alert>
      )}
      {items.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <label className="flex items-center gap-1.5 text-muted-foreground">
            <Checkbox
              checked={chonHopLe.size === items.length}
              onCheckedChange={(checked) => setChon(checked ? new Set(items.map((x) => x.id)) : new Set())} />
            Chọn tất cả ({items.length})
          </label>
          {chonHopLe.size > 0 && (
            <Button size="sm" disabled={busy !== null} onClick={() => setXacNhan(true)}>
              Duyệt {chonHopLe.size} mục đã chọn
            </Button>
          )}
        </div>
      )}
      <TableWrap vien tabIndex={0} role="region" aria-label="Vùng cuộn yêu cầu sửa/xoá">
        <Table variant="thuong" aria-label="Yêu cầu sửa/xoá chờ duyệt">
          <TableHeader>
            <TableRow>
              <TableHead scope="col"><span className="sr-only">Chọn</span></TableHead>
              <TableHead scope="col">Loại</TableHead>
              <TableHead scope="col">Đối tượng</TableHead>
              <TableHead scope="col">Nội dung</TableHead>
              <TableHead scope="col">Người gửi</TableHead>
              <TableHead scope="col">Lúc</TableHead>
              <TableHead scope="col"><span className="sr-only">Thao tác</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((y) => (
              <TableRow key={y.id} chon={chonHopLe.has(y.id)}>
                <TableCell>
                  <Checkbox checked={chonHopLe.has(y.id)} onCheckedChange={() => doiChon(y.id)}
                    aria-label={`Chọn yêu cầu ${NHAN_BANG[y.doi_tuong] ?? y.doi_tuong} của ${y.nguoi_gui ?? 'người gửi không rõ'}`} />
                </TableCell>
                <TableCell>
                  <Badge variant="soft" color={y.loai === 'xoa' || y.loai === 'gop' ? 'danger' : y.loai === 'doi_serial' ? 'warning' : 'info'}>
                    {NHAN_LOAI[y.loai] ?? y.loai}
                  </Badge>
                </TableCell>
                <TableCell>{NHAN_BANG[y.doi_tuong] ?? y.doi_tuong}</TableCell>
                <TableCell className="h-auto min-w-64 whitespace-normal py-2">
                  <div className="break-words">{tomTat(y)}</div>
                  {/* Với gop, ly_do đã hiện làm dòng tóm tắt chính ở trên — không lặp lại nhỏ xám bên dưới. */}
                  {y.ly_do && y.loai !== 'gop' && <div className="text-xs text-muted-foreground">{y.ly_do}</div>}
                </TableCell>
                <TableCell className="text-muted-foreground">{y.nguoi_gui ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{hienNgay(y.created_at, 'gio')}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => lam(y.id, true)} disabled={busy !== null}>
                      {busy === y.id ? '…' : 'Duyệt'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => lam(y.id, false)} disabled={busy !== null}>
                      Từ chối
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrap>
      <ConfirmDialog
        open={xacNhan}
        onOpenChange={setXacNhan}
        tieuDe={`Duyệt ${chonHopLe.size} yêu cầu đã chọn?`}
        moTa="Thao tác này áp thay đổi thật lên dữ liệu."
        nutXacNhan="Duyệt yêu cầu"
        khoaXacNhan={chonHopLe.size === 0}
        onXacNhan={duyetHangLoat}
      />
    </div>
  )
}
