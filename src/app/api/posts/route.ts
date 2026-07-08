import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const userId = searchParams.get('userId')
  const where: any = {}
  if (status) where.status = status
  if (userId) where.userId = userId
  const posts = await db.post.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200, include: { user: { select: { id: true, name: true, email: true } }, instrument: { select: { id: true, symbol: true } }, _count: { select: { annotations: true } } } })
  return NextResponse.json({ posts: posts.map(p => ({ id: p.id, title: p.title, status: p.status, instrument: p.instrument, timeframe: p.timeframe, createdAt: p.createdAt.getTime(), sentAt: p.sentAt?.getTime() ?? null, user: p.user, annotationCount: p._count.annotations })) })
}
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role === 'VIEWER') return NextResponse.json({ error: 'viewers cannot create posts' }, { status: 403 })
  const { instrumentId, timeframe, title } = await req.json()
  if (!instrumentId || !timeframe) return NextResponse.json({ error: 'instrumentId and timeframe required' }, { status: 400 })
  const post = await db.post.create({ data: { userId: user.id, instrumentId, timeframe, title: title || `Post by ${user.name}`, status: 'DRAFT' } })
  return NextResponse.json({ post })
}
