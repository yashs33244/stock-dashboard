"use client"

import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MockDataIndicatorProps {
  isMockData: boolean
  rateLimitMessage?: string
  className?: string
}

export function MockDataIndicator({ isMockData, rateLimitMessage, className = "" }: MockDataIndicatorProps) {
  if (!isMockData) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20 ${className}`}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Demo Data
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium text-yellow-400 mb-1">Demo Data Active</p>
            <p className="text-sm text-slate-300">
              {rateLimitMessage || "Free API rate limit reached. Showing sample data for demonstration purposes."}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface MockDataBannerProps {
  isMockData: boolean
  rateLimitMessage?: string
  onDismiss?: () => void
}

export function MockDataBanner({ isMockData, rateLimitMessage, onDismiss }: MockDataBannerProps) {
  if (!isMockData) return null

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
      <div className="flex items-start space-x-2">
        <Info className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-400">Demo Data Mode</p>
          <p className="text-xs text-slate-300 mt-1">
            {rateLimitMessage || "Free API rate limit reached. Showing sample data for demonstration purposes."}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-yellow-400 hover:text-yellow-300 text-sm"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
