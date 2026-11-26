'use client'

import { DangKyBHForm } from '@/components/DangKyBHForm'
import { LapBoForm } from '@/components/LapBoForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ChonKieuLap() {
  return (
    <Tabs defaultValue="le" className="gap-4">
      <TabsList variant="line" thuGon aria-label="Kiểu lắp">
        <TabsTrigger value="le">Lắp 1 máy lẻ</TabsTrigger>
        <TabsTrigger value="bo">Lắp 1 bộ combo (WH15A/WH30A…)</TabsTrigger>
      </TabsList>
      <TabsContent value="le"><DangKyBHForm /></TabsContent>
      <TabsContent value="bo"><LapBoForm /></TabsContent>
    </Tabs>
  )
}
