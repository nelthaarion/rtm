'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import LoginModal, { AppUser } from '@/components/annotator/login-modal'
import AnnotatorView from '@/components/annotator/annotator-view'
import ReviewView from '@/components/annotator/review-view'
import ApprovedView from '@/components/annotator/approved-view'
import AdminView from '@/components/annotator/admin-view'
import NotificationBell from '@/components/annotator/notification-bell'
import LeaderboardView from '@/components/annotator/leaderboard-view'
import ProfileView from '@/components/annotator/profile-view'
import TaskHistoryView from '@/components/annotator/task-history-view'

type View = 'annotate' | 'history' | 'review' | 'approved' | 'leaderboard' | 'profile' | 'admin'

export default function Home() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login')
  const [authLoading, setAuthLoading] = useState(true)
  const [instruments, setInstruments] = useState<any[]>([])
  const [view, setView] = useState<View>('annotate')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user)
        else setShowLogin(true)
      })
      .catch(() => setShowLogin(true))
      .finally(() => setAuthLoading(false))
  }, [])

  useEffect(() => {
    if (!user) return
    fetch('/api/instruments')
      .then(r => r.json())
      .then(data => setInstruments(data.instruments || []))
      .catch(() => {})
  }, [user])

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setView('annotate')
    setShowLogin(true)
    toast.success('Signed out')
  }, [])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="text-center">
            <div className="w-12 h-12 rounded-sm bg-amber-700 flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">RTM</span>
            </div>
            <h1 className="text-lg font-semibold mb-1">RTM Chart Annotator</h1>
            <p className="text-sm text-muted-foreground mb-4">Multi-user annotation system with review workflow</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => { setLoginMode('login'); setShowLogin(true) }}>Sign in</Button>
              <Button variant="outline" onClick={() => { setLoginMode('signup'); setShowLogin(true) }}>Sign up</Button>
            </div>
          </div>
        </div>
        <LoginModal
          open={showLogin}
          onClose={() => setShowLogin(false)}
          onLogin={setUser}
          initialMode={loginMode}
        />
      </>
    )
  }

  const canReview = user.role === 'REVIEWER' || user.role === 'ADMIN'
  const isAdmin = user.role === 'ADMIN'
  const canAnnotate = user.role !== 'VIEWER'
  const effectiveView: View = user.role === 'VIEWER' ? (view === 'annotate' ? 'approved' : view) : view

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm px-3 py-2 flex flex-wrap items-center gap-2 shrink-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs tracking-tight">RTM</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold leading-tight">RTM Annotator</h1>
            <div className="text-[9px] text-muted-foreground leading-tight">Read The Market</div>
          </div>
          <Badge variant="outline" className="text-[9px] font-mono ml-1">v1.0</Badge>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-0.5 ml-3 flex-wrap bg-muted/30 rounded-lg p-0.5">
          {canAnnotate && (
            <Button size="sm" variant={effectiveView === 'annotate' ? 'default' : 'ghost'} className="h-7 text-xs rounded-md" onClick={() => setView('annotate')}>Annotate</Button>
          )}
          {canAnnotate && (
            <Button size="sm" variant={effectiveView === 'history' ? 'default' : 'ghost'} className="h-7 text-xs rounded-md" onClick={() => setView('history')}>History</Button>
          )}
          {canReview && (
            <Button size="sm" variant={effectiveView === 'review' ? 'default' : 'ghost'} className="h-7 text-xs rounded-md" onClick={() => setView('review')}>Review</Button>
          )}
          <Button size="sm" variant={effectiveView === 'approved' ? 'default' : 'ghost'} className="h-7 text-xs rounded-md" onClick={() => setView('approved')}>Approved</Button>
          <Button size="sm" variant={effectiveView === 'leaderboard' ? 'default' : 'ghost'} className="h-7 text-xs rounded-md" onClick={() => setView('leaderboard')}>Leaderboard</Button>
          <Button size="sm" variant={effectiveView === 'profile' ? 'default' : 'ghost'} className="h-7 text-xs rounded-md" onClick={() => setView('profile')}>Profile</Button>
          {isAdmin && (
            <Button size="sm" variant={effectiveView === 'admin' ? 'default' : 'ghost'} className="h-7 text-xs rounded-md" onClick={() => setView('admin')}>Admin</Button>
          )}
        </div>

        <div className="flex-1" />

        {/* User info */}
        <div className="flex items-center gap-3 shrink-0">
          <NotificationBell user={user} />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-800/30 border border-amber-700/30 flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-400">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium leading-tight">{user.name}</div>
              <div className="text-[9px] text-muted-foreground leading-tight uppercase tracking-wide">{user.role}</div>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-xs hover:text-destructive" onClick={handleLogout}>Sign out</Button>
        </div>
      </header>

      {/* Main content — each view manages its own scrolling */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {effectiveView === 'annotate' && canAnnotate && (
          <AnnotatorView user={user} instruments={instruments} />
        )}
        {effectiveView === 'history' && canAnnotate && (
          <TaskHistoryView user={user} />
        )}
        {effectiveView === 'review' && canReview && (
          <ReviewView user={user} instruments={instruments} />
        )}
        {effectiveView === 'approved' && (
          <ApprovedView instruments={instruments} />
        )}
        {effectiveView === 'leaderboard' && (
          <LeaderboardView />
        )}
        {effectiveView === 'profile' && (
          <ProfileView user={user} />
        )}
        {effectiveView === 'admin' && isAdmin && (
          <AdminView user={user} />
        )}
      </div>
    </div>
  )
}
