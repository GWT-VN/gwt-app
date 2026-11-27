'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

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
          <b>{ds.length}</b> chỗ ma trận nói khác luật cũ. Nhãn <b>CHẶN</b> (đỏ) = ma trận sẽ chặn việc mà hôm nay họ vẫn
          làm được; nhãn <b>cho làm</b> (hổ phách) = ma trận sẽ <b>MỞ</b> thêm việc mới.
        </p>
        <Button variant="outline" size="sm" className="shrink-0"
          type="button"
          disabled={dangChay}
          onClick={() => batDau(async () => { await xoaLech() })}
        >
          Xoá nhật ký, đo lại
        </Button>
      </div>

      <TableWrap vien tabIndex={0} role="region" aria-label="Vùng cuộn nhật ký lệch quyền">
        <Table variant="thuong" aria-label="Nhật ký lệch quyền">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Người</TableHead>
              <TableHead scope="col">Việc</TableHead>
              <TableHead scope="col">Hôm nay</TableHead>
              <TableHead scope="col">Ma trận nói</TableHead>
              <TableHead scope="col" phai>Số lần</TableHead>
              <TableHead scope="col">Gần nhất</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ds.map((d, i) => {
              const seChan = d.luat_cu && !d.ma_tran
              return (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{d.email ?? '—'}</TableCell>
                  <TableCell className="h-auto py-2">
                    {laMaQuyenHopLe(d.ma_quyen) ? HO_SO_QUYEN[d.ma_quyen].nhan : d.ma_quyen}
                    <div className="font-mono text-xs text-muted-foreground">{d.ma_quyen}</div>
                  </TableCell>
                  <TableCell>{d.luat_cu ? 'làm được' : 'bị chặn'}</TableCell>
                  <TableCell>
                    <Badge variant="soft" color={seChan ? 'danger' : 'warning'}>{d.ma_tran ? 'cho làm' : 'CHẶN'}</Badge>
                  </TableCell>
                  <TableCell phai className="tabular-nums">{d.so_lan}</TableCell>
                  <TableCell className="text-muted-foreground">{hienNgay(d.lan_cuoi, 'gio')}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableWrap>
    </div>
  )
}
