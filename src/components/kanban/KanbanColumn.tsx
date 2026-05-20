'use client'

import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  count: number
  children: React.ReactNode
  onAddCard: () => void
}

export function KanbanColumn({
  id,
  title,
  color,
  count,
  children,
  onAddCard,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="bg-gray-100 rounded-lg w-80 flex-shrink-0 h-full">
      <div className={`${color} text-white p-3 rounded-t-lg flex justify-between items-center`}>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs opacity-75">{count} task</p>
        </div>
        <button
          onClick={onAddCard}
          className="p-1 hover:bg-white/20 rounded transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="p-3 space-y-3 min-h-[500px] max-h-[calc(100vh-200px)] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}