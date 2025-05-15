"use client"

import Image from "next/image"
import Link from "next/link"
import { HiPlus } from "react-icons/hi"
import NegativeCorner from "@/components/svg/NegativeCorner"
import Arrow from "@/components/svg/Arrow"
import ArrowLong from "@/components/svg/ArrowLong"
import { useState, useEffect } from 'react'

const Hero = () => {
  const [itemCount, setItemCount] = useState(7)

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setItemCount(window.innerWidth < 1880 ? 6 : 7)
      }
    }
    
    handleResize()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="relative m-2 min-[1172px]:m-8 px-4 min-[572px]:px-8 pt-50 min-[572px]:pt-32 pb-4 min-[572px]:pb-0 rounded-lg min-[1172px]:rounded-3xl overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.png"
          alt="Hero Background"
          fill
          className="object-cover transform scale-x-[-1]"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex justify-between items-center text-white">
        {/* Left Section */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Link href="/counseling" className=" hover:opacity-80">
                  Counseling
                </Link>
                <Arrow fill="white" className="h-fit size-10" />
              </div>
              <div className="h-0.5 bg-white opacity-50 mt-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Link href="/group-therapy" className="hover:opacity-80">
                  Group Therapy
                </Link>
                <Arrow fill="white" className="h-fit size-10" />
              </div>
              <div className="h-0.5 bg-white opacity-50 mt-4" />
            </div>
          </div>

          <button className="p-4 rounded-xl shadow bg-gradient-to-br from-white/60 to-transparent">
            <div className="text-left">
              <p className="font-semibold">Join our active healthy community</p>
              <p>As easy as a click away</p>
              <div className="flex items-center justify-between mt-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                    >
                      <Image
                        src={`/avatars/avatar-${i}.png`}
                        alt={`Avatar ${i}`}
                        width={40}
                        height={40}
                      />
                    </div>
                  ))}
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <HiPlus className="text-xl text-[#84adca]" />
                </div>
              </div>
            </div>
          </button>

          <div className="min-[572px]:hidden mt-20 mb-10">
            <p className="text-sm italic mb-1 ml-4">
              Diagnose anxiety disorders:
            </p>
            <button className="px-6 py-3 bg-blue-600 rounded-full flex items-center gap-2">
              <span>Get Started</span>
              <ArrowLong fill="white" className="h-fit size-20" />
            </button>
          </div>
        </div>

        {/* Center Section */}
        <div className="">
          <div className="hidden min-[1172px]:block not-first:relative -left-[26rem] min-[1350px]:-left-[29rem] min-[1516px]:left-12 min-[1710px]:left-24 bottom-20 min-[1350px]:bottom-28">
            <div className="flex items-center gap-4">
              <div className="px-6 py-3 rounded-full bg-gradient-to-br from-white/60 to-trasnparent shadow">
                <p>Healthy Mind</p>
              </div>
              <div>
                <div className="animate-ping absolute size-5 bg-white/70 rounded-full" />
                <div className="size-5 bg-white/70 rounded-full" />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-40 min-[1516px]:-bottom-20 right-0 min-[1516px]:right-1/2 mb-14 min-[662px]:mb-8 min-[846px]:mb-4 min-[1010px]:mb-0">
            <p className="text-sm italic text-center mb-1">
              Diagnose anxiety disorders:
            </p>
            <button className="px-6 py-3 bg-blue-600 rounded-full flex items-center gap-2">
              <span>Get Started</span>
              <ArrowLong fill="white" className="h-fit size-20" />
            </button>
          </div>

          <div className="hidden min-[1172px]:block relative -left-60 min-[1516px]:left-52 min-[1710px]:left-96 top-52 min-[1410px]:top-64">
            <div className="flex items-center gap-4">
              <div>
                <div className="animate-ping absolute size-5 bg-white/70 rounded-full" />
                <div className="size-5 bg-white/70 rounded-full" />
              </div>
              <div className="px-6 py-3 rounded-full bg-gradient-to-br from-white/60 to-trasnparent shadow">
                <p>Healthy Body</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Section */}
        <div className="hidden min-[1516px]:flex flex-col gap-20 min-[1652px]:translate-y-6 min-[1728px]:translate-y-0">
          <div className="max-w-md min-[1728px]:-translate-y-6">
            <div className="overflow-hidden mb-4">
              <Image
                src="/discuss.jpg"
                alt="Welcome"
                width={400}
                height={300}
                className="object-cover rounded-xl w-72 min-[1746px]:w-80 min-[1880px]:w-[25rem]"
              />
            </div>
            <h2 className="text-xl min-[1746px]:text-2xl font-semibold mb-1">
              Welcome to Ga Cemas Lagi!
            </h2>
            <p className="text-white/80 w-72 min-[1764px]:w-96 min-[1880px]:w-full">
              Join us our transformative journey towards lasting peace
            </p>
          </div>

          <div className="bg-gradient-to-br from-white/80 to-transparent p-6 rounded-xl translate-y-14">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Book Schedule</h3>
              <Link href="/schedule" className="hover:opacity-80">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-6 min-[1880px]:grid-cols-7 gap-2">
              {Array.from({ length: itemCount }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    i % 2 === 0 ? "bg-white" : "border border-white"
                  }`}
                >
                  <span
                    className={i % 2 === 0 ? "text-gray-800" : "text-white"}
                  >
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden min-[572px]:block relative z-20 text-3xl min-[662px]:text-4xl min-[846px]:text-5xl min-[1012px]:text-6xl min-[1172px]:text-7xl -left-8">
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
  )
}

export default Hero
