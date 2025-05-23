"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Symptom } from "@/utils/types"
import Image from "next/image"
import { PostgrestError } from "@supabase/supabase-js"

interface DecisionNode {
  code: string
  yesNext: string | null
  noNext: string | null
  result?: string
}

const decisionTree: Record<string, DecisionNode> = {
  "start": {
    code: "start",
    yesNext: "G01",
    noNext: null
  },
  "G01": {
    code: "G01",
    yesNext: "G02",
    noNext: "G24"
  },
  "G02": {
    code: "G02",
    yesNext: "result_P01",
    noNext: "G06"
  },
  "G06": {
    code: "G06",
    yesNext: "result_P02",
    noNext: "G10"
  },
  "G10": {
    code: "G10",
    yesNext: "result_P03",
    noNext: "G14"
  },
  "G14": {
    code: "G14",
    yesNext: "result_P04",
    noNext: "G16"
  },
  "G16": {
    code: "G16",
    yesNext: "G19",
    noNext: "result_P07"
  },
  "G19": {
    code: "G19",
    yesNext: "result_P05",
    noNext: "result_P06"
  },
  "G24": {
    code: "G24",
    yesNext: "result_P08",
    noNext: "result_P09"
  }
}

export default function Diagnosis() {
  const { user, isSignedIn } = useUser()
  const [currentQuestion, setCurrentQuestion] = useState<string>("start")
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<string>("")
  const [symptoms, setSymptoms] = useState<Record<string, Symptom>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('symptoms')
          .select('*')
        
        if (error) throw error
        
        const symptomsMap = data.reduce((acc, symptom) => {
          acc[symptom.code] = symptom
          return acc
        }, {} as Record<string, Symptom>)
        
        setSymptoms(symptomsMap)
        setLoading(false)
      } catch (error) {
        toast.error("Gagal memuat data gejala")
        console.error(error)
      }
    }

    fetchSymptoms()
  }, [])

  const getQuestionText = (code: string) => {
    if (code === "start") return "Mulai diagnosis?"
    return symptoms[code]?.name || "Loading..."
  }

  const handleAnswer = async (answer: boolean) => {
    if (!isSignedIn) {
      toast.error("Silakan login terlebih dahulu")
      return
    }

    const newAnswers = { ...answers, [currentQuestion]: answer }
    setAnswers(newAnswers)

    const current = decisionTree[currentQuestion]
    const nextQuestion = answer ? current.yesNext : current.noNext

    if (nextQuestion?.startsWith("result_")) {
      try {
        const diseaseCode = nextQuestion.replace("result_", "")
        setResult(diseaseCode)
        setIsComplete(true)

        const answeredSymptoms = Object.entries(newAnswers)
          .filter(([code, value]) => code !== 'start' && value === true)
          .map(([code]) => code)

        const supabase = createClient()
        
        console.log('Saving diagnosis with data:', {
          user_id: user?.id,
          symptoms: answeredSymptoms,
          disease_code: diseaseCode
        })

        const { data, error } = await supabase
          .from('diagnoses')
          .insert([{
            user_id: user?.id,
            email: user?.emailAddresses[0]?.emailAddress || null,
            symptoms: answeredSymptoms,
            disease_code: diseaseCode
          }])
          .select()
          .single()

        if (error) {
          console.error('Supabase error details:', error)
          throw error
        }

        console.log('Diagnosis saved successfully:', data)
        toast.success("Diagnosis berhasil disimpan")
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error saving diagnosis:", {
            message: error.message,
            details: (error as PostgrestError)?.details,
            hint: (error as PostgrestError)?.hint
          })
          toast.error(`Gagal menyimpan diagnosis: ${error.message}`)
        } else {
          console.error("Unknown error:", error)
          toast.error("Gagal menyimpan diagnosis: Terjadi kesalahan")
        }
      }
    } else if (nextQuestion) {
      setCurrentQuestion(nextQuestion)
    }
  }

  const resetDiagnosis = () => {
    setCurrentQuestion("start")
    setAnswers({})
    setIsComplete(false)
    setResult("")
  }

  if (!isSignedIn) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Diagnosis Gangguan Kecemasan</h2>
        <p>Silakan login terlebih dahulu untuk memulai diagnosis</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Memuat data...</p>
      </div>
    )
  }

  return (
    <section className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-8 text-center">
        Diagnosis Gangguan Kecemasan
      </h2>

      <div className="bg-card p-6 rounded-lg shadow-lg">
        {!isComplete ? (
          <>
            {currentQuestion !== "start" && (
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 mb-2">
                {currentQuestion}
              </span>
            )}
            <p className="text-lg mb-6">{getQuestionText(currentQuestion)}</p>
            {symptoms[currentQuestion]?.description && (
              <p className="text-sm text-muted-foreground mb-6">
                {symptoms[currentQuestion].description}
              </p>
            )}
            {symptoms[currentQuestion]?.image && (
              <Image 
                src={symptoms[currentQuestion].image}
                alt={symptoms[currentQuestion].name}
                width={500}
                height={300}
                className="w-full max-w-md mx-auto mb-6 rounded-lg"
              />
            )}
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => handleAnswer(true)}
                variant="default"
              >
                Ya
              </Button>
              <Button
                onClick={() => handleAnswer(false)}
                variant="outline"
              >
                Tidak
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">
              Hasil Diagnosis: {result}
            </h3>
            <Button onClick={resetDiagnosis}>
              Mulai Diagnosis Baru
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}