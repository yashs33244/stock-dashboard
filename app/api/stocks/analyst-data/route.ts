import { NextRequest, NextResponse } from 'next/server'
import { detectRateLimit } from '@/lib/rate-limit-detector'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const symbol = searchParams.get('symbol')
        const type = searchParams.get('type') || 'recommendation' // recommendation or price-target

        if (!symbol) {
            return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 })
        }

        // Get API key
        const apiKey = process.env.FINHUB_API
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 })
        }

        let url: string
        if (type === 'price-target') {
            // Price target endpoint
            const params = new URLSearchParams({
                symbol: symbol,
                token: apiKey
            })
            url = `https://finnhub.io/api/v1/stock/price-target?${params.toString()}`
        } else {
            // Recommendation trends endpoint
            const params = new URLSearchParams({
                symbol: symbol,
                token: apiKey
            })
            url = `https://finnhub.io/api/v1/stock/recommendation?${params.toString()}`
        }

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

            // Return mock analyst data
            const mockData = generateMockAnalystData(symbol, type)

            return NextResponse.json({
                data: mockData,
                isMockData: true,
                rateLimitMessage: rateLimitMessage
            })
        }

        // Process successful response
        const analystData = processAnalystData(data, type)

        return NextResponse.json({
            data: analystData,
            isMockData: false,
            rateLimitMessage: undefined
        })

    } catch (error) {
        console.error(" Analyst data API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function processAnalystData(data: any, type: string): any {
    if (type === 'price-target') {
        return {
            symbol: data.symbol,
            targetHigh: data.targetHigh,
            targetLow: data.targetLow,
            targetMean: data.targetMean,
            targetMedian: data.targetMedian
        }
    } else {
        return {
            symbol: data.symbol,
            recommendations: data || []
        }
    }
}

function generateMockAnalystData(symbol: string, type: string): any {
    if (type === 'price-target') {
        const basePrice = 150 + Math.random() * 100
        return {
            symbol: symbol,
            targetHigh: (basePrice * 1.2).toFixed(2),
            targetLow: (basePrice * 0.8).toFixed(2),
            targetMean: (basePrice * 1.05).toFixed(2),
            targetMedian: (basePrice * 1.0).toFixed(2)
        }
    } else {
        // Mock recommendation trends
        const recommendations = []
        const currentDate = new Date()

        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getTime() - i * 30 * 24 * 60 * 60 * 1000)
            const rating = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'][Math.floor(Math.random() * 5)]

            recommendations.push({
                symbol: symbol,
                date: date.toISOString().split('T')[0],
                period: date.toISOString().split('T')[0],
                strongBuy: Math.floor(Math.random() * 10),
                buy: Math.floor(Math.random() * 15),
                hold: Math.floor(Math.random() * 8),
                sell: Math.floor(Math.random() * 3),
                strongSell: Math.floor(Math.random() * 2)
            })
        }

        return {
            symbol: symbol,
            recommendations: recommendations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }
    }
}
