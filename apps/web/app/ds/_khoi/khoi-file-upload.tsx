'use client'

import { useState } from 'react'
import { FileDrop, FileItem, FileList } from '@/components/ui/file-upload'
import { kiemTep } from '@/lib/tep'

const ACCEPT = 'image/*,.pdf,.xlsx,.docx'
const TOI_DA_MB = 10
const GOI_Y = `Ảnh, PDF, Excel, Word · tối đa ${TOI_DA_MB} MB mỗi tệp`

type Dong = { id: number; ten: string; kichThuoc: number; trangThai: 'dang-tai' | 'xong' | 'loi'; tienDo?: number; loi?: string }

/** 3 dòng y preview (tên tệp demo): xong · đang tải 60% · lỗi quá dung lượng. */
const BAN_DAU: Dong[] = [
  { id: 1, ten: 'bien-ban-ban-giao.pdf', kichThuoc: 247_808, trangThai: 'xong' },
  { id: 2, ten: 'anh-hien-truong-01.jpg', kichThuoc: 2_411_725, trangThai: 'dang-tai', tienDo: 60 },
  {
    id: 3,
    ten: 'video-goc-quay-man-hinh.mov',
    kichThuoc: 48 * 1024 * 1024,
    trangThai: 'loi',
    loi: `Quá ${TOI_DA_MB} MB — nén lại hoặc chọn tệp khác`,
  },
]

/**
 * #file-upload — tái tạo ds/nguon/components/FileUpload/preview.html: khung rộng tối đa 640; vùng thả + danh sách 3
 * dòng (cột gap 8); cách 16 là vùng thả tắt. Chọn/thả tệp thật → thêm dòng (kiemTep báo lỗi ngay trên dòng; không tải
 * thật nên tệp hợp lệ hiện "đã tải lên"). Kéo tệp vào vùng để thấy trạng thái thả. Đo: ds/so-khop/fileupload.json.
 */
export function KhoiFileUpload() {
  const [ds, setDs] = useState(BAN_DAU)
  const them = (tep: File[]) =>
    setDs((cu) => [
      ...cu,
      ...tep.map((t, i): Dong => {
        const loi = kiemTep(t, { accept: ACCEPT, toiDaMB: TOI_DA_MB }) ?? undefined
        return { id: Date.now() + i, ten: t.name, kichThuoc: t.size, trangThai: loi ? 'loi' : 'xong', loi }
      }),
    ])
  return (
    <section id="file-upload" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#file-upload">FileUpload</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="max-w-160 border-none border-current">
        <div className="flex flex-col gap-2 border-none border-current">
          <FileDrop id="ds-tep" accept={ACCEPT} onChonTep={them} goiY={GOI_Y} />
          {ds.length > 0 && (
            <FileList>
              {ds.map((d) => (
                <FileItem
                  key={d.id}
                  ten={d.ten}
                  kichThuoc={d.kichThuoc}
                  trangThai={d.trangThai}
                  tienDo={d.tienDo}
                  loi={d.loi}
                  onBo={() => setDs((cu) => cu.filter((x) => x.id !== d.id))}
                />
              ))}
            </FileList>
          )}
        </div>
        <div className="mt-4 border-none border-current">
          <div className="flex flex-col gap-2 border-none border-current">
            <FileDrop id="ds-tep-tat" accept={ACCEPT} onChonTep={() => {}} goiY={GOI_Y} disabled />
          </div>
        </div>
      </div>
    </section>
  )
}
