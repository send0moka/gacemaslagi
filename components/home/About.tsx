import Image from "next/image"

const teamMembers = [
  {
    name: "Jehian Athaya Tsani Az Zuhry",
    nim: "H1D022006",
    image: "/team/jehian.png",
  },
  {
    name: "Dzakwan Irfan Ramdhani",
    nim: "H1D022043",
    image: "/team/dzakwan.png",
  },
  {
    name: "Amarramitha Poodja Thantawi",
    nim: "H1D022064",
    image: "/team/amarra.png",
  },
  {
    name: "Hamas Izzuddin Fathi",
    nim: "H1D022097",
    image: "/team/hamas.png",
  },
  {
    name: "Eka Bintang Wicaksono",
    nim: "H1D023054",
    image: "/team/eka.png",
  },
]

export default function TeamSection() {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          #PejuangGaCemasLagi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="relative w-full h-40 mb-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">
                {member.name}
              </h3>
              <p className="text-blue-600 text-sm mb-2">{member.nim}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
