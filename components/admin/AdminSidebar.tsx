"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"

interface AdminSidebarProps {
  isSuperAdmin: boolean
  isExpert: boolean
}

const AdminSidebar = ({ isSuperAdmin, isExpert }: AdminSidebarProps) => {
  const pathname = usePathname()

  // Separate home link from admin menu items
  const homeLink = { href: "/", label: "Back to Home", icon: "🏠" }

  // Base menu items for operators (non-experts)
  const operatorMenuItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ]

  // Add disease and symptom management for experts
  const expertMenuItems = [
    ...operatorMenuItems,
    { href: "/admin/symptoms", label: "Manage Symptoms", icon: "🔍" },
    { href: "/admin/diseases", label: "Manage Diseases", icon: "🏥" },
  ]

  // Add users management only for super admin
  const menuItems = isSuperAdmin 
    ? [{ href: "/admin/users", label: "Manage Users", icon: "👥" }, ...expertMenuItems]
    : isExpert 
      ? expertMenuItems 
      : operatorMenuItems

  const userButtonAppearance = {
    elements: {
      avatarBox: "!size-12",
      userButtonTrigger: "!size-12",
      userButtonPopoverCard: "!min-w-[280px]",
      userButtonPopoverFooter: "!p-4",
      userButtonPopoverActions: "!right-full !left-auto !translate-x-2",
    },
    variables: {
      colorPrimary: "#000000",
    },
  }

  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <UserButton
          afterSignOutUrl="/"
          appearance={userButtonAppearance}
        />
      </div>
      <nav className="space-y-6">
        {/* Separate home link with different styling */}
        <a
          href={homeLink.href}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 border border-gray-700"
        >
          <span>{homeLink.icon}</span>
          <span>{homeLink.label}</span>
        </a>

        {/* Menu items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                pathname === item.href ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}

export default AdminSidebar
