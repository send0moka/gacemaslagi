import Image from "next/image"
import Link from "next/link"

interface RightSectionProps {
  itemCount: number
}

const RightSection = ({ itemCount }: RightSectionProps) => {
  return (
    <div className="hidden min-[1516px]:flex flex-col gap-20 min-[1652px]:translate-y-6 min-[1728px]:translate-y-0">
      <div className="max-w-md min-[1728px]:-translate-y-6">
        <div className="overflow-hidden mb-4">
          <Image
            src="/discuss.webp"
            alt="Welcome"
            width={400}
            height={300}
            priority
            loading="eager"
            sizes="(max-width: 768px) 100vw, (max-width: 1172px) 90vw, 1880px"
            quality={75} // Reduced from 85
            placeholder="blur"
            blurDataURL="data:image/webp;base64,..." // Add blur placeholder
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
              <span className={i % 2 === 0 ? "text-gray-800" : "text-white"}>
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RightSection
