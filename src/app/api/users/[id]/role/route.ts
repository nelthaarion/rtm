import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (currentUser.role !== 'ADMIN') return NextResponse.json({ error: 'admin required' }, { status: 403 })
  const { id } = await params
  const { role, active } = await req.json()
  if (id === currentUser.id && role && role !== 'ADMIN') return NextResponse.json({ error: 'cannot demote yourself' }, { status: 400 })
  const data: any = {}
  if (role) { if (!['VIEWER', 'LABELER', 'REVIEWER', 'ADMIN'].includes(role)) return NextResponse.json({ error: 'invalid role' }, { status: 400 }); data.role = role }
  if (typeof active === 'boolean') data.active = active
  await db.user.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}
