import { KhungDs, layTheme } from './_khung/khung-ds'
import { CHU } from './_khung/chu'
import { KHOI, SO_DA_DUNG } from './_khung/khoi'
import { HuongDan } from './_khung/tai-lieu'

/**
 * /ds — trang Components: mỗi component một khối có #neo (link `#neo` đã gửi CEO giữ nguyên) + "Hướng dẫn dùng" từ
 * README artifact. Danh sách khối ở `_khung/khoi.ts`. Bản không cột trái cho so khớp: /ds/tron. `?theme=dark` cho tối.
 */
export default async function DsPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const theme = await layTheme(searchParams)
  return (
    <KhungDs theme={theme} trang="components">
      <h1 className={`m-0 ${CHU.h1}`}>Components</h1>
      <p className={`mt-2 mb-8 text-muted-foreground ${CHU.sm}`}>
        Đã dựng {SO_DA_DUNG}/{KHOI.length} component. Mục mờ ở cột trái = chưa dựng (lát sau).
      </p>
      {/* Neo tiêu đề khối (`h2 > a` ở mọi _khoi): vòng focus DS như Button, thay outline mặc định trình duyệt. */}
      <div className="flex flex-col gap-12 [&_h2>a]:rounded-sm [&_h2>a]:focus-visible:outline-2 [&_h2>a]:focus-visible:outline-offset-2 [&_h2>a]:focus-visible:outline-ring">
        {KHOI.map(
          ({ neo, ten, Khoi }) =>
            Khoi && (
              <div key={neo}>
                <Khoi />
                <HuongDan ten={ten} />
              </div>
            ),
        )}
      </div>
    </KhungDs>
  )
}
