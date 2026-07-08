'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CONCEPT_MAP, ConceptType } from '@/lib/annotator/concepts'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface AnnotationSchema {
  definition: string
  purpose: string
  context: string
  whyItForms: string
  identification: string
  commonMistakes: string
  failureConditions: string
  relationships: string
  probabilityContribution: string
  realChartExample: string
}

export interface AnnotationDraft {
  id?: string
  type: ConceptType
  direction: 'bullish' | 'bearish' | 'neutral'
  timeframe: string
  priceStart: number
  priceEnd: number
  timeStart: number
  timeEnd: number
  outcome: 'success' | 'failure' | 'pending'
  labeler: string
  schema: AnnotationSchema
  // Polyline support: array of {time, price} points for polyline geometry
  points?: Array<{ time: number; price: number }>
  // Arrow marker support (for point events like sweeps)
  arrow?: { time: number; price: number; isHigh: boolean }
}

interface AnnotationFormProps {
  draft: AnnotationDraft | null
  onSave: (draft: AnnotationDraft) => void
  onCancel: () => void
  onDelete?: (id: string) => void
}

const SCHEMA_FIELDS: Array<{ key: keyof AnnotationSchema; label: string; hint: string }> = [
  { key: 'definition', label: 'Definition', hint: 'One-paragraph definition grounded in auction logic, not geometry.' },
  { key: 'purpose', label: 'Purpose', hint: 'The decision this concept enables for the trader.' },
  { key: 'context', label: 'Context', hint: 'Where on the chart and in what sequence this appears.' },
  { key: 'whyItForms', label: 'Why it forms', hint: 'The institutional mechanism producing the structure.' },
  { key: 'identification', label: 'How professionals identify it', hint: 'Operational identification rules, not textbook rules.' },
  { key: 'commonMistakes', label: 'Common mistakes', hint: 'Failure modes new traders fall into when identifying it.' },
  { key: 'failureConditions', label: 'Failure conditions', hint: 'When this concept ceases to be valid even if drawn correctly.' },
  { key: 'relationships', label: 'Relationship to other concepts', hint: 'Edges in the knowledge graph.' },
  { key: 'probabilityContribution', label: 'Probability contribution', hint: 'How much this lifts the base rate when present.' },
  { key: 'realChartExample', label: 'Real chart example', hint: 'Schematic example described in words.' },
]

const EMPTY_SCHEMA: AnnotationSchema = {
  definition: '', purpose: '', context: '', whyItForms: '',
  identification: '', commonMistakes: '', failureConditions: '',
  relationships: '', probabilityContribution: '', realChartExample: '',
}

export default function AnnotationForm({ draft, onSave, onCancel, onDelete }: AnnotationFormProps) {
  const [form, setForm] = useState<AnnotationDraft | null>(draft)

  useEffect(() => { setForm(draft) }, [draft])

  if (!form) return null

  const update = (patch: Partial<AnnotationDraft>) => setForm(f => f ? { ...f, ...patch } : null)
  const updateSchema = (key: keyof AnnotationSchema, value: string) =>
    setForm(f => f ? { ...f, schema: { ...f.schema, [key]: value } } : null)

  const concept = CONCEPT_MAP[form.type]
  const isExisting = !!form.id

  return (
    <div className="flex flex-col h-full min-h-0 bg-background border-l">
      <div className="px-4 py-3 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">
            {isExisting ? 'Edit Annotation' : 'New Annotation'}
          </h3>
          <Badge
            style={{ backgroundColor: concept.color, color: 'white' }}
            variant="default"
            className="font-mono"
          >
            {concept.shortLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{concept.label} — {concept.description}</p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {/* Header fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => {
                  const newConcept = CONCEPT_MAP[v as ConceptType]
                  update({
                    type: v as ConceptType,
                    schema: form.schema.definition ? form.schema : { ...newConcept.schemaTemplate },
                  })
                }}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(CONCEPT_MAP).map(c => (
                    <SelectItem key={c.type} value={c.type} className="text-xs">
                      <span className="font-mono mr-2" style={{ color: c.color }}>{c.shortLabel}</span>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Direction</Label>
              <Select
                value={form.direction}
                onValueChange={(v) => update({ direction: v as any })}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullish" className="text-xs">Bullish</SelectItem>
                  <SelectItem value="bearish" className="text-xs">Bearish</SelectItem>
                  <SelectItem value="neutral" className="text-xs">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Timeframe</Label>
              <Input
                value={form.timeframe}
                onChange={(e) => update({ timeframe: e.target.value })}
                className="h-8 text-xs"
                placeholder="H1"
              />
            </div>
            <div>
              <Label className="text-xs">Outcome</Label>
              <Select
                value={form.outcome}
                onValueChange={(v) => update({ outcome: v as any })}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                  <SelectItem value="success" className="text-xs">Success</SelectItem>
                  <SelectItem value="failure" className="text-xs">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Price start (proximal)</Label>
              <Input
                type="number"
                step="0.00001"
                value={form.priceStart}
                onChange={(e) => update({ priceStart: parseFloat(e.target.value) })}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-xs">Price end (distal)</Label>
              <Input
                type="number"
                step="0.00001"
                value={form.priceEnd}
                onChange={(e) => update({ priceEnd: parseFloat(e.target.value) })}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Time start</Label>
              <Input
                value={new Date(form.timeStart).toISOString().slice(0, 16)}
                onChange={(e) => update({ timeStart: new Date(e.target.value).getTime() })}
                className="h-8 text-xs font-mono"
                type="datetime-local"
              />
            </div>
            <div>
              <Label className="text-xs">Time end</Label>
              <Input
                value={new Date(form.timeEnd).toISOString().slice(0, 16)}
                onChange={(e) => update({ timeEnd: new Date(e.target.value).getTime() })}
                className="h-8 text-xs font-mono"
                type="datetime-local"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Labeler</Label>
            <Input
              value={form.labeler}
              onChange={(e) => update({ labeler: e.target.value })}
              className="h-8 text-xs"
              placeholder="your name"
            />
          </div>

          {/* 10-field schema */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                10-Field Schema
              </h4>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => update({ schema: { ...concept.schemaTemplate } })}
              >
                Reset to template
              </Button>
            </div>

            <div className="space-y-3">
              {SCHEMA_FIELDS.map(({ key, label, hint }) => (
                <div key={key}>
                  <Label className="text-xs font-medium">{label}</Label>
                  <p className="text-[10px] text-muted-foreground mb-1">{hint}</p>
                  <Textarea
                    value={form.schema[key]}
                    onChange={(e) => updateSchema(key, e.target.value)}
                    className="text-xs min-h-[60px] resize-y"
                    placeholder={`Enter ${label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t p-3 flex gap-2 bg-muted/30 shrink-0">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => form && onSave(form)}
        >
          {isExisting ? 'Update' : 'Save'}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        {isExisting && onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => form.id && onDelete(form.id)}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
