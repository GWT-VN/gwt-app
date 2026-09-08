import { describe, it, expect } from 'vitest'
import { kiemBearer, xuLyIngest, type Rpc } from './xu-ly'
import type { ItemIngest, ThanIngest } from './kiem-tra'

const item = (id: string, phan: Partial<ItemIngest> = {}): ItemIngest => ({
  message_id: id, thread_id: null, cau_hoi: 'Hỏi?', tra_loi: 'Đáp.', nguoi_tra_loi: 'A', tra_loi_luc: null,
  jump_link: `https://discord.com/channels/1/2/${id}`, nguon_ids: [id], khu_goi_y: 'sales', do_tin_cay: 0.9, ...phan,
})
const than = (items: ItemIngest[], watermark_moi: string | null = '1000000000000000099'): ThanIngest => ({ kenh_id: '1000000000000000001', watermark_moi, items })

function rpcGia(tra: Record<string, unknown> = {}) {
  const goi: { fn: string; args: Record<string, unknown> }[] = []
  const rpc: Rpc = async (fn, args) => { goi.push({ fn, args }); if (fn in tra && tra[fn] instanceof Error) throw tra[fn]; return tra[fn] ?? { them: (args.p_items as unknown[])?.length ?? 0, bo_qua: 0 } }
  return { rpc, goi }
}

describe('kiemBearer', () => {
  it('đúng secret → ok; sai/thiếu header → sai; thiếu env → thieu_env', () => {
    expect(kiemBearer('Bearer abc', 'abc')).toBe('ok')
    expect(kiemBearer('bearer abc', 'abc')).toBe('ok')
    expect(kiemBearer('Bearer abd', 'abc')).toBe('sai')
    expect(kiemBearer('Bearer ab', 'abc')).toBe('sai')
    expect(kiemBearer(null, 'abc')).toBe('sai')
    expect(kiemBearer('Basic abc', 'abc')).toBe('sai')
    expect(kiemBearer('Bearer abc', undefined)).toBe('thieu_env')
    expect(kiemBearer('Bearer abc', '')).toBe('thieu_env')
  })
})

describe('xuLyIngest', () => {
  it('item sạch → wiki_ingest_nhan, dời watermark, ghi run', async () => {
    const { rpc, goi } = rpcGia({ wiki_ingest_nhan: { them: 1, bo_qua: 1 } })
    const kq = await xuLyIngest(than([item('1000000000000000011'), item('1000000000000000012')]), rpc)
    expect(kq).toEqual({ them: 1, bo_qua_trung: 1, tu_choi_pii: [] })
    expect(goi.map((g) => g.fn)).toEqual(['wiki_ingest_nhan', 'wiki_watermark_set', 'wiki_ingest_run_ghi'])
    expect(goi[1].args).toEqual({ p_kenh_id: '1000000000000000001', p_message_id: '1000000000000000099' })
    expect(goi[2].args).toEqual({ p_kenh_id: '1000000000000000001', p_received: 2, p_inserted: 1, p_skipped: 1, p_rejected: 0 })
  })
  it('item còn PII bị loại, KHÔNG gửi vào DB, có trong tu_choi_pii; run đếm rejected', async () => {
    const { rpc, goi } = rpcGia()
    const kq = await xuLyIngest(than([item('1000000000000000011', { tra_loi: 'gọi 0912345678' }), item('1000000000000000012', { cau_hoi: 'mail a@b.vn?' }), item('1000000000000000013')]), rpc)
    expect(kq.tu_choi_pii).toEqual(['1000000000000000011', '1000000000000000012'])
    expect(kq.them).toBe(1)
    const nhan = goi.find((g) => g.fn === 'wiki_ingest_nhan')!
    expect((nhan.args.p_items as ItemIngest[]).map((i) => i.message_id)).toEqual(['1000000000000000013'])
    expect(goi.at(-1)!.args.p_rejected).toBe(2)
  })
  it('không còn item sạch → không gọi nhan, vẫn dời watermark + ghi run', async () => {
    const { rpc, goi } = rpcGia()
    await xuLyIngest(than([item('1000000000000000011', { tra_loi: '0912345678' })]), rpc)
    expect(goi.map((g) => g.fn)).toEqual(['wiki_watermark_set', 'wiki_ingest_run_ghi'])
  })
  it('watermark_moi null → không set; items rỗng → chỉ ghi run', async () => {
    const { rpc, goi } = rpcGia()
    await xuLyIngest(than([], null), rpc)
    expect(goi.map((g) => g.fn)).toEqual(['wiki_ingest_run_ghi'])
  })
  it('wiki_ingest_nhan lỗi → ném ra, watermark KHÔNG dời', async () => {
    const { rpc, goi } = rpcGia({ wiki_ingest_nhan: new Error('db down') })
    await expect(xuLyIngest(than([item('1000000000000000011')]), rpc)).rejects.toThrow('db down')
    expect(goi.map((g) => g.fn)).toEqual(['wiki_ingest_nhan'])
  })
})
