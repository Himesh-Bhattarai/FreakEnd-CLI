import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
// import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Freakend CLI - Backend Code Generator",
  description:
    "The fastest way to scaffold backend logic for any language. Generate production-ready authentication, CRUD operations, and more in seconds.",
  keywords: ["backend", "cli", "code generator", "authentication", "crud", "api", "nodejs", "python", "go", "php"],
  authors: [{ name: "Freakend Team" }],
  openGraph: {
    title: "Freakend CLI - Backend Code Generator",
    description: "Generate production-ready backend code in seconds",
    url: "https://freakend.dev",
    siteName: "Freakend CLI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Freakend CLI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freakend CLI - Backend Code Generator",
    description: "Generate production-ready backend code in seconds",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <Navigation />
          <main>{children}</main>
          {/* <Footer /> */}
        </div>
        <Toaster />
      </body>
    </html>
  )
}
