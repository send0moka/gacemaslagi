import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Ga Cemas Lagi!",
  description: "Sistem Pakar Diagnosa Gangguan Kecemasan | Forward Chaining",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Header />
        {children}
      </body>
    </html>
  )
}
