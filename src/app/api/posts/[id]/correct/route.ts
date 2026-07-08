import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'

// POST /api/posts/[id]/correct — clone all original annotations into the
// CorrectedAnnotation table so the reviewer can edit them.
// Returns the cloned annotations WITH parsed schemaJson (points/arrow extracted).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role !== 'REVIEWER' && user.role !== 'ADMIN') return NextResponse.json({ error: 'reviewer required' }, { status: 403 })
  const { id } = await params

  // If this reviewer already has corrections, return them (parsed)
  const existing = await db.correctedAnnotation.findMany({ where: { postId: id, correctedById: user.id }, orderBy: { timeStart: 'asc' } })
  if (existing.length > 0) {
    return NextResponse.json({ correctedAnnotations: existing.map(c => parseCorrected(c)) })
  }

  // Otherwise, clone the originals
  const originals = await db.annotation.findMany({ where: { postId: id }, orderBy: { timeStart: 'asc' } })
  if (originals.length === 0) return NextResponse.json({ error: 'No annotations' }, { status: 400 })

  const cloned: any[] = []
  for (const orig of originals) {
    const clone = await db.correctedAnnotation.create({
      data: {
        originalId: orig.id,
        postId: id,
        instrumentId: orig.instrumentId,
        type: orig.type,
        timeframe: orig.timeframe,
        direction: orig.direction,
        priceStart: orig.priceStart,
        priceEnd: orig.priceEnd,
        timeStart: orig.timeStart,
        timeEnd: orig.timeEnd,
        schemaJson: orig.schemaJson,  // preserves _points and _arrow
        labeler: orig.labeler,
        correctedById: user.id,
      }
    })
    cloned.push(clone as any)
  }

  return NextResponse.json({ correctedAnnotations: cloned.map(c => parseCorrected(c)) })
}

// Helper: parse a CorrectedAnnotation DB row into the frontend format.
// Extracts _points, _arrow, _tradeZones from schemaJson so polylines/arrows/trade zones render correctly.
function parseCorrected(c: any) {
  let parsed: any = {}
  try { parsed = JSON.parse(c.schemaJson) } catch {}
  const { _points, _arrow, _tradeZones, ...schema } = parsed
  return {
    id: c.id,
    originalId: c.originalId,
    postId: c.postId,
    type: c.type,
    direction: c.direction,
    priceStart: c.priceStart,
    priceEnd: c.priceEnd,
    timeStart: c.timeStart instanceof Date ? c.timeStart.getTime() : new Date(c.timeStart).getTime(),
    timeEnd: c.timeEnd instanceof Date ? c.timeEnd.getTime() : new Date(c.timeEnd).getTime(),
    schema,
    points: _points,
    arrow: _arrow,
    tradeZones: _tradeZones,  // { entry?, sl?, tp? }
    labeler: c.labeler,
    correctedById: c.correctedById,
    correctedAt: c.correctedAt instanceof Date ? c.correctedAt.getTime() : new Date(c.correctedAt).getTime(),
    isDeleted: c.isDeleted,
  }
}
