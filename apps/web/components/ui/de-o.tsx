'use client'

import { createContext, useContext, type ReactNode } from 'react'

/**
 * Ô sửa đang nằm trong giá trị của `PropertyRow` → mở kiểu "đè ô" (học Notion 27/11): nút giãn hết ô, popup mở ĐÈ lên
 * chính ô (mép trái + đỉnh trùng ô, rộng bằng cột giá trị), dòng đầu popup = ô tìm / giá trị đang chọn nằm đúng chỗ giá
 * trị cũ. Ngoài PropertyRow (ô bảng) giữ popup thả xuống dưới như cũ.
 */
const DeOCtx = createContext(false)

export function DeO({ children }: { children: ReactNode }) {
  return <DeOCtx.Provider value>{children}</DeOCtx.Provider>
}

export const useDeO = () => useContext(DeOCtx)
