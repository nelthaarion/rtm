import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/tasks/history — returns all of the current user's tasks:
//   - SUBMITTED tasks (with their post + annotation count + review status)
//   - EXPIRED tasks (submitted=0, never completed)
//   - Active PENDING task (if any, marked as editable)
//
// The current PENDING task is editable; SUBMITTED and EXPIRED tasks are read-only.
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Expire any old pending tasks first
  await db.task.updateMany({
    where: { userId: user.id, status: 'PENDING', expiresAt: { lte: new Date() } },
    data: { status: 'EXPIRED' },
  })

  // Fetch ALL tasks for this user (PENDING + SUBMITTED + EXPIRED), newest first
  const tasks = await db.task.findMany({
    where: { userId: user.id },
    orderBy: { assignedAt: 'desc' },
    include: {
      instrument: { select: { id: true, symbol: true, pipSize: true } },
      post: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          sentAt: true,
          _count: { select: { annotations: true } },
        },
      },
    },
    take: 200,
  })

  const now = Date.now()

  const items = tasks.map(t => {
    const isActive = t.status === 'PENDING' && t.expiresAt.getTime() > now
    return {
      id: t.id,
      instrument: t.instrument ? { id: t.instrument.id, symbol: t.instrument.symbol, pipSize: t.instrument.pipSize } : null,
      timeframe: t.timeframe,
      candleCount: t.candleCount,
      startTimestamp: t.startTimestamp.getTime(),
      endTimestamp: t.endTimestamp.getTime(),
      assignedAt: t.assignedAt.getTime(),
      expiresAt: t.expiresAt.getTime(),
      submittedAt: t.submittedAt?.getTime() ?? null,
      status: t.status,                         // PENDING | SUBMITTED | EXPIRED
      isActive,                                  // true only for the current editable task
      editable: isActive,                         // alias: UI uses this to decide if annotations can be modified
      pointsAwarded: t.pointsAwarded,
      postId: t.postId,
      post: t.post ? {
        id: t.post.id,
        title: t.post.title,
        status: t.post.status,                   // DRAFT | PENDING | APPROVED | DENIED | CORRECTED
        createdAt: t.post.createdAt.getTime(),
        sentAt: t.post.sentAt?.getTime() ?? null,
        annotationCount: t.post._count.annotations,
      } : null,
    }
  })

  // Summary counts
  const summary = {
    total: items.length,
    submitted: items.filter(i => i.status === 'SUBMITTED').length,
    expired: items.filter(i => i.status === 'EXPIRED').length,
    active: items.filter(i => i.isActive).length,
    totalPoints: items.reduce((s, i) => s + i.pointsAwarded, 0),
  }

  return NextResponse.json({ tasks: items, summary })
}
