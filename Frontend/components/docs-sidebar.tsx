"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

const navigation = [
  {
    title: "Getting Started",
    href: "/docs/getting-started",
  },
  {
    title: "CLI Reference",
    href: "/docs/cli-reference",
  },
  {
    title: "Commands",
    items: [
      { title: "frx add login", href: "/docs/login" },
      { title: "frx add crud", href: "/docs/crud" },
      { title: "frx add payment", href: "/docs/payment" },
      { title: "frx add upload", href: "/docs/upload" },
      { title: "frx add email", href: "/docs/email" },

    ],
  },
  {
    title: "Frameworks",
    items: [
      { title: "Node.js + Express", href: "/docs/frameworks/nodejs" },
      { title: "Python + Django", href: "/docs/frameworks/django" },
      { title: "Go + Fiber", href: "/docs/frameworks/go" },
      { title: "PHP + Laravel", href: "/docs/frameworks/php" },
      { title: "Python + FastAPI", href: "/docs/frameworks/fastapi" },
    ],
  },
  {
    title: "Video Tutoral",
    href: "/docs/tutorial",
  },
  {
    title: "Examples",
    href: "/docs/examples",
  },
  {
    title: "Configuration",
    href: "/docs/configuration",
  },
  {
    title: "Troubleshooting",
    href: "/docs/troubleshooting",
  },
  {
    title: "Contributing",
    href: "/docs/contributing",
  },

  {
    title: "Roadmap",
    href: "/docs/roadmap",
  },
]

export function DocsSidebar() {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<string[]>(["Commands", "Frameworks"])

  const toggleSection = (title: string) => {
    setOpenSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
  }

  return (
    <nav className="w-64 h-screen sticky top-16 overflow-y-auto bg-slate-950 border-r border-slate-800 p-4">
      <div className="space-y-2">
        {navigation.map((item) => (
          <div key={item.title}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                )}
              >
                {item.title}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleSection(item.title)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                >
                  {item.title}
                  {openSections.includes(item.title) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {openSections.includes(item.title) && item.items && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm transition-colors",
                          pathname === subItem.href
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:text-white hover:bg-slate-800",
                        )}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
