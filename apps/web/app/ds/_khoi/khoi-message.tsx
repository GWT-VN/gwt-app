'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { BienThe, KhoiHang } from '../_khung/tam'

/** Hội thoại demo — tên giả, không PII. */
const TIN: { id: string; minh: boolean; chu: string; gio: string }[] = [
  { id: 't1', minh: false, chu: 'Chào bạn, mình cần báo giá máy lọc nước cho văn phòng 20 người.', gio: '09:02' },
  { id: 't2', minh: true, chu: 'Chào anh An, em gửi anh hai mẫu phù hợp nhé.', gio: '09:03' },
  { id: 't3', minh: true, chu: 'Mẫu A: 3 cấp lọc, nóng lạnh. Mẫu B: 5 cấp lọc, có đèn UV.', gio: '09:03' },
  { id: 't4', minh: false, chu: 'Mẫu B có lắp đặt tận nơi không em?', gio: '09:05' },
  { id: 't5', minh: true, chu: 'Dạ có, miễn phí lắp trong nội thành.', gio: '09:06' },
  { id: 't6', minh: false, chu: 'Thời gian giao hàng bao lâu?', gio: '09:07' },
  { id: 't7', minh: true, chu: 'Hai ngày làm việc kể từ khi xác nhận đơn ạ.', gio: '09:08' },
  { id: 't8', minh: false, chu: 'Ok, gửi mình báo giá mẫu B nhé.', gio: '09:10' },
  { id: 't9', minh: true, chu: 'Em đã gửi báo giá BG-0001 qua email của anh.', gio: '09:12' },
]

function Tin({ minh, chu, gio, dau }: { minh: boolean; chu: string; gio?: string; dau?: boolean }) {
  return (
    <Message align={minh ? 'end' : 'start'}>
      {!minh && (
        <MessageAvatar>
          <Avatar size="lg">
            <AvatarFallback>AN</AvatarFallback>
          </Avatar>
        </MessageAvatar>
      )}
      <MessageContent>
        {dau && <MessageHeader>{minh ? 'Bạn' : 'Anh An (demo)'}</MessageHeader>}
        <Bubble variant={minh ? 'secondary' : 'outline'}>
          <BubbleContent>{chu}</BubbleContent>
        </Bubble>
        {gio && <MessageFooter>{gio}</MessageFooter>}
      </MessageContent>
    </Message>
  )
}

function CacBienThe() {
  return (
    <>
      <BienThe
        ten="Hai phía"
        moTa="align start (khách, có ảnh đại diện) / end (mình, đảo hàng). Đầu tin: tên; chân tin: giờ — chữ 12/18 muted. Nhiều bong bóng liền nhau: MessageGroup."
      >
        <div className="flex max-w-lg flex-col gap-4" data-so="hai-phia">
          <Tin minh={false} chu="Mẫu B có lắp đặt tận nơi không em?" gio="09:05" dau />
          <Message align="end">
            <MessageContent>
              <MessageGroup>
                <Bubble variant="secondary">
                  <BubbleContent>Dạ có ạ.</BubbleContent>
                </Bubble>
                <Bubble variant="secondary">
                  <BubbleContent>Miễn phí lắp trong nội thành.</BubbleContent>
                </Bubble>
              </MessageGroup>
              <MessageFooter>09:06</MessageFooter>
            </MessageContent>
          </Message>
        </div>
      </BienThe>
      <BienThe
        ten="MessageScroller"
        moTa="Khung cuộn cao 320: mở ở cuối, cuộn lên thì hiện nút cuộn xuống cuối. Viewport focus được (phím ↑/↓/PgUp), nội dung role log."
      >
        <div className="h-80 max-w-lg overflow-hidden rounded-xl border border-(--border)" data-so="scroller">
          <MessageScrollerProvider>
            <MessageScroller>
              <MessageScrollerViewport aria-label="Hội thoại demo">
                <MessageScrollerContent className="gap-4 p-4">
                  <MessageScrollerItem>
                    <Marker variant="separator">
                      <MarkerContent>Hôm nay</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                  {TIN.map((t) => (
                    <MessageScrollerItem key={t.id} messageId={t.id}>
                      <Tin minh={t.minh} chu={t.chu} gio={t.gio} />
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </div>
      </BienThe>
    </>
  )
}

/** #message trần (/ds/tron) — gồm cả MessageScroller. Chưa có trong artifact → không có cổng so khớp. */
export function KhoiMessage() {
  return (
    <section id="message" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#message">Message</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #message dạng hàng (/ds). */
export function KhoiMessageHang() {
  return (
    <KhoiHang neo="message">
      <CacBienThe />
    </KhoiHang>
  )
}
