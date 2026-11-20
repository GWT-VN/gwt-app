import { KhungDs, layTheme } from './_khung/khung-ds'
import { HANG } from './_khung/hang'
import { KHOI, SO_DA_DUNG } from './_khung/khoi'
import { motDong, readmeComponent } from './_khung/readme'
import { Muc, Tam, ThanMuc } from './_khung/tam'
import { HuongDan } from './_khung/tai-lieu'

/**
 * Khối `_khoi/*` giữ nguyên (cổng so khớp đo trên /ds/tron): ở đây ẩn `h2` riêng của khối — tiêu đề + mô tả nằm ở hàng
 * tiêu đề `Muc`. `id` vẫn ở `section` của khối → neo `#<neo>` cuộn tới thân, nên chừa trên đủ cao cho hàng tiêu đề
 * (hàng tiêu đề ≈ 91 + đệm thân 20 + khe 24 → 144; màn hẹp thêm thanh trên 49 → 192).
 */
const BOC_KHOI = '[&>section>h2]:hidden [&>section[id]]:scroll-mt-36 max-md:[&>section[id]]:scroll-mt-48'

/**
 * /ds — trang Components: mỗi component một `Muc` (tiêu đề + một dòng mô tả từ README artifact, thân = khối demo,
 * hàng cuối "Hướng dẫn dùng"). Link `#neo` cũ giữ nguyên. Bản không khung cho so khớp: /ds/tron. `?theme=dark` cho tối.
 */
export default async function DsPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const theme = await layTheme(searchParams)
  return (
    <KhungDs theme={theme} trang="components">
      <Tam
        tieuDe="Components"
        moTa={`Đã dựng ${SO_DA_DUNG}/${KHOI.length} component. Mục mờ ở cột trái = chưa dựng (lát sau).`}
      >
        {KHOI.map(({ neo, ten, Khoi }) => {
          if (!Khoi) return null
          const Hang = HANG[neo]
          const md = readmeComponent(ten)
          return (
            <Muc key={neo} neo={neo} tieuDe={ten} moTa={md ? <span className="block truncate">{motDong(md)}</span> : undefined}>
              {Hang ? (
                <Hang />
              ) : (
                <ThanMuc className={BOC_KHOI}>
                  <Khoi />
                </ThanMuc>
              )}
              <HuongDan ten={ten} />
            </Muc>
          )
        })}
      </Tam>
    </KhungDs>
  )
}
