import Link from "next/link"
import Logo from "./svg/Logo"

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 m-4 rounded-lg">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Logo fill="white" className="scale-200 translate-x-[50px]" />
            <p className="text-gray-300 max-w-sm">
              Bringing digital innovation to Purwokerto&apos;s culinary scene
              through modern solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#diagnosis"
                  className="text-gray-300 hover:text-white transition"
                >
                  Diagnosis
                </Link>
              </li>
              <li>
                <Link
                  href="#histories"
                  className="text-gray-300 hover:text-white transition"
                >
                  Histories
                </Link>
              </li>
              <li>
                <Link
                  href="#resources"
                  className="text-gray-300 hover:text-white transition"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-gray-300 hover:text-white transition"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">Purwokerto, Central Java</li>
              <li className="text-gray-300">Email: info@gacemaslagi.com</li>
              <li className="text-gray-300">Phone: +62 123 456 789</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Ga Cemas Lagi!. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
