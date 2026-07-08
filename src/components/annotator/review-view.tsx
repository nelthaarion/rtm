'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import ReviewChart, { ReviewBar, ChartAnnotation } from '@/components/annotator/review-chart'
import AnnotatorChart, { Bar, TradeZones } from '@/components/annotator/annotator-chart'
import { CONCEPT_MAP, ConceptType, CONCEPTS } from '@/lib/annotator/concepts'
import type { AppUser } from './login-modal'

const SCHEMA_FIELDS = [
  { key: 'definition', label: 'Definition', hint: 'One-paragraph definition grounded in auction logic.' },
  { key: 'purpose', label: 'Purpose', hint: 'What this structure is used for.' },
  { key: 'context', label: 'Context', hint: 'Where/when this structure forms.' },
  { key: 'whyItForms', label: 'Why It Forms', hint: 'Auction logic / IPDA reasoning.' },
  { key: 'identification', label: 'Identification', hint: 'How to identify it on the chart.' },
  { key: 'commonMistakes', label: 'Common Mistakes', hint: 'What labelers get wrong.' },
  { key: 'failureConditions', label: 'Failure Conditions', hint: 'When this structure is invalidated.' },
  { key: 'relationships', label: 'Relationships', hint: 'How it relates to other concepts.' },
  { key: 'probabilityContribution', label: 'Probability Contribution', hint: 'Probability values.' },
  { key: 'realChartExample', label: 'Real Chart Example', hint: 'A worked example.' },
] as const

export default function ReviewView({ user }: { user: AppUser; instruments: any[] }) {
  const [posts, setPosts] = useState<any[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [postData, setPostData] = useState<{ post: any; bars: ReviewBar[] } | null>(null)
  const [originalAnns, setOriginalAnns] = useState<any[]>([])
  const [correctedAnns, setCorrectedAnns] = useState<any[]>([])
  const [mode, setMode] = useState<'view' | 'correct'>('view')
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Refs for debounced save during drag/resize
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const correctedAnnsRef = useRef<any[]>(correctedAnns)
  useEffect(() => { correctedAnnsRef.current = correctedAnns }, [correctedAnns])
  const [editSchema, setEditSchema] = useState<any>(null)

  // Trade setups (multiple per post) — used in APPROVAL phase (view mode)
  const [tradeSetups, setTradeSetups] = useState<any[]>([])
  const [selectedSetupIdx, setSelectedSetupIdx] = useState<number | null>(null)
  const [activeZone, setActiveZone] = useState<'entry' | 'sl' | 'tp' | null>(null)
  // Draft zones being drawn for the current setup
  const [draftSetup, setDraftSetup] = useState<TradeZones>({})

  const canReview = user.role === 'REVIEWER' || user.role === 'ADMIN'

  // Load pending posts
  useEffect(() => {
    let active = true
    const load = async () => {
      const res = await fetch('/api/posts?status=PENDING')
      if (!active || !res.ok) return
      const d = await res.json()
      if (active) setPosts(d.posts || [])
    }
    load()
    return () => { active = false }
  }, [])

  // Load post detail when selected
  const loadPostDetail = useCallback(async () => {
    if (!selectedPostId) {
      setPostData(null); setOriginalAnns([]); setCorrectedAnns([]); setTradeSetups([])
      return
    }
    setLoading(true)
    try {
      const [pd, oa, ca, ts] = await Promise.all([
        fetch(`/api/posts/${selectedPostId}`).then(r => r.json()),
        fetch(`/api/posts/${selectedPostId}/annotations`).then(r => r.json()),
        fetch(`/api/posts/${selectedPostId}/corrected`).then(r => r.json()),
        fetch(`/api/posts/${selectedPostId}/trade-setups`).then(r => r.json()),
      ])
      setPostData(pd)
      setOriginalAnns(oa.annotations || [])
      setCorrectedAnns(ca.correctedAnnotations || [])
      setTradeSetups(ts.tradeSetups || [])
      setSelectedSetupIdx(null)
      setDraftSetup({})
      setActiveZone(null)
    } catch {} finally { setLoading(false) }
  }, [selectedPostId])

  useEffect(() => { loadPostDetail() }, [loadPostDetail])

  const selectedPost = posts.find(p => p.id === selectedPostId)
  const pipSize = postData?.post?.instrument?.pipSize ?? 0.0001

  // The annotations to display on the chart depend on mode:
  //   - 'view': show originals (user-submitted)
  //   - 'correct': show corrected (reviewer edits)
  const displayAnns = mode === 'correct' ? correctedAnns : originalAnns
  const chartAnns: ChartAnnotation[] = displayAnns.map(a => ({
    id: a.id,
    type: a.type as ConceptType,
    priceStart: a.priceStart,
    priceEnd: a.priceEnd,
    timeStart: typeof a.timeStart === 'number' ? a.timeStart : new Date(a.timeStart).getTime(),
    timeEnd: typeof a.timeEnd === 'number' ? a.timeEnd : new Date(a.timeEnd).getTime(),
    points: a.points,
    arrow: a.arrow,
    selected: a.id === selectedAnnId,
  }))

  const selectedAnn = displayAnns.find(a => a.id === selectedAnnId)

  // Start correction mode: clone originals into corrected table
  const handleStartCorrect = async () => {
    if (!selectedPostId) return
    try {
      const res = await fetch(`/api/posts/${selectedPostId}/correct`, { method: 'POST' })
      if (!res.ok) { toast.error('Failed to start correction'); return }
      const data = await res.json()
      setCorrectedAnns(data.correctedAnnotations || [])
      setMode('correct')
      toast.success('Correction mode — edit annotations below')
    } catch { toast.error('Failed to start correction') }
  }

  // Save a corrected annotation's schema
  const handleSaveCorrection = async (correctionId: string, schema: any, direction: string, type: string) => {
    try {
      const res = await fetch(`/api/corrections/${correctionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema, direction, type }),
      })
      if (!res.ok) { toast.error('Failed to save correction'); return }
      toast.success('Correction saved')
      // Update local state
      setCorrectedAnns(prev => prev.map(c =>
        c.id === correctionId ? { ...c, schema, direction, type } : c
      ))
      setSelectedAnnId(null)
      setEditSchema(null)
    } catch { toast.error('Failed to save correction') }
  }

  // Update a corrected annotation's geometry (drag/resize) — saves automatically
  const handleUpdateAnnotation = useCallback(async (id: string, updates: any) => {
    // Update local state immediately for responsive UI
    setCorrectedAnns(prev => prev.map(c => {
      if (c.id !== id) return c
      const updated = { ...c, ...updates }
      // If points changed, also update schemaJson _points
      if (updates.points) {
        updated.schema = { ...c.schema, _points: updates.points }
      }
      if (updates.arrow) {
        updated.schema = { ...c.schema, _arrow: updates.arrow }
      }
      return updated
    }))

    // Debounce the API save — only save after user stops dragging for 500ms
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      const ann = correctedAnnsRef.current.find(c => c.id === id)
      if (!ann) return
      const body: any = {}
      if (updates.priceStart !== undefined) body.priceStart = updates.priceStart
      if (updates.priceEnd !== undefined) body.priceEnd = updates.priceEnd
      if (updates.points !== undefined) body.points = updates.points
      if (updates.arrow !== undefined) body.arrow = updates.arrow
      // Note: timeStart/timeEnd are LOCKED — not sent
      try {
        await fetch(`/api/corrections/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } catch {}
    }, 500)
  }, [])

  // Approve / Deny a single annotation — BLOCKED if no trade setups exist
  const handleAction = async (action: 'APPROVED' | 'DENIED') => {
    if (!selectedAnn) return
    // Block approval if no valid trade setups exist (at least 1 with all 3 zones)
    if (action === 'APPROVED') {
      const validSetups = tradeSetups.filter(s => s.entry && s.sl && s.tp)
      if (validSetups.length === 0) {
        toast.error('Cannot approve: at least 1 trade setup with ENTRY, SL, and TP is required. Add one using the Trade Setups panel.')
        return
      }
    }
    try {
      const res = await fetch(`/api/annotations/${selectedAnn.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      if (!res.ok) { toast.error('Action failed'); return }
      toast.success(`Annotation ${action.toLowerCase()}`)
      // Reload
      await loadPostDetail()
      // Refresh posts list (the post might move to APPROVED)
      const postsRes = await fetch('/api/posts?status=PENDING')
      if (postsRes.ok) setPosts((await postsRes.json()).posts || [])
    } catch { toast.error('Action failed') }
  }

  // Mark post as corrected (set all annotations to CORRECTED status)
  const handleFinishCorrection = async () => {
    if (!selectedPostId || correctedAnns.length === 0) return
    try {
      // Set each original annotation to CORRECTED status
      for (const orig of originalAnns) {
        await fetch(`/api/annotations/${orig.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CORRECTED' }),
        })
      }
      toast.success('Corrections submitted — post marked as corrected')
      setMode('view')
      await loadPostDetail()
      const postsRes = await fetch('/api/posts?status=PENDING')
      if (postsRes.ok) setPosts((await postsRes.json()).posts || [])
    } catch { toast.error('Failed to finish correction') }
  }

  // When an annotation is selected in correct mode, load its schema for editing
  useEffect(() => {
    if (mode === 'correct' && selectedAnn) {
      setEditSchema(selectedAnn.schema ? { ...selectedAnn.schema } : {})
    } else {
      setEditSchema(null)
    }
  }, [selectedAnnId, mode, selectedAnn])

  // ─── Trade setup management (approval phase) ───────────────────────────
  
  // Start a new trade setup — resets the draft zones
  const handleAddTradeSetup = () => {
    setSelectedSetupIdx(null)  // new setup, not editing existing
    setDraftSetup({})
    setActiveZone('entry')  // start with entry zone
    toast.info('New trade setup — draw ENTRY zone on the chart')
  }

  // Update draft zones while drawing (called from AnnotatorChart)
  // The AnnotatorChart sends the FULL zone object (merged with existing),
  // so we just store it and auto-advance to the next zone.
  const handleUpdateDraftZones = useCallback((newZones: TradeZones) => {
    setDraftSetup(newZones)
    // Auto-advance to next zone after drawing one
    if (activeZone === 'entry' && newZones.entry && !newZones.sl) {
      setActiveZone('sl')
      toast.info('ENTRY set — now draw SL zone')
    } else if (activeZone === 'sl' && newZones.sl && !newZones.tp) {
      setActiveZone('tp')
      toast.info('SL set — now draw TP zone')
    } else if (activeZone === 'tp' && newZones.tp) {
      // All 3 zones drawn — auto-save the setup
      // Use setTimeout to avoid setState during render
      setTimeout(() => saveTradeSetupRef.current(newZones), 0)
    }
  }, [activeZone])

  // Ref to hold the latest saveTradeSetup so handleUpdateDraftZones can call it
  // (avoids hoisting/ordering issues with useCallback)
  const saveTradeSetupRef = useRef(async (zones: TradeZones) => {})
  const handleSaveTradeSetup = async (zones: TradeZones) => {
    if (!selectedPostId || !zones.entry || !zones.sl || !zones.tp) {
      toast.error('All 3 zones (ENTRY, SL, TP) must be drawn')
      return
    }
    try {
      const res = await fetch(`/api/posts/${selectedPostId}/trade-setups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: { timeStart: zones.entry.timeStart, timeEnd: zones.entry.timeEnd, priceStart: zones.entry.priceStart, priceEnd: zones.entry.priceEnd },
          sl: { timeStart: zones.sl.timeStart, timeEnd: zones.sl.timeEnd, priceStart: zones.sl.priceStart, priceEnd: zones.sl.priceEnd },
          tp: { timeStart: zones.tp.timeStart, timeEnd: zones.tp.timeEnd, priceStart: zones.tp.priceStart, priceEnd: zones.tp.priceEnd },
        }),
      })
      if (!res.ok) { 
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Failed to save trade setup')
        return
      }
      const data = await res.json()
      setTradeSetups(prev => [...prev, data.tradeSetup])
      setSelectedSetupIdx(tradeSetups.length)  // select the new one
      setDraftSetup({})
      setActiveZone(null)
      toast.success('Trade setup saved')
    } catch { toast.error('Failed to save trade setup') }
  }
  // Keep the ref in sync
  saveTradeSetupRef.current = handleSaveTradeSetup

  // Delete a trade setup
  const handleDeleteTradeSetup = async (idx: number) => {
    const setup = tradeSetups[idx]
    if (!setup) return
    try {
      await fetch(`/api/trade-setups/${setup.id}`, { method: 'DELETE' })
      setTradeSetups(prev => prev.filter((_, i) => i !== idx))
      if (selectedSetupIdx === idx) {
        setSelectedSetupIdx(null)
        setDraftSetup({})
        setActiveZone(null)
      }
      toast.success('Trade setup deleted')
    } catch { toast.error('Failed to delete') }
  }

  // Select an existing trade setup to view it on the chart
  const handleSelectTradeSetup = (idx: number) => {
    const setup = tradeSetups[idx]
    if (!setup) return
    setSelectedSetupIdx(idx)
    setDraftSetup({
      entry: setup.entry,
      sl: setup.sl,
      tp: setup.tp,
    })
    setActiveZone(null)
  }

  // The zones to display on the chart: either draft (being drawn) or selected setup
  const displayTradeZones: TradeZones | undefined = (selectedSetupIdx !== null || Object.keys(draftSetup).length > 0) ? draftSetup : undefined

  return (
    <div className="flex h-full min-h-0">
      {/* Left: posts list */}
      <div className="w-72 shrink-0 border-r flex flex-col h-full min-h-0">
        <div className="px-3 py-2 border-b bg-muted/20 shrink-0">
          <span className="text-xs font-semibold">Pending Posts ({posts.length})</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
          {posts.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No pending posts.</div>
          ) : posts.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedPostId(p.id); setMode('view'); setSelectedAnnId(null) }}
              className={`w-full flex items-start gap-2 p-2 rounded border text-left transition-colors ${
                selectedPostId === p.id ? 'border-foreground bg-muted' : 'border-transparent hover:bg-muted/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-semibold">{p.instrument?.symbol}</span>
                  <span className="text-[10px] text-muted-foreground">{p.timeframe}</span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{p.title}</div>
                <div className="text-[10px] text-muted-foreground">by {p.user?.name} · {p.annotationCount} ann</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: chart + correction form */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : !selectedPostId || !postData ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {posts.length > 0 ? 'Select a post to review' : 'No pending posts'}
          </div>
        ) : (
          <>
            {/* Header with mode indicator and action buttons */}
            <div className="border-b px-3 py-2 flex flex-wrap items-center gap-2 shrink-0 bg-muted/30">
              <span className="text-sm font-mono font-semibold">{postData.post.instrument?.symbol}</span>
              <Badge variant="outline" className="text-[10px]">{postData.post.timeframe}</Badge>
              <span className="text-xs text-muted-foreground">by {postData.post.user?.name}</span>
              <div className="flex-1" />
              {mode === 'correct' ? (
                <>
                  <Badge variant="outline" className="text-[10px] bg-purple-500/20 text-purple-400">
                    ✎ Correction Mode — editing copy, original preserved
                  </Badge>
                  <Button size="sm" className="h-7 text-xs bg-green-700 hover:bg-green-800" onClick={handleFinishCorrection}>
                    ✓ Submit Corrections
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setMode('view'); setSelectedAnnId(null) }}>
                    Cancel
                  </Button>
                </>
              ) : (
                canReview && (
                  <>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleStartCorrect}>
                      ✎ Correct
                    </Button>
                  </>
                )
              )}
            </div>

            {/* Charts + side panel: charts on left (1 or 2 side-by-side), panel on right */}
            <div className="flex-1 min-h-0 flex">
              {/* Charts area: 2 side-by-side (original + corrected) when corrections exist, single otherwise */}
              <div className={`flex-1 min-w-0 min-h-0 flex ${correctedAnns.length > 0 ? 'flex-row' : 'flex-col'}`}>
                {/* Original chart (always shown) */}
                <div className="flex-1 min-w-0 min-h-0 flex flex-col border-r">
                  <div className="px-2 py-1 border-b bg-muted/20 shrink-0">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Original (user-submitted) — {originalAnns.length} annotations
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    {postData.bars.length > 0 ? (
                      <ReviewChart
                        instrumentId={postData.post.instrumentId}
                        timeframe={postData.post.timeframe}
                        pipSize={pipSize}
                        annotations={originalAnns.map(a => ({
                          id: a.id,
                          type: a.type as ConceptType,
                          priceStart: a.priceStart,
                          priceEnd: a.priceEnd,
                          timeStart: typeof a.timeStart === 'number' ? a.timeStart : new Date(a.timeStart).getTime(),
                          timeEnd: typeof a.timeEnd === 'number' ? a.timeEnd : new Date(a.timeEnd).getTime(),
                          points: a.points,
                          arrow: a.arrow,
                          selected: a.id === selectedAnnId,
                        }))}
                        bars={postData.bars}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        No bars available
                      </div>
                    )}
                  </div>
                </div>

                {/* Corrected chart (only if corrections exist) */}
                {correctedAnns.length > 0 && (
                  <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                    <div className="px-2 py-1 border-b bg-purple-500/10 shrink-0">
                      <span className="text-[10px] font-semibold uppercase text-purple-400">
                        Corrected (reviewer-fixed) — {correctedAnns.length} annotations
                        {mode === 'correct' && ' — CLICK to select & edit'}
                      </span>
                    </div>
                    <div className="flex-1 min-h-0">
                      {postData.bars.length > 0 ? (
                        mode === 'correct' ? (
                          // In correct mode: use AnnotatorChart so reviewer can click & drag annotations
                          <AnnotatorChart
                            bars={postData.bars}
                            annotations={correctedAnns.map(a => ({
                              id: a.id,
                              type: a.type as ConceptType,
                              direction: a.direction,
                              priceStart: a.priceStart,
                              priceEnd: a.priceEnd,
                              timeStart: typeof a.timeStart === 'number' ? a.timeStart : new Date(a.timeStart).getTime(),
                              timeEnd: typeof a.timeEnd === 'number' ? a.timeEnd : new Date(a.timeEnd).getTime(),
                              points: a.points,
                              arrow: a.arrow,
                            }))}
                            activeTool={null}
                            direction="neutral"
                            selectedAnnotationId={selectedAnnId}
                            onSelectAnnotation={setSelectedAnnId}
                            onCreateDraft={() => {}}
                            onUpdateAnnotation={handleUpdateAnnotation}
                            pipSize={pipSize}
                            editable
                          />
                        ) : (
                          // View mode (approval phase): AnnotatorChart with trade zone drawing
                          <AnnotatorChart
                            bars={postData.bars}
                            annotations={(correctedAnns.length > 0 ? correctedAnns : originalAnns).map(a => ({
                              id: a.id,
                              type: a.type as ConceptType,
                              direction: a.direction,
                              priceStart: a.priceStart,
                              priceEnd: a.priceEnd,
                              timeStart: typeof a.timeStart === 'number' ? a.timeStart : new Date(a.timeStart).getTime(),
                              timeEnd: typeof a.timeEnd === 'number' ? a.timeEnd : new Date(a.timeEnd).getTime(),
                              points: a.points,
                              arrow: a.arrow,
                            }))}
                            activeTool={null}
                            direction="neutral"
                            selectedAnnotationId={selectedAnnId}
                            onSelectAnnotation={setSelectedAnnId}
                            onCreateDraft={() => {}}
                            pipSize={pipSize}
                            tradeZones={displayTradeZones}
                            activeTradeZone={canReview ? activeZone : null}
                            onUpdateTradeZones={handleUpdateDraftZones}
                            allTradeSetups={tradeSetups}
                          />
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                          No bars available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Trade Setups sidebar (view mode / approval phase only) */}
              {mode !== 'correct' && canReview && (
                <aside className="w-56 shrink-0 border-l flex flex-col min-h-0 bg-card">
                  <div className="px-2 py-2 border-b bg-muted/30 shrink-0 flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase text-muted-foreground">Trade Setups</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Required for approval</p>
                    </div>
                    <Button size="sm" className="h-6 text-[10px] px-2" onClick={handleAddTradeSetup}>
                      + Add
                    </Button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
                    {/* List of saved trade setups */}
                    {tradeSetups.length === 0 && !activeZone && (
                      <div className="text-[10px] text-muted-foreground p-2 text-center">
                        No trade setups yet. Click "+ Add" to create one.
                      </div>
                    )}
                    {tradeSetups.map((setup, idx) => (
                      <div
                        key={setup.id}
                        className={`p-2 rounded border text-xs cursor-pointer transition-colors ${
                          selectedSetupIdx === idx ? 'border-foreground bg-muted' : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => handleSelectTradeSetup(idx)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-semibold">{setup.label}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTradeSetup(idx) }}
                            className="text-[10px] text-muted-foreground hover:text-destructive"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex gap-2 text-[9px]">
                          <span className="text-green-400">● E</span>
                          <span className="text-red-400">● S</span>
                          <span className="text-blue-400">● T</span>
                        </div>
                      </div>
                    ))}

                    {/* Drawing zone status (when adding a new setup) */}
                    {activeZone && (
                      <div className="mt-2 pt-2 border-t space-y-2">
                        <h5 className="text-[9px] font-semibold uppercase text-muted-foreground">Drawing Setup {tradeSetups.length + 1}</h5>
                        {/* ENTRY status */}
                        <div className={`flex items-center gap-2 p-1.5 rounded border text-[10px] ${activeZone === 'entry' ? 'border-green-500 bg-green-500/10' : draftSetup.entry ? 'border-green-500/30' : 'border-transparent'}`}>
                          <span className="w-2 h-2 rounded" style={{ backgroundColor: '#22c55e' }} />
                          <span className="font-mono">ENTRY</span>
                          {draftSetup.entry
                            ? <span className="text-green-400 ml-auto">✓ set</span>
                            : activeZone === 'entry'
                              ? <span className="text-green-400 ml-auto">drawing...</span>
                              : <span className="text-muted-foreground ml-auto">pending</span>}
                        </div>
                        {/* SL status */}
                        <div className={`flex items-center gap-2 p-1.5 rounded border text-[10px] ${activeZone === 'sl' ? 'border-red-500 bg-red-500/10' : draftSetup.sl ? 'border-red-500/30' : 'border-transparent'}`}>
                          <span className="w-2 h-2 rounded" style={{ backgroundColor: '#ef4444' }} />
                          <span className="font-mono">SL</span>
                          {draftSetup.sl
                            ? <span className="text-red-400 ml-auto">✓ set</span>
                            : activeZone === 'sl'
                              ? <span className="text-red-400 ml-auto">drawing...</span>
                              : <span className="text-muted-foreground ml-auto">pending</span>}
                        </div>
                        {/* TP status */}
                        <div className={`flex items-center gap-2 p-1.5 rounded border text-[10px] ${activeZone === 'tp' ? 'border-blue-500 bg-blue-500/10' : draftSetup.tp ? 'border-blue-500/30' : 'border-transparent'}`}>
                          <span className="w-2 h-2 rounded" style={{ backgroundColor: '#3b82f6' }} />
                          <span className="font-mono">TP</span>
                          {draftSetup.tp
                            ? <span className="text-blue-400 ml-auto">✓ set</span>
                            : activeZone === 'tp'
                              ? <span className="text-blue-400 ml-auto">drawing...</span>
                              : <span className="text-muted-foreground ml-auto">pending</span>}
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          {activeZone === 'entry' && 'Click and drag on the chart to draw the ENTRY zone.'}
                          {activeZone === 'sl' && 'Click and drag to draw the SL (stop loss) zone.'}
                          {activeZone === 'tp' && 'Click and drag to draw the TP (take profit) zone.'}
                        </div>
                      </div>
                    )}

                    {/* Cancel button while drawing */}
                    {activeZone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-6 text-[10px] mt-2"
                        onClick={() => { setActiveZone(null); setDraftSetup({}); setSelectedSetupIdx(null) }}
                      >
                        Cancel
                      </Button>
                    )}

                    {/* Status indicator */}
                    <div className="pt-2 border-t mt-2">
                      <div className="text-[9px] font-semibold uppercase text-muted-foreground mb-1">Approval Status</div>
                      {tradeSetups.filter(s => s.entry && s.sl && s.tp).length > 0 ? (
                        <div className="text-[10px] text-green-400">
                          ✓ {tradeSetups.filter(s => s.entry && s.sl && s.tp).length} valid setup(s) — ready to approve
                        </div>
                      ) : (
                        <div className="text-[10px] text-amber-500">
                          ⚠ At least 1 setup with ENTRY+SL+TP required
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              )}

              {/* Far-right panel: annotation list + edit form */}
              <aside className="w-96 shrink-0 border-l flex flex-col min-h-0">
                {/* Annotation list */}
                <div className="border-b shrink-0">
                  <div className="px-3 py-2 bg-muted/30">
                    <h4 className="text-xs font-semibold">
                      Annotations ({displayAnns.length})
                    </h4>
                  </div>
                  <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                    {displayAnns.map(a => {
                      const concept = CONCEPT_MAP[a.type as ConceptType]
                      if (!concept) return null
                      return (
                        <button
                          key={a.id}
                          onClick={() => setSelectedAnnId(a.id)}
                          className={`w-full flex items-center gap-2 p-2 rounded border text-left transition-colors ${
                            selectedAnnId === a.id ? 'border-foreground bg-muted' : 'border-transparent hover:bg-muted/50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: concept.color }} />
                          <span className="text-[10px] font-mono font-semibold">{concept.shortLabel}</span>
                          <span className="text-[10px] text-muted-foreground capitalize">· {a.direction}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Edit form or action buttons */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {selectedAnn ? (
                    mode === 'correct' && editSchema ? (
                      <CorrectionForm
                        annotation={selectedAnn}
                        schema={editSchema}
                        onSchemaChange={setEditSchema}
                        onSave={() => handleSaveCorrection(selectedAnn.id, editSchema, selectedAnn.direction, selectedAnn.type)}
                        onCancel={() => { setSelectedAnnId(null); setEditSchema(null) }}
                      />
                    ) : (
                      <div className="p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge style={{ backgroundColor: CONCEPT_MAP[selectedAnn.type as ConceptType]?.color }} variant="default" className="font-mono text-xs">
                            {CONCEPT_MAP[selectedAnn.type as ConceptType]?.shortLabel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">by {selectedAnn.labeler || selectedAnn.submittedBy?.name}</span>
                        </div>

                        {/* Locked fields (read-only) */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/30 p-2 rounded">
                          <div>
                            <div className="text-muted-foreground">Labeler (locked):</div>
                            <div className="font-mono">{selectedAnn.labeler || selectedAnn.submittedBy?.name || '—'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Direction:</div>
                            <div className="font-mono capitalize">{selectedAnn.direction}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Time Start (locked):</div>
                            <div className="font-mono">{new Date(selectedAnn.timeStart).toISOString().slice(0,16)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Time End (locked):</div>
                            <div className="font-mono">{new Date(selectedAnn.timeEnd).toISOString().slice(0,16)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Price Range:</div>
                            <div className="font-mono">{selectedAnn.priceStart.toFixed(5)} → {selectedAnn.priceEnd.toFixed(5)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Status:</div>
                            <div className="font-mono">{selectedAnn.status}</div>
                          </div>
                        </div>

                        {/* Schema preview (read-only in view mode) */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-semibold uppercase text-muted-foreground">Schema (read-only)</h5>
                          {SCHEMA_FIELDS.map(f => (
                            <div key={f.key} className="text-[11px]">
                              <div className="font-semibold text-muted-foreground">{f.label}</div>
                              <div className="text-muted-foreground">{selectedAnn.schema?.[f.key] || '—'}</div>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons (view mode only) */}
                        {canReview && mode !== 'correct' && (
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              className="bg-green-700 hover:bg-green-800"
                              onClick={() => handleAction('APPROVED')}
                              disabled={tradeSetups.filter(s => s.entry && s.sl && s.tp).length === 0}
                              title={tradeSetups.filter(s => s.entry && s.sl && s.tp).length === 0 ? 'At least 1 trade setup with ENTRY+SL+TP required' : 'Approve this annotation'}
                            >
                              ✓ Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction('DENIED')}>
                              ✕ Deny
                            </Button>
                            {tradeSetups.filter(s => s.entry && s.sl && s.tp).length === 0 && (
                              <div className="text-[10px] text-amber-500 self-center ml-1">
                                ⚠ Trade setup required
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      {mode === 'correct'
                        ? 'Click an annotation on the chart to edit its schema.'
                        : 'Click an annotation to view details.'}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Correction form: edit schema fields, lock personal data + timestamps ──
function CorrectionForm({
  annotation,
  schema,
  onSchemaChange,
  onSave,
  onCancel,
}: {
  annotation: any
  schema: any
  onSchemaChange: (s: any) => void
  onSave: () => void
  onCancel: () => void
}) {
  const concept = CONCEPT_MAP[annotation.type as ConceptType]

  const updateField = (key: string, value: string) => {
    onSchemaChange({ ...schema, [key]: value })
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Badge style={{ backgroundColor: concept?.color }} variant="default" className="font-mono text-xs">
          {concept?.shortLabel}
        </Badge>
        <span className="text-[10px] text-purple-400">Editing correction</span>
      </div>

      {/* LOCKED fields — displayed but not editable */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 p-2 rounded text-[11px]">
        <div className="text-[10px] font-semibold text-yellow-600 mb-1">🔒 Locked (cannot be changed):</div>
        <div className="grid grid-cols-2 gap-1 text-muted-foreground">
          <div>Labeler: <span className="font-mono">{annotation.labeler || '—'}</span></div>
          <div>Direction: <span className="font-mono capitalize">{annotation.direction}</span></div>
          <div>Time Start: <span className="font-mono">{new Date(annotation.timeStart).toISOString().slice(0,16)}</span></div>
          <div>Time End: <span className="font-mono">{new Date(annotation.timeEnd).toISOString().slice(0,16)}</span></div>
          <div>Price: <span className="font-mono">{annotation.priceStart.toFixed(5)} → {annotation.priceEnd.toFixed(5)}</span></div>
        </div>
      </div>

      {/* EDITABLE schema fields */}
      <div className="space-y-2">
        <h5 className="text-[10px] font-semibold uppercase text-purple-400">Schema (editable)</h5>
        {SCHEMA_FIELDS.map(f => (
          <div key={f.key}>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">{f.label}</label>
            <textarea
              className="w-full text-[11px] p-1.5 rounded border bg-background resize-y min-h-[60px]"
              value={schema[f.key] || ''}
              onChange={(e) => updateField(f.key, e.target.value)}
              placeholder={f.hint}
            />
          </div>
        ))}
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-2 border-t">
        <Button size="sm" className="bg-purple-700 hover:bg-purple-800" onClick={onSave}>
          💾 Save Correction
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
