/**
 * Đồng bộ nội dung wiki Marketing từ repo **GWT Marketing Kit** sang snapshot trong repo này.
 *
 *     npm --prefix apps/web run sync:marketing
 *     MKT_KIT_DIR=/duong/dan/khac npm --prefix apps/web run sync:marketing
 *
 * Vì sao phải chép: `rules/*.md` và `Work GWT/Quy trình/*.md` là nguồn-sự-thật ở repo Marketing
 * Kit (skill `write_script`, `transcribe_video`… đọc thẳng ở đó). GWT-App là repo khác nên khi
 * Vercel build không nhìn thấy chúng → phải có bản chép đã commit.
 *
 * Sửa luật thì sửa BÊN KIA rồi chạy lệnh này. Đừng sửa file trong `apps/web/content/marketing/`.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Neo theo vị trí script, KHÔNG theo cwd — chạy từ gốc repo hay từ apps/web đều đúng.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const ICLOUD = path.join(os.homedir(), "Library/Mobile Documents/com~apple~CloudDocs/GWT - Claude");
const CANDIDATES = [
  process.env.MKT_KIT_DIR,
  path.join(ICLOUD, "GWT Marketing Kit"),
  path.join(REPO, "..", "..", "GWT Marketing Kit"),
].filter(Boolean);

const kit = CANDIDATES.find((d) => existsSync(path.join(d, "rules", "ad-compliance-vn.md")));
if (!kit) {
  console.error("Không tìm thấy repo GWT Marketing Kit. Đã thử:\n  " + CANDIDATES.join("\n  "));
  console.error("Chỉ đường bằng: MKT_KIT_DIR=/duong/dan npm --prefix apps/web run sync:marketing");
  process.exit(1);
}

const DEST = path.join(REPO, "apps", "web", "content", "marketing");
const JOBS = [
  { src: path.join(kit, "rules"), dest: path.join(DEST, "luat-qc"), what: "luật QC" },
  { src: path.join(kit, "Work GWT", "Quy trình"), dest: path.join(DEST, "quy-trinh"), what: "quy trình sản xuất" },
];

let tong = 0;
for (const { src, dest, what } of JOBS) {
  if (!existsSync(src)) {
    console.warn(`⚠️  Bỏ qua ${what} — không thấy ${src}`);
    continue;
  }
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  const files = readdirSync(src).filter((f) => f.endsWith(".md"));
  for (const f of files) copyFileSync(path.join(src, f), path.join(dest, f));
  console.log(`✓ ${files.length} file ${what} → ${path.relative(REPO, dest)}`);
  tong += files.length;
}

/**
 * Sinh module TS nhúng sẵn nội dung.
 *
 * Vì sao không để app đọc `fs` lúc chạy: Turbopack không truy vết tĩnh được
 * `fs.readFileSync(path.join(...))` — nó cảnh báo "whole project was traced" và
 * KHÔNG có gì bảo đảm mấy file .md được đóng gói lên Vercel. Nhúng thành TS thì
 * bundler thấy rõ, không thể thiếu file, và không cần cấu hình tracing riêng.
 * 146KB markdown -> nằm ở phía server, không xuống trình duyệt.
 */
function sinhModule() {
  const doc = (dir) =>
    existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith(".md"))
          .map((f) => [f.replace(/\.md$/, ""), readFileSync(path.join(dir, f), "utf-8")])
      : [];

  const rules = doc(path.join(DEST, "luat-qc"));
  const process_ = doc(path.join(DEST, "quy-trinh"));
  const lit = (v) => JSON.stringify(v);

  const out = [
    "// FILE TỰ SINH — ĐỪNG SỬA TAY.",
    "// Nguồn: repo GWT Marketing Kit. Sinh lại bằng: npm --prefix apps/web run sync:marketing",
    "",
    "/** `rules/*.md` của repo Marketing Kit, khoá là slug. */",
    "export const LUAT_QC: Record<string, string> = {",
    ...rules.map(([k, v]) => `  ${lit(k)}: ${lit(v)},`),
    "};",
    "",
    "/** `Work GWT/Quy trình/*.md`, khoá là TÊN FILE gốc (có dấu, có khoảng trắng). */",
    "export const QUY_TRINH: Record<string, string> = {",
    ...process_.map(([k, v]) => `  ${lit(k)}: ${lit(v)},`),
    "};",
    "",
  ].join("\n");

  const dest = path.join(REPO, "apps", "web", "lib", "marketing", "data", "noi-dung.ts");
  writeFileSync(dest, out, "utf-8");
  console.log(`✓ nhúng ${rules.length + process_.length} file → ${path.relative(REPO, dest)}`);
}
sinhModule();

// Dấu vết để người đọc snapshot biết nó từ đâu ra và đừng sửa tay.
writeFileSync(
  path.join(DEST, "README.md"),
  [
    "# Snapshot — KHÔNG SỬA TAY",
    "",
    "Thư mục này do `tools/scripts/sync-marketing-content.mjs` sinh ra từ repo **GWT Marketing Kit**:",
    "",
    "- `luat-qc/`   ← `rules/*.md`",
    "- `quy-trinh/` ← `Work GWT/Quy trình/*.md`",
    "",
    "Sửa nội dung thì sửa ở repo Marketing Kit rồi chạy:",
    "",
    "```bash",
    "npm --prefix apps/web run sync:marketing",
    "```",
    "",
    "Mọi thay đổi sửa trực tiếp ở đây sẽ bị ghi đè ở lần đồng bộ sau.",
    "",
  ].join("\n"),
  "utf-8",
);
console.log(`Xong: ${tong} file. Nguồn: ${kit}`);
