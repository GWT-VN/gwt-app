import { NextResponse } from 'next/server'
import { dataClient } from '@/lib/nen-tang/db'
import { kiemTraThan, TOI_DA_ITEM } from '@/lib/wiki-ingest/kiem-tra'
import { kiemBearer, xuLyIngest } from '@/lib/wiki-ingest/xu-ly'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TOI_DA_BYTE = 1024 * 1024

/**
 * Cửa duy nhất routine cloud nói chuyện với app (spec §5). Không có session — gác bằng bearer
 * WIKI_INGEST_SECRET (proxy.ts đã miễn đăng nhập cho /api/wiki-ingest). Routine không cầm key DB.
 */
export async function POST(req: Request) {
  const gac = kiemBearer(req.headers.get('authorization'), process.env.WIKI_INGEST_SECRET)
  if (gac === 'thieu_env') return NextResponse.json({ error: 'Server chưa cấu hình WIKI_INGEST_SECRET' }, { status: 503 })
  if (gac === 'sai') return NextResponse.json({ error: 'Sai bearer' }, { status: 401 })
  const dai = Number(req.headers.get('content-length') ?? 0)
  if (dai > TOI_DA_BYTE) return NextResponse.json({ error: `Thân quá ${TOI_DA_BYTE} byte` }, { status: 413 })
  let json: unknown
  try { json = await req.json() } catch { return NextResponse.json({ error: 'JSON không hợp lệ' }, { status: 400 }) }
  const kq = kiemTraThan(json)
  if (!kq.ok) return NextResponse.json({ error: kq.loi }, { status: kq.loi.startsWith('Tối đa') ? 413 : 400 })
  try {
    const db = dataClient()
    const ra = await xuLyIngest(kq.than, async (fn, args) => {
      const { data, error } = await db.rpc(fn, args)
      if (error) throw new Error(error.message)
      return data
    })
    return NextResponse.json(ra, { status: 200, headers: { 'X-Toi-Da-Item': String(TOI_DA_ITEM) } })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
