import { useState } from "react"
import { createClient } from "@/lib/client"

export const useUploadImage = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = async (base64Image: string) => {
    try {
      setIsUploading(true)
      setError(null)

      const supabase = createClient()
      
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const fileName = `symptom-${timestamp}-${randomString}.jpg`

      const base64FileData = base64Image.replace(/^data:image\/\w+;base64,/, "")
      const buffer = Buffer.from(base64FileData, "base64")

      const { error: uploadError } = await supabase.storage
        .from("symptoms-images")
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      const { data: signedData } = await supabase.storage
        .from("symptoms-images")
        .createSignedUrl(fileName, 31536000)

      if (!signedData?.signedUrl) {
        throw new Error('Failed to generate signed URL')
      }

      return signedData.signedUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      setError(errorMessage)
      console.error("Upload error details:", err)
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadImage, isUploading, error }
}
