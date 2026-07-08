import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const userId = id === 'me' ? currentUser.id : id
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, createdAt: true, totalPoints: true, currentStreak: true, longestStreak: true, tasksCompleted: true, tasksExpired: true, annotationsApproved: true, annotationsCorrected: true, annotationsDenied: true } })
  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const taskHistory = await db.taskHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 })
  const higher = await db.user.count({ where: { totalPoints: { gt: user.totalPoints }, active: true } })
  const rank = higher + 1
  const totalReviewed = user.annotationsApproved + user.annotationsCorrected + user.annotationsDenied
  const approvalRate = totalReviewed > 0 ? Math.round(((user.annotationsApproved + user.annotationsCorrected) / totalReviewed) * 100) : 0
  const badges: string[] = []
  if (user.tasksCompleted >= 1) badges.push('First Task')
  if (user.tasksCompleted >= 10) badges.push('10 Tasks')
  if (user.tasksCompleted >= 50) badges.push('50 Tasks')
  if (user.tasksCompleted >= 100) badges.push('Centurion')
  if (user.annotationsApproved >= 10) badges.push('10 Approved')
  if (user.currentStreak >= 5) badges.push('5 Streak')
  if (user.totalPoints >= 100) badges.push('100 Points')
  if (user.totalPoints >= 500) badges.push('500 Points')
  if (approvalRate >= 80 && totalReviewed >= 10) badges.push('Sharp Eye')
  return NextResponse.json({ profile: { ...user, rank, approvalRate, totalReviewed, badges, createdAt: user.createdAt.getTime() }, taskHistory: taskHistory.map(t => ({ id: t.id, instrumentSymbol: t.instrumentSymbol, timeframe: t.timeframe, status: t.status, reviewStatus: t.reviewStatus, pointsAwarded: t.pointsAwarded, timeSpentMin: t.timeSpentMin, annotationCount: t.annotationCount, createdAt: t.createdAt.getTime() })) })
}
