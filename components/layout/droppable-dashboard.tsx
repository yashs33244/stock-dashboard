"use client"

import type React from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { useState } from "react"
import { useDashboardStore } from "@/lib/store"
import { DraggableWidget } from "./draggable-widget"
import { WidgetRenderer } from "@/components/widgets/widget-renderer"
import type { Widget } from "@/lib/store"

interface DroppableDashboardProps {
  children?: React.ReactNode
}

export function DroppableDashboard({ children }: DroppableDashboardProps) {
  const { widgets, updateWidget, resizeWidget } = useDashboardStore()
  const [activeWidget, setActiveWidget] = useState<Widget | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const widget = widgets.find((w) => w.id === active.id)
    setActiveWidget(widget || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveWidget(null)

    if (!over || active.id === over.id) {
      return
    }

    const activeIndex = widgets.findIndex((w) => w.id === active.id)
    const overIndex = widgets.findIndex((w) => w.id === over.id)

    if (activeIndex !== -1 && overIndex !== -1) {
      // For now, we'll just update the position based on the new order
      // In a more advanced implementation, you could calculate actual grid positions
      const newPosition = {
        x: overIndex * 50,
        y: Math.floor(overIndex / 3) * 50,
      }

      updateWidget(active.id as string, { position: newPosition })
    }
  }

  const handleResize = (id: string, size: { width: number; height: number }) => {
    resizeWidget(id, size)
  }

  if (widgets.length === 0) {
    return <div>{children}</div>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
          {widgets.map((widget) => (
            <DraggableWidget key={widget.id} widget={widget} onResize={handleResize}>
              <WidgetRenderer widget={widget} />
            </DraggableWidget>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeWidget ? (
          <div className="opacity-90 transform rotate-3 shadow-2xl">
            <WidgetRenderer widget={activeWidget} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
