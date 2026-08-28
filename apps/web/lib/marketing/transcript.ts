/**
 * Bóc transcript của `video_analyses` thành cấu trúc dùng được.
 *
 * Định dạng chuẩn của repo (xem CLAUDE.md mục transcript `[V]`/`[T]`):
 *   [V 0.0-3.5] lời thoại (STT)
 *   [T 0-4]     chữ on-screen (đọc frame)
 * Video ngoại ngữ ghi song ngữ trên cùng dòng:  <nguyên văn> ‖ VI: <bản dịch>
 */

export type Cue = {
  kind: "V" | "T";
  start: number;
  end: number;
  /** Nguyên văn (với video tiếng Việt thì đây chính là tiếng Việt). */
  text: string;
  /** Bản dịch tiếng Việt — chỉ có ở video ngoại ngữ. */
  vi?: string;
};

const LINE = /^\[([VT])\s+([\d.]+)\s*-\s*([\d.]+)\]\s*(.*)$/;

export function parseTranscript(raw: string | null | undefined): Cue[] {
  if (!raw) return [];
  const cues: Cue[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const m = line.trim().match(LINE);
    if (!m) continue;
    const [, kind, a, b, rest] = m;
    const parts = rest.split("‖");
    const text = parts[0].trim();
    const viPart = parts.slice(1).join("‖").trim();
    const vi = viPart.replace(/^VI:\s*/i, "").trim();
    cues.push({
      kind: kind as "V" | "T",
      start: Number(a),
      end: Number(b),
      text,
      ...(vi ? { vi } : {}),
    });
  }
  return cues.sort((x, y) => x.start - y.start || (x.kind === "V" ? -1 : 1));
}

/** Text để dò từ khoá: ưu tiên bản dịch tiếng Việt nếu có. */
const searchable = (c: Cue) => `${c.vi ?? ""} ${c.text}`;

export type CtaKind = "save" | "watch_end" | "like" | "follow" | "share" | "comment" | "dm";

export const CTA_LABEL: Record<CtaKind, string> = {
  save: "Kêu LƯU / SAVE",
  watch_end: "Kêu XEM ĐẾN CUỐI",
  like: "Kêu LIKE / thả tim",
  follow: "Kêu THEO DÕI / đăng ký",
  share: "Kêu CHIA SẺ",
  comment: "Kêu BÌNH LUẬN",
  dm: "Kêu NHẮN TIN / để lại thông tin",
};

/**
 * Từ khoá dò CTA. Chỉ nhận cụm có tính KÊU GỌI người xem — cố ý không bắt từ đơn như "lưu"
 * (dễ dính "lưu lượng", "lưu ý") hay "thích" (dính "mình thích trà").
 */
const CTA_RULES: { kind: CtaKind; re: RegExp }[] = [
  { kind: "save", re: /((lưu|cất|ghim)\s*(lại|video|clip)|save\s*(lại|video|this)?|收藏)/i },
  {
    kind: "watch_end",
    re: /(xem\s*(đến|tới)\s*(hết|cuối)|xem\s*hết\s*(video|clip)|đừng\s*(bỏ|lướt)\s*qua|khoan\s*(đã|lướt)|nán\s*lại|ở\s*lại\s*(đến|tới)\s*cuối|看到最后|别划走)/i,
  },
  {
    kind: "like",
    re: /((nhấn|thả|bấm|cho)\s*(thích|like|tim)|một\s*like|点赞|ủng\s*hộ\s*(mình|nhạn|kênh|em|shop|tụi))/i,
  },
  {
    kind: "follow",
    re: /(theo\s*dõi\s*(kênh|mình|page|em|nhé|để)|đăng\s*ký\s*kênh|follow\s*(mình|kênh|page)|bấm\s*theo\s*dõi|关注)/i,
  },
  {
    // "chia sẻ" một mình quá rộng (vd "người ta chia sẻ cách sửa") → bắt buộc có lời mời
    // hoặc tân ngữ là chính video này.
    kind: "share",
    re: /((hãy|nhớ|đừng\s*quên|nên|nhớ\s*là)\s*(chia\s*sẻ|share)|(chia\s*sẻ|share|gửi)\s*(video|clip|bài)\s*này|(chia\s*sẻ|gửi)\s*(cho|với|đến)\s*(người\s*thân|bạn\s*bè|gia\s*đình|ai\s*đó|người\s*bạn)|转发)/i,
  },
  {
    kind: "comment",
    re: /(bình\s*luận|comment|để\s*lại\s*(bình\s*luận|ý\s*kiến|câu)|các\s*bạn\s*(thấy|nghĩ)\s*(sao|thế\s*nào|có\s*đúng)|bạn\s*nghĩ\s*sao|评论)/i,
  },
  {
    kind: "dm",
    re: /(nhắn\s*tin|inbox|nhắn\s*(cho|mình|em)|để\s*lại\s*(số|sđt|thông\s*tin|tuổi|tình\s*trạng)|liên\s*hệ\s*(mình|em|shop|ngay)|私信)/i,
  },
];

/**
 * Hai lớp lọc để chỉ giữ lời KÊU GỌI thật, bỏ câu KỂ có cùng từ khoá.
 * (Đã soi tay toàn bộ 38 transcript thật để chỉnh 2 danh sách này.)
 */

/** Câu kể lại việc người khác đã làm → không phải kêu gọi người xem. */
const NARRATIVE =
  /(người\s*ta|họ\s+|anh\s*(ấy|nói)|chị\s*(ấy|nói)|cô\s*ấy|ông\s*ấy|bà\s*ấy|nó\s+(chia|lưu|comment)|nhiều\s*(người|bạn)\s*(hỏi|nhắn|bình\s*luận|comment|theo\s*dõi)|có\s*(người|bạn)\s*(hỏi|nhắn)|trả\s*lời\s*bình\s*luận|đã\s*luôn|từng\s*(nhắn|hỏi))/i;

/** Dấu hiệu đây là lời mời gọi người xem (mệnh lệnh / xưng hô ngôi 2 / tiểu từ cuối câu). */
const APPEAL =
  /(hãy|nhớ|đừng\s*(quên|bỏ|lướt)|nhấn|bấm|thả|ấn|để\s*lại|cho\s*(mình|em|tôi)\s*(xin|biết)|nhé|nhá|nha|nhen|anh\s*em\s*mình|các\s*bạn\s*(hãy|nhớ|nghĩ|thấy|đừng|có)|bạn\s*(hãy|nhớ|nghĩ)|comment\s*(là|ở|bên|cho|\d)|留言|请|一定要)/i;

/**
 * Hai loại này tự thân đã ở dạng mệnh lệnh ("theo dõi kênh…", "xem đến cuối…")
 * nên không cần thêm dấu hiệu mời gọi.
 */
const SELF_IMPERATIVE: CtaKind[] = ["follow", "watch_end"];

export type CtaHit = { kind: CtaKind; cue: Cue };

export type Extract = {
  /** Câu mở đầu — cửa ải 3 giây (theo rules/video-ads-general.md hook = 1–3s). */
  hook: Cue[];
  /** Chữ on-screen xuất hiện ngay đầu video (frame 0) — thường là hook thị giác. */
  hookOnScreen: Cue[];
  /** Câu kết — nhịp chốt cuối. */
  ending: Cue[];
  /** Các câu kêu gọi hành động, kèm loại. */
  ctas: CtaHit[];
  /** Tổng thời lượng suy ra từ mốc cuối cùng (giây). */
  duration: number;
  counts: { v: number; t: number };
};

const HOOK_WINDOW = 3.5; // giây — cửa ải 3s, nới nhẹ để không cắt cụt câu đầu
const END_WINDOW = 6; // giây cuối

export function extractHighlights(cues: Cue[]): Extract {
  const v = cues.filter((c) => c.kind === "V");
  const t = cues.filter((c) => c.kind === "T");
  const duration = cues.reduce((m, c) => Math.max(m, c.end), 0);

  // Hook: mọi câu thoại bắt đầu trong cửa ải 3s; nếu câu đầu dài quá thì vẫn lấy nó.
  let hook = v.filter((c) => c.start < HOOK_WINDOW);
  if (!hook.length && v.length) hook = [v[0]];

  // Kết: các câu thoại nằm trong 6s cuối, tối đa 3 câu; luôn có ít nhất câu cuối.
  let ending = v.filter((c) => c.end >= duration - END_WINDOW && c.start > HOOK_WINDOW);
  if (ending.length > 3) ending = ending.slice(-3);
  if (!ending.length && v.length) ending = [v[v.length - 1]];

  // CTA: quét cả lời thoại lẫn chữ on-screen; mỗi cue chỉ nhận loại khớp đầu tiên.
  const ctas: CtaHit[] = [];
  for (const c of cues) {
    const hay = searchable(c);
    if (NARRATIVE.test(hay)) continue;
    const rule = CTA_RULES.find((r) => r.re.test(hay));
    if (!rule) continue;
    if (!SELF_IMPERATIVE.includes(rule.kind) && !APPEAL.test(hay)) continue;
    ctas.push({ kind: rule.kind, cue: c });
  }

  // Chữ on-screen ở frame đầu (mốc bắt đầu = 0) — hook thị giác.
  const hookOnScreen = t.filter((c) => c.start <= 0.5);

  return { hook, hookOnScreen, ending, ctas, duration, counts: { v: v.length, t: t.length } };
}

export function extractFrom(raw: string | null | undefined): Extract {
  return extractHighlights(parseTranscript(raw));
}

/** 92.4 → "1:32" */
export function ts(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
