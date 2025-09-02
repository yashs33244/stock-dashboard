"use client"

import type React from "react"

import { useState } from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { WidgetConfigPanel } from "./widget-config-panel"
import { ConnectionStatus } from "@/components/ui/connection-status"
import { useDashboardStore } from "@/lib/store"
import { BarChart3, Sparkles } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isConfigPanelOpen } = useDashboardStore()

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-slate-800/50 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Finance Dashboard
                  </h1>
                  <div className="flex items-center space-x-1 text-sm text-slate-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Real-time market intelligence</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ConnectionStatus />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-slate-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_50%)]" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>

      {/* Configuration Panel */}
      <WidgetConfigPanel />

      {isConfigPanelOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => {}} />
      )}
    </div>
  )
}
