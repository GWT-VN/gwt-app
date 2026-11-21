'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BienThe, KhoiHang } from '../_khung/tam'

/**
 * Thứ tự 5 màu chuỗi (ramp token DS — DS chưa có `--chart-1..5`). Đã chạy bộ kiểm dataviz (validate_palette.js) trên
 * nền sáng #ffffff và tối #212121: cùng 5 token qua cả hai theme — dải sáng, độ bão hoà, khác biệt mù màu cặp kề ΔE ≥ 15.5,
 * mắt thường ≥ 15.6, tương phản ≥ 3:1. Đổi thứ tự/bậc = chạy lại bộ kiểm (README Chart).
 */
const MAU = ['var(--blue-400)', 'var(--orange-500)', 'var(--pink-600)', 'var(--purple-400)', 'var(--green-600)'] as const

/** Dữ liệu demo — số giả, không phải doanh số thật (triệu đồng). */
const THANG = [
  { thang: 'T6', online: 186, cuaHang: 80, daiLy: 120 },
  { thang: 'T7', online: 305, cuaHang: 200, daiLy: 140 },
  { thang: 'T8', online: 237, cuaHang: 120, daiLy: 160 },
  { thang: 'T9', online: 173, cuaHang: 190, daiLy: 110 },
  { thang: 'T10', online: 209, cuaHang: 130, daiLy: 175 },
  { thang: 'T11', online: 264, cuaHang: 140, daiLy: 150 },
]

const KENH = [
  { quy: 'Q1', web: 42, zalo: 30, sieuThi: 24, daiLy: 18, khac: 10 },
  { quy: 'Q2', web: 48, zalo: 34, sieuThi: 22, daiLy: 20, khac: 12 },
  { quy: 'Q3', web: 55, zalo: 31, sieuThi: 27, daiLy: 23, khac: 9 },
  { quy: 'Q4', web: 61, zalo: 38, sieuThi: 25, daiLy: 26, khac: 11 },
]

const cauHinhCot = {
  online: { label: 'Online', color: MAU[0] },
  cuaHang: { label: 'Cửa hàng', color: MAU[1] },
} satisfies ChartConfig

const cauHinhDuong = {
  online: { label: 'Online', color: MAU[0] },
  cuaHang: { label: 'Cửa hàng', color: MAU[1] },
  daiLy: { label: 'Đại lý', color: MAU[2] },
} satisfies ChartConfig

const cauHinhChong = {
  web: { label: 'Web', color: MAU[0] },
  zalo: { label: 'Zalo', color: MAU[1] },
  sieuThi: { label: 'Siêu thị', color: MAU[2] },
  daiLy: { label: 'Đại lý', color: MAU[3] },
  khac: { label: 'Khác', color: MAU[4] },
} satisfies ChartConfig

const TRUC = { tickLine: false, axisLine: false, tickMargin: 8 } as const

function CacBienThe() {
  return (
    <>
      <BienThe ten="Cột nhóm" moTa="Hai chuỗi, màu 1–2. Rê cột: tooltip chấm màu + số. Đầu cột bo 4, hai cột cách 2.">
        <ChartContainer config={cauHinhCot} className="aspect-auto h-60 w-full" data-so="cot">
          <BarChart data={THANG} barGap={2}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="thang" {...TRUC} />
            <YAxis {...TRUC} width={32} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
            <Bar dataKey="online" fill="var(--color-online)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cuaHang" fill="var(--color-cuaHang)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </BienThe>
      <BienThe ten="Đường" moTa="Ba chuỗi, nét 2. Tooltip vạch (indicator line) + đường dóng dọc.">
        <ChartContainer config={cauHinhDuong} className="aspect-auto h-60 w-full" data-so="duong">
          <LineChart data={THANG} margin={{ left: 4, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="thang" {...TRUC} />
            <YAxis {...TRUC} width={32} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
            {(['online', 'cuaHang', 'daiLy'] as const).map((k) => (
              <Line key={k} dataKey={k} type="monotone" stroke={`var(--color-${k})`} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            ))}
          </LineChart>
        </ChartContainer>
      </BienThe>
      <BienThe ten="Cột chồng — đủ 5 màu" moTa="Đủ 5 màu chuỗi theo thứ tự cố định. Khe 2 màu nền giữa các khúc; chỉ khúc trên cùng bo 4.">
        <ChartContainer config={cauHinhChong} className="aspect-auto h-60 w-full" data-so="chong">
          <BarChart data={KENH}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="quy" {...TRUC} />
            <YAxis {...TRUC} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend itemSorter={null} content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1" />} />
            {(['web', 'zalo', 'sieuThi', 'daiLy', 'khac'] as const).map((k, i, ds) => (
              <Bar
                key={k}
                dataKey={k}
                stackId="a"
                fill={`var(--color-${k})`}
                stroke="var(--background)"
                strokeWidth={2}
                radius={i === ds.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </BienThe>
    </>
  )
}

/** #chart trần (/ds/tron). Chưa có trong artifact → không có cổng so khớp; số đo getComputedStyle ở báo cáo đợt 8. */
export function KhoiChart() {
  return (
    <section id="chart" className="scroll-mt-6">
      <h2 className="mb-4 [font:var(--text-heading-xs)]">
        <a href="#chart">Chart</a>
      </h2>
      <div className="divide-y divide-(--border)">
        <CacBienThe />
      </div>
    </section>
  )
}

/** #chart dạng hàng (/ds). */
export function KhoiChartHang() {
  return (
    <KhoiHang neo="chart">
      <CacBienThe />
    </KhoiHang>
  )
}
