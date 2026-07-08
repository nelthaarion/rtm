import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/annotations?instrumentId=...&timeframe=...&sessionId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const instrumentId = searchParams.get('instrumentId')
  const timeframe = searchParams.get('timeframe')
  const sessionId = searchParams.get('sessionId')

  const where: any = {}
  if (instrumentId) where.instrumentId = instrumentId
  if (timeframe) where.timeframe = timeframe
  if (sessionId) where.sessionId = sessionId

  const annotations = await db.annotation.findMany({
    where,
    orderBy: { timeStart: 'asc' },
    take: 500,
  })

  return NextResponse.json({
    annotations: annotations.map(a => ({
      id: a.id,
      sessionId: a.sessionId,
      instrumentId: a.instrumentId,
      type: a.type,
      timeframe: a.timeframe,
      direction: a.direction,
      priceStart: a.priceStart,
      priceEnd: a.priceEnd,
      timeStart: a.timeStart.getTime(),
      timeEnd: a.timeEnd.getTime(),
      schema: JSON.parse(a.schemaJson),
      outcome: a.outcome,
      labeler: a.labeler,
      createdAt: a.createdAt.getTime(),
    })),
  })
}

// POST /api/annotations — create
export async function POST(req: NextRequest) {
  const body = await req.json()
  const required = ['instrumentId', 'type', 'timeframe', 'direction', 'priceStart', 'priceEnd', 'timeStart', 'timeEnd', 'schema']
  for (const k of required) {
    if (body[k] === undefined) {
      return NextResponse.json({ error: `missing field: ${k}` }, { status: 400 })
    }
  }

  // Find or create an active session for this instrument + labeler
  let session = body.sessionId
    ? await db.annotationSession.findUnique({ where: { id: body.sessionId } })
    : null
  if (!session) {
    session = await db.annotationSession.create({
      data: {
        instrumentId: body.instrumentId,
        labeler: body.labeler || 'anonymous',
      },
    })
  }

  const ann = await db.annotation.create({
    data: {
      sessionId: session.id,
      instrumentId: body.instrumentId,
      type: body.type,
      timeframe: body.timeframe,
      direction: body.direction,
      priceStart: body.priceStart,
      priceEnd: body.priceEnd,
      timeStart: new Date(body.timeStart),
      timeEnd: new Date(body.timeEnd),
      schemaJson: JSON.stringify(body.schema),
      outcome: body.outcome || 'pending',
      labeler: body.labeler || 'anonymous',
    } as any,
  })

  return NextResponse.json({ annotation: ann, sessionId: session.id })
}

// PATCH /api/annotations/:id — update
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const data: any = {}
  for (const k of ['type', 'timeframe', 'direction', 'priceStart', 'priceEnd', 'outcome', 'labeler']) {
    if (updates[k] !== undefined) data[k] = updates[k]
  }
  if (updates.timeStart !== undefined) data.timeStart = new Date(updates.timeStart)
  if (updates.timeEnd !== undefined) data.timeEnd = new Date(updates.timeEnd)
  if (updates.schema !== undefined) data.schemaJson = JSON.stringify(updates.schema)

  const ann = await db.annotation.update({ where: { id }, data })
  return NextResponse.json({ annotation: ann })
}

// DELETE /api/annotations?id=...
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.annotation.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
