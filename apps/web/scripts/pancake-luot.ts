/**
 * Chạy MỘT lượt bot Pancake cho mọi page: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON apps/web/scripts/pancake-luot.ts [--kho]`
 * Env từ file `ENV_FILE` (nếu đặt) chồng lên process.env. Stdout: đúng một dòng JSON mỗi page; thoát 1 nếu có `loi`.
 * Chỉ in số đếm và mã ngắn — không bao giờ in chữ khách, SĐT, khoá.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { chonGui, docCauHinhChay, docEnvFile, docThamSo, doThuMucDem, napEnv, taoDem } from "../lib/chatbot/pancake/chay-script.ts";

const in1 = (o: unknown) => console.log(JSON.stringify(o));

async function main(): Promise<number> {
  const { kho } = docThamSo(process.argv.slice(2));
  // Nạp file vào process.env TRƯỚC khi import module bot: embedding.ts đọc OPENAI_API_KEY/EMBED_* từ process.env (EMBED_* lúc import). Inline thắng file.
  if (process.env.ENV_FILE) napEnv(process.env, docEnvFile(process.env.ENV_FILE));
  const env: Record<string, string | undefined> = process.env;
  const r = docCauHinhChay(env, kho);
  if ("loi" in r) { in1({ loi: r.loi }); return 1; }
  const { ch } = r;
  if (ch.cheDo === "tat") { in1({ viec: "tat" }); return 0; }

  if (!doThuMucDem(ch.demDir)) { in1({ loi: "DEM_DIR_HONG" }); return 1; }
  const [{ taoBao }, { goiClaudeJson, goiClaudeCongCu }, { taoCongCuTra }, { taoPancake }, { taoGuiKhach }, { taoKhoPancake }, { chayMotLuot }, { goiGpt }, { phanLoai, SCHEMA_PHAN_LOAI }, { soanTuTra }] = await Promise.all([
    import("../lib/chatbot/pancake/bao.ts"), import("../lib/chatbot/pancake/claude.ts"), import("../lib/chatbot/pancake/cong-cu/cong-cu-tra.ts"),
    import("../lib/chatbot/pancake/doc.ts"), import("../lib/chatbot/pancake/gui-khach.ts"), import("../lib/chatbot/pancake/kho.ts"),
    import("../lib/chatbot/pancake/luot.ts"), import("../lib/chatbot/pancake/openai.ts"), import("../lib/chatbot/pancake/phan-loai.ts"),
    import("../lib/chatbot/pancake/tu-tra.ts"),
  ]);
  const sb = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, { db: { schema: "chatbot" }, auth: { persistSession: false } }) as unknown as SupabaseClient; // kho/công cụ gõ kiểu schema "public"; schema thật đặt ở db.schema
  const khoPancake = taoKhoPancake(sb);
  const congCu = taoCongCuTra(sb);
  const bao = taoBao(ch.webhook, fetch, ch.baoThread);
  const goiPhanLoai = (system: string, user: string) =>
    goiClaudeJson({ apiKey: env.ANTHROPIC_API_KEY!, model: ch.modelPhanLoai, system, user, schema: SCHEMA_PHAN_LOAI, maxTokens: 600 });
  // Model soạn trả lời: "claude-…" (anh Dũng chốt 2026-11-26: claude-haiku-5-5) đi Anthropic, còn lại đi OpenAI như trước.
  const goiTraLoi = (messages: unknown[], tools: unknown[]) => (ch.modelTraLoi.startsWith("claude-")
    ? goiClaudeCongCu({ apiKey: env.ANTHROPIC_API_KEY!, model: ch.modelTraLoi, messages, tools })
    : goiGpt({ apiKey: env.OPENAI_API_KEY!, model: ch.modelTraLoi, messages, tools }));

  let coLoi = false;
  for (const t of ch.trang) {
    const kq = await chayMotLuot({
      pageId: t.id, tenKenh: t.ten,
      pancake: taoPancake(t.id, t.token),
      // cửa gửi chỉ dựng khi chế độ hiệu lực là bat (--kho đã ép thu)
      gui: chonGui(ch.cheDo, t.id, t.token, taoGuiKhach),
      kho: khoPancake,
      phanLoai: (tin, coSdt, lichSu, tenKhach) => phanLoai(tin, coSdt, lichSu, goiPhanLoai, tenKhach),
      soan: (l) => soanTuTra(l, { congCu, hotline: ch.hotline, goi: goiTraLoi }),
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
