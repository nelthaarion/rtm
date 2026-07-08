'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { AppUser } from './login-modal'

export default function AdminView({ user }: { user: AppUser }) {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    let active = true
    const load = async () => { const res = await fetch('/api/users'); if (!active || !res.ok) return; const d = await res.json(); if (active) setUsers(d.users || []) }
    load()
    return () => { active = false }
  }, [])

  const updateRole = async (userId: string, role: string) => {
    const res = await fetch(`/api/users/${userId}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
    if (res.ok) { toast.success('Role updated'); const r2 = await fetch('/api/users'); const d2 = await r2.json(); setUsers(d2.users || []) }
  }

  const toggleActive = async (userId: string, current: boolean) => {
    const res = await fetch(`/api/users/${userId}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !current }) })
    if (res.ok) { toast.success(!current ? 'Disabled' : 'Enabled'); const r2 = await fetch('/api/users'); const d2 = await r2.json(); setUsers(d2.users || []) }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b px-4 py-2 flex items-center gap-2 shrink-0 bg-muted/30"><span className="text-xs font-semibold">USER MANAGEMENT ({users.length})</span></div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="py-2 px-2 text-xs">Name</th><th className="py-2 px-2 text-xs">Email</th><th className="py-2 px-2 text-xs">Role</th><th className="py-2 px-2 text-xs">Status</th><th className="py-2 px-2 text-xs text-right">Submitted</th><th className="py-2 px-2 text-xs">Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b hover:bg-muted/30">
                <td className="py-2 px-2"><div className="font-medium">{u.name}</div>{u.id === user.id && <span className="text-[10px] text-muted-foreground">(you)</span>}</td>
                <td className="py-2 px-2 text-xs font-mono text-muted-foreground">{u.email}</td>
                <td className="py-2 px-2"><Select value={u.role} onValueChange={(v) => updateRole(u.id, v)} disabled={u.id === user.id}><SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VIEWER" className="text-xs">Viewer</SelectItem><SelectItem value="LABELER" className="text-xs">Labeler</SelectItem><SelectItem value="REVIEWER" className="text-xs">Reviewer</SelectItem><SelectItem value="ADMIN" className="text-xs">Admin</SelectItem></SelectContent></Select></td>
                <td className="py-2 px-2"><Badge variant="outline" className={`text-[10px] ${u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.active ? 'Active' : 'Disabled'}</Badge></td>
                <td className="py-2 px-2 text-right font-mono text-xs">{u.submittedCount}</td>
                <td className="py-2 px-2">{u.id !== user.id && <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleActive(u.id, u.active)}>{u.active ? 'Disable' : 'Enable'}</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
