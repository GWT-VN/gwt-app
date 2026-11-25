'use client'

// PROTOTYPE vứt đi — PA C "Theo tab": PageHeader + hàng thuộc tính, nội dung chia Tabs DS
// Tổng quan · Các lần lỗi · Nhật ký · Chi phí & vật tư · Khách & máy.
import { DetailHeading } from '@/components/ui/detail-layout'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Timeline } from '@/components/ui/timeline'
import {
  cacLan,
  CacLanLoi,
  CanhBao,
  ChiPhi,
  DongMayLoi,
  DuongDan,
  HangThuocTinh,
  KhachBaoXuLy,
  meta,
  mucGhiChu,
  NhomLoi,
  NutLichKT,
  tieuDe,
  TTKhachMay,
  useGhiChuMoi,
  type DuLieuCt,
} from './chung'

export function CtC({ d }: { d: DuLieuCt }) {
  const { moi, composer } = useGhiChuMoi()
  const lan = cacLan(d)
  const cuoi = lan[lan.length - 1]
  const muc = mucGhiChu(d, moi)
  return (
    <div className="flex flex-col gap-6 border-none border-current">
      <PageHeader duongDan={<DuongDan ma={d.t.ticket_code} />} tieuDe={tieuDe(d)} meta={meta(d)} hanhDong={<NutLichKT d={d} />} />
      <HangThuocTinh d={d} />
      <CanhBao d={d} />
      <Tabs defaultValue="tong-quan">
        <TabsList variant="pill" thuGon>
          <TabsTrigger value="tong-quan">Tổng quan</TabsTrigger>
          <TabsTrigger value="lan">
            Các lần lỗi <TabsCount>{lan.length}</TabsCount>
          </TabsTrigger>
          <TabsTrigger value="nhat-ky">
            Nhật ký <TabsCount>{muc.length}</TabsCount>
          </TabsTrigger>
          <TabsTrigger value="chi-phi">
            Chi phí &amp; vật tư <TabsCount>{d.items.length}</TabsCount>
          </TabsTrigger>
          <TabsTrigger value="khach-may">Khách &amp; máy</TabsTrigger>
        </TabsList>
        <TabsContent value="tong-quan" className="flex flex-col gap-6">
          <section aria-labelledby="ctc-cuoi" className="border-none border-current">
            <DetailHeading id="ctc-cuoi" className="mb-3">
              Lần {cuoi.so} (mới nhất)
            </DetailHeading>
            <KhachBaoXuLy lan={cuoi} />
          </section>
          <section aria-labelledby="ctc-may" className="border-none border-current">
            <DetailHeading id="ctc-may" className="mb-3">
              Máy &amp; lỗi
            </DetailHeading>
            <DongMayLoi d={d} />
          </section>
          <div className="border-none border-current">
            <NhomLoi d={d} />
          </div>
          {muc.length > 0 && (
            <section aria-labelledby="ctc-gan" className="border-none border-current">
              <DetailHeading id="ctc-gan" className="mb-3">
                Trao đổi gần nhất
              </DetailHeading>
              <Timeline muc={muc.slice(-3)} aria-label="Trao đổi gần nhất" />
            </section>
          )}
        </TabsContent>
        <TabsContent value="lan">
          <CacLanLoi d={d} />
        </TabsContent>
        <TabsContent value="nhat-ky">
          {muc.length > 0 && <Timeline muc={muc} hien={10} aria-label="Nhật ký trao đổi" />}
          {composer}
        </TabsContent>
        <TabsContent value="chi-phi">
          <ChiPhi d={d} />
        </TabsContent>
        <TabsContent value="khach-may">
          <div className="max-w-md border-none border-current">
            <TTKhachMay d={d} layout="stack" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
