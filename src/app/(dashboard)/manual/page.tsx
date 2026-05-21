'use client'

import { useState, useEffect } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Search, Printer } from 'lucide-react'
import Link from 'next/link'

interface ManualSection {
  title: string
  icon: string
  content: string[]
}

export default function ManualPage() {
  const [sections, setSections] = useState<ManualSection[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('/api/manual')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSections(data.data.sections)
          // Expand all sections by default
          const expanded: Record<number, boolean> = {}
          data.data.sections.forEach((_: any, idx: number) => {
            expanded[idx] = true
          })
          setExpandedSections(expanded)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const toggleAll = () => {
    const allExpanded = Object.values(expandedSections).every(v => v === true)
    const newState: Record<number, boolean> = {}
    sections.forEach((_, idx) => {
      newState[idx] = !allExpanded
    })
    setExpandedSections(newState)
  }

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handlePrint = () => {
    window.print()
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
      {/* Header */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full animate-pulse" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">MANUAL BOOK</h1>
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-2 ml-4">
              User Guide — IT Hospital System
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg px-4 py-2 font-mono text-sm transition-all duration-300 text-primary"
          >
            <Printer className="w-4 h-4" />
            PRINT
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari panduan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleAll}
          className="text-sm font-mono text-primary hover:text-primary/80 transition-colors"
        >
          {Object.values(expandedSections).every(v => v === true) ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {filteredSections.map((section, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(idx)}
              className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
              </div>
              {expandedSections[idx] ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections[idx] && (
              <div className="p-5 pt-0 border-t border-border">
                <ul className="space-y-2 list-disc list-inside">
                  {section.content.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-foreground/80 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-border text-center">
        <p className="text-xs font-mono text-muted-foreground">
          IT Hospital System v1.0.0 | Last Updated: {new Date().toLocaleDateString('id-ID')}
        </p>
        <p className="text-xs font-mono text-muted-foreground/70 mt-1">
          Untuk bantuan lebih lanjut, hubungi SUPERADMIN
        </p>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          button, .search-bar, .control-buttons {
            display: none !important;
          }
          .bg-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .border-border {
            border-color: #ccc !important;
          }
        }
      `}</style>
    </div>
  )
}