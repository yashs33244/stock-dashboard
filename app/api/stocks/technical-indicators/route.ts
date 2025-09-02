import { NextRequest, NextResponse } from 'next/server'
import { detectRateLimit } from '@/lib/rate-limit-detector'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const function_name = searchParams.get('function')
        const symbol = searchParams.get('symbol')
        const interval = searchParams.get('interval') || 'daily'
        const time_period = searchParams.get('time_period') || '20'
        const series_type = searchParams.get('series_type') || 'close'

        if (!function_name || !symbol) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        // Get API key based on provider
        let apiKey = process.env.ALPHAVANTAGE_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 })
        }

        // Build Alpha Vantage URL
        const params = new URLSearchParams({
            function: function_name,
            symbol: symbol,
            interval: interval,
            time_period: time_period,
            series_type: series_type,
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

            // Return mock technical indicator data
            const mockData = generateMockTechnicalIndicator(function_name, symbol, interval, time_period)

            return NextResponse.json({
                data: mockData,
                isMockData: true,
                rateLimitMessage: rateLimitMessage
            })
        }

        // Process successful response
        const technicalData = processTechnicalIndicatorData(data, function_name)

        return NextResponse.json({
            data: technicalData,
            isMockData: false,
            rateLimitMessage: undefined
        })

    } catch (error) {
        console.error(" Technical indicators API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function processTechnicalIndicatorData(data: any, function_name: string): any {
    // Extract the relevant data based on the function type
    const metaData = data['Meta Data'] || {}
    const timeSeries = data[`Technical Analysis: ${function_name}`] || {}

    // Convert time series to array format
    const timeSeriesArray = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        value: parseFloat(values[function_name]) || 0,
        ...values
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
        metaData,
        timeSeries: timeSeriesArray,
        function: function_name
    }
}

function generateMockTechnicalIndicator(function_name: string, symbol: string, interval: string, time_period: string): any {
    const now = new Date()
    const timeSeries = []

    // Generate mock data for the last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const baseValue = 100 + Math.random() * 50 // Base value between 100-150

        timeSeries.push({
            date: date.toISOString().split('T')[0],
            value: baseValue + (Math.random() - 0.5) * 10, // Add some variation
            [function_name]: (baseValue + (Math.random() - 0.5) * 10).toFixed(4)
        })
    }

    return {
        metaData: {
            "1: Symbol": symbol,
            "2: Indicator": function_name,
            "3: Last Refreshed": now.toISOString(),
            "4: Interval": interval,
            "5: Time Period": time_period,
            "6: Series Type": "close",
            "7: Time Zone": "US/Eastern"
        },
        timeSeries,
        function: function_name
    }
}
