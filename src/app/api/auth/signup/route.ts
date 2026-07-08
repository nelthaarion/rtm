import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  if (!email || !name || !password) return NextResponse.json({ error: 'name, email, and password required' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'password must be at least 6 characters' }, { status: 400 })
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'email already registered' }, { status: 409 })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await db.user.create({ data: { email, name, passwordHash, role: 'LABELER' } })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  res.cookies.set('rtm_user_id', user.id, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}
