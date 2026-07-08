import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, notifyReviewers } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (post.userId !== user.id) return NextResponse.json({ error: 'not your post' }, { status: 403 })
  if (post.status !== 'DRAFT') return NextResponse.json({ error: 'only drafts' }, { status: 400 })
  await db.post.update({ where: { id }, data: { status: 'PENDING', sentAt: new Date() } })
  await db.annotation.updateMany({ where: { postId: id }, data: { status: 'PENDING' } })
  await notifyReviewers({ fromUserId: user.id, type: 'SUBMISSION', title: 'New post submitted', message: `${user.name} submitted a post for review` })
  return NextResponse.json({ ok: true })
}
