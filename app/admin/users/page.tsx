"use client"

import { useState } from "react"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  role: "admin" | "expert"
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState<"admin" | "expert">("admin")

  const handleAddUser = () => {
    if (!newEmail) {
      toast.error("Please enter an email")
      return
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: newEmail,
      role: selectedRole,
    }

    setUsers([...users, newUser])
    setNewEmail("")
    toast.success("User added successfully")
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id))
    toast.success("User removed successfully")
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
            onChange={(e) =>
              setSelectedRole(e.target.value as "admin" | "expert")
            }
            className="px-4 py-2 border rounded-lg"
          >
            <option value="admin">Admin</option>
            <option value="expert">Expert</option>
          </select>
          <button
            onClick={handleAddUser}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add User
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
                  {user.role}
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
