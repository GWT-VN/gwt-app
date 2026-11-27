// chép từ GWT-ERP lib/chatbot/retrieval/text-normalize.ts @c2f3719
/**
 * Diacritics-stripped, lowercased, whitespace-collapsed form of `text`.
 * Shared, pure normalization for full-text-search QUERY text — it must
 * match candidate rows' own `content_search` transform exactly, since this
 * is what feeds `chatbot_compare_chunk_run`'s
 * `plainto_tsquery('simple', p_query_text)` match against the
 * `content_search`-derived `tsv` column.
 *
 * Deliberately has NO imports (no `server-only`, no DB, no network) so both
 * `lib/db/chunk-runs.ts` (a `server-only` DAL, `queryChunkRun`) and
 * `scripts/evaluate-chunk-runs.ts` (a standalone tsx script that CANNOT
 * import `server-only`-tainted modules — see that script's file header) can
 * import this single implementation instead of maintaining duplicate
 * copies that could silently drift apart.
 *
 * Structurally the same transform as `lib/chunking/primitives.ts`'s private
 * `toSearchText` (which builds `content_search` at chunk-write time, not
 * query time) — kept as a separate, deliberately unexported helper there
 * since unifying it too is out of this file's scope.
 */
export function normalizeForFullTextSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
