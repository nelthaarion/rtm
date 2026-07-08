'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import ReviewChart, { ReviewBar, ChartAnnotation } from '@/components/annotator/review-chart'
import { CONCEPT_MAP, ConceptType } from '@/lib/annotator/concepts'
import type { AppUser } from './login-modal'

interface HistoryTask {
  id: string
  instrument: { id: string; symbol: string; pipSize: number } | null
  timeframe: string
  candleCount: number
  startTimestamp: number
  endTimestamp: number
  assignedAt: number
  expiresAt: number
  submittedAt: number | null
  status: string         // PENDING | SUBMITTED | EXPIRED
  isActive: boolean
  editable: boolean
  pointsAwarded: number
  postId: string | null
  post: {
    id: string
    title: string
    status: string       // DRAFT | PENDING | APPROVED | DENIED | CORRECTED
    createdAt: number
    sentAt: number | null
    annotationCount: number
  } | null
}

interface HistorySummary {
  total: number
  submitted: number
  expired: number
  active: number
  totalPoints: number
}

interface TaskDetail {
  task: {
    id: string
    timeframe: string
    candleCount: number
    status: string
    isActive: boolean
    editable: boolean
    assignedAt: number
    expiresAt: number
    submittedAt: number | null
    pointsAwarded: number
    postId: string | null
  } | null
  instrument: { id: string; symbol: string; pipSize: number } | null
  bars: ReviewBar[]
  annotations: ChartAnnotation[]
  tradeSetups?: any[]
}

export default function TaskHistoryView({ user }: { user: AppUser }) {
  const [tasks, setTasks] = useState<HistoryTask[]>([])
  const [summary, setSummary] = useState<HistorySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [detail, setDetail] = useState<TaskDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Load task history list
  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks/history')
      if (!res.ok) { toast.error('Failed to load history'); return }
      const data = await res.json()
      setTasks(data.tasks || [])
      setSummary(data.summary || null)
      // Auto-select the first task (most recent) if none selected
      if (!selectedTaskId && data.tasks && data.tasks.length > 0) {
        setSelectedTaskId(data.tasks[0].id)
      }
    } catch {
      toast.error('Failed to load history')
    } finally { setLoading(false) }
  }, [selectedTaskId])

  useEffect(() => { loadHistory() }, [loadHistory])

  // Load task detail when selection changes
  useEffect(() => {
    if (!selectedTaskId) { setDetail(null); return }
    setDetailLoading(true)
    fetch(`/api/tasks/${selectedTaskId}`)
      .then(r => r.json())
      .then(async (data) => {
        // If the task has a post, also load trade setups
        if (data.task?.postId) {
          try {
            const tsRes = await fetch(`/api/posts/${data.task.postId}/trade-setups`)
            if (tsRes.ok) {
              const tsData = await tsRes.json()
              data.tradeSetups = tsData.tradeSetups || []
            }
          } catch {}
        }
        setDetail(data)
      })
      .catch(() => toast.error('Failed to load task detail'))
      .finally(() => setDetailLoading(false))
  }, [selectedTaskId])

  const formatDate = (ts: number | null) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <Badge variant="secondary" className="text-[10px] bg-blue-500/20 text-blue-400">Submitted</Badge>
      case 'EXPIRED': return <Badge variant="destructive" className="text-[10px]">Expired</Badge>
      case 'PENDING': return <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-400">Active</Badge>
      default: return <Badge variant="outline" className="text-[10px]">{status}</Badge>
    }
  }

  const postStatusBadge = (status: string | null) => {
    if (!status) return null
    switch (status) {
      case 'APPROVED': return <Badge variant="secondary" className="text-[10px] bg-green-500/20 text-green-400">Approved</Badge>
      case 'DENIED': return <Badge variant="destructive" className="text-[10px]">Denied</Badge>
      case 'CORRECTED': return <Badge variant="secondary" className="text-[10px] bg-purple-500/20 text-purple-400">Corrected</Badge>
      case 'PENDING': return <Badge variant="outline" className="text-[10px] bg-blue-500/20 text-blue-400">In Review</Badge>
      default: return <Badge variant="outline" className="text-[10px]">{status}</Badge>
    }
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Left: task list */}
      <aside className="w-80 shrink-0 border-r flex flex-col min-h-0 bg-card">
        <div className="px-3 py-2 border-b bg-muted/30 shrink-0">
          <h3 className="text-sm font-semibold">Task History</h3>
          {summary && (
            <div className="text-[10px] text-muted-foreground mt-1 flex gap-2 flex-wrap">
              <span>{summary.total} total</span>·
              <span className="text-blue-400">{summary.submitted} submitted</span>·
              <span className="text-red-400">{summary.expired} expired</span>·
              <span className="text-amber-400">{summary.active} active</span>·
              <span>{summary.totalPoints} pts</span>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-1 space-y-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <p className="mb-2">No tasks yet.</p>
                <p>Go to the Annotate tab to get your first task.</p>
              </div>
            ) : (
              tasks.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    selectedTaskId === t.id
                      ? 'border-foreground bg-muted'
                      : 'border-transparent hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-semibold">{t.instrument?.symbol || '?'}</span>
                      <Badge variant="outline" className="text-[9px] h-4">{t.timeframe}</Badge>
                    </div>
                    {statusBadge(t.status)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Assigned: {formatDate(t.assignedAt)}
                  </div>
                  {t.submittedAt && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Submitted: {formatDate(t.submittedAt)}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {t.post && postStatusBadge(t.post.status)}
                      {t.post && (
                        <span className="text-[10px] text-muted-foreground">
                          {t.post.annotationCount} ann
                        </span>
                      )}
                    </div>
                    {t.pointsAwarded > 0 && (
                      <span className="text-[10px] font-mono text-green-400">+{t.pointsAwarded}pts</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Right: task detail (chart + annotations, read-only) */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col">
        {detailLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Loading task...</div>
          </div>
        ) : !detail || !detail.task ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Select a task to view</div>
          </div>
        ) : (
          <>
            {/* Task detail header */}
            <div className="border-b px-3 py-2 flex flex-wrap items-center gap-2 shrink-0 bg-muted/30">
              <span className="text-sm font-mono font-semibold">{detail.instrument?.symbol || '?'}</span>
              <Badge variant="outline" className="text-[10px]">{detail.task.timeframe}</Badge>
              <Badge variant="outline" className="text-[10px]">{detail.task.candleCount} candles</Badge>
              {statusBadge(detail.task.status)}
              <div className="flex-1" />
              {detail.task.editable ? (
                <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-400">
                  ✏️ Editable — go to Annotate tab to modify
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  🔒 Read-only
                </Badge>
              )}
            </div>

            {/* Chart (read-only for submitted/expired; editable for active) */}
            <div className="flex-1 min-h-0">
              {detail.bars.length > 0 ? (
                <ReviewChart
                  instrumentId={detail.instrument?.id || ''}
                  timeframe={detail.task.timeframe}
                  pipSize={detail.instrument?.pipSize ?? 0.0001}
                  annotations={detail.annotations.map(a => ({
                    id: a.id,
                    type: a.type as ConceptType,
                    priceStart: a.priceStart,
                    priceEnd: a.priceEnd,
                    timeStart: typeof a.timeStart === 'number' ? a.timeStart : new Date(a.timeStart).getTime(),
                    timeEnd: typeof a.timeEnd === 'number' ? a.timeEnd : new Date(a.timeEnd).getTime(),
                    points: a.points,
                    arrow: a.arrow,
                  }))}
                  bars={detail.bars}
                  tradeSetups={detail.tradeSetups}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No bars available for this task.
                </div>
              )}
            </div>

            {/* Annotations list (below chart) */}
            {detail.annotations.length > 0 && (
              <div className="border-t max-h-40 overflow-y-auto shrink-0 bg-card">
                <div className="px-3 py-2 border-b bg-muted/30 sticky top-0">
                  <h4 className="text-xs font-semibold">Annotations ({detail.annotations.length})</h4>
                </div>
                <div className="p-2 space-y-1">
                  {detail.annotations.map(a => {
                    const concept = CONCEPT_MAP[a.type as ConceptType]
                    if (!concept) return null
                    return (
                      <div key={a.id} className="flex items-center gap-2 p-2 rounded border border-transparent hover:bg-muted/50 text-xs">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: concept.color }} />
                        <span className="font-mono font-semibold text-[10px]">{concept.shortLabel}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">· {(a as any).direction}</span>
                        {a.points && (
                          <span className="text-[10px] text-muted-foreground">
                            · {a.points.length} points
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                          {a.priceStart.toFixed(5)} → {a.priceEnd.toFixed(5)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
