/**
 * Bóc nội dung Product Wiki từ `apps/web/content/wiki/san-pham/` thành module TS nhúng sẵn.
 *
 *     npm --prefix apps/web run sync:wiki
 *
 * Vì sao phải nhúng thành TS thay vì để app đọc `fs` lúc chạy: Turbopack không truy vết
 * tĩnh được `fs.readFileSync(path.join(...))` — nó cảnh báo "whole project was traced" và
 * KHÔNG có gì bảo đảm mấy file .md được đóng gói lên Vercel. Local chạy ngon mà production
 * trắng trơn. Khu Marketing đã trả giá đúng chỗ này (xem lib/marketing/content.ts).
 *
 * Script làm 3 việc:
 *   1. Đọc `<ma>/san-pham.json` → thẻ định danh sản phẩm.
 *   2. Cắt `<ma>/pkb.md` theo mốc `# PHẦN <N> — <TÊN>` thành 10 phần.
 *   3. Bóc mọi bảng dữ kiện trong Phần 1 thành mảng có cấu trúc, để trang Tra cứu lọc được.
 *
 * Đầu ra: `apps/web/lib/wiki/data/san-pham.ts` — KHÔNG sửa tay, lần chạy sau ghi đè.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Neo theo vị trí script, KHÔNG theo cwd — chạy từ gốc repo hay từ apps/web đều đúng.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const NGUON = path.join(REPO, "apps", "web", "content", "wiki", "san-pham");
const NGUON_TL = path.join(REPO, "apps", "web", "content", "wiki", "tai-lieu");
const DICH = path.join(REPO, "apps", "web", "lib", "wiki", "data", "san-pham.ts");

/** Tên chuẩn + nhóm thông tin của 10 Phần. Khoá là số phần trong `# PHẦN <N>`. */
const PHAN = [
  { so: 0, slug: "chi-dan", ten: "Chỉ dẫn, nguồn dữ liệu & quy tắc", nhom: "quan-ly" },
  { so: 1, slug: "bang-su-that", ten: "Bảng sự thật nguyên tử", nhom: "xuong-song" },
  { so: 2, slug: "quy-tac-claim", ten: "Quy tắc claim", nhom: "truyen-thong" },
  { so: 3, slug: "huong-dan-khach", ten: "Hướng dẫn khách hàng", nhom: "ky-thuat" },
  { so: 4, slug: "an-toan", ten: "Safety database", nhom: "ky-thuat" },
  { so: 5, slug: "loi-xu-ly", ten: "Lỗi thường gặp & cách xử lý", nhom: "ky-thuat" },
  { so: 6, slug: "hoi-dap", ten: "Bộ hỏi–đáp đã kiểm chứng", nhom: "san-pham" },
  { so: 7, slug: "nguyen-lieu-mkt", ten: "Nguyên liệu marketing đã duyệt nguồn", nhom: "truyen-thong" },
  { so: 8, slug: "doi-chieu-nguon", ten: "Ma trận nguồn & sổ mâu thuẫn", nhom: "quan-ly" },
  { so: 9, slug: "dao-tao", ten: "Đào tạo & kiểm tra", nhom: "san-pham" },
];

/** `# PHẦN 3 — HƯỚNG DẪN…` → bắt số phần. Chỉ khớp ở ĐẦU DÒNG, mức h1. */
const MOC_PHAN = /^#\s+PHẦN\s+(\d+)\s*[—–-]/gm;
/** `## C. CẤU HÌNH LỌC` → bắt chữ cái nhóm dữ kiện trong Phần 1. */
const MOC_NHOM = /^##\s+([A-M])\.\s+(.+?)\s*$/gm;
/** Ô đầu bảng dạng ``` `F-C17` ``` → đây là một dòng dữ kiện. */
const MA_FACT = /^`(F-[A-Z]\d+)`$/;
/**
 * Nhãn công bố. BẮT BUỘC có cờ `u`: không có nó, lớp ký tự chỉ khớp MỘT đơn vị UTF-16,
 * tức nửa surrogate đầu của emoji → cắt ra chuỗi hỏng `\ud83d`.
 */
const NHAN_CONG_BO = /[🟢🟡🔵🔴]/u;
/** Hạng tin cậy đứng riêng một từ trong ô "Hạng". */
const MA_HANG = /\b([A-EX])\b/;

/**
 * Slug của một tiêu đề — PHẢI khớp y hệt `slugTieuDe()` trong components/marketing/Markdown.tsx.
 * Link `](#...)` do script này viết lại phải trỏ đúng `id` mà trình render đặt lên thẻ heading.
 * Có test chốt hai bên khớp nhau: lib/wiki/wiki.test.ts.
 */
export function slugTieuDe(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Dọn HTML thô khỏi markdown trước khi giao cho trình render.
 *
 * VÌ SAO: react-markdown (không có rehype-raw) KHÔNG hiểu HTML thô — nó in nguyên văn ra
 * màn hình. Nên `<a id="q26"></a>` hiện lù lù thành chữ giữa trang, và `<br>` trong ô bảng
 * cũng vậy. Tài liệu gốc có 145 cái neo và 24 cái `<br>`.
 *
 * KHÔNG xoá trụi: 144 link mục lục kiểu `](#q26)` đang trỏ vào đám neo đó. Nên:
 *   1. ánh xạ mỗi neo → tiêu đề ngay bên dưới nó,
 *   2. gỡ thẻ neo đi,
 *   3. viết lại link sang slug của tiêu đề — trình render tự đặt `id` đúng slug ấy.
 * Neo không có tiêu đề theo sau (trỏ sang Phần khác — vốn đã gãy vì mỗi Phần một trang)
 * thì bỏ link, giữ lại chữ.
 */
function donDep(md) {
  // 1. neo → slug tiêu đề đứng ngay dưới
  const banDo = new Map();
  const RE = /^<a id="([^"]+)"><\/a>\s*\n+\s*#{1,6}\s+(.+?)\s*$/gm;
  let m;
  while ((m = RE.exec(md)) !== null) banDo.set(m[1], slugTieuDe(m[2]));

  return (
    md
      // 2. gỡ mọi thẻ neo (cả dòng, kể cả cái không có tiêu đề theo sau)
      .replace(/^[ \t]*<a id="[^"]*"><\/a>[ \t]*\n?/gm, "")
      // 3. link nội bộ → slug tiêu đề; không ánh xạ được thì bỏ link, giữ chữ
      .replace(/\[([^\]]+)\]\(#([a-zA-Z0-9_-]+)\)/g, (all, chu, neo) =>
        banDo.has(neo) ? `[${chu}](#${banDo.get(neo)})` : chu,
      )
      // 4. `<br>` chỉ nằm trong ô bảng — markdown không có cách xuống dòng trong ô,
      //    nên đổi thành dấu phân cách đọc được.
      .replace(/<br\s*\/?>/gi, " · ")
      .trim()
  );
}

/** Cắt một chuỗi markdown thành các đoạn theo regex mốc có group(1) là khoá. */
function catTheoMoc(md, re) {
  const moc = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(md)) !== null) moc.push({ khoa: m[1], ten: m[2], dau: m.index });
  return moc.map((x, i) => ({
    khoa: x.khoa,
    ten: x.ten,
    noiDung: md.slice(x.dau, i + 1 < moc.length ? moc[i + 1].dau : md.length).trim(),
  }));
}

/** Tách một dòng bảng markdown thành mảng ô, bỏ `|` mép và khoảng trắng thừa. */
function tachO(dong) {
  const t = dong.trim().replace(/^\|/, "").replace(/\|$/, "");
  return t.split("|").map((o) => o.trim());
}

const LA_NGAN_CACH = (dong) => /^\|?[\s:|-]*-[\s:|-]*\|?$/.test(dong.trim()) && dong.includes("-");

/**
 * Bóc mọi bảng dữ kiện trong một nhóm của Phần 1.
 *
 * Cột KHÔNG cố định: nhóm A–J dùng 6 cột (Mã·Dữ kiện·Giá trị·Nguồn·Hạng·Công bố), nhóm K
 * chỉ 4 cột, nhóm L 5 cột, nhóm M lại là bảng "dữ kiện sai". Nên đọc hàng tiêu đề để biết
 * cột nào là gì, thay vì đếm vị trí — thêm/bớt cột sau này không làm hỏng.
 *
 * Nhóm K/L/M **không có cột Công bố / Hạng** vì nhãn nằm ở TIÊU ĐỀ nhóm, kiểu
 * `## L. SUY LUẬN SỐ HỌC (🔵 HẠNG E — NỘI BỘ…)`. Nên lấy nhãn của nhóm làm mặc định
 * cho mọi dòng trong nhóm đó — nếu không, 30 dòng nhạy cảm nhất của tài liệu lại hiện
 * ra không nhãn, đúng chỗ nguy hiểm nhất.
 */
function bocFact(noiDungNhom, chuNhom, tieuDeNhom) {
  // Tách `SUY LUẬN SỐ HỌC (🔵 HẠNG E — NỘI BỘ…)` → tên sạch + nhãn mặc định của nhóm.
  const ngoac = tieuDeNhom.match(/\((.*)\)\s*$/);
  const tenNhom = tieuDeNhom.replace(/\s*\(.*\)\s*$/, "").trim();
  const macDinhCongBo = ngoac ? (ngoac[1].match(NHAN_CONG_BO)?.[0] ?? "") : "";
  const macDinhHang = ngoac ? ((ngoac[1].match(/HẠNG\s+([A-EX])\b/) || [])[1] ?? "") : "";

  const dong = noiDungNhom.split("\n");
  const ra = [];
  let cot = null;

  for (let i = 0; i < dong.length; i++) {
    const d = dong[i];
    if (!d.trim().startsWith("|")) { cot = null; continue; }

    // Hàng tiêu đề: hàng kế tiếp là hàng ngăn cách `|---|---|`.
    if (cot === null) {
      if (i + 1 < dong.length && LA_NGAN_CACH(dong[i + 1])) {
        const ten = tachO(d).map((x) => x.toLowerCase());
        cot = {
          ma: ten.findIndex((x) => x === "mã"),
          duKien: ten.findIndex((x) => x.startsWith("dữ kiện") || x.startsWith("suy luận")),
          giaTri: ten.findIndex((x) => x.startsWith("giá trị")),
          nguon: ten.findIndex((x) => x.startsWith("nguồn") || x.startsWith("cơ sở")),
          hang: ten.findIndex((x) => x.startsWith("hạng")),
          congBo: ten.findIndex((x) => x.startsWith("công bố")),
        };
        i++; // nhảy qua hàng ngăn cách
      }
      continue;
    }

    const o = tachO(d);
    const ma = cot.ma >= 0 ? o[cot.ma] : undefined;
    if (!ma || !MA_FACT.test(ma)) continue;

    const lay = (idx) => (idx >= 0 && idx < o.length ? o[idx] : "");
    const oHang = lay(cot.hang);
    const oCongBo = lay(cot.congBo);
    ra.push({
      ma: ma.replace(/`/g, ""),
      nhom: chuNhom,
      tenNhom,
      duKien: lay(cot.duKien),
      giaTri: lay(cot.giaTri),
      nguon: lay(cot.nguon),
      // `hang` = mã để lọc; `hangGoc` = nguyên văn, vì có ô ghi "mâu thuẫn" thay vì một chữ.
      hang: (oHang.match(MA_HANG) || [])[1] ?? macDinhHang,
      hangGoc: oHang,
      // Ưu tiên ô "Công bố"; không có thì lấy nhãn mặc định của nhóm (K/L/M).
      congBo: oCongBo.match(NHAN_CONG_BO)?.[0] ?? macDinhCongBo,
    });
  }
  return ra;
}

/** Đọc một thư mục sản phẩm → object đầy đủ, hoặc null nếu thiếu file bắt buộc. */
function docSanPham(ma) {
  const thuMuc = path.join(NGUON, ma);
  const fThe = path.join(thuMuc, "san-pham.json");
  const fPkb = path.join(thuMuc, "pkb.md");
  if (!existsSync(fThe) || !existsSync(fPkb)) {
    console.warn(`⚠️  Bỏ qua "${ma}" — thiếu san-pham.json hoặc pkb.md`);
    return null;
  }

  const the = JSON.parse(readFileSync(fThe, "utf8"));
  // Dọn HTML thô NGAY, trước khi cắt phần và bóc bảng — để cả trang đọc lẫn bảng tra
  // đều sạch, không phải dọn hai lần ở hai chỗ rồi lệch nhau.
  const md = donDep(readFileSync(fPkb, "utf8"));

  const doanPhan = catTheoMoc(md, MOC_PHAN);
  // Phần đầu file (trước `# PHẦN 0`) là bìa + mục lục — giữ riêng làm phần mở đầu.
  const dauTien = doanPhan.length ? md.indexOf(doanPhan[0].noiDung) : md.length;
  const bia = md.slice(0, dauTien).trim();

  const phan = [];
  for (const meta of PHAN) {
    const found = doanPhan.find((d) => Number(d.khoa) === meta.so);
    phan.push({
      ...meta,
      coNoiDung: Boolean(found),
      // Mục lục dài của file gốc không cần lặp lại trong từng trang.
      noiDung: found ? found.noiDung : "",
    });
  }

  // Bảng dữ kiện chỉ nằm ở Phần 1.
  const p1 = phan.find((p) => p.so === 1);
  const facts = [];
  if (p1?.noiDung) {
    for (const nhom of catTheoMoc(p1.noiDung, MOC_NHOM)) {
      facts.push(...bocFact(nhom.noiDung, nhom.khoa, nhom.ten));
    }
  }

  const trung = facts.map((f) => f.ma).filter((m, i, a) => a.indexOf(m) !== i);
  if (trung.length) console.warn(`⚠️  ${ma}: mã dữ kiện bị TRÙNG → ${[...new Set(trung)].join(", ")}`);

  return { ...the, ma, bia, phan, facts };
}

/* ---------------- chạy ---------------- */

if (!existsSync(NGUON)) {
  console.error(`Không thấy thư mục nội dung: ${NGUON}`);
  process.exit(1);
}

const maList = readdirSync(NGUON, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
  .map((d) => d.name)
  .sort();

const sanPham = maList.map(docSanPham).filter(Boolean);
if (!sanPham.length) {
  console.error("Không đọc được sản phẩm nào — dừng để khỏi ghi đè file đang dùng bằng mảng rỗng.");
  process.exit(1);
}

/* ---------- tài liệu dạng trang cho các khu không phải Sản phẩm ---------- */

/**
 * Frontmatter tối giản: mỗi dòng `khoá: <JSON>`. Cố ý KHÔNG dùng YAML đầy đủ — thêm một gói
 * chỉ để đọc 5 khoá là không đáng, mà YAML còn có bẫy (Na, yes/no bị hiểu thành boolean).
 */
function bocFrontmatter(md) {
  if (!md.startsWith("---")) return [{}, md];
  const het = md.indexOf("\n---", 3);
  if (het < 0) return [{}, md];
  const fm = {};
  for (const dong of md.slice(3, het).split("\n")) {
    const m = dong.match(/^([A-Za-zÀ-ỹ0-9_]+):\s*(.+)$/);
    if (!m) continue;
    try {
      fm[m[1]] = JSON.parse(m[2]);
    } catch {
      fm[m[1]] = m[2].trim();
    }
  }
  return [fm, md.slice(het + 4).trim()];
}

function docTaiLieu() {
  if (!existsSync(NGUON_TL)) return [];
  return readdirSync(NGUON_TL, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
    .map((d) => {
      const bai = readdirSync(path.join(NGUON_TL, d.name))
        .filter((f) => f.endsWith(".md"))
        .map((f) => {
          const [fm, noiDung] = bocFrontmatter(readFileSync(path.join(NGUON_TL, d.name, f), "utf8"));
          return {
            slug: f.replace(/\.md$/, ""),
            tieuDe: fm.tieuDe ?? f.replace(/\.md$/, ""),
            hang: fm.hang ?? "",
            nhom: fm.nhom ?? "",
            nguon: fm.nguon ?? "",
            thuTu: Number(fm.thuTu ?? 999),
            noiDung: donDep(noiDung),
          };
        })
        .sort((a, b) => a.thuTu - b.thuTu || a.tieuDe.localeCompare(b.tieuDe, "vi"));
      return { khu: d.name, bai };
    })
    .filter((k) => k.bai.length > 0)
    .sort((a, b) => a.khu.localeCompare(b.khu));
}

const taiLieu = docTaiLieu();

mkdirSync(path.dirname(DICH), { recursive: true });
writeFileSync(
  DICH,
  `// ⚠️ FILE SINH TỰ ĐỘNG — KHÔNG SỬA TAY.
// Sinh bởi: tools/scripts/sync-wiki-sanpham.mjs  ·  chạy: npm --prefix apps/web run sync:wiki
// Sửa nội dung ở: apps/web/content/wiki/san-pham/<mã>/pkb.md
//                 apps/web/content/wiki/tai-lieu/<khu>/<bài>.md

import type { KhuTaiLieu, SanPham } from "../kieu";

export const SAN_PHAM: SanPham[] = ${JSON.stringify(sanPham, null, 2)};

export const TAI_LIEU: KhuTaiLieu[] = ${JSON.stringify(taiLieu, null, 2)};
`,
  "utf8",
);

for (const sp of sanPham) {
  const thieu = sp.phan.filter((p) => !p.coNoiDung).map((p) => p.so);
  console.log(
    `✓ ${sp.ma.padEnd(10)} ${String(sp.facts.length).padStart(4)} dữ kiện · ` +
      `${sp.phan.filter((p) => p.coNoiDung).length}/10 phần` +
      (thieu.length ? ` · thiếu phần ${thieu.join(", ")}` : ""),
  );
}
console.log(`\n→ ${path.relative(REPO, DICH)}`);

for (const k of taiLieu) {
  console.log(`✓ ${k.khu.padEnd(18)} ${String(k.bai.length).padStart(3)} bài tài liệu`);
}
