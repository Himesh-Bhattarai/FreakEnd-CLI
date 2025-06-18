"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Check } from "lucide-react"

const versions = [
  { version: "v1.2.0", label: "Latest", current: true },
  { version: "v1.1.0", label: "Stable", current: false },
  { version: "v1.0.0", label: "Legacy", current: false },
]

export function VersionSwitcher() {
  const [currentVersion, setCurrentVersion] = useState(versions[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
          {currentVersion.version}
          <Badge variant="secondary" className="ml-2 bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
            {currentVersion.label}
          </Badge>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-900 border-slate-700">
        {versions.map((version) => (
          <DropdownMenuItem
            key={version.version}
            onClick={() => setCurrentVersion(version)}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span>{version.version}</span>
                <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                  {version.label}
                </Badge>
              </div>
              {version.current && <Check className="h-4 w-4 text-blue-400" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
