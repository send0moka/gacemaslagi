/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/client"
import { useUploadImage } from "@/hooks/useUploadImage"
import { toast } from "sonner"

const supabase = createClient()
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PencilIcon, TrashIcon, SearchIcon, SortAscIcon, SortDescIcon, DownloadIcon, UploadIcon } from "lucide-react"
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog"
import { exportToExcel, exportToPDF, parseCSV } from "@/utils/export"
import Image from "next/image"
import { ImageIcon, X } from "lucide-react"

interface Symptom {
  id: number
  code: string
  name: string
  description: string
  image: string | null
  created_at: string
}

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [newSymptom, setNewSymptom] = useState({ 
    code: "",
    name: "", 
    description: "",
    image: null as string | null
  })
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    symptomId: null as number | null
  })
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<"code" | "name">("code")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { uploadImage, isUploading } = useUploadImage()

  useEffect(() => {
    fetchSymptoms()
  }, [])

  useEffect(() => {
    filterAndSortSymptoms()
  }, [symptoms, search, sortField, sortOrder])

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

  const filterAndSortSymptoms = useCallback(() => {
    let filtered = [...symptoms]
    
    // Apply search
    if (search) {
      filtered = filtered.filter(
        s => s.code.toLowerCase().includes(search.toLowerCase()) ||
             s.name.toLowerCase().includes(search.toLowerCase()) ||
             s.description.toLowerCase().includes(search.toLowerCase())
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

    setFilteredSymptoms(filtered)
  }, [symptoms, search, sortField, sortOrder])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64String = event.target?.result as string
        setImagePreview(base64String)
        setNewSymptom(prev => ({ ...prev, image: base64String }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error reading file:', error)
      toast.error('Failed to process image')
    }
  }

  const handleAddSymptom = async () => {
    if (!newSymptom.code || !newSymptom.name || !newSymptom.description) {
      toast.error("Please fill all required fields")
      return
    }

    setIsLoading(true)
    try {
      let imageUrl = null
      if (newSymptom.image) {
        imageUrl = await uploadImage(newSymptom.image)
      }

      const { error } = await createClient()
        .from('symptoms')
        .insert([{
          ...newSymptom,
          image: imageUrl
        }])

      if (error) throw error

      toast.success("Symptom added successfully")
      setNewSymptom({ code: "", name: "", description: "", image: null })
      setImagePreview(null)
      await fetchSymptoms()
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
      description: symptom.description,
      image: symptom.image // Make sure image is loaded
    })
    setImagePreview(symptom.image) // Set image preview
  }

  const handleUpdateSymptom = async () => {
    if (!editingSymptom) return
    if (!newSymptom.code || !newSymptom.name) {
      toast.error("Please fill all required fields")
      return
    }

    setIsLoading(true)
    try {
      let imageUrl = editingSymptom.image

      if (newSymptom.image && newSymptom.image !== editingSymptom.image) {
        imageUrl = await uploadImage(newSymptom.image)
      }

      const { error } = await createClient()
        .from("symptoms")
        .update({
          code: newSymptom.code,
          name: newSymptom.name,
          description: newSymptom.description,
          image: imageUrl
        })
        .eq("id", editingSymptom.id)

      if (error) throw error

      toast.success("Symptom updated successfully")
      setEditingSymptom(null)
      setNewSymptom({ code: "", name: "", description: "", image: null })
      setImagePreview(null)
      await fetchSymptoms()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update symptom')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingSymptom(null)
    setNewSymptom({ code: "", name: "", description: "", image: null })
    setImagePreview(null)
  }

  const handleExportExcel = () => {
    const data = filteredSymptoms.map(s => ({
      code: s.code,
      name: s.name,
      description: s.description
    }))
    exportToExcel(data, 'symptoms')
  }

  const handleExportPDF = () => {
    const formattedData = filteredSymptoms.map(s => ({
      Code: s.code,
      Name: s.name,
      Description: s.description
    }))
    exportToPDF(formattedData, 'symptoms')
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const data = await parseCSV(file)
      const { error } = await supabase
        .from('symptoms')
        .insert(data)

      if (error) throw error

      toast.success("Symptoms imported successfully")
      fetchSymptoms()
    } catch (error) {
      console.error('Error importing symptoms:', error)
      toast.error('Failed to import symptoms')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Symptoms</h1>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newSymptom.code}
              onChange={(e) => setNewSymptom({...newSymptom, code: e.target.value})}
              placeholder="Code"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              value={newSymptom.name}
              onChange={(e) => setNewSymptom({...newSymptom, name: e.target.value})}
              placeholder="Name"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <input
            type="text"
            value={newSymptom.description}
            onChange={(e) => setNewSymptom({...newSymptom, description: e.target.value})}
            placeholder="Description"
            className="w-full px-4 py-2 border rounded-lg"
          />

          <div className="space-y-2">
            {imagePreview ? (
              // Preview image
              <div className="relative w-32 h-32">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="rounded-lg object-cover w-full h-full"
                  unoptimized={true}
                />
                <button
                  onClick={() => {
                    setImagePreview(null)
                    setNewSymptom(prev => ({ ...prev, image: null }))
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg">
                <label className="cursor-pointer p-4 text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-500">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {editingSymptom ? (
              <>
                <button 
                  onClick={handleUpdateSymptom} 
                  disabled={isLoading || isUploading}
                  className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${(isLoading || isUploading) ? 'opacity-50' : ''}`}
                >
                  {isLoading || isUploading ? 'Updating...' : 'Update'}
                </button>
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={handleAddSymptom}
                disabled={isLoading || isUploading}
                className={`px-4 py-2 bg-green-500 text-white rounded-lg ${(isLoading || isUploading) ? 'opacity-50' : ''}`}
              >
                {isLoading || isUploading ? 'Adding...' : 'Add'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add controls before the table */}
      <div className="bg-white rounded-lg p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symptoms..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sortOrder === "asc" ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />}
          </button>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as "code" | "name")}
            className="border rounded-lg px-3 py-2"
          >
            <option value="code">Sort by Code</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={isLoading}
            onClick={handleExportExcel}
            className={`px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <DownloadIcon className="w-4 h-4" />
            Export XLSX
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export PDF
          </button>
          <label className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2">
            <UploadIcon className="w-4 h-4" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Update table to use filteredSymptoms */}
      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Image</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSymptoms.map((symptom) => (
              <tr key={symptom.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {symptom.code}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{symptom.name}</TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-6 py-4">
                  {symptom.image && (
                    <div className="relative w-24 h-24">
                      <img
                        src={symptom.image}
                        alt={symptom.name}
                        className="rounded-lg object-cover w-full h-full"
                      />
                    </div>
                  )}
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