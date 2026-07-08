'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import type { AppUser } from './login-modal'

export default function ProfileView({ user }: { user: AppUser }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    let active = true
    const load = async () => { const res = await fetch(`/api/profile/${user.id}`); if (!active || !res.ok) return; const d = await res.json(); if (active) setData(d) }
    load()
    return () => { active = false }
  }, [user.id])

  if (!data) return <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
  const p = data.profile

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b px-4 py-2 shrink-0 bg-muted/30"><span className="text-xs font-semibold">PROFILE — {p.name}</span></div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 max-w-3xl space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[['Rank', `#${p.rank}`, 'text-amber-600'], ['Points', p.totalPoints, 'text-blue-600'], ['Tasks Done', p.tasksCompleted, ''], ['Expired', p.tasksExpired, 'text-red-600'], ['Approved', p.annotationsApproved, 'text-green-600'], ['Corrected', p.annotationsCorrected, 'text-blue-600'], ['Approval %', `${p.approvalRate}%`, ''], ['Streak', `${p.currentStreak}🔥`, '']].map(([label, value, color]) => (
            <div key={label} className="border rounded p-3 bg-muted/20"><div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div><div className={`text-lg font-bold ${color}`}>{value}</div></div>
          ))}
        </div>
        <div><h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Badges</h4><div className="flex flex-wrap gap-2">{p.badges.length === 0 ? <span className="text-xs text-muted-foreground">No badges yet.</span> : p.badges.map((b: string) => <Badge key={b} variant="default" className="text-xs">🏆 {b}</Badge>)}</div></div>
        <div><h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Task History ({data.taskHistory?.length || 0})</h4><div className="space-y-1">{(data.taskHistory || []).map((t: any) => (<div key={t.id} className="flex items-center gap-3 p-2 rounded border border-border text-xs"><span className="font-mono font-semibold">{t.instrumentSymbol}</span><span className="text-muted-foreground">{t.timeframe}</span><span className={`px-1 rounded ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.status}</span>{t.pointsAwarded > 0 && <span className="text-blue-600 font-mono ml-auto">+{t.pointsAwarded}pts</span>}</div>))}</div></div>
      </div>
    </div>
  )
}
