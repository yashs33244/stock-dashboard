import { globalCache } from "./cache-manager"

export interface ConnectionStatus {
  isConnected: boolean
  lastUpdate: number
  error?: string
}

export interface RealTimeConfig {
  refreshInterval: number
  maxRetries: number
  retryDelay: number
}

export class RealTimeService {
  private static instance: RealTimeService
  private subscribers = new Map<string, Set<(data: any) => void>>()
  private intervals = new Map<string, NodeJS.Timeout>()
  private connectionStatus: ConnectionStatus = {
    isConnected: true,
    lastUpdate: Date.now(),
  }
  private statusSubscribers = new Set<(status: ConnectionStatus) => void>()

  private constructor() {
    // Monitor connection status
    this.startConnectionMonitoring()
  }

  static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService()
    }
    return RealTimeService.instance
  }

  // Subscribe to real-time updates for specific data
  subscribe(
    key: string,
    callback: (data: any) => void,
    config: {
      provider: "alphavantage" | "finnhub" | "indianstock"
      method: "quote" | "intraday" | "candles"
      params: Record<string, any>
      refreshInterval: number
    },
  ): () => void {
    // Add subscriber
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key)!.add(callback)

    // Start data fetching if this is the first subscriber
    if (this.subscribers.get(key)!.size === 1) {
      this.startDataFetching(key, config)
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(key)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.stopDataFetching(key)
          this.subscribers.delete(key)
        }
      }
    }
  }

  // Subscribe to connection status updates
  subscribeToStatus(callback: (status: ConnectionStatus) => void): () => void {
    this.statusSubscribers.add(callback)
    callback(this.connectionStatus) // Send current status immediately

    return () => {
      this.statusSubscribers.delete(callback)
    }
  }

  // Get current connection status
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  // Force refresh specific data
  async forceRefresh(key: string): Promise<void> {
    const interval = this.intervals.get(key)
    if (interval) {
      // Clear existing interval and restart immediately
      clearInterval(interval)
      // The interval will be recreated by the next fetch cycle
    }
  }

  // Invalidate cache for specific provider/method
  invalidateCache(provider?: string, method?: string): void {
    globalCache.invalidate(provider, method)
  }

  // Private methods
  private async startDataFetching(
    key: string,
    config: {
      provider: "alphavantage" | "finnhub" | "indianstock"
      method: "quote" | "intraday" | "candles"
      params: Record<string, any>
      refreshInterval: number
    },
  ): Promise<void> {
    const fetchData = async () => {
      try {
        // Check cache first
        const cachedData = globalCache.get(config.provider, config.method, config.params)
        if (cachedData) {
          this.notifySubscribers(key, cachedData)
          return
        }

        let data: any

        if (config.method === "quote") {
          // Use the secure quote API route
          const response = await fetch("/api/stocks/quote", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: config.provider,
              symbols: config.params.symbols || [config.params.symbol],
            }),
          })

          if (response.ok) {
            const result = await response.json()
            data = config.params.symbols ? result.data : result.data[0]
          }
        } else if (config.method === "intraday" || config.method === "candles") {
          // Use the secure chart API route
          const response = await fetch("/api/stocks/chart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: config.provider,
              symbol: config.params.symbol,
              interval: config.params.interval,
            }),
          })

          if (response.ok) {
            const result = await response.json()
            data = result.data
          }
        }

        if (data) {
          // Cache the data
          globalCache.set(config.provider, config.method, config.params, data, config.refreshInterval)

          // Notify subscribers
          this.notifySubscribers(key, data)

          // Update connection status
          this.updateConnectionStatus(true)
        }
      } catch (error) {
        console.error(`Failed to fetch data for ${key}:`, error)
        this.updateConnectionStatus(false, error instanceof Error ? error.message : "Unknown error")
      }
    }

    // Initial fetch
    await fetchData()

    // Set up interval for subsequent fetches
    const interval = setInterval(fetchData, config.refreshInterval)
    this.intervals.set(key, interval)
  }

  private stopDataFetching(key: string): void {
    const interval = this.intervals.get(key)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(key)
    }
  }

  private notifySubscribers(key: string, data: any): void {
    const subscribers = this.subscribers.get(key)
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error("Error in subscriber callback:", error)
        }
      })
    }
  }

  private updateConnectionStatus(isConnected: boolean, error?: string): void {
    const newStatus: ConnectionStatus = {
      isConnected,
      lastUpdate: Date.now(),
      error: isConnected ? undefined : error,
    }

    this.connectionStatus = newStatus

    // Notify status subscribers
    this.statusSubscribers.forEach((callback) => {
      try {
        callback(newStatus)
      } catch (error) {
        console.error("Error in status subscriber callback:", error)
      }
    })
  }

  private startConnectionMonitoring(): void {
    // Check connection every 30 seconds
    setInterval(() => {
      const timeSinceLastUpdate = Date.now() - this.connectionStatus.lastUpdate
      if (timeSinceLastUpdate > 60000) {
        // No updates for over 1 minute
        this.updateConnectionStatus(false, "No recent updates")
      }
    }, 30000)
  }

  // Cleanup
  destroy(): void {
    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()

    // Clear subscribers
    this.subscribers.clear()
    this.statusSubscribers.clear()
  }
}

// Global service instance
export const realTimeService = RealTimeService.getInstance()
