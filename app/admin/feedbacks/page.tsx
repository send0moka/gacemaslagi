import { createClient } from "@/lib/server"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Feedback } from "@/utils/types"
import FeedbackTable from "@/components/admin/FeedbackTable"

const SUPER_ADMIN_EMAIL = "jehian.zuhry@mhs.unsoed.ac.id"

export default async function FeedbacksPage() {
  const user = await currentUser()
  const supabase = await createClient()

  const userEmail = user?.emailAddresses[0]?.emailAddress
  
  // If super admin, grant immediate access
  if (userEmail === SUPER_ADMIN_EMAIL) {
    const { data: feedbacks } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false })

    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Manage Feedbacks</h1>
        <FeedbackTable feedbacks={feedbacks as Feedback[]} />
      </div>
    )
  }

  // For other users, check if they are non-expert (operator)
  const { data: dbUser } = await supabase
    .from("users")
    .select("is_expert")
    .eq("email", userEmail)
    .single()

  if (!dbUser || dbUser.is_expert) {
    redirect("/")
  }

  const { data: feedbacks } = await supabase
    .from("feedbacks")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Feedbacks</h1>
      <FeedbackTable feedbacks={feedbacks as Feedback[]} />
    </div>
  )
}