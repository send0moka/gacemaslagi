import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import MobileDetection from "@/components/MobileDetection"

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Ga Cemas Lagi!",
  description: "Sistem Pakar Diagnosa Gangguan Kecemasan | Forward Chaining",
  openGraph: {
    title: "Ga Cemas Lagi!",
    description: "Sistem Pakar Diagnosa Gangguan Kecemasan | Forward Chaining",
    url: "https://gacemaslagi.site",
    siteName: "Ga Cemas Lagi",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Ga Cemas Lagi Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ga Cemas Lagi!",
    description: "Sistem Pakar Diagnosa Gangguan Kecemasan | Forward Chaining",
    images: ["/og.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={plusJakarta.variable}>
        <body className="font-sans antialiased bg-background text-foreground">
          <MobileDetection>{children}</MobileDetection>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
