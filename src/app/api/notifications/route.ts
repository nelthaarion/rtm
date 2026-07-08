import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50, include: { fromUser: { select: { name: true } } } })
  const unreadCount = await db.notification.count({ where: { userId: user.id, read: false } })
  return NextResponse.json({ notifications: notifications.map(n => ({ id: n.id, type: n.type, title: n.title, message: n.message, read: n.read, createdAt: n.createdAt.getTime(), fromUser: n.fromUser })), unreadCount })
}
