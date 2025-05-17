interface MobileMenuProps {
  isOpen: boolean
  onToggle: () => void
  hasScrolled: boolean
  isMobile: boolean
}

export const MobileMenuButton = ({
  isOpen,
  onToggle,
  hasScrolled,
  isMobile,
}: MobileMenuProps) => (
  <button
    className="md:hidden p-2"
    onClick={onToggle}
    aria-label="Toggle mobile menu"
  >
    <svg
      className={`w-6 h-6 ${
        hasScrolled || isOpen || isMobile ? "text-gray-800" : "text-white"
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
      />
    </svg>
  </button>
)
