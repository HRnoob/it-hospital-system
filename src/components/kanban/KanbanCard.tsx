'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, User, MoreVertical, Trash2, Edit } from 'lucide-react'
import { useState } from 'react'

interface KanbanCardProps {
  id: string
  title: string
  priority: string
  dueDate: string | null
  assignee: string | null
  labels: string[]
  onClick: () => void
  onDelete: () => void
}

export function KanbanCard({
  id,
  title,
  priority,
  dueDate,
  assignee,
  labels,
  onClick,
  onDelete,
}: KanbanCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <div className="flex gap-1 mt-2">
            <span className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor(priority)}`}>
              {priority}
            </span>
            {labels.slice(0, 2).map((label, idx) => (
              <span key={idx} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border z-10 w-32">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  onClick()
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  onDelete()
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                <Trash2 className="w-3 h-3" />
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-3 text-xs text-gray-500">
        {dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(dueDate).toLocaleDateString('id-ID')}</span>
          </div>
        )}
        {assignee && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{assignee}</span>
          </div>
        )}
      </div>
    </div>
  )
}