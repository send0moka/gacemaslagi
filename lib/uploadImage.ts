import { createClient } from "@/lib/client"

export const uploadImageToSupabase = async (base64Image: string) => {
  try {
    // Remove the data:image/jpeg;base64, prefix
    const base64FileData = base64Image.replace(/^data:image\/\w+;base64,/, "")

    // Convert base64 to buffer
    const buffer = Buffer.from(base64FileData, "base64")

    // Generate unique filename
    const fileName = `symptom-${Date.now()}.jpg`

    // Upload to Supabase Storage
    const { error } = await createClient().storage
      .from("symptoms-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
      })

    if (error) {
      throw new Error("Error uploading image: " + error.message)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = createClient().storage.from("symptoms-images").getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}