import Link from 'next/link'
import { Suspense } from 'react'
import { listToFix, khoaTatCaKhach } from '@/app/actions'
import { OTimKiem } from '@/bang'
import { ThanhDangLoc } from '@/bang'
import { PhanTrang } from '@/bang'
import { TieuDeCotSapXep } from '@/bang'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { KhungChon, OChonTatCa, OChonDong, ThanhDaChon } from '@/bang'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { CauHinhBangDs } from '@/components/ui/bang-ds'

export default async function ToFixPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; trang?: string; cot?: string; chieu?: string }>
}) {
  const { q = '', trang: trangRaw, cot, chieu } = await searchParams
  const trang = Math.max(1, Number(trangRaw) || 1)
  const [{ rows: list, tong, soTrang, sapXep }, quyen] = await Promise.all([
    listToFix(q, { trang, cot, chieu }),
    hoiQuyen({ hangLoat: ['cs.hang_loat.cap_nhat', 'QUANLY'] }),
  ])
  const choHangLoat = quyen.hangLoat
  // Chỉ tính trên trang hiện tại — tong ở trên là tổng số khách cần dọn thật.
  const thieuSdt = list.filter((c) => c.needs_phone)
  const thieuDiaChi = list.filter((c) => !c.address)

  return (
    <ManV2>
      <TrangDuLieu className="max-w-4xl">
        <CauHinhBangDs>
          <div className="min-w-0 space-y-4">
            {/* KHÔNG có link lui: đây là trang danh sách cấp một, có mặt trong menu —
                không phải trang con của "Máy đã lắp". Nút lui chỉ dành cho trang chi tiết. */}
            <PageHeader tieuDe="Khách cần dọn dữ liệu" />

            <Suspense>
              <OTimKiem placeholder="Gõ tên khách, SĐT…" />
            </Suspense>

            <ThanhDangLoc
              dieuKien={q ? [{ nhan: 'Từ khoá', giaTri: q }] : []}
              hienThi={list.length}
              tong={tong}
              nhan="khách cần dọn"
              sapXep={sapXep}
            />

            <p className="text-sm text-muted-foreground">
              Trên trang này: {thieuSdt.length} thiếu/lỗi SĐT · {thieuDiaChi.length} thiếu địa chỉ.
              Di trú từ Odoo không lấp được — phải sửa tay. Bấm tên khách để sửa.
            </p>

            <KhungChon
              khoaTrang={list.map((c) => c.id)}
              tong={tong}
              bat={choHangLoat}
              thamSo={{ q, cot, chieu }}
              layTatCaKhoa={khoaTatCaKhach}
            >
            <ThanhDaChon nhan="khách" />
            <div className="bg-card rounded-(--radius-xl) border overflow-x-auto">
              <Table>
                <Suspense>
                  <TableHeader>
                    <TableRow>
                      <OChonTatCa nhan="khách" />
                      <TieuDeCotSapXep cot="full_name" nhan="Khách" chieuMacDinh="asc" dangMacDinh />
                      <TableHead className="text-left px-4 py-3 font-medium">Máy</TableHead>
                      <TableHead className="text-left px-4 py-3 font-medium">SĐT</TableHead>
                      <TableHead className="text-left px-4 py-3 font-medium">Địa chỉ</TableHead>
                    </TableRow>
                  </TableHeader>
                </Suspense>
                <TableBody>
                  {list.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted align-top">
                      <OChonDong khoa={c.id} moTa={`khách ${c.full_name}`} />
                      <TableCell className="px-4 py-3">
                        <Link href={`/khach/${c.id}`} prefetch={false} className="text-foreground underline font-medium">
                          {c.full_name}
                        </Link>
                        {c.notes && <p className="text-xs text-(--color-text-warning) mt-0.5 max-w-md">{c.notes}</p>}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">{c.machines}</TableCell>
                      <TableCell className="px-4 py-3">
                        {c.needs_phone ? (
                          c.primary_phone ? (
                            <span className="tabular-nums text-xs text-(--color-text-warning)">{c.primary_phone} ⚠️</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-(--color-background-danger-surface) text-(--color-text-danger)">thiếu</span>
                          )
                        ) : (
                          <span className="tabular-nums text-xs text-muted-foreground">{c.primary_phone}</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {c.address ? (
                          <span className="text-muted-foreground text-xs">{c.address.slice(0, 45)}…</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-(--color-background-warning-surface) text-(--color-text-warning)">thiếu</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {list.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={choHangLoat ? 5 : 4} className="px-4 py-10 text-center text-muted-foreground">
                        Không còn gì để dọn. 🎉
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            </KhungChon>

            <Suspense>
              <PhanTrang trang={trang} soTrang={soTrang} />
            </Suspense>
          </div>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
