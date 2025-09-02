"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useDashboardStore } from "@/lib/store"
import { DataManagementPanel } from "./data-management-panel"
import {
  BarChart3,
  Table,
  CreditCard,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ChevronDown,
  Database,
  Newspaper,
  TrendingUp,
  Activity,
  Building2,
  Calendar,
} from "lucide-react"

interface DashboardSidebarProps {
  collapsed: boolean
  onToggle: () => void
}



export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  const { widgets, addWidget, removeWidget, selectWidget, selectedWidget } = useDashboardStore()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showDataPanel, setShowDataPanel] = useState(false)

  const handleAddWidget = (type: "table" | "card" | "chart" | "news" | "mostActive" | "technicalIndicators" | "companyProfile" | "earnings" | "priceChart") => {
    const defaultConfigs = {
      table: {
        apiProvider: "alphavantage" as const,
        symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"],
        refreshInterval: 30000,
      },
      card: {
        apiProvider: "alphavantage" as const,
        symbols: ["AAPL", "GOOGL", "MSFT"],
        cardType: "watchlist" as const,
        refreshInterval: 30000,
      },
      chart: {
        apiProvider: "alphavantage" as const,
        symbols: ["AAPL"],
        chartType: "line" as const,
        interval: "5min",
        refreshInterval: 60000,
      },
      news: {
        apiProvider: "alphavantage" as const,
        topics: "technology",
        limit: 10,
        refreshInterval: 300000,
      },
      mostActive: {
        apiProvider: "alphavantage" as const,
        refreshInterval: 120000,
      },
      technicalIndicators: {
        apiProvider: "alphavantage" as const,
        symbols: ["AAPL"],
        indicator: "SMA",
        timePeriod: "20",
        interval: "daily",
        seriesType: "close",
        refreshInterval: 300000,
      },
      companyProfile: {
        apiProvider: "finnhub" as const,
        symbols: ["AAPL"],
        refreshInterval: 600000,
      },
      earnings: {
        apiProvider: "finnhub" as const,
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        refreshInterval: 600000,
      },
      priceChart: {
        apiProvider: "alphavantage" as const,
        symbols: ["AAPL"],
        interval: "daily",
        refreshInterval: 300000,
      },
    }

    addWidget({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")} Widget`,
      position: { x: Math.random() * 300, y: Math.random() * 200 },
      size: { width: 400, height: 300 },
      config: defaultConfigs[type],
    })
    setShowAddMenu(false)
  }

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "table":
        return <Table className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "chart":
        return <BarChart3 className="h-4 w-4" />
      case "news":
        return <Newspaper className="h-4 w-4" />
      case "mostActive":
        return <TrendingUp className="h-4 w-4" />
      case "technicalIndicators":
        return <Activity className="h-4 w-4" />
      case "companyProfile":
        return <Building2 className="h-4 w-4" />
      case "earnings":
        return <Calendar className="h-4 w-4" />
      case "priceChart":
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getWidgetTypeLabel = (type: string) => {
    switch (type) {
      case "table":
        return "Table"
      case "card":
        return "Card"
      case "chart":
        return "Chart"
      case "news":
        return "News"
      case "mostActive":
        return "Most Active"
      case "technicalIndicators":
        return "Technical Indicators"
      case "companyProfile":
        return "Company Profile"
      case "earnings":
        return "Earnings"
      case "priceChart":
        return "Price Chart"
      default:
        return "Widget"
    }
  }

  return (
    <div
      className={`bg-slate-900/95 border-r border-slate-700/50 transition-all duration-300 ${
        collapsed ? "w-16" : "w-80"
      } flex flex-col h-full backdrop-blur-sm`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!collapsed && <h2 className="text-lg font-semibold text-slate-100">Dashboard</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Add Widget Section */}
      <div className="p-4 border-b border-slate-700/50">
        {collapsed ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button
              variant="default"
              size="sm"
              className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>

            {showAddMenu && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => handleAddWidget("table")}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Stock Table
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => handleAddWidget("card")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Finance Card
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => handleAddWidget("chart")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Price Chart
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => handleAddWidget("news")}
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Financial News
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => handleAddWidget("mostActive")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Most Active Stocks
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => handleAddWidget("technicalIndicators")}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Technical Indicators
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => handleAddWidget("companyProfile")}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Company Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => handleAddWidget("earnings")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Earnings Calendar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => handleAddWidget("priceChart")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Price Chart
                </Button>

              </div>
            )}
          </>
        )}
      </div>

      {/* Data Management Section */}
      {!collapsed && (
        <div className="border-b border-slate-700/50">
          <Collapsible open={showDataPanel} onOpenChange={setShowDataPanel}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
              >
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Data Management</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDataPanel ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <DataManagementPanel />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Widgets List */}
      <div className="flex-1 overflow-y-auto">
        {!collapsed && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Widgets ({widgets.length})</h3>
            <div className="space-y-2">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedWidget === widget.id
                      ? "bg-slate-700/50 border-slate-600"
                      : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/30"
                  }`}
                  onClick={() => selectWidget(widget.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      {getWidgetIcon(widget.type)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{widget.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                          >
                            {getWidgetTypeLabel(widget.type)}
                          </Badge>
                          {widget.config.symbols && (
                            <span className="text-xs text-slate-400">{widget.config.symbols.length} symbols</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeWidget(widget.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {widgets.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No widgets yet</p>
                  <p className="text-xs mt-1">Add your first widget to get started</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 text-center">Finance Dashboard v1.0</div>
        </div>
      )}
    </div>
  )
}
