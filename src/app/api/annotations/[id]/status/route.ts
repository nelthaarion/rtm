import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, sendNotification } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') return NextResponse.json({ error: 'reviewer required' }, { status: 403 })
  const { id } = await params
  const { status, reviewNotes, screenshotUrl } = await req.json()
  if (!['APPROVED', 'DENIED', 'CORRECTED'].includes(status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  const data: any = { status, reviewedById: user.id, reviewedAt: new Date() }
  if (reviewNotes !== undefined) data.reviewNotes = reviewNotes
  if (screenshotUrl !== undefined) data.screenshotUrl = screenshotUrl
  const ann = await db.annotation.update({ where: { id }, data, include: { submittedBy: true } })
  if (ann.postId) { const all = await db.annotation.findMany({ where: { postId: ann.postId }, select: { status: true } }); const allApproved = all.every(a => a.status === 'APPROVED' || a.status === 'CORRECTED'); if (allApproved) await db.post.update({ where: { id: ann.postId }, data: { status: 'APPROVED' } }) }
  if (ann.submittedBy && ann.submittedBy.id !== user.id) { const label = status === 'APPROVED' ? 'approved' : status === 'DENIED' ? 'denied' : 'corrected'; await sendNotification({ userId: ann.submittedBy.id, fromUserId: user.id, type: status, title: `Annotation ${label}`, message: `Your ${ann.type.toUpperCase()} was ${label} by ${user.name}` }) }
  // Award points for approved/corrected
  if (status === 'APPROVED' || status === 'CORRECTED') { await db.user.update({ where: { id: ann.submittedById }, data: { totalPoints: { increment: 25 }, annotationsApproved: { increment: status === 'APPROVED' ? 1 : 0 }, annotationsCorrected: { increment: status === 'CORRECTED' ? 1 : 0 } } }) }
  if (status === 'DENIED') { await db.user.update({ where: { id: ann.submittedById }, data: { annotationsDenied: { increment: 1 } } }) }
  return NextResponse.json({ annotation: ann })
}
