/**
 * Đường proxy cho qua khi CHƯA đăng nhập.
 * - /login, /auth: luôn công khai (/auth = vòng OAuth quay về, lúc đó chưa có session). Giữ `startsWith` như cũ.
 * - /ds: trang xem DS chỉ dành cho dev → công khai khi NODE_ENV !== 'production'. Ở production proxy đá về /login,
 *   và nếu lọt qua thì layout /ds còn notFound() — hai lớp.
 */
export function laDuongCongKhai(path: string, env: string | undefined): boolean {
  if (path.startsWith('/login') || path.startsWith('/auth')) return true
  return env !== 'production' && (path === '/ds' || path.startsWith('/ds/'))
}
