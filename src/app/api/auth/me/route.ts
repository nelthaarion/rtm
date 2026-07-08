import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  const userId = req.cookies.get('rtm_user_id')?.value
  if (!userId) return NextResponse.json({ user: null })
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user || !user.active) return NextResponse.json({ user: null })
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
}
