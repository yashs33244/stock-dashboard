import { NextRequest, NextResponse } from 'next/server'
import { detectRateLimit } from '@/lib/rate-limit-detector'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const symbol = searchParams.get('symbol')

        if (!symbol) {
            return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 })
        }

        // Get API key
        const apiKey = process.env.FINHUB_API
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 })
        }

        // Build Finnhub URL
        const params = new URLSearchParams({
            symbol: symbol,
            token: apiKey
        })

        const url = `https://finnhub.io/api/v1/stock/profile2?${params.toString()}`

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

            // Return mock company profile data
            const mockData = generateMockCompanyProfile(symbol)

            return NextResponse.json({
                data: mockData,
                isMockData: true,
                rateLimitMessage: rateLimitMessage
            })
        }

        // Process successful response
        const companyProfile = processCompanyProfileData(data)

        return NextResponse.json({
            data: companyProfile,
            isMockData: false,
            rateLimitMessage: undefined
        })

    } catch (error) {
        console.error(" Company profile API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function processCompanyProfileData(data: any): any {
    return {
        country: data.country,
        currency: data.currency,
        exchange: data.exchange,
        ipo: data.ipo,
        marketCapitalization: data.marketCapitalization,
        name: data.name,
        phone: data.phone,
        shareOutstanding: data.shareOutstanding,
        ticker: data.ticker,
        weburl: data.weburl,
        logo: data.logo,
        finnhubIndustry: data.finnhubIndustry
    }
}

function generateMockCompanyProfile(symbol: string): any {
    const companies = {
        'AAPL': {
            country: 'US',
            currency: 'USD',
            exchange: 'NASDAQ',
            ipo: '1980-12-12',
            marketCapitalization: 3000000000000,
            name: 'Apple Inc',
            phone: '14089961010',
            shareOutstanding: 15728700000,
            ticker: 'AAPL',
            weburl: 'https://www.apple.com/',
            logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
            finnhubIndustry: 'Technology'
        },
        'GOOGL': {
            country: 'US',
            currency: 'USD',
            exchange: 'NASDAQ',
            ipo: '2004-08-19',
            marketCapitalization: 1800000000000,
            name: 'Alphabet Inc Class A',
            phone: '16502530000',
            shareOutstanding: 12500000000,
            ticker: 'GOOGL',
            weburl: 'https://abc.xyz/',
            logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
            finnhubIndustry: 'Technology'
        },
        'MSFT': {
            country: 'US',
            currency: 'USD',
            exchange: 'NASDAQ',
            ipo: '1986-03-13',
            marketCapitalization: 2800000000000,
            name: 'Microsoft Corp',
            phone: '14258828080',
            shareOutstanding: 7500000000,
            ticker: 'MSFT',
            weburl: 'https://www.microsoft.com/',
            logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
            finnhubIndustry: 'Technology'
        },
        'TSLA': {
            country: 'US',
            currency: 'USD',
            exchange: 'NASDAQ',
            ipo: '2010-06-29',
            marketCapitalization: 800000000000,
            name: 'Tesla Inc',
            phone: '16506810000',
            shareOutstanding: 3200000000,
            ticker: 'TSLA',
            weburl: 'https://www.tesla.com/',
            logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
            finnhubIndustry: 'Automotive'
        },
        'AMZN': {
            country: 'US',
            currency: 'USD',
            exchange: 'NASDAQ',
            ipo: '1997-05-15',
            marketCapitalization: 1500000000000,
            name: 'Amazon.com Inc',
            phone: '12062061000',
            shareOutstanding: 10000000000,
            ticker: 'AMZN',
            weburl: 'https://www.amazon.com/',
            logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
            finnhubIndustry: 'Consumer Discretionary'
        }
    }

    return companies[symbol as keyof typeof companies] || {
        country: 'US',
        currency: 'USD',
        exchange: 'NASDAQ',
        ipo: '2020-01-01',
        marketCapitalization: 100000000000,
        name: `${symbol} Inc`,
        phone: '15551234567',
        shareOutstanding: 1000000000,
        ticker: symbol,
        weburl: `https://www.${symbol.toLowerCase()}.com/`,
        logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
        finnhubIndustry: 'Technology'
    }
}
