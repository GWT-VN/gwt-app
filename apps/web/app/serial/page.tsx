import Link from 'next/link'
import { hoiQuyen } from '@/lib/nen-tang/kiem-quyen'
import { Suspense } from 'react'
import { searchSerialsTrang, listSerialPending, khoaTatCaSerial, catalogChon, dsTrangThai, type SerialRow, type CatalogChon, type SerialPending } from '@/app/actions'
import type { KetQuaTrang } from '@/bang'
import { PhanTrang } from '@/bang'
import { SerialTao } from '@/components/SerialTao'
import { SerialPendingList } from '@/components/SerialPendingList'
import { NhapKhoSerial } from '@/components/NhapKhoSerial'
import { DoiTrangThaiKho } from '@/components/DoiTrangThaiKho'
import { TrangThaiCauHinh } from '@/components/TrangThaiCauHinh'
import { KhungChon, OChonTatCa, OChonDong, ThanhDaChon } from '@/bang'
import { hienNgay } from '@/lib/dinh-dang-ngay'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { FormLayout } from '@/components/ui/form-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ManV2 } from '@/components/khung/ManV2'
import { TrangDuLieu } from '@/components/ui/data-view-toolbar'
import { PageHeader } from '@/components/ui/page-header'
import { CauHinhBangDs } from '@/components/ui/bang-ds'


export default async function SerialPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string; trang?: string; tt?: string }>
}) {
  const { q = '', tab = '', trang: trangRaw, tt = '' } = await searchParams
  const trang = Math.max(1, Number(trangRaw) || 1)
  const laCho = tab === 'cho'
  const laNhap = tab === 'nhap'
  const laCauHinh = tab === 'cauhinh'
  // Hỏi quyền TRƯỚC. listSerialPending() tự gác bằng cs.serial.duyet và ĐÁ VỀ
  // TRANG CHỦ nếu thiếu — gọi vô điều kiện là nhân viên thường mở /serial liền bị
  // văng, dù bảng kho serial vốn cho họ xem.
  const quyen = await hoiQuyen({
    kho: ['cs.serial.kho', 'QUANLY'],
    trangThai: ['cs.may.trang_thai', 'QUANLY'],
    duyet: ['cs.serial.duyet', 'QUANLY'],
    hangLoat: ['cs.hang_loat.cap_nhat', 'QUANLY'],
  })
  const [{ rows, tong, soTrang }, pending, catalog, dsTT] = await Promise.all([
    laCho || laNhap || laCauHinh
      ? Promise.resolve<KetQuaTrang<SerialRow>>({
          rows: [], tong: 0, trang: 1, soTrang: 1,
          sapXep: { cot: 'serial', tang: true, macDinh: true },
        })
      : searchSerialsTrang(q, { trang }, tt),
    quyen.duyet ? listSerialPending('cho_duyet') : Promise.resolve<SerialPending[]>([]),
    laNhap ? catalogChon() : Promise.resolve<CatalogChon[]>([]),
    dsTrangThai(),
  ])
  const nhanTT = (code: string) => dsTT.find((t) => t.code === code)?.nhan ?? code

  return (
    <ManV2>
      <TrangDuLieu>
        <CauHinhBangDs>
          <div className="min-w-0 space-y-4">
            <PageHeader tieuDe="Kho serial" meta={["Serial trong kho, đã xuất và chờ nhập"]} />

            <div className="flex gap-2 flex-wrap">
              <Link href="/serial"
                className={`px-3 py-1.5 rounded-lg text-sm border ${!laCho && !laNhap ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground'}`}>
                Kho serial
              </Link>
              {quyen.kho && (
                <Link href="/serial?tab=nhap"
                  className={`px-3 py-1.5 rounded-lg text-sm border ${laNhap ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground'}`}>
                  + Nhập kho
                </Link>
              )}
              <Link href="/serial?tab=cho"
                className={`px-3 py-1.5 rounded-lg text-sm border ${laCho ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-(--color-text-warning) border-(--color-border-warning-surface)'}`}>
                Chờ duyệt{quyen.duyet ? ` (${pending.length})` : ''}
              </Link>
              {quyen.trangThai && (
                <Link href="/serial?tab=cauhinh"
                  className={`px-3 py-1.5 rounded-lg text-sm border ${laCauHinh ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground'}`}>
                  Cấu hình trạng thái
                </Link>
              )}
            </div>

            {laCauHinh ? (
              quyen.trangThai ? <TrangThaiCauHinh ds={dsTT} /> : <p className="text-sm text-(--color-text-warning)">Bạn không có quyền cấu hình trạng thái máy.</p>
            ) : laNhap ? (
              <section className="space-y-3">
                {quyen.kho ? (
                  <NhapKhoSerial catalog={catalog} />
                ) : (
                  <p className="text-sm text-(--color-text-warning)">Bạn không có quyền nhập kho trực tiếp. Bạn có thể “Tạo serial mới (chờ duyệt)”.</p>
                )}
              </section>
            ) : laCho ? (
              <section className="space-y-3">
                {/*
                  createSerialPending() phía sau nút này đòi cs.serial.kho. Hiện nó cho
                  người không có quyền là mời họ bấm vào một thứ chắc chắn hỏng.
                  ⚠️ Đáng để CEO xem lại: luồng "tạo serial chờ duyệt" sinh ra CHO nhân
                  viên thường xin, mà ma trận đang để nó ở mức Trưởng CSKH.
                */}
                {quyen.kho && <SerialTao />}
                <SerialPendingList items={pending} choDuyet={quyen.duyet} />
              </section>
            ) : (
              <>
                <FormLayout className="flex gap-2">
                  <Input name="q" defaultValue={q}
                    placeholder="Gõ serial, mã nội bộ, model, mã quốc tế…"
                    className="flex-1 rounded-lg border px-4 py-2.5 text-foreground bg-card" />
                  {tt && <input type="hidden" name="tt" value={tt} />}
                  <Button type="submit">Tìm</Button>
                </FormLayout>
                <div className="flex gap-1.5 flex-wrap">
                  <Link href={`/serial${q ? `?${new URLSearchParams({ q })}` : ''}`}
                    className={`px-2.5 py-1 rounded-lg text-xs border ${!tt ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground'}`}>
                    Tất cả
                  </Link>
                  {dsTT.map((t) => (
                    <Link key={t.code} href={`/serial?${new URLSearchParams({ ...(q && { q }), tt: t.code })}`}
                      className={`px-2.5 py-1 rounded-lg text-xs border ${tt === t.code ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground'}`}>
                      {t.nhan}
                    </Link>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {rows.length < tong ? `Hiện ${rows.length} trên ${tong} serial` : `${tong} serial`}
                  {tt && <span className="text-muted-foreground"> · lọc: {nhanTT(tt)}</span>}
                </p>
                <KhungChon
                  khoaTrang={rows.map((s) => s.serial)}
                  tong={tong}
                  bat={quyen.hangLoat}
                  thamSo={{ q, ...(tt && { tt }) }}
                  layTatCaKhoa={khoaTatCaSerial}
                >
                <ThanhDaChon nhan="serial" />
                <div className="bg-card rounded-(--radius-xl) border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <OChonTatCa nhan="serial" />
                        <TableHead className="text-left px-4 py-3 font-medium">Serial</TableHead>
                        <TableHead className="text-left px-4 py-3 font-medium">Mã nội bộ</TableHead>
                        <TableHead className="text-left px-4 py-3 font-medium">Model</TableHead>
                        <TableHead className="text-left px-4 py-3 font-medium">Trạng thái</TableHead>
                        <TableHead className="text-left px-4 py-3 font-medium">Tên nội bộ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((s) => (
                        <TableRow key={s.serial} className="hover:bg-muted">
                          <OChonDong khoa={s.serial} moTa={`serial ${s.serial}`} />
                          <TableCell className="px-4 py-2.5 tabular-nums text-xs">
                            <Link href={`/may/${encodeURIComponent(s.serial)}`} prefetch={false} className="text-foreground hover:underline">{s.serial}</Link>
                            <Link href={`/may/${encodeURIComponent(s.serial)}`} prefetch={false}
                              className="ml-2 font-sans text-[11px] text-(--color-text-info) hover:underline whitespace-nowrap">Lịch sử ↗</Link>
                          </TableCell>
                          <TableCell className="px-4 py-2.5 tabular-nums text-xs text-foreground">{s.internal_code ?? '—'}</TableCell>
                          <TableCell className="px-4 py-2.5 text-foreground">{s.model ?? '—'}</TableCell>
                          <TableCell className="px-4 py-2.5">
                            <DoiTrangThaiKho serial={s.serial} trangThai={s.trang_thai} choDoiTrangThai={quyen.kho} ds={dsTT} />
                            {(s.trang_thai_luc || s.trang_thai_ghi_chu) && (
                              <div className="text-[11px] text-muted-foreground mt-1">
                                {s.trang_thai_ghi_chu && <span>📍 {s.trang_thai_ghi_chu}</span>}
                                {s.trang_thai_luc && <span className="text-muted-foreground">{s.trang_thai_ghi_chu ? ' · ' : ''}{hienNgay(s.trang_thai_luc)}</span>}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-2.5 text-muted-foreground">{s.ten_noi_bo ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                      {rows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={quyen.hangLoat ? 6 : 5} className="px-4 py-10 text-center text-muted-foreground">
                            Không tìm thấy serial nào.
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
              </>
            )}
          </div>
        </CauHinhBangDs>
      </TrangDuLieu>
    </ManV2>
  )
}
