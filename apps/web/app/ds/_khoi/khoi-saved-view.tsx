'use client'

import { usePathname } from 'next/navigation'
import { hrefBoLoc, ThanhDangLoc } from '@/bang'
import { CauHinhBangDs } from '@/components/ui/bang-ds'
import { SavedView } from '@/components/ui/saved-view'
import { BienThe, KhoiHang } from '../_khung/tam'
import { Nhan, NGHIA, TEN_COT } from './khoi-filter-bar'

/** FilterBar thật của bang/ (giao diện DS) với SavedView cắm vào khe `phai` — y màn ticket demo "Loại lỗi: Rò rỉ nước". */
function Mau() {
  const path = usePathname()
  return (
    <CauHinhBangDs tenCot={TEN_COT} nghiaSapXep={NGHIA}>
      <ThanhDangLoc
        dieuKien={[{ nhan: 'Loại lỗi', giaTri: 'Rò rỉ nước', href: hrefBoLoc(path, { loai: 'ro-ri' }, 'loai') }]}
        hienThi={5}
        tong={5}
        nhan="ticket"
        phai={
          <SavedView
            dieuKien={[{ nhan: 'Loại lỗi', giaTri: 'Rò rỉ nước' }]}
            query="loai=ro-ri"
            khu="CSKH"
            // Demo: không lưu đâu cả (bảng saved_views chưa có) — toast do SavedView tự báo.
            onLuu={() => {}}
          />
        }
      />
    </CauHinhBangDs>
  )
}

/**
 * #saved-view — tái tạo ds/nguon/components/SavedView/preview.html. Preview vẽ popover tĩnh; ở đây bấm "Lưu bộ lọc"
 * trên FilterBar thật để mở (cổng so khớp mở bằng `buoc`).
 */
export function KhoiSavedView() {
  return (
    <section id="saved-view" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#saved-view">SavedView</a>
      </h2>
      <div className="max-w-[1100px] border-none border-current">
        <Nhan>Bấm &quot;Lưu bộ lọc&quot; trên FilterBar → popover (Menu + Field + Checkbox)</Nhan>
        <Mau />
      </div>
    </section>
  )
}

/** #saved-view dạng hàng (/ds). */
export function KhoiSavedViewHang() {
  return (
    <KhoiHang neo="saved-view">
      <BienThe
        ten="Trên thanh lọc"
        moTa="Bấm Lưu bộ lọc: tên bắt buộc (tối đa 40 ký tự), chọn chia sẻ cho cả khu. Enter để lưu; lưu xong báo ở đáy màn. Bấm Lưu khi ô tên trống → câu nhắc đỏ dưới ô, con trỏ về lại ô tên."
      >
        <Mau />
      </BienThe>
    </KhoiHang>
  )
}
