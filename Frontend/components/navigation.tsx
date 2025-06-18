"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu, Github, Terminal, Zap, Heart } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Getting Started", href: "/docs/getting-started" },
  { name: "CLI Reference", href: "/docs/cli-reference" },
  { name: "Examples", href: "/docs/examples" },
  { name: "FAQ", href: "/docs/faq" },
]

const cliCommands = [
  { name: "frx add login", href: "/docs/login" },
  { name: "frx add crud", href: "/docs/crud" },
  { name: "frx add payment", href: "/docs/payment" },
  { name: "frx add upload", href: "/docs/upload" },
  { name: "frx add email", href: "/docs/email" },
]

const resources = [
  { name: "Configuration", href: "/docs/configuration" },
  { name: "Troubleshooting", href: "/docs/troubleshooting" },
  { name: "Contributing", href: "/docs/contributing" },
  { name: "Changelog", href: "/docs/changelog" },
  { name: "Roadmap", href: "/docs/roadmap" },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 dark:border-slate-800 dark:bg-slate-950/95 light:border-slate-200 light:bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Terminal className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-xl text-white dark:text-white light:text-slate-900">Freakend</span>
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                CLI
              </Badge>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white dark:hover:text-white light:hover:text-slate-900",
                  pathname === item.href
                    ? "text-white dark:text-white light:text-slate-900"
                    : "text-slate-400 dark:text-slate-400 light:text-slate-600",
                )}
              >
                {item.name}
              </Link>
            ))}

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild>
                <Link href="https://github.com/freakend/cli" className="text-slate-400 hover:text-white">
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/donate" className="text-slate-400 hover:text-white">
                  <Heart className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/docs/getting-started">
                  <Zap className="h-4 w-4 mr-2" />
                  Get Started
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/donate" className="text-slate-400 hover:text-white">
                <Heart className="h-4 w-4" />
              </Link>
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-slate-950 border-slate-800 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-white text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Main Navigation */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Documentation</h3>
                    <div className="space-y-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            pathname === item.href
                              ? "bg-slate-800 text-white"
                              : "text-slate-400 hover:text-white hover:bg-slate-800",
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* CLI Commands */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">CLI Commands</h3>
                    <div className="space-y-2">
                      {cliCommands.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm font-mono transition-colors",
                            pathname === item.href
                              ? "bg-slate-800 text-white"
                              : "text-slate-400 hover:text-white hover:bg-slate-800",
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Resources</h3>
                    <div className="space-y-2">
                      {resources.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm transition-colors",
                            pathname === item.href
                              ? "bg-slate-800 text-white"
                              : "text-slate-400 hover:text-white hover:bg-slate-800",
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="space-y-3">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                        <Link href="/docs/getting-started" onClick={() => setIsOpen(false)}>
                          <Zap className="h-4 w-4 mr-2" />
                          Get Started
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full border-slate-600" asChild>
                        <Link href="https://github.com/freakend/cli" onClick={() => setIsOpen(false)}>
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
