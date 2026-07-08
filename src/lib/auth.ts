import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export interface CurrentUser { id: string; email: string; name: string; role: string }

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('rtm_user_id')?.value
  if (!userId) return null
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user || !user.active) return null
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function sendNotification(opts: { userId: string; fromUserId?: string; type: string; title: string; message: string; annotationId?: string }) {
  await db.notification.create({ data: { userId: opts.userId, fromUserId: opts.fromUserId || null, type: opts.type, title: opts.title, message: opts.message, annotationId: opts.annotationId || null } })
}

export async function notifyReviewers(opts: { fromUserId: string; type: string; title: string; message: string; annotationId?: string }) {
  const reviewers = await db.user.findMany({ where: { role: { in: ['REVIEWER', 'ADMIN'] }, active: true } })
  for (const r of reviewers) { await sendNotification({ userId: r.id, fromUserId: opts.fromUserId, type: opts.type, title: opts.title, message: opts.message, annotationId: opts.annotationId }) }
}
