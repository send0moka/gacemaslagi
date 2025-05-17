import Link from "next/link"

interface NavLinksProps {
  hasScrolled: boolean
  isMobile?: boolean
  onItemClick?: () => void
}

export const NavLinks = ({
  hasScrolled,
  isMobile,
  onItemClick,
}: NavLinksProps) => {
  const navItems = ["Service", "Histories", "Resources", "About"]

  return navItems.map((item) => (
    <Link
      key={item}
      href={`/${item.toLowerCase()}`}
      className={`
        ${
          isMobile
            ? "text-gray-800 hover:text-gray-600 py-3 text-lg font-medium border-b border-gray-100"
            : `tracking-wider font-medium transition-colors ${
                hasScrolled
                  ? "text-gray-800 hover:text-gray-600"
                  : "text-white hover:text-gray-200"
              }`
        }
      `}
      onClick={onItemClick}
    >
      {item}
    </Link>
  ))
}
