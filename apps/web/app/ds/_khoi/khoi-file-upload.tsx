'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { FileDrop, FileItem, FileList } from '@/components/ui/file-upload'
import { kiemTep } from '@/lib/tep'
import { BienThe, KhoiHang } from '../_khung/tam'

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

/** Đọc tệp chọn/thả → dòng (kiemTep báo lỗi ngay trên dòng; không tải thật nên tệp hợp lệ hiện "đã tải lên"). */
const docTep = (tep: File[]) =>
  tep.map((t, i): Dong => {
    const loi = kiemTep(t, { accept: ACCEPT, toiDaMB: TOI_DA_MB }) ?? undefined
    return { id: Date.now() + i, ten: t.name, kichThuoc: t.size, trangThai: loi ? 'loi' : 'xong', loi }
  })

function DongTep({ d, onBo }: { d: Dong; onBo(): void }) {
  return <FileItem ten={d.ten} kichThuoc={d.kichThuoc} trangThai={d.trangThai} tienDo={d.tienDo} loi={d.loi} onBo={onBo} />
}

/**
 * Vùng thả + danh sách (cột gap 8) — dùng chung khối cũ (3 dòng sẵn) và bản hàng (bắt đầu trống). FileList luôn có mặt
 * (rỗng thì ẩn nhìn) vì là live region — tệp đầu tiên mới được đọc.
 */
function VungTai({ id, banDau }: { id: string; banDau: Dong[] }) {
  const [ds, setDs] = useState(banDau)
  return (
    <div className="flex flex-col gap-2 border-none border-current">
      <FileDrop id={id} accept={ACCEPT} onChonTep={(tep) => setDs((cu) => [...cu, ...docTep(tep)])} goiY={GOI_Y} />
      <FileList>
        {ds.map((d) => (
          <DongTep key={d.id} d={d} onBo={() => setDs((cu) => cu.filter((x) => x.id !== d.id))} />
        ))}
      </FileList>
    </div>
  )
}

/**
 * #file-upload — tái tạo ds/nguon/components/FileUpload/preview.html: khung rộng tối đa 640; vùng thả + danh sách 3
 * dòng (cột gap 8); cách 16 là vùng thả tắt. Chọn/thả tệp thật → thêm dòng (kiemTep báo lỗi ngay trên dòng; không tải
 * thật nên tệp hợp lệ hiện "đã tải lên"). Kéo tệp vào vùng để thấy trạng thái thả. Đo: ds/so-khop/fileupload.json.
 */
export function KhoiFileUpload() {
  return (
    <section id="file-upload" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#file-upload">FileUpload</a>
      </h2>
      {/* border-none border-current: div ăn preflight `0 solid var(--border)` của app; div preview không viền. */}
      <div className="max-w-160 border-none border-current">
        <VungTai id="ds-tep" banDau={BAN_DAU} />
        <div className="mt-4 border-none border-current">
          <div className="flex flex-col gap-2 border-none border-current">
            <FileDrop id="ds-tep-tat" accept={ACCEPT} onChonTep={() => {}} goiY={GOI_Y} disabled />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Một dòng tệp mẫu; Bỏ thì ẩn dòng, nút "Hiện lại" đưa về. */
function DongMau({ d }: { d: Dong }) {
  const [con, setCon] = useState(true)
  return con ? (
    <FileList>
      <DongTep d={d} onBo={() => setCon(false)} />
    </FileList>
  ) : (
    <Button variant="outline" size="sm" onClick={() => setCon(true)}>
      Hiện lại dòng mẫu
    </Button>
  )
}

/** Ô đính kèm bắt buộc: chưa có tệp → lỗi; chọn tệp hợp lệ thì hết lỗi. */
function OBatBuoc() {
  const [ds, setDs] = useState<Dong[]>([])
  const loi = !ds.some((d) => d.trangThai !== 'loi')
  return (
    <Field>
      <FieldLabel id="dsh-tep-bb-nhan" htmlFor="dsh-tep-bb" required>
        Biên bản bàn giao
      </FieldLabel>
      <FileDrop
        id="dsh-tep-bb"
        accept={ACCEPT}
        onChonTep={(tep) => setDs((cu) => [...cu, ...docTep(tep)])}
        goiY={GOI_Y}
        required
        aria-labelledby="dsh-tep-bb-nhan"
        aria-invalid={loi}
        aria-describedby={loi ? 'dsh-tep-bb-loi' : undefined}
      />
      {loi && <FieldError id="dsh-tep-bb-loi">Đính kèm ít nhất một tệp hợp lệ.</FieldError>}
      <FileList>
        {ds.map((d) => (
          <DongTep key={d.id} d={d} onBo={() => setDs((cu) => cu.filter((x) => x.id !== d.id))} />
        ))}
      </FileList>
    </Field>
  )
}

/** #file-upload dạng hàng (/ds): vùng thả, từng trạng thái dòng tệp, vùng tắt, lỗi bắt buộc. Rộng tối đa 640 như preview. */
export function KhoiFileUploadHang() {
  return (
    <KhoiHang neo="file-upload">
      <BienThe ten="Vùng thả" moTa="Đính kèm chứng từ, ảnh hiện trường — bấm chọn hoặc kéo thả, nhiều tệp.">
        <div className="max-w-160 border-none border-current">
          <VungTai id="dsh-tep" banDau={[]} />
        </div>
      </BienThe>
      <BienThe ten="Dòng: đã tải lên" moTa="Tệp đã lên xong — còn nút Bỏ.">
        <div className="max-w-160 border-none border-current">
          <DongMau d={BAN_DAU[0]} />
        </div>
      </BienThe>
      <BienThe ten="Dòng: đang tải" moTa="Thanh tiến độ + phần trăm trong dòng phụ.">
        <div className="max-w-160 border-none border-current">
          <DongMau d={BAN_DAU[1]} />
        </div>
      </BienThe>
      <BienThe ten="Dòng: lỗi" moTa="Sai loại / quá dung lượng — câu lỗi nói cách sửa, viền đỏ.">
        <div className="max-w-160 border-none border-current">
          <DongMau d={BAN_DAU[2]} />
        </div>
      </BienThe>
      <BienThe ten="Tắt" moTa="Hồ sơ đã khoá / thiếu quyền — không nhận chọn, không nhận thả.">
        <div className="max-w-160 border-none border-current">
          <FileDrop id="dsh-tep-tat" accept={ACCEPT} onChonTep={() => {}} goiY={GOI_Y} disabled />
        </div>
      </BienThe>
      <BienThe ten="Lỗi bắt buộc" moTa="Ô bắt buộc chưa có tệp khi lưu — viền đỏ + câu lỗi; trình đọc màn hình đọc câu lỗi cùng ô.">
        <div className="max-w-160 border-none border-current">
          <OBatBuoc />
        </div>
      </BienThe>
    </KhoiHang>
  )
}
