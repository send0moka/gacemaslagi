/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"

interface Symptom {
  id: number
  name: string
  description: string
  created_at: string
}

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [newSymptom, setNewSymptom] = useState({ name: "", description: "" })
  const [isLoading, setIsLoading] = useState(false)
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
    if (!newSymptom.name || !newSymptom.description) {
      toast.error("Please fill all fields")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('symptoms')
        .insert([newSymptom])

      if (error) {
        console.error('Error adding symptom:', error.message)
        throw error
      }

      toast.success("Symptom added successfully")
      setNewSymptom({ name: "", description: "" })
      fetchSymptoms()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to add symptom')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSymptom = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this symptom?")
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting symptom:', error.message)
        throw error
      }

      toast.success("Symptom deleted successfully")
      fetchSymptoms()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete symptom')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Symptoms</h1>

      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Symptom</h2>
        <div className="space-y-4">
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
          <button
            onClick={handleAddSymptom}
            disabled={isLoading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Adding...' : 'Add Symptom'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {symptoms.map((symptom) => (
              <tr key={symptom.id}>
                <td className="px-6 py-4 whitespace-nowrap">{symptom.name}</td>
                <td className="px-6 py-4">{symptom.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDeleteSymptom(symptom.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}