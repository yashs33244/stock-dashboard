import { NextRequest, NextResponse } from 'next/server'
import { detectRateLimit } from '@/lib/rate-limit-detector'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const from = searchParams.get('from') || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const to = searchParams.get('to') || new Date().toISOString().split('T')[0]

        // Get API key
        const apiKey = process.env.FINHUB_API
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 })
        }

        // Build Finnhub URL
        const params = new URLSearchParams({
            from: from,
            to: to,
            token: apiKey
        })

        const url = `https://finnhub.io/api/v1/calendar/earnings?${params.toString()}`

        const response = await fetch(url)
        const data = await response.json()

        // Check for rate limiting
        const rateLimitInfo = detectRateLimit(response, data)
        let isRateLimited = rateLimitInfo.isRateLimited
        let rateLimitMessage = rateLimitInfo.message || ""

        // Handle rate limiting or API errors
        if (isRateLimited || data.error || response.status === 429) {
            isRateLimited = true
            rateLimitMessage = data.error || "Rate limit exceeded"

            // Return mock earnings data
            const mockData = generateMockEarningsData(from, to)

            return NextResponse.json({
                data: mockData,
                isMockData: true,
                rateLimitMessage: rateLimitMessage
            })
        }

        // Process successful response
        const earningsData = processEarningsData(data)

        return NextResponse.json({
            data: earningsData,
            isMockData: false,
            rateLimitMessage: undefined
        })

    } catch (error) {
        console.error(" Earnings API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function processEarningsData(data: any): any {
    return {
        earningsCalendar: data.earningsCalendar || [],
        totalResults: data.earningsCalendar?.length || 0
    }
}

function generateMockEarningsData(from: string, to: string): any {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC']
    const earningsCalendar = []

    // Generate mock earnings data for the date range
    const startDate = new Date(from)
    const endDate = new Date(to)
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        // Randomly add earnings on some dates
        if (Math.random() > 0.7) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)]
            const date = currentDate.toISOString().split('T')[0]

            earningsCalendar.push({
                date: date,
                epsActual: (Math.random() * 5 + 1).toFixed(2),
                epsEstimate: (Math.random() * 5 + 1).toFixed(2),
                hour: 'bmo', // Before market open
                quarter: Math.floor(Math.random() * 4) + 1,
                revenueActual: Math.floor(Math.random() * 100000000000 + 10000000000),
                revenueEstimate: Math.floor(Math.random() * 100000000000 + 10000000000),
                symbol: symbol,
                year: currentDate.getFullYear()
            })
        }

        currentDate.setDate(currentDate.getDate() + 1)
    }

    return {
        earningsCalendar: earningsCalendar.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        totalResults: earningsCalendar.length
    }
}
