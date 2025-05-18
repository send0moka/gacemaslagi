import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import { Disease } from "@/utils/types"

export function useDiseasesData(
  search: string,
  sortField: "code" | "name",
  sortOrder: "asc" | "desc"
) {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [filteredDiseases, setFilteredDiseases] = useState<Disease[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

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
        !newDisease.about ||  // Add this line
        !newDisease.solution.desc ||
        !newDisease.symptoms.length
      ) {
        toast.error(
          "Please fill all required fields and select at least one symptom"
        )
        return false
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
          about: newDisease.about, // Add this line
          solution: newDisease.solution,
          symptoms: newDisease.symptoms,
        },
      ])

      if (error) {
        console.error("Database error:", error)
        toast.error(error.message || "Failed to add disease")
        return false
      }

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

      // Prepare the disease data - make sure to include 'about'
      const diseaseData = {
        code: updatedDisease.code,
        name: updatedDisease.name,
        about: updatedDisease.about, // Add this line
        solution: updatedDisease.solution,
        symptoms: updatedDisease.symptoms,
      }

      // Update the disease
      const { error } = await supabase
        .from("diseases")
        .update(diseaseData)
        .eq("id", id)

      if (error) {
        console.error("Database error:", error)
        toast.error(error.message || "Failed to update disease")
        return false
      }

      toast.success("Disease updated successfully")
      await fetchDiseases() // Refresh the list
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
