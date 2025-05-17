import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

interface AuthButtonsProps {
  hasScrolled: boolean
  isMobile?: boolean
}

export const AuthButtons = ({ hasScrolled, isMobile }: AuthButtonsProps) => {
  const userButtonAppearance = {
    elements: {
      avatarBox: isMobile ? "!size-16" : "!size-12",
      userButtonTrigger: isMobile ? "!size-16" : "!size-12",
      userButtonPopoverCard: "!min-w-[280px]",
      userButtonPopoverFooter: "!p-4",
    },
    variables: {
      colorPrimary: "#000000",
    },
  }

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
            <button
            className={`
              ${isMobile ? "mt-4 w-full !text-black" : ""} 
              px-6 py-2 rounded-full border transition-colors
              ${
              hasScrolled
                ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                : "border-white text-white hover:bg-white hover:text-gray-800"
              }
            `}
            >
            Sign In
            </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className={isMobile ? "mt-4 flex justify-center" : ""}>
          <UserButton afterSignOutUrl="/" appearance={userButtonAppearance} />
        </div>
      </SignedIn>
    </>
  )
}
