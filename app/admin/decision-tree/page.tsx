"use client"

import { useEffect, useState } from 'react'
import { useDecisionTree } from '@/hooks/useDecisionTree'
import { DecisionNode } from '@/utils/types'

export default function DecisionTreePage() {
  const { tree, loading, fetchTree, addNode } = useDecisionTree()
  const [newNodeId, setNewNodeId] = useState('')
  const [selectedParent, setSelectedParent] = useState<{
    id: number | null,
    path: 'yes' | 'no' | null
  }>({ id: null, path: null })

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  const handleAddNode = async () => {
    if (!newNodeId) {
      return
    }

    const nodeType = newNodeId.startsWith('G') ? 'symptom' : 'disease'
    await addNode(
      newNodeId,
      nodeType,
      selectedParent.id,
      selectedParent.path === 'yes' ? true : selectedParent.path === 'no' ? false : null
    )
    setNewNodeId('')
    setSelectedParent({ id: null, path: null })
  }

  const TreeNode = ({ node }: { node: DecisionNode }) => (
    <div className="flex flex-col items-center">
      <div
        className={`
          ${node.node_type === 'symptom' ? 'rounded-full' : 'rounded-md'}
          w-16 h-16 border-2 border-gray-400 
          flex items-center justify-center
          bg-white cursor-pointer
          hover:border-blue-500
        `}
      >
        {node.node_id}
      </div>
      
      {node.node_type === 'symptom' && (
        <div className="flex gap-20 mt-4">
          <div className="flex flex-col items-center">
            <div className="h-8 border-l-2 border-gray-400"></div>
            <div className="text-sm text-gray-500">Yes</div>
            {node.children?.yes ? (
              <TreeNode node={node.children.yes} />
            ) : (
              <button
                className="mt-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => setSelectedParent({ id: node.id, path: 'yes' })}
              >
                + Add Node
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <div className="h-8 border-l-2 border-gray-400"></div>
            <div className="text-sm text-gray-500">No</div>
            {node.children?.no ? (
              <TreeNode node={node.children.no} />
            ) : (
              <button
                className="mt-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => setSelectedParent({ id: node.id, path: 'no' })}
              >
                + Add Node
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Decision Tree Builder</h1>
      
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          value={newNodeId}
          onChange={(e) => setNewNodeId(e.target.value.toUpperCase())}
          placeholder="Enter node ID (e.g., G01, P01)"
          className="border p-2 rounded"
        />
        <button
          onClick={handleAddNode}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Add Node
        </button>
      </div>

      <div className="border rounded-lg p-8 bg-gray-50">
        {loading ? (
          <div>Loading...</div>
        ) : tree ? (
          <TreeNode node={tree} />
        ) : (
          <button
            className="p-4 bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => setSelectedParent({ id: null, path: null })}
          >
            + Start Tree
          </button>
        )}
      </div>
    </div>
  )
}