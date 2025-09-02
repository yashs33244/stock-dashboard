"use client"

import { useState, useEffect, useCallback } from "react"
import { realTimeService, type ConnectionStatus } from "@/lib/real-time-service"

export interface UseRealTimeDataOptions {
  provider: "alphavantage" | "finnhub" | "indianstock"
  method: "quote" | "intraday" | "candles"
  params: Record<string, any>
  refreshInterval: number
  enabled?: boolean
}

export function useRealTimeData<T>(options: UseRealTimeDataOptions) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const { provider, method, params, refreshInterval, enabled = true } = options

  // Generate unique key for this subscription
  const key = `${provider}:${method}:${JSON.stringify(params)}`

  const handleData = useCallback((newData: T) => {
    setData(newData)
    setLoading(false)
    setError(null)
    setLastUpdated(Date.now())
  }, [])

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = realTimeService.subscribe(key, handleData, {
      provider,
      method,
      params,
      refreshInterval,
    })

    return unsubscribe
  }, [key, provider, method, JSON.stringify(params), refreshInterval, enabled, handleData])

  const forceRefresh = useCallback(() => {
    if (enabled) {
      setLoading(true)
      realTimeService.forceRefresh(key)
    }
  }, [key, enabled])

  return {
    data,
    loading,
    error,
    lastUpdated,
    forceRefresh,
  }
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(() => realTimeService.getConnectionStatus())

  useEffect(() => {
    const unsubscribe = realTimeService.subscribeToStatus(setStatus)
    return unsubscribe
  }, [])

  return status
}
