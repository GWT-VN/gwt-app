import { GHI_CHU, MOC_MAN_HINH, tiLe } from './du-lieu'
import { BangToken, MucNen, TrangNen, hangToken } from './khung-trang'

export function TrangMocManHinh() {
  return (
    <TrangNen tieuDe="Mốc màn hình" moTa={GHI_CHU.mocManHinh}>
      <MucNen id="thang" tieuDe={`Thang mốc · ${MOC_MAN_HINH.length}`} moTa="Thanh vẽ theo tỉ lệ so với mốc lớn nhất.">
        <BangToken
          ten="Thang mốc"
          cot={['Mẫu', 'Giá trị']}
          rong={140}
          hang={tiLe(MOC_MAN_HINH).map(({ token: t, phanTram }) =>
            hangToken(
              { ...t, dung: undefined },
              <span className="block w-full min-w-48">
                <span
                  className="block h-4 rounded-(--radius-2xs) bg-(--color-background-info-soft-alpha) [box-shadow:inset_0_0_0_1px_var(--color-border-info-surface)]"
                  style={{ width: `${phanTram}%` }}
                />
              </span>,
            ),
          )}
        />
      </MucNen>
      <MucNen id="luu-y" tieuDe="Lưu ý khi viết responsive">
        <ul className="ds-text-sm m-0 flex max-w-prose list-disc flex-col gap-2 pl-5">
          <li>
            Biến --breakpoint-* khai trong vùng DS không đổi được media query: tiền tố sm:, md:… vẫn là mốc mặc định của
            Tailwind (sm 640, md 768, lg 1024, xl 1280, 2xl 1536) — trùng số ở md trở lên, khác ở xs và sm.
          </li>
          <li>Cần đúng mốc DS (vd 576px) thì viết biến thể max-width/min-width với số px của mốc đó.</li>
        </ul>
      </MucNen>
    </TrangNen>
  )
}
