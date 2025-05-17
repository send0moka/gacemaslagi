import { auth } from "@clerk/nextjs/server"

export async function getAuthStatus() {
  const { userId, sessionClaims } = await auth()
  const isAdmin = sessionClaims?.email === "jehian.zuhry@mhs.unsoed.ac.id"
  
  return {
    userId,
    isAdmin
  }
}