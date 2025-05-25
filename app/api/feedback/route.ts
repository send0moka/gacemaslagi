import { createClient } from "@/lib/server"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Validate request body first
    const body = await req.json()
    if (!body.message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const { userId } = await auth()
    const supabase = await createClient()
    
    // Ensure data matches the Supabase table schema
    const feedbackData = {
      is_anonymous: body.isAnonymous,
      name: body.isAnonymous ? null : body.name,
      email: body.isAnonymous ? null : body.email,
      whatsapp: body.isAnonymous ? null : body.whatsapp,
      message: body.message,
      status: 'pending',
      user_id: userId || null,
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .insert(feedbackData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "No data returned" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}