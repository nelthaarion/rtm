import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const TIMEFRAMES = ['M15', 'H1', 'H4', 'D1', 'W1']
const TASK_WINDOW_MS = 6 * 60 * 60 * 1000 // 6 hours (task expiry)
const CANDLE_COUNT = 1000
const AUTO_GENERATE_INTERVAL_MS = 3 * 60 * 60 * 1000 // 3 hours
const COOLDOWN_MS = 3 * 60 * 60 * 1000 // 3 hours — must wait after submitting before auto-generating a new task

// POST /api/tasks/auto-generate
//
// Cron endpoint that runs periodically (every 3 hours) to:
//   1. Expire old pending tasks (status PENDING + expiresAt <= now)
//   2. For every active LABELER/REVIEWER/ADMIN user who has NO active task,
//      automatically generate and assign a new random task.
//
// This ensures users always have a fresh task waiting for them every 3 hours,
// even if they haven't manually requested one.
//
// Can be called by:
//   - External cron (e.g., curl -X POST http://localhost:3000/api/tasks/auto-generate)
//   - Server-side setInterval (initialized in the instrumentation file)
//   - Client-side polling (the frontend calls this every few minutes)
export async function POST(req: NextRequest) {
  // Optional: protect with a secret token if called externally
  // const authHeader = req.headers.get('authorization')
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  // }

  const now = new Date()
  const results = { expired: 0, generated: 0, errors: [] as string[] }

  try {
    // Step 1: Expire old pending tasks
    // Use raw SQL to avoid Prisma date comparison issues with ISO strings
    const nowStr = now.toISOString()
    const expireResult = await db.$executeRaw`
      UPDATE Task SET status = 'EXPIRED'
      WHERE status = 'PENDING' AND expiresAt <= ${nowStr}
    `
    results.expired = expireResult

    // Also increment tasksExpired counter for affected users
    const expiredTasks = await db.$queryRaw<Array<{ userId: string }>>`
      SELECT DISTINCT userId FROM Task WHERE status = 'EXPIRED' AND submittedAt IS NULL
    `
    for (const t of expiredTasks) {
      try {
        await db.user.update({
          where: { id: t.userId },
          data: { tasksExpired: { increment: 1 } },
        })
      } catch {}
    }

    // Step 2: Find all active users who can annotate (LABELER, REVIEWER, ADMIN)
    // AND who don't have an active PENDING task
    const users = await db.user.findMany({
      where: { active: true, role: { in: ['LABELER', 'REVIEWER', 'ADMIN'] } },
      select: { id: true },
    })

    // Step 3: For each user, check if they have an active task OR are in cooldown; if neither, generate one
    const cooldownStart = new Date(now.getTime() - COOLDOWN_MS)
    const cooldownStartStr = cooldownStart.toISOString()
    for (const user of users) {
      try {
        // Use raw SQL for the active task check (date comparison)
        const activeTasks = await db.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM Task
          WHERE userId = ${user.id}
            AND status = 'PENDING'
            AND expiresAt > ${nowStr}
          LIMIT 1
        `
        if (activeTasks.length > 0) continue // already has a task, skip

        // Check cooldown: if user submitted a task within the last 3 hours, skip
        const recentSubmissions = await db.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM Task
          WHERE userId = ${user.id}
            AND status = 'SUBMITTED'
            AND submittedAt >= ${cooldownStartStr}
          LIMIT 1
        `
        if (recentSubmissions.length > 0) continue // in cooldown, skip

        // Generate a new task for this user
        const task = await generateTaskForUser(user.id)
        if (task) results.generated++
      } catch (err: any) {
        results.errors.push(`User ${user.id}: ${err?.message || 'unknown error'}`)
      }
    }

    return NextResponse.json({
      ...results,
      timestamp: now.toISOString(),
      nextRun: new Date(now.getTime() + AUTO_GENERATE_INTERVAL_MS).toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Auto-generate failed', detail: err?.message },
      { status: 500 }
    )
  }
}

// Helper: generate a random task for a user (same logic as /api/tasks/assign)
async function generateTaskForUser(userId: string) {
  // Get all instruments that have at least CANDLE_COUNT bars in some timeframe
  const instruments = await db.instrument.findMany({
    where: { bars: { some: {} } },
    select: { id: true, symbol: true, pipSize: true },
  })
  if (instruments.length === 0) return null

  // Find qualifying (instrument, timeframe) pairs
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
  if (candidates.length === 0) return null

  // Try up to 50 times to generate a unique task
  for (let attempt = 0; attempt < 50; attempt++) {
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    const maxStartIdx = pick.barCount - CANDLE_COUNT
    const startIdx = Math.floor(Math.random() * (maxStartIdx + 1))

    const startBar = await db.bar.findFirst({
      where: { instrumentId: pick.inst.id, timeframe: pick.tf },
      orderBy: { timestamp: 'asc' },
      skip: startIdx,
      take: 1,
      select: { timestamp: true },
    })
    if (!startBar) continue

    const startTimestamp = startBar.timestamp
    const taskHash = crypto.createHash('md5')
      .update(`${pick.inst.id}:${pick.tf}:${startIdx}`)
      .digest('hex')

    const existing = await db.task.findUnique({ where: { taskHash } })
    if (existing) continue

    const task = await db.task.create({
      data: {
        userId,
        instrumentId: pick.inst.id,
        timeframe: pick.tf,
        startTimestamp,
        endTimestamp: startTimestamp,
        candleCount: CANDLE_COUNT,
        status: 'PENDING',
        assignedAt: new Date(),
        expiresAt: new Date(Date.now() + TASK_WINDOW_MS),
        taskHash,
        taskType: 'ANNOTATION',
      },
    })
    return task
  }
  return null
}
