"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw } from "lucide-react"

const commands = [
  {
    command: "frx add login -en",
    steps: [
      "🔍 Analyzing project structure...",
      "📦 Installing dependencies...",
      "🔐 Generating authentication routes...",
      "🛡️  Creating JWT middleware...",
      "🔒 Setting up password hashing...",
      "✅ Login system ready!",
    ],
  },
  {
    command: "frx add crud -en",
    steps: [
      "🔍 Scanning existing models...",
      "📝 Generating CRUD controllers...",
      "🔗 Creating API routes...",
      "✅ CRUD operations complete!",
    ],
  },
  {
    command: "frx add payment -en",
    steps: [
      "💳 Setting up Stripe integration...",
      "🔗 Creating payment webhooks...",
      "💰 Generating payment routes...",
      "✅ Payment system ready!",
    ],
  },
]

export function InteractiveTerminal() {
  const [currentCommand, setCurrentCommand] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const runCommand = () => {
    setIsRunning(true)
    setCurrentStep(0)
    setIsComplete(false)

    const command = commands[currentCommand]
    let step = 0

    const interval = setInterval(() => {
      if (step < command.steps.length) {
        setCurrentStep(step)
        step++
      } else {
        clearInterval(interval)
        setIsRunning(false)
        setIsComplete(true)
      }
    }, 800)
  }

  const resetTerminal = () => {
    setCurrentStep(0)
    setIsComplete(false)
    setIsRunning(false)
  }

  const nextCommand = () => {
    setCurrentCommand((prev) => (prev + 1) % commands.length)
    resetTerminal()
  }

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden max-w-4xl mx-auto">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-sm text-slate-400">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={nextCommand} className="text-slate-400 hover:text-white">
            Next Command
          </Button>
          <Button variant="ghost" size="sm" onClick={resetTerminal} className="text-slate-400 hover:text-white">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-6 font-mono text-sm min-h-[200px]">
        <div className="text-green-400 mb-4">$ {commands[currentCommand].command}</div>

        {/* Command Output */}
        <div className="space-y-2">
          {commands[currentCommand].steps.slice(0, currentStep + 1).map((step, index) => (
            <div
              key={index}
              className={`text-slate-300 transition-opacity duration-300 ${
                index === currentStep && isRunning ? "opacity-100" : "opacity-80"
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {isRunning && (
          <div className="flex items-center gap-2 mt-4 text-blue-400">
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
            <span>Processing...</span>
          </div>
        )}

        {/* Success message */}
        {isComplete && <div className="mt-4 text-green-400">🚀 Command completed successfully!</div>}

        {/* Run button */}
        {!isRunning && !isComplete && (
          <div className="mt-6">
            <Button onClick={runCommand} className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" />
              Run Command
            </Button>
          </div>
        )}

        {/* Try another command */}
        {isComplete && (
          <div className="mt-6">
            <Button onClick={nextCommand} variant="outline" className="border-slate-600">
              Try Another Command
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
