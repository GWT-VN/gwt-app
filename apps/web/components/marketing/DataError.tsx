import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Hiện lỗi đọc Supabase mà không làm sập cả trang. */
export default function DataError({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <Alert color="danger">
      <AlertTitle>Không đọc được dữ liệu từ Supabase</AlertTitle>
      <AlertDescription>{msg}</AlertDescription>
    </Alert>
  );
}
