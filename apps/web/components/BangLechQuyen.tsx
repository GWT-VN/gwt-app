'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { useTransition } from 'react'
import { xoaLech, type DongLech } from '@/lib/nen-tang/ma-tran'
import { HO_SO_QUYEN, laMaQuyenHopLe } from '@/lib/nen-tang/quyen'
import { hienNgay } from '@/lib/dinh-dang-ngay'

export function BangLechQuyen({ ds }: { ds: DongLech[] }) {
  const [dangChay, batDau] = useTransition()

  if (ds.length === 0) {
    return (
      <Alert color="success">
        <AlertTitle>Chưa ghi nhận lệch nào.</AlertTitle>
        <AlertDescription>
          Nghĩa là mọi thao tác có người dùng thật đi qua từ lúc đo tới giờ, ma trận đều
          nói giống luật cũ. Bảng này chỉ có nghĩa khi <b>đã có người dùng app một thời gian</b> —
          trống ngay sau khi bật thì chỉ là chưa ai chạm tới, không phải đã an toàn.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <b>{ds.length}</b> chỗ ma trận nói khác luật cũ. Hàng <span className="text-(--color-text-danger)">đỏ</span> = ma
          trận sẽ <b>CHẶN</b> việc mà hôm nay họ vẫn làm được; hàng <span className="text-(--color-text-warning)">hổ phách</span> =
          ma trận sẽ <b>MỞ</b> thêm việc mới.
        </p>
        <Button variant="outline" size="sm" className="shrink-0"
          type="button"
          disabled={dangChay}
          onClick={() => batDau(async () => { await xoaLech() })}
        >
          Xoá nhật ký, đo lại
        </Button>
      </div>

      <TableWrap vien tabIndex={0} aria-label="Nhật ký lệch quyền">
        <Table variant="thuong" aria-label="Nhật ký lệch quyền">
          <TableHeader className="bg-muted/70 text-muted-foreground">
            <TableRow>
              <TableHead className="text-left px-3 py-2 font-medium">Người</TableHead>
              <TableHead className="text-left px-3 py-2 font-medium">Việc</TableHead>
              <TableHead className="text-left px-3 py-2 font-medium">Hôm nay</TableHead>
              <TableHead className="text-left px-3 py-2 font-medium">Ma trận nói</TableHead>
              <TableHead phai>Số lần</TableHead>
              <TableHead className="text-left px-3 py-2 font-medium">Gần nhất</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {ds.map((d, i) => {
              const seChan = d.luat_cu && !d.ma_tran
              return (
                <TableRow key={i} className={seChan ? '[&>td]:bg-(--color-background-danger-surface)' : '[&>td]:bg-(--color-background-warning-surface)'}>
                  <TableCell className="px-3 py-2 font-mono text-xs">{d.email ?? '—'}</TableCell>
                  <TableCell className="px-3 py-2">
                    {laMaQuyenHopLe(d.ma_quyen) ? HO_SO_QUYEN[d.ma_quyen].nhan : d.ma_quyen}
                    <div className="text-[10px] font-mono text-muted-foreground">{d.ma_quyen}</div>
                  </TableCell>
                  <TableCell className="px-3 py-2">{d.luat_cu ? 'làm được' : 'bị chặn'}</TableCell>
                  <TableCell className={`px-3 py-2 font-medium ${seChan ? 'text-(--color-text-danger)' : 'text-(--color-text-warning)'}`}>
                    {d.ma_tran ? 'cho làm' : 'CHẶN'}
                  </TableCell>
                  <TableCell phai className="tabular-nums">{d.so_lan}</TableCell>
                  <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                    {hienNgay(d.lan_cuoi, 'gio')}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableWrap>
    </div>
  )
}
