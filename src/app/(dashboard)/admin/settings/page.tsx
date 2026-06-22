'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Building, Palette, FileText, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) {
        if (data.data.role !== 'SUPERADMIN') {
          toast.error('Akses ditolak')
          router.push('/dashboard')
        } else {
          setUserRole(data.data.role)
          fetchSettings()
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setChecking(false)
    }
  }

  const fetchSettings = async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    if (data.success) {
      setSettings(data.data)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const allSettings = [
        ...Object.values(settings.identity || []),
        ...Object.values(settings.report || []),
        ...Object.values(settings.branding || [])
      ]
      
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: allSettings })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Pengaturan berhasil disimpan')
      } else {
        toast.error('Gagal menyimpan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (group: string, key: string, value: string) => {
    setSettings((prev: Record<string, any>) => ({
      ...prev,
      [group]: prev[group]?.map((s: any) =>
        s.key === key ? { ...s, value } : s
      )
    }))
  }

  const getSettingValue = (group: string, key: string) => {
    return settings[group]?.find((s: any) => s.key === key)?.value || ''
  }

  if (checking || !settings.identity) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (userRole !== 'SUPERADMIN') {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-12 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-destructive">ACCESS DENIED</h2>
        <p className="text-destructive/80 mt-2 font-mono">Halaman ini hanya dapat diakses oleh SUPERADMIN.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SYSTEM SETTINGS</h1>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
          Konfigurasi Identitas & Branding Rumah Sakit
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">Menu</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded-lg bg-primary/10 text-primary font-mono text-sm flex items-center gap-2">
                <Building className="w-4 h-4" /> Identitas RS
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Identitas Rumah Sakit
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-1">Nama Rumah Sakit</label>
                <input
                  type="text"
                  value={getSettingValue('identity', 'hospital_name')}
                  onChange={(e) => updateSetting('identity', 'hospital_name', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Contoh: RSUD Kota Manado"
                />
                <p className="text-xs text-muted-foreground mt-1">Akan tampil di logo, laporan, dan kop surat</p>
              </div>

              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-1">Alamat RS</label>
                <textarea
                  value={getSettingValue('identity', 'hospital_address')}
                  onChange={(e) => updateSetting('identity', 'hospital_address', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  rows={2}
                  placeholder="Jl. Contoh No. 123, Kota Contoh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-muted-foreground mb-1">Telepon</label>
                  <input
                    type="text"
                    value={getSettingValue('identity', 'hospital_phone')}
                    onChange={(e) => updateSetting('identity', 'hospital_phone', e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="(021) 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={getSettingValue('identity', 'hospital_email')}
                    onChange={(e) => updateSetting('identity', 'hospital_email', e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="info@rscontoh.id"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-1">Website</label>
                <input
                  type="text"
                  value={getSettingValue('identity', 'hospital_website')}
                  onChange={(e) => updateSetting('identity', 'hospital_website', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="www.rscontoh.id"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Kop Surat Laporan
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-muted-foreground mb-1">Header Laporan</label>
                  <input
                    type="text"
                    value={getSettingValue('report', 'report_header_text')}
                    onChange={(e) => updateSetting('report', 'report_header_text', e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="LAPORAN IT RUMAH SAKIT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-muted-foreground mb-1">Footer Laporan</label>
                  <input
                    type="text"
                    value={getSettingValue('report', 'report_footer_text')}
                    onChange={(e) => updateSetting('report', 'report_footer_text', e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Dokumen ini adalah laporan resmi IT"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Branding Aplikasi
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-muted-foreground mb-1">Nama Aplikasi</label>
                  <input
                    type="text"
                    value={getSettingValue('branding', 'app_name')}
                    onChange={(e) => updateSetting('branding', 'app_name', e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="IT Hospital System"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-muted-foreground mb-1">Nama Singkat</label>
                  <input
                    type="text"
                    value={getSettingValue('branding', 'app_short_name')}
                    onChange={(e) => updateSetting('branding', 'app_short_name', e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="ITHS"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-border">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg px-6 py-2 font-mono text-primary transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                {loading ? 'SAVING...' : 'SAVE SETTINGS'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}