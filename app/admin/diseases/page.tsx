"use client"

import { useState } from "react"
import { toast } from "sonner"
import { exportDiseaseToPDF } from "@/utils/export"
import DiseaseTable from "@/components/admin/DiseaseTable"
import ImageModal from "@/components/admin/ImageModal"
import { useDiseasesData } from "@/hooks/useDiseasesData"
import { useSymptomsData } from "@/hooks/useSymptomsData"
import DiseaseForm from "@/components/admin/DiseaseForm"
import { DiseaseProvider } from "@/context/DiseaseContext"
import DiseaseSearch from "@/components/admin/DiseaseSearch"
import ExportButton from "@/components/admin/ExportButton"
import DiseaseDelete from "@/components/admin/DiseaseDelete"

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

  const handleExportPDF = async () => {
    try {
      await exportDiseaseToPDF(filteredDiseases, symptoms)
      toast.success("PDF exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export PDF")
    }
  }

  return (
    <DiseaseProvider>
      <div>
        <h1 className="text-2xl font-bold mb-6">Manage Diseases</h1>

        <DiseaseForm
          symptoms={symptoms}
          isLoading={isLoading}
          onAddDisease={handleAddDisease}
          onUpdateDisease={handleUpdateDisease}
        />

        <DiseaseSearch search={search} onSearchChange={setSearch} />

        <DiseaseTable
          diseases={diseases}
          symptoms={symptoms}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortFieldChange={setSortField}
          onSortOrderChange={setSortOrder}
          onEdit={(disease) => {
            toast.info(`Editing disease: ${disease.code}`)
          }}
          onDelete={handleDeleteClick}
          onImageClick={setSelectedImage}
        />

        <ExportButton onExport={handleExportPDF} />

        <DiseaseDelete
          deleteDialog={deleteDialog}
          setDeleteDialog={setDeleteDialog}
          fetchDiseases={fetchDiseases}
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
