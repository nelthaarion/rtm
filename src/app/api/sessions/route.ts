import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/sessions?instrumentId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const instrumentId = searchParams.get('instrumentId')

  const where: any = {}
  if (instrumentId) where.instrumentId = instrumentId

  const sessions = await db.annotationSession.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    take: 100,
    include: {
      _count: { select: { annotations: true } },
    },
  })

  return NextResponse.json({
    sessions: sessions.map(s => ({
      id: s.id,
      instrumentId: s.instrumentId,
      labeler: s.labeler,
      startedAt: s.startedAt.getTime(),
      endedAt: s.endedAt?.getTime() ?? null,
      notes: s.notes,
      annotationCount: (s as any)._count?.annotations ?? 0,
    })),
  })
}
