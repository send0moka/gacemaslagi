import { createClient } from "@/lib/client"
import { toast } from "sonner"
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog"

interface DiseaseDeleteProps {
  deleteDialog: {
    isOpen: boolean
    diseaseId: number | null
  }
  setDeleteDialog: (dialog: { isOpen: boolean; diseaseId: number | null }) => void
  fetchDiseases: () => void
}

export default function DiseaseDelete({
  deleteDialog,
  setDeleteDialog,
  fetchDiseases,
}: DiseaseDeleteProps) {
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

  return (
    <DeleteConfirmDialog
      isOpen={deleteDialog.isOpen}
      onClose={() => setDeleteDialog({ isOpen: false, diseaseId: null })}
      onConfirm={handleConfirmDelete}
      itemType="Disease"
    />
  )
}