import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Có nhiều lockfile trên máy (một cái ở ~/); ghim root về đúng thư mục app này
  // để Turbopack không suy ra nhầm workspace root.
  turbopack: {
    root: __dirname,
  },

  // CHỈ ảnh hưởng `next dev`, production không đọc tới.
  // Mở app bằng http://127.0.0.1:3xxx thay vì http://localhost:3xxx thì Next coi đó là
  // origin lạ và CHẶN tài nguyên dev (kể cả socket HMR) — hậu quả rất khó đoán: trang
  // vẫn hiện đầy đủ nhưng KHÔNG hydrate, nên form đăng nhập submit kiểu HTML thuần,
  // nạp lại trang trắng và không báo lỗi gì. Đã mất công truy 21/08/2026.
  // Vẫn cần mở bằng 127.0.0.1: cookie không phân biệt CỔNG, nên một cookie hỏng ở
  // `localhost` khoá chết mọi dev server của mọi phiên (xem lỗi 25, backlog nền tảng);
  // `127.0.0.1` là host khác nên thoát được mà không phải xoá cookie của phiên khác.
  allowedDevOrigins: ['127.0.0.1'],

  // Khu Marketing dọn vào khu Wiki (28/08/2026). Giữ đường cũ sống vĩnh viễn: link
  // /marketing đã nằm trong chat, tài liệu và dấu trang của nhân viên từ hôm 28/08.
  // permanent:false — còn có thể đổi cấu trúc nữa, đừng để trình duyệt nhớ cứng 308.
  async redirects() {
    return [
      { source: '/marketing', destination: '/wiki/marketing', permanent: false },
      { source: '/marketing/:path*', destination: '/wiki/marketing/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
