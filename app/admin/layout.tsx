import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { createClient } from "@/lib/client"
import { headers } from "next/headers"

const SUPER_ADMIN_EMAIL = "jehian.zuhry@mhs.unsoed.ac.id"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, user] = await Promise.all([auth(), currentUser()])
  
  if (!session.userId || !user) {
    redirect("/")
  }

  const userEmail = user.emailAddresses[0]?.emailAddress
  
  if (!userEmail) {
    redirect("/")
  }

  const headersList = headers()
  const pathname = (await headersList).get("x-invoke-path") || ""
  
  if (pathname === "/admin/users") {
    if (userEmail !== SUPER_ADMIN_EMAIL) {
      redirect("/admin")
    }
  }

  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL

  const supabase = createClient()
  const { data: userData } = await supabase
    .from('users')
    .select('is_expert')
    .eq('email', userEmail)
    .single()

  const isExpert = userData?.is_expert || false

  if (!isSuperAdmin && !userData) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar isSuperAdmin={isSuperAdmin} isExpert={isExpert} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}