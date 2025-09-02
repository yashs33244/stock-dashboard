"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Settings, RefreshCw, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { sanitizeErrorForDisplay } from "@/lib/error-sanitizer"
import type { Widget } from "@/lib/store"

interface TechnicalIndicatorsWidgetProps {
  widget: Widget
  onUpdate: (data: any) => void
  onConfigure: () => void
}

interface TechnicalIndicatorData {
  date: string
  value: number
  [key: string]: any
}

interface TechnicalIndicatorResponse {
  data: {
    metaData: any
    timeSeries: TechnicalIndicatorData[]
    function: string
  }
  isMockData: boolean
  rateLimitMessage?: string
}

export function TechnicalIndicatorsWidget({ widget, onUpdate, onConfigure }: TechnicalIndicatorsWidgetProps) {
  const [selectedIndicator, setSelectedIndicator] = useState("SMA")
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [timePeriod, setTimePeriod] = useState("20")
  const [interval, setInterval] = useState("daily")
  const [seriesType, setSeriesType] = useState("close")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [indicatorData, setIndicatorData] = useState<TechnicalIndicatorResponse | null>(null)

  const availableIndicators = [
    { value: "SMA", label: "Simple Moving Average" },
    { value: "EMA", label: "Exponential Moving Average" },
    { value: "RSI", label: "Relative Strength Index" },
    { value: "MACD", label: "MACD" },
    { value: "STOCH", label: "Stochastic Oscillator" },
    { value: "ADX", label: "Average Directional Index" },
    { value: "CCI", label: "Commodity Channel Index" },
    { value: "AROON", label: "Aroon" },
    { value: "BBANDS", label: "Bollinger Bands" },
    { value: "AD", label: "Accumulation/Distribution" }
  ]

  const fetchTechnicalIndicator = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        function: selectedIndicator,
        symbol: selectedSymbol,
        interval: interval,
        time_period: timePeriod,
        series_type: seriesType
      })

      const response = await fetch(`/api/stocks/technical-indicators?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch technical indicator data')
      }

      setIndicatorData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const forceRefresh = () => {
    fetchTechnicalIndicator()
  }

  useEffect(() => {
    fetchTechnicalIndicator()
  }, [selectedIndicator, selectedSymbol, timePeriod, interval, seriesType])

  const chartData = useMemo(() => {
    if (!indicatorData?.data?.timeSeries) return []
    
    return indicatorData.data.timeSeries.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      value: item.value,
      [selectedIndicator]: item.value
    })).slice(-30) // Show last 30 data points
  }, [indicatorData, selectedIndicator])

  const isMockData = useMemo(() => indicatorData?.isMockData || false, [indicatorData?.isMockData])
  const rateLimitMessage = useMemo(() => indicatorData?.rateLimitMessage, [indicatorData?.rateLimitMessage])

  const getIndicatorColor = () => {
    if (!chartData.length) return "#8884d8"
    
    const firstValue = chartData[0].value
    const lastValue = chartData[chartData.length - 1].value
    
    return lastValue > firstValue ? "#22c55e" : "#ef4444"
  }

  const getTrendIcon = () => {
    if (!chartData.length) return <Activity className="h-4 w-4" />
    
    const firstValue = chartData[0].value
    const lastValue = chartData[chartData.length - 1].value
    
    return lastValue > firstValue ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />
  }

  return (
    <Card className="h-full bg-slate-900/50 border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
            {getTrendIcon()}
            <span>Technical Indicators</span>
            {isMockData && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                Demo Data
              </span>
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
            <Label htmlFor="indicator" className="text-xs text-slate-400">Indicator</Label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableIndicators.map(indicator => (
                  <SelectItem key={indicator.value} value={indicator.value}>
                    {indicator.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="timePeriod" className="text-xs text-slate-400">Time Period</Label>
            <Input
              id="timePeriod"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-slate-100"
              placeholder="20"
            />
          </div>

          <div>
            <Label htmlFor="interval" className="text-xs text-slate-400">Interval</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1min">1 Minute</SelectItem>
                <SelectItem value="5min">5 Minutes</SelectItem>
                <SelectItem value="15min">15 Minutes</SelectItem>
                <SelectItem value="30min">30 Minutes</SelectItem>
                <SelectItem value="60min">1 Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
            {sanitizeErrorForDisplay(error)}
          </div>
        )}

        {loading && !indicatorData ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading technical indicator data...
          </div>
        ) : chartData.length > 0 ? (
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={getIndicatorColor()}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: getIndicatorColor() }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Current Value */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div>
                <p className="text-sm text-slate-400">{selectedIndicator} ({selectedSymbol})</p>
                <p className="text-lg font-semibold text-slate-100">
                  {chartData[chartData.length - 1]?.value?.toFixed(4) || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Period: {timePeriod}</p>
                <p className="text-sm text-slate-400">Interval: {interval}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <p>No technical indicator data available</p>
          </div>
        )}

        {isMockData && rateLimitMessage && (
          <div className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded border border-yellow-500/30">
            {rateLimitMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
