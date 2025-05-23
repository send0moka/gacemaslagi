/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/client"
import { PostgrestError } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

const SUPER_ADMIN_EMAIL = "jehian.zuhry@mhs.unsoed.ac.id"

interface User {
  id: string
  email: string
  name: string | null
  is_expert: boolean
  created_at: string
}

export default function UsersPage() {
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    const userEmail = user?.emailAddresses[0]?.emailAddress
    if (userEmail !== SUPER_ADMIN_EMAIL) {
      router.push("/admin")
    }
  }, [user, router])

  const [users, setUsers] = useState<User[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [selectedRole, setSelectedRole] = useState<"operator" | "expert">(
    "operator"
  )
  const [isLoading, setIsLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editEmail, setEditEmail] = useState("")
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState<"operator" | "expert">("operator")
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      toast.error("Failed to fetch users")
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
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          email: newEmail,
          name: newName || null,
          is_expert: selectedRole === "expert",
        })
        .select("*")
        .single()

      if (insertError) throw insertError

      toast.success("User added successfully")
      setNewEmail("")
      setNewName("")
      await fetchUsers()
    } catch (error) {
      if (error instanceof PostgrestError) {
        if (error.code === "23505") {
          toast.error("Email already exists")
        } else {
          toast.error(`Database error: ${error.message}`)
        }
      } else {
        toast.error("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this user?"
    )

    if (!isConfirmed) {
      return
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", id)

      if (error) throw error

      toast.success("User removed successfully")
      setUsers(users.filter((user) => user.id !== id))
    } catch (error) {
      toast.error("Failed to delete user")
      console.error(error)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditEmail(user.email)
    setEditName(user.name || "")
    setEditRole(user.is_expert ? "expert" : "operator")
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    if (!editEmail) {
      toast.error("Please enter an email")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          email: editEmail,
          name: editName || null,
          is_expert: editRole === "expert",
        })
        .eq("id", editingUser.id)

      if (error) throw error

      toast.success("User updated successfully")
      handleCancelEdit()
      await fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditEmail("")
    setEditName("")
    setEditRole("operator")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editingUser ? "Edit User" : "Add New User"}
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="email"
              value={editingUser ? editEmail : newEmail}
              onChange={(e) =>
                editingUser
                  ? setEditEmail(e.target.value)
                  : setNewEmail(e.target.value)
              }
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              value={editingUser ? editName : newName}
              onChange={(e) =>
                editingUser
                  ? setEditName(e.target.value)
                  : setNewName(e.target.value)
              }
              placeholder="Name (optional)"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  editingUser
                    ? setEditRole("operator")
                    : setSelectedRole("operator")
                }
                className={`px-4 py-2 rounded-lg border ${
                  (editingUser ? editRole : selectedRole) === "operator"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Operator
              </button>
              <button
                type="button"
                onClick={() =>
                  editingUser
                    ? setEditRole("expert")
                    : setSelectedRole("expert")
                }
                className={`px-4 py-2 rounded-lg border ${
                  (editingUser ? editRole : selectedRole) === "expert"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Expert
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              {editingUser ? (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    {isLoading ? "Updating..." : "Update User"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddUser}
                  disabled={isLoading}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Adding..." : "Add User"}
                </button>
              )}
            </div>
          </div>
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
                Name
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {user.is_expert ? "Expert" : "Operator"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(user.created_at).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
