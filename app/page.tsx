"use client"

import { useDashboardStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardGrid } from "@/components/layout/dashboard-grid"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, TrendingUp, Zap } from "lucide-react"

export default function DashboardPage() {
  const { widgets, addWidget } = useDashboardStore()

  const handleAddFirstWidget = () => {
    addWidget({
      type: "table",
      title: "Stock Table Widget",
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      config: {
        apiProvider: "alphavantage",
        symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"],
        refreshInterval: 30000,
      },
    })
  }

  return (
    <DashboardLayout>
      <DashboardGrid>
        {widgets.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl" />
            <div className="relative z-10 max-w-2xl mx-auto px-8">
              <div className="mb-8 relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>

              <h2 className="text-4xl font-bold text-slate-100 mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welcome to Your Finance Dashboard
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl mx-auto">
                Create a personalized financial command center. Track stocks, monitor market trends, and stay informed
                with real-time data visualization.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">Real-time Data</h3>
                  <p className="text-xs text-slate-400">Live market updates</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">Custom Widgets</h3>
                  <p className="text-xs text-slate-400">Drag & drop layout</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center">
                  <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">Smart Analytics</h3>
                  <p className="text-xs text-slate-400">AI-powered insights</p>
                </div>
              </div>

              <Button
                onClick={handleAddFirstWidget}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Widget
              </Button>
            </div>
          </div>
        )}
      </DashboardGrid>
    </DashboardLayout>
  )
}
