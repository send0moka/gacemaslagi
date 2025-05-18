import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import { Symptom } from "@/utils/types"

export function useSymptomsData() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const supabase = createClient()

  const fetchSymptoms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("symptoms")
        .select("id, code, name")

      if (error) {
        console.error("Error fetching symptoms:", error.message)
        throw error
      }
      setSymptoms(data || [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to fetch symptoms")
    }
  }, [supabase])

  useEffect(() => {
    fetchSymptoms()
  }, [fetchSymptoms])

  return { symptoms }
}
