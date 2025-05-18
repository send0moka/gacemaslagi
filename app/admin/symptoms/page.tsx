/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PencilIcon, TrashIcon } from "lucide-react"
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog"

interface Symptom {
  id: number
  code: string
  name: string
  description: string
  created_at: string
}

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [newSymptom, setNewSymptom] = useState({ 
    code: "",
    name: "", 
    description: "" 
  })
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    symptomId: null as number | null
  })
  const supabase = createClient()

  useEffect(() => {
    fetchSymptoms()
  }, [])

  const fetchSymptoms = async () => {
    try {
      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching symptoms:', error.message)
        throw error
      }
      setSymptoms(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch symptoms')
    }
  }

  const handleAddSymptom = async () => {
    if (!newSymptom.code || !newSymptom.name || !newSymptom.description) {
      toast.error("Please fill all fields")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('symptoms')
        .insert([newSymptom])

      if (error) {
        if (error.code === '23505') {
          toast.error('Symptom code already exists')
          return
        }
        throw error
      }

      toast.success("Symptom added successfully")
      setNewSymptom({ code: "", name: "", description: "" })
      fetchSymptoms()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to add symptom')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeleteDialog({ isOpen: true, symptomId: id })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.symptomId) return

    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', deleteDialog.symptomId)

      if (error) throw error

      toast.success("Symptom deleted successfully")
      fetchSymptoms()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete symptom')
    } finally {
      setDeleteDialog({ isOpen: false, symptomId: null })
    }
  }

  const handleEdit = (symptom: Symptom) => {
    setEditingSymptom(symptom)
    setNewSymptom({
      code: symptom.code,
      name: symptom.name,
      description: symptom.description
    })
  }

  const handleUpdate = async () => {
    if (!editingSymptom) return
    if (!newSymptom.code || !newSymptom.name || !newSymptom.description) {
      toast.error("Please fill all fields")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('symptoms')
        .update({
          code: newSymptom.code,
          name: newSymptom.name,
          description: newSymptom.description
        })
        .eq('id', editingSymptom.id)

      if (error) {
        if (error.code === '23505') {
          toast.error('Symptom code already exists')
          return
        }
        throw error
      }

      toast.success("Symptom updated successfully")
      setEditingSymptom(null)
      setNewSymptom({ code: "", name: "", description: "" })
      fetchSymptoms()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update symptom')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingSymptom(null)
    setNewSymptom({ code: "", name: "", description: "" })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Symptoms</h1>

      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editingSymptom ? 'Edit Symptom' : 'Add New Symptom'}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={newSymptom.code}
            onChange={(e) => setNewSymptom({ ...newSymptom, code: e.target.value.toUpperCase() })}
            placeholder="Symptom code (e.g. G01)"
            className="w-full px-4 py-2 border rounded-lg"
            maxLength={10}
          />
          <input
            type="text"
            value={newSymptom.name}
            onChange={(e) => setNewSymptom({ ...newSymptom, name: e.target.value })}
            placeholder="Symptom name"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            value={newSymptom.description}
            onChange={(e) => setNewSymptom({ ...newSymptom, description: e.target.value })}
            placeholder="Symptom description"
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={editingSymptom ? handleUpdate : handleAddSymptom}
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Saving...' : editingSymptom ? 'Update Symptom' : 'Add Symptom'}
            </button>
            {editingSymptom && (
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {symptoms.map((symptom) => (
              <tr key={symptom.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {symptom.code}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {symptom.name}
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{symptom.name}</td>
                <td className="px-6 py-4">{symptom.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(symptom)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(symptom.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, symptomId: null })}
        onConfirm={handleConfirmDelete}
        itemType="Symptom"
      />
    </div>
  )
}