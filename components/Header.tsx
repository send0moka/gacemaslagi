"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Logo from "./svg/Logo"
import { NavLinks } from "./header/NavLinks"
import { AuthButtons } from "./header/AuthButtons"
import { MobileMenuButton } from "./header/MobileMenu"

const Header = () => {
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

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

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

          <nav className="hidden md:flex items-center space-x-8 -ml-14">
            <NavLinks hasScrolled={hasScrolled} />
          </nav>

          <div className="hidden md:block">
            <AuthButtons hasScrolled={hasScrolled} />
          </div>

          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onToggle={toggleMobileMenu}
            hasScrolled={hasScrolled}
            isMobile={isMobile}
          />

          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 top-20 bg-white z-40">
              <nav className="flex flex-col p-4">
                <NavLinks
                  hasScrolled={hasScrolled}
                  isMobile={true}
                  onItemClick={() => setIsMobileMenuOpen(false)}
                />
                <AuthButtons hasScrolled={hasScrolled} isMobile={true} />
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
