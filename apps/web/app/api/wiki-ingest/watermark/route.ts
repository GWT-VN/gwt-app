import { NextResponse } from 'next/server'
import { dataClient } from '@/lib/nen-tang/db'
import { kiemBearer } from '@/lib/wiki-ingest/xu-ly'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Routine hỏi "lần trước quét tới tin nào" trước khi gọi Discord `after=` — trả { [kenh_id]: last_message_id }. */
export async function GET(req: Request) {
  const gac = kiemBearer(req.headers.get('authorization'), process.env.WIKI_INGEST_SECRET)
  if (gac === 'thieu_env') return NextResponse.json({ error: 'Server chưa cấu hình WIKI_INGEST_SECRET' }, { status: 503 })
  if (gac === 'sai') return NextResponse.json({ error: 'Sai bearer' }, { status: 401 })
  const { data, error } = await dataClient().rpc('wiki_watermark_get', {})
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? {}, { headers: { 'Cache-Control': 'no-store' } })
}
