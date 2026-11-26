'use client'

import { useState, type ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/** Giữ các tab trong cây để bản nháp còn nguyên khi đổi mục. */
export function KhachTabs({ tabs }: { tabs: { khoa: string; nhan: string; noiDung: ReactNode }[] }) {
  const [dangMo, setDangMo] = useState(tabs[0]?.khoa ?? '')

  return (
    <Tabs value={dangMo} onValueChange={setDangMo}>
      <TabsList variant="line" thuGon aria-label="Hồ sơ khách">
        {tabs.map((t) => <TabsTrigger key={t.khoa} value={t.khoa}>{t.nhan}</TabsTrigger>)}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.khoa} value={t.khoa} forceMount hidden={t.khoa !== dangMo} className="pt-3">
          {t.noiDung}
        </TabsContent>
      ))}
    </Tabs>
  )
}
