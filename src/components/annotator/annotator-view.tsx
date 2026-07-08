'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import AnnotatorChart, { Bar, DraftAnnotation } from '@/components/annotator/annotator-chart'
import ConceptPalette from '@/components/annotator/concept-palette'
import AnnotationForm, { AnnotationDraft } from '@/components/annotator/annotation-form'
import { ConceptType, CONCEPT_MAP } from '@/lib/annotator/concepts'
import type { AppUser } from './login-modal'

interface TaskData {
  task: { id: string; timeframe: string; candleCount: number; status: string; assignedAt: number; expiresAt: number; timeRemaining: number; taskType: string } | null
  instrument: { id: string; symbol: string; pipSize: number } | null
  bars: Bar[]
  barCount?: number
  warning?: string | null
}

export default function AnnotatorView({ user }: { user: AppUser; instruments: any[] }) {
  const [taskData, setTaskData] = useState<TaskData>({ task: null, instrument: null, bars: [] })
  const [loading, setLoading] = useState(true)
  const [annotations, setAnnotations] = useState<any[]>([])
  const [activeTool, setActiveTool] = useState<ConceptType | null>(null)
  const [direction, setDirection] = useState<'bullish' | 'bearish' | 'neutral'>('bullish')
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  const [draftForForm, setDraftForForm] = useState<AnnotationDraft | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [mobilePanel, setMobilePanel] = useState<'tools' | 'list' | null>(null)

  const [loadError, setLoadError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState<{ submittedAt: number; cooldownMs: number; remainingMs: number; availableAt: number } | null>(null)

  const loadTask = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      // Step 1: try to fetch the active task
      let res = await fetch('/api/tasks/active')
      if (res.status === 401) {
        setLoadError('Your session has expired. Please reload the page to log in again.')
        setLoading(false); return
      }
      if (!res.ok) {
        setLoadError(`Failed to load active task (HTTP ${res.status}).`)
        setLoading(false); return
      }
      let data = await res.json()

      // Step 2: if no active task, try to assign one
      if (!data.task) {
        res = await fetch('/api/tasks/assign', { method: 'POST' })
        if (res.status === 401) {
          setLoadError('Your session has expired. Please reload the page to log in again.')
          setLoading(false); return
        }
        if (res.status === 429) {
          // Cooldown active — show countdown instead of error
          const errBody = await res.json().catch(() => ({}))
          if (errBody.cooldown) {
            setCooldown(errBody.cooldown)
            setLoadError(null)
          } else {
            setLoadError(errBody.error || 'Task cooldown active.')
          }
          setLoading(false); return
        }
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          setLoadError(errBody.error || `Failed to assign a new task (HTTP ${res.status}).`)
          setLoading(false); return
        }
        // Task assigned — clear any cooldown
        setCooldown(null)
        res = await fetch('/api/tasks/active')
        if (!res.ok) {
          setLoadError(`Failed to load task after assign (HTTP ${res.status}).`)
          setLoading(false); return
        }
        data = await res.json()
      }

      // Step 3: surface API warnings (e.g., fewer bars than expected)
      if (data.warning) {
        toast.error(data.warning)
      }

      setTaskData(data); setAnnotations([]); setSelectedAnnotationId(null); setDraftForForm(null)
      if (data.task) setTimeRemaining(data.task.timeRemaining)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network error while loading task'
      setLoadError(msg)
      toast.error('Failed to load task')
    } finally { setLoading(false) }
  }, [])

  const discardAndReload = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      // Discard any current PENDING task (e.g., one with missing bars)
      await fetch('/api/tasks/discard', { method: 'POST' })
    } catch {
      // ignore — we'll retry assign anyway
    }
    await loadTask()
  }, [loadTask])

  useEffect(() => { loadTask() }, [loadTask])

  // Cooldown countdown timer
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  useEffect(() => {
    if (!cooldown) { setCooldownRemaining(0); return }
    const update = () => {
      const remaining = Math.max(0, cooldown.availableAt - Date.now())
      setCooldownRemaining(remaining)
      if (remaining <= 0) {
        setCooldown(null)
        loadTask()
      }
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [cooldown, loadTask])

  // Auto-generate polling: every 5 minutes, call the auto-generate endpoint
  // to ensure a new task exists if the current one expired.
  // This complements the server-side 3-hour cron.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetch('/api/tasks/auto-generate', { method: 'POST' })
        // If the current task expired or doesn't exist, reload
        if (!taskData.task || taskData.task.expiresAt <= Date.now()) {
          loadTask()
        }
      } catch {}
    }, 5 * 60 * 1000) // every 5 minutes
    return () => clearInterval(interval)
  }, [taskData.task, loadTask])

  useEffect(() => {
    if (!taskData.task) return
    const interval = setInterval(() => {
      const remaining = taskData.task!.expiresAt - Date.now()
      setTimeRemaining(remaining)
      if (remaining <= 0) { toast.error('Task expired!'); clearInterval(interval); loadTask() }
    }, 1000)
    return () => clearInterval(interval)
  }, [taskData.task])

  const handleCreateDraft = useCallback((draft: DraftAnnotation) => {
    const concept = CONCEPT_MAP[draft.type]
    const tempId = `temp-${Date.now()}`
    setAnnotations(a => [...a, { id: tempId, type: draft.type, direction: draft.direction, priceStart: draft.priceStart, priceEnd: draft.priceEnd, timeStart: draft.timeStart, timeEnd: draft.timeEnd, label: concept.shortLabel, points: draft.points, arrow: draft.arrow, schema: { ...concept.schemaTemplate } }])
    setDraftForForm({ type: draft.type, direction: draft.direction, timeframe: taskData.task?.timeframe || 'H1', priceStart: draft.priceStart, priceEnd: draft.priceEnd, timeStart: draft.timeStart, timeEnd: draft.timeEnd, outcome: 'pending', labeler: user.name, schema: { ...concept.schemaTemplate }, points: draft.points, arrow: draft.arrow })
    setActiveTool(null)
  }, [taskData.task, user.name])

  const handleSelectAnnotation = useCallback((id: string | null) => {
    setSelectedAnnotationId(id)
    if (!id) { setDraftForForm(null); return }
    const ann = annotations.find(a => a.id === id)
    if (!ann) return
    setDraftForForm({ id: ann.id, type: ann.type, direction: ann.direction, timeframe: taskData.task?.timeframe || 'H1', priceStart: ann.priceStart, priceEnd: ann.priceEnd, timeStart: ann.timeStart, timeEnd: ann.timeEnd, outcome: 'pending', labeler: user.name, schema: ann.schema || { ...CONCEPT_MAP[ann.type as ConceptType]?.schemaTemplate }, points: ann.points, arrow: ann.arrow })
  }, [annotations, taskData.task, user.name])

  const handleSaveAnnotation = useCallback((draft: AnnotationDraft) => {
    setAnnotations(a => a.map(x => (x.id === (draft.id || selectedAnnotationId)) ? { ...x, type: draft.type, direction: draft.direction, priceStart: draft.priceStart, priceEnd: draft.priceEnd, timeStart: draft.timeStart, timeEnd: draft.timeEnd, points: draft.points, arrow: draft.arrow, schema: draft.schema } : x))
    setDraftForForm(null); setSelectedAnnotationId(null); toast.success('Annotation saved')
  }, [selectedAnnotationId])

  const handleDeleteAnnotation = useCallback((id: string) => {
    setAnnotations(a => a.filter(x => x.id !== id)); setDraftForForm(null); setSelectedAnnotationId(null); toast.success('Annotation deleted')
  }, [])

  const handleSubmitTask = useCallback(async () => {
    if (annotations.length === 0) { toast.error('Draw at least one annotation'); return }
    setLoading(true)
    try {
      const payload = annotations.map(a => ({ type: a.type, direction: a.direction, priceStart: a.priceStart, priceEnd: a.priceEnd, timeStart: a.timeStart, timeEnd: a.timeEnd, schema: a.schema, points: a.points, arrow: a.arrow }))
      const res = await fetch('/api/tasks/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annotations: payload }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Submit failed'); return }
      toast.success(`Task submitted! +${data.pointsAwarded} points`)
      // Immediately clear annotations so old ones don't show during cooldown
      setAnnotations([])
      setSelectedAnnotationId(null)
      setDraftForForm(null)
      setActiveTool(null)
      loadTask()
    } catch { toast.error('Submit failed') }
    finally { setLoading(false) }
  }, [annotations, loadTask])

  // Create Post from a specific annotation (right-click → Create Post)
  // Submits the current task with all annotations, same as Submit Task.
  // This is a convenience shortcut from the chart context menu.
  const handleCreatePost = useCallback(async (annotationId: string) => {
    const ann = annotations.find(a => a.id === annotationId)
    if (!ann) { toast.error('Annotation not found'); return }
    if (annotations.length === 0) { toast.error('No annotations to post'); return }
    // Confirm with the user
    const ok = window.confirm(
      `Create a post with ${annotations.length} annotation(s)?\n` +
      `This will submit your current task and create a reviewable post.\n` +
      `Selected: ${CONCEPT_MAP[ann.type as ConceptType]?.shortLabel || ann.type}`
    )
    if (!ok) return
    await handleSubmitTask()
  }, [annotations, handleSubmitTask])

  const formatTime = (ms: number) => {
    if (ms <= 0) return 'EXPIRED'
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000)
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const { task, instrument, bars } = taskData

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Task header */}
      <div className="border-b px-3 py-2 flex flex-wrap items-center gap-2 shrink-0 bg-muted/20">
        {task ? (
          <>
            <Badge variant={timeRemaining < 1800000 ? 'destructive' : 'secondary'} className="text-xs font-mono tabular-nums">
              {timeRemaining < 1800000 ? '⏱' : '🕐'} {formatTime(timeRemaining)}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono">{task.candleCount} candles</Badge>
            <Badge variant="outline" className="text-[10px] font-mono">{task.timeframe}</Badge>
            {instrument && <Badge variant="outline" className="text-[10px] font-mono">{instrument.symbol}</Badge>}
            <Badge variant="outline" className="text-[10px]">{annotations.length} annotations</Badge>
            <div className="flex-1" />
            <Button size="sm" className="h-7 text-xs" onClick={handleSubmitTask} disabled={loading || annotations.length === 0}>
              {loading ? 'Submitting...' : 'Submit Task'}
            </Button>
          </>
        ) : cooldown ? (
          <>
            <Badge variant="secondary" className="text-xs font-mono tabular-nums bg-amber-600/20 text-amber-400 border-amber-600/30">
              ⏳ Cooldown: {Math.floor(cooldownRemaining / 3600000)}h {Math.floor((cooldownRemaining % 3600000) / 60000)}m {Math.floor((cooldownRemaining % 60000) / 1000)}s
            </Badge>
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground">Next task auto-generates when cooldown ends</span>
          </>
        ) : <span className="text-xs text-muted-foreground">{loading ? 'Loading task...' : 'No active task — a new one will be generated automatically'}</span>}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: tools */}
        <aside className={`${mobilePanel === 'tools' ? 'absolute inset-y-0 left-0 z-20 w-64 shadow-xl' : 'hidden'} lg:relative lg:block lg:w-56 shrink-0 h-full`}>
          <ConceptPalette activeTool={activeTool} onSelectTool={(t) => {
            if (t && !taskData.task) {
              toast.error('No active task! Wait for a new task to be generated, or click "Get New Task".')
              return
            }
            setActiveTool(t); setMobilePanel(null)
          }} direction={direction} onDirectionChange={setDirection} />
        </aside>

        {/* Center: chart */}
        <main className="flex-1 relative min-w-0 min-h-0">
          {loading ? <div className="flex items-center justify-center h-full"><div className="text-sm text-muted-foreground">Loading task...</div></div>
          : cooldown ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-amber-600/10 border-2 border-amber-600/30 flex items-center justify-center">
                <span className="text-3xl">⏳</span>
              </div>
              <div>
                <div className="text-lg font-semibold text-amber-400 mb-1">Task Cooldown Active</div>
                <div className="text-sm text-muted-foreground">
                  You submitted a task recently. A new task will be available in:
                </div>
              </div>
              <div className="text-4xl font-mono font-bold text-amber-400 tabular-nums tracking-tight">
                {Math.floor(cooldownRemaining / 3600000)}h {Math.floor((cooldownRemaining % 3600000) / 60000)}m {Math.floor((cooldownRemaining % 60000) / 1000)}s
              </div>
              <div className="text-xs text-muted-foreground max-w-md">
                Tasks are generated every 3 hours. Your next task will appear automatically when the cooldown ends.
              </div>
              <Button size="sm" variant="outline" onClick={() => loadTask()}>Check Again</Button>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <div className="text-sm text-destructive font-medium">{loadError}</div>
              <Button size="sm" variant="outline" onClick={() => loadTask()}>Retry</Button>
            </div>
          ) : bars.length > 0 ? (
            <AnnotatorChart bars={bars} annotations={annotations} activeTool={activeTool} direction={direction} selectedAnnotationId={selectedAnnotationId} onSelectAnnotation={handleSelectAnnotation} onCreateDraft={handleCreateDraft} onCreatePost={handleCreatePost} pipSize={instrument?.pipSize ?? 0.0001} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <div className="text-sm text-muted-foreground">
                {task
                  ? `Task assigned but no bars were returned (expected ${task.candleCount}). The data may have been deleted.`
                  : 'No active task. A new one will be generated automatically.'}
              </div>
              <Button size="sm" variant="outline" onClick={() => loadTask()}>Check for New Task</Button>
            </div>
          )}
        </main>

        {/* Right: annotations */}
        <aside className={`${mobilePanel === 'list' ? 'absolute inset-y-0 right-0 z-20 w-80 shadow-xl' : 'hidden'} lg:relative lg:block lg:w-80 shrink-0 h-full`}>
          {draftForForm ? (
            <AnnotationForm draft={draftForForm} onSave={handleSaveAnnotation} onCancel={() => { setDraftForForm(null); setSelectedAnnotationId(null) }} onDelete={draftForForm.id ? handleDeleteAnnotation : undefined} />
          ) : (
            <div className="flex flex-col h-full min-h-0 bg-background border-l">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold">Annotations ({annotations.length})</h3>
                <Button size="sm" className="h-7 text-xs" onClick={handleSubmitTask} disabled={annotations.length === 0 || loading}>Submit Task</Button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
                {annotations.length === 0 ? <div className="p-6 text-center text-xs text-muted-foreground"><p className="mb-3">No annotations yet.</p><p>Pick a tool and draw on the chart.</p></div>
                : annotations.map(a => { const concept = CONCEPT_MAP[a.type as ConceptType]; if (!concept) return null; return (
                  <div key={a.id} className={`group flex items-center gap-2 p-2 rounded border transition-colors ${selectedAnnotationId === a.id ? 'border-foreground bg-muted' : 'border-transparent hover:bg-muted/50'}`}>
                    <button onClick={() => handleSelectAnnotation(a.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: concept.color }} />
                      <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><span className="text-[10px] font-mono font-semibold">{concept.shortLabel}</span><span className="text-[10px] text-muted-foreground capitalize">· {a.direction}</span></div><div className="text-[10px] text-muted-foreground font-mono truncate">{a.priceStart.toFixed(5)} → {a.priceEnd.toFixed(5)}</div></div>
                    </button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteAnnotation(a.id)}>×</Button>
                  </div>
                )})}
              </div>
              <div className="px-3 py-2 border-t text-[10px] text-muted-foreground shrink-0">Draw → Submit Task. A new task loads automatically.</div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden border-t flex gap-1 p-1 shrink-0 bg-card">
        <Button size="sm" variant={mobilePanel === 'tools' ? 'default' : 'outline'} className="h-7 flex-1 text-xs" onClick={() => setMobilePanel(mobilePanel === 'tools' ? null : 'tools')}>Tools</Button>
        <Button size="sm" variant={mobilePanel === 'list' ? 'default' : 'outline'} className="h-7 flex-1 text-xs" onClick={() => setMobilePanel(mobilePanel === 'list' ? null : 'list')}>Annotations ({annotations.length})</Button>
      </div>
    </div>
  )
}
