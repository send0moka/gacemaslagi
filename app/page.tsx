/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Hero from "@/components/home/Hero"
import Diagnosis from "@/components/home/Diagnosis"
import Histories from "@/components/home/Histories"
import PublicLayout from "@/components/PublicLayout"
import Numbers from "@/components/home/Numbers"
import DecisionTreeSection from "@/components/home/DecisionTreeSection"
import About from "@/components/home/About"
import Footer from "@/components/Footer"

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
      <Numbers />
      <Diagnosis />
      <Histories />
      <DecisionTreeSection />
      <About />
      <Footer />
    </PublicLayout>
  )
}
