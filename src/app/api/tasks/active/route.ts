import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/tasks/active — get the user's current active task + its 1000 candles
//
// Fixed bar-loading strategy:
//   The assign route stores startTimestamp = the timestamp of bar at index `startIdx`
//   (where startIdx was chosen randomly in [0, barCount - 1000]).
//   So `timestamp: { gte: startTimestamp }` ordered ASC + take 1000 will return
//   exactly the bars [startIdx, startIdx+999] — guaranteed 1000 bars (assuming
//   no bars were deleted between assign and active).
//
//   If fewer than expected bars are returned (data deletion edge case), we still
//   return what we have, but flag it via `barCount` so the client can show a
//   meaningful message instead of "No task data".
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Expire old tasks
  await db.task.updateMany({
    where: { userId: user.id, status: 'PENDING', expiresAt: { lte: new Date() } },
    data: { status: 'EXPIRED' },
  })

  const task = await db.task.findFirst({
    where: { userId: user.id, status: 'PENDING', expiresAt: { gt: new Date() } },
    include: { instrument: true },
  })

  if (!task) {
    return NextResponse.json({ task: null })
  }

  // Load exactly candleCount bars starting from startTimestamp.
  // gte on the bar's actual timestamp + take = candleCount → deterministic window.
  const bars = await db.bar.findMany({
    where: {
      instrumentId: task.instrumentId,
      timeframe: task.timeframe,
      timestamp: { gte: task.startTimestamp },
    },
    orderBy: { timestamp: 'asc' },
    take: task.candleCount,
  })

  // Diagnostic: if we got fewer bars than expected, include a warning.
  // This should not happen with the fixed assign route, but if it does
  // (e.g., bars were deleted), the client can show a clear message.
  const warning = bars.length < task.candleCount
    ? `Expected ${task.candleCount} bars but only found ${bars.length}. ` +
      `The task may have been created before a data reset — please discard and request a new task.`
    : null

  return NextResponse.json({
    task: {
      id: task.id,
      timeframe: task.timeframe,
      candleCount: task.candleCount,
      status: task.status,
      assignedAt: task.assignedAt.getTime(),
      expiresAt: task.expiresAt.getTime(),
      submittedAt: task.submittedAt?.getTime() ?? null,
      taskType: task.taskType,
      timeRemaining: task.expiresAt.getTime() - Date.now(),
    },
    instrument: {
      id: task.instrument.id,
      symbol: task.instrument.symbol,
      pipSize: task.instrument.pipSize,
    },
    bars: bars.map(b => ({
      time: b.timestamp.getTime(),
      o: b.open,
      h: b.high,
      l: b.low,
      c: b.close,
      v: b.volume ?? 0,
    })),
    barCount: bars.length,
    warning,
  })
}
