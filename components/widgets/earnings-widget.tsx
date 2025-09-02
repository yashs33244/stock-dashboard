"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, TrendingDown, Settings, RefreshCw, DollarSign, Target } from "lucide-react"
import { sanitizeErrorForDisplay } from "@/lib/error-sanitizer"
import type { Widget } from "@/lib/store"

interface EarningsWidgetProps {
  widget: Widget
  onUpdate: (data: any) => void
  onConfigure: () => void
}

interface EarningsData {
  date: string
  epsActual: string | null
  epsEstimate: string | null
  hour: string
  quarter: number
  revenueActual: number | null
  revenueEstimate: number | null
  symbol: string
  year: number
}

interface EarningsResponse {
  data: {
    earningsCalendar: EarningsData[]
    totalResults: number
  }
  isMockData: boolean
  rateLimitMessage?: string
}

export function EarningsWidget({ widget, onUpdate, onConfigure }: EarningsWidgetProps) {
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [earningsData, setEarningsData] = useState<EarningsResponse | null>(null)

  const fetchEarnings = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate
      })

      const response = await fetch(`/api/stocks/earnings?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch earnings data')
      }

      setEarningsData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const forceRefresh = () => {
    fetchEarnings()
  }

  useEffect(() => {
    fetchEarnings()
  }, [fromDate, toDate])

  const isMockData = useMemo(() => earningsData?.isMockData || false, [earningsData?.isMockData])
  const rateLimitMessage = useMemo(() => earningsData?.rateLimitMessage, [earningsData?.rateLimitMessage])

  const upcomingEarnings = useMemo(() => {
    if (!earningsData?.data?.earningsCalendar) return []
    
    const now = new Date()
    return earningsData.data.earningsCalendar
      .filter(earning => new Date(earning.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10) // Show next 10 earnings
  }, [earningsData])

  const getEarningsSurprise = (actual: string | null | undefined, estimate: string | null | undefined) => {
    if (!actual || !estimate) {
      return {
        surprise: 0,
        surprisePercent: 0,
        isPositive: false
      }
    }
    
    const actualNum = parseFloat(actual)
    const estimateNum = parseFloat(estimate)
    
    if (isNaN(actualNum) || isNaN(estimateNum) || estimateNum === 0) {
      return {
        surprise: 0,
        surprisePercent: 0,
        isPositive: false
      }
    }
    
    const surprise = actualNum - estimateNum
    const surprisePercent = (surprise / estimateNum) * 100
    
    return {
      surprise,
      surprisePercent,
      isPositive: surprise > 0
    }
  }

  const getRevenueSurprise = (actual: number | null | undefined, estimate: number | null | undefined) => {
    if (!actual || !estimate || actual === null || estimate === null) {
      return {
        surprise: 0,
        surprisePercent: 0,
        isPositive: false
      }
    }
    
    const surprise = actual - estimate
    const surprisePercent = (surprise / estimate) * 100
    
    return {
      surprise,
      surprisePercent,
      isPositive: surprise > 0
    }
  }

  const formatRevenue = (revenue: number | null | undefined) => {
    if (!revenue || revenue === null || revenue === undefined) return 'N/A'
    if (revenue >= 1e9) return `$${(revenue / 1e9).toFixed(2)}B`
    if (revenue >= 1e6) return `$${(revenue / 1e6).toFixed(2)}M`
    return `$${revenue.toLocaleString()}`
  }

  const getHourBadgeColor = (hour: string) => {
    switch (hour) {
      case 'bmo': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'amc': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'dmh': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getHourLabel = (hour: string) => {
    switch (hour) {
      case 'bmo': return 'Before Market Open'
      case 'amc': return 'After Market Close'
      case 'dmh': return 'During Market Hours'
      default: return hour.toUpperCase()
    }
  }

  return (
    <Card className="h-full bg-slate-900/50 border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Earnings Calendar</span>
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
        {/* Date Range Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="fromDate" className="text-xs text-slate-400">From Date</Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-slate-100"
            />
          </div>
          <div>
            <Label htmlFor="toDate" className="text-xs text-slate-400">To Date</Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-slate-100"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
            {sanitizeErrorForDisplay(error)}
          </div>
        )}

        {loading && !earningsData ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading earnings data...
          </div>
        ) : earningsData?.data ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Earnings</p>
                  <p className="text-lg font-semibold text-slate-100">
                    {earningsData.data.totalResults}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Upcoming</p>
                  <p className="text-lg font-semibold text-slate-100">
                    {upcomingEarnings.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Earnings */}
            {upcomingEarnings.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300">Upcoming Earnings</h4>
                {upcomingEarnings.map((earning, index) => (
                  <div key={index} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                          {earning.symbol}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={getHourBadgeColor(earning.hour)}
                        >
                          {getHourLabel(earning.hour)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">
                          Q{earning.quarter} {earning.year}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(earning.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">EPS Estimate</p>
                          <p className="text-sm font-semibold text-slate-100">
                            {earning.epsEstimate ? `$${earning.epsEstimate}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-400">Revenue Estimate</p>
                          <p className="text-sm font-semibold text-slate-100">
                            {formatRevenue(earning.revenueEstimate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Earnings with Surprise */}
            {earningsData.data.earningsCalendar
              .filter(earning => new Date(earning.date) < new Date())
              .slice(0, 5)
              .map((earning, index) => {
                const epsSurprise = getEarningsSurprise(earning.epsActual, earning.epsEstimate)
                const revenueSurprise = getRevenueSurprise(earning.revenueActual, earning.revenueEstimate)
                
                return (
                  <div key={index} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                          {earning.symbol}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={getHourBadgeColor(earning.hour)}
                        >
                          {getHourLabel(earning.hour)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">
                          Q{earning.quarter} {earning.year}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(earning.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400">EPS</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-slate-100">
                            {earning.epsActual ? `$${earning.epsActual}` : 'N/A'}
                          </p>
                          <div className={`flex items-center space-x-1 ${
                            epsSurprise.isPositive ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {epsSurprise.isPositive ? 
                              <TrendingUp className="h-3 w-3" /> : 
                              <TrendingDown className="h-3 w-3" />
                            }
                            <span className="text-xs">
                              {epsSurprise.surprisePercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Revenue</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-slate-100">
                            {formatRevenue(earning.revenueActual)}
                          </p>
                          <div className={`flex items-center space-x-1 ${
                            revenueSurprise.isPositive ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {revenueSurprise.isPositive ? 
                              <TrendingUp className="h-3 w-3" /> : 
                              <TrendingDown className="h-3 w-3" />
                            }
                            <span className="text-xs">
                              {revenueSurprise.surprisePercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <p>No earnings data available</p>
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
