"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Settings, RefreshCw, Star, Activity, DollarSign, CreditCard } from "lucide-react"
import { useStockQuotes } from "@/hooks/use-stock-quotes"
import type { StockData } from "@/lib/types"
import type { Widget } from "@/lib/store"

interface FinanceCardWidgetProps {
  widget: Widget
  onUpdate: (data: any) => void
  onConfigure: () => void
}

export function FinanceCardWidget({ widget, onUpdate, onConfigure }: FinanceCardWidgetProps) {
  const {
    data: stocks,
    isLoading: loading,
    error,
    refetch: forceRefresh,
  } = useStockQuotes({
    provider: widget.config.apiProvider,
    symbols: widget.config.symbols || [],
    enabled: Boolean(widget.config.symbols?.length),
    refetchInterval: widget.config.refreshInterval || 30000,
  })

  // Update parent component when data changes
  useEffect(() => {
    if (stocks) {
      onUpdate(stocks)
    }
  }, [stocks]) // Remove onUpdate from dependencies to prevent infinite loops

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const getCardIcon = () => {
    const cardType = widget.config.cardType || "watchlist"
    switch (cardType) {
      case "watchlist":
        return { icon: <Star className="h-4 w-4 text-white" />, gradient: "from-yellow-500 to-orange-600" }
      case "gainers":
        return { icon: <TrendingUp className="h-4 w-4 text-white" />, gradient: "from-emerald-500 to-teal-600" }
      case "volume":
        return { icon: <Activity className="h-4 w-4 text-white" />, gradient: "from-purple-500 to-indigo-600" }
      default:
        return { icon: <DollarSign className="h-4 w-4 text-white" />, gradient: "from-blue-500 to-cyan-600" }
    }
  }

  const getSortedStocks = () => {
    if (!stocks) return []
    
    const cardType = widget.config.cardType || "watchlist"
    switch (cardType) {
      case "gainers":
        return [...stocks].sort((a, b) => b.changePercent - a.changePercent)
      case "losers":
        return [...stocks].sort((a, b) => a.changePercent - b.changePercent)
      case "volume":
        return [...stocks].sort((a, b) => b.volume - a.volume)
      default:
        return stocks
    }
  }

  const cardIconData = getCardIcon()

  return (
    <Card className="w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm shadow-xl shadow-slate-900/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-700/30">
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 bg-gradient-to-br ${cardIconData.gradient} rounded-lg flex items-center justify-center shadow-lg`}
          >
            {cardIconData.icon}
          </div>
          <CardTitle className="text-lg font-semibold text-slate-100">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => forceRefresh()}
            disabled={loading}
            className="text-slate-300 hover:text-slate-100 hover:bg-slate-700/50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigure}
            className="text-slate-300 hover:text-slate-100 hover:bg-slate-700/50"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <div className="text-red-400 text-sm mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">{error.message}</div>
        )}

        {loading && (!stocks || stocks.length === 0) ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="space-y-3">
            {getSortedStocks()
              .slice(0, 5)
              .map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 group-hover:bg-slate-600 transition-colors">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">{stock.symbol}</span>
                      <span className="text-xs text-slate-400">Vol: {stock.volume.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <span className="font-mono font-semibold text-slate-100">{formatCurrency(stock.price)}</span>
                    <div className="flex items-center space-x-2">
                      {stock.changePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${
                          stock.changePercent >= 0
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {formatPercent(stock.changePercent)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

            {(!stocks || stocks.length === 0) && !loading && (
              <div className="text-center text-slate-400 py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No stocks configured</p>
                <p className="text-xs mt-1 opacity-75">Click settings to add symbols</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
