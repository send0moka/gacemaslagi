import { uploadImageToSupabase } from "@/lib/uploadImage"
import { createClient } from "@/lib/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const imageUrl = await uploadImageToSupabase(body.image)

    const { data, error } = await createClient().from("symptoms").insert([
      {
        ...body,
        image: imageUrl,
      },
    ])

    if (error) throw error

    return Response.json({ data })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}