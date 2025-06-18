import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/code-block"
import { StepsCard } from "@/components/steps-card"
import { Download, Zap, CheckCircle } from "lucide-react"

export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30 mb-4">
          Getting Started
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Get up and running in minutes</h1>
        <p className="text-xl text-slate-300">
          Install Freakend CLI and generate your first backend module in under 60 seconds.
        </p>
      </div>

      {/* Installation */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Download className="w-6 h-6 text-blue-400" />
          Installation
        </h2>

        <Tabs defaultValue="npm" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="npm">npm</TabsTrigger>
            <TabsTrigger value="yarn">Yarn</TabsTrigger>
            <TabsTrigger value="pnpm">pnpm</TabsTrigger>
          </TabsList>

          <TabsContent value="npm" className="mt-6">
            <CodeBlock language="bash" code="npm install -g freakend-cli" />
          </TabsContent>

          <TabsContent value="yarn" className="mt-6">
            <CodeBlock language="bash" code="yarn global add freakend-cli" />
          </TabsContent>

          <TabsContent value="pnpm" className="mt-6">
            <CodeBlock language="bash" code="pnpm add -g freakend-cli" />
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-4 bg-blue-950/30 border border-blue-700/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> Make sure you have Node.js 16+ installed on your system.
          </p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Quick Start
        </h2>

        <StepsCard
          steps={[
            {
              title: "Verify Installation",
              description: "Check that Freakend CLI is installed correctly",
              code: "frx --version",
            },
            {
              title: "Create New Project",
              description: "Initialize a new project directory",
              code: "mkdir my-backend && cd my-backend\nnpm init -y",
            },
            {
              title: "Generate Login System",
              description: "Add authentication with Node.js + Express",
              code: "frx add login -en",
            },
            {
              title: "Install Dependencies",
              description: "Install the required packages",
              code: "npm install",
            },
            {
              title: "Start Development",
              description: "Run your backend server",
              code: "npm start",
            },
          ]}
        />
      </div>

      {/* First Command */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Your First Command</h2>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Generate Authentication System</CardTitle>
            <CardDescription className="text-slate-400">
              Let's create a complete login system with JWT authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="bash" code="frx add login -en" title="Generate Node.js + Express Authentication" />

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Authentication routes created</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">JWT middleware generated</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Password hashing implemented</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Input validation added</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What's Next */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What's Next?</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Explore Commands</CardTitle>
              <CardDescription className="text-slate-400">Learn about all available CLI commands</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/docs/cli-reference">View CLI Reference</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">See Examples</CardTitle>
              <CardDescription className="text-slate-400">Check out real-world implementation examples</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <a href="/docs/examples">Browse Examples</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
