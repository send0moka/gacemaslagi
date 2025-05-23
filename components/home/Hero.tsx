"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import NegativeCorner from "@/components/svg/NegativeCorner"
import LeftSection from "./sections/LeftSection"
import CenterSection from "./sections/CenterSection"
import RightSection from "./sections/RightSection"

const Hero = () => {
  const [itemCount, setItemCount] = useState(7)

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setItemCount(window.innerWidth < 1880 ? 6 : 7)
      }
    }

    handleResize()

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      <div className="relative m-2 min-[1172px]:m-8 px-4 min-[572px]:px-8 pt-50 min-[572px]:pt-32 pb-4 min-[572px]:pb-0 rounded-lg min-[1172px]:rounded-3xl overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt="Hero Background"
            fill
            className="hidden sm:block object-cover transform scale-x-[-1]"
          />
        </div>

        <div className="relative z-10 flex justify-between items-center text-white">
          <LeftSection />
          <CenterSection />
          <RightSection itemCount={itemCount} />
        </div>

        <div className="hidden min-[572px]:block relative z-0 text-3xl min-[662px]:text-4xl min-[846px]:text-5xl min-[1012px]:text-6xl min-[1172px]:text-7xl -left-8">
          <NegativeCorner fill="white" />
          <div className="flex items-end">
            <h1 className="bg-white w-fit px-8 pt-4 min-[662px]:py-4 rounded-tl-[-2rem] rounded-tr-3xl rounded-br-[-2rem]">
              A Journey to
            </h1>
            <NegativeCorner fill="white" />
          </div>
          <div className="flex items-end">
            <h1 className="bg-white w-fit px-8 pb-4 rounded-tr-3xl rounded-br-[-2rem]">
              Mental Wellness
            </h1>
            <NegativeCorner fill="white" />
          </div>
        </div>
      </div>
    </>
  )
}

export default Hero
