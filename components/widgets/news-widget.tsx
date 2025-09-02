"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, RefreshCw, ExternalLink, Clock, TrendingUp } from "lucide-react"
import { useStockNews } from "@/hooks/use-stock-news"
import type { NewsData } from "@/lib/types"
import { MockDataIndicator } from "@/components/ui/mock-data-indicator"
import type { Widget } from "@/lib/store"

interface NewsWidgetProps {
  widget: Widget
  onUpdate: (data: any) => void
  onConfigure: () => void
}

export function NewsWidget({ widget, onUpdate, onConfigure }: NewsWidgetProps) {
  const {
    data: newsResponse,
    isLoading: loading,
    error,
    refetch: forceRefresh,
  } = useStockNews({
    provider: widget.config.apiProvider,
    topics: widget.config.topics || 'technology',
    limit: widget.config.limit || 10,
    refetchInterval: widget.config.refreshInterval || 300000, // 5 minutes
  })

  const newsData = useMemo(() => newsResponse?.data || [], [newsResponse?.data])
  const isMockData = useMemo(() => newsResponse?.isMockData || false, [newsResponse?.isMockData])
  const rateLimitMessage = useMemo(() => newsResponse?.rateLimitMessage, [newsResponse?.rateLimitMessage])

  // Update parent component when data changes
  useEffect(() => {
    if (newsData) {
      onUpdate(newsData)
    }
  }, [newsData]) // Remove onUpdate from dependencies to prevent infinite loops

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const published = new Date(timestamp)
    const diffMs = now.getTime() - published.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else {
      return `${diffMinutes}m ago`
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "neutral":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  return (
    <Card className="w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-lg font-semibold text-slate-100">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <MockDataIndicator 
            isMockData={isMockData} 
            rateLimitMessage={rateLimitMessage}
          />
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
          <div className="text-red-400 text-sm mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-md">{error.message}</div>
        )}

        {loading && (!newsData || newsData.length === 0) ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading news...
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {newsData && newsData.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-slate-100 text-sm leading-tight line-clamp-2">{item.title}</h3>
                  {item.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-200"
                    >
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>

                <p className="text-slate-300 text-xs mb-3 line-clamp-2">{item.summary}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-xs font-medium">{item.source}</span>
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{formatTimeAgo(item.published)}</span>
                    </div>
                  </div>

                  {item.sentiment && (
                    <Badge variant="outline" className={`text-xs ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
