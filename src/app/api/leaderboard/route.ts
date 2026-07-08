import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/leaderboard — ranks users by SUBMITTED task performance.
// Only submitted tasks count. Expired or active-pending tasks are excluded.
// Metrics come from the Task table (status = 'SUBMITTED') so the leaderboard
// always reflects actual submissions, not just counter columns.
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Fetch all active labeler/reviewer/admin users
  const users = await db.user.findMany({
    where: { active: true, role: { not: 'VIEWER' } },
    select: {
      id: true, name: true, role: true,
      totalPoints: true, currentStreak: true, longestStreak: true,
      tasksCompleted: true, tasksExpired: true,
      annotationsApproved: true, annotationsCorrected: true, annotationsDenied: true,
    },
  })

  // Count ACTUAL submitted tasks per user from the Task table
  // (more reliable than the counter column, which could drift)
  const submittedCounts = await db.task.groupBy({
    by: ['userId'],
    where: { status: 'SUBMITTED' },
    _count: { _all: true },
    _sum: { pointsAwarded: true },
  })
  const submittedMap = new Map<string, { count: number; points: number }>()
  for (const r of submittedCounts) {
    submittedMap.set(r.userId, {
      count: r._count._all,
      points: r._sum.pointsAwarded ?? 0,
    })
  }

  // Build leaderboard entries
  const entries = users.map(u => {
    const sub = submittedMap.get(u.id) ?? { count: 0, points: 0 }
    const total = u.annotationsApproved + u.annotationsCorrected + u.annotationsDenied
    return {
      id: u.id,
      name: u.name,
      role: u.role,
      // Use actual submitted-task count from DB (not the counter column)
      tasksSubmitted: sub.count,
      tasksExpired: u.tasksExpired,
      // Points come from the actual sum of submitted task points
      totalPoints: sub.points,
      annotationsApproved: u.annotationsApproved,
      annotationsCorrected: u.annotationsCorrected,
      annotationsDenied: u.annotationsDenied,
      approvalRate: total > 0
        ? Math.round(((u.annotationsApproved + u.annotationsCorrected) / total) * 100)
        : 0,
      currentStreak: u.currentStreak,
      longestStreak: u.longestStreak,
    }
  })

  // Sort by totalPoints desc (submitted task points)
  entries.sort((a, b) => b.totalPoints - a.totalPoints)

  const leaderboard = entries.map((e, i) => ({
    rank: i + 1,
    ...e,
  }))

  return NextResponse.json({ leaderboard })
}
