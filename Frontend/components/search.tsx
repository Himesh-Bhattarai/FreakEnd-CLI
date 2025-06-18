"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { SearchIcon } from "lucide-react"

const searchData = [
  {
    title: "Getting Started",
    description: "Install Freakend CLI and generate your first backend module",
    url: "/docs/getting-started",
    category: "Guide",
  },
  {
    title: "frx add login",
    description: "Generate authentication system with JWT tokens",
    url: "/docs/login",
    category: "Command",
  },
  {
    title: "frx add crud",
    description: "Generate CRUD operations with validation and pagination",
    url: "/docs/crud",
    category: "Command",
  },
  {
    title: "frx add payment",
    description: "Integrate payment processing with Stripe",
    url: "/docs/payment",
    category: "Command",
  },
  {
    title: "CLI Reference",
    description: "Complete command reference and flags",
    url: "/docs/cli-reference",
    category: "Reference",
  },
  {
    title: "Examples",
    description: "Real-world examples and tutorials",
    url: "/docs/examples",
    category: "Guide",
  },
  {
    title: "Node.js + Express",
    description: "Generate backend modules for Node.js with Express",
    url: "/docs/frameworks/nodejs",
    category: "Framework",
  },
  {
    title: "Python + Django",
    description: "Generate backend modules for Python with Django",
    url: "/docs/frameworks/django",
    category: "Framework",
  },
]

interface SearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Search({ open, onOpenChange }: SearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState(searchData)
  const router = useRouter()

  useEffect(() => {
    if (query.trim() === "") {
      setResults(searchData)
    } else {
      const filtered = searchData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()),
      )
      setResults(filtered)
    }
  }, [query])

  const handleSelect = (url: string) => {
    router.push(url)
    onOpenChange(false)
    setQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <SearchIcon className="w-5 h-5" />
            Search Documentation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search commands, guides, and more..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
            autoFocus
          />

          <div className="max-h-96 overflow-y-auto space-y-2">
            {results.length > 0 ? (
              results.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(item.url)}
                  className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700">
            <div className="flex items-center gap-4">
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">↑↓</kbd>
              <span>Navigate</span>
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SearchTrigger() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-slate-400 bg-slate-800 border-slate-600 hover:bg-slate-700 sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border border-slate-600 bg-slate-700 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Search open={open} onOpenChange={setOpen} />
    </>
  )
}
