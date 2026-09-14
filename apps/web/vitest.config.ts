import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Alias "@/" khớp tsconfig paths — vitest không tự đọc tsconfig.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
});
