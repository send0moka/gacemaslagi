"use client"

import { useEffect, useState } from 'react'
import { useDecisionTree } from '@/hooks/useDecisionTree'
import { DecisionNode } from '@/utils/types'

export default function DecisionTreePage() {
  const { tree, loading, fetchTree, addNode, updateNode } = useDecisionTree()
  const [newNodeId, setNewNodeId] = useState('')
  const [isStartActive, setIsStartActive] = useState(false)
  const [isAddNodeActive, setIsAddNodeActive] = useState(false)
  const [editingNode, setEditingNode] = useState<DecisionNode | null>(null)
  const [selectedParent, setSelectedParent] = useState<{
    id: number | null,
    path: 'yes' | 'no' | null
  }>({ id: null, path: null })

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  const handleAddNodeClick = (nodeId: number, path: 'yes' | 'no') => {
    setSelectedParent({ id: nodeId, path })
    setIsAddNodeActive(true)
    setIsStartActive(false) // Disable start mode when add node is clicked
  }

  const handleAddNode = async () => {
    if (!newNodeId || !isAddNodeActive) {
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
    setIsAddNodeActive(false)
  }

  const handleStartTree = () => {
    setIsStartActive(true)
    setSelectedParent({ id: null, path: null })
  }

  const handleNodeClick = (node: DecisionNode) => {
    setEditingNode(node)
    setNewNodeId(node.node_id)
    setIsAddNodeActive(false)
    setIsStartActive(false)
  }

  const handleUpdate = async () => {
    if (!editingNode || !newNodeId) return

    await updateNode(editingNode.id, newNodeId)
    setNewNodeId('')
    setEditingNode(null)
  }

  const TreeNode = ({ node }: { node: DecisionNode }) => (
    <div className="flex flex-col items-center">
      <div
        onClick={() => handleNodeClick(node)}
        className={`
          ${node.node_type === 'symptom' ? 'rounded-full' : 'rounded-md'}
          w-16 h-16 border-2 
          ${editingNode?.id === node.id ? 'border-blue-500' : 'border-gray-400'}
          flex items-center justify-center
          bg-white cursor-pointer
          hover:border-blue-500
          relative
        `}
      >
        {node.node_id}
      </div>

      {node.node_type === 'symptom' && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical line from parent */}
          <div className="w-[2px] h-8 bg-gray-400"></div>
          
          {/* Container for branches */}
          <div className="flex gap-20 relative">
            {/* Horizontal connecting line */}
            <div className="absolute top-0 left-[-40px] right-[-40px] h-[2px] bg-gray-400"></div>

            {/* Left branch (Yes) */}
            <div className="flex flex-col items-center">
              <div className="w-[2px] h-8 bg-gray-400"></div>
              <span className="text-sm text-gray-500 mb-2">Yes</span>
              {node.children?.yes ? (
                <TreeNode node={node.children.yes} />
              ) : (
                <button
                  className={`p-2 rounded ${
                    isAddNodeActive && selectedParent.id === node.id && selectedParent.path === 'yes'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handleAddNodeClick(node.id, 'yes')}
                >
                  + Add Node
                </button>
              )}
            </div>

            {/* Right branch (No) */}
            <div className="flex flex-col items-center">
              <div className="w-[2px] h-8 bg-gray-400"></div>
              <span className="text-sm text-gray-500 mb-2">No</span>
              {node.children?.no ? (
                <TreeNode node={node.children.no} />
              ) : (
                <button
                  className={`p-2 rounded ${
                    isAddNodeActive && selectedParent.id === node.id && selectedParent.path === 'no'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handleAddNodeClick(node.id, 'no')}
                >
                  + Add Node
                </button>
              )}
            </div>
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
          className={`border p-2 rounded ${
            (!isStartActive && !isAddNodeActive && !editingNode) ? 'bg-gray-100' : ''
          }`}
          disabled={!isStartActive && !isAddNodeActive && !editingNode}
        />
        <button
          onClick={editingNode ? handleUpdate : handleAddNode}
          className={`
            px-4 py-2 rounded
            ${(!isAddNodeActive && !editingNode)
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
          disabled={(!isAddNodeActive && !editingNode) || loading}
        >
          {editingNode ? 'Edit Node' : 'Add Node'}
        </button>
        {editingNode && (
          <button
            onClick={() => {
              setEditingNode(null)
              setNewNodeId('')
            }}
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="border rounded-lg p-8 bg-gray-50">
        {loading ? (
          <div>Loading...</div>
        ) : tree ? (
          <TreeNode node={tree} />
        ) : (
          <button
            className={`
              p-4 rounded
              ${isStartActive 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-100 hover:bg-gray-200'
              }
            `}
            onClick={handleStartTree}
          >
            {isStartActive ? 'Ready to Add Root Node' : '+ Start Tree'}
          </button>
        )}
      </div>
    </div>
  )
}