import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, notifyReviewers } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const ann = await db.annotation.findUnique({ where: { id } })
  if (!ann) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (ann.submittedById !== user.id) return NextResponse.json({ error: 'not yours' }, { status: 403 })
  if (ann.status !== 'DRAFT') return NextResponse.json({ error: 'only drafts' }, { status: 400 })
  await db.annotation.update({ where: { id }, data: { status: 'PENDING' } })
  await notifyReviewers({ fromUserId: user.id, type: 'SUBMISSION', title: 'Annotation submitted', message: `${user.name} submitted a ${ann.type.toUpperCase()}` })
  return NextResponse.json({ ok: true })
}
