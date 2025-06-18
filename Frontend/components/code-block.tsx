"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  language: string
  code: string
  title?: string
  className?: string
  showLineNumbers?: boolean
  allowFullscreen?: boolean
}

const highlightSyntax = (code: string, language: string = "text"): string => {

  switch (language.toLowerCase()) {
    case "bash":
    case "shell":
    case "terminal":
      return code
        .replace(
          /(npm|yarn|pnpm|frx|git|cd|mkdir|ls|pwd|sudo|chmod|curl|wget)/g,
          '<span class="text-blue-400 font-semibold">$1</span>',
        )
        .replace(
          /(install|add|login|crud|payment|upload|email|start|build|dev|test)/g,
          '<span class="text-green-400 font-semibold">$1</span>',
        )
        .replace(
          /(-en|-pyd|-go|-php|-fa|--typescript|--test|--force|--help|-h|-v|--version)/g,
          '<span class="text-purple-400">$1</span>',
        )
        .replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
        .replace(/(\$)/g, '<span class="text-yellow-400">$1</span>')

    case "javascript":
    case "js":
    case "typescript":
    case "ts":
      return code
        .replace(
          /(const|let|var|function|async|await|return|if|else|for|while|class|export|import|from|default|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|namespace)/g,
          '<span class="text-purple-400 font-semibold">$1</span>',
        )
        .replace(
          /(require|module\.exports|\.then|\.catch|\.finally|console\.log|console\.error|console\.warn)/g,
          '<span class="text-blue-400">$1</span>',
        )
        .replace(/('.*?'|".*?"|`.*?`)/g, '<span class="text-green-400">$1</span>')
        .replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>')
        .replace(/(\d+)/g, '<span class="text-orange-400">$1</span>')
        .replace(/(true|false|null|undefined)/g, '<span class="text-red-400">$1</span>')

    case "json":
      return code
        .replace(/(".*?")\s*:/g, '<span class="text-blue-400">$1</span>:')
        .replace(/:\s*(".*?")/g, ': <span class="text-green-400">$1</span>')
        .replace(/:\s*(\d+)/g, ': <span class="text-orange-400">$1</span>')
        .replace(/:\s*(true|false|null)/g, ': <span class="text-red-400">$1</span>')

    case "python":
    case "py":
      return code
        .replace(
          /(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|lambda|and|or|not|in|is|True|False|None)/g,
          '<span class="text-purple-400 font-semibold">$1</span>',
        )
        .replace(/(print|len|str|int|float|list|dict|tuple|set)/g, '<span class="text-blue-400">$1</span>')
        .replace(/('.*?'|".*?"|'''[\s\S]*?'''|"""[\s\S]*?""")/g, '<span class="text-green-400">$1</span>')
        .replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
        .replace(/(\d+)/g, '<span class="text-orange-400">$1</span>')

    case "html":
      return code
        .replace(/(&lt;\/?[^&gt;]+&gt;)/g, '<span class="text-blue-400">$1</span>')
        .replace(/(class|id|src|href|alt|title)=/g, '<span class="text-purple-400">$1</span>=')
        .replace(/=(".*?")/g, '=<span class="text-green-400">$1</span>')

    case "css":
      return code
        .replace(/([.#]?[a-zA-Z-]+)\s*{/g, '<span class="text-yellow-400">$1</span> {')
        .replace(/([a-zA-Z-]+):/g, '<span class="text-blue-400">$1</span>:')
        .replace(/:\s*([^;]+);/g, ': <span class="text-green-400">$1</span>;')

    default:
      return code
  }
}

export function CodeBlock({
  language,
  code,
  title,
  className,
  showLineNumbers = false,
  allowFullscreen = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const highlightedCode = highlightSyntax(code, language)
  const lines = code.split("\n")

  return (
    <>
      <div className={cn("relative group", className)}>
        {title && (
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-t-lg border-b-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">
                {title}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600 bg-slate-700 dark:bg-slate-700 light:bg-slate-300 px-2 py-1 rounded">
                {language}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {allowFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-3 w-3 text-slate-400" />
                  ) : (
                    <Maximize2 className="h-3 w-3 text-slate-400" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300"
              >
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
              </Button>
            </div>
          </div>
        )}
        <div className="relative">
          <pre
            className={cn(
              "overflow-x-auto p-4 bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 text-sm font-mono",
              title ? "rounded-b-lg" : "rounded-lg",
              "scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800",
            )}
          >
            <code className="text-slate-300 dark:text-slate-300 light:text-slate-700">
              {showLineNumbers ? (
                <div className="table w-full">
                  {lines.map((line, index) => (
                    <div key={index} className="table-row">
                      <span className="table-cell text-slate-500 dark:text-slate-500 light:text-slate-400 text-right pr-4 select-none w-8 border-r border-slate-700 dark:border-slate-700 light:border-slate-300 mr-4">
                        {index + 1}
                      </span>
                      <span
                        className="table-cell pl-4"
                        dangerouslySetInnerHTML={{ __html: highlightSyntax(line, language) }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              )}
            </code>
          </pre>
          {!title && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {allowFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-slate-700"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-3 w-3 text-slate-400" />
                  ) : (
                    <Maximize2 className="h-3 w-3 text-slate-400" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-slate-700"
              >
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full h-full max-w-7xl bg-slate-950 rounded-lg border border-slate-700 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300 font-medium">{title || "Code"}</span>
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">{language}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-6 w-6 p-0 hover:bg-slate-700">
                  {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-6 w-6 p-0 hover:bg-slate-700">
                  <Minimize2 className="h-3 w-3 text-slate-400" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="h-full p-4 text-sm font-mono overflow-auto">
                <code className="text-slate-300" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
