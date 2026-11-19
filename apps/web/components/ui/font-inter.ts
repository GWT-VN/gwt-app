import { Inter } from 'next/font/google'

/**
 * Inter của DS v2 (self-host qua next/font). next/font phải gọi ở module scope, gán vào const → để riêng một file.
 * DsRoot gắn `inter.variable` lên chính phần tử gốc: tokens.css khai --font-sans = var(--font-inter, …) trên
 * [data-ds="v2"], nên màn nào bọc <DsRoot> cũng có Inter mà không cần layout nạp font.
 */
export const inter = Inter({ variable: '--font-inter', subsets: ['latin', 'vietnamese'] })
