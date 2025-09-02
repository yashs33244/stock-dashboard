import { type NextRequest, NextResponse } from "next/server"
import { APIFactory } from "@/lib/api"

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

    // Filter successful results
    const successfulQuotes = quotes
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map((result) => result.value)

    return NextResponse.json({ data: successfulQuotes })
  } catch (error) {
    console.error(" API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
