import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const post = await db.post.findUnique({ where: { id }, include: { user: { select: { id: true, name: true } }, instrument: { select: { id: true, symbol: true } } } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const annotations = await db.annotation.findMany({ where: { postId: id }, orderBy: { timeStart: 'asc' }, include: { submittedBy: { select: { id: true, name: true } }, reviewedBy: { select: { id: true, name: true } } } })
  return NextResponse.json({ post: { id: post.id, title: post.title, status: post.status, instrumentId: post.instrumentId, timeframe: post.timeframe, user: post.user, instrument: post.instrument, createdAt: post.createdAt.getTime() }, annotations: annotations.map(a => { const parsed = JSON.parse(a.schemaJson); const { _points, _arrow, ...schema } = parsed; return { id: a.id, type: a.type, timeframe: a.timeframe, direction: a.direction, priceStart: a.priceStart, priceEnd: a.priceEnd, timeStart: a.timeStart.getTime(), timeEnd: a.timeEnd.getTime(), schema, points: _points, arrow: _arrow, status: a.status, submittedBy: a.submittedBy, reviewedBy: a.reviewedBy, reviewedAt: a.reviewedAt?.getTime() ?? null, reviewNotes: a.reviewNotes } }) })
}
