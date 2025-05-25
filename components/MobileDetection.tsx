"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface MobileDetectionProps {
  children: React.ReactNode
}

export default function MobileDetection({ children }: MobileDetectionProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // Adjust the width as needed for mobile detection
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <Image
          src="/desktop.gif"
          alt="Desktop Only"
          width={300}
          height={300}
          priority
        />
        <h1 className="text-2xl font-bold text-center mt-6 mb-2">
          Please Use Desktop View
        </h1>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          This application is optimized for desktop use. Please access it from a computer or switch to desktop view in your browser for the best experience.
        </p>
        <div className="text-sm text-gray-500 text-center">
          Current screen width: {typeof window !== "undefined" ? window.innerWidth : 0}px
        </div>
      </div>
    )
  }

  return children
}