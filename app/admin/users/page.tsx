/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/client"
import { PostgrestError } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name: string | null
  is_expert: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState<"admin" | "expert">("admin")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      toast.error('Failed to fetch users')
      console.error(error)
    }
  }

  const handleAddUser = async () => {
    if (!newEmail) {
      toast.error("Please enter an email")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Remove the Supabase auth check since we're using Clerk
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          email: newEmail,
          is_expert: selectedRole === "expert",
          name: null
        })
        .select('*')
        .single()

      if (insertError) {
        console.error('Insert error:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        })
        throw insertError
      }

      if (!data) {
        throw new Error('No data returned from insert')
      }

      console.log('Successfully added user:', data)
      toast.success("User added successfully")
      setNewEmail("")
      await fetchUsers()
    } catch (error) {
      console.error('Full error object:', error)
      
      if (error instanceof PostgrestError) {
        if (error.code === '23505') {
          toast.error('Email already exists')
        } else {
          toast.error(`Database error: ${error.message}`)
        }
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    // Add confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this user?")
    
    if (!isConfirmed) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success("User removed successfully")
      setUsers(users.filter((user) => user.id !== id))
    } catch (error) {
      toast.error('Failed to delete user')
      console.error(error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New User</h2>
        <div className="flex gap-4">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as "admin" | "expert")}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="admin">Admin</option>
            <option value="expert">Expert</option>
          </select>
          <button
            onClick={handleAddUser}
            disabled={isLoading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Adding...' : 'Add User'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {user.is_expert ? 'Expert' : 'Admin'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
