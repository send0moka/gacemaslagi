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

  const homeLink = { href: "/", label: "Back to Home", icon: "🏠" }

  // Basic admin menu items
  const operatorMenuItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
    { href: "/admin/diagnosis", label: "Diagnosis", icon: "🩺" },
    { href: "/admin/articles", label: "Articles", icon: "📰" },
    { href: "/admin/feedbacks", label: "Feedbacks", icon: "💬" },
    { href: "/admin/consultations", label: "Consultations", icon: "📅" }, // Add this line
  ]

  // Expert specific menu items
  const expertAdditionalItems = [
    { href: "/admin/symptoms", label: "Manage Symptoms", icon: "🔍" },
    { href: "/admin/diseases", label: "Manage Diseases", icon: "🏥" },
    { href: "/admin/decision-tree", label: "Decision Tree", icon: "🌳" },
  ]

  // Super admin gets access to everything plus user management
  const menuItems = isSuperAdmin
    ? [
        { href: "/admin/users", label: "Manage Users", icon: "👥" },
        ...operatorMenuItems,
        ...expertAdditionalItems
      ]
    : isExpert
      ? [...operatorMenuItems.filter(item => 
          item.href !== "/admin/diagnosis" && 
          item.href !== "/admin/articles" &&
          item.href !== "/admin/feedbacks"
        ), ...expertAdditionalItems]
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
        <a
          href={homeLink.href}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 border border-gray-700"
        >
          <span>{homeLink.icon}</span>
          <span>{homeLink.label}</span>
        </a>

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
