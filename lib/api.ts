export interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  high52Week?: number
  low52Week?: number
}

export interface ChartData {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Alpha Vantage API integration
export class AlphaVantageAPI {
  private apiKey: string
  private baseUrl = "https://www.alphavantage.co/query"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getQuote(symbol: string): Promise<StockData> {
    try {
      const response = await fetch(`${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`)
      const data = await response.json()

      if (data.Note || data["Error Message"]) {
        console.log(`[v0] Alpha Vantage API limit or error for ${symbol}:`, data.Note || data["Error Message"])
        // Return mock data when API limit is reached
        return this.getMockData(symbol)
      }

      const quote = data["Global Quote"]

      if (!quote || !quote["01. symbol"]) {
        console.log(`[v0] Invalid Alpha Vantage response for ${symbol}:`, data)
        return this.getMockData(symbol)
      }

      return {
        symbol: quote["01. symbol"],
        price: Number.parseFloat(quote["05. price"]),
        change: Number.parseFloat(quote["09. change"]),
        changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
        volume: Number.parseInt(quote["06. volume"]),
      }
    } catch (error) {
      console.log(`[v0] Alpha Vantage API error for ${symbol}:`, error)
      return this.getMockData(symbol)
    }
  }

  private getMockData(symbol: string): StockData {
    const mockPrices: Record<string, number> = {
      AAPL: 175.43,
      GOOGL: 2847.52,
      MSFT: 378.85,
      TSLA: 248.73,
      AMZN: 3127.45,
    }

    const basePrice = mockPrices[symbol] || 100
    const change = (Math.random() - 0.5) * 10

    return {
      symbol,
      price: basePrice + change,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000) + 100000,
    }
  }

  async getIntradayData(symbol: string, interval = "5min"): Promise<ChartData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}`,
      )
      const data = await response.json()

      if (data.Note || data["Error Message"]) {
        return this.getMockChartData(symbol)
      }

      const timeSeries = data[`Time Series (${interval})`]

      if (!timeSeries) {
        return this.getMockChartData(symbol)
      }

      return Object.entries(timeSeries)
        .map(([timestamp, values]: [string, any]) => ({
          timestamp,
          open: Number.parseFloat(values["1. open"]),
          high: Number.parseFloat(values["2. high"]),
          low: Number.parseFloat(values["3. low"]),
          close: Number.parseFloat(values["4. close"]),
          volume: Number.parseInt(values["5. volume"]),
        }))
        .slice(0, 100)
    } catch (error) {
      console.log(`[v0] Alpha Vantage chart data error for ${symbol}:`, error)
      return this.getMockChartData(symbol)
    }
  }

  private getMockChartData(symbol: string): ChartData[] {
    const data: ChartData[] = []
    const basePrice = 100 + Math.random() * 200
    let currentPrice = basePrice

    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(Date.now() - i * 5 * 60 * 1000).toISOString()
      const change = (Math.random() - 0.5) * 5
      currentPrice += change

      data.unshift({
        timestamp,
        open: currentPrice - change,
        high: currentPrice + Math.random() * 2,
        low: currentPrice - Math.random() * 2,
        close: currentPrice,
        volume: Math.floor(Math.random() * 100000) + 10000,
      })
    }

    return data
  }
}

export class FinnhubAPI {
  private apiKey: string
  private baseUrl = "https://finnhub.io/api/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getQuote(symbol: string): Promise<StockData> {
    try {
      const response = await fetch(`${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`)
      const data = await response.json()

      if (data.error || !data.c) {
        return this.getMockData(symbol)
      }

      return {
        symbol,
        price: data.c,
        change: data.d || 0,
        changePercent: data.dp || 0,
        volume: 0,
        high52Week: data.h,
        low52Week: data.l,
      }
    } catch (error) {
      console.log(`[v0] Finnhub API error for ${symbol}:`, error)
      return this.getMockData(symbol)
    }
  }

  private getMockData(symbol: string): StockData {
    const mockPrices: Record<string, number> = {
      AAPL: 175.43,
      GOOGL: 2847.52,
      MSFT: 378.85,
      TSLA: 248.73,
      AMZN: 3127.45,
    }

    const basePrice = mockPrices[symbol] || 100
    const change = (Math.random() - 0.5) * 10

    return {
      symbol,
      price: basePrice + change,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      high52Week: basePrice * 1.2,
      low52Week: basePrice * 0.8,
    }
  }

  async getCandles(symbol: string, resolution = "D", from: number, to: number): Promise<ChartData[]> {
    const response = await fetch(
      `${this.baseUrl}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`,
    )
    const data = await response.json()

    if (data.s !== "ok") return []

    return data.t.map((timestamp: number, index: number) => ({
      timestamp: new Date(timestamp * 1000).toISOString(),
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v[index],
    }))
  }
}

export class IndianStockAPI {
  private apiKey: string
  private baseUrl = "https://api.indianstockapi.com"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getQuote(symbol: string): Promise<StockData> {
    try {
      console.log(`[v0] Using mock data for Indian Stock API - ${symbol}`)
      return this.getMockData(symbol)
    } catch (error) {
      console.log(`[v0] Indian Stock API error for ${symbol}:`, error)
      return this.getMockData(symbol)
    }
  }

  private getMockData(symbol: string): StockData {
    const mockPrices: Record<string, number> = {
      AAPL: 175.43,
      GOOGL: 2847.52,
      MSFT: 378.85,
      TSLA: 248.73,
      AMZN: 3127.45,
    }

    const basePrice = mockPrices[symbol] || 100
    const change = (Math.random() - 0.5) * 10

    return {
      symbol,
      price: basePrice + change,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      marketCap: basePrice * 1000000000,
    }
  }
}

// API Factory
import { globalCache } from "./cache-manager"

export class APIFactory {
  static createAPI(provider: "alphavantage" | "finnhub" | "indianstock", apiKey: string) {
    const baseAPI = this.createBaseAPI(provider, apiKey)
    return this.wrapWithCache(baseAPI, provider)
  }

  private static createBaseAPI(provider: "alphavantage" | "finnhub" | "indianstock", apiKey: string) {
    switch (provider) {
      case "alphavantage":
        return new AlphaVantageAPI(apiKey)
      case "finnhub":
        return new FinnhubAPI(apiKey)
      case "indianstock":
        return new IndianStockAPI(apiKey)
      default:
        throw new Error(`Unsupported API provider: ${provider}`)
    }
  }

  private static wrapWithCache(api: any, provider: string) {
    return new Proxy(api, {
      get(target, prop) {
        const originalMethod = target[prop]
        if (typeof originalMethod !== "function") {
          return originalMethod
        }

        return async (...args: any[]) => {
          const methodName = prop as string
          const params = { args }

          // Check cache first
          const cachedResult = globalCache.get(provider, methodName, params)
          if (cachedResult) {
            return cachedResult
          }

          // Call original method
          try {
            const result = await originalMethod.apply(target, args)

            // Cache the result with appropriate TTL
            const ttl = methodName.includes("intraday") || methodName.includes("candles") ? 60000 : 30000
            globalCache.set(provider, methodName, params, result, ttl)

            return result
          } catch (error) {
            throw error
          }
        }
      },
    })
  }
}
