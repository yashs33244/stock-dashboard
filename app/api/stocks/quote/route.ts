import { type NextRequest, NextResponse } from "next/server"
import { APIFactory } from "@/lib/api"
import { detectRateLimit } from "@/lib/rate-limit-detector"

export async function POST(request: NextRequest) {
  try {
    const { provider, symbols } = await request.json()

    if (!provider || !symbols || !Array.isArray(symbols)) {
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
    let isRateLimited = false
    let rateLimitMessage = ""

    // Fetch quotes for all symbols
    const quotes = await Promise.allSettled(
      symbols.map(async (symbol: string) => {
        try {
          return await api.getQuote(symbol)
        } catch (error) {
          console.log(` Error fetching quote for ${symbol}:`, error)
          throw error
        }
      }),
    )

    // Filter successful results and check for rate limiting
    const successfulQuotes = quotes
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map((result) => result.value)

    // Check if any quotes indicate rate limiting (mock data)
    if (successfulQuotes.length > 0) {
      // If we got mock data, it means rate limiting occurred
      const hasMockData = successfulQuotes.some(quote =>
        quote.symbol && quote.price && quote.price > 0 && quote.price < 1000 // Mock data typically has reasonable prices
      )

      if (hasMockData) {
        isRateLimited = true
        rateLimitMessage = "API rate limit exceeded, showing sample data"
      }
    }

    return NextResponse.json({
      data: successfulQuotes,
      isMockData: isRateLimited,
      rateLimitMessage: isRateLimited ? rateLimitMessage : undefined
    })
  } catch (error) {
    console.error(" API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
