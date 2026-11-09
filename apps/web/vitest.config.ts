import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Alias `@/` như tsconfig để test nạp được module dùng đường dẫn `@/...` (vd. app/ticket/loi-actions.ts).
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
})
