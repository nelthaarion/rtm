'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import ChartCanvas, { Bar, DraftAnnotation } from '@/components/annotator/chart-canvas'
import ConceptPalette from '@/components/annotator/concept-palette'
import AnnotationForm, { AnnotationDraft } from '@/components/annotator/annotation-form'
import { ConceptType, CONCEPT_MAP } from '@/lib/annotator/concepts'
import type { AppUser } from './login-modal'

interface TaskData {
  task: {
    id: string
    timeframe: string
    candleCount: number
    status: string
    assignedAt: number
    expiresAt: number
    timeRemaining: number
    taskType: string
  } | null
  instrument: { id: string; symbol: string; pipSize: number } | null
  bars: Bar[]
}

interface TaskViewProps {
  user: AppUser
}

export default function TaskView({ user }: TaskViewProps) {
  const [taskData, setTaskData] = useState<TaskData>({ task: null, instrument: null, bars: [] })
  const [loading, setLoading] = useState(false)
  const [annotations, setAnnotations] = useState<any[]>([])
  const [activeTool, setActiveTool] = useState<ConceptType | null>(null)
  const [direction, setDirection] = useState<'bullish' | 'bearish' | 'neutral'>('bullish')
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  const [draftForForm, setDraftForForm] = useState<AnnotationDraft | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const loadTask = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks/active')
      if (!res.ok) return
      const data = await res.json()
      setTaskData(data)
      setAnnotations([])
      if (data.task) {
        setTimeRemaining(data.task.timeRemaining)
      }
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { loadTask() }, [loadTask])

  // Countdown timer
  useEffect(() => {
    if (!taskData.task) return
    const interval = setInterval(() => {
      const remaining = taskData.task!.expiresAt - Date.now()
      setTimeRemaining(remaining)
      if (remaining <= 0) {
        toast.error('Task expired!')
        loadTask()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [taskData.task])

  const handleAssign = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks/assign', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to get task'); return }
      toast.success('New task assigned!')
      loadTask()
    } catch { toast.error('Failed to get task') }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (annotations.length === 0) {
      toast.error('Draw at least one annotation before submitting')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotations }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Submit failed'); return }
      toast.success(`Task submitted! +${data.pointsAwarded} points`)
      setAnnotations([])
      loadTask()
    } catch { toast.error('Submit failed') }
    finally { setLoading(false) }
  }

  const handleCreateDraft = useCallback((draft: DraftAnnotation) => {
    const concept = CONCEPT_MAP[draft.type]
    const tempId = `temp-${Date.now()}`
    const newAnn = {
      id: tempId,
      type: draft.type,
      direction: draft.direction,
      priceStart: draft.priceStart,
      priceEnd: draft.priceEnd,
      timeStart: draft.timeStart,
      timeEnd: draft.timeEnd,
      label: concept.shortLabel,
      points: draft.points,
      arrow: draft.arrow,
      isDraft: true,
    }
    setAnnotations(a => [...a, newAnn])
    setDraftForForm({
      type: draft.type, direction: draft.direction, timeframe: taskData.task?.timeframe || 'H1',
      priceStart: draft.priceStart, priceEnd: draft.priceEnd,
      timeStart: draft.timeStart, timeEnd: draft.timeEnd,
      outcome: 'pending', labeler: user.name,
      schema: { ...concept.schemaTemplate },
      points: draft.points, arrow: draft.arrow,
    })
    setActiveTool(null)
  }, [taskData.task, user.name])

  const handleDeleteTemp = (id: string) => {
    setAnnotations(a => a.filter(x => x.id !== id))
  }

  const formatTime = (ms: number) => {
    if (ms <= 0) return 'EXPIRED'
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const { task, instrument, bars } = taskData

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Task header with countdown */}
      <div className="border-b px-4 py-2 flex flex-wrap items-center gap-2 shrink-0 bg-muted/30">
        <span className="text-xs font-semibold text-muted-foreground">TASK MODE</span>
        {task ? (
          <>
            <Badge variant={timeRemaining < 1800000 ? 'destructive' : 'secondary'} className="text-xs font-mono">
              ⏱ {formatTime(timeRemaining)}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{task.candleCount} candles</Badge>
            <Badge variant="outline" className="text-[10px]">{task.timeframe}</Badge>
            <div className="flex-1" />
            <Button size="sm" variant="default" className="h-7 text-xs" onClick={handleSubmit} disabled={loading || annotations.length === 0}>
              Submit Task ({annotations.length} annotations)
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1" />
            <Button size="sm" variant="default" className="h-7 text-xs" onClick={handleAssign} disabled={loading}>
              {loading ? 'Loading...' : 'Get New Task'}
            </Button>
          </>
        )}
      </div>

      {task && bars.length > 0 ? (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left: tools */}
          <aside className="hidden lg:block lg:w-56 lg:h-full shrink-0 overflow-hidden">
            <ConceptPalette activeTool={activeTool} onSelectTool={setActiveTool} direction={direction} onDirectionChange={setDirection} />
          </aside>

          {/* Center: chart (1000 candles, NO dates shown) */}
          <main className="flex-1 relative min-w-0">
            <ChartCanvas
              bars={bars}
              annotations={annotations}
              activeTool={activeTool}
              direction={direction}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={(id) => { setSelectedAnnotationId(id); if (!id) setDraftForForm(null) }}
              onCreateDraft={handleCreateDraft}
              pipSize={instrument?.pipSize ?? 0.0001}
              previewAnnotation={draftForForm ? {
                type: draftForForm.type, priceStart: draftForForm.priceStart, priceEnd: draftForForm.priceEnd,
                timeStart: draftForForm.timeStart, timeEnd: draftForForm.timeEnd,
                points: draftForForm.points, arrow: draftForForm.arrow,
              } : null}
            />
          </main>

          {/* Right: annotation list */}
          <aside className="hidden lg:block lg:w-80 lg:h-full shrink-0 overflow-hidden">
            {draftForForm ? (
              <AnnotationForm
                draft={draftForForm}
                onSave={() => {
                  setDraftForForm(null)
                  setSelectedAnnotationId(null)
                  toast.success('Annotation added to task')
                }}
                onCancel={() => { setDraftForForm(null); setSelectedAnnotationId(null) }}
              />
            ) : (
              <div className="flex flex-col h-full bg-background border-l">
                <div className="px-4 py-3 border-b bg-muted/30 shrink-0">
                  <h3 className="text-sm font-semibold">Task Annotations ({annotations.length})</h3>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-1">
                  {annotations.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No annotations yet. Pick a tool and draw on the chart.
                    </div>
                  ) : (
                    annotations.map(a => {
                      const concept = CONCEPT_MAP[a.type as ConceptType]
                      if (!concept) return null
                      return (
                        <div key={a.id} className="group w-full flex items-center gap-2 p-2 rounded border border-transparent hover:bg-muted/50">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: concept.color }} />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono font-semibold">{concept.shortLabel}</span>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">{a.priceStart.toFixed(5)} → {a.priceEnd.toFixed(5)}</div>
                          </div>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTemp(a.id)}>×</Button>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="px-3 py-2 border-t shrink-0">
                  <Button size="sm" variant="default" className="w-full h-7 text-xs" onClick={handleSubmit} disabled={annotations.length === 0}>
                    Submit Task
                  </Button>
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">No active task. Click "Get New Task" to receive 1000 candles to annotate.</p>
                <Button onClick={handleAssign} disabled={loading}>Get New Task</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
