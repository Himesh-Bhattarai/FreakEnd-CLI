"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TocItem {
  id: string
  title: string
  level: number
}

export function TableOfContents() {
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    const tocItems: TocItem[] = []

    headings.forEach((heading) => {
      if (heading.id) {
        tocItems.push({
          id: heading.id,
          title: heading.textContent || "",
          level: Number.parseInt(heading.tagName.charAt(1)),
        })
      }
    })

    setToc(tocItems)

    // Set up intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0% -35% 0%" },
    )

    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading)
      }
    })

    return () => observer.disconnect()
  }, [])

  if (toc.length === 0) return null

  return (
    <div className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 w-64">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 text-sm">On this page</h4>
        <nav className="space-y-1">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "block text-sm transition-colors hover:text-white",
                item.level === 1 && "font-medium",
                item.level === 2 && "pl-2",
                item.level === 3 && "pl-4",
                item.level >= 4 && "pl-6",
                activeId === item.id ? "text-blue-400" : "text-slate-400",
              )}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
