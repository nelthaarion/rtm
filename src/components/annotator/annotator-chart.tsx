'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { ConceptType, CONCEPT_MAP } from '@/lib/annotator/concepts'

export interface Bar {
  time: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

export interface PolylinePoint {
  time: number
  price: number
}

export interface Annotation {
  id: string
  type: ConceptType
  direction: 'bullish' | 'bearish' | 'neutral'
  priceStart: number
  priceEnd: number
  timeStart: number
  timeEnd: number
  label?: string
  points?: PolylinePoint[]
  arrow?: { time: number; price: number; isHigh: boolean }
}

export interface DraftAnnotation {
  type: ConceptType
  direction: 'bullish' | 'bearish' | 'neutral'
  priceStart: number
  priceEnd: number
  timeStart: number
  timeEnd: number
  points?: PolylinePoint[]
  arrow?: { time: number; price: number; isHigh: boolean }
}

export interface TradeZone {
  timeStart: number
  timeEnd: number
  priceStart: number
  priceEnd: number
}

export interface TradeZones {
  entry?: TradeZone
  sl?: TradeZone
  tp?: TradeZone
}

interface AnnotatorChartProps {
  bars: Bar[]
  annotations: Annotation[]
  activeTool: ConceptType | null
  direction: 'bullish' | 'bearish' | 'neutral'
  selectedAnnotationId: string | null
  onSelectAnnotation: (id: string | null) => void
  onCreateDraft: (draft: DraftAnnotation) => void
  onCreatePost?: (annotationId: string) => void
  onUpdateAnnotation?: (id: string, updates: Partial<Annotation>) => void
  pipSize: number
  readOnly?: boolean
  editable?: boolean  // when true, annotations can be dragged/resized (for correction mode)
  // Trade zones (entry/SL/TP) — shown on the corrected chart in review mode
  tradeZones?: TradeZones
  activeTradeZone?: 'entry' | 'sl' | 'tp' | null  // when set, click-draws a trade zone rectangle
  onUpdateTradeZones?: (zones: TradeZones) => void
  // ALL saved trade setups to render on chart (each with entry/sl/tp)
  allTradeSetups?: Array<{ id: string; label: string; entry: TradeZone; sl: TradeZone; tp: TradeZone }>
}

interface View {
  from: number  // logical range start
  to: number    // logical range end
}

const HIT_TOLERANCE = 12 // pixels

export default function AnnotatorChart({
  bars,
  annotations,
  activeTool,
  direction,
  selectedAnnotationId,
  onSelectAnnotation,
  onCreateDraft,
  onCreatePost,
  onUpdateAnnotation,
  pipSize,
  readOnly = false,
  editable = false,
  tradeZones,
  activeTradeZone = null,
  onUpdateTradeZones,
  allTradeSetups,
}: AnnotatorChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)
  const [size, setSize] = useState({ w: 800, h: 500 })
  const [ready, setReady] = useState(false)

  // Drawing state
  const [draftRect, setDraftRect] = useState<{ startTime: number; startPrice: number; currentTime: number; currentPrice: number } | null>(null)
  const [polylineDraft, setPolylineDraft] = useState<PolylinePoint[] | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; annotationId: string } | null>(null)

  // Drag/resize state for editing existing annotations (correction mode)
  const [dragInfo, setDragInfo] = useState<{
    annotationId: string
    mode: 'move' | 'resize-tr' | 'resize-bl' | 'vertex'
    vertexIdx?: number
    startMouse: { x: number; y: number }
    original: { priceStart: number; priceEnd: number; timeStart: number; timeEnd: number; points?: PolylinePoint[]; arrow?: any }
  } | null>(null)
  const dragInfoRef = useRef(dragInfo)
  useEffect(() => { dragInfoRef.current = dragInfo }, [dragInfo])

  // Trade zone drawing state (entry/SL/TP)
  const [tradeZoneDraft, setTradeZoneDraft] = useState<{ startTime: number; startPrice: number; currentTime: number; currentPrice: number } | null>(null)
  const tradeZoneDraftRef = useRef(tradeZoneDraft)
  useEffect(() => { tradeZoneDraftRef.current = tradeZoneDraft }, [tradeZoneDraft])
  const tradeZonesRef = useRef(tradeZones)
  useEffect(() => { tradeZonesRef.current = tradeZones }, [tradeZones])
  const activeTradeZoneRef = useRef(activeTradeZone)
  useEffect(() => { activeTradeZoneRef.current = activeTradeZone }, [activeTradeZone])
  const allTradeSetupsRef = useRef(allTradeSetups)
  useEffect(() => { allTradeSetupsRef.current = allTradeSetups }, [allTradeSetups])

  // Refs for chart event subscriptions (avoid stale closures)
  const onSelectAnnotationRef = useRef(onSelectAnnotation)
  useEffect(() => { onSelectAnnotationRef.current = onSelectAnnotation }, [onSelectAnnotation])
  const editableRef = useRef(editable)
  useEffect(() => { editableRef.current = editable }, [editable])
  const findAnnotationAtRef = useRef<(x: number, y: number) => string | null>(() => null)

  // Refs for overlay drawing (avoid stale closures in chart subscriptions)
  const annotationsRef = useRef(annotations)
  useEffect(() => { annotationsRef.current = annotations }, [annotations])
  const draftRectRef = useRef(draftRect)
  useEffect(() => { draftRectRef.current = draftRect }, [draftRect])
  const polylineDraftRef = useRef(polylineDraft)
  useEffect(() => { polylineDraftRef.current = polylineDraft }, [polylineDraft])
  const mousePosRef = useRef(mousePos)
  useEffect(() => { mousePosRef.current = mousePos }, [mousePos])
  const activeToolRef = useRef(activeTool)
  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])
  const directionRef = useRef(direction)
  useEffect(() => { directionRef.current = direction }, [direction])
  const selectedRef = useRef(selectedAnnotationId)
  useEffect(() => { selectedRef.current = selectedAnnotationId }, [selectedAnnotationId])

  // ─── Init TradingView chart ────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || chartRef.current) return
    let destroyed = false

    import('lightweight-charts').then(({ createChart, CandlestickSeries }) => {
      if (destroyed || !containerRef.current || chartRef.current) return
      const chart = createChart(containerRef.current, {
        layout: { background: { color: '#1a1a1a' }, textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#2a2a2a' }, horzLines: { color: '#2a2a2a' } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: '#3a3a3a' },
        timeScale: { borderColor: '#3a3a3a', timeVisible: true, secondsVisible: false },
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })
      chartRef.current = chart
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#3d8154', downColor: '#aa4b42',
        borderUpColor: '#3d8154', borderDownColor: '#aa4b42',
        wickUpColor: '#3d8154', wickDownColor: '#aa4b42',
      })
      seriesRef.current = series

      chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
        requestAnimationFrame(() => drawOverlayRef.current())
      })

      // Subscribe to chart click for annotation selection when overlay is pointer-events:none
      chart.subscribeClick((param: any) => {
        // Only handle if no tool is active (overlay is pass-through)
        if (activeToolRef.current || activeTradeZoneRef.current || editableRef.current) return
        if (!param || !param.time) {
          onSelectAnnotationRef.current(null)
          return
        }
        // Get the price at the click point
        const price = seriesRef.current?.coordinateToPrice(param.point?.y ?? 0)
        if (price === null || price === undefined) return
        const x = param.point?.x ?? 0
        const y = param.point?.y ?? 0
        // Hit-test annotations using pixel coordinates
        const hit = findAnnotationAtRef.current(x, y)
        onSelectAnnotationRef.current(hit)
      })

      setReady(true)
    })

    return () => {
      destroyed = true
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; seriesRef.current = null }
    }
  }, [])

  // ─── Set bars data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !seriesRef.current || bars.length === 0) return
    const data = bars.map(b => ({
      time: Math.floor(b.time / 1000) as any,
      open: b.o, high: b.h, low: b.l, close: b.c,
    }))
    seriesRef.current.setData(data)
    chartRef.current?.timeScale().fitContent()
    requestAnimationFrame(() => drawOverlayRef.current())
  }, [bars, ready])

  // ─── Resize ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect
        setSize({ w: width, h: height })
        chartRef.current?.applyOptions({ width, height })
      }
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // ─── Coordinate helpers ────────────────────────────────────────────────
  const timeToX = useCallback((time: number): number | null => {
    if (!chartRef.current) return null
    try { return chartRef.current.timeScale().timeToCoordinate(Math.floor(time / 1000)) } catch { return null }
  }, [])

  const xToTime = useCallback((x: number): number | null => {
    if (!chartRef.current) return null
    try {
      const t = chartRef.current.timeScale().coordinateToTime(x)
      if (t === null) return null
      return (typeof t === 'number' ? t : 0) * 1000
    } catch { return null }
  }, [])

  const priceToY = useCallback((price: number): number | null => {
    if (!seriesRef.current) return null
    try { return seriesRef.current.priceToCoordinate(price) } catch { return null }
  }, [])

  const yToPrice = useCallback((y: number): number | null => {
    if (!seriesRef.current) return null
    try { return seriesRef.current.coordinateToPrice(y) } catch { return null }
  }, [])

  // ─── Draw overlay (annotations + drafts) ───────────────────────────────
  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current
    if (!canvas || !chartRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr; canvas.height = size.h * dpr
    canvas.style.width = `${size.w}px`; canvas.style.height = `${size.h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)

    const anns = annotationsRef.current
    const selId = selectedRef.current

    // Draw all annotations
    for (const a of anns) {
      const def = CONCEPT_MAP[a.type]
      if (!def) continue
      const c = def.color
      const isSel = a.id === selId

      if (def.geometry === 'polyline' && a.points && a.points.length >= 2) {
        const pts = a.points.map(p => ({ x: timeToX(p.time), y: priceToY(p.price) }))
          .filter(p => p.x !== null && p.y !== null) as Array<{x: number; y: number}>
        if (pts.length < 2) continue
        ctx.globalAlpha = 0.9; ctx.strokeStyle = c; ctx.lineWidth = isSel ? 3 : 2
        ctx.beginPath()
        pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y) })
        ctx.stroke(); ctx.globalAlpha = 1
        pts.forEach(p => {
          ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p.x, p.y, isSel ? 5 : 3, 0, Math.PI * 2); ctx.fill()
          if (isSel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke() }
        })
        ctx.fillStyle = c; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'
        ctx.fillText(def.shortLabel, pts[0].x + 8, pts[0].y - 8)
      } else if (def.geometry === 'arrow' && a.arrow) {
        const cx = timeToX(a.arrow.time), cy = priceToY(a.arrow.price)
        if (cx === null || cy === null) continue
        ctx.globalAlpha = 0.9; ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = isSel ? 2.5 : 2
        const sz = 8, tailY = a.arrow.isHigh ? cy - 24 : cy + 24, dir = a.arrow.isHigh ? 1 : -1
        ctx.beginPath(); ctx.moveTo(cx, cy)
        ctx.lineTo(cx - sz, cy - dir * sz * 1.2); ctx.lineTo(cx + sz, cy - dir * sz * 1.2)
        ctx.closePath(); ctx.fill()
        ctx.beginPath(); ctx.moveTo(cx, tailY); ctx.lineTo(cx, cy - dir * sz * 1.2); ctx.stroke()
        ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'
        ctx.fillText(def.shortLabel, cx + 10, tailY + 3); ctx.globalAlpha = 1
      } else {
        // Rectangle / line / point
        const x1 = timeToX(a.timeStart), x2 = timeToX(a.timeEnd)
        const y1 = priceToY(a.priceStart), y2 = priceToY(a.priceEnd)
        if (x1 === null || x2 === null || y1 === null || y2 === null) continue
        const xL = Math.min(x1, x2), xR = Math.max(x1, x2)
        const yT = Math.min(y1, y2), yB = Math.max(y1, y2)
        ctx.globalAlpha = isSel ? 0.45 : 0.25; ctx.fillStyle = c
        ctx.fillRect(xL, yT, xR - xL, yB - yT); ctx.globalAlpha = 1
        ctx.strokeStyle = c; ctx.lineWidth = isSel ? 2.5 : 1.5
        ctx.strokeRect(xL, yT, xR - xL, yB - yT)
        ctx.fillStyle = c; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'
        ctx.fillText(def.shortLabel, xL + 4, yT + 12)
      }
    }

    // Draw rectangle draft (drag in progress)
    const dr = draftRectRef.current
    if (dr) {
      const x1 = timeToX(dr.startTime), x2 = timeToX(dr.currentTime)
      const y1 = priceToY(dr.startPrice), y2 = priceToY(dr.currentPrice)
      if (x1 !== null && x2 !== null && y1 !== null && y2 !== null) {
        const tool = activeToolRef.current
        const c = tool ? CONCEPT_MAP[tool].color : '#fff'
        const xL = Math.min(x1, x2), xR = Math.max(x1, x2)
        const yT = Math.min(y1, y2), yB = Math.max(y1, y2)
        ctx.globalAlpha = 0.3; ctx.fillStyle = c
        ctx.fillRect(xL, yT, xR - xL, yB - yT); ctx.globalAlpha = 1
        ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
        ctx.strokeRect(xL, yT, xR - xL, yB - yT); ctx.setLineDash([])
      }
    }

    // Draw polyline draft (collected points + preview line to mouse)
    const pd = polylineDraftRef.current
    if (pd && pd.length > 0) {
      const tool = activeToolRef.current
      const c = tool ? CONCEPT_MAP[tool].color : '#fff'
      ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.setLineDash([5, 3])
      ctx.beginPath()
      for (let i = 0; i < pd.length; i++) {
        const px = timeToX(pd[i].time), py = priceToY(pd[i].price)
        if (px === null || py === null) continue
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      // Preview to mouse
      const mp = mousePosRef.current
      if (mp) {
        const t = xToTime(mp.x)
        const p = yToPrice(mp.y)
        if (t !== null && p !== null) {
          ctx.lineTo(mp.x, mp.y)
        }
      }
      ctx.stroke(); ctx.setLineDash([])
      // Vertex dots
      ctx.fillStyle = c
      for (const pt of pd) {
        const px = timeToX(pt.time), py = priceToY(pt.price)
        if (px === null || py === null) continue
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill()
      }
    }

    // ─── Draw ALL saved trade setups ───────────────────────────────────
    const allSetups = allTradeSetupsRef.current
    if (allSetups && allSetups.length > 0) {
      const zoneColors: Record<string, { fill: string; stroke: string; label: string }> = {
        entry: { fill: 'rgba(34, 197, 94, 0.25)', stroke: '#22c55e', label: 'ENTRY' },
        sl: { fill: 'rgba(239, 68, 68, 0.25)', stroke: '#ef4444', label: 'SL' },
        tp: { fill: 'rgba(59, 130, 246, 0.25)', stroke: '#3b82f6', label: 'TP' },
      }
      for (const setup of allSetups) {
        for (const zoneKey of ['entry', 'sl', 'tp'] as const) {
          const zone = setup[zoneKey]
          if (!zone) continue
          const zc = zoneColors[zoneKey]
          const x1 = timeToX(zone.timeStart), x2 = timeToX(zone.timeEnd)
          const y1 = priceToY(zone.priceStart), y2 = priceToY(zone.priceEnd)
          if (x1 === null || x2 === null || y1 === null || y2 === null) continue
          const xL = Math.min(x1, x2), xR = Math.max(x1, x2)
          const yT = Math.min(y1, y2), yB = Math.max(y1, y2)
          ctx.globalAlpha = 0.8
          ctx.fillStyle = zc.fill
          ctx.fillRect(xL, yT, xR - xL, yB - yT)
          ctx.globalAlpha = 1
          ctx.strokeStyle = zc.stroke; ctx.lineWidth = 2; ctx.setLineDash([4, 2])
          ctx.strokeRect(xL, yT, xR - xL, yB - yT); ctx.setLineDash([])
          ctx.fillStyle = zc.stroke; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left'
          ctx.fillText(`${zc.label}`, xL + 4, yT + 14)
        }
        // Setup label
        if (setup.entry) {
          const x1 = timeToX(setup.entry.timeStart)
          const y1 = priceToY(setup.entry.priceStart)
          if (x1 !== null && y1 !== null) {
            ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'
            ctx.fillText(setup.label, x1 + 4, y1 - 18)
          }
        }
      }
    }

    // ─── Draw trade zones (draft / selected) ────────────────────────────
    const tz = tradeZonesRef.current
    const zoneColors: Record<string, { fill: string; stroke: string; label: string }> = {
      entry: { fill: 'rgba(34, 197, 94, 0.25)', stroke: '#22c55e', label: 'ENTRY' },
      sl: { fill: 'rgba(239, 68, 68, 0.25)', stroke: '#ef4444', label: 'SL' },
      tp: { fill: 'rgba(59, 130, 246, 0.25)', stroke: '#3b82f6', label: 'TP' },
    }
    for (const zoneKey of ['entry', 'sl', 'tp'] as const) {
      const zone = tz?.[zoneKey]
      if (!zone) continue
      const zc = zoneColors[zoneKey]
      const x1 = timeToX(zone.timeStart), x2 = timeToX(zone.timeEnd)
      const y1 = priceToY(zone.priceStart), y2 = priceToY(zone.priceEnd)
      if (x1 === null || x2 === null || y1 === null || y2 === null) continue
      const xL = Math.min(x1, x2), xR = Math.max(x1, x2)
      const yT = Math.min(y1, y2), yB = Math.max(y1, y2)
      ctx.globalAlpha = 0.8
      ctx.fillStyle = zc.fill
      ctx.fillRect(xL, yT, xR - xL, yB - yT)
      ctx.globalAlpha = 1
      ctx.strokeStyle = zc.stroke; ctx.lineWidth = 2; ctx.setLineDash([4, 2])
      ctx.strokeRect(xL, yT, xR - xL, yB - yT); ctx.setLineDash([])
      ctx.fillStyle = zc.stroke; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left'
      ctx.fillText(zc.label, xL + 4, yT + 14)
    }

    // ─── Draw trade zone draft (being drawn) ───────────────────────────
    const tzd = tradeZoneDraftRef.current
    if (tzd) {
      const activeZone = activeTradeZoneRef.current
      if (activeZone) {
        const zc = zoneColors[activeZone]
        const x1 = timeToX(tzd.startTime), x2 = timeToX(tzd.currentTime)
        const y1 = priceToY(tzd.startPrice), y2 = priceToY(tzd.currentPrice)
        if (x1 !== null && x2 !== null && y1 !== null && y2 !== null) {
          const xL = Math.min(x1, x2), xR = Math.max(x1, x2)
          const yT = Math.min(y1, y2), yB = Math.max(y1, y2)
          ctx.globalAlpha = 0.3; ctx.fillStyle = zc.stroke
          ctx.fillRect(xL, yT, xR - xL, yB - yT); ctx.globalAlpha = 1
          ctx.strokeStyle = zc.stroke; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
          ctx.strokeRect(xL, yT, xR - xL, yB - yT); ctx.setLineDash([])
        }
      }
    }
  }, [size, timeToX, priceToY, xToTime, yToPrice])

  const drawOverlayRef = useRef(drawOverlay)
  useEffect(() => { drawOverlayRef.current = drawOverlay }, [drawOverlay])
  useEffect(() => { drawOverlay() }, [drawOverlay, annotations, selectedAnnotationId, draftRect, polylineDraft, mousePos, ready, bars, tradeZones, tradeZoneDraft, allTradeSetups])

  // ─── Finish polyline ───────────────────────────────────────────────────
  const finishPolyline = useCallback(() => {
    const pd = polylineDraftRef.current
    const tool = activeToolRef.current
    if (!pd || pd.length < 2 || !tool) {
      setPolylineDraft(null); setMousePos(null)
      return
    }
    const times = pd.map(p => p.time)
    const prices = pd.map(p => p.price)
    onCreateDraft({
      type: tool,
      direction: directionRef.current,
      priceStart: Math.min(...prices),
      priceEnd: Math.max(...prices),
      timeStart: Math.min(...times),
      timeEnd: Math.max(...times),
      points: pd,
    })
    setPolylineDraft(null)
    setMousePos(null)
  }, [onCreateDraft])

  // Escape cancels polyline
  useEffect(() => {
    if (!polylineDraft) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setPolylineDraft(null); setMousePos(null) }
      else if (e.key === 'Enter') { finishPolyline() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [polylineDraft, finishPolyline])

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(null)
    window.addEventListener('click', handler)
    window.addEventListener('scroll', handler, true)
    return () => { window.removeEventListener('click', handler); window.removeEventListener('scroll', handler, true) }
  }, [contextMenu])

  // ─── Hit testing ───────────────────────────────────────────────────────
  function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1, dy = y2 - y1
    const lenSq = dx * dx + dy * dy
    if (lenSq === 0) return Math.hypot(px - x1, py - y1)
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
    t = Math.max(0, Math.min(1, t))
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
  }

  const findAnnotationAt = useCallback((x: number, y: number): string | null => {
    for (let i = annotations.length - 1; i >= 0; i--) {
      const a = annotations[i]
      const def = CONCEPT_MAP[a.type]
      if (!def) continue

      if (def.geometry === 'polyline' && a.points && a.points.length > 0) {
        // Check vertices
        for (const p of a.points) {
          const px = timeToX(p.time), py = priceToY(p.price)
          if (px !== null && py !== null && Math.hypot(x - px, y - py) < HIT_TOLERANCE) return a.id
        }
        // Check segments
        for (let j = 0; j < a.points.length - 1; j++) {
          const x1 = timeToX(a.points[j].time), y1 = priceToY(a.points[j].price)
          const x2 = timeToX(a.points[j + 1].time), y2 = priceToY(a.points[j + 1].price)
          if (x1 === null || x2 === null || y1 === null || y2 === null) continue
          if (pointToSegmentDistance(x, y, x1, y1, x2, y2) < HIT_TOLERANCE) return a.id
        }
      } else if (def.geometry === 'arrow' && a.arrow) {
        const ax = timeToX(a.arrow.time), ay = priceToY(a.arrow.price)
        if (ax !== null && ay !== null) {
          if (Math.hypot(x - ax, y - ay) < HIT_TOLERANCE) return a.id
          const stemY = a.arrow.isHigh ? ay - 24 : ay + 24
          if (pointToSegmentDistance(x, y, ax, ay, ax, stemY) < HIT_TOLERANCE) return a.id
        }
      } else {
        // Rectangle/line/point
        const x1 = timeToX(a.timeStart), x2 = timeToX(a.timeEnd)
        const y1 = priceToY(a.priceStart), y2 = priceToY(a.priceEnd)
        if (x1 === null || x2 === null || y1 === null || y2 === null) continue
        const xL = Math.min(x1, x2), xR = Math.max(x1, x2)
        const yT = Math.min(y1, y2), yB = Math.max(y1, y2)
        if (x >= xL - HIT_TOLERANCE && x <= xR + HIT_TOLERANCE && y >= yT - HIT_TOLERANCE && y <= yB + HIT_TOLERANCE) return a.id
      }
    }
    return null
  }, [annotations, timeToX, priceToY])

  // Keep findAnnotationAtRef in sync (must be after findAnnotationAt is defined)
  findAnnotationAtRef.current = findAnnotationAt

  // ─── Mouse handlers ────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return
    if (e.button === 2) return  // right-click handled by contextmenu
    const rect = containerRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // ─── TRADE ZONE DRAWING MODE ───
    if (activeTradeZone && onUpdateTradeZones) {
      const t = xToTime(x), p = yToPrice(y)
      if (t === null || p === null) return
      setTradeZoneDraft({ startTime: t, startPrice: p, currentTime: t, currentPrice: p })
      return
    }

    // ─── EDITABLE MODE: check for drag/resize on selected annotation ───
    if (editable && !activeTool && selectedAnnotationId && onUpdateAnnotation) {
      const sel = annotations.find(a => a.id === selectedAnnotationId)
      if (sel) {
        const def = CONCEPT_MAP[sel.type]
        if (def) {
          // Polyline: check if clicking on a vertex
          if (def.geometry === 'polyline' && sel.points) {
            for (let i = 0; i < sel.points.length; i++) {
              const p = sel.points[i]
              const px = timeToX(p.time), py = priceToY(p.price)
              if (px !== null && py !== null && Math.hypot(x - px, y - py) < HIT_TOLERANCE) {
                setDragInfo({
                  annotationId: sel.id,
                  mode: 'vertex',
                  vertexIdx: i,
                  startMouse: { x, y },
                  original: { ...sel, points: [...sel.points] },
                })
                return
              }
            }
          }

          // Arrow: check if clicking on the arrow
          if (def.geometry === 'arrow' && sel.arrow) {
            const ax = timeToX(sel.arrow.time), ay = priceToY(sel.arrow.price)
            if (ax !== null && ay !== null && Math.hypot(x - ax, y - ay) < HIT_TOLERANCE + 10) {
              setDragInfo({
                annotationId: sel.id,
                mode: 'move',
                startMouse: { x, y },
                original: { ...sel, arrow: { ...sel.arrow } },
              })
              return
            }
          }

          // Rectangle/line/point: check corners for resize, body for move
          if (def.geometry === 'rectangle' || def.geometry === 'line' || def.geometry === 'point') {
            const x1 = timeToX(sel.timeStart), x2 = timeToX(sel.timeEnd)
            const y1 = priceToY(sel.priceStart), y2 = priceToY(sel.priceEnd)
            if (x1 !== null && x2 !== null && y1 !== null && y2 !== null) {
              const xL = Math.min(x1, x2), xR = Math.max(x1, x2)
              const yT = Math.min(y1, y2), yB = Math.max(y1, y2)

              // Check corners (resize)
              const nearTL = Math.hypot(x - xL, y - yT) < HIT_TOLERANCE + 5
              const nearBR = Math.hypot(x - xR, y - yB) < HIT_TOLERANCE + 5

              if (nearBR) {
                setDragInfo({
                  annotationId: sel.id,
                  mode: 'resize-tr',
                  startMouse: { x, y },
                  original: { priceStart: sel.priceStart, priceEnd: sel.priceEnd, timeStart: sel.timeStart, timeEnd: sel.timeEnd },
                })
                return
              }
              if (nearTL) {
                setDragInfo({
                  annotationId: sel.id,
                  mode: 'resize-bl',
                  startMouse: { x, y },
                  original: { priceStart: sel.priceStart, priceEnd: sel.priceEnd, timeStart: sel.timeStart, timeEnd: sel.timeEnd },
                })
                return
              }

              // Check body (move)
              if (x >= xL - HIT_TOLERANCE && x <= xR + HIT_TOLERANCE && y >= yT - HIT_TOLERANCE && y <= yB + HIT_TOLERANCE) {
                setDragInfo({
                  annotationId: sel.id,
                  mode: 'move',
                  startMouse: { x, y },
                  original: { priceStart: sel.priceStart, priceEnd: sel.priceEnd, timeStart: sel.timeStart, timeEnd: sel.timeEnd },
                })
                return
              }
            }
          }
        }
      }
    }

    // ─── DRAWING MODE: create new annotations ───
    if (activeTool) {
      const def = CONCEPT_MAP[activeTool]
      const t = xToTime(x), p = yToPrice(y)
      if (t === null || p === null) return

      if (def.geometry === 'polyline') {
        setPolylineDraft(prev => prev ? [...prev, { time: t, price: p }] : [{ time: t, price: p }])
        return
      }
      if (def.geometry === 'arrow') {
        const barIdx = bars.findIndex(b => b.time >= t)
        const bar = barIdx >= 0 ? bars[barIdx] : bars[bars.length - 1]
        if (!bar) return
        const isAbove = p > bar.h
        const isBelow = p < bar.l
        const arrowPrice = isAbove ? bar.h : (isBelow ? bar.l : (p >= bar.c ? bar.h : bar.l))
        const isHigh = isAbove || (!isBelow && p >= bar.c)
        const timePad = (bars[1]?.time - bars[0]?.time) || 3600000
        onCreateDraft({
          type: activeTool,
          direction,
          priceStart: arrowPrice,
          priceEnd: arrowPrice,
          timeStart: bar.time,
          timeEnd: bar.time + timePad,
          arrow: { time: bar.time, price: arrowPrice, isHigh },
        })
        return
      }
      setDraftRect({ startTime: t, startPrice: p, currentTime: t, currentPrice: p })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (readOnly) return
    const rect = containerRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })

    // ─── TRADE ZONE DRAG in progress ───
    if (tradeZoneDraft) {
      const t = xToTime(x), p = yToPrice(y)
      if (t !== null && p !== null) {
        setTradeZoneDraft(d => d ? { ...d, currentTime: t, currentPrice: p } : null)
      }
      return
    }

    // ─── DRAG/RESIZE in progress ───
    if (dragInfo && onUpdateAnnotation) {
      const t = xToTime(x), p = yToPrice(y)
      if (t === null || p === null) return
      const orig = dragInfo.original
      const ann = annotations.find(a => a.id === dragInfo.annotationId)
      if (!ann) return

      if (dragInfo.mode === 'vertex' && ann.points && dragInfo.vertexIdx !== undefined) {
        // Drag a single polyline vertex
        const newPoints = [...ann.points]
        newPoints[dragInfo.vertexIdx] = { time: t, price: p }
        // Update priceStart/priceEnd/timeStart/timeEnd to encompass all points
        const times = newPoints.map(pt => pt.time)
        const prices = newPoints.map(pt => pt.price)
        onUpdateAnnotation(ann.id, {
          points: newPoints,
          timeStart: Math.min(...times),
          timeEnd: Math.max(...times),
          priceStart: Math.min(...prices),
          priceEnd: Math.max(...prices),
        })
      } else if (dragInfo.mode === 'move') {
        // Move entire annotation by delta
        const startT = xToTime(dragInfo.startMouse.x)
        const startP = yToPrice(dragInfo.startMouse.y)
        if (startT === null || startP === null) return
        const dt = t - startT
        const dp = p - startP

        if (ann.points) {
          // Polyline move: shift all points
          const newPoints = (orig.points || ann.points).map(pt => ({ time: pt.time + dt, price: pt.price + dp }))
          const times = newPoints.map(pt => pt.time)
          const prices = newPoints.map(pt => pt.price)
          onUpdateAnnotation(ann.id, {
            points: newPoints,
            timeStart: Math.min(...times),
            timeEnd: Math.max(...times),
            priceStart: Math.min(...prices),
            priceEnd: Math.max(...prices),
          })
        } else if (ann.arrow) {
          // Arrow move
          onUpdateAnnotation(ann.id, {
            arrow: { ...ann.arrow, time: orig.arrow.time + dt, price: orig.arrow.price + dp },
            timeStart: orig.timeStart + dt,
            timeEnd: orig.timeEnd + dt,
            priceStart: orig.arrow.price + dp,
            priceEnd: orig.arrow.price + dp,
          })
        } else {
          // Rectangle/line move
          onUpdateAnnotation(ann.id, {
            timeStart: orig.timeStart + dt,
            timeEnd: orig.timeEnd + dt,
            priceStart: orig.priceStart + dp,
            priceEnd: orig.priceEnd + dp,
          })
        }
      } else if (dragInfo.mode === 'resize-tr' || dragInfo.mode === 'resize-bl') {
        // Resize rectangle: adjust priceEnd/timeEnd (TR) or priceStart/timeStart (BL)
        if (dragInfo.mode === 'resize-tr') {
          onUpdateAnnotation(ann.id, {
            timeEnd: Math.max(orig.timeStart, t),
            priceEnd: Math.max(orig.priceStart, p),
          })
        } else {
          onUpdateAnnotation(ann.id, {
            timeStart: Math.min(orig.timeEnd, t),
            priceStart: Math.min(orig.priceEnd, p),
          })
        }
      }
      return
    }

    if (draftRect) {
      const t = xToTime(x), p = yToPrice(y)
      if (t !== null && p !== null) {
        setDraftRect(d => d ? { ...d, currentTime: t, currentPrice: p } : null)
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (readOnly) return
    if (e.button === 2) return

    // ─── Save trade zone ───
    if (tradeZoneDraft && activeTradeZone && onUpdateTradeZones) {
      const tStart = Math.min(tradeZoneDraft.startTime, tradeZoneDraft.currentTime)
      const tEnd = Math.max(tradeZoneDraft.startTime, tradeZoneDraft.currentTime)
      const pStart = Math.min(tradeZoneDraft.startPrice, tradeZoneDraft.currentPrice)
      const pEnd = Math.max(tradeZoneDraft.startPrice, tradeZoneDraft.currentPrice)
      // Only save if the zone has non-zero size
      if (tEnd > tStart && pEnd > pStart) {
        // Merge with the LATEST tradeZones prop (not the ref, which may be stale)
        const newZones = { ...(tradeZones || {}) }
        newZones[activeTradeZone] = { timeStart: tStart, timeEnd: tEnd, priceStart: pStart, priceEnd: pEnd }
        onUpdateTradeZones(newZones)
      }
      setTradeZoneDraft(null)
      return
    }

    // End drag/resize
    if (dragInfo) {
      setDragInfo(null)
      return
    }

    if (draftRect && activeTool) {
      const def = CONCEPT_MAP[activeTool]
      const tStart = Math.min(draftRect.startTime, draftRect.currentTime)
      const tEnd = Math.max(draftRect.startTime, draftRect.currentTime)
      const pStart = Math.min(draftRect.startPrice, draftRect.currentPrice)
      const pEnd = Math.max(draftRect.startPrice, draftRect.currentPrice)

      if (def.geometry === 'point' || def.geometry === 'line') {
        const timePad = (bars[1]?.time - bars[0]?.time) || 3600000
        onCreateDraft({
          type: activeTool,
          direction,
          priceStart: def.geometry === 'point' ? pStart : Math.min(pStart, pEnd),
          priceEnd: def.geometry === 'point' ? pStart : Math.max(pStart, pEnd),
          timeStart: tStart,
          timeEnd: def.geometry === 'line' ? tEnd : tStart + timePad,
        })
      } else {
        onCreateDraft({
          type: activeTool,
          direction,
          priceStart: pStart,
          priceEnd: pEnd,
          timeStart: tStart,
          timeEnd: tEnd || tStart + 3600000,
        })
      }
      setDraftRect(null)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (readOnly) return
    if (activeTool) return  // drawing mode
    const rect = containerRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const hit = findAnnotationAt(x, y)
    onSelectAnnotation(hit)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (readOnly) return
    e.preventDefault()
    const rect = containerRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // If polyline tool active → finish the polyline on right-click
    if (activeTool) {
      const def = CONCEPT_MAP[activeTool]
      if (def.geometry === 'polyline' && polylineDraft && polylineDraft.length >= 2) {
        finishPolyline()
        return
      }
      return
    }

    // No tool active → show context menu on annotation
    const hit = findAnnotationAt(x, y)
    if (hit) onSelectAnnotation(hit)
    setContextMenu({ x, y, annotationId: hit || '' })
  }

  const activeToolDef = activeTool ? CONCEPT_MAP[activeTool] : null
  const isPolylineMode = activeToolDef?.geometry === 'polyline'
  const isArrowMode = activeToolDef?.geometry === 'arrow'

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ background: '#1a1a1a', minHeight: '300px' }}
      onContextMenu={handleContextMenu}
    >
      {/* Overlay canvas for drawing + annotations */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0"
        style={{
          zIndex: 10,
          pointerEvents: (activeTool || activeTradeZone || (editable && selectedAnnotationId)) ? 'auto' : 'none',
          cursor: activeTool ? 'crosshair' : (editable && selectedAnnotationId ? 'move' : 'default'),
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setDraftRect(null); setMousePos(null) }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />

      {/* Drawing mode indicator */}
      {activeTradeZone && !readOnly && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-mono pointer-events-none z-20">
          Drawing trade zone: <span style={{ color: activeTradeZone === 'entry' ? '#22c55e' : activeTradeZone === 'sl' ? '#ef4444' : '#3b82f6' }}>
            {activeTradeZone === 'entry' ? 'ENTRY' : activeTradeZone === 'sl' ? 'SL' : 'TP'}
          </span> — click and drag on chart
        </div>
      )}
      {activeTool && !readOnly && !activeTradeZone && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-mono pointer-events-none z-20">
          Drawing: <span style={{ color: activeToolDef!.color }}>{activeToolDef!.label}</span> ({direction}) —
          {isPolylineMode
            ? ' LEFT-CLICK to add points, RIGHT-CLICK or Enter to finish, Esc to cancel'
            : isArrowMode
              ? ' CLICK above a candle (down arrow) or below (up arrow)'
              : ' click and drag on chart'}
        </div>
      )}
      {!activeTool && !activeTradeZone && !readOnly && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-white/70 text-xs font-mono pointer-events-none z-20">
          Drag to pan · Scroll to zoom · Click to select · Right-click annotation for options
        </div>
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          className="absolute z-50 min-w-[180px] bg-popover border rounded-md shadow-lg py-1 text-sm"
          style={{
            left: Math.min(contextMenu.x, size.w - 200),
            top: Math.min(contextMenu.y, size.h - 150),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.annotationId ? (
            <>
              {onCreatePost && (
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-accent transition-colors font-medium"
                  onClick={() => { onCreatePost(contextMenu.annotationId); setContextMenu(null) }}
                >
                  📝 Create Post
                </button>
              )}
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-accent transition-colors"
                onClick={() => { onSelectAnnotation(contextMenu.annotationId); setContextMenu(null) }}
              >
                ✏️ Edit Annotation
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 text-muted-foreground text-xs">
              No annotation here.
              <br />
              Right-click on an annotation to create a post.
            </div>
          )}
          <div className="border-t my-1" />
          <button
            className="w-full text-left px-3 py-1.5 hover:bg-accent transition-colors text-muted-foreground"
            onClick={() => { onSelectAnnotation(null); setContextMenu(null) }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  )
}
