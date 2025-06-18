import type React from "react"
import { DocsSidebar } from "@/components/docs-sidebar"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Footer } from "@/components/footer"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <DocsSidebar />
      <div className="flex-1">
        <main className="max-w-4xl mx-auto px-6 py-8">
          <BreadcrumbNav />
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
