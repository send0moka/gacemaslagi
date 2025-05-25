"use client"

import { useEffect } from 'react'
import { useDecisionTree } from '@/hooks/useDecisionTree'
import DecisionTreeVisualization from '../DecisionTreeVisualization'

export default function DecisionTreeSection() {
  const { tree, loading, fetchTree } = useDecisionTree()

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  return (
    <section id='resources' className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Resources
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Berikut adalah visualisasi pohon keputusan yang digunakan dalam sistem diagnosis kami
        </p>
        {/* Add overflow container */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-max">
            <DecisionTreeVisualization tree={tree} loading={loading} />
          </div>
        </div>
      </div>
    </section>
  )
}