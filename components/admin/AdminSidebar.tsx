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

  // Common items (available to all)
  const commonItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
  ]

  // Super admin specific items
  const superAdminItems = [
    { href: "/admin/users", label: "Users", icon: "👥" },
  ]

  // Operator specific items
  const operatorItems = [
    { href: "/admin/articles", label: "Articles", icon: "📰" },
    { href: "/admin/feedbacks", label: "Feedbacks", icon: "💬" },
    { href: "/admin/diagnosis", label: "Diagnosis", icon: "🩺" }, // Moved to operator items
  ]

  // Expert specific items
  const expertItems = [
    { href: "/admin/consultations", label: "Consultations", icon: "📅" },
    { href: "/admin/symptoms", label: "Symptoms", icon: "🔍" },
    { href: "/admin/diseases", label: "Diseases", icon: "🏥" },
    { href: "/admin/decision-tree", label: "Decision Tree", icon: "🌳" },
  ]

  // Settings (available to all)
  const settingsItem = { href: "/admin/settings", label: "Settings", icon: "⚙️" }

  // Home link
  const homeLink = { href: "/", label: "Back to Home", icon: "🏠" }

  // Determine which items to show based on role
  const getMenuGroups = () => {
    if (isSuperAdmin) {
      return [
        { title: "Navigation", items: commonItems },
        { title: "Super Admin", items: superAdminItems },
        { title: "Content Management", items: operatorItems },
        { title: "Expert Tools", items: expertItems },
        { title: "System", items: [settingsItem] }
      ]
    }
    
    if (isExpert) {
      return [
        { title: "Navigation", items: commonItems },
        { title: "Expert Tools", items: expertItems },
        { title: "System", items: [settingsItem] }
      ]
    }
    
    return [
      { title: "Navigation", items: commonItems },
      { title: "Content Management", items: operatorItems },
      { title: "System", items: [settingsItem] }
    ]
  }

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
      
      <nav className="space-y-4">
        <a
          href={homeLink.href}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 border border-gray-700"
        >
          <span>{homeLink.icon}</span>
          <span>{homeLink.label}</span>
        </a>

        {getMenuGroups().map((group, index) => (
          <div key={index} className="space-y-2">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 px-4">
              {group.title}
            </h2>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  pathname === item.href 
                    ? "bg-gray-700 text-white" 
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar
