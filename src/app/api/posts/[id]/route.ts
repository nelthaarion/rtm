import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/posts/[id] — fetch a single post with its instrument + bars.
// Used by the Approved and Review views to render the chart.
// Returns:
//   - post metadata (title, status, timeframe, user, instrument)
//   - bars: the OHLCV bars for this post's instrument+timeframe, centered on
//     the annotation time range. Falls back to most recent 500 bars if the
//     time-range query returns nothing.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params

  const post = await db.post.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      instrument: { select: { id: true, symbol: true, pipSize: true } },
    },
  })

  if (!post) return NextResponse.json({ error: 'post not found' }, { status: 404 })

  // Get the annotations to find the time range
  const annotations = await db.annotation.findMany({
    where: { postId: id },
    orderBy: { timeStart: 'asc' },
    select: { timeStart: true, timeEnd: true },
  })

  const tfMs: Record<string, number> = {
    M15: 15 * 60 * 1000, H1: 60 * 60 * 1000, H4: 4 * 60 * 60 * 1000,
    D1: 24 * 60 * 60 * 1000, W1: 7 * 24 * 60 * 60 * 1000,
  }
  const tf = post.timeframe
  const ms = tfMs[tf] || 3600000

  let bars: any[] = []

  // Strategy 1: load bars around the annotation time range
  if (annotations.length > 0) {
    const earliest = annotations[0].timeStart
    const latest = annotations.reduce((max, a) => a.timeEnd > max ? a.timeEnd : max, earliest)
    // Pad: 200 bars before earliest, 200 bars after latest
    const startLookup = new Date(earliest.getTime() - ms * 200)
    const endLookup = new Date(latest.getTime() + ms * 200)

    // Use raw SQL to avoid Prisma date comparison issues with ISO strings
    // that have microsecond precision. SQLite string comparison works correctly
    // for ISO 8601 dates when both values use the same format.
    const startStr = startLookup.toISOString()
    const endStr = endLookup.toISOString()

    const dbBars = await db.$queryRaw<Array<{
      timestamp: Date; open: number; high: number; low: number; close: number; volume: number | null
    }>>`
      SELECT timestamp, open, high, low, close, volume FROM Bar
      WHERE instrumentId = ${post.instrumentId}
        AND timeframe = ${tf}
        AND timestamp >= ${startStr}
        AND timestamp <= ${endStr}
      ORDER BY timestamp ASC
      LIMIT 1000
    `

    bars = dbBars.map(b => ({
      time: b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime(),
      o: b.open, h: b.high, l: b.low, c: b.close, v: b.volume ?? 0,
    }))
  }

  // Strategy 2 (FALLBACK): if no bars found, load the most recent 500 bars
  // for this instrument+timeframe so the chart always has something to render.
  if (bars.length === 0) {
    const dbBars = await db.bar.findMany({
      where: { instrumentId: post.instrumentId, timeframe: tf },
      orderBy: { timestamp: 'desc' },
      take: 500,
    })
    dbBars.reverse()  // ascending for charting
    bars = dbBars.map(b => ({
      time: b.timestamp.getTime(),
      o: b.open, h: b.high, l: b.low, c: b.close, v: b.volume ?? 0,
    }))
  }

  return NextResponse.json({
    post: {
      id: post.id,
      title: post.title,
      status: post.status,
      timeframe: post.timeframe,
      createdAt: post.createdAt.getTime(),
      sentAt: post.sentAt?.getTime() ?? null,
      user: post.user,
      instrument: post.instrument,
    },
    bars,
  })
}
