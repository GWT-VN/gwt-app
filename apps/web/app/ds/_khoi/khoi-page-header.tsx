'use client'

import { useState } from 'react'
import { CaretDown, Copy, DotsThree, GitMerge, Phone, XCircle } from '@phosphor-icons/react/ssr'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader, type ChuyenBanGhi } from '@/components/ui/page-header'
import { Tooltip } from '@/components/ui/tooltip'
import { BienThe, KhoiHang } from '../_khung/tam'

/* Demo dùng chung cho `KhoiPageHeader` (/ds/tron) và `KhoiPageHeaderHang` (/ds) — dữ liệu demo, tên công ty giả. */

const MA = ['TK-2611-041', 'TK-2611-042', 'TK-2611-043', 'TK-2611-044', 'TK-2611-045']

const duongDan = (ma: string) => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="#page-header">CSKH</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="#page-header">Ticket</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage data-so="ma">{ma}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
)

const HANH_DONG = (
  <>
    <Button data-so="goi" variant="outline">
      <Phone aria-hidden="true" />
      Gọi khách
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button data-so="doi">
          Đổi trạng thái
          <CaretDown aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Mới</DropdownMenuItem>
        <DropdownMenuItem>Đang xử lý</DropdownMenuItem>
        <DropdownMenuItem>Chờ khách</DropdownMenuItem>
        <DropdownMenuItem>Đã xong</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu>
      <Tooltip content="Sao chép link, gộp, huỷ">
        <DropdownMenuTrigger asChild>
          <Button data-so="khac" variant="ghost" size="icon" aria-label="Thao tác khác">
            <DotsThree weight="bold" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Copy aria-hidden="true" />
          Sao chép link
        </DropdownMenuItem>
        <DropdownMenuItem>
          <GitMerge aria-hidden="true" />
          Gộp vào ticket khác…
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <XCircle aria-hidden="true" />
          Huỷ ticket…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </>
)

const TEN_DAI = 'Công ty Demo An Phát — chi nhánh Bình Dương, xưởng số 3, dây chuyền lọc nước tinh khiết RO công suất lớn'
const META = ['CTD50', 'chưa có serial', 'mở hôm nay', 'cập nhật 5 phút trước']

function DauTrang({ tieuDe, ma, chuyen }: { tieuDe: string; ma: string; chuyen: ChuyenBanGhi }) {
  return <PageHeader duongDan={duongDan(ma)} tieuDe={tieuDe} meta={META} hanhDong={HANH_DONG} chuyen={chuyen} />
}

/** ‹ › đi trên danh sách demo 5 ticket (đầu/cuối thì nút tắt). */
function ChuyenDemo({ batDau }: { batDau: number }) {
  const [i, setI] = useState(batDau)
  return (
    <DauTrang
      tieuDe={`Công ty Demo An Phát — ticket ${MA[i]}`}
      ma={MA[i]}
      chuyen={{ loai: 'Ticket', viTri: i + 1, tong: MA.length, onTruoc: () => setI(i - 1), onSau: () => setI(i + 1) }}
    />
  )
}

/**
 * #page-header — tái tạo ds/nguon/components/PageHeader/preview.html (khung rộng tối đa 1000): đường dẫn + "1 / 1" (hai
 * nút ‹ › tắt) / tiêu đề dài cắt 2 dòng + meta + Gọi khách · Đổi trạng thái ▾ · ⋯.
 */
export function KhoiPageHeader() {
  return (
    <section id="page-header" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#page-header">PageHeader</a>
      </h2>
      <div className="max-w-[1000px] border-none border-current">
        <DauTrang tieuDe={TEN_DAI} ma="TK-2611-045" chuyen={{ loai: 'Ticket', viTri: 1, tong: 1, onTruoc() {}, onSau() {} }} />
      </div>
    </section>
  )
}

/** #page-header dạng hàng cho /ds. */
export function KhoiPageHeaderHang() {
  return (
    <KhoiHang neo="page-header">
      <BienThe
        ten="Đầy đủ"
        moTa="Đường dẫn, vị trí trong danh sách, tiêu đề, dòng thông tin phụ, tối đa hai nút chữ và nút ⋯. Bấm ‹ › để chuyển ticket."
      >
        <ChuyenDemo batDau={2} />
      </BienThe>
      <BienThe ten="Đầu danh sách" moTa="Ticket đầu tiên: nút ‹ tắt. Ticket cuối thì nút › tắt.">
        <ChuyenDemo batDau={0} />
      </BienThe>
      <BienThe ten="Tiêu đề dài" moTa="Tối đa hai dòng rồi cắt bằng dấu ba chấm. Dòng thông tin phụ xuống dòng không để dấu chấm ngăn ở đầu dòng.">
        <div className="max-w-[640px] border-none border-current">
          <DauTrang tieuDe={TEN_DAI} ma="TK-2611-045" chuyen={{ loai: 'Ticket', viTri: 1, tong: 1, onTruoc() {}, onSau() {} }} />
        </div>
      </BienThe>
      <BienThe ten="Chỉ tiêu đề" moTa="Trang không mở từ danh sách: không có đường dẫn, không có nút chuyển.">
        <PageHeader tieuDe="Phiếu chi demo PC-2611-007" meta={['Kế toán', 'tạo hôm nay']} />
      </BienThe>
    </KhoiHang>
  )
}
