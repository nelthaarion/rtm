import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/trade-setups/[id] — delete a trade setup
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') return NextResponse.json({ error: 'reviewer required' }, { status: 403 })
  const { id } = await params
  await db.tradeSetup.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

// PATCH /api/trade-setups/[id] — update a trade setup (e.g., redraw zones)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') return NextResponse.json({ error: 'reviewer required' }, { status: 403 })
  const { id } = await params
  const body = await req.json()

  const data: any = {}
  if (body.label !== undefined) data.label = body.label
  if (body.notes !== undefined) data.notes = body.notes
  if (body.entry) {
    if (body.entry.timeStart !== undefined) data.entryStart = new Date(body.entry.timeStart)
    if (body.entry.timeEnd !== undefined) data.entryEnd = new Date(body.entry.timeEnd)
    if (body.entry.priceStart !== undefined) data.entryPriceStart = body.entry.priceStart
    if (body.entry.priceEnd !== undefined) data.entryPriceEnd = body.entry.priceEnd
  }
  if (body.sl) {
    if (body.sl.timeStart !== undefined) data.slStart = new Date(body.sl.timeStart)
    if (body.sl.timeEnd !== undefined) data.slEnd = new Date(body.sl.timeEnd)
    if (body.sl.priceStart !== undefined) data.slPriceStart = body.sl.priceStart
    if (body.sl.priceEnd !== undefined) data.slPriceEnd = body.sl.priceEnd
  }
  if (body.tp) {
    if (body.tp.timeStart !== undefined) data.tpStart = new Date(body.tp.timeStart)
    if (body.tp.timeEnd !== undefined) data.tpEnd = new Date(body.tp.timeEnd)
    if (body.tp.priceStart !== undefined) data.tpPriceStart = body.tp.priceStart
    if (body.tp.priceEnd !== undefined) data.tpPriceEnd = body.tp.priceEnd
  }

  const updated = await db.tradeSetup.update({ where: { id }, data })
  return NextResponse.json({ tradeSetup: updated })
}
