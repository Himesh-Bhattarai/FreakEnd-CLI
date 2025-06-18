"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"

interface Column {
  key: string
  header: string
  render?: (value: any, row: any) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface ResponsiveTableProps {
  data: any[]
  columns: Column[]
  className?: string
  onSort?: (key: string, direction: "asc" | "desc") => void
  sortKey?: string
  sortDirection?: "asc" | "desc"
}

export function ResponsiveTable({ data, columns, className, onSort, sortKey, sortDirection }: ResponsiveTableProps) {
  const handleSort = (key: string) => {
    if (!onSort) return
    const newDirection = sortKey === key && sortDirection === "asc" ? "desc" : "asc"
    onSort(key, newDirection)
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left py-3 px-4 text-slate-300 font-semibold",
                    column.sortable && "cursor-pointer hover:text-white select-none",
                    column.className,
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable &&
                      sortKey === column.key &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4 text-blue-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-blue-400" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className={cn("py-3 px-4 text-slate-300", column.className)}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <div key={index} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            {columns.map((column) => (
              <div
                key={column.key}
                className="flex justify-between items-start py-2 border-b border-slate-700 last:border-b-0"
              >
                <span className="text-slate-400 font-medium text-sm flex-shrink-0 mr-4">{column.header}:</span>
                <span className="text-slate-300 text-sm text-right">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No data available</p>
        </div>
      )}
    </div>
  )
}
