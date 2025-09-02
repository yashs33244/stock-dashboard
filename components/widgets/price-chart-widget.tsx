"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, Settings, RefreshCw, BarChart3, AlertTriangle } from "lucide-react"
import { sanitizeErrorForDisplay } from "@/lib/error-sanitizer"
import type { Widget } from "@/lib/store"

interface PriceChartWidgetProps {
  widget: Widget
  onUpdate: (data: any) => void
  onConfigure: () => void
}

interface PriceData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface PriceChartResponse {
  data: {
    timeSeries: PriceData[]
    metaData: {
      symbol: string
      lastRefreshed: string
      interval: string
      timeZone: string
    }
  }
  isMockData: boolean
  rateLimitMessage?: string
}

export function PriceChartWidget({ widget, onUpdate, onConfigure }: PriceChartWidgetProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [interval, setInterval] = useState("daily")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [chartData, setChartData] = useState<PriceChartResponse | null>(null)

  const intervals = [
    { value: "1min", label: "1 Minute" },
    { value: "5min", label: "5 Minutes" },
    { value: "15min", label: "15 Minutes" },
    { value: "30min", label: "30 Minutes" },
    { value: "60min", label: "1 Hour" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" }
  ]

  const fetchPriceData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        symbol: selectedSymbol,
        interval: interval
      })

      const response = await fetch(`/api/stocks/price-chart?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch price data')
      }

      setChartData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const forceRefresh = () => {
    fetchPriceData()
  }

  useEffect(() => {
    fetchPriceData()
  }, [selectedSymbol, interval])

  const isMockData = useMemo(() => chartData?.isMockData || false, [chartData?.isMockData])
  const rateLimitMessage = useMemo(() => chartData?.rateLimitMessage, [chartData?.rateLimitMessage])

  const chartDataFormatted = useMemo(() => {
    if (!chartData?.data?.timeSeries) return []
    
    return chartData.data.timeSeries.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      price: item.close // For the main line chart
    })).slice(-50) // Show last 50 data points
  }, [chartData])

  const getPriceChange = () => {
    if (chartDataFormatted.length < 2) return { change: 0, percentChange: 0, isPositive: false }
    
    const firstPrice = chartDataFormatted[0].close
    const lastPrice = chartDataFormatted[chartDataFormatted.length - 1].close
    const change = lastPrice - firstPrice
    const percentChange = (change / firstPrice) * 100
    
    return {
      change,
      percentChange,
      isPositive: change > 0
    }
  }

  const getCurrentPrice = () => {
    if (chartDataFormatted.length === 0) return 0
    return chartDataFormatted[chartDataFormatted.length - 1].close
  }

  const getVolumeChange = () => {
    if (chartDataFormatted.length < 2) return { change: 0, percentChange: 0, isPositive: false }
    
    const firstVolume = chartDataFormatted[0].volume
    const lastVolume = chartDataFormatted[chartDataFormatted.length - 1].volume
    const change = lastVolume - firstVolume
    const percentChange = (change / firstVolume) * 100
    
    return {
      change,
      percentChange,
      isPositive: change > 0
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`
    return volume.toLocaleString()
  }

  const priceChange = getPriceChange()
  const currentPrice = getCurrentPrice()
  const volumeChange = getVolumeChange()

  return (
    <Card className="h-full bg-slate-900/50 border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Price Chart</span>
            {isMockData && (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Demo Data
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={forceRefresh}
              disabled={loading}
              className="text-slate-300 hover:text-slate-100 hover:bg-slate-700/50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="symbol" className="text-xs text-slate-400">Symbol</Label>
            <Input
              id="symbol"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
              className="bg-slate-800/50 border-slate-600 text-slate-100"
              placeholder="AAPL"
            />
          </div>
          <div>
            <Label htmlFor="interval" className="text-xs text-slate-400">Interval</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervals.map(interval => (
                  <SelectItem key={interval.value} value={interval.value}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
            {sanitizeErrorForDisplay(error)}
          </div>
        )}

        {loading && !chartData ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading price data...
          </div>
        ) : chartDataFormatted.length > 0 ? (
          <div className="space-y-4">
            {/* Price Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-slate-400">Current Price</span>
                </div>
                <p className="text-lg font-semibold text-slate-100">
                  ${currentPrice.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-1">
                  {priceChange.isPositive ? 
                    <TrendingUp className="h-4 w-4 text-green-500" /> : 
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm text-slate-400">Change</span>
                </div>
                <p className={`text-lg font-semibold ${priceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange.isPositive ? '+' : ''}${priceChange.change.toFixed(2)} ({priceChange.percentChange.toFixed(2)}%)
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-slate-400">Volume</span>
                </div>
                <p className="text-lg font-semibold text-slate-100">
                  {formatVolume(chartDataFormatted[chartDataFormatted.length - 1]?.volume || 0)}
                </p>
              </div>
            </div>

            {/* Price Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDataFormatted}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={priceChange.isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={priceChange.isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'price') return [`$${value.toFixed(2)}`, 'Price']
                      if (name === 'volume') return [formatVolume(value), 'Volume']
                      return [value, name]
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={priceChange.isPositive ? "#22c55e" : "#ef4444"}
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: priceChange.isPositive ? "#22c55e" : "#ef4444" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* OHLC Summary */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400">Open</p>
                <p className="text-sm font-semibold text-slate-100">
                  ${chartDataFormatted[0]?.open?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400">High</p>
                <p className="text-sm font-semibold text-green-400">
                  ${Math.max(...chartDataFormatted.map(d => d.high)).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400">Low</p>
                <p className="text-sm font-semibold text-red-400">
                  ${Math.min(...chartDataFormatted.map(d => d.low)).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400">Close</p>
                <p className="text-sm font-semibold text-slate-100">
                  ${chartDataFormatted[chartDataFormatted.length - 1]?.close?.toFixed(2) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <p>No price data available</p>
          </div>
        )}

        {isMockData && rateLimitMessage && (
          <div className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded border border-yellow-500/30">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            {rateLimitMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
