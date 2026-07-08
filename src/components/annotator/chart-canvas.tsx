'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
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
  label: string
  points?: PolylinePoint[]      // for polyline geometry
  arrow?: { time: number; price: number; isHigh: boolean }  // for arrow marker
}

export interface DraftAnnotation {
  type: ConceptType
  direction: 'bullish' | 'bearish' | 'neutral'
  priceStart: number
  priceEnd: number
  timeStart: number
  timeEnd: number
  points?: PolylinePoint[]      // for polyline geometry
  arrow?: { time: number; price: number; isHigh: boolean }
}

interface ChartCanvasProps {
  bars: Bar[]
  annotations: Annotation[]
  activeTool: ConceptType | null
  direction: 'bullish' | 'bearish' | 'neutral'
  selectedAnnotationId: string | null
  onSelectAnnotation: (id: string | null) => void
  onCreateDraft: (draft: DraftAnnotation) => void
  onCreatePost?: (annotationId: string) => void   // right-click "Create Post"
  pipSize: number
  readOnly?: boolean   // when true, no drawing/editing (for history view)
  previewAnnotation?: {
    type: ConceptType
    priceStart: number
    priceEnd: number
    timeStart: number
    timeEnd: number
    points?: PolylinePoint[]
    arrow?: { time: number; price: number; isHigh: boolean }
  } | null
}

interface View {
  startIdx: number
  endIdx: number
  priceMin: number
  priceMax: number
}

const RIGHT_PADDING = 80
const BOTTOM_PADDING = 50
const TOP_PADDING = 20
const LEFT_PADDING = 10

export default function ChartCanvas({
  bars,
  annotations,
  activeTool,
  direction,
  selectedAnnotationId,
  onSelectAnnotation,
  onCreateDraft,
  onCreatePost,
  pipSize,
  readOnly = false,
  previewAnnotation = null,
}: ChartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 500 })

  // Rectangle/line draft (click-drag)
  const [draft, setDraft] = useState<{
    startTime: number | null
    startPrice: number | null
    currentTime: number | null
    currentPrice: number | null
  } | null>(null)

  // Polyline draft (multi-click): array of points being collected
  const [polylineDraft, setPolylineDraft] = useState<PolylinePoint[] | null>(null)
  const [polylinePreview, setPolylinePreview] = useState<PolylinePoint | null>(null)

  // Right-click context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; annotationId: string } | null>(null)

  const dragState = useRef<{
    mode: 'pan' | 'draw' | 'none'
    startX: number
    startY: number
    startView?: View
  }>({ mode: 'none', startX: 0, startY: 0 })

  // ─── View management ─────────────────────────────────────────────────
  const computePriceRange = useCallback((startIdx: number, endIdx: number) => {
    if (endIdx <= startIdx) return { min: 0, max: 1 }
    let lo = Infinity, hi = -Infinity
    for (let i = startIdx; i < endIdx && i < bars.length; i++) {
      const b = bars[i]
      if (b.l < lo) lo = b.l
      if (b.h > hi) hi = b.h
    }
    if (!isFinite(lo) || !isFinite(hi)) return { min: 0, max: 1 }
    const pad = (hi - lo) * 0.1
    return { min: lo - pad, max: hi + pad }
  }, [bars])

  const [view, setView] = useState<View>(initialViewFromBars(bars))
  const [prevBarsRef, setPrevBarsRef] = useState<Bar[] | null>(bars)
  if (bars !== prevBarsRef) {
    setPrevBarsRef(bars)
    if (bars.length > 0) {
      setView(initialViewFromBars(bars))
    }
    // Reset any in-progress polyline when bars change
    if (polylineDraft) setPolylineDraft(null)
  }

  function initialViewFromBars(bs: Bar[]): View {
    if (bs.length === 0) return { startIdx: 0, endIdx: 0, priceMin: 0, priceMax: 1 }
    const endIdx = Math.min(200, bs.length)
    let lo = Infinity, hi = -Infinity
    for (let i = 0; i < endIdx; i++) {
      if (bs[i].l < lo) lo = bs[i].l
      if (bs[i].h > hi) hi = bs[i].h
    }
    if (!isFinite(lo) || !isFinite(hi)) return { startIdx: 0, endIdx, priceMin: 0, priceMax: 1 }
    const pad = (hi - lo) * 0.1
    return { startIdx: 0, endIdx, priceMin: lo - pad, priceMax: hi + pad }
  }

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ w: width, h: height })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Close context menu on any click outside
  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(null)
    window.addEventListener('click', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('click', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [contextMenu])

  // ─── Coordinate transforms ───────────────────────────────────────────
  const xForIdx = useCallback((idx: number) => {
    const plotW = size.w - RIGHT_PADDING - LEFT_PADDING
    const range = view.endIdx - view.startIdx
    if (range <= 0) return LEFT_PADDING
    return LEFT_PADDING + ((idx - view.startIdx) / range) * plotW
  }, [size.w, view.startIdx, view.endIdx])

  const idxForX = useCallback((x: number) => {
    const plotW = size.w - RIGHT_PADDING - LEFT_PADDING
    const range = view.endIdx - view.startIdx
    const idx = view.startIdx + ((x - LEFT_PADDING) / plotW) * range
    return Math.max(0, Math.min(bars.length - 1, Math.round(idx)))
  }, [size.w, view.startIdx, view.endIdx, bars.length])

  const yForPrice = useCallback((price: number) => {
    const plotH = size.h - BOTTOM_PADDING - TOP_PADDING
    const range = view.priceMax - view.priceMin
    if (range <= 0) return TOP_PADDING
    return TOP_PADDING + ((view.priceMax - price) / range) * plotH
  }, [size.h, view.priceMin, view.priceMax])

  const priceForY = useCallback((y: number) => {
    const plotH = size.h - BOTTOM_PADDING - TOP_PADDING
    const range = view.priceMax - view.priceMin
    return view.priceMax - ((y - TOP_PADDING) / plotH) * range
  }, [size.h, view.priceMin, view.priceMax])

  // Helper: find nearest bar time for a given x (snaps polyline points to bar times)
  const timeForX = useCallback((x: number): number => {
    const idx = idxForX(x)
    return bars[idx]?.time ?? Date.now()
  }, [idxForX, bars])

  // ─── Drawing ─────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    canvas.style.width = `${size.w}px`
    canvas.style.height = `${size.h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, size.w, size.h)

    // Grid + axes
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 1
    ctx.fillStyle = '#888'
    ctx.font = '10px monospace'

    const priceRange = view.priceMax - view.priceMin
    for (let i = 0; i <= 8; i++) {
      const y = TOP_PADDING + (i / 8) * (size.h - BOTTOM_PADDING - TOP_PADDING)
      const price = view.priceMax - (i / 8) * priceRange
      ctx.beginPath()
      ctx.moveTo(LEFT_PADDING, y)
      ctx.lineTo(size.w - RIGHT_PADDING, y)
      ctx.stroke()
      ctx.textAlign = 'left'
      ctx.fillText(price.toFixed(pipSize < 0.01 ? 5 : 2), size.w - RIGHT_PADDING + 5, y + 3)
    }

    const barRange = view.endIdx - view.startIdx
    for (let i = 0; i <= 8; i++) {
      const x = LEFT_PADDING + (i / 8) * (size.w - RIGHT_PADDING - LEFT_PADDING)
      ctx.beginPath()
      ctx.moveTo(x, TOP_PADDING)
      ctx.lineTo(x, size.h - BOTTOM_PADDING)
      ctx.stroke()
      const idx = Math.round(view.startIdx + (i / 8) * barRange)
      if (idx >= 0 && idx < bars.length) {
        const dt = new Date(bars[idx].time)
        const label = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        ctx.textAlign = 'center'
        ctx.fillText(label, x, size.h - BOTTOM_PADDING + 15)
      }
    }

    ctx.strokeStyle = '#444'
    ctx.strokeRect(LEFT_PADDING, TOP_PADDING, size.w - RIGHT_PADDING - LEFT_PADDING, size.h - BOTTOM_PADDING - TOP_PADDING)

    // Candles
    const candleW = Math.max(1, ((size.w - RIGHT_PADDING - LEFT_PADDING) / barRange) * 0.7)
    for (let i = view.startIdx; i < view.endIdx && i < bars.length; i++) {
      const b = bars[i]
      const x = xForIdx(i)
      const yO = yForPrice(b.o)
      const yC = yForPrice(b.c)
      const yH = yForPrice(b.h)
      const yL = yForPrice(b.l)
      const isUp = b.c >= b.o
      const color = isUp ? '#3d8154' : '#aa4b42'

      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, yH)
      ctx.lineTo(x, yL)
      ctx.stroke()

      ctx.fillStyle = color
      const bodyTop = Math.min(yO, yC)
      const bodyH = Math.max(1, Math.abs(yC - yO))
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH)
    }

    // Annotations
    for (const a of annotations) {
      const def = CONCEPT_MAP[a.type]
      if (!def) continue
      const isSelected = a.id === selectedAnnotationId

      if (def.geometry === 'polyline' && a.points && a.points.length >= 2) {
        // ─── Polyline rendering ────────────────────────────────────────
        ctx.strokeStyle = def.color
        ctx.lineWidth = isSelected ? 3 : 2
        ctx.beginPath()
        for (let i = 0; i < a.points.length; i++) {
          const p = a.points[i]
          // Find x by matching bar time to index
          const idx = bars.findIndex(b => b.time >= p.time)
          const useIdx = idx === -1 ? bars.length - 1 : Math.max(0, idx)
          const px = xForIdx(useIdx)
          const py = yForPrice(p.price)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()

        // Draw vertex dots
        ctx.fillStyle = def.color
        for (const p of a.points) {
          const idx = bars.findIndex(b => b.time >= p.time)
          const useIdx = idx === -1 ? bars.length - 1 : Math.max(0, idx)
          const px = xForIdx(useIdx)
          const py = yForPrice(p.price)
          ctx.beginPath()
          ctx.arc(px, py, isSelected ? 4 : 3, 0, Math.PI * 2)
          ctx.fill()
        }

        // Label at first point
        if (a.points.length > 0) {
          const p0 = a.points[0]
          const idx0 = bars.findIndex(b => b.time >= p0.time)
          const useIdx0 = idx0 === -1 ? bars.length - 1 : Math.max(0, idx0)
          const px0 = xForIdx(useIdx0)
          const py0 = yForPrice(p0.price)
          ctx.fillStyle = def.color
          ctx.font = 'bold 10px monospace'
          ctx.textAlign = 'left'
          ctx.fillText(def.shortLabel, px0 + 6, py0 - 6)
        }
      } else if (def.geometry === 'arrow' && a.arrow) {
        // ─── Arrow rendering ────────────────────────────────────────────
        // Arrow points DOWN from a candle high (isHigh=true) or UP from a low (isHigh=false).
        const idx = bars.findIndex(b => b.time >= a.arrow!.time)
        if (idx === -1 || idx < view.startIdx || idx >= view.endIdx) continue
        const cx = xForIdx(idx)
        const cy = yForPrice(a.arrow!.price)
        const isHigh = a.arrow!.isHigh
        const arrowSize = isSelected ? 12 : 10
        const stemLen = isSelected ? 22 : 18

        ctx.strokeStyle = def.color
        ctx.fillStyle = def.color
        ctx.lineWidth = isSelected ? 2.5 : 2

        if (isHigh) {
          // Down arrow: stem goes from above the high DOWN to the high
          const stemTop = cy - stemLen
          ctx.beginPath()
          ctx.moveTo(cx, stemTop)
          ctx.lineTo(cx, cy)
          ctx.stroke()
          // Arrowhead at the bottom (pointing down at the high)
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(cx - arrowSize / 2, cy - arrowSize)
          ctx.lineTo(cx + arrowSize / 2, cy - arrowSize)
          ctx.closePath()
          ctx.fill()
          // Label above the stem
          ctx.font = 'bold 10px monospace'
          ctx.textAlign = 'center'
          ctx.fillText(def.shortLabel, cx, stemTop - 4)
        } else {
          // Up arrow: stem goes from below the low UP to the low
          const stemBot = cy + stemLen
          ctx.beginPath()
          ctx.moveTo(cx, stemBot)
          ctx.lineTo(cx, cy)
          ctx.stroke()
          // Arrowhead at the top (pointing up at the low)
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(cx - arrowSize / 2, cy + arrowSize)
          ctx.lineTo(cx + arrowSize / 2, cy + arrowSize)
          ctx.closePath()
          ctx.fill()
          // Label below the stem
          ctx.font = 'bold 10px monospace'
          ctx.textAlign = 'center'
          ctx.fillText(def.shortLabel, cx, stemBot + 12)
        }
      } else {
        // ─── Rectangle / line / point rendering (existing logic) ───────
        const startIdx = bars.findIndex(b => b.time >= a.timeStart)
        const endIdx = bars.findIndex(b => b.time >= a.timeEnd)
        if (startIdx === -1 || startIdx >= view.endIdx) continue
        const visStartIdx = Math.max(startIdx, view.startIdx)
        const visEndIdx = endIdx === -1 ? view.endIdx - 1 : Math.min(endIdx, view.endIdx - 1)
        if (visEndIdx < visStartIdx) continue

        const x1 = xForIdx(visStartIdx)
        const x2 = xForIdx(visEndIdx)
        const y1 = yForPrice(a.priceStart)
        const y2 = yForPrice(a.priceEnd)

        ctx.globalAlpha = isSelected ? 0.45 : 0.25
        ctx.fillStyle = def.color
        ctx.fillRect(x1, Math.min(y1, y2), x2 - x1, Math.abs(y2 - y1))
        ctx.globalAlpha = 1

        ctx.strokeStyle = def.color
        ctx.lineWidth = isSelected ? 2 : 1
        ctx.strokeRect(x1, Math.min(y1, y2), x2 - x1, Math.abs(y2 - y1))

        ctx.fillStyle = def.color
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(def.shortLabel, x1 + 4, Math.min(y1, y2) + 12)
      }
    }

    // Rectangle/line draft (click-drag in progress)
    if (draft && draft.startTime !== null && draft.currentTime !== null && draft.startPrice !== null && draft.currentPrice !== null) {
      const startTime = draft.startTime
      const currentTime = draft.currentTime
      const startPrice = draft.startPrice
      const currentPrice = draft.currentPrice
      const startIdx = bars.findIndex(b => b.time >= startTime)
      const endIdx = bars.findIndex(b => b.time >= currentTime)
      if (startIdx !== -1) {
        const x1 = xForIdx(startIdx)
        const x2 = xForIdx(endIdx === -1 ? view.endIdx - 1 : endIdx)
        const y1 = yForPrice(startPrice)
        const y2 = yForPrice(currentPrice)
        ctx.globalAlpha = 0.3
        ctx.fillStyle = activeTool ? CONCEPT_MAP[activeTool].color : '#fff'
        ctx.fillRect(x1, Math.min(y1, y2), x2 - x1, Math.abs(y2 - y1))
        ctx.globalAlpha = 1
        ctx.strokeStyle = activeTool ? CONCEPT_MAP[activeTool].color : '#fff'
        ctx.setLineDash([5, 3])
        ctx.lineWidth = 1.5
        ctx.strokeRect(x1, Math.min(y1, y2), x2 - x1, Math.abs(y2 - y1))
        ctx.setLineDash([])
      }
    }

    // Polyline draft (multi-click in progress)
    if (polylineDraft && polylineDraft.length > 0 && activeTool) {
      const color = CONCEPT_MAP[activeTool].color
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.beginPath()
      for (let i = 0; i < polylineDraft.length; i++) {
        const p = polylineDraft[i]
        const idx = bars.findIndex(b => b.time >= p.time)
        const useIdx = idx === -1 ? bars.length - 1 : Math.max(0, idx)
        const px = xForIdx(useIdx)
        const py = yForPrice(p.price)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      // Preview line to cursor
      if (polylinePreview) {
        const idx = bars.findIndex(b => b.time >= polylinePreview.time)
        const useIdx = idx === -1 ? bars.length - 1 : Math.max(0, idx)
        const px = xForIdx(useIdx)
        const py = yForPrice(polylinePreview.price)
        ctx.lineTo(px, py)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Draw collected vertex dots
      ctx.fillStyle = color
      for (const p of polylineDraft) {
        const idx = bars.findIndex(b => b.time >= p.time)
        const useIdx = idx === -1 ? bars.length - 1 : Math.max(0, idx)
        const px = xForIdx(useIdx)
        const py = yForPrice(p.price)
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [bars, annotations, view, size, draft, polylineDraft, polylinePreview, activeTool, selectedAnnotationId, xForIdx, yForPrice, pipSize])

  useEffect(() => { draw() }, [draw])

  // ─── Mouse handlers ──────────────────────────────────────────────────

  // Finish a polyline draft: convert points to a DraftAnnotation
  const finishPolyline = useCallback(() => {
    if (!polylineDraft || polylineDraft.length < 2 || !activeTool) {
      setPolylineDraft(null)
      setPolylinePreview(null)
      return
    }
    const times = polylineDraft.map(p => p.time)
    const prices = polylineDraft.map(p => p.price)
    const tStart = Math.min(...times)
    const tEnd = Math.max(...times)
    const pStart = Math.min(...prices)
    const pEnd = Math.max(...prices)
    onCreateDraft({
      type: activeTool,
      direction,
      priceStart: pStart,
      priceEnd: pEnd,
      timeStart: tStart,
      timeEnd: tEnd,
      points: polylineDraft,
    })
    setPolylineDraft(null)
    setPolylinePreview(null)
  }, [polylineDraft, activeTool, direction, onCreateDraft])

  // Cancel polyline on Escape
  useEffect(() => {
    if (!polylineDraft) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPolylineDraft(null)
        setPolylinePreview(null)
      } else if (e.key === 'Enter') {
        finishPolyline()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [polylineDraft, finishPolyline])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return
    // Ignore right-click (button === 2) — let onContextMenu handle it
    if (e.button === 2) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    dragState.current.startX = x
    dragState.current.startY = y
    dragState.current.startView = { ...view }

    if (activeTool) {
      const def = CONCEPT_MAP[activeTool]
      if (def.geometry === 'polyline') {
        // Polyline annotations are created via RIGHT-CLICK, not left-click drag.
        // Left-click does nothing in polyline mode (just return).
        dragState.current.mode = 'none'
        return
      }
      if (def.geometry === 'arrow') {
        // Arrow annotations: single LEFT-CLICK creates arrow immediately.
        // If click is above the candle's high → DOWN arrow attached to the high.
        // If click is below the candle's low → UP arrow attached to the low.
        // If click is inside the candle's range → pick nearest extreme.
        const idx = idxForX(x)
        const clickPrice = priceForY(y)
        const bar = bars[idx]
        if (!bar) return
        const isAbove = clickPrice > bar.h
        const isBelow = clickPrice < bar.l
        const arrowPrice = isAbove ? bar.h : (isBelow ? bar.l : (clickPrice >= bar.c ? bar.h : bar.l))
        const isHigh = (isAbove || (!isBelow && clickPrice >= bar.c))  // true = arrow points DOWN from high

        dragState.current.mode = 'none'
        // Use a small time window so the arrow has non-zero width for hit-testing
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
      // Rectangle/line/point: click-drag
      const idx = idxForX(x)
      const price = priceForY(y)
      const time = bars[idx]?.time ?? Date.now()
      dragState.current.mode = 'draw'
      setDraft({ startTime: time, startPrice: price, currentTime: time, currentPrice: price })
    } else {
      dragState.current.mode = 'pan'
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (readOnly) return
    // Ignore right-click drag
    if (e.buttons === 2) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (dragState.current.mode === 'pan' && dragState.current.startView) {
      const dx = x - dragState.current.startX
      const barRange = dragState.current.startView.endIdx - dragState.current.startView.startIdx
      const plotW = size.w - RIGHT_PADDING - LEFT_PADDING
      const barShift = -Math.round((dx / plotW) * barRange)
      const newStart = Math.max(0, dragState.current.startView.startIdx + barShift)
      const newEnd = Math.min(bars.length, newStart + barRange)
      if (newEnd - newStart === barRange) {
        setView(v => ({ ...v, startIdx: newStart, endIdx: newEnd }))
      }
    } else if (dragState.current.mode === 'draw') {
      const idx = idxForX(x)
      const price = priceForY(y)
      const time = bars[idx]?.time ?? Date.now()
      setDraft(d => d ? { ...d, currentTime: time, currentPrice: price } : null)
    } else if (polylineDraft) {
      // Show preview line from last point to cursor
      const idx = idxForX(x)
      const price = priceForY(y)
      const time = bars[idx]?.time ?? Date.now()
      setPolylinePreview({ time, price })
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (readOnly) return
    // Ignore right-click
    if (e.button === 2) return
    if (dragState.current.mode === 'draw' && draft && activeTool) {
      const rect = canvasRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const idx = idxForX(x)
      const price = priceForY(y)
      const time = bars[idx]?.time ?? Date.now()

      const draftStart = draft.startTime ?? time
      const draftPrice = draft.startPrice ?? price
      const tStart = Math.min(draftStart, time)
      const tEnd = Math.max(draftStart, time)
      const pStart = Math.min(draftPrice, price)
      const pEnd = Math.max(draftPrice, price)

      const def = CONCEPT_MAP[activeTool]
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
      setDraft(null)
    }
    dragState.current.mode = 'none'
  }

  // Double-click finishes a polyline
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (readOnly) return
    if (polylineDraft && polylineDraft.length >= 2) {
      // The double-click also added a point via mousedown; remove the duplicate last point
      setPolylineDraft(prev => {
        if (!prev || prev.length < 2) return prev
        // Check if last two points are very close (duplicate from dblclick)
        const last = prev[prev.length - 1]
        const second = prev[prev.length - 2]
        if (last.time === second.time && Math.abs(last.price - second.price) < 0.0001) {
          return prev.slice(0, -1)
        }
        return prev
      })
      finishPolyline()
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const rect = canvasRef.current!.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseIdx = idxForX(mouseX)
    const zoomIn = e.deltaY < 0
    const factor = zoomIn ? 0.8 : 1.25
    const oldRange = view.endIdx - view.startIdx
    const newRange = Math.max(20, Math.min(bars.length, Math.round(oldRange * factor)))
    const newStart = Math.max(0, Math.min(bars.length - newRange, mouseIdx - Math.round((mouseIdx - view.startIdx) * (newRange / oldRange))))
    const newEnd = newStart + newRange
    const priceRange = computePriceRange(newStart, newEnd)
    setView(v => ({
      startIdx: newStart,
      endIdx: newEnd,
      priceMin: priceRange.min,
      priceMax: priceRange.max,
    }))
  }

  const handleClick = (e: React.MouseEvent) => {
    if (readOnly) return
    if (activeTool) return // drawing mode, don't select
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find topmost annotation under cursor
    let hit: string | null = null
    for (let i = annotations.length - 1; i >= 0; i--) {
      const a = annotations[i]
      const def = CONCEPT_MAP[a.type]
      if (!def) continue

      if (def.geometry === 'polyline' && a.points) {
        // Check distance to any segment of the polyline
        for (let j = 0; j < a.points.length - 1; j++) {
          const p1 = a.points[j]
          const p2 = a.points[j + 1]
          const idx1 = bars.findIndex(b => b.time >= p1.time)
          const idx2 = bars.findIndex(b => b.time >= p2.time)
          const useIdx1 = idx1 === -1 ? bars.length - 1 : Math.max(0, idx1)
          const useIdx2 = idx2 === -1 ? bars.length - 1 : Math.max(0, idx2)
          const x1 = xForIdx(useIdx1)
          const y1 = yForPrice(p1.price)
          const x2 = xForIdx(useIdx2)
          const y2 = yForPrice(p2.price)
          // Distance from point (x,y) to segment (x1,y1)-(x2,y2)
          const dist = pointToSegmentDistance(x, y, x1, y1, x2, y2)
          if (dist < 8) { hit = a.id; break }
        }
        if (hit) break
      } else if (def.geometry === 'arrow' && a.arrow) {
        // Arrow: check distance to the arrow point (stem + arrowhead area)
        const idx = bars.findIndex(b => b.time >= a.arrow!.time)
        if (idx === -1) continue
        const ax = xForIdx(idx)
        const ay = yForPrice(a.arrow!.price)
        // Hit zone: 15px radius around the arrow tip, plus the stem
        if (Math.hypot(x - ax, y - ay) < 15) { hit = a.id; break }
        // Also check along the stem
        const stemLen = 22
        const stemY = a.arrow!.isHigh ? ay - stemLen : ay + stemLen
        const distToStem = pointToSegmentDistance(x, y, ax, ay, ax, stemY)
        if (distToStem < 10) { hit = a.id; break }
      } else {
        const idx = idxForX(x)
        const startIdx = bars.findIndex(b => b.time >= a.timeStart)
        const endIdx = bars.findIndex(b => b.time >= a.timeEnd)
        if (startIdx === -1 || startIdx > idx) continue
        if (endIdx !== -1 && endIdx < idx) continue
        const y1 = yForPrice(a.priceStart)
        const y2 = yForPrice(a.priceEnd)
        const yTop = Math.min(y1, y2)
        const yBot = Math.max(y1, y2)
        if (y >= yTop - 5 && y <= yBot + 5) {
          hit = a.id
          break
        }
      }
    }
    onSelectAnnotation(hit)
  }

  // Right-click behavior:
  //   - If a POLYLINE tool is active → immediately create a polyline annotation
  //     at the clicked location with a default shape (3 points). This mirrors
  //     how releasing a left-drag creates a rectangle for rectangle tools.
  //   - If NO tool is active → show context menu on existing annotation
  //     (Create Post / Edit / Close) or a "no annotation" message.
  const handleContextMenu = (e: React.MouseEvent) => {
    if (readOnly) return
    // Always prevent the browser's default context menu
    e.preventDefault()
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // ─── CASE 1: Polyline tool is active → right-click creates annotation ───
    if (activeTool) {
      const def = CONCEPT_MAP[activeTool]
      if (def && def.geometry === 'polyline') {
        const clickIdx = idxForX(x)
        const clickPrice = priceForY(y)
        const clickTime = bars[clickIdx]?.time ?? Date.now()

        // Generate a default 3-point polyline shape around the click location.
        // The shape is a small zigzag that the user can edit later.
        // Point 1: a few bars back, slightly below click price
        // Point 2: at click location
        // Point 3: a few bars forward, slightly above click price
        const barSpan = Math.max(3, Math.floor((view.endIdx - view.startIdx) * 0.02))
        const priceSpan = (view.priceMax - view.priceMin) * 0.02

        const backIdx = Math.max(0, clickIdx - barSpan)
        const fwdIdx = Math.min(bars.length - 1, clickIdx + barSpan)
        const backTime = bars[backIdx]?.time ?? clickTime
        const fwdTime = bars[fwdIdx]?.time ?? clickTime

        const defaultPoints: PolylinePoint[] = [
          { time: backTime, price: clickPrice - priceSpan },
          { time: clickTime, price: clickPrice + priceSpan },
          { time: fwdTime, price: clickPrice - priceSpan },
        ]

        const times = defaultPoints.map(p => p.time)
        const prices = defaultPoints.map(p => p.price)
        onCreateDraft({
          type: activeTool,
          direction,
          priceStart: Math.min(...prices),
          priceEnd: Math.max(...prices),
          timeStart: Math.min(...times),
          timeEnd: Math.max(...times),
          points: defaultPoints,
        })
        // Note: tool deselection is handled by the parent (annotator-view)
        // when onCreateDraft is called — same as rectangle/line/point tools.
        return  // don't show context menu
      }
      // For non-polyline tools (rectangle/line/point), right-click does nothing special
      // — let the context menu show below or just return
      return
    }

    // ─── CASE 2: No tool active → context menu on existing annotation ───
    let hit: string | null = null
    const HIT_TOLERANCE = 15

    for (let i = annotations.length - 1; i >= 0; i--) {
      const a = annotations[i]
      const def = CONCEPT_MAP[a.type]
      if (!def) continue

      if (def.geometry === 'polyline' && a.points && a.points.length > 0) {
        let vertexHit = false
        for (const p of a.points) {
          const idx = bars.findIndex(b => b.time >= p.time)
          const useIdx = idx === -1 ? bars.length - 1 : Math.max(0, idx)
          const px = xForIdx(useIdx)
          const py = yForPrice(p.price)
          if (Math.hypot(x - px, y - py) < HIT_TOLERANCE) {
            vertexHit = true
            break
          }
        }
        if (vertexHit) { hit = a.id; break }

        let segmentHit = false
        for (let j = 0; j < a.points.length - 1; j++) {
          const p1 = a.points[j]
          const p2 = a.points[j + 1]
          const idx1 = bars.findIndex(b => b.time >= p1.time)
          const idx2 = bars.findIndex(b => b.time >= p2.time)
          const useIdx1 = idx1 === -1 ? bars.length - 1 : Math.max(0, idx1)
          const useIdx2 = idx2 === -1 ? bars.length - 1 : Math.max(0, idx2)
          const x1 = xForIdx(useIdx1)
          const y1 = yForPrice(p1.price)
          const x2 = xForIdx(useIdx2)
          const y2 = yForPrice(p2.price)
          const dist = pointToSegmentDistance(x, y, x1, y1, x2, y2)
          if (dist < HIT_TOLERANCE) { segmentHit = true; break }
        }
        if (segmentHit) { hit = a.id; break }
      } else if (def.geometry === 'arrow' && a.arrow) {
        // Arrow hit detection for context menu
        const idx = bars.findIndex(b => b.time >= a.arrow!.time)
        if (idx === -1) continue
        const ax = xForIdx(idx)
        const ay = yForPrice(a.arrow!.price)
        if (Math.hypot(x - ax, y - ay) < HIT_TOLERANCE) { hit = a.id; break }
        const stemLen = 22
        const stemY = a.arrow!.isHigh ? ay - stemLen : ay + stemLen
        const distToStem = pointToSegmentDistance(x, y, ax, ay, ax, stemY)
        if (distToStem < HIT_TOLERANCE) { hit = a.id; break }
      } else {
        const idx = idxForX(x)
        const startIdx = bars.findIndex(b => b.time >= a.timeStart)
        const endIdx = bars.findIndex(b => b.time >= a.timeEnd)
        if (startIdx === -1 || startIdx > idx) continue
        if (endIdx !== -1 && endIdx < idx) continue
        const y1 = yForPrice(a.priceStart)
        const y2 = yForPrice(a.priceEnd)
        const yTop = Math.min(y1, y2)
        const yBot = Math.max(y1, y2)
        if (y >= yTop - HIT_TOLERANCE && y <= yBot + HIT_TOLERANCE) {
          hit = a.id
          break
        }
      }
    }

    if (hit) {
      onSelectAnnotation(hit)
    }
    setContextMenu({ x, y, annotationId: hit || '' })
  }

  // ─── Helpers ─────────────────────────────────────────────────────────
  function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1
    const dy = y2 - y1
    const lenSq = dx * dx + dy * dy
    if (lenSq === 0) return Math.hypot(px - x1, py - y1)
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
    t = Math.max(0, Math.min(1, t))
    const projX = x1 + t * dx
    const projY = y1 + t * dy
    return Math.hypot(px - projX, py - projY)
  }

  const activeToolDef = activeTool ? CONCEPT_MAP[activeTool] : null
  const isPolylineMode = activeToolDef?.geometry === 'polyline'

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#1a1a1a]">
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          dragState.current.mode = 'none'
          setDraft(null)
          setPolylinePreview(null)
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      />

      {/* Drawing mode indicator */}
      {activeTool && !readOnly && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-mono pointer-events-none">
          Drawing: <span style={{ color: activeToolDef!.color }}>{activeToolDef!.label}</span> ({direction}) —
          {isPolylineMode
            ? ' RIGHT-CLICK on chart to place annotation'
            : activeToolDef?.geometry === 'arrow'
              ? ' CLICK above a candle (down arrow at high) or below (up arrow at low)'
              : ' click and drag on chart'}
        </div>
      )}
      {!activeTool && !readOnly && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-white/70 text-xs font-mono pointer-events-none">
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
                  onClick={() => {
                    onCreatePost(contextMenu.annotationId)
                    setContextMenu(null)
                  }}
                >
                  📝 Create Post
                </button>
              )}
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-accent transition-colors"
                onClick={() => {
                  onSelectAnnotation(contextMenu.annotationId)
                  setContextMenu(null)
                }}
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
            onClick={() => {
              onSelectAnnotation(null)
              setContextMenu(null)
            }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  )
}
