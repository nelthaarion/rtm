'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ReviewChart, { ReviewBar, ChartAnnotation } from '@/components/annotator/review-chart'
import { CONCEPT_MAP, ConceptType } from '@/lib/annotator/concepts'

export default function ApprovedView({ instruments }: { instruments: any[] }) {
  const [posts, setPosts] = useState<any[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [postData, setPostData] = useState<{ post: any; bars: ReviewBar[] } | null>(null)
  const [originalAnns, setOriginalAnns] = useState<any[]>([])
  const [correctedAnns, setCorrectedAnns] = useState<any[]>([])
  const [tradeSetups, setTradeSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Load approved + corrected posts
  useEffect(() => {
    let active = true
    const load = async () => {
      const [res1, res2] = await Promise.all([
        fetch('/api/posts?status=APPROVED'),
        fetch('/api/posts?status=CORRECTED'),
      ])
      const d1 = await res1.json()
      const d2 = res2.ok ? await res2.json() : { posts: [] }
      if (active) setPosts([...(d1.posts || []), ...(d2.posts || [])])
    }
    load()
    return () => { active = false }
  }, [])

  // Load post detail when selected
  useEffect(() => {
    if (!selectedPostId) {
      setPostData(null); setOriginalAnns([]); setCorrectedAnns([]); setTradeSetups([])
      return
    }
    setLoading(true)
    Promise.all([
      fetch(`/api/posts/${selectedPostId}`).then(r => r.json()),
      fetch(`/api/posts/${selectedPostId}/annotations`).then(r => r.json()),
      fetch(`/api/posts/${selectedPostId}/corrected`).then(r => r.json()),
      fetch(`/api/posts/${selectedPostId}/trade-setups`).then(r => r.json()),
    ]).then(([pd, oa, ca, ts]) => {
      setPostData(pd)
      setOriginalAnns(oa.annotations || [])
      setCorrectedAnns(ca.correctedAnnotations || [])
      setTradeSetups(ts.tradeSetups || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [selectedPostId])

  const handleExport = async (format: string) => {
    const res = await fetch(`/api/export?status=APPROVED&format=${format}`)
    if (!res.ok) return
    if (format === 'csv') {
      const text = await res.text()
      const blob = new Blob([text], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'rtm_approved.csv'; a.click()
    } else {
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'rtm_approved.json'; a.click()
    }
  }

  const hasCorrections = correctedAnns.length > 0
  const pipSize = postData?.post?.instrument?.pipSize ?? 0.0001

  // Map annotations to the ReviewChart format
  const mapAnns = (anns: any[]): ChartAnnotation[] => anns.map(a => ({
    id: a.id,
    type: a.type as ConceptType,
    priceStart: a.priceStart,
    priceEnd: a.priceEnd,
    timeStart: typeof a.timeStart === 'number' ? a.timeStart : new Date(a.timeStart).getTime(),
    timeEnd: typeof a.timeEnd === 'number' ? a.timeEnd : new Date(a.timeEnd).getTime(),
    points: a.points,
    arrow: a.arrow,
  }))

  return (
    <div className="flex h-full min-h-0">
      {/* Left: post list */}
      <div className="w-72 shrink-0 border-r flex flex-col h-full min-h-0">
        <div className="px-3 py-2 border-b bg-muted/20 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold">Approved ({posts.length})</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => handleExport('json')}>JSON</Button>
            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => handleExport('csv')}>CSV</Button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
          {posts.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No approved posts.</div>
          ) : posts.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPostId(p.id)}
              className={`w-full flex items-start gap-2 p-2 rounded border text-left transition-colors ${
                selectedPostId === p.id ? 'border-foreground bg-muted' : 'border-transparent hover:bg-muted/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-semibold">{p.instrument?.symbol}</span>
                  <span className="text-[10px] text-muted-foreground">{p.timeframe}</span>
                  {p.status === 'CORRECTED' && (
                    <Badge variant="outline" className="text-[9px] bg-purple-500/20 text-purple-400">Corrected</Badge>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">by {p.user?.name} · {p.annotationCount} annotations</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: charts + annotations */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : !selectedPostId || !postData ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {posts.length > 0 ? 'Select a post to view' : 'No approved posts'}
          </div>
        ) : (
          <>
            {/* Post header */}
            <div className="border-b px-3 py-2 flex flex-wrap items-center gap-2 shrink-0 bg-muted/30">
              <span className="text-sm font-mono font-semibold">{postData.post.instrument?.symbol}</span>
              <Badge variant="outline" className="text-[10px]">{postData.post.timeframe}</Badge>
              <span className="text-xs text-muted-foreground">by {postData.post.user?.name}</span>
              {postData.post.status === 'CORRECTED' && (
                <Badge variant="outline" className="text-[10px] bg-purple-500/20 text-purple-400">Corrected</Badge>
              )}
              <div className="flex-1" />
              <span className="text-[10px] text-muted-foreground">
                {originalAnns.length} original · {correctedAnns.length} corrected
              </span>
            </div>

            {/* Charts: side-by-side if corrections exist, single if not */}
            <div className={`flex-1 min-h-0 flex ${hasCorrections ? 'flex-row' : 'flex-col'}`}>
              {/* Original chart */}
              <div className="flex-1 min-w-0 min-h-0 flex flex-col border-r">
                <div className="px-2 py-1 border-b bg-muted/20 shrink-0">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Original (user-submitted)
                  </span>
                </div>
                <div className="flex-1 min-h-0">
                  {postData.bars.length > 0 ? (
                    <ReviewChart
                      instrumentId={postData.post.instrumentId}
                      timeframe={postData.post.timeframe}
                      pipSize={pipSize}
                      annotations={mapAnns(originalAnns)}
                      bars={postData.bars}
                      tradeSetups={tradeSetups}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      No bars available
                    </div>
                  )}
                </div>
              </div>

              {/* Corrected chart (only if corrections exist) */}
              {hasCorrections && (
                <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                  <div className="px-2 py-1 border-b bg-purple-500/10 shrink-0">
                    <span className="text-[10px] font-semibold uppercase text-purple-400">
                      Corrected (reviewer-fixed)
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    {postData.bars.length > 0 ? (
                      <ReviewChart
                        instrumentId={postData.post.instrumentId}
                        timeframe={postData.post.timeframe}
                        pipSize={pipSize}
                        annotations={mapAnns(correctedAnns)}
                        bars={postData.bars}
                        tradeSetups={tradeSetups}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        No bars available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Annotations comparison list (below charts) */}
            <div className="border-t max-h-48 overflow-y-auto shrink-0 bg-card">
              <div className="px-3 py-2 border-b bg-muted/30 sticky top-0 flex items-center gap-3">
                <h4 className="text-xs font-semibold">Schema Comparison</h4>
                <span className="text-[10px] text-muted-foreground">Click a row to expand</span>
              </div>
              <div className="p-2 space-y-2">
                {originalAnns.map(orig => {
                  const corrected = correctedAnns.find(c => c.originalId === orig.id)
                  const concept = CONCEPT_MAP[orig.type as ConceptType]
                  if (!concept) return null
                  return (
                    <ComparisonRow key={orig.id} original={orig} corrected={corrected} />
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Comparison row: shows original vs corrected schema side by side ───────
function ComparisonRow({ original, corrected }: { original: any; corrected?: any }) {
  const [expanded, setExpanded] = useState(false)
  const concept = CONCEPT_MAP[original.type as ConceptType]
  if (!concept) return null

  const schemaFields = [
    'definition', 'purpose', 'context', 'whyItForms', 'identification',
    'commonMistakes', 'failureConditions', 'relationships',
    'probabilityContribution', 'realChartExample',
  ]

  // Find which fields differ
  const diffs = corrected ? schemaFields.filter(f =>
    (original.schema?.[f] || '') !== (corrected.schema?.[f] || '')
  ) : []

  return (
    <div className="border rounded">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted/30"
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: concept.color }} />
        <span className="text-xs font-mono font-semibold">{concept.shortLabel}</span>
        <span className="text-[10px] text-muted-foreground capitalize">· {original.direction}</span>
        {corrected ? (
          diffs.length > 0 ? (
            <Badge variant="outline" className="text-[9px] bg-purple-500/20 text-purple-400">
              {diffs.length} field{diffs.length !== 1 ? 's' : ''} changed
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] bg-green-500/20 text-green-400">No changes</Badge>
          )
        ) : (
          <Badge variant="outline" className="text-[9px]">Original only</Badge>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {expanded ? '▼' : '▶'}
        </span>
      </button>
      {expanded && (
        <div className="border-t p-2 space-y-2 bg-muted/10">
          {schemaFields.map(field => {
            const origVal = original.schema?.[field] || '—'
            const corrVal = corrected?.schema?.[field] || '—'
            const isDiff = origVal !== corrVal
            return (
              <div key={field} className="text-[11px]">
                <div className="font-semibold text-muted-foreground mb-0.5">{field}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-1.5 rounded ${isDiff ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-muted/30'}`}>
                    <div className="text-[9px] text-muted-foreground mb-0.5">Original</div>
                    <div className="text-[10px]">{origVal}</div>
                  </div>
                  {corrected && (
                    <div className={`p-1.5 rounded ${isDiff ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-muted/30'}`}>
                      <div className="text-[9px] text-muted-foreground mb-0.5">Corrected</div>
                      <div className="text-[10px]">{corrVal}</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
