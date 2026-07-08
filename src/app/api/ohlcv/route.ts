import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
// GET /api/ohlcv?instrumentId=...&timeframe=...&limit=500&before=<iso>
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const instrumentId = searchParams.get('instrumentId')
  const timeframe = searchParams.get('timeframe') || 'H1'
  const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10), 2000)
  const before = searchParams.get('before')

  if (!instrumentId) {
    return NextResponse.json({ error: 'instrumentId required' }, { status: 400 })
  }

  const where: any = { instrumentId, timeframe }
  if (before) {
    where.timestamp = { lt: new Date(before) }
  }

  const bars = await db.bar.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
  })

  // Return oldest-first for charting
  const sorted = bars.reverse().map(b => ({
    time: b.timestamp.getTime(),
    o: b.open,
    h: b.high,
    l: b.low,
    c: b.close,
    v: b.volume ?? 0,
  }))

  return NextResponse.json({ bars: sorted, timeframe, instrumentId })
}
