"use client"

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"

interface AuthButtonsClientProps {
  hasScrolled: boolean
  isMobile?: boolean
  isAdmin: boolean
}

export const AuthButtonsClient = ({ hasScrolled, isMobile, isAdmin }: AuthButtonsClientProps) => {
  // Add debug log
  console.log("AuthButtonsClient:", { isAdmin, hasScrolled, isMobile })

  const userButtonAppearance = {
    elements: {
      avatarBox: isMobile ? "!size-16" : "!size-12",
      userButtonTrigger: isMobile ? "!size-16" : "!size-12",
      userButtonPopoverCard: "!min-w-[280px]",
      userButtonPopoverFooter: "!p-4",
    },
    variables: {
      colorPrimary: "#000000",
    },
  }

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className={`
              ${isMobile ? "mt-4 w-full" : ""} 
              px-6 py-2 rounded-full border transition-colors
              ${hasScrolled
                ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                : "border-white text-white hover:bg-white hover:text-gray-800"
              }
            `}
          >
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className={`${isMobile ? "mt-4" : ""} flex items-center gap-4`}>
          {isAdmin && (
            <Link
              href="/admin"
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${hasScrolled
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  : "bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              Admin Panel
            </Link>
          )}
          <UserButton
            afterSignOutUrl="/"
            appearance={userButtonAppearance}
          />
        </div>
      </SignedIn>
    </>
  )
}