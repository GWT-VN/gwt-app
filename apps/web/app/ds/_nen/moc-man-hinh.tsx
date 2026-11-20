import { GHI_CHU, MOC_MAN_HINH, tiLe } from './du-lieu'
import { GiaTri, KhoiNen, TenBien, TrangNen } from './khung-trang'

export function TrangMocManHinh() {
  return (
    <TrangNen tieuDe="Mốc màn hình" moTa={GHI_CHU.mocManHinh}>
      <KhoiNen id="thang" tieuDe={`Thang mốc · ${MOC_MAN_HINH.length}`} moTa="Thanh vẽ theo tỉ lệ so với mốc lớn nhất.">
        <ul className="m-0 flex list-none flex-col gap-5 p-0">
          {tiLe(MOC_MAN_HINH).map(({ token: t, phanTram }) => (
            <li key={t.ten} className="grid items-center gap-x-6 gap-y-2 md:grid-cols-[calc(var(--spacing)*64)_1fr]">
              <div className="flex min-w-0 flex-col gap-1">
                <TenBien bien={t.bien} />
                <GiaTri token={t} />
              </div>
              <span
                className="block h-4 rounded-(--radius-2xs) bg-(--color-background-info-soft-alpha) [box-shadow:inset_0_0_0_1px_var(--color-border-info-surface)]"
                style={{ width: `${phanTram}%` }}
              />
            </li>
          ))}
        </ul>
      </KhoiNen>
      <KhoiNen id="luu-y" tieuDe="Lưu ý khi viết responsive">
        <ul className="ds-text-sm m-0 flex max-w-prose list-disc flex-col gap-2 pl-5">
          <li>
            Biến --breakpoint-* khai trong vùng DS không đổi được media query: tiền tố sm:, md:… vẫn là mốc mặc định của
            Tailwind (sm 640, md 768, lg 1024, xl 1280, 2xl 1536) — trùng số ở md trở lên, khác ở xs và sm.
          </li>
          <li>Cần đúng mốc DS (vd 576px) thì viết biến thể max-width/min-width với số px của mốc đó.</li>
        </ul>
      </KhoiNen>
    </TrangNen>
  )
}
