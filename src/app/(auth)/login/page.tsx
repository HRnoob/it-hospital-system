'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<any>({})
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettings(data.data)
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!form.email || !form.password) {
      toast.error('Email dan password wajib diisi')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Login berhasil!')
        window.location.href = '/dashboard'
      } else {
        toast.error(data.message || 'Login gagal')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Terjadi kesalahan server')
    } finally {
      setLoading(false)
    }
  }

  const getSettingValue = (group: string, key: string) => {
    return settings[group]?.find((s: any) => s.key === key)?.value || ''
  }

  const appName = getSettingValue('branding', 'app_name') || 'IT HOSPITAL'
  const appShortName = getSettingValue('branding', 'app_short_name') || 'COMMAND CENTER'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        
        <div className="relative bg-black/50 backdrop-blur-sm border border-primary/30 rounded-xl p-8 w-96">
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-primary/30">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs font-mono text-primary ml-2">{appShortName}_LOGIN</span>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tighter">{appName}</h1>
              <p className="text-xs font-mono text-muted-foreground mt-1">{appShortName}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-primary mb-1">USERNAME</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-black/50 border border-primary/30 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground"
                  placeholder="email@rumahsakit.id"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-primary mb-1">PASSWORD</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-black/50 border border-primary/30 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground"
                  placeholder="********"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg py-2 font-mono text-sm transition-all duration-300 group"
              >
                <span className="group-hover:tracking-wider transition-all">
                  {loading ? 'AUTHENTICATING...' : 'LOGIN'}
                </span>
              </button>
            </form>

            {/* Blinking cursor */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-primary/30">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-muted-foreground">SECURE CONNECTION</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}