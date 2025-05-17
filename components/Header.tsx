import { auth, currentUser } from "@clerk/nextjs/server"
import { HeaderClient } from "./header/HeaderClient"
import { createClient } from "@/lib/client"

export default async function Header() {
  const [session, user] = await Promise.all([auth(), currentUser()])
  
  // Get super admin email from environment variable
  const SUPER_ADMIN_EMAIL = "jehian.zuhry@mhs.unsoed.ac.id"
  
  if (!session.userId || !user) {
    return <HeaderClient isAdmin={false} />
  }

  const userEmail = user.emailAddresses[0]?.emailAddress

  if (!userEmail) {
    return <HeaderClient isAdmin={false} />
  }

  // Check if super admin
  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL

  // Check if user is expert or operator
  const supabase = createClient()
  const { data: userData } = await supabase
    .from('users')
    .select('is_expert')
    .eq('email', userEmail)
    .single()

  // User has admin access if they are super admin OR if they exist in the users table
  const hasAdminAccess = isSuperAdmin || userData !== null

  // Debug with more information
  console.log("Header Debug:", {
    userEmail,
    isSuperAdmin,
    userData,
    hasAdminAccess
  })

  return <HeaderClient isAdmin={hasAdminAccess} />
}