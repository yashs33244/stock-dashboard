"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, RefreshCw, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { useMostActiveStocks } from "@/hooks/use-most-active-stocks"
import type { MostActiveData } from "@/lib/types"
import type { Widget } from "@/lib/store"

interface MostActiveWidgetProps {
  widget: Widget
  onUpdate: (data: any) => void
  onConfigure: () => void
}

export function MostActiveWidget({ widget, onUpdate, onConfigure }: MostActiveWidgetProps) {
  const {
    data: stocksData,
    isLoading: loading,
    error,
    refetch: forceRefresh,
  } = useMostActiveStocks({
    provider: widget.config.apiProvider,
    refetchInterval: widget.config.refreshInterval || 120000, // 2 minutes
  })

  // Update parent component when data changes
  useEffect(() => {
    if (stocksData) {
      onUpdate(stocksData)
    }
  }, [stocksData]) // Remove onUpdate from dependencies to prevent infinite loops

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  return (
    <Card className="w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-orange-400" />
          <CardTitle className="text-lg font-semibold text-slate-100">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
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

        {loading && (!stocksData || stocksData.length === 0) ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading most active stocks...
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stocksData && stocksData.map((stock, index) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-700 rounded-full text-slate-300 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100 text-sm">{stock.symbol}</div>
                    <div className="text-slate-400 text-xs">Vol: {formatVolume(stock.volume)}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-slate-100 text-sm">{formatPrice(stock.price)}</div>
                  <div className="flex items-center justify-end space-x-1">
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span className={`text-xs font-medium ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {stock.change >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
