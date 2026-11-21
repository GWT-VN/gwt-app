import { ArrowsClockwise, UserPlus } from '@phosphor-icons/react/ssr'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { BienThe, KhoiHang } from '../_khung/tam'

function CacBienThe() {
  return (
    <>
      <BienThe ten="Tách ngày" moTa="variant separator: chữ giữa hai vạch màu border — mốc ngày giữa luồng tin.">
        <div className="max-w-lg">
          <Marker variant="separator" data-so="separator">
            <MarkerContent>Hôm nay</MarkerContent>
          </Marker>
        </div>
      </BienThe>
      <BienThe ten="Sự kiện" moTa="variant default: icon 16 + chữ 14 muted. Link trong mốc gạch chân, rê → foreground.">
        <div className="flex max-w-lg flex-col gap-3">
          <Marker data-so="default">
            <MarkerIcon>
              <UserPlus />
            </MarkerIcon>
            <MarkerContent>Chị Lan (demo) đã được thêm vào hội thoại</MarkerContent>
          </Marker>
          <Marker>
            <MarkerIcon>
              <ArrowsClockwise />
            </MarkerIcon>
            <MarkerContent>
              Ticket chuyển sang <a href="#marker">Đang xử lý</a>
            </MarkerContent>
          </Marker>
        </div>
      </BienThe>
      <BienThe ten="Gạch chân" moTa="variant border: gạch dưới màu border, đệm dưới 8 — đầu một nhóm tin.">
        <div className="max-w-lg">
          <Marker variant="border" data-so="border">
            <MarkerContent>Tin chưa đọc</MarkerContent>
          </Marker>
        </div>
      </BienThe>
    </>
  )
}

/** #marker trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp. */
export function KhoiMarker() {
  return (
    <section id="marker" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#marker">Marker</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #marker dạng hàng (/ds). */
export function KhoiMarkerHang() {
  return (
    <KhoiHang neo="marker">
      <CacBienThe />
    </KhoiHang>
  )
}
