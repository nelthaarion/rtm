import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') return NextResponse.json({ error: 'reviewer required' }, { status: 403 })
  const users = await db.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, role: true, active: true, createdAt: true, _count: { select: { submittedAnnotations: true, reviewedAnnotations: true } } } })
  return NextResponse.json({ users: users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, active: u.active, createdAt: u.createdAt.getTime(), submittedCount: u._count.submittedAnnotations, reviewedCount: u._count.reviewedAnnotations })) })
}
