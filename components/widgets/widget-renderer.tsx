"use client"

import { useDashboardStore } from "@/lib/store"
import { StockTableWidget } from "./stock-table-widget"
import { FinanceCardWidget } from "./finance-card-widget"
import { ChartWidget } from "./chart-widget"
import { NewsWidget } from "./news-widget"
import { MostActiveWidget } from "./most-active-widget"
import type { Widget } from "@/lib/store"

interface WidgetRendererProps {
  widget: Widget
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const { updateWidgetData, selectWidget, toggleConfigPanel } = useDashboardStore()

  const handleUpdate = (data: any) => {
    updateWidgetData(widget.id, data)
  }

  const handleConfigure = () => {
    selectWidget(widget.id)
    toggleConfigPanel()
  }

  switch (widget.type) {
    case "table":
      return <StockTableWidget widget={widget} onUpdate={handleUpdate} onConfigure={handleConfigure} />
    case "card":
      return <FinanceCardWidget widget={widget} onUpdate={handleUpdate} onConfigure={handleConfigure} />
    case "chart":
      return <ChartWidget widget={widget} onUpdate={handleUpdate} onConfigure={handleConfigure} />
    case "news":
      return <NewsWidget widget={widget} onUpdate={handleUpdate} onConfigure={handleConfigure} />
    case "most-active":
      return <MostActiveWidget widget={widget} onUpdate={handleUpdate} onConfigure={handleConfigure} />
    default:
      return (
        <div className="p-4 border border-dashed border-slate-600 rounded-lg text-center text-slate-400 bg-slate-800/30">
          Unknown widget type: {widget.type}
        </div>
      )
  }
}
