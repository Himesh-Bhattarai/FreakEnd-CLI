"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Terminal, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Terminal className="w-16 h-16 text-blue-400" />
        </div>

        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-300 mb-4">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 p-4 bg-slate-900 rounded-lg border border-slate-700 max-w-md mx-auto">
          <h3 className="text-white font-semibold mb-2">Need Help?</h3>
          <p className="text-slate-400 text-sm mb-4">Check out our documentation or get started with Freakend CLI</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs/getting-started">Documentation</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs/cli-reference">CLI Reference</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
