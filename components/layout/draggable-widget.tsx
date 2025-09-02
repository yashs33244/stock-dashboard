"use client"

import type React from "react"
import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { GripVertical, Maximize2, Minimize2, X } from "lucide-react"
import type { Widget } from "@/lib/store"
import { useDashboardStore } from "@/lib/store"

interface DraggableWidgetProps {
  widget: Widget
  children: React.ReactNode
  onResize?: (id: string, size: { width: number; height: number }) => void
}

export function DraggableWidget({ widget, children, onResize }: DraggableWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { removeWidget } = useDashboardStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    data: {
      type: "widget",
      widget,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleToggleSize = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)

    if (onResize) {
      onResize(widget.id, {
        width: newExpanded ? 800 : 400,
        height: newExpanded ? 600 : 300,
      })
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all duration-200 ${
        isDragging ? "z-50 shadow-2xl" : "z-0"
      } ${isExpanded ? "col-span-2 row-span-2" : ""}`}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-1">
          <Button
            variant="secondary"
            size="sm"
            className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={handleToggleSize}
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Remove Button */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="sm"
          className="h-6 w-6 p-0 bg-red-500/80 backdrop-blur-sm hover:bg-red-600/90"
          onClick={() => removeWidget(widget.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Widget Content */}
      <div className={`h-full ${isDragging ? "pointer-events-none" : ""}`}>{children}</div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg" />
      )}
    </div>
  )
}
