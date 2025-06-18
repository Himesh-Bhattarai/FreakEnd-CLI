"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Terminal, Book, Code, Heart, FileText, Settings, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  title: string
  description: string
  href: string
  category: string
  icon: React.ReactNode
  keywords: string[]
}

const commands: CommandItem[] = [
  // Documentation
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn how to install and use Freakend CLI",
    href: "/docs/getting-started",
    category: "Documentation",
    icon: <Book className="w-4 h-4" />,
    keywords: ["install", "setup", "start", "begin", "tutorial"],
  },
  {
    id: "cli-reference",
    title: "CLI Reference",
    description: "Complete command reference and options",
    href: "/docs/cli-reference",
    category: "Documentation",
    icon: <Terminal className="w-4 h-4" />,
    keywords: ["commands", "reference", "cli", "options", "flags"],
  },
  {
    id: "examples",
    title: "Examples",
    description: "Real-world examples and use cases",
    href: "/docs/examples",
    category: "Documentation",
    icon: <Code className="w-4 h-4" />,
    keywords: ["examples", "samples", "demo", "projects"],
  },

  // Commands
  {
    id: "login-command",
    title: "frx add login",
    description: "Generate authentication system",
    href: "/docs/login",
    category: "Commands",
    icon: <Terminal className="w-4 h-4" />,
    keywords: ["login", "auth", "authentication", "jwt", "session"],
  },
  {
    id: "crud-command",
    title: "frx add crud",
    description: "Generate CRUD operations",
    href: "/docs/crud",
    category: "Commands",
    icon: <Terminal className="w-4 h-4" />,
    keywords: ["crud", "create", "read", "update", "delete", "database"],
  },
  {
    id: "payment-command",
    title: "frx add payment",
    description: "Generate payment processing",
    href: "/docs/payment",
    category: "Commands",
    icon: <Terminal className="w-4 h-4" />,
    keywords: ["payment", "stripe", "billing", "checkout", "subscription"],
  },
  {
    id: "upload-command",
    title: "frx add upload",
    description: "Generate file upload system",
    href: "/docs/upload",
    category: "Commands",
    icon: <Terminal className="w-4 h-4" />,
    keywords: ["upload", "file", "image", "storage", "s3", "cloudinary"],
  },
  {
    id: "email-command",
    title: "frx add email",
    description: "Generate email system",
    href: "/docs/email",
    category: "Commands",
    icon: <Terminal className="w-4 h-4" />,
    keywords: ["email", "mail", "smtp", "templates", "notifications"],
  },

  // Resources
  {
    id: "faq",
    title: "FAQ",
    description: "Frequently asked questions",
    href: "/docs/faq",
    category: "Resources",
    icon: <HelpCircle className="w-4 h-4" />,
    keywords: ["faq", "questions", "help", "support"],
  },
  {
    id: "configuration",
    title: "Configuration",
    description: "Configure Freakend for your project",
    href: "/docs/configuration",
    category: "Resources",
    icon: <Settings className="w-4 h-4" />,
    keywords: ["config", "configuration", "settings", "customize"],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common issues and solutions",
    href: "/docs/troubleshooting",
    category: "Resources",
    icon: <FileText className="w-4 h-4" />,
    keywords: ["troubleshooting", "issues", "problems", "errors", "debug"],
  },
  {
    id: "contributing",
    title: "Contributing",
    description: "How to contribute to Freakend",
    href: "/docs/contributing",
    category: "Resources",
    icon: <Heart className="w-4 h-4" />,
    keywords: ["contributing", "contribute", "development", "github"],
  },
  {
    id: "changelog",
    title: "Changelog",
    description: "Release notes and version history",
    href: "/docs/changelog",
    category: "Resources",
    icon: <FileText className="w-4 h-4" />,
    keywords: ["changelog", "releases", "versions", "updates", "history"],
  },
  {
    id: "roadmap",
    title: "Roadmap",
    description: "Development roadmap and future plans",
    href: "/docs/roadmap",
    category: "Resources",
    icon: <FileText className="w-4 h-4" />,
    keywords: ["roadmap", "future", "plans", "development", "upcoming"],
  },
  {
    id: "donate",
    title: "Support Freakend",
    description: "Support the project with donations",
    href: "/donate",
    category: "Resources",
    icon: <Heart className="w-4 h-4" />,
    keywords: ["donate", "support", "sponsor", "funding", "contribute"],
  },
]

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const filteredCommands = commands.filter((command) => {
    const searchLower = search.toLowerCase()
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description.toLowerCase().includes(searchLower) ||
      command.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
    )
  })

  const groupedCommands = filteredCommands.reduce(
    (acc, command) => {
      if (!acc[command.category]) {
        acc[command.category] = []
      }
      acc[command.category].push(command)
      return acc
    },
    {} as Record<string, CommandItem[]>,
  )

  const handleSelect = (command: CommandItem) => {
    router.push(command.href)
    onOpenChange(false)
    setSearch("")
    setSelectedIndex(0)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex])
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, filteredCommands, selectedIndex])

  useEffect(() => {
    if (open) {
      setSelectedIndex(0)
    }
  }, [search, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 bg-slate-900 border-slate-700">
        <div className="flex items-center border-b border-slate-700 px-4">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <Input
            placeholder="Search documentation, commands, and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent text-white placeholder:text-slate-400 focus-visible:ring-0"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{search}"</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">{category}</div>
                <div className="space-y-1">
                  {items.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command)
                    return (
                      <button
                        key={command.id}
                        onClick={() => handleSelect(command)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          globalIndex === selectedIndex
                            ? "bg-blue-600 text-white"
                            : "hover:bg-slate-800 text-slate-300",
                        )}
                      >
                        <div className="flex-shrink-0">{command.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{command.title}</div>
                          <div className="text-sm opacity-75 truncate">{command.description}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                          {command.category}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-700 px-4 py-2 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">K</kbd>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to use command palette
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return { open, setOpen }
}
