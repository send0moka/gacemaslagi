import ArrowLong from "@/components/svg/ArrowLong"

const CenterSection = () => {
  return (
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
        <p className="text-sm italic text-center mb-1">Diagnose anxiety disorders:</p>
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
  )
}

export default CenterSection