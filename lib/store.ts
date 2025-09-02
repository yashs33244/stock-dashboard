import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DashboardStorage } from "./storage"

export interface Widget {
  id: string
  type: "table" | "card" | "chart"
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  config: {
    apiProvider: "alphavantage" | "finnhub" | "indianstock"
    symbols?: string[]
    chartType?: "line" | "area"
    interval?: string
    refreshInterval?: number
    fields?: string[]
    cardType?: "watchlist" | "gainers" | "losers" | "volume"
  }
  data?: any
  lastUpdated?: number
}

export interface DashboardState {
  widgets: Widget[]
  selectedWidget: string | null
  isConfigPanelOpen: boolean
  theme: "light" | "dark"

  // Actions
  addWidget: (widget: Omit<Widget, "id">) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<Widget>) => void
  moveWidget: (id: string, position: { x: number; y: number }) => void
  resizeWidget: (id: string, size: { width: number; height: number }) => void
  selectWidget: (id: string | null) => void
  toggleConfigPanel: () => void
  setTheme: (theme: "light" | "dark") => void
  updateWidgetData: (id: string, data: any) => void
  reorderWidgets: (activeId: string, overId: string) => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      selectedWidget: null,
      isConfigPanelOpen: false,
      theme: "light",

      addWidget: (widget) => {
        const id = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => {
          const newWidgets = [...state.widgets, { ...widget, id }]

          if (state.widgets.length > 0) {
            DashboardStorage.createBackup(state.widgets, state.theme)
          }

          return { widgets: newWidgets }
        })
      },

      removeWidget: (id) => {
        set((state) => {
          DashboardStorage.createBackup(state.widgets, state.theme)

          return {
            widgets: state.widgets.filter((w) => w.id !== id),
            selectedWidget: state.selectedWidget === id ? null : state.selectedWidget,
          }
        })
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }))
      },

      moveWidget: (id, position) => {
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, position } : w)),
        }))
      },

      resizeWidget: (id, size) => {
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, size } : w)),
        }))
      },

      selectWidget: (id) => {
        set({ selectedWidget: id })
      },

      toggleConfigPanel: () => {
        set((state) => ({ isConfigPanelOpen: !state.isConfigPanelOpen }))
      },

      setTheme: (theme) => {
        set({ theme })
      },

      updateWidgetData: (id, data) => {
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, data, lastUpdated: Date.now() } : w)),
        }))
      },

      reorderWidgets: (activeId, overId) => {
        const { widgets } = get()
        const activeIndex = widgets.findIndex((w) => w.id === activeId)
        const overIndex = widgets.findIndex((w) => w.id === overId)

        if (activeIndex !== -1 && overIndex !== -1) {
          const newWidgets = [...widgets]
          const [removed] = newWidgets.splice(activeIndex, 1)
          newWidgets.splice(overIndex, 0, removed)

          set({ widgets: newWidgets })
        }
      },
    }),
    {
      name: "finance-dashboard-storage",
      partialize: (state) => ({
        widgets: state.widgets,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Dashboard state rehydrated successfully")
        }
      },
    },
  ),
)
