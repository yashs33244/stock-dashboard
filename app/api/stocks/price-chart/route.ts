import { NextRequest, NextResponse } from 'next/server'
import { detectRateLimit } from '@/lib/rate-limit-detector'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const symbol = searchParams.get('symbol')
        const interval = searchParams.get('interval') || 'daily'

        if (!symbol) {
            return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 })
        }

        // Get API key
        const apiKey = process.env.ALPHAVANTAGE_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 })
        }

        // Build Alpha Vantage URL
        const params = new URLSearchParams({
            function: interval === 'daily' ? 'TIME_SERIES_DAILY' : 'TIME_SERIES_INTRADAY',
            symbol: symbol,
            interval: interval,
            outputsize: 'compact',
            apikey: apiKey
        })

        const url = `https://www.alphavantage.co/query?${params.toString()}`

        const response = await fetch(url)
        const data = await response.json()

        // Check for rate limiting
        const rateLimitInfo = detectRateLimit(response, data)
        let isRateLimited = rateLimitInfo.isRateLimited
        let rateLimitMessage = rateLimitInfo.message || ""

        // Handle rate limiting or API errors
        if (isRateLimited || data['Error Message'] || data['Note']) {
            isRateLimited = true
            rateLimitMessage = data['Error Message'] || data['Note'] || "Rate limit exceeded"

            // Return mock price chart data
            const mockData = generateMockPriceChartData(symbol, interval)

            return NextResponse.json({
                data: mockData,
                isMockData: true,
                rateLimitMessage: rateLimitMessage
            })
        }

        // Process successful response
        const priceData = processPriceChartData(data, interval)

        return NextResponse.json({
            data: priceData,
            isMockData: false,
            rateLimitMessage: undefined
        })

    } catch (error) {
        console.error(" Price chart API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function processPriceChartData(data: any, interval: string): any {
    const timeSeriesKey = interval === 'daily' ? 'Time Series (Daily)' : 'Time Series (5min)'
    const metaDataKey = 'Meta Data'

    const metaData = data[metaDataKey] || {}
    const timeSeries = data[timeSeriesKey] || {}

    // Convert time series to array format
    const timeSeriesArray = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']) || 0,
        high: parseFloat(values['2. high']) || 0,
        low: parseFloat(values['3. low']) || 0,
        close: parseFloat(values['4. close']) || 0,
        volume: parseInt(values['5. volume']) || 0
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
        metaData: {
            symbol: metaData['2. Symbol'] || '',
            lastRefreshed: metaData['3. Last Refreshed'] || '',
            interval: metaData['4. Interval'] || interval,
            timeZone: metaData['6. Time Zone'] || 'US/Eastern'
        },
        timeSeries: timeSeriesArray
    }
}

function generateMockPriceChartData(symbol: string, interval: string): any {
    const now = new Date()
    const timeSeries = []

    // Generate mock data for the last 30 days
    const days = interval === 'daily' ? 30 : 7
    const basePrice = 150 + Math.random() * 100 // Base price between 150-250
    let currentPrice = basePrice

    for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)

        // Generate realistic OHLC data
        const volatility = 0.02 // 2% daily volatility
        const priceChange = (Math.random() - 0.5) * volatility * currentPrice
        const open = currentPrice
        const close = currentPrice + priceChange
        const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5
        const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5
        const volume = Math.floor(Math.random() * 10000000 + 1000000) // 1M to 11M volume

        timeSeries.push({
            date: date.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: volume
        })

        currentPrice = close
    }

    return {
        metaData: {
            symbol: symbol,
            lastRefreshed: now.toISOString(),
            interval: interval,
            timeZone: "US/Eastern"
        },
        timeSeries: timeSeries
    }
}
