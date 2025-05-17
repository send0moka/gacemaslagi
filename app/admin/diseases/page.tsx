/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"

interface Disease {
  id: number
  name: string
  description: string
  symptoms: number[]
  created_at: string
}

interface Symptom {
  id: number
  name: string
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [newDisease, setNewDisease] = useState({
    name: "",
    description: "",
    symptoms: [] as number[]
  })
  const [isLoading, setIsLoading] = useState(false)
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
        .select('id, name')

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
    if (!newDisease.name || !newDisease.description || newDisease.symptoms.length === 0) {
      toast.error("Please fill all fields and select at least one symptom")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('diseases')
        .insert([newDisease])

      if (error) {
        console.error('Error adding disease:', error.message)
        throw error
      }

      toast.success("Disease added successfully")
      setNewDisease({ name: "", description: "", symptoms: [] })
      fetchDiseases()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to add disease')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDisease = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this disease?")
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('diseases')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting disease:', error.message)
        throw error
      }

      toast.success("Disease deleted successfully")
      fetchDiseases()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete disease')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Diseases</h1>

      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Disease</h2>
        <div className="space-y-4">
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
            <label className="block mb-2">Select Symptoms:</label>
            <select
              multiple
              value={newDisease.symptoms.map(String)}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions)
                setNewDisease({
                  ...newDisease,
                  symptoms: selectedOptions.map(option => Number(option.value))
                })
              }}
              className="w-full px-4 py-2 border rounded-lg"
              size={5}
            >
              {symptoms.map((symptom) => (
                <option key={symptom.id} value={symptom.id}>
                  {symptom.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddDisease}
            disabled={isLoading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Adding...' : 'Add Disease'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Symptoms</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {diseases.map((disease) => (
              <tr key={disease.id}>
                <td className="px-6 py-4 whitespace-nowrap">{disease.name}</td>
                <td className="px-6 py-4">{disease.description}</td>
                <td className="px-6 py-4">
                  {symptoms
                    .filter(s => disease.symptoms.includes(s.id))
                    .map(s => s.name)
                    .join(", ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDeleteDisease(disease.id)}
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