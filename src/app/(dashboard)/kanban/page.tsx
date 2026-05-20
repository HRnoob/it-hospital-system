'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { KanbanColumn } from '@/components/kanban/KanbanColumn'
import { KanbanCard as KanbanCardComponent } from '@/components/kanban/KanbanCard'
import { KanbanModal } from '@/components/kanban/KanbanModal'

interface KanbanCard {
  id: string
  title: string
  description: string | null
  column: string
  priority: string
  dueDate: string | null
  labels: string[]
  assignedTo: { id: string; name: string } | null
  position: number
}

interface KanbanData {
  TODO: KanbanCard[]
  DOING: KanbanCard[]
  DONE: KanbanCard[]
}

export default function KanbanPage() {
  const [data, setData] = useState<KanbanData>({ TODO: [], DOING: [], DONE: [] })
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null)
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])

  const columns = [
    { id: 'TODO', title: 'Todo', color: 'bg-gray-500' },
    { id: 'DOING', title: 'Doing', color: 'bg-yellow-500' },
    { id: 'DONE', title: 'Done', color: 'bg-green-500' },
  ]

  const fetchKanban = async () => {
    try {
      const res = await fetch('/api/kanban')
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users?limit=100')
      const result = await res.json()
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch users')
    }
  }

  useEffect(() => {
    fetchKanban()
    fetchUsers()
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event

    if (!over) return

    // Get active card dari semua kolom
    const activeCard = [...data.TODO, ...data.DOING, ...data.DONE].find(
      c => c.id === active.id
    )
    
    if (!activeCard) return

    const sourceColumn = activeCard.column
    const destinationColumn = over.id as string

    // Validasi destination column
    const validColumns = ['TODO', 'DOING', 'DONE']
    if (!validColumns.includes(destinationColumn)) {
      return
    }

    // Jika sama, tidak usah pindah
    if (sourceColumn === destinationColumn) return

    // Update local state optimistically
    const newData = { ...data }
    
    // Remove dari source column
    newData[sourceColumn as keyof KanbanData] = newData[sourceColumn as keyof KanbanData].filter(
      c => c.id !== active.id
    )
    
    // Add ke destination column
    const updatedCard = { ...activeCard, column: destinationColumn }
    newData[destinationColumn as keyof KanbanData] = [
      ...newData[destinationColumn as keyof KanbanData],
      updatedCard,
    ]
    
    setData(newData)

    // Update backend
    try {
      const cardsInDest = newData[destinationColumn as keyof KanbanData]
      await fetch('/api/kanban/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: active.id,
          sourceColumn,
          destinationColumn,
          newPosition: cardsInDest.length - 1,
        }),
      })
      toast.success('Task dipindahkan')
    } catch (error) {
      toast.error('Gagal memindahkan task')
      fetchKanban() // Revert on error
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleSaveCard = async (cardData: any) => {
    try {
      const url = editingCard ? `/api/kanban/${editingCard.id}` : '/api/kanban'
      const method = editingCard ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      })
      const result = await res.json()
      
      if (result.success) {
        toast.success(editingCard ? 'Task diupdate' : 'Task ditambahkan')
        setModalOpen(false)
        setEditingCard(null)
        fetchKanban()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Gagal menyimpan')
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Hapus task ini?')) return
    
    try {
      const res = await fetch(`/api/kanban/${cardId}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        toast.success('Task dihapus')
        fetchKanban()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Gagal menghapus')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getActiveCard = () => {
    return [...data.TODO, ...data.DOING, ...data.DONE].find(c => c.id === activeId)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
          <p className="text-gray-500 mt-1">Drag & drop task untuk update progress</p>
        </div>
        <button
          onClick={() => {
            setEditingCard(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Task
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <SortableContext
              key={column.id}
              items={data[column.id as keyof KanbanData].map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                color={column.color}
                count={data[column.id as keyof KanbanData].length}
                onAddCard={() => {
                  setEditingCard(null)
                  setModalOpen(true)
                }}
              >
                {data[column.id as keyof KanbanData].map((card) => (
                  <KanbanCardComponent
                    key={card.id}
                    id={card.id}
                    title={card.title}
                    priority={card.priority}
                    dueDate={card.dueDate}
                    assignee={card.assignedTo?.name}
                    labels={card.labels}
                    onClick={() => {
                      setEditingCard(card)
                      setModalOpen(true)
                    }}
                    onDelete={() => handleDeleteCard(card.id)}
                  />
                ))}
              </KanbanColumn>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white rounded-lg shadow-lg p-4 w-80 border-2 border-blue-500 opacity-80">
              {(() => {
                const card = getActiveCard()
                if (!card) return null
                return (
                  <div>
                    <h3 className="font-medium">{card.title}</h3>
                    {card.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{card.description}</p>
                    )}
                  </div>
                )
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal */}
      <KanbanModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingCard(null)
        }}
        onSave={handleSaveCard}
        card={editingCard}
        users={users}
      />
    </div>
  )
}