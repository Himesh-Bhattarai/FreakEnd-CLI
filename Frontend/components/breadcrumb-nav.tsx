"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function BreadcrumbNav() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (pathname === "/") return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-6">
      <Link href="/" className="hover:text-white flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const isLast = index === segments.length - 1
        const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ")

        return (
          <div key={segment} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4" />
            {isLast ? (
              <span className="text-white">{title}</span>
            ) : (
              <Link href={href} className="hover:text-white">
                {title}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
