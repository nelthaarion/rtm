import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const corrected = await db.correctedAnnotation.findMany({ where: { postId: id }, orderBy: { timeStart: 'asc' } })
  return NextResponse.json({ correctedAnnotations: corrected.map(c => {
    const parsed = JSON.parse(c.schemaJson)
    const { _points, _arrow, _tradeZones, ...schema } = parsed
    return {
      id: c.id,
      originalId: c.originalId,
      type: c.type,
      direction: c.direction,
      priceStart: c.priceStart,
      priceEnd: c.priceEnd,
      timeStart: c.timeStart.getTime(),
      timeEnd: c.timeEnd.getTime(),
      schema,
      points: _points,
      arrow: _arrow,
      tradeZones: _tradeZones,  // { entry?, sl?, tp? }
      isDeleted: c.isDeleted,
    }
  }) })
}
