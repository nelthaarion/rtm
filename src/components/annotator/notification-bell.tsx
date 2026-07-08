'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { AppUser } from './login-modal'

interface Notification { id: string; type: string; title: string; message: string; read: boolean; createdAt: number; fromUser: { name: string } | null }

export default function NotificationBell({ user }: { user: AppUser }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      const res = await fetch('/api/notifications')
      if (!active || !res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    }
    load()
    const interval = setInterval(load, 15000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))
    setUnreadCount(c => Math.max(0, c - 1))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 relative" onClick={() => setOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-3 py-2 border-b shrink-0"><h3 className="text-sm font-semibold">Notifications</h3></div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? <div className="p-6 text-center text-xs text-muted-foreground">No notifications yet.</div> : (
            <div className="divide-y">
              {notifications.map(n => (
                <div key={n.id} className={`p-3 hover:bg-muted/50 cursor-pointer ${!n.read ? 'bg-muted/30' : ''}`} onClick={() => { if (!n.read) markAsRead(n.id) }}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm">{n.type === 'SUBMISSION' ? '📝' : n.type === 'APPROVED' ? '✓' : n.type === 'DENIED' ? '✕' : 'ℹ'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{n.fromUser?.name || 'System'} · {new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
