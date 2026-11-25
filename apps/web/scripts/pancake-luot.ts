/**
 * Chạy MỘT lượt bot Pancake cho mọi page: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON apps/web/scripts/pancake-luot.ts [--kho]`
 * Env từ file `ENV_FILE` (nếu đặt) chồng lên process.env. Stdout: đúng một dòng JSON mỗi page; thoát 1 nếu có `loi`.
 * Chỉ in số đếm và mã ngắn — không bao giờ in chữ khách, SĐT, khoá.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { taoBao } from "../lib/chatbot/pancake/bao.ts";
import { docCauHinhChay, docEnvFile, docThamSo, taoDem } from "../lib/chatbot/pancake/chay-script.ts";
import { goiClaudeJson } from "../lib/chatbot/pancake/claude.ts";
import { taoCongCuTra } from "../lib/chatbot/pancake/cong-cu/cong-cu-tra.ts";
import { taoPancake } from "../lib/chatbot/pancake/doc.ts";
import { taoGuiKhach } from "../lib/chatbot/pancake/gui-khach.ts";
import { taoKhoPancake } from "../lib/chatbot/pancake/kho.ts";
import { chayMotLuot } from "../lib/chatbot/pancake/luot.ts";
import { goiGpt } from "../lib/chatbot/pancake/openai.ts";
import { phanLoai, SCHEMA_PHAN_LOAI } from "../lib/chatbot/pancake/phan-loai.ts";
import { soanTuTra } from "../lib/chatbot/pancake/tu-tra.ts";

const in1 = (o: unknown) => console.log(JSON.stringify(o));

async function main(): Promise<number> {
  const { kho } = docThamSo(process.argv.slice(2));
  const env: Record<string, string | undefined> = { ...process.env, ...(process.env.ENV_FILE ? docEnvFile(process.env.ENV_FILE) : {}) };
  const r = docCauHinhChay(env, kho);
  if ("loi" in r) { in1({ loi: r.loi }); return 1; }
  const { ch } = r;
  if (ch.cheDo === "tat") { in1({ viec: "tat" }); return 0; }

  const sb = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, { db: { schema: "chatbot" }, auth: { persistSession: false } }) as unknown as SupabaseClient; // kho/công cụ gõ kiểu schema "public"; schema thật đặt ở db.schema
  const khoPancake = taoKhoPancake(sb);
  const congCu = taoCongCuTra(sb);
  const bao = taoBao(ch.webhook);
  const goiPhanLoai = (system: string, user: string) =>
    goiClaudeJson({ apiKey: env.ANTHROPIC_API_KEY!, model: ch.modelPhanLoai, system, user, schema: SCHEMA_PHAN_LOAI, maxTokens: 600 });

  let coLoi = false;
  for (const t of ch.trang) {
    const kq = await chayMotLuot({
      pageId: t.id, tenKenh: t.ten,
      pancake: taoPancake(t.id, t.token),
      // cửa gửi chỉ dựng khi chế độ hiệu lực là bat (--kho đã ép thu)
      gui: ch.cheDo === "bat" ? taoGuiKhach(t.id, t.token).gui : undefined,
      kho: khoPancake,
      phanLoai: (tin, coSdt, lichSu) => phanLoai(tin, coSdt, lichSu, goiPhanLoai),
      soan: (l) => soanTuTra(l, { congCu, hotline: ch.hotline, goi: (messages, tools) => goiGpt({ apiKey: env.OPENAI_API_KEY!, model: ch.modelTraLoi, messages, tools }) }),
      bao, ch,
      dem: taoDem(ch.demDir, t.id),
      now: () => new Date(),
    });
    if (kq.loi) coLoi = true;
    in1({ trang: t.id, ...kq });
  }
  return coLoi ? 1 : 0;
}

main().then((c) => { process.exitCode = c; }, () => { in1({ loi: "LOI_KHONG_RO" }); process.exitCode = 1; });
