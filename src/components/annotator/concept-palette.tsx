'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  CONCEPTS, CATEGORY_LABELS, ConceptType,
} from '@/lib/annotator/concepts'

interface ConceptPaletteProps {
  activeTool: ConceptType | null
  onSelectTool: (t: ConceptType | null) => void
  direction: 'bullish' | 'bearish' | 'neutral'
  onDirectionChange: (d: 'bullish' | 'bearish' | 'neutral') => void
}

export default function ConceptPalette({
  activeTool, onSelectTool, direction, onDirectionChange,
}: ConceptPaletteProps) {
  const categories = ['zones', 'patterns', 'advanced', 'liquidity', 'structure'] as const

  return (
    <div className="flex flex-col h-full min-h-0 bg-card/30 border-r border-border/50">
      <div className="px-3 py-3 border-b shrink-0 border-border/50">
        <h3 className="text-sm font-semibold mb-2.5">Drawing Tools</h3>

        {/* Direction selector */}
        <div className="flex gap-1 mb-2.5 bg-muted/30 rounded-lg p-0.5">
          {(['bullish', 'bearish', 'neutral'] as const).map(d => (
            <Button
              key={d}
              size="sm"
              variant="ghost"
              className={cn(
                'h-7 text-xs flex-1 capitalize rounded-md font-medium',
                direction === d && d === 'bullish' && 'bg-green-600/20 text-green-400 hover:bg-green-600/30',
                direction === d && d === 'bearish' && 'bg-red-600/20 text-red-400 hover:bg-red-600/30',
                direction === d && d === 'neutral' && 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30',
              )}
              onClick={() => onDirectionChange(d)}
            >
              {d === 'bullish' ? '▲ Long' : d === 'bearish' ? '▼ Short' : '◆ Neutral'}
            </Button>
          ))}
        </div>

        {activeTool && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-7 text-xs hover:text-destructive rounded-md"
            onClick={() => onSelectTool(null)}
          >
            ✕ Cancel drawing
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2.5 space-y-3">
          {categories.map(cat => {
            const concepts = CONCEPTS.filter(c => c.category === cat)
            return (
              <div key={cat}>
                <h4 className="text-[9px] font-bold uppercase text-muted-foreground/70 tracking-widest mb-1.5 px-1">
                  {CATEGORY_LABELS[cat]}
                </h4>
                <div className="grid grid-cols-2 gap-1">
                  {concepts.map(c => (
                    <button
                      key={c.type}
                      onClick={() => onSelectTool(activeTool === c.type ? null : c.type)}
                      className={cn(
                        'flex flex-col items-start p-2 rounded-lg border text-left transition-all',
                        activeTool === c.type
                          ? 'border-foreground/40 bg-muted shadow-sm scale-[1.02]'
                          : 'border-border/40 hover:border-foreground/20 hover:bg-muted/40',
                      )}
                      title={c.description}
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: c.color, boxShadow: `0 0 6px ${c.color}40` }}
                        />
                        <span className="text-[10px] font-mono font-bold truncate">
                          {c.shortLabel}
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground/80 truncate w-full mt-0.5">
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="px-3 py-2 border-t text-[9px] text-muted-foreground/60 border-border/50">
        {activeTool ? 'Draw on chart to annotate' : 'Pick a tool to start drawing'}
      </div>
    </div>
  )
}
