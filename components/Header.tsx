import { auth } from "@clerk/nextjs/server"
import { HeaderClient } from "./header/HeaderClient"

// Get admin ID from environment variable for better security
const ADMIN_USER_ID = "user_2xABCQVA2rFVVYkZS4CxWkNOJi9"

export default async function Header() {
  const session = await auth()
  
  // Debug with more information
  console.log("Header Debug:", {
    userId: session.userId,
    isAdmin: session.userId === ADMIN_USER_ID
  })

  const isAdmin = session.userId === ADMIN_USER_ID

  return <HeaderClient isAdmin={!!isAdmin} />
}