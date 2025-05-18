"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import { exportDiseaseToPDF } from "@/utils/export"
import DiseaseTable from "@/components/admin/DiseaseTable"
import ImageModal from "@/components/admin/ImageModal"
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog"
import { useDiseasesData } from "@/hooks/useDiseasesData"
import { useSymptomsData } from "@/hooks/useSymptomsData"
import DiseaseForm from "@/components/admin/DiseaseForm"
import { DiseaseProvider } from "@/context/DiseaseContext" // Add this import

export default function DiseasesPage() {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<"code" | "name">("code")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    diseaseId: null as number | null,
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const {
    diseases,
    filteredDiseases,
    isLoading,
    fetchDiseases,
    handleAddDisease,
    handleUpdateDisease,
  } = useDiseasesData(search, sortField, sortOrder)

  const { symptoms } = useSymptomsData()

  const handleDeleteClick = (id: number) => {
    setDeleteDialog({ isOpen: true, diseaseId: id })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.diseaseId) return
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("diseases")
        .delete()
        .eq("id", deleteDialog.diseaseId)

      if (error) throw error

      toast.success("Disease deleted successfully")
      fetchDiseases()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to delete disease")
    } finally {
      setDeleteDialog({ isOpen: false, diseaseId: null })
    }
  }

  const handleExportPDF = async () => {
    await exportDiseaseToPDF(filteredDiseases, symptoms)
  }

  return (
    <DiseaseProvider>
      {" "}
      {/* Wrap the entire content with DiseaseProvider */}
      <div>
        <h1 className="text-2xl font-bold mb-6">Manage Diseases</h1>

        <DiseaseForm
          symptoms={symptoms}
          isLoading={isLoading}
          onAddDisease={handleAddDisease}
          onUpdateDisease={handleUpdateDisease}
        />

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diseases..."
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <DiseaseTable
          diseases={diseases}
          symptoms={symptoms}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortFieldChange={setSortField}
          onSortOrderChange={setSortOrder}
          onEdit={(disease) => {
            // Pass the disease data to editingDisease state
            // This will trigger the form to switch to edit mode
            toast.info(`Editing disease: ${disease.code}`)
          }}
          onDelete={handleDeleteClick}
          onImageClick={setSelectedImage}
        />

        <div className="flex justify-end my-4">
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

        {selectedImage && (
          <ImageModal
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </DiseaseProvider>
  )
}
