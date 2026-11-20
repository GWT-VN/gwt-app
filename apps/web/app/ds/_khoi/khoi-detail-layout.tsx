'use client'

import { ArrowCounterClockwise, CalendarBlank, ChatCircleText, Plus, WarningCircle } from '@phosphor-icons/react/ssr'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Composer } from '@/components/ui/composer'
import { DetailHeading, DetailLayout } from '@/components/ui/detail-layout'
import { PageHeader } from '@/components/ui/page-header'
import { PropertyList, PropertyRow } from '@/components/ui/property-list'
import { Timeline, type MucTimeline } from '@/components/ui/timeline'
import { BienThe, KhoiHang } from '../_khung/tam'

/*
 * Demo dùng chung cho `KhoiDetailLayout` (/ds/tron, cổng so khớp) và `KhoiDetailLayoutHang` (/ds) — dữ liệu demo, ngày mẫu
 * cố định 18/11/2026, tên công ty giả. Khối client: Composer cần hàm `onGui`. Giá trị thuộc tính hiện TĨNH (ô sửa tại chỗ
 * InlineEdit ghép sau, như khối PropertyList). `data-so` = khoá so khớp.
 */

const HOM_NAY = '2026-11-18'

const MUC: MucTimeline[] = [
  { id: 'd1', ai: 'Minh', loai: 'tạo ticket từ Zalo', luc: '2026-11-15T09:10:00+07:00', icon: <Plus aria-hidden="true" /> },
  {
    id: 'd2',
    ai: 'Khách',
    loai: 'báo qua Zalo',
    luc: '2026-11-15T09:12:00+07:00',
    icon: <ChatCircleText aria-hidden="true" />,
    noiDung: 'Rò nước dưới đáy máy, đọng vũng nhỏ. Máy vẫn chạy.',
    tep: [{ ten: 'day-may-1.jpg' }, { ten: 'day-may-2.jpg' }],
  },
  {
    id: 'd3',
    ai: 'Minh',
    loai: (
      <>
        đặt ưu tiên{' '}
        <Badge variant="solid" color="danger" title="P1 · lỗi an toàn">
          Gấp
        </Badge>
      </>
    ),
    luc: '2026-11-15T09:40:00+07:00',
    icon: <WarningCircle aria-hidden="true" />,
    color: 'danger',
  },
  { id: 'd4', ai: 'Minh', loai: 'ghi chú', luc: '2026-11-16T14:05:00+07:00', noiDung: 'Gọi hướng dẫn khách tắt van cấp, chụp đáy máy.' },
  { id: 'd5', ai: 'Minh', loai: 'đặt hạn 18/11 10:00', luc: '2026-11-17T08:30:00+07:00', icon: <CalendarBlank aria-hidden="true" /> },
  { id: 'd6', ai: 'Minh', loai: 'ghi chú', luc: '2026-11-17T16:20:00+07:00', noiDung: 'Báo KT trưởng, xếp lịch trong ngày.' },
  {
    id: 'd7',
    ai: 'Khách',
    loai: 'hỏi lại qua Zalo (lần 1)',
    luc: '2026-11-18T08:05:00+07:00',
    icon: <ArrowCounterClockwise aria-hidden="true" />,
    color: 'danger',
    noiDung: 'Bao giờ KT qua vậy em? Nước vẫn rò.',
  },
]

const nguoi = (ten: string) => (
  <span className="inline-flex min-w-0 items-center gap-1.5 border-none border-current">
    <Avatar aria-hidden="true">
      <AvatarFallback>{ten[0]}</AvatarFallback>
    </Avatar>
    <span className="truncate border-none border-current">{ten}</span>
  </span>
)

const CHINH = (
  <section aria-labelledby="ds-ct-hd" className="border-none border-current">
    <DetailHeading data-so="tieu-de" id="ds-ct-hd" className="mb-3">
      Hoạt động
    </DetailHeading>
    <Timeline muc={MUC} hien={6} homNay={HOM_NAY} />
    <Composer onGui={() => {}} />
  </section>
)

const BEN = (
  <>
    <PropertyList tieuDe="Xử lý" data-so="dl-1">
      <PropertyRow nhan="Trạng thái">
        <Badge color="discovery">Mới</Badge>
      </PropertyRow>
      <PropertyRow nhan="Ưu tiên">
        <Badge variant="solid" color="danger" title="P1 · lỗi an toàn">
          Gấp
        </Badge>
      </PropertyRow>
      <PropertyRow nhan="Loại lỗi">
        <Badge variant="outline" title="Loại lỗi: Rò rỉ nước">
          <BadgeDot color="info" />
          Rò rỉ nước
        </Badge>
      </PropertyRow>
      <PropertyRow nhan="Chủ ticket">{nguoi('Minh')}</PropertyRow>
      <PropertyRow nhan="Người đang làm">{nguoi('Minh')}</PropertyRow>
      <PropertyRow nhan="Việc tiếp theo">Báo KT trưởng</PropertyRow>
      <PropertyRow nhan="Hạn">
        <span className="border-none border-current tabular-nums">10:00</span>
      </PropertyRow>
    </PropertyList>
    <PropertyList tieuDe="Khách & máy" data-so="dl-2">
      <PropertyRow nhan="Khách">
        {/* Cột 280: tên dài xuống dòng, không tràn khỏi cột (Button link mặc định không xuống dòng). */}
        <Button asChild variant="link" className="text-left leading-[20px] whitespace-normal">
          <a href="#detail-layout">Demo An Phát</a>
        </Button>
      </PropertyRow>
      <PropertyRow nhan="Máy">CTD50</PropertyRow>
      <PropertyRow nhan="Serial">D50-DEMO-0192</PropertyRow>
      <PropertyRow nhan="Nguồn">Zalo</PropertyRow>
    </PropertyList>
  </>
)

/**
 * #detail-layout — tái tạo ds/nguon/components/DetailLayout/preview.html: cột chính (Hoạt động: Timeline 6 mục mới nhất +
 * Composer) + cột thuộc tính 280 (hai nhóm PropertyList). ≤960 một cột, thuộc tính lên trên.
 */
export function KhoiDetailLayout() {
  return (
    <section id="detail-layout" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#detail-layout">DetailLayout</a>
      </h2>
      <div className="border-none border-current">
        <DetailLayout data-so="luoi" chinh={CHINH} ben={BEN} nhanBen="Thuộc tính ticket" />
      </div>
    </section>
  )
}

const DUONG_DAN = (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="#detail-layout">CSKH</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="#detail-layout">Ticket</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>TK-DEMO-045</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
)

/** #detail-layout dạng hàng cho /ds. */
export function KhoiDetailLayoutHang() {
  return (
    <KhoiHang neo="detail-layout">
      <BienThe
        ten="Trang chi tiết"
        moTa="Trên cùng là tiêu đề trang. Dưới là nội dung chính và cột thuộc tính rộng 280 bên phải, cột thuộc tính đứng yên khi cuộn. Màn hẹp hơn 960: một cột, thuộc tính lên trên, trình đọc màn hình vẫn đọc nội dung trước."
      >
        <div className="flex flex-col gap-6 border-none border-current">
          <PageHeader
            duongDan={DUONG_DAN}
            tieuDe="Rò nước dưới đáy máy — Công ty Demo An Phát"
            meta={['Mở 15/11', 'Zalo']}
            hanhDong={<Button variant="outline">Gọi khách</Button>}
          />
          <DetailLayout chinh={CHINH} ben={BEN} nhanBen="Thuộc tính ticket" />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
