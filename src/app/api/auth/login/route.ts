import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  const user = await db.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) return NextResponse.json({ error: 'invalid email or password' }, { status: 401 })
  if (!user.active) return NextResponse.json({ error: 'account disabled' }, { status: 403 })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return NextResponse.json({ error: 'invalid email or password' }, { status: 401 })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  res.cookies.set('rtm_user_id', user.id, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}
