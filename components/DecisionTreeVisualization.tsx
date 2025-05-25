"use client"

import { DecisionNode } from '@/utils/types'
import { BadgeCheck } from 'lucide-react' // Add this import

interface TreeVisualizationProps {
  tree: DecisionNode | null
  loading?: boolean
  readonly?: boolean
}

export default function DecisionTreeVisualization({ tree, loading, readonly = true }: TreeVisualizationProps) {
  const TreeNode = ({ node }: { node: DecisionNode }) => (
    <div className="flex flex-col items-center">
      <div
        className={`
          ${node.node_type === 'symptom' ? 'rounded-full' : 'rounded-md'}
          w-16 h-16 border-2 border-gray-400
          flex items-center justify-center
          bg-white
          ${!readonly && 'cursor-pointer hover:border-blue-500'}
          relative
        `}
      >
        {node.node_id}
      </div>

      {node.node_type === 'symptom' && (
        <div className="flex flex-col items-center w-full">
          <div className="w-[2px] h-8 bg-gray-400"></div>
          
          <div className="flex gap-20 relative">
            <div className="absolute top-0 left-[-40px] right-[-40px] h-[2px] bg-gray-400"></div>

            <div className="flex flex-col items-center">
              <div className="w-[2px] h-8 bg-gray-400"></div>
              <span className="text-sm text-gray-500 mb-2">Yes</span>
              {node.children?.yes && <TreeNode node={node.children.yes} />}
            </div>

            <div className="flex flex-col items-center">
              <div className="w-[2px] h-8 bg-gray-400"></div>
              <span className="text-sm text-gray-500 mb-2">No</span>
              {node.children?.no && <TreeNode node={node.children.no} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-w-[500px] h-[300px] flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!tree) {
    return (
      <div className="min-w-[500px] h-[300px] flex items-center justify-center">
        No decision tree data available
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-8 bg-gray-50 relative min-w-[500px]">
      <TreeNode node={tree} />
      
      {/* Verified Badge */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border shadow-sm">
        <BadgeCheck className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-gray-700">
          Verified By Experts
        </span>
      </div>
    </div>
  )
}