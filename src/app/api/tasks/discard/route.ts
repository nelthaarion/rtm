import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/tasks/discard — expire the current user's active PENDING task
// so they can request a new one. Used by the "Get New Task" button when a
// task was created but its bars can't be loaded (e.g., data was deleted,
// or the task was created by an older buggy assign route).
export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const result = await db.task.updateMany({
    where: { userId: user.id, status: 'PENDING' },
    data: { status: 'EXPIRED' },
  })

  return NextResponse.json({ discarded: result.count })
}
