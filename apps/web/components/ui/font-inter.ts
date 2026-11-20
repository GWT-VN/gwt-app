import localFont from 'next/font/local'

/**
 * Inter của DS v2 — file CHÍNH CHỦ (rsms/inter v4.1, `web/InterVariable.woff2`, OFL — xem `fonts/Inter-LICENSE.txt`),
 * self-host qua next/font/local. KHÔNG dùng next/font/google: bản Google Fonts cắt mất stylistic set, `cv11`/`ss03`
 * (CEO chốt 19/11) không có tác dụng — đo GSUB 20/11 bằng fontTools. Bản chính chủ có cv11, ss03, tnum, đủ dấu tiếng Việt,
 * trục wght + opsz. Không nạp bản nghiêng (DS không dùng chữ nghiêng).
 * DsRoot gắn `inter.variable` lên chính phần tử gốc: tokens.css khai --font-sans = var(--font-inter, …) trên
 * [data-ds="v2"], nên màn nào bọc <DsRoot> cũng có Inter mà không cần layout nạp font.
 */
export const inter = localFont({
  src: './fonts/InterVariable.woff2',
  variable: '--font-inter',
  weight: '100 900',
  display: 'swap',
})
