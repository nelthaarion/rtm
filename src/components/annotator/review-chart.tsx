'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { ConceptType, CONCEPT_MAP } from '@/lib/annotator/concepts'

export interface ReviewBar {
  time: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

export interface TradeZoneRect {
  timeStart: number
  timeEnd: number
  priceStart: number
  priceEnd: number
}

export interface TradeSetupData {
  id: string
  label: string
  entry: TradeZoneRect
  sl: TradeZoneRect
  tp: TradeZoneRect
}

export interface ChartAnnotation {
  id: string
  type: string
  priceStart: number
  priceEnd: number
  timeStart: number
  timeEnd: number
  points?: Array<{ time: number; price: number }>
  arrow?: { time: number; price: number; isHigh: boolean }
  selected?: boolean
}

interface ReviewChartProps {
  instrumentId: string
  timeframe: string
  pipSize: number
  annotations: ChartAnnotation[]
  reviewerComment?: string
  bars?: ReviewBar[]  // optional: if provided, skip the API call and use these bars
  tradeSetups?: TradeSetupData[]  // optional: trade setups to render on the chart
}

export default function ReviewChart({ instrumentId, timeframe, pipSize, annotations, reviewerComment, bars: propBars, tradeSetups }: ReviewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)
  const [bars, setBars] = useState<ReviewBar[]>(propBars || [])
  const [size, setSize] = useState({ w: 800, h: 400 })
  const [ready, setReady] = useState(false)

  // Keep refs for overlay drawing (avoids stale closures in chart subscriptions)
  const annotationsRef = useRef(annotations)
  useEffect(() => { annotationsRef.current = annotations }, [annotations])
  const commentRef = useRef(reviewerComment)
  useEffect(() => { commentRef.current = reviewerComment }, [reviewerComment])
  const tradeSetupsRef = useRef(tradeSetups)
  useEffect(() => { tradeSetupsRef.current = tradeSetups }, [tradeSetups])

  // Load bars from API only if not provided as a prop
  useEffect(() => {
    if (propBars && propBars.length > 0) {
      setBars(propBars)
      return
    }
    if (!instrumentId) return
    fetch(`/api/ohlcv?instrumentId=${instrumentId}&timeframe=${timeframe}&limit=300`)
      .then(r => r.json())
      .then(data => setBars(data.bars || []))
      .catch(() => {})
  }, [instrumentId, timeframe, propBars])

  // Update bars when propBars changes (e.g., when switching posts)
  useEffect(() => {
    if (propBars) setBars(propBars)
  }, [propBars])

  // Init chart — only once
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
      setReady(true)
    })

    return () => {
      destroyed = true
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; seriesRef.current = null }
    }
  }, [])

  // Set data
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

  // Resize
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

  // Coordinate helpers
  const timeToX = useCallback((time: number): number | null => {
    if (!chartRef.current) return null
    try { return chartRef.current.timeScale().timeToCoordinate(Math.floor(time / 1000)) } catch { return null }
  }, [])
  const priceToY = useCallback((price: number): number | null => {
    if (!seriesRef.current) return null
    try { return seriesRef.current.priceToCoordinate(price) } catch { return null }
  }, [])

  // Draw overlay — renders ALL annotations + reviewer comment
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
    const comment = commentRef.current

    // Draw all annotations
    for (const a of anns) {
      const def = CONCEPT_MAP[a.type as ConceptType]
      if (!def) continue
      const c = def.color
      const isSel = a.selected

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

    // ─── Draw trade setups (entry/SL/TP zones) ────────────────────────────
    const setups = tradeSetupsRef.current
    if (setups && setups.length > 0) {
      const zoneColors: Record<string, { fill: string; stroke: string; label: string }> = {
        entry: { fill: 'rgba(34, 197, 94, 0.25)', stroke: '#22c55e', label: 'ENTRY' },
        sl: { fill: 'rgba(239, 68, 68, 0.25)', stroke: '#ef4444', label: 'SL' },
        tp: { fill: 'rgba(59, 130, 246, 0.25)', stroke: '#3b82f6', label: 'TP' },
      }
      for (const setup of setups) {
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
        // Draw setup label
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

    // Draw reviewer comment at top-center of chart
    if (comment && comment.trim()) {
      ctx.font = 'bold 12px monospace'
      const text = `Reviewer: ${comment.trim()}`
      const tw = ctx.measureText(text).width
      const padX = 10, padY = 6
      const bx = (size.w - tw) / 2 - padX
      const by = 8
      ctx.fillStyle = 'rgba(0,0,0,0.8)'
      ctx.fillRect(bx, by, tw + padX * 2, 20 + padY)
      ctx.strokeStyle = '#8b7226'; ctx.lineWidth = 1
      ctx.strokeRect(bx, by, tw + padX * 2, 20 + padY)
      ctx.fillStyle = '#8b7226'; ctx.textAlign = 'left'
      ctx.fillText(text, bx + padX, by + 15)
    }
  }, [size, timeToX, priceToY])

  const drawOverlayRef = useRef(drawOverlay)
  useEffect(() => { drawOverlayRef.current = drawOverlay }, [drawOverlay])

  // Re-draw overlay whenever annotations, bars, or chart readiness change.
  // Also re-draw after a short delay to handle the race condition where
  // the chart's time scale isn't ready immediately after setData.
  useEffect(() => {
    drawOverlay()
    // Retry after a short delay — the chart may need a frame to compute coordinates
    const t1 = setTimeout(() => drawOverlayRef.current(), 50)
    const t2 = setTimeout(() => drawOverlayRef.current(), 200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [drawOverlay, annotations, reviewerComment, ready, bars, size, tradeSetups])

  // Also subscribe to chart crosshair move to re-draw overlay (catches pan/zoom)
  useEffect(() => {
    if (!chartRef.current) return
    const chart = chartRef.current
    const handler = () => requestAnimationFrame(() => drawOverlayRef.current())
    chart.subscribeCrosshairMove(handler)
    return () => { try { chart.unsubscribeCrosshairMove(handler) } catch {} }
  }, [ready])

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ background: '#1a1a1a', minHeight: '300px' }}>
      <canvas
        ref={overlayRef}
        className="absolute inset-0"
        style={{ zIndex: 10, pointerEvents: 'none' }}
      />
    </div>
  )
}

// Helper: capture chart screenshot with annotations + reviewer comment
export async function captureChartScreenshot(comment?: string): Promise<string | null> {
  const chartContainer = document.querySelector('[class*="relative w-full h-full"][style*="1a1a1a"]') as HTMLElement
  if (!chartContainer) return null
  const canvases = chartContainer.querySelectorAll('canvas')
  if (canvases.length === 0) return null
  let maxW = 0, maxH = 0
  canvases.forEach(c => { if (c.width > maxW) maxW = c.width; if (c.height > maxH) maxH = c.height })
  const combined = document.createElement('canvas')
  combined.width = maxW; combined.height = maxH
  const ctx = combined.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, maxW, maxH)
  canvases.forEach(c => { try { ctx.drawImage(c, 0, 0, maxW, maxH) } catch {} })
  return combined.toDataURL('image/png')
}
