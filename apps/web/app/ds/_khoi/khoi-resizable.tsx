'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { BienThe, KhoiHang } from '../_khung/tam'

const khung = 'h-56 max-w-xl overflow-hidden rounded-(--radius-xl) border border-solid border-(--border)'
const o = 'flex h-full items-center justify-center p-4 text-[14px] leading-5 text-muted-foreground'

/** Demo không PII. Cỡ Panel: CHUỖI = % (API react-resizable-panels 4). `'use client'`: thư viện đo DOM. */
function CacBienThe() {
  return (
    <>
      <BienThe
        ten="Ngang, có tay nắm"
        moTa="Kéo vạch, hoặc Tab tới vạch rồi ← → đổi cỡ, Home / End về nhỏ nhất / lớn nhất. Kiểu danh sách + xem nhanh."
      >
        <ResizablePanelGroup orientation="horizontal" className={khung} data-so="nhom">
          <ResizablePanel defaultSize="60%" minSize="30%">
            <div className={o}>Danh sách ticket</div>
          </ResizablePanel>
          <ResizableHandle withHandle aria-label="Đổi cỡ danh sách và xem nhanh" data-so="vach" />
          <ResizablePanel defaultSize="40%" minSize="25%">
            <div className={o}>Xem nhanh</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </BienThe>
      <BienThe ten="Dọc + lồng" moTa="Vạch không tay nắm (mặc định): chỉ 1px, vùng bấm rộng 4px.">
        <ResizablePanelGroup orientation="horizontal" className={khung}>
          <ResizablePanel defaultSize="35%">
            <div className={o}>Thông tin khách</div>
          </ResizablePanel>
          <ResizableHandle aria-label="Đổi cỡ thông tin và trao đổi" />
          <ResizablePanel defaultSize="65%">
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel defaultSize="70%">
                <div className={o}>Trao đổi</div>
              </ResizablePanel>
              <ResizableHandle aria-label="Đổi cỡ trao đổi và ô soạn" data-so="vach-ngang" />
              <ResizablePanel defaultSize="30%">
                <div className={o}>Ô soạn</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </BienThe>
    </>
  )
}

/** #resizable trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp. */
export function KhoiResizable() {
  return (
    <section id="resizable" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#resizable">Resizable</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #resizable dạng hàng (/ds). */
export function KhoiResizableHang() {
  return (
    <KhoiHang neo="resizable">
      <CacBienThe />
    </KhoiHang>
  )
}
