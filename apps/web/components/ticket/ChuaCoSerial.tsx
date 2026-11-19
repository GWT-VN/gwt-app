/** Nhắc bổ sung serial cho ticket tạo khi chưa có serial (khách báo trước, thợ kiểm tra sau). */
export function ChuaCoSerial({ coSerial }: { coSerial: boolean }) {
  if (coSerial) return null
  return (
    <p className="text-sm bg-amber-50 text-amber-900 rounded-lg px-3 py-2 mb-3">
      ⚠️ <strong>Chưa có serial.</strong> Thợ kiểm tra xong thì bấm <strong>Sửa dòng</strong> bên dưới để điền serial — ticket tự nhận máy &amp; bảo hành.
    </p>
  )
}
