"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, TrendingUp, TrendingDown, Settings, RefreshCw, TableIcon } from "lucide-react"
import { useStockQuotes } from "@/hooks/use-stock-quotes"
import type { StockData } from "@/lib/types"
import type { Widget } from "@/lib/store"

interface StockTableWidgetProps {
  widget: Widget
  onUpdate: (data: any) => void
  onConfigure: () => void
}

export function StockTableWidget({ widget, onUpdate, onConfigure }: StockTableWidgetProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const {
    data: stocks,
    isLoading: loading,
    error,
    dataUpdatedAt: lastUpdated,
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

  const filteredStocks = (stocks || []).filter((stock) => stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()))

  const paginatedStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const formatLastUpdate = () => {
    if (!lastUpdated) return ""
    const timeSinceUpdate = Date.now() - lastUpdated
    if (timeSinceUpdate < 60000) {
      return `Updated ${Math.floor(timeSinceUpdate / 1000)}s ago`
    } else {
      return `Updated ${Math.floor(timeSinceUpdate / 60000)}m ago`
    }
  }

  return (
    <Card className="w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm shadow-xl shadow-slate-900/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-700/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <TableIcon className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-lg font-semibold text-slate-100">{widget.title}</CardTitle>
            {lastUpdated && (
              <div className="text-xs text-slate-400 flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>{formatLastUpdate()}</span>
              </div>
            )}
          </div>
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
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">{error.message}</div>
        )}

        {loading && (!stocks || stocks.length === 0) ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading stock data...
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-slate-700/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70">
                    <TableHead className="text-slate-300 font-semibold">Symbol</TableHead>
                    <TableHead className="text-right text-slate-300 font-semibold">Price</TableHead>
                    <TableHead className="text-right text-slate-300 font-semibold">Change</TableHead>
                    <TableHead className="text-right text-slate-300 font-semibold">Change %</TableHead>
                    <TableHead className="text-right text-slate-300 font-semibold">Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStocks.map((stock, index) => (
                    <TableRow
                      key={stock.symbol}
                      className="border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                    >
                      <TableCell className="font-semibold text-slate-100">{stock.symbol}</TableCell>
                      <TableCell className="text-right font-mono text-slate-100">
                        {formatCurrency(stock.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          )}
                          <span className={stock.change >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {formatCurrency(Math.abs(stock.change))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            stock.changePercent >= 0
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }
                        >
                          {formatPercent(stock.changePercent)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-400">
                        {stock.volume.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/30">
                <p className="text-sm text-slate-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredStocks.length)} of {filteredStocks.length} stocks
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
