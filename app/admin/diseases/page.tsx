/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PencilIcon, TrashIcon } from "lucide-react"
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog"
import { exportToPDF } from "@/lib/utils/export"
import { LexicalEditor } from '@/components/editor/LexicalEditor'

interface LexicalNode {
  children?: {
    text: string;
  }[];
}

interface Solution {
  root: {
    children: Array<{
      children: Array<{
        text: string;
        type: string;
      }>;
      type: string;
    }>;
    direction: string;
    format: string;
    indent: number;
    type: string;
    version: number;
  }
}

interface Disease {
  id: number;
  code: string;
  name: string;
  solution: Solution | string;
  symptoms: number[];
  created_at: string;
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
    solution: "", // Initialize as empty string
    symptoms: [] as number[]
  })
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    diseaseId: null as number | null
  })
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<"code" | "name">("code")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filteredDiseases, setFilteredDiseases] = useState<Disease[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchDiseases()
    fetchSymptoms()
  }, [])

  useEffect(() => {
    filterAndSortDiseases()
  }, [diseases, search, sortField, sortOrder])

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

  const filterAndSortDiseases = useCallback(() => {
    let filtered = [...diseases]
    
    // Apply search
    if (search) {
      filtered = filtered.filter(
        d => d.code.toLowerCase().includes(search.toLowerCase()) ||
             d.name.toLowerCase().includes(search.toLowerCase()) ||
             getSolutionText(d.solution).toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply sort
    filtered.sort((a, b) => {
      const aValue = a[sortField].toLowerCase()
      const bValue = b[sortField].toLowerCase()
      return sortOrder === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    setFilteredDiseases(filtered)
  }, [diseases, search, sortField, sortOrder])

  const handleAddDisease = async () => {
    if (!newDisease.code || !newDisease.name || !newDisease.solution || newDisease.symptoms.length === 0) {
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
      setNewDisease({ code: "", name: "", solution: "", symptoms: [] })
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
      solution: typeof disease.solution === 'string' 
        ? disease.solution 
        : JSON.stringify(disease.solution),
      symptoms: disease.symptoms
    })
  }

  const handleUpdate = async () => {
    if (!editingDisease) return
    if (!newDisease.code || !newDisease.name || !newDisease.solution || newDisease.symptoms.length === 0) {
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
          solution: newDisease.solution,
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
      setNewDisease({ code: "", name: "", solution: "", symptoms: [] })
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
    setNewDisease({ code: "", name: "", solution: "", symptoms: [] })
  }

  const handleExportPDF = () => {
    const formattedData = filteredDiseases.map(d => ({
      Code: d.code,
      Name: d.name,
      Solution: (typeof d.solution === 'string' ? JSON.parse(d.solution) : d.solution).root.children
        .map((node: LexicalNode) => 
          node.children?.map((child: { text: string }) => child.text).join('') || ''
        ).join('\n')
    }))
    exportToPDF(formattedData, 'diseases')
  }

  const getSolutionText = (solution: Disease['solution'] | string): string => {
    try {
      // Handle string JSON
      const parsedSolution = typeof solution === 'string' 
        ? JSON.parse(solution) 
        : solution;

      // Extract text from the JSON structure
      return parsedSolution?.root?.children?.[0]?.children?.[0]?.text || ''
    } catch (error) {
      console.error('Error parsing solution:', error)
      return ''
    }
  }

  const renderSolution = (solution: Solution | string) => {
    try {
      const parsedSolution = typeof solution === 'string' 
        ? JSON.parse(solution) as Solution
        : solution;

      return parsedSolution?.root?.children?.map((block, blockIndex) => (
        <div key={blockIndex}>
          {block.children?.map((child, childIndex) => (
            <span key={`${blockIndex}-${childIndex}`}>
              {child.text}
            </span>
          ))}
        </div>
      ));
    } catch (error) {
      console.error('Error parsing solution:', error);
      return <span className="text-red-500">Error displaying solution</span>;
    }
  };

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
          <div>
            <label className="block mb-2">Solution:</label>
            <LexicalEditor
              initialValue={newDisease.solution}
              onChange={(value) => setNewDisease({ ...newDisease, solution: value })}
            />
          </div>
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

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search diseases..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => {
                  setSortField("code");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >Code</th>
              <th 
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => {
                  setSortField("name");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Solution</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Symptoms</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDiseases.map((disease) => (
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
                <td className="px-6 py-4">
                  <div className="prose prose-sm max-w-none">
                    {getSolutionText(disease.solution)}
                  </div>
                </td>
                <td className="px-6 py-4 prose prose-sm max-w-none">
                  {renderSolution(disease.solution)}
                </td>
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

      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export to PDF
        </button>
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