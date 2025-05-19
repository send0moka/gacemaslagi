import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import { Disease } from "@/utils/types"
import { useUploadDiseaseImage } from "@/hooks/useUploadDiseaseImage"

export function useDiseasesData(
  search: string,
  sortField: "code" | "name",
  sortOrder: "asc" | "desc"
) {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [filteredDiseases, setFilteredDiseases] = useState<Disease[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const { uploadImage } = useUploadDiseaseImage()

  const fetchDiseases = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("diseases")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching diseases:", error.message)
        throw error
      }
      setDiseases(data || [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to fetch diseases")
    }
  }, [supabase])

  const filterAndSortDiseases = useCallback(() => {
    let filtered = [...diseases]

    // Apply search
    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.code.toLowerCase().includes(search.toLowerCase()) ||
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.solution.desc.toLowerCase().includes(search.toLowerCase())
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

  useEffect(() => {
    fetchDiseases()
  }, [fetchDiseases])

  useEffect(() => {
    filterAndSortDiseases()
  }, [diseases, search, sortField, sortOrder, filterAndSortDiseases])

  const handleAddDisease = async (
    newDisease: Omit<Disease, "id" | "created_at">
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Validate the data before sending
      if (
        !newDisease.code ||
        !newDisease.name ||
        !newDisease.about ||
        !newDisease.solution.desc ||
        !newDisease.symptoms.length
      ) {
        toast.error(
          "Please fill all required fields and select at least one symptom"
        )
        return false
      }

      // Upload image if exists
      let imageUrl = null
      if (newDisease.solution.image) {
        imageUrl = await uploadImage(newDisease.solution.image)
      }

      // Check for duplicate code
      const { data: existingDisease } = await supabase
        .from("diseases")
        .select("code")
        .eq("code", newDisease.code)
        .single()

      if (existingDisease) {
        toast.error(`Disease with code ${newDisease.code} already exists`)
        return false
      }

      const { error } = await supabase.from("diseases").insert([
        {
          code: newDisease.code,
          name: newDisease.name,
          about: newDisease.about,
          solution: {
            ...newDisease.solution,
            image: imageUrl, // Use the uploaded image URL
          },
          symptoms: newDisease.symptoms,
        },
      ])

      if (error) throw error

      toast.success("Disease added successfully")
      await fetchDiseases()
      return true

    } catch (error) {
      console.error("Error details:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateDisease = async (
    id: number,
    updatedDisease: Omit<Disease, "id" | "created_at">
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Validate inputs
      if (
        !updatedDisease.code ||
        !updatedDisease.name ||
        !updatedDisease.about ||
        !updatedDisease.solution.desc ||
        !updatedDisease.symptoms.length
      ) {
        toast.error("Please fill all required fields and select at least one symptom")
        return false
      }

      // Upload new image if exists
      let imageUrl = updatedDisease.solution.image
      if (imageUrl && imageUrl.startsWith('data:image')) {
        imageUrl = await uploadImage(imageUrl)
      }

      // Check for duplicate code
      const { data: existingDisease } = await supabase
        .from("diseases")
        .select("id, code")
        .eq("code", updatedDisease.code)
        .neq("id", id)
        .single()

      if (existingDisease) {
        toast.error(`Disease with code ${updatedDisease.code} already exists`)
        return false
      }

      const diseaseData = {
        code: updatedDisease.code,
        name: updatedDisease.name,
        about: updatedDisease.about,
        solution: {
          ...updatedDisease.solution,
          image: imageUrl, // Use the uploaded image URL
        },
        symptoms: updatedDisease.symptoms,
      }

      const { error } = await supabase
        .from("diseases")
        .update(diseaseData)
        .eq("id", id)

      if (error) throw error

      toast.success("Disease updated successfully")
      await fetchDiseases()
      return true

    } catch (error) {
      console.error("Error details:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    diseases,
    filteredDiseases,
    isLoading,
    fetchDiseases,
    handleAddDisease,
    handleUpdateDisease,
  }
}
