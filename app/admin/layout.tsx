import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"

const SUPER_ADMIN_EMAIL = "jehian.zuhry@mhs.unsoed.ac.id"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, user] = await Promise.all([
    auth(),
    currentUser()
  ])
  
  console.log("Admin layout debug:", {
    userId: session.userId,
    claims: session.sessionClaims,
    userEmail: user?.emailAddresses[0]?.emailAddress
  })

  if (!session.userId || !user) {
    console.log("No user ID found, redirecting to home")
    redirect("/")
  }

  const userEmail = user.emailAddresses[0]?.emailAddress

  if (!userEmail) {
    console.log("No email found, redirecting to home")
    redirect("/")
  }

  if (userEmail !== SUPER_ADMIN_EMAIL) {
    console.log(`Email ${userEmail} is not super admin, redirecting to home`)
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}