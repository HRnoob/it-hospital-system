'use client'

import { useEffect, useState } from 'react'
import { 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    openIssues: 0,
    inProgressIssues: 0,
    todayCheck: false,
  })

  useEffect(() => {
    // Fetch stats
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data)
        }
      })
      .catch(console.error)
  }, [])

  const cards = [
    {
      title: 'Total Aset',
      value: stats.totalAssets,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Issues Open',
      value: stats.openIssues,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: 'Perlu perhatian',
    },
    {
      title: 'In Progress',
      value: stats.inProgressIssues,
      icon: Clock,
      color: 'bg-yellow-500',
      change: 'Sedang dikerjakan',
    },
    {
      title: 'Morning Check',
      value: stats.todayCheck ? 'Sudah' : 'Belum',
      icon: CheckCircle,
      color: stats.todayCheck ? 'bg-green-500' : 'bg-gray-500',
      change: stats.todayCheck ? 'Hari ini' : 'Belum diisi',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang di IT Hospital Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p className="text-xs text-gray-400 mt-2">{card.change}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center gap-4">
          <Activity className="w-12 h-12" />
          <div>
            <h2 className="text-xl font-bold">Step 2 Selesai!</h2>
            <p className="text-blue-100 mt-1">
              Sistem autentikasi dan dashboard layout sudah berfungsi.
              Saatnya lanjut ke pengembangan fitur berikutnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}