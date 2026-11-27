"use client";

import { useState, type ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/**
 * Bảng chi tiết bên phải của các danh sách Marketing.
 * - Tên hộp thoại = tiêu đề THẬT của mục: `children` phải chứa `SheetTitle` (thường `<SheetTitle asChild><h2>…`).
 * - Màn gọi thường viết `{current && …}` → đóng là `children` thành null ngay, trong khi Sheet còn chạy hiệu ứng đóng.
 *   Giữ nội dung lần mở cuối tới khi đóng xong (chỉnh state lúc render, không qua effect) để bảng không trống khi trượt ra.
 */
export default function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [giu, setGiu] = useState<ReactNode>(children);
  if (open && children !== giu) setGiu(children);

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent data-khu="wiki" className="w-[min(520px,100%)]" aria-describedby={undefined}>
        {open ? children : giu}
      </SheetContent>
    </Sheet>
  );
}
