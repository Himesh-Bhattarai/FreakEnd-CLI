"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Zap, Code, Shield, Rocket } from "lucide-react"
import Link from "next/link"
// import { Footer } from "@/components/footer"

import { CommandPalette, useCommandPalette } from "@/components/command-palette"
import { InteractiveTerminal } from "@/components/interactive-terminal"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const { open, setOpen } = useCommandPalette()

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-teal-600/20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4 bg-slate-800 text-slate-300">
                <Zap className="w-3 h-3 mr-1" />
                v1.2.0 - Latest
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent mb-6">
                Freakend
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
                The fastest way to scaffold backend logic for any language. Generate production-ready authentication,
                CRUD operations, and more in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link href="/docs/getting-started">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link href="/docs/cli-reference">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 w-full sm:w-auto"
                  >
                    CLI Reference
                  </Button>
                </Link>
              </div>

              {/* Command Palette Hint */}
              <div className="text-center text-slate-400 text-sm mb-8">
                Press <kbd className="px-2 py-1 bg-slate-800 rounded text-xs border border-slate-600">⌘K</kbd> to open
                command palette
              </div>

              {/* Interactive Terminal Demo */}
              <div className="max-w-4xl mx-auto mb-12">
                <InteractiveTerminal />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Why Freakend?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Stop writing boilerplate. Focus on what makes your application unique.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Shield className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Production Ready</CardTitle>
                <CardDescription className="text-slate-400">
                  Generated code follows security best practices and industry standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Code className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">Multi-Language</CardTitle>
                <CardDescription className="text-slate-400">
                  Support for Node.js, Python, Go, PHP, and more frameworks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Rocket className="w-8 h-8 text-teal-400 mb-2" />
                <CardTitle className="text-white">Lightning Fast</CardTitle>
                <CardDescription className="text-slate-400">
                  Generate complete backend modules in seconds, not hours
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-slate-900/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Quick Start</h2>
              <p className="text-slate-400 text-lg">Get up and running in under a minute</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="install" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                  <TabsTrigger value="install">Install</TabsTrigger>
                  <TabsTrigger value="generate">Generate</TabsTrigger>
                  <TabsTrigger value="run">Run</TabsTrigger>
                </TabsList>

                <TabsContent value="install" className="mt-6">
                  <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Install Freakend CLI</span>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-green-400 font-mono text-sm">npm install -g freakend-cli</code>
                  </div>
                </TabsContent>

                <TabsContent value="generate" className="mt-6">
                  <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Generate login system</span>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-green-400 font-mono text-sm">frx add login -en</code>
                  </div>
                </TabsContent>

                <TabsContent value="run" className="mt-6">
                  <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Start your server</span>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-green-400 font-mono text-sm">npm start</code>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  )
}
