/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Symptom, Disease } from "@/utils/types"
import Image from "next/image"
import DiagnosisResult from "./DiagnosisResult"

interface DecisionNode {
  id: number
  node_id: string
  node_type: 'symptom' | 'disease'
  parent_id: number | null
  is_yes_path: boolean | null
  children?: {
    yes: DecisionNode | null
    no: DecisionNode | null
  }
}

export default function Diagnosis() {
  const { user, isSignedIn } = useUser()
  const [currentNode, setCurrentNode] = useState<DecisionNode | null>(null)
  const [decisionTree, setDecisionTree] = useState<DecisionNode | null>(null)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<string>("")
  const [symptoms, setSymptoms] = useState<Record<string, Symptom>>({})
  const [loading, setLoading] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)  // Add this new state
  const [diseaseDetail, setDiseaseDetail] = useState<Disease | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Fetch symptoms
        const { data: symptomsData, error: symptomsError } = await supabase
          .from('symptoms')
          .select('*')
        
        if (symptomsError) throw symptomsError
        
        const symptomsMap = symptomsData.reduce((acc, symptom) => {
          acc[symptom.code] = symptom
          return acc
        }, {} as Record<string, Symptom>)
        
        setSymptoms(symptomsMap)

        // Fetch decision tree
        const { data: nodesData, error: nodesError } = await supabase
          .from('decision_nodes')
          .select('*')
          .order('created_at', { ascending: true })

        if (nodesError) throw nodesError

        const buildTree = (nodes: any[], currentNodeId: number | null = null): DecisionNode | null => {
          const currentNode = nodes.find(n => 
            currentNodeId === null ? n.parent_id === null : n.id === currentNodeId
          )
          
          if (!currentNode) return null

          const yesChild = nodes.find(n => n.parent_id === currentNode.id && n.is_yes_path === true)
          const noChild = nodes.find(n => n.parent_id === currentNode.id && n.is_yes_path === false)

          return {
            id: currentNode.id,
            node_id: currentNode.node_id,
            node_type: currentNode.node_type,
            parent_id: currentNode.parent_id,
            is_yes_path: currentNode.is_yes_path,
            children: {
              yes: yesChild ? buildTree(nodes, yesChild.id) : null,
              no: noChild ? buildTree(nodes, noChild.id) : null
            }
          }
        }

        const tree = buildTree(nodesData)
        setDecisionTree(tree)
        setLoading(false)
      } catch (error) {
        toast.error("Gagal memuat data")
        console.error(error)
      }
    }

    fetchData()
  }, [])

  const getQuestionText = (node: DecisionNode | null) => {
    if (!node) return "Mulai diagnosis?"
    return symptoms[node.node_id]?.name || "Loading..."
  }

  const handleAnswer = async (answer: boolean) => {
    if (!isSignedIn) {
      toast.error("Silakan login terlebih dahulu")
      return
    }

    if (!currentNode) return

    const newAnswers = { ...answers, [currentNode.node_id]: answer }
    setAnswers(newAnswers)

    const nextNode = answer ? currentNode.children?.yes : currentNode.children?.no

    if (nextNode?.node_type === 'disease') {
      try {
        setResult(nextNode.node_id)
        setIsComplete(true)

        const answeredSymptoms = Object.entries(newAnswers)
          .filter(([_, value]) => value === true)
          .map(([code]) => code)

        const supabase = createClient()
        
        // Fetch complete disease information
        const { data: diseaseData, error: diseaseError } = await supabase
          .from('diseases')
          .select('*')
          .eq('code', nextNode.node_id)
          .single()

        if (diseaseError) throw diseaseError
        setDiseaseDetail(diseaseData)

        // Save diagnosis
        const { error } = await supabase
          .from('diagnoses')
          .insert([{
            user_id: user?.id,
            email: user?.emailAddresses[0]?.emailAddress || null,
            symptoms: answeredSymptoms,
            disease_code: nextNode.node_id
          }])
          .select()
          .single()

        if (error) throw error

        toast.success("Diagnosis berhasil disimpan")
      } catch (error) {
        console.error("Error:", error)
        toast.error("Gagal menyimpan diagnosis")
      }
    } else if (nextNode) {
      setCurrentNode(nextNode)
    }
  }

  // Add handleStart function
  const handleStart = () => {
    setHasStarted(true)
    setCurrentNode(decisionTree)
  }

  // Modify resetDiagnosis to also reset hasStarted
  const resetDiagnosis = () => {
    setHasStarted(false)
    setCurrentNode(null)
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
    <section id="diagnosis" className="max-w-2xl mx-auto p-8 min-h-dvh flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-8 text-center">
        Diagnosis Gangguan Kecemasan
      </h2>

      <div className="bg-card p-6 rounded-lg shadow-lg">
        {!hasStarted ? (
          <div className="text-center">
            <p className="text-lg mb-6">
              Selamat datang di sistem diagnosis gangguan kecemasan. 
              Kami akan membantu Anda mengidentifikasi gejala-gejala yang Anda alami.
            </p>
            <Button 
              onClick={handleStart}
              variant="default"
              size="lg"
            >
              Mulai Diagnosis
            </Button>
          </div>
        ) : !isComplete ? (
          <>
            {currentNode && currentNode.node_id !== "start" && (
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 mb-2">
                {currentNode.node_id}
              </span>
            )}
            <p className="text-lg mb-6">{getQuestionText(currentNode)}</p>
            {currentNode && symptoms[currentNode.node_id]?.description && (
              <p className="text-sm text-muted-foreground mb-6">
                {symptoms[currentNode.node_id].description}
              </p>
            )}
            {currentNode && symptoms[currentNode.node_id]?.image && (
              <Image 
                src={symptoms[currentNode.node_id].image}
                alt={symptoms[currentNode.node_id].name}
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
        ) : diseaseDetail ? (
          <DiagnosisResult
            disease={diseaseDetail}
            answers={answers}  // Pass the full answers object instead of filtered symptoms
            symptoms={symptoms}
            onReset={resetDiagnosis}
          />
        ) : null}
      </div>
    </section>
  )
}