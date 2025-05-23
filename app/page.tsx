/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Hero from "@/components/home/Hero"
import Diagnosis from "@/components/home/Diagnosis"
import Statistics from "@/components/home/Statistics"
import PublicLayout from "@/components/PublicLayout"

const SUPER_ADMIN_EMAIL = "jehian.zuhry@mhs.unsoed.ac.id"

export default async function Home() {
  const [session, user] = await Promise.all([
    auth(),
    currentUser()
  ])

  const userEmail = user?.emailAddresses[0]?.emailAddress
  const isAdminRoute = false
  
  if (isAdminRoute && userEmail === SUPER_ADMIN_EMAIL) {
    redirect("/admin")
  }

  return (
    <PublicLayout>
      <Hero />
      <Diagnosis />
      <Statistics />
    </PublicLayout>
  )
}
