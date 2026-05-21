'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface KanbanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  card: any | null
  users: { id: string; name: string }[]
}

export function KanbanModal({ isOpen, onClose, onSave, card, users }: KanbanModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    column: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assignedToId: '',
    labels: [] as string[],
    labelInput: '',
  })

  useEffect(() => {
    if (card) {
      setForm({
        title: card.title || '',
        description: card.description || '',
        column: card.column || 'TODO',
        priority: card.priority || 'MEDIUM',
        dueDate: card.dueDate ? card.dueDate.split('T')[0] : '',
        assignedToId: card.assignedTo?.id || '',
        labels: card.labels || [],
        labelInput: '',
      })
    } else {
      setForm({
        title: '',
        description: '',
        column: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        assignedToId: '',
        labels: [],
        labelInput: '',
      })
    }
  }, [card])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  const addLabel = () => {
    if (form.labelInput.trim() && !form.labels.includes(form.labelInput.trim())) {
      setForm({
        ...form,
        labels: [...form.labels, form.labelInput.trim()],
        labelInput: '',
      })
    }
  }

  const removeLabel = (label: string) => {
    setForm({
      ...form,
      labels: form.labels.filter(l => l !== label),
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{card ? 'Edit Task' : 'Tambah Task Baru'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul Task *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kolom</label>
            <select
              value={form.column}
              onChange={(e) => setForm({ ...form, column: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODO">Todo</option>
              <option value="DOING">Doing</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prioritas</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assign ke</label>
            <select
              value={form.assignedToId}
              onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tidak ditugaskan</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Labels</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.labelInput}
                onChange={(e) => setForm({ ...form, labelInput: e.target.value })}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Bug, Feature, Enhancement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
              />
              <button
                type="button"
                onClick={addLabel}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {form.labels.map((label) => (
                <span
                  key={label}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {card ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}