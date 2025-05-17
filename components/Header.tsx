import { auth } from "@clerk/nextjs/server"
import { HeaderClient } from "./header/HeaderClient"

export default async function Header() {
  const session = await auth()
  
  // Get admin ID from environment variable
  const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID
  
  // Debug with more information
  console.log("Header Debug:", {
    userId: session.userId,
    adminId: adminUserId,
    isAdmin: session.userId === adminUserId,
    env: process.env.NODE_ENV
  })

  const isAdmin = session.userId === adminUserId

  return <HeaderClient isAdmin={!!isAdmin} />
}