'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Activity,
  Cpu,
  Wifi,
  Server,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'

interface Stats {
  totalAssets: number
  openIssues: number
  inProgressIssues: number
  todayCheck: boolean
  criticalIssues: number
  highIssues: number
  uptime: number
}

interface NetworkDevice {
  id: string
  name: string
  ipAddress: string
  category: string
  status: string
  latency: number | null
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  action: string
  actionLabel: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAssets: 0,
    openIssues: 0,
    inProgressIssues: 0,
    todayCheck: false,
    criticalIssues: 0,
    highIssues: 0,
    uptime: 99.9,
  })
  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    // Fetch stats
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({ ...prev, ...data.data }))
        }
      })
      .catch(console.error)

    // Fetch network devices
    fetch('/api/network/devices')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNetworkDevices(data.data)
        }
      })
      .catch(console.error)

    // Fetch notifications
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.data)
        }
      })
      .catch(console.error)

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) 
          setSettings(data.data)
      })
      .catch(console.error)
  }, [])

  const statsCards = [
    {
      title: 'SYSTEM UPTIME',
      value: `${stats.uptime}%`,
      icon: Server,
      status: stats.uptime > 99 ? 'success' : 'warning',
      description: 'Last 30 days',
      href: '/morning-check',  // ← GANTI JADI INI (bukan /reports)
    },
    {
      title: 'ACTIVE ASSETS',
      value: stats.totalAssets,
      icon: Package,
      status: 'info',
      description: 'Total devices',
      href: '/inventory'
    },
    {
      title: 'CRITICAL ISSUES',
      value: stats.criticalIssues,
      icon: Zap,
      status: stats.criticalIssues > 0 ? 'critical' : 'success',
      description: 'SLA: 2 hours',
      href: '/issues?priority=CRITICAL'
    },
    {
      title: 'OPEN ISSUES',
      value: stats.openIssues,
      icon: AlertCircle,
      status: stats.openIssues > 5 ? 'warning' : 'info',
      description: `${stats.inProgressIssues} in progress`,
      href: '/issues?status=OPEN'
    },
  ]

  const quickActions = [
    { label: 'MORNING CHECK', icon: CheckCircle, href: '/morning-check', color: 'from-blue-600 to-blue-800' },
    { label: 'NEW ISSUE', icon: AlertCircle, href: '/issues/add', color: 'from-red-600 to-red-800' },
    { label: 'INVENTORY', icon: Package, href: '/inventory', color: 'from-green-600 to-green-800' },
    { label: 'KANBAN', icon: Activity, href: '/kanban', color: 'from-purple-600 to-purple-800' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'border-red-500 shadow-red-500/20'
      case 'warning': return 'border-yellow-500 shadow-yellow-500/20'
      case 'success': return 'border-green-500 shadow-green-500/20'
      default: return 'border-cyan-500 shadow-cyan-500/20'
    }
  }

  return (
    <div className="grid-bg min-h-screen">
      {/* Header with industrial feel */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {settings?.branding?.find((s: any) => s.key === 'app_name')?.value || 'IT HOSPITAL'}
          </h1>
          <span className="text-xs text-muted-foreground font-mono ml-auto">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
          {settings?.identity?.find((s: any) => s.key === 'hospital_name')?.value || 'IT Command Center'} — Real-time Monitoring
        </p>
      </div>

      {/* Notification Banner */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-3">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.action}
              className={`
                block p-4 rounded-xl border transition-all hover:scale-[1.01]
                ${notif.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  notif.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{notif.title}</h4>
                  <p className="text-sm text-foreground/80 mt-1">{notif.message}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Grid with staggered animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, idx) => (
          <Link key={idx} href={card.href} className="block cursor-pointer stagger-item">
            <div
              className={`
                relative overflow-hidden rounded-xl border-l-4 ${getStatusColor(card.status)}
                bg-gradient-to-br from-card to-secondary/50 p-5 shadow-lg backdrop-blur-sm
                transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
              `}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-${card.status === 'critical' ? 'red' : card.status === 'warning' ? 'yellow' : 'green'}-500/10 blur-2xl`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <card.icon className={`w-5 h-5 text-${card.status === 'critical' ? 'red' : card.status === 'warning' ? 'yellow' : 'green'}-500`} />
                  <span className="text-xs font-mono text-muted-foreground">{card.description}</span>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{card.title}</p>
                
                <div className="absolute bottom-3 left-5 right-5 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* System Status Card */}
      <div className="stagger-item bg-gradient-to-r from-card to-secondary rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center gap-4 flex-wrap justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">System Health Monitor</h3>
              <div className="flex gap-4 mt-1 text-sm font-mono">
                <span className="text-green-500">● All systems nominal</span>
                {stats.criticalIssues > 0 && (
                  <span className="text-red-500">● {stats.criticalIssues} critical</span>
                )}
                {stats.highIssues > 0 && (
                  <span className="text-yellow-500">● {stats.highIssues} warnings</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
              <div key={level} className="text-center">
                <div className={`text-xs font-bold ${level === 'CRITICAL' ? 'text-red-500' : level === 'HIGH' ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {level}
                </div>
                <div className="text-xl font-bold text-foreground">
                  {level === 'CRITICAL' ? stats.criticalIssues : level === 'HIGH' ? stats.highIssues : 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-muted-foreground">SLA Compliance</span>
            <span className="text-foreground">98%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="w-[98%] h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Quick Action Buttons with industrial design */}
      <div className="stagger-item grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickActions.map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            className={`
              group relative overflow-hidden rounded-lg bg-gradient-to-r ${action.color} p-4
              transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
            `}
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className="font-bold text-white text-sm tracking-wider">{action.label}</span>
              <action.icon className="w-5 h-5 text-white/80 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
          </Link>
        ))}
      </div>

      {/* Network Status Card with live data */}
      <div className="stagger-item bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-4 h-4 text-primary" />
          <h3 className="font-mono font-bold text-sm tracking-wider text-primary">NETWORK STATUS</h3>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">Live</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {networkDevices.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs font-mono text-muted-foreground">No network devices configured</p>
              <p className="text-xs font-mono text-muted-foreground/70 mt-1">Add IP addresses to assets in Inventory</p>
            </div>
          ) : (
            networkDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${device.status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <span className="font-mono text-sm text-foreground">{device.name}</span>
                    <p className="text-xs font-mono text-muted-foreground">{device.ipAddress}</p>
                  </div>
                </div>
                <span className={`text-xs font-mono ${device.status === 'ONLINE' ? 'text-green-500' : 'text-red-500'}`}>
                  {device.status === 'ONLINE' ? `${device.latency} ms` : 'OFFLINE'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Info note */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-[10px] font-mono text-muted-foreground/70 text-center">
            Data from assets with IP addresses in Inventory
          </p>
        </div>
      </div>
    </div>
  )
}