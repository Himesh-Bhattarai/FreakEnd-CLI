import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Terminal, Database, CreditCard, Upload, Mail } from "lucide-react"

const commands = [
  {
    command: "frx add login",
    description: "Generate authentication system with JWT, password hashing, and middleware",
    icon: Terminal,
    flags: [
      { flag: "-en", desc: "Node.js + Express" },
      { flag: "-pyd", desc: "Python + Django" },
      { flag: "-go", desc: "Go + Fiber" },
      { flag: "-php", desc: "PHP + Laravel" },
      { flag: "-fa", desc: "Python + FastAPI" },
    ],
  },
  {
    command: "frx add crud",
    description: "Generate CRUD operations with validation, pagination, and filtering",
    icon: Database,
    flags: [
      { flag: "-en", desc: "Node.js + Express" },
      { flag: "-pyd", desc: "Python + Django" },
      { flag: "-go", desc: "Go + Fiber" },
    ],
  },
  {
    command: "frx add payment",
    description: "Integrate payment processing with Stripe, webhooks, and subscription handling",
    icon: CreditCard,
    flags: [
      { flag: "-en", desc: "Node.js + Express" },
      { flag: "-pyd", desc: "Python + Django" },
      { flag: "-go", desc: "Go + Fiber" },
    ],
  },
  {
    command: "frx add upload",
    description: "File upload system with validation, cloud storage, and image processing",
    icon: Upload,
    flags: [
      { flag: "-en", desc: "Node.js + Express" },
      { flag: "-pyd", desc: "Python + Django" },
    ],
  },
  {
    command: "frx add email",
    description: "Email service with templates, queues, and delivery tracking",
    icon: Mail,
    flags: [
      { flag: "-en", desc: "Node.js + Express" },
      { flag: "-pyd", desc: "Python + Django" },
    ],
  },
]

const globalFlags = [
  {
    flag: "--typescript",
    desc: "Generate TypeScript files instead of JavaScript",
    example: "frx add login -en --typescript",
  },
  {
    flag: "--database",
    desc: "Specify database type (mongodb, postgresql, mysql)",
    example: "frx add login -en --database postgresql",
  },
  { flag: "--auth", desc: "Authentication method (jwt, session, oauth)", example: "frx add login -en --auth oauth" },
  { flag: "--test", desc: "Include test files and configurations", example: "frx add login -en --test" },
  { flag: "--docker", desc: "Generate Docker configuration", example: "frx add login -en --docker" },
  { flag: "--force", desc: "Overwrite existing files", example: "frx add login -en --force" },
]

export default function CLIReferencePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 border-purple-600/30 mb-4">
          CLI Reference
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Complete Command Reference</h1>
        <p className="text-xl text-slate-300">Comprehensive guide to all Freakend CLI commands, flags, and options.</p>
      </div>

      {/* Command Structure */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Command Structure</h2>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <CodeBlock language="bash" code="frx <action> <module> -<framework> [options]" title="Basic Syntax" />
            <div className="mt-4 grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-400 font-mono">frx</span>
                <p className="text-slate-400">CLI command</p>
              </div>
              <div>
                <span className="text-green-400 font-mono">add</span>
                <p className="text-slate-400">Action to perform</p>
              </div>
              <div>
                <span className="text-yellow-400 font-mono">login</span>
                <p className="text-slate-400">Module to generate</p>
              </div>
              <div>
                <span className="text-purple-400 font-mono">-en</span>
                <p className="text-slate-400">Framework flag</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Commands */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Available Commands</h2>
        <div className="space-y-6">
          {commands.map((cmd, index) => (
            <Card key={index} className="bg-slate-900 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <cmd.icon className="w-6 h-6 text-blue-400" />
                  <div>
                    <CardTitle className="text-white font-mono">{cmd.command}</CardTitle>
                    <CardDescription className="text-slate-400">{cmd.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Supported Frameworks:</h4>
                    <div className="flex flex-wrap gap-2">
                      {cmd.flags.map((flag, flagIndex) => (
                        <Badge key={flagIndex} variant="outline" className="border-slate-600 text-slate-300">
                          <code className="text-xs">{flag.flag}</code>
                          <span className="ml-1 text-xs">{flag.desc}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Example:</h4>
                    <CodeBlock language="bash" code={`${cmd.command} ${cmd.flags[0].flag}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Global Flags */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Global Flags</h2>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-6">
              {globalFlags.map((flag, index) => (
                <div key={index} className="border-b border-slate-700 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono mb-2">
                        {flag.flag}
                      </Badge>
                      <p className="text-slate-300">{flag.desc}</p>
                    </div>
                  </div>
                  <CodeBlock language="bash" code={flag.example} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Framework Codes */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Framework Codes</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Backend Frameworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Node.js + Express</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                    -en
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Python + Django</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                    -pyd
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Go + Fiber</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                    -go
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">PHP + Laravel</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                    -php
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Python + FastAPI</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                    -fa
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center opacity-50">
                  <span className="text-slate-300">Python + Flask</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                    -flask
                  </Badge>
                </div>
                <div className="flex justify-between items-center opacity-50">
                  <span className="text-slate-300">Java + Spring Boot</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                    -spring
                  </Badge>
                </div>
                <div className="flex justify-between items-center opacity-50">
                  <span className="text-slate-300">Ruby + Rails</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                    -rails
                  </Badge>
                </div>
                <div className="flex justify-between items-center opacity-50">
                  <span className="text-slate-300">C# + .NET</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                    -net
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
