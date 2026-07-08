import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const TIMEFRAMES = ['M15', 'H1', 'H4', 'D1', 'W1']
const TASK_WINDOW_MS = 6 * 60 * 60 * 1000 // 6 hours (task expiry)
const CANDLE_COUNT = 1000
const COOLDOWN_MS = 3 * 60 * 60 * 1000 // 3 hours — must wait this long after submitting before getting a new task

// POST /api/tasks/assign — generate and assign a random task to the current user
//
// Rules:
//   1. If user has an active PENDING task → return it (don't create a new one)
//   2. If user submitted a task within the last 3 hours → return cooldown error
//   3. Otherwise → generate a new task
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role === 'VIEWER') return NextResponse.json({ error: 'viewers cannot get tasks' }, { status: 403 })

  // Check if user already has an active (non-expired) task
  const activeTask = await db.task.findFirst({
    where: { userId: user.id, status: 'PENDING', expiresAt: { gt: new Date() } },
  })
  if (activeTask) {
    return NextResponse.json({ task: activeTask, message: 'You already have an active task' })
  }

  // Check cooldown: if user submitted a task within the last 3 hours, block
  const cooldownStart = new Date(Date.now() - COOLDOWN_MS)
  const recentSubmission = await db.task.findFirst({
    where: {
      userId: user.id,
      status: 'SUBMITTED',
      submittedAt: { gte: cooldownStart },
    },
    orderBy: { submittedAt: 'desc' },
  })
  if (recentSubmission && recentSubmission.submittedAt) {
    const elapsed = Date.now() - recentSubmission.submittedAt.getTime()
    const remaining = COOLDOWN_MS - elapsed
    const remainingMin = Math.ceil(remaining / 60000)
    const remainingHours = Math.floor(remainingMin / 60)
    const remainingMins = remainingMin % 60
    return NextResponse.json({
      error: `Task cooldown active. You submitted a task ${Math.floor(elapsed / 60000)} minutes ago. Next task available in ${remainingHours}h ${remainingMins}m.`,
      cooldown: {
        submittedAt: recentSubmission.submittedAt.getTime(),
        cooldownMs: COOLDOWN_MS,
        remainingMs: remaining,
        availableAt: Date.now() + remaining,
      },
    }, { status: 429 })
  }

  // Expire any old pending tasks
  await db.task.updateMany({
    where: { userId: user.id, status: 'PENDING', expiresAt: { lte: new Date() } },
    data: { status: 'EXPIRED' },
  })

  // Get all instruments that have at least one bar
  const instruments = await db.instrument.findMany({
    where: { bars: { some: {} } },
    select: { id: true, symbol: true, pipSize: true },
  })
  if (instruments.length === 0) {
    return NextResponse.json({ error: 'No instruments with data available' }, { status: 400 })
  }

  // For each instrument, find timeframes that have at least CANDLE_COUNT bars.
  // This is accurate (uses COUNT(*), not time-span estimation).
  const candidates: Array<{ inst: typeof instruments[0]; tf: string; barCount: number }> = []
  for (const inst of instruments) {
    for (const tf of TIMEFRAMES) {
      const barCount = await db.bar.count({
        where: { instrumentId: inst.id, timeframe: tf },
      })
      if (barCount >= CANDLE_COUNT) {
        candidates.push({ inst, tf, barCount })
      }
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json(
      {
        error: `No instrument+timeframe combination has at least ${CANDLE_COUNT} bars. ` +
               `Found ${instruments.length} instrument(s) with bars, but none reached the ${CANDLE_COUNT}-bar threshold.`,
        instrumentsChecked: instruments.length,
        timeframes: TIMEFRAMES,
      },
      { status: 400 }
    )
  }

  // Try to generate a unique task (max 50 attempts)
  for (let attempt = 0; attempt < 50; attempt++) {
    // Pick a random qualifying (instrument, timeframe)
    const pick = candidates[Math.floor(Math.random() * candidates.length)]

    // Pick a random start BAR INDEX in [0, barCount - CANDLE_COUNT]
    const maxStartIdx = pick.barCount - CANDLE_COUNT
    const startIdx = Math.floor(Math.random() * (maxStartIdx + 1))

    // Read the bar at startIdx to get its timestamp.
    // We order by timestamp ASC and skip+take to get exactly one bar at the chosen index.
    // NOTE: this same ordering is used by /api/tasks/active, so the bar window is consistent.
    const startBar = await db.bar.findFirst({
      where: { instrumentId: pick.inst.id, timeframe: pick.tf },
      orderBy: { timestamp: 'asc' },
      skip: startIdx,
      take: 1,
      select: { timestamp: true },
    })
    if (!startBar) continue // extremely unlikely race; just retry

    const startTimestamp = startBar.timestamp
    const taskHash = crypto.createHash('md5')
      .update(`${pick.inst.id}:${pick.tf}:${startIdx}`)
      .digest('hex')

    const existing = await db.task.findUnique({ where: { taskHash } })
    if (existing) continue // already assigned to someone — try again

    const task = await db.task.create({
      data: {
        userId: user.id,
        instrumentId: pick.inst.id,
        timeframe: pick.tf,
        startTimestamp,
        endTimestamp: startTimestamp, // informational only; active route uses skip/take
        candleCount: CANDLE_COUNT,
        status: 'PENDING',
        assignedAt: new Date(),
        expiresAt: new Date(Date.now() + TASK_WINDOW_MS),
        taskHash,
        taskType: 'ANNOTATION',
      },
    })

    return NextResponse.json({
      task,
      instrument: { id: pick.inst.id, symbol: pick.inst.symbol, pipSize: pick.inst.pipSize },
    })
  }

  return NextResponse.json(
    { error: 'Could not generate a unique task after 50 attempts. Try again.' },
    { status: 500 }
  )
}
