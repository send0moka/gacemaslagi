import { NumberTicker } from "../magicui/number-ticker"

async function getStats() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/statistics`,
      {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      }
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      totalSymptoms: 0,
      totalDiseases: 0,
      totalDiagnoses: 0,
      totalUsers: 0,
    }
  }
}

export default async function Numbers() {
  const stats = await getStats()
  const { totalSymptoms, totalDiseases, totalDiagnoses, totalUsers } = stats

  return (
    <div className="flex justify-center items-center w-full">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-4xl mx-auto px-4">
        {/* Total Gejala */}
        <div className="flex flex-col items-center justify-center p-4">
          <dt className="text-lg font-medium text-gray-600">Total Gejala</dt>
          <dd className="mt-2">
            <NumberTicker
              value={totalSymptoms}
              className="text-5xl font-bold text-slate-900"
            />
          </dd>
        </div>

        {/* Total Penyakit */}
        <div className="flex flex-col items-center justify-center p-4">
          <dt className="text-lg font-medium text-gray-600">Total Penyakit</dt>
          <dd className="mt-2">
            <NumberTicker
              value={totalDiseases}
              className="text-5xl font-bold text-slate-900"
            />
          </dd>
        </div>

        {/* Total Diagnosis */}
        <div className="flex flex-col items-center justify-center p-4">
          <dt className="text-lg font-medium text-gray-600">Total Diagnosis</dt>
          <dd className="mt-2">
            <NumberTicker
              value={totalDiagnoses}
              className="text-5xl font-bold text-slate-900"
            />
          </dd>
        </div>

        {/* Total Pengguna */}
        <div className="flex flex-col items-center justify-center p-4">
          <dt className="text-lg font-medium text-gray-600">Total Pengguna</dt>
          <dd className="mt-2">
            <NumberTicker
              value={totalUsers}
              className="text-5xl font-bold text-slate-900"
            />
          </dd>
        </div>
      </div>
    </div>
  )
}
