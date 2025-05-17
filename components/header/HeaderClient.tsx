"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Logo from "../svg/Logo"
import { NavLinks } from "./NavLinks"
import { AuthButtonsClient } from "./AuthButtonsClient"

interface HeaderClientProps {
  isAdmin: boolean
}

export function HeaderClient({ isAdmin }: HeaderClientProps) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
              fill={hasScrolled || isMobileMenuOpen || isMobile ? "black" : "white"}
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 -ml-14">
            <NavLinks hasScrolled={hasScrolled} />
          </nav>

          <div className="hidden md:block">
            <AuthButtonsClient 
              hasScrolled={hasScrolled} 
              isMobile={isMobile}
              isAdmin={isAdmin}
            />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg
              className={`w-6 h-6 ${
                hasScrolled || isMobileMenuOpen
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
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 top-20 bg-white z-40">
              <nav className="flex flex-col p-4">
                <NavLinks 
                  hasScrolled={hasScrolled} 
                  isMobile={true} 
                />
                <AuthButtonsClient 
                  hasScrolled={hasScrolled} 
                  isMobile={true}
                  isAdmin={isAdmin}
                />
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}