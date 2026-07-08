import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/tasks/[id] — returns a single task with its bars and submitted annotations.
// Used by the History view to display a past task's chart + annotations (read-only).
// Only the task owner can view their own tasks.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params

  const task = await db.task.findUnique({
    where: { id },
    include: {
      instrument: { select: { id: true, symbol: true, pipSize: true } },
    },
  })

  if (!task) return NextResponse.json({ error: 'task not found' }, { status: 404 })
  if (task.userId !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // Load bars (same window used when the task was active)
  const bars = await db.bar.findMany({
    where: {
      instrumentId: task.instrumentId,
      timeframe: task.timeframe,
      timestamp: { gte: task.startTimestamp },
    },
    orderBy: { timestamp: 'asc' },
    take: task.candleCount,
  })

  // Load submitted annotations if this task has a post
  let annotations: any[] = []
  if (task.postId) {
    const dbAnns = await db.annotation.findMany({
      where: { postId: task.postId },
      orderBy: { createdAt: 'asc' },
    })
    annotations = dbAnns.map(a => {
      const parsed = JSON.parse(a.schemaJson)
      const { _points, _arrow, ...schema } = parsed
      return {
        id: a.id,
        type: a.type,
        direction: a.direction,
        priceStart: a.priceStart,
        priceEnd: a.priceEnd,
        timeStart: a.timeStart.getTime(),
        timeEnd: a.timeEnd.getTime(),
        schema,
        points: _points,
        arrow: _arrow,
        status: a.status,
      }
    })
  }

  const now = Date.now()
  const isActive = task.status === 'PENDING' && task.expiresAt.getTime() > now

  return NextResponse.json({
    task: {
      id: task.id,
      timeframe: task.timeframe,
      candleCount: task.candleCount,
      status: task.status,
      isActive,
      editable: isActive,
      assignedAt: task.assignedAt.getTime(),
      expiresAt: task.expiresAt.getTime(),
      submittedAt: task.submittedAt?.getTime() ?? null,
      pointsAwarded: task.pointsAwarded,
      postId: task.postId,
    },
    instrument: task.instrument,
    bars: bars.map(b => ({
      time: b.timestamp.getTime(),
      o: b.open, h: b.high, l: b.low, c: b.close, v: b.volume ?? 0,
    })),
    annotations,
  })
}
