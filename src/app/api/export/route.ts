import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/export?instrumentId=...&format=json|csv
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const instrumentId = searchParams.get('instrumentId')
  const format = searchParams.get('format') || 'json'

  if (!instrumentId) {
    return NextResponse.json({ error: 'instrumentId required' }, { status: 400 })
  }

  const instrument = await db.instrument.findUnique({ where: { id: instrumentId } })
  if (!instrument) {
    return NextResponse.json({ error: 'instrument not found' }, { status: 404 })
  }

  const annotations = await db.annotation.findMany({
    where: { instrumentId },
    orderBy: { timeStart: 'asc' },
  })

  const rows = annotations.map(a => {
    const schema = JSON.parse(a.schemaJson)
    return {
      id: a.id,
      instrument: instrument.symbol,
      type: a.type,
      timeframe: a.timeframe,
      direction: a.direction,
      priceStart: a.priceStart,
      priceEnd: a.priceEnd,
      timeStart: a.timeStart.toISOString(),
      timeEnd: a.timeEnd.toISOString(),
      outcome: a.outcome,
      labeler: a.labeler,
      // 10-field schema
      definition: schema.definition || '',
      purpose: schema.purpose || '',
      context: schema.context || '',
      whyItForms: schema.whyItForms || '',
      identification: schema.identification || '',
      commonMistakes: schema.commonMistakes || '',
      failureConditions: schema.failureConditions || '',
      relationships: schema.relationships || '',
      probabilityContribution: schema.probabilityContribution || '',
      realChartExample: schema.realChartExample || '',
    }
  })

  if (format === 'csv') {
    const headers = [
      'id', 'instrument', 'type', 'timeframe', 'direction',
      'priceStart', 'priceEnd', 'timeStart', 'timeEnd',
      'outcome', 'labeler',
      'definition', 'purpose', 'context', 'whyItForms',
      'identification', 'commonMistakes', 'failureConditions',
      'relationships', 'probabilityContribution', 'realChartExample',
    ]
    const escape = (v: any) => {
      const s = String(v ?? '').replace(/"/g, '""')
      return /[",\n]/.test(s) ? `"${s}"` : s
    }
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape((r as any)[h])).join(',')),
    ].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rtm_annotations_${instrument.symbol}.csv"`,
      },
    })
  }

  return NextResponse.json({
    instrument: instrument.symbol,
    count: rows.length,
    annotations: rows,
  })
}
