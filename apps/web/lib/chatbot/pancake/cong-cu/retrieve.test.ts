import { describe, expect, it, vi } from "vitest";

import { CONFIG } from "./config.ts";
import { retrieveChunks } from "./retrieve.ts";
import type { RpcFn } from "./retrieve.ts";

function vector(): number[] {
  return Array.from({ length: CONFIG.EMBED_DIM }, () => 0.1);
}
const nhungGia = (async () => [vector()]) as never;

function rpcTraVe(rows: unknown[]) {
  return vi.fn<RpcFn>(async () => ({ data: rows, error: null }));
}

const HANG = [{
  chunk_id: "c1",
  document_id: "d1",
  document_title: "CTS10",
  content: "Trọng lượng: 15.2kg",
  metadata: { headingPath: ["CTS10", "Thông số"] },
  score: 0.0164,
}];

describe("retrieveChunks", () => {
  it("nhúng câu hỏi với vai trò 'query'", async () => {
    const embed = vi.fn(async () => [vector()]);
    await retrieveChunks("CTS10 nặng bao nhiêu", 8, rpcTraVe(HANG), embed as never);
    expect(embed).toHaveBeenCalledWith(["CTS10 nặng bao nhiêu"], undefined, "query");
  });

  // Ca này ghim lỗi đã tốn cả buổi để tìm ra. Cột `tsv` của `chunks`
  // sinh từ `content_search`, tức bản ĐÃ BỎ DẤU. Truyền câu hỏi nguyên dấu thì
  // nhánh tìm theo từ khoá chết ÂM THẦM — không lỗi, không cảnh báo, chỉ là
  // điểm RRF biến thành hằng số và mọi câu hỏi trông giống hệt nhau.
  it("truyền p_query_text ĐÃ BỎ DẤU", async () => {
    const rpc = rpcTraVe(HANG);
    await retrieveChunks("CTS10 nặng bao nhiêu kg?", 8, rpc, nhungGia);
    expect(rpc.mock.calls[0][1].p_query_text).toBe("cts10 nang bao nhieu kg?");
  });

  it("truyền đúng topK", async () => {
    const rpc = rpcTraVe(HANG);
    await retrieveChunks("x", 5, rpc, nhungGia);
    expect(rpc.mock.calls[0][1].p_match_count).toBe(5);
  });

  it("gọi đúng tên RPC", async () => {
    const rpc = rpcTraVe(HANG);
    await retrieveChunks("x", 8, rpc, nhungGia);
    expect(rpc.mock.calls[0][0]).toBe("match_chunks_hybrid");
  });

  it("đổi hàng DB thành RetrievedChunk, lấy headingPath từ metadata", async () => {
    const ket = await retrieveChunks("x", 8, rpcTraVe(HANG), nhungGia);
    expect(ket.chunks).toHaveLength(1);
    expect(ket.chunks[0]).toMatchObject({
      chunkId: "c1",
      documentTitle: "CTS10",
      headingPath: ["CTS10", "Thông số"],
      score: 0.0164,
    });
  });

  it("chunk wiki: lấy hạng từ metadata.hang; không có → null", async () => {
    const coHang = await retrieveChunks("x", 8, rpcTraVe([{ ...HANG[0], metadata: { headingPath: ["A"], hang: "D" } }]), nhungGia);
    expect(coHang.chunks[0].hang).toBe("D");
    const khong = await retrieveChunks("x", 8, rpcTraVe(HANG), nhungGia);
    expect(khong.chunks[0].hang).toBeNull();
  });

  it("metadata thiếu headingPath → mảng rỗng, không ném", async () => {
    const ket = await retrieveChunks("x", 8,
      rpcTraVe([{ ...HANG[0], metadata: null }]), nhungGia);
    expect(ket.chunks[0].headingPath).toEqual([]);
  });

  it("headingPath lẫn phần tử không phải chuỗi thì lọc bỏ", async () => {
    const ket = await retrieveChunks("x", 8,
      rpcTraVe([{ ...HANG[0], metadata: { headingPath: ["CTS10", 42, null] } }]), nhungGia);
    expect(ket.chunks[0].headingPath).toEqual(["CTS10"]);
  });

  it("bỏ hàng có metadata.chiNv === true (xử lý sự cố chỉ NV dùng); không đổi topK gửi RPC", async () => {
    const rpc = rpcTraVe([
      HANG[0],
      { ...HANG[0], chunk_id: "c2", metadata: { headingPath: ["Xử lý sự cố – Máy", "A"], chiNv: true } },
      { ...HANG[0], chunk_id: "c3", metadata: { headingPath: ["Bảo hành"], chiNv: false } },
    ]);
    const ket = await retrieveChunks("x", 8, rpc, nhungGia);
    expect(ket.chunks.map((c) => c.chunkId)).toEqual(["c1", "c3"]);
    expect(rpc.mock.calls[0][1].p_match_count).toBe(8);
  });

  it("RPC lỗi → ném RetrieveError có mã", async () => {
    const rpc = vi.fn<RpcFn>(async () => ({ data: null, error: { message: "boom" } }));
    await expect(retrieveChunks("x", 8, rpc, nhungGia))
      .rejects.toMatchObject({ code: "RETRIEVE_RPC_FAILED" });
  });

  it("truy hồi ra 0 đoạn KHÔNG phải lỗi", async () => {
    const ket = await retrieveChunks("x", 8, rpcTraVe([]), nhungGia);
    expect(ket.chunks).toEqual([]);
  });

  it("trả về thời gian hai chặng", async () => {
    const ket = await retrieveChunks("x", 8, rpcTraVe(HANG), nhungGia);
    expect(ket.embedMs).toBeGreaterThanOrEqual(0);
    expect(ket.retrieveMs).toBeGreaterThanOrEqual(0);
  });
});
