import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'

// PATCH /api/corrections/[id] — update a corrected annotation.
//
// What CAN be changed by the reviewer:
//   - schema fields (definition, purpose, context, whyItForms, identification,
//     commonMistakes, failureConditions, relationships, probabilityContribution,
//     realChartExample) — the 10-field KB content
//   - direction (bullish/bearish/neutral)
//   - type (if reviewer disagrees with the labeler's classification)
//   - priceStart, priceEnd (if reviewer wants to adjust the drawn box)
//   - points, arrow (polyline/arrow geometry)
//   - isDeleted (reviewer can mark a corrected annotation as deleted)
//   - tradeZones: { entry, sl, tp } — required before approval
//
// What CANNOT be changed (locked — preserves user's original data):
//   - labeler (user's name)
//   - timeStart, timeEnd (user's drawn time range)
//   - correctedById (who made the correction)
//   - originalId, postId, instrumentId (structural links)
//   - timeframe (post-level property)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') return NextResponse.json({ error: 'reviewer required' }, { status: 403 })
  const { id } = await params
  const existing = await db.correctedAnnotation.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const body = await req.json()

  const data: any = { correctedAt: new Date() }

  // Editable fields (reviewer can change these)
  if (body.type !== undefined) data.type = body.type
  if (body.direction !== undefined) data.direction = body.direction
  if (body.priceStart !== undefined) data.priceStart = body.priceStart
  if (body.priceEnd !== undefined) data.priceEnd = body.priceEnd
  if (body.isDeleted !== undefined) data.isDeleted = body.isDeleted

  // Schema fields — the 10-field KB content. These are the main thing reviewers fix.
  // We do NOT allow changing labeler, timeStart, or timeEnd here.
  // Also handle tradeZones (entry/sl/tp) stored inside schemaJson.
  if (body.schema !== undefined || body.points !== undefined || body.arrow !== undefined || body.tradeZones !== undefined) {
    const parsed = JSON.parse(existing.schemaJson)
    const { _points, _arrow, _tradeZones, ...clean } = parsed
    const newSchema = body.schema ? { ...body.schema } : clean
    if (body.points !== undefined) newSchema._points = body.points
    if (body.arrow !== undefined) newSchema._arrow = body.arrow
    if (body.tradeZones !== undefined) newSchema._tradeZones = body.tradeZones
    data.schemaJson = JSON.stringify(newSchema)
  }

  const updated = await db.correctedAnnotation.update({ where: { id }, data })
  return NextResponse.json({ correction: updated })
}

// GET /api/corrections/[id] — fetch a single corrected annotation
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const c = await db.correctedAnnotation.findUnique({ where: { id } })
  if (!c) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const parsed = JSON.parse(c.schemaJson)
  const { _points, _arrow, _tradeZones, ...schema } = parsed
  return NextResponse.json({
    correction: {
      id: c.id,
      originalId: c.originalId,
      postId: c.postId,
      type: c.type,
      direction: c.direction,
      priceStart: c.priceStart,
      priceEnd: c.priceEnd,
      timeStart: c.timeStart.getTime(),
      timeEnd: c.timeEnd.getTime(),
      schema,
      points: _points,
      arrow: _arrow,
      tradeZones: _tradeZones,  // { entry?: {timeStart, timeEnd, priceStart, priceEnd}, sl?: {...}, tp?: {...} }
      labeler: c.labeler,
      correctedById: c.correctedById,
      correctedAt: c.correctedAt.getTime(),
      isDeleted: c.isDeleted,
    },
  })
}
