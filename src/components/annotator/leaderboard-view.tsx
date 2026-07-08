'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

export default function LeaderboardView() {
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    let active = true
    const load = async () => { const res = await fetch('/api/leaderboard'); if (!active || !res.ok) return; const d = await res.json(); if (active) setEntries(d.leaderboard || []) }
    load()
    return () => { active = false }
  }, [])

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b px-4 py-2 flex items-center gap-2 shrink-0 bg-muted/30">
        <span className="text-xs font-semibold">LEADERBOARD</span>
        <Badge variant="secondary" className="text-[10px]">{entries.length} users</Badge>
        <span className="text-[10px] text-muted-foreground ml-2">Only submitted tasks count</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {entries.length === 0 ? <div className="text-center text-sm text-muted-foreground">No data yet.</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-2 text-xs">Rank</th>
                <th className="py-2 px-2 text-xs">User</th>
                <th className="py-2 px-2 text-xs text-right">Points</th>
                <th className="py-2 px-2 text-xs text-right">Submitted</th>
                <th className="py-2 px-2 text-xs text-right">Expired</th>
                <th className="py-2 px-2 text-xs text-right">Approved</th>
                <th className="py-2 px-2 text-xs text-right">Streak</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-b hover:bg-muted/30">
                  <td className="py-2 px-2">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${e.rank === 1 ? 'bg-yellow-100 text-yellow-800' : e.rank === 2 ? 'bg-gray-200' : e.rank === 3 ? 'bg-orange-100' : 'bg-muted'}`}>{e.rank}</span>
                  </td>
                  <td className="py-2 px-2">
                    <div className="font-medium">{e.name}</div>
                    <div className="text-[10px] text-muted-foreground">{e.role}</div>
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold">{e.totalPoints}</td>
                  <td className="py-2 px-2 text-right font-mono">{e.tasksSubmitted}</td>
                  <td className="py-2 px-2 text-right font-mono text-muted-foreground">{e.tasksExpired}</td>
                  <td className="py-2 px-2 text-right font-mono">{e.annotationsApproved + e.annotationsCorrected}</td>
                  <td className="py-2 px-2 text-right font-mono">{e.currentStreak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
