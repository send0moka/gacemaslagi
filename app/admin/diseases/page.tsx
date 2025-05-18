/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PencilIcon, TrashIcon } from "lucide-react"
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog"

interface Disease {
  id: number
  code: string
  name: string
  description: string
  symptoms: number[]
  created_at: string
}

interface Symptom {
  id: number
  code: string
  name: string
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [newDisease, setNewDisease] = useState({
    code: "",
    name: "",
    description: "",
    symptoms: [] as number[]
  })
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    diseaseId: null as number | null
  })
  const supabase = createClient()

  useEffect(() => {
    fetchDiseases()
    fetchSymptoms()
  }, [])

  const fetchDiseases = async () => {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching diseases:', error.message)
        throw error
      }
      setDiseases(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch diseases')
    }
  }

  const fetchSymptoms = async () => {
    try {
      const { data, error } = await supabase
        .from('symptoms')
        .select('id, code, name')

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

  const handleAddDisease = async () => {
    if (!newDisease.code || !newDisease.name || !newDisease.description || newDisease.symptoms.length === 0) {
      toast.error("Please fill all fields and select at least one symptom")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('diseases')
        .insert([newDisease])

      if (error) {
        if (error.code === '23505') {
          toast.error('Disease code already exists')
          return
        }
        throw error
      }

      toast.success("Disease added successfully")
      setNewDisease({ code: "", name: "", description: "", symptoms: [] })
      fetchDiseases()
    } catch (error) {
      console.error('Error adding disease:', error)
      toast.error('Failed to add disease')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (disease: Disease) => {
    setEditingDisease(disease)
    setNewDisease({
      code: disease.code,
      name: disease.name,
      description: disease.description,
      symptoms: disease.symptoms
    })
  }

  const handleUpdate = async () => {
    if (!editingDisease) return
    if (!newDisease.code || !newDisease.name || !newDisease.description || newDisease.symptoms.length === 0) {
      toast.error("Please fill all fields and select at least one symptom")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('diseases')
        .update({
          code: newDisease.code,
          name: newDisease.name,
          description: newDisease.description,
          symptoms: newDisease.symptoms
        })
        .eq('id', editingDisease.id)

      if (error) {
        if (error.code === '23505') {
          toast.error('Disease code already exists')
          return
        }
        throw error
      }

      toast.success("Disease updated successfully")
      setEditingDisease(null)
      setNewDisease({ code: "", name: "", description: "", symptoms: [] })
      fetchDiseases()
    } catch (error) {
      console.error('Error updating disease:', error)
      toast.error('Failed to update disease')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeleteDialog({ isOpen: true, diseaseId: id })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.diseaseId) return

    try {
      const { error } = await supabase
        .from('diseases')
        .delete()
        .eq('id', deleteDialog.diseaseId)

      if (error) throw error

      toast.success("Disease deleted successfully")
      fetchDiseases()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete disease')
    } finally {
      setDeleteDialog({ isOpen: false, diseaseId: null })
    }
  }

  const handleCancel = () => {
    setEditingDisease(null)
    setNewDisease({ code: "", name: "", description: "", symptoms: [] })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Diseases</h1>

      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editingDisease ? 'Edit Disease' : 'Add New Disease'}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={newDisease.code}
            onChange={(e) => setNewDisease({ ...newDisease, code: e.target.value.toUpperCase() })}
            placeholder="Disease code (e.g. P01)"
            className="w-full px-4 py-2 border rounded-lg"
            maxLength={10}
          />
          <input
            type="text"
            value={newDisease.name}
            onChange={(e) => setNewDisease({ ...newDisease, name: e.target.value })}
            placeholder="Disease name"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            value={newDisease.description}
            onChange={(e) => setNewDisease({ ...newDisease, description: e.target.value })}
            placeholder="Disease description"
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
          />
          <div>
            <label className="block mb-2 font-medium">Select Symptoms:</label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`symptom-${symptom.id}`}
                    checked={newDisease.symptoms.includes(symptom.id)}
                    onChange={(e) => {
                      const updatedSymptoms = e.target.checked
                        ? [...newDisease.symptoms, symptom.id]
                        : newDisease.symptoms.filter(id => id !== symptom.id)
                      setNewDisease({ ...newDisease, symptoms: updatedSymptoms })
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={`symptom-${symptom.id}`} className="flex items-center gap-2 select-none">
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
                    <span className="text-sm text-gray-700">{symptom.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingDisease ? handleUpdate : handleAddDisease}
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Saving...' : editingDisease ? 'Update Disease' : 'Add Disease'}
            </button>
            {editingDisease && (
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Symptoms</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {diseases.map((disease) => (
              <tr key={disease.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        {disease.code}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {disease.name}
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-6 py-4">{disease.name}</td>
                <td className="px-6 py-4">{disease.description}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {symptoms
                      .filter(s => disease.symptoms.includes(s.id))
                      .map(s => (
                        <Tooltip key={s.id}>
                          <TooltipTrigger>
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {s.code}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {s.name}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(disease)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(disease.id)}
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
        onClose={() => setDeleteDialog({ isOpen: false, diseaseId: null })}
        onConfirm={handleConfirmDelete}
        itemType="Disease"
      />
    </div>
  )
}