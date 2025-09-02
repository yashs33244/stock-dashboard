import { type NextRequest, NextResponse } from "next/server"
import { APIFactory } from "@/lib/api"

export async function POST(request: NextRequest) {
  try {
    const { provider, symbol, interval } = await request.json()

    if (!provider || !symbol) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    let apiKey: string | undefined
    switch (provider) {
      case "alphavantage":
        apiKey = process.env.ALPHAVANTAGE_API_KEY
        break
      case "finnhub":
        apiKey = process.env.FINHUB_API
        break
      case "indianstock":
        apiKey = process.env.INDIAN_STOCK_API
        break
      default:
        return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const api = APIFactory.createAPI(provider, apiKey)

    let chartData
    if (provider === "alphavantage") {
      chartData = await api.getIntradayData(symbol, interval || "5min")
    } else if (provider === "finnhub") {
      const to = Math.floor(Date.now() / 1000)
      const from = to - 30 * 24 * 60 * 60 // 30 days ago
      chartData = await api.getCandles(symbol, "D", from, to)
    } else {
      const now = new Date()
      chartData = Array.from({ length: 50 }, (_, i) => {
        const timestamp = new Date(now.getTime() - (49 - i) * 5 * 60 * 1000)
        const basePrice = 150 + Math.sin(i / 10) * 20
        const volatility = Math.random() * 5 - 2.5
        return {
          timestamp: timestamp.toISOString(),
          open: basePrice + volatility,
          high: basePrice + volatility + Math.random() * 3,
          low: basePrice + volatility - Math.random() * 3,
          close: basePrice + volatility + (Math.random() - 0.5) * 2,
          volume: Math.floor(Math.random() * 1000000) + 500000,
        }
      })
    }

    return NextResponse.json({ data: chartData })
  } catch (error) {
    console.error(" Chart API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
