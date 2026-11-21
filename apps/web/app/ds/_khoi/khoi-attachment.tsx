'use client'

import { ArrowClockwise, Check, Clock, FilePdf, FileText, FileXls, Image as ImageIcon, X } from '@phosphor-icons/react/ssr'
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '@/components/ui/attachment'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { BienThe, KhoiHang } from '../_khung/tam'

function NutBo({ ten }: { ten: string }) {
  return (
    <AttachmentAction aria-label={`Bỏ ${ten}`}>
      <X aria-hidden="true" />
    </AttachmentAction>
  )
}

/** Demo không PII (tên tệp giả). `data-so` để đo. */
function CacBienThe() {
  return (
    <>
      <BienThe ten="Trạng thái" moTa="idle (viền gạch) · uploading (Progress + %) · processing · error (lý do bằng chữ) · done.">
        <div className="flex max-w-96 flex-col gap-2">
          <Attachment state="idle" className="w-full" data-so="idle">
            <AttachmentMedia>
              <Clock aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>bien-ban-ban-giao.pdf</AttachmentTitle>
              <AttachmentDescription>Chờ tải lên</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <NutBo ten="bien-ban-ban-giao.pdf" />
            </AttachmentActions>
          </Attachment>
          <Attachment state="uploading" className="w-full" data-so="uploading">
            <AttachmentMedia>
              <Spinner />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>anh-tem-bao-hanh.jpg</AttachmentTitle>
              <AttachmentDescription>2,3 MB · đang tải 64%</AttachmentDescription>
              <Progress value={64} aria-label="Đang tải anh-tem-bao-hanh.jpg" className="mt-1.5" />
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Huỷ tải anh-tem-bao-hanh.jpg">
                <X aria-hidden="true" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
          <Attachment state="processing" className="w-full" data-so="processing">
            <AttachmentMedia>
              <FileText aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>hop-dong-HD-0412.docx</AttachmentTitle>
              <AttachmentDescription>Đang quét virus</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <NutBo ten="hop-dong-HD-0412.docx" />
            </AttachmentActions>
          </Attachment>
          <Attachment state="error" className="w-full" data-so="error">
            <AttachmentMedia>
              <FileXls aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>ton-kho-thang-11.xlsx</AttachmentTitle>
              <AttachmentDescription>Lỗi mạng — chưa tải lên. Thử lại.</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Tải lại ton-kho-thang-11.xlsx">
                <ArrowClockwise aria-hidden="true" />
              </AttachmentAction>
              <NutBo ten="ton-kho-thang-11.xlsx" />
            </AttachmentActions>
          </Attachment>
          <Attachment state="done" className="w-full" data-so="done">
            <AttachmentMedia>
              <Check aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>bao-gia-DH-1024.pdf</AttachmentTitle>
              <AttachmentDescription>PDF · 1,8 MB · đã tải lên</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <NutBo ten="bao-gia-DH-1024.pdf" />
            </AttachmentActions>
          </Attachment>
        </div>
      </BienThe>
      <BienThe ten="size" moTa="default (14/20, media 32) · sm (12/18, media 28) · xs (12/18, media 24).">
        <div className="flex flex-wrap items-start gap-3">
          {(['default', 'sm', 'xs'] as const).map((s) => (
            <Attachment key={s} size={s} data-so={`size-${s}`}>
              <AttachmentMedia>
                <FilePdf aria-hidden="true" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>bao-gia.pdf</AttachmentTitle>
                <AttachmentDescription>PDF · 1,8 MB</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          ))}
        </div>
      </BienThe>
      <BienThe ten='orientation="vertical"' moTa="Media trên, chữ dưới — lưới ảnh đính kèm. Nút bỏ nằm góc trên phải.">
        <div className="flex gap-3">
          <Attachment orientation="vertical" data-so="doc">
            <AttachmentMedia>
              <ImageIcon aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>may-lap-dat.jpg</AttachmentTitle>
              <AttachmentDescription>JPG · 3,1 MB</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <NutBo ten="may-lap-dat.jpg" />
            </AttachmentActions>
          </Attachment>
        </div>
      </BienThe>
      <BienThe ten="Trigger (cả thẻ bấm được)" moTa="AttachmentTrigger phủ cả thẻ (mở tệp); nút Bỏ vẫn bấm riêng. Tab tới → vòng focus quanh thẻ.">
        <Attachment className="w-full max-w-96" data-so="trigger">
          <AttachmentMedia>
            <FilePdf aria-hidden="true" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>huong-dan-van-hanh-NX-2210.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 4,2 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <NutBo ten="huong-dan-van-hanh-NX-2210.pdf" />
          </AttachmentActions>
          <AttachmentTrigger asChild>
            <a href="#attachment" aria-label="Mở huong-dan-van-hanh-NX-2210.pdf" />
          </AttachmentTrigger>
        </Attachment>
      </BienThe>
      <BienThe ten="AttachmentGroup" moTa="Hàng cuộn ngang có snap, thanh cuộn ẩn; Tab tới nút của thẻ khuất để cuộn tới.">
        <AttachmentGroup className="max-w-[560px]" data-so="nhom">
          {['bao-gia-DH-1024.pdf', 'hop-dong-HD-0412.pdf', 'bien-ban-ban-giao.pdf', 'phieu-xuat-kho.pdf', 'hoa-don-VAT.pdf'].map(
            (t) => (
              <Attachment key={t} size="sm">
                <AttachmentMedia>
                  <FilePdf aria-hidden="true" />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{t}</AttachmentTitle>
                  <AttachmentDescription>PDF</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <NutBo ten={t} />
                </AttachmentActions>
              </Attachment>
            ),
          )}
        </AttachmentGroup>
      </BienThe>
    </>
  )
}

/** #attachment trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp riêng (token `.ui-file*`). */
export function KhoiAttachment() {
  return (
    <section id="attachment" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#attachment">Attachment</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #attachment dạng hàng (/ds). */
export function KhoiAttachmentHang() {
  return (
    <KhoiHang neo="attachment">
      <CacBienThe />
    </KhoiHang>
  )
}
