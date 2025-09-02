"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRealTimeConnectionStatus } from "@/hooks/use-connection-status"
import { Wifi, WifiOff, Clock } from "lucide-react"

export function ConnectionStatus() {
  const {
    isConnected,
    isStale,
    timeSinceUpdate,
    lastUpdate,
    error,
  } = useRealTimeConnectionStatus()

  const getStatusColor = () => {
    if (!isConnected) return "destructive"
    if (isStale) return "secondary"
    return "default"
  }

  const getStatusText = () => {
    if (!isConnected) return "Disconnected"
    if (isStale) return "Stale"
    return "Connected"
  }

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="h-3 w-3" />
    if (isStale) return <Clock className="h-3 w-3" />
    return <Wifi className="h-3 w-3" />
  }

  const formatLastUpdate = () => {
    if (timeSinceUpdate < 60000) {
      return `${Math.floor(timeSinceUpdate / 1000)}s ago`
    } else if (timeSinceUpdate < 3600000) {
      return `${Math.floor(timeSinceUpdate / 60000)}m ago`
    } else {
      return new Date(lastUpdate).toLocaleTimeString()
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getStatusColor()} className="flex items-center space-x-1 cursor-help">
            {getStatusIcon()}
            <span className="text-xs">{getStatusText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p>Status: {getStatusText()}</p>
            <p>Last Update: {formatLastUpdate()}</p>
            {error && <p className="text-destructive">Error: {error}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
