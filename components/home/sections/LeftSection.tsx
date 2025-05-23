import Image from "next/image"
import Link from "next/link"
import { HiPlus } from "react-icons/hi"
import Arrow from "@/components/svg/Arrow"
import ArrowLong from "@/components/svg/ArrowLong"

const LeftSection = () => {
  return (
    <div className="text-black sm:text-white flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div>
            <div className="flex items-center justify-between">
            <Link href="/counseling" className="hover:opacity-80">
              Counseling
            </Link>
            <Arrow fill="black" className="h-fit size-10 sm:hidden" />
            <Arrow fill="white" className="h-fit size-10 hidden sm:block" />
            </div>
          <div className="h-0.5 bg-black sm:bg-white opacity-50 mt-4" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Link href="/group-therapy" className="hover:opacity-80">
              Group Therapy
            </Link>
            <Arrow fill="black" className="h-fit size-10 sm:hidden" />
            <Arrow fill="white" className="h-fit size-10 hidden sm:block" />
          </div>
          <div className="h-0.5 bg-black sm:bg-white opacity-50 mt-4" />
        </div>
      </div>

      <button className="p-4 rounded-xl shadow bg-gradient-to-br from-blue-500/30 sm:from-white/60 to-transparent">
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

      <div className="min-[572px]:hidden mt-20 mb-10 z-50">
        <p className="text-sm italic mb-1 ml-4">Diagnose anxiety disorders:</p>
        <a href="#diagnosis" className="px-6 py-3 bg-blue-600 rounded-full flex items-center gap-2">
          <span className="text-white">Get Started</span>
          <ArrowLong fill="white" className="h-fit size-20" />
        </a>
      </div>
    </div>
  )
}

export default LeftSection