import type React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

interface AlertProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "error"
  className?: string
}

const alertVariants = {
  default: "border-blue-700/30 bg-blue-950/30 text-blue-300",
  success: "border-green-700/30 bg-green-950/30 text-green-300",
  warning: "border-yellow-700/30 bg-yellow-950/30 text-yellow-300",
  error: "border-red-700/30 bg-red-950/30 text-red-300",
}

const alertIcons = {
  default: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

export function Alert({ children, variant = "default", className }: AlertProps) {
  const Icon = alertIcons[variant]

  return (
    <div className={cn("flex gap-3 p-4 rounded-lg border", alertVariants[variant], className)}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function AlertDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-sm", className)}>{children}</div>
}
