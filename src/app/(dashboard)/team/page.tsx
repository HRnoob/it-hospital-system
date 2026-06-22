'use client'

import { useState, useEffect } from 'react'
import { Users, User, Mail, Phone, MapPin, Shield } from 'lucide-react'
import Link from 'next/link'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  position: string
  avatar?: string
  phone?: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Map role ke posisi
          const mapped = data.data.map((user: any) => ({
            ...user,
            position: user.role === 'SUPERADMIN' ? 'Kepala Divisi IT' 
                    : user.role === 'ADMIN' ? 'Teknisi Senior / Koordinator'
                    : 'Teknisi IT / Support'
          }))
          setMembers(mapped)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getRoleBadge = (role: string) => {
    const styles = {
      SUPERADMIN: 'bg-red-500/20 text-red-500 border border-red-500/30',
      ADMIN: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
      VIEWER: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
    }
    const labels = {
      SUPERADMIN: 'Kepala Divisi',
      ADMIN: 'Koordinator',
      VIEWER: 'Teknisi',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header Industrial */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">STRUKTUR ORGANISASI IT</h1>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
          Divisi Teknologi Informasi — Tim IT Command Center
        </p>
      </div>

      {/* Grid Structure */}
      <div className="space-y-8">
        {/* Kepala Divisi - SUPERADMIN */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Pimpinan / Kepala Divisi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.filter(m => m.role === 'SUPERADMIN').map((member) => (
              <div key={member.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.phone && <p className="text-xs text-muted-foreground mt-1">{member.phone}</p>}
                    <div className="mt-2">{getRoleBadge(member.role)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Koordinator / Admin */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Koordinator & Teknisi Senior
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.filter(m => m.role === 'ADMIN').map((member) => (
              <div key={member.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.phone && <p className="text-xs text-muted-foreground mt-1">{member.phone}</p>}
                    <div className="mt-2">{getRoleBadge(member.role)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teknisi / Viewer */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Tim Teknisi IT
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.filter(m => m.role === 'VIEWER').map((member) => (
              <div key={member.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.phone && <p className="text-xs text-muted-foreground mt-1">{member.phone}</p>}
                    <div className="mt-2">{getRoleBadge(member.role)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kontak & Info */}
      <div className="mt-8 bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-xs font-mono text-muted-foreground">
          📞 Untuk layanan IT dan dukungan teknis, hubungi tim IT di nomor ext. 1234
        </p>
      </div>
    </div>
  )
}