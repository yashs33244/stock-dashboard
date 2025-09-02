"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDashboardStore } from "@/lib/store"
import { DroppableDashboard } from "./droppable-dashboard"

interface DashboardGridProps {
  children?: React.ReactNode
}

export function DashboardGrid({ children }: DashboardGridProps) {
  const { widgets } = useDashboardStore()
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  const handleDragStart = useCallback((widgetId: string) => {
    setDraggedWidget(widgetId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null)
  }, [])

  return (
    <div className="relative min-h-full">
      {/* Drop zones indicator */}
      {draggedWidget && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 h-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 min-h-[200px] flex items-center justify-center"
              >
                <span className="text-primary/60 text-sm font-medium">Drop widget here</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`relative ${draggedWidget ? "z-10" : ""}`}>
        <DroppableDashboard>{children}</DroppableDashboard>
      </div>
    </div>
  )
}
