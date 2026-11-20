/**
 * Đường proxy cho qua khi CHƯA đăng nhập.
 * - /login, /auth (và trang con, vd /auth/callback): luôn công khai (/auth = vòng OAuth quay về, lúc đó chưa có
 *   session). Khớp đúng đoạn — /login-foo, /authority KHÔNG qua (siết 19/11; trước đây `startsWith` cho qua).
 * - /ds: trang xem DS chỉ dành cho dev → công khai khi NODE_ENV !== 'production'. Ở production proxy đá về /login,
 *   và nếu lọt qua thì layout /ds còn notFound() — hai lớp.
 * - /prototype: trang thử vứt đi (dữ liệu giả) — y /ds: công khai ngoài production, trang tự notFound() ở production.
 */
const khopDoan = (path: string, goc: string) => path === goc || path.startsWith(goc + '/')

export function laDuongCongKhai(path: string, env: string | undefined): boolean {
  if (khopDoan(path, '/login') || khopDoan(path, '/auth')) return true
  return env !== 'production' && (khopDoan(path, '/ds') || khopDoan(path, '/prototype'))
}
