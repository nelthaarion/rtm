import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, notifyReviewers } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { annotations } = await req.json()
  const task = await db.task.findFirst({ where: { userId: user.id, status: 'PENDING', expiresAt: { gt: new Date() } } })
  if (!task) return NextResponse.json({ error: 'No active task' }, { status: 400 })
  const post = await db.post.create({ data: { userId: user.id, instrumentId: task.instrumentId, timeframe: task.timeframe, title: `Task — ${annotations.length} annotations`, status: 'PENDING', sentAt: new Date() } })
  for (const ann of annotations) {
    const schemaGeo: any = { ...ann.schema }
    if (ann.points) schemaGeo._points = ann.points
    if (ann.arrow) schemaGeo._arrow = ann.arrow
    await db.annotation.create({ data: { postId: post.id, instrumentId: task.instrumentId, type: ann.type, timeframe: task.timeframe, direction: ann.direction, priceStart: ann.priceStart, priceEnd: ann.priceEnd, timeStart: new Date(ann.timeStart), timeEnd: new Date(ann.timeEnd), schemaJson: JSON.stringify(schemaGeo), outcome: 'pending', labeler: user.name, submittedById: user.id, status: 'PENDING' } })
  }
  const timeSpentMin = Math.round((Date.now() - task.assignedAt.getTime()) / 60000)
  const points = 10 + (timeSpentMin < 60 ? 5 : 0)
  await db.task.update({ where: { id: task.id }, data: { status: 'SUBMITTED', submittedAt: new Date(), postId: post.id, pointsAwarded: points } })
  await db.user.update({ where: { id: user.id }, data: { totalPoints: { increment: points }, tasksCompleted: { increment: 1 }, currentStreak: { increment: 1 } } })
  const u = await db.user.findUnique({ where: { id: user.id } })
  if (u && u.currentStreak > u.longestStreak) await db.user.update({ where: { id: user.id }, data: { longestStreak: u.currentStreak } })
  const inst = await db.instrument.findUnique({ where: { id: task.instrumentId } })
  await db.taskHistory.create({ data: { userId: user.id, instrumentId: task.instrumentId, instrumentSymbol: inst?.symbol || '?', timeframe: task.timeframe, startTimestamp: task.startTimestamp, endTimestamp: task.endTimestamp, taskType: task.taskType, status: 'COMPLETED', submittedAt: new Date(), reviewStatus: 'PENDING', pointsAwarded: points, timeSpentMin, annotationCount: annotations.length } })
  await notifyReviewers({ fromUserId: user.id, type: 'SUBMISSION', title: 'New post submitted', message: `${user.name} submitted ${annotations.length} annotations` })
  return NextResponse.json({ ok: true, postId: post.id, pointsAwarded: points })
}
