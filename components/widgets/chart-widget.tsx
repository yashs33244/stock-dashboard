"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Settings, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import { useStockChart } from "@/hooks/use-stock-chart"
import type { ChartData } from "@/lib/types"
import type { Widget } from "@/lib/store"

interface ChartWidgetProps {
  widget: Widget
  onUpdate: (data: any) => void
  onConfigure: () => void
}

export function ChartWidget({ widget, onUpdate, onConfigure }: ChartWidgetProps) {
  const [selectedInterval, setSelectedInterval] = useState(widget.config.interval || "5min")
  
  const {
    data: chartData,
    isLoading: loading,
    error,
    refetch: forceRefresh,
  } = useStockChart({
    provider: widget.config.apiProvider,
    symbol: widget.config.symbol || widget.config.symbols?.[0] || '',
    interval: selectedInterval,
    enabled: Boolean(widget.config.symbol || widget.config.symbols?.length),
    refetchInterval: widget.config.refreshInterval || 60000, // 1 minute
  })

  // Update parent component when data changes
  useEffect(() => {
    if (chartData) {
      onUpdate(chartData)
    }
  }, [chartData]) // Remove onUpdate from dependencies to prevent infinite loops



  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCurrentPrice = () => {
    if (!chartData || chartData.length === 0) return 0
    return chartData[chartData.length - 1]?.close || 0
  }

  const getPriceChange = () => {
    if (!chartData || chartData.length < 2) return { change: 0, changePercent: 0 }
    const current = chartData[chartData.length - 1]?.close || 0
    const previous = chartData[0]?.close || 0
    const change = current - previous
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0
    return { change, changePercent }
  }

  const { change, changePercent } = getPriceChange()

  return (
    <Card className="w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col">
          <CardTitle className="text-lg font-semibold text-slate-100">{widget.title}</CardTitle>
          {widget.config.symbols?.[0] && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-100">{formatPrice(getCurrentPrice())}</span>
              <div className="flex items-center space-x-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)} ({changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedInterval} onValueChange={setSelectedInterval}>
            <SelectTrigger className="w-20 bg-slate-800 border-slate-600 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="1min">1m</SelectItem>
              <SelectItem value="5min">5m</SelectItem>
              <SelectItem value="15min">15m</SelectItem>
              <SelectItem value="30min">30m</SelectItem>
              <SelectItem value="60min">1h</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => forceRefresh()}
            disabled={loading}
            className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigure}
            className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-400 text-sm mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-md">{error}</div>
        )}

        {loading && (!chartData || chartData.length === 0) ? (
          <div className="flex items-center justify-center h-80 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading chart data...
          </div>
        ) : chartData && chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {widget.config.chartType === "area" ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    axisLine={{ stroke: "#4B5563" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    axisLine={{ stroke: "#4B5563" }}
                    domain={["dataMin - 5", "dataMax + 5"]}
                  />
                  <Tooltip
                    labelFormatter={(value) => formatTime(value)}
                    formatter={(value: number) => [formatPrice(value), "Price"]}
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#F1F5F9",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    axisLine={{ stroke: "#4B5563" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    axisLine={{ stroke: "#4B5563" }}
                    domain={["dataMin - 5", "dataMax + 5"]}
                  />
                  <Tooltip
                    labelFormatter={(value) => formatTime(value)}
                    formatter={(value: number) => [formatPrice(value), "Price"]}
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#F1F5F9",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3B82F6" }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-slate-400">
            No chart data available. Configure symbols to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
