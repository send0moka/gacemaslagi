import { Disease, Symptom } from "@/utils/types"
import SolutionRenderer from "../admin/SolutionRenderer"

interface DiagnosisResultProps {
  disease: Disease
  answeredSymptoms: string[]
  symptoms: Record<string, Symptom>
  onReset: () => void
}

export default function DiagnosisResult({
  disease,
  answeredSymptoms,
  symptoms,
  onReset,
}: DiagnosisResultProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold mb-2">Hasil Diagnosis</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
            {disease.code}
          </span>
          <span className="text-lg font-medium">{disease.name}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Tentang Penyakit</h4>
          <p className="text-gray-700 text-justify">{disease.about}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Gejala Yang Anda Alami</h4>
          <ul className="list-disc pl-5 space-y-1">
            {answeredSymptoms.map((code) => (
              <li key={code} className="text-gray-700">
                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 mr-1">
                  {symptoms[code]?.code}
                </span>
                <span>{symptoms[code]?.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Semua Gejala {disease.name}</h4>
          <ul className="list-disc pl-5 space-y-1">
            {disease.symptoms.map((symptomId) => {
              const symptom = Object.values(symptoms).find(
                (s) => s.id === symptomId
              )
              return (
                <li key={symptomId} className="text-gray-700">
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 mr-1">
                    {symptom?.code}
                  </span>
                  <span>{symptom?.name}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Solusi & Penanganan</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <SolutionRenderer
              solution={disease.solution}
              onImageClick={() => {}}
              fileNames={{}}
            />
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Mulai Diagnosis Baru
        </button>
      </div>
    </div>
  )
}
