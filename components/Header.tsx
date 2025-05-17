"use client"

import { useEffect, useState } from "react"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Logo from "./svg/Logo"
import Link from "next/link"

const Header = () => {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setHasScrolled(scrollTop > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        hasScrolled || isMobileMenuOpen
          ? "bg-white shadow-md mt-0"
          : "bg-transparent mt-10"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/">
            <Logo
              className="w-52 h-52"
              fill={
                hasScrolled || isMobileMenuOpen || isMobile ? "black" : "white"
              }
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 -ml-14">
            {["Service", "Histories", "Resources", "About"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className={`tracking-wider font-medium transition-colors ${
                  hasScrolled
                    ? "text-gray-800 hover:text-gray-600"
                    : "text-white hover:text-gray-200"
                }`}
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Authentication Buttons */}
          <div className="hidden md:block">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className={`px-6 py-2 rounded-full border transition-colors ${
                    hasScrolled
                      ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                      : "border-white text-white hover:bg-white hover:text-gray-800"
                  }`}
                >
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "!size-12", // Force larger size with !important
                    userButtonTrigger: "!size-12", // Match avatar size
                    userButtonPopoverCard: "!min-w-[280px]", // Wider dropdown
                    userButtonPopoverFooter: "!p-4", // More padding in dropdown
                  },
                  variables: {
                    colorPrimary: "#000000", // Customize color if needed
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg
              className={`w-6 h-6 ${
                hasScrolled || isMobileMenuOpen || isMobile
                  ? "text-gray-800"
                  : "text-white"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 top-20 bg-white z-40">
              <nav className="flex flex-col p-4">
                {["Service", "Histories", "Resources", "About"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-800 hover:text-gray-600 py-3 text-lg font-medium border-b border-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="mt-4 w-full px-6 py-2 rounded-full border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="mt-4 flex justify-center">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "!size-16",
                          userButtonTrigger: "!size-16",
                          userButtonPopoverCard: "!min-w-[280px]",
                          userButtonPopoverFooter: "!p-4",
                        },
                        variables: {
                          colorPrimary: "#000000",
                        },
                      }}
                    />
                  </div>
                </SignedIn>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
