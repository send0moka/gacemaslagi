/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { DecisionNode } from '@/utils/types'

export function useDecisionTree() {
  const [tree, setTree] = useState<DecisionNode | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('decision_nodes')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      // Fixed buildTree function to prevent infinite recursion
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

      setTree(buildTree(data))
    } catch (error) {
      console.error('Error fetching tree:', error)
      toast.error('Failed to fetch decision tree')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const addNode = async (
    nodeId: string,
    nodeType: 'symptom' | 'disease',
    parentId: number | null = null,
    isYesPath: boolean | null = null
  ) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('decision_nodes')
        .insert([
          {
            node_id: nodeId,
            node_type: nodeType,
            parent_id: parentId,
            is_yes_path: isYesPath
          }
        ])
        .select()
        .single()

      if (error) throw error

      await fetchTree()
      return data
    } catch (error) {
      console.error('Error adding node:', error)
      toast.error('Failed to add node')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    tree,
    loading,
    fetchTree,
    addNode
  }
}