/** Phần thuần của scripts/pancake-luot.ts (parser env, tham số, sổ đếm ngày, cấu hình ép chế độ) — để test được không cần dịch vụ thật. */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { docCauHinh, type CauHinh } from "./cau-hinh.ts";

/** `KEY=VALUE` như GWT-ERP _env.mjs: giá trị bọc nháy lấy nguyên văn tới nháy đóng, giá trị trần cắt ` # …`. */
export function docEnvText(raw: string): Record<string, string> {
  const ket: Record<string, string> = {};
  for (const dong of raw.split(/\r?\n/)) {
    const sach = dong.trim();
    if (!sach || sach.startsWith("#")) continue;
    const dau = sach.indexOf("=");
    if (dau === -1) continue;
    const ten = sach.slice(0, dau).trim();
    let gia = sach.slice(dau + 1).trim();
    const nhay = gia[0] === '"' || gia[0] === "'" ? gia[0] : null;
    if (nhay) {
      const dong2 = gia.indexOf(nhay, 1);
      gia = dong2 === -1 ? gia.slice(1) : gia.slice(1, dong2);
    } else gia = gia.replace(/\s+#.*$/, "").trim();
    if (ten) ket[ten] = gia;
  }
  return ket;
}

export const docEnvFile = (duongDan: string) => docEnvText(readFileSync(duongDan, "utf8"));

export const docThamSo = (argv: string[]) => ({ kho: argv.includes("--kho") });

/** `--kho` ép chế độ `thu` bất kể env (chạy khô, không bao giờ dựng cửa gửi). */
export function docCauHinhChay(env: Record<string, string | undefined>, kho: boolean): { ch: CauHinh } | { loi: string } {
  return docCauHinh(kho ? { ...env, PANCAKE_TU_GUI: "thu" } : env);
}

export const ngayVn = (now: Date) => new Date(now.getTime() + 7 * 3600_000).toISOString().slice(0, 10);

/** Số hội thoại bot đã gửi hôm nay (giờ VN) cho một page; sang ngày / file hỏng / mất = 0. */
export function taoDem(thuMuc: string, pageId: string, now: () => Date = () => new Date()) {
  const f = join(thuMuc, `pancake-app-dem-${pageId}.json`);
  const doc = (): number => {
    try {
      const j = JSON.parse(readFileSync(f, "utf8")) as { ngay?: unknown; so?: unknown };
      return j.ngay === ngayVn(now()) && Number.isInteger(j.so) && (j.so as number) >= 0 ? (j.so as number) : 0;
    } catch { return 0; }
  };
  const tang = () => {
    try { // không ném: ném sau khi đã gửi sẽ mất dòng báo Discord + khoá lượt (main đã dò thư mục trước vòng lặp)
      mkdirSync(thuMuc, { recursive: true });
      writeFileSync(f, JSON.stringify({ ngay: ngayVn(now()), so: doc() + 1 }));
    } catch { /* bỏ qua */ }
  };
  return { doc, tang };
}

/** Dò thư mục sổ đếm ghi được không (thiếu thì tạo). Hỏng → trần/ngày sẽ mở toang, nên main dừng. */
export function doThuMucDem(thuMuc: string): boolean {
  try {
    mkdirSync(thuMuc, { recursive: true });
    const f = join(thuMuc, ".do-ghi");
    writeFileSync(f, "");
    rmSync(f);
    return true;
  } catch { return false; }
}

/** Nạp env từ file vào `dich` (process.env): biến đã có sẵn (đặt inline / launchd) THẮNG file; trong file, dòng sau thắng dòng trước. */
export function napEnv(dich: Record<string, string | undefined>, file: Record<string, string>): void {
  for (const [k, v] of Object.entries(file)) if (!(k in dich)) dich[k] = v;
}

/** Cửa gửi chỉ có khi chế độ hiệu lực là `bat` (`--kho` đã ép `thu` trong docCauHinhChay). */
export function chonGui<G extends { gui: unknown }>(cheDo: CauHinh["cheDo"], pageId: string, token: string, taoGui: (id: string, token: string) => G): G["gui"] | undefined {
  return cheDo === "bat" ? taoGui(pageId, token).gui : undefined;
}
