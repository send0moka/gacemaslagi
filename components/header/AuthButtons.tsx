"use client"

import { auth } from "@clerk/nextjs/server"
import { AuthButtonsClient } from "./AuthButtonsClient"

interface AuthButtonsProps {
  hasScrolled: boolean
  isMobile?: boolean
}

export async function AuthButtons({ hasScrolled, isMobile }: AuthButtonsProps) {
  const { sessionClaims } = await auth()
  const isAdmin = sessionClaims?.email === "jehian.zuhry@mhs.unsoed.ac.id"

  return (
    <AuthButtonsClient 
      hasScrolled={hasScrolled}
      isMobile={isMobile}
      isAdmin={isAdmin}
    />
  )
}
