'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

export interface AppUser {
  id: string
  email: string
  name: string
  role: string
}

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onLogin: (user: AppUser) => void
  initialMode?: 'login' | 'signup'
}

export default function LoginModal({ open, onClose, onLogin, initialMode = 'login' }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (open) setMode(initialMode) }, [open, initialMode])

  const handleSubmit = async () => {
    if (!email || !password) { toast.error('Email and password required'); return }
    if (mode === 'signup' && !name) { toast.error('Name required'); return }
    if (mode === 'signup' && password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body = mode === 'signup' ? { name, email, password } : { email, password }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Authentication failed')
      toast.success(mode === 'signup' ? `Welcome, ${data.user.name}!` : `Welcome back, ${data.user.name}`)
      onLogin(data.user)
      setEmail(''); setName(''); setPassword('')
      onClose()
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Sign in to RTM Annotator' : 'Create your account'}</DialogTitle>
          <DialogDescription>{mode === 'login' ? 'Enter your email and password.' : 'New accounts start as Labeler. An admin can promote you later.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {mode === 'signup' && (
            <div><Label className="text-xs">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-9" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} /></div>
          )}
          <div><Label className="text-xs">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-9" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} /></div>
          <div><Label className="text-xs">Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'} className="h-9" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} /></div>
        </div>
        <div className="text-xs text-center text-muted-foreground">
          {mode === 'login' ? (
            <>Don't have an account? <button type="button" className="text-foreground underline hover:no-underline" onClick={() => { setMode('signup'); setPassword('') }}>Sign up</button></>
          ) : (
            <>Already have an account? <button type="button" className="text-foreground underline hover:no-underline" onClick={() => { setMode('login'); setPassword('') }}>Sign in</button></>
          )}
        </div>
        <DialogFooter><Button onClick={handleSubmit} disabled={loading} className="h-9 w-full">{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
