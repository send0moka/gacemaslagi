import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get counts from Supabase tables
    const [symptomsResult, diseasesResult, diagnosesResult] = await Promise.all([
      supabase.from('symptoms').select('*', { count: 'exact', head: true }),
      supabase.from('diseases').select('*', { count: 'exact', head: true }), 
      supabase.from('diagnoses').select('*', { count: 'exact', head: true })
    ])

    // Get user count from Clerk API
    const response = await fetch('https://api.clerk.com/v1/users/count', {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    const { total_count: totalUsers } = await response.json()

    return NextResponse.json({
      totalSymptoms: symptomsResult.count || 0,
      totalDiseases: diseasesResult.count || 0, 
      totalDiagnoses: diagnosesResult.count || 0,
      totalUsers: totalUsers || 0
    })

  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
