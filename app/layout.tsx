import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { QueryProvider } from "@/components/providers/query-provider"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Finance Dashboard - Professional Trading Platform",
  description: "Customizable finance dashboard with real-time data visualization and widget management",
  generator: "Yash Singh",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`font-sans bg-gray-950 text-gray-50 ${GeistSans.variable} ${GeistMono.variable} ${playfairDisplay.variable} ${sourceSans.variable}`}
      >
        <QueryProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  )
}
