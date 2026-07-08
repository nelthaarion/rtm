import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/posts/[id]/trade-setups — list all trade setups for a post
// Resilient to missing TradeSetup table (returns empty array if table doesn't exist yet)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const setups = await db.tradeSetup.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ tradeSetups: setups.map(s => ({
      id: s.id,
      postId: s.postId,
      label: s.label,
      entry: { timeStart: s.entryStart.getTime(), timeEnd: s.entryEnd.getTime(), priceStart: s.entryPriceStart, priceEnd: s.entryPriceEnd },
      sl: { timeStart: s.slStart.getTime(), timeEnd: s.slEnd.getTime(), priceStart: s.slPriceStart, priceEnd: s.slPriceEnd },
      tp: { timeStart: s.tpStart.getTime(), timeEnd: s.tpEnd.getTime(), priceStart: s.tpPriceStart, priceEnd: s.tpPriceEnd },
      notes: s.notes,
      createdById: s.createdById,
      createdAt: s.createdAt.getTime(),
    })) })
  } catch (err: any) {
    // If the TradeSetup table doesn't exist yet, return empty array
    // This happens when the user hasn't run `bunx prisma db push` yet
    if (err?.code === 'P2021' || err?.message?.includes('does not exist') || err?.message?.includes('no such table')) {
      return NextResponse.json({ tradeSetups: [], warning: 'TradeSetup table does not exist. Run: bunx prisma db push' })
    }
    return NextResponse.json({ error: 'Failed to load trade setups', detail: err?.message }, { status: 500 })
  }
}

// POST /api/posts/[id]/trade-setups — create a new trade setup
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') return NextResponse.json({ error: 'reviewer required' }, { status: 403 })
  const { id } = await params
  const body = await req.json()

  // Check if Prisma client has the TradeSetup model (regenerate if missing)
  if (!db.tradeSetup) {
    return NextResponse.json({
      error: 'Prisma client is out of date. Run: bunx prisma generate && bunx prisma db push, then restart the server.'
    }, { status: 500 })
  }

  try {
    // Count existing setups to auto-label (Trade Setup 1, 2, ...)
    const existing = await db.tradeSetup.count({ where: { postId: id } })
    const label = body.label || `Trade Setup ${existing + 1}`

    const setup = await db.tradeSetup.create({
      data: {
        postId: id,
        label,
        entryStart: new Date(body.entry.timeStart),
        entryEnd: new Date(body.entry.timeEnd),
        entryPriceStart: body.entry.priceStart,
        entryPriceEnd: body.entry.priceEnd,
        slStart: new Date(body.sl.timeStart),
        slEnd: new Date(body.sl.timeEnd),
        slPriceStart: body.sl.priceStart,
        slPriceEnd: body.sl.priceEnd,
        tpStart: new Date(body.tp.timeStart),
        tpEnd: new Date(body.tp.timeEnd),
        tpPriceStart: body.tp.priceStart,
        tpPriceEnd: body.tp.priceEnd,
        notes: body.notes || null,
        createdById: user.id,
      },
    })
    return NextResponse.json({ tradeSetup: { ...setup, entry: { timeStart: setup.entryStart.getTime(), timeEnd: setup.entryEnd.getTime(), priceStart: setup.entryPriceStart, priceEnd: setup.entryPriceEnd }, sl: { timeStart: setup.slStart.getTime(), timeEnd: setup.slEnd.getTime(), priceStart: setup.slPriceStart, priceEnd: setup.slPriceEnd }, tp: { timeStart: setup.tpStart.getTime(), timeEnd: setup.tpEnd.getTime(), priceStart: setup.tpPriceStart, priceEnd: setup.tpPriceEnd } } })
  } catch (err: any) {
    if (err?.code === 'P2021' || err?.message?.includes('does not exist') || err?.message?.includes('no such table')) {
      return NextResponse.json({ error: 'TradeSetup table does not exist. Run: bunx prisma db push' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to create trade setup', detail: err?.message }, { status: 500 })
  }
}
