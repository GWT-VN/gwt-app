/** Hiện lỗi đọc Supabase mà không làm sập cả trang. */
export default function DataError({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div className="err">
      <b>Không đọc được dữ liệu từ Supabase</b>
      {msg}
    </div>
  );
}
