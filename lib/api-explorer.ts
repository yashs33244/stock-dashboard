/**
 * API Explorer Utility
 * Systematically explores and documents all available API endpoints
 * for Alpha Vantage, Finnhub, and Indian Stock APIs
 */

export interface ApiEndpoint {
    name: string
    description: string
    url: string
    method: 'GET' | 'POST'
    parameters: Record<string, any>
    responseFormat: 'json' | 'csv'
    rateLimit?: {
        requestsPerMinute: number
        requestsPerDay: number
    }
    category: string
    provider: 'alphavantage' | 'finnhub' | 'indianstock'
}

export interface ApiProvider {
    name: string
    baseUrl: string
    apiKey: string
    endpoints: ApiEndpoint[]
    rateLimits: {
        free: { requestsPerMinute: number; requestsPerDay: number }
        premium?: { requestsPerMinute: number; requestsPerDay: number }
    }
}

// Alpha Vantage API Endpoints
export const alphaVantageEndpoints: ApiEndpoint[] = [
    // Time Series Data
    {
        name: 'TIME_SERIES_INTRADAY',
        description: 'Intraday time series data for stocks',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'TIME_SERIES_INTRADAY',
            symbol: 'AAPL',
            interval: '5min',
            outputsize: 'compact',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Time Series',
        provider: 'alphavantage'
    },
    {
        name: 'TIME_SERIES_DAILY',
        description: 'Daily time series data for stocks',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'TIME_SERIES_DAILY',
            symbol: 'AAPL',
            outputsize: 'compact',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Time Series',
        provider: 'alphavantage'
    },
    {
        name: 'TIME_SERIES_WEEKLY',
        description: 'Weekly time series data for stocks',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'TIME_SERIES_WEEKLY',
            symbol: 'AAPL',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Time Series',
        provider: 'alphavantage'
    },
    {
        name: 'TIME_SERIES_MONTHLY',
        description: 'Monthly time series data for stocks',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'TIME_SERIES_MONTHLY',
            symbol: 'AAPL',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Time Series',
        provider: 'alphavantage'
    },

    // Technical Indicators
    {
        name: 'SMA',
        description: 'Simple Moving Average',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'SMA',
            symbol: 'AAPL',
            interval: 'daily',
            time_period: 20,
            series_type: 'close',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Technical Indicators',
        provider: 'alphavantage'
    },
    {
        name: 'EMA',
        description: 'Exponential Moving Average',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'EMA',
            symbol: 'AAPL',
            interval: 'daily',
            time_period: 20,
            series_type: 'close',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Technical Indicators',
        provider: 'alphavantage'
    },
    {
        name: 'RSI',
        description: 'Relative Strength Index',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'RSI',
            symbol: 'AAPL',
            interval: 'daily',
            time_period: 14,
            series_type: 'close',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Technical Indicators',
        provider: 'alphavantage'
    },
    {
        name: 'MACD',
        description: 'Moving Average Convergence Divergence',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'MACD',
            symbol: 'AAPL',
            interval: 'daily',
            series_type: 'close',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Technical Indicators',
        provider: 'alphavantage'
    },

    // Fundamental Data
    {
        name: 'OVERVIEW',
        description: 'Company overview and fundamental data',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'OVERVIEW',
            symbol: 'AAPL',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Fundamental Data',
        provider: 'alphavantage'
    },
    {
        name: 'EARNINGS',
        description: 'Company earnings data',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'EARNINGS',
            symbol: 'AAPL',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Fundamental Data',
        provider: 'alphavantage'
    },
    {
        name: 'INCOME_STATEMENT',
        description: 'Company income statement',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'INCOME_STATEMENT',
            symbol: 'AAPL',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Fundamental Data',
        provider: 'alphavantage'
    },
    {
        name: 'BALANCE_SHEET',
        description: 'Company balance sheet',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'BALANCE_SHEET',
            symbol: 'AAPL',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Fundamental Data',
        provider: 'alphavantage'
    },
    {
        name: 'CASH_FLOW',
        description: 'Company cash flow statement',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'CASH_FLOW',
            symbol: 'AAPL',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Fundamental Data',
        provider: 'alphavantage'
    },

    // Market Data
    {
        name: 'GLOBAL_QUOTE',
        description: 'Global stock quote',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'GLOBAL_QUOTE',
            symbol: 'AAPL',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Market Data',
        provider: 'alphavantage'
    },
    {
        name: 'TOP_GAINERS_LOSERS',
        description: 'Top gainers and losers',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'TOP_GAINERS_LOSERS',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Market Data',
        provider: 'alphavantage'
    },
    {
        name: 'SECTOR',
        description: 'Sector performance',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'SECTOR',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Market Data',
        provider: 'alphavantage'
    },

    // News & Sentiment
    {
        name: 'NEWS_SENTIMENT',
        description: 'News sentiment analysis',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'NEWS_SENTIMENT',
            tickers: 'AAPL',
            limit: 50,
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'News & Sentiment',
        provider: 'alphavantage'
    },

    // Forex
    {
        name: 'FX_DAILY',
        description: 'Daily forex exchange rates',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'FX_DAILY',
            from_symbol: 'USD',
            to_symbol: 'EUR',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Forex',
        provider: 'alphavantage'
    },

    // Cryptocurrency
    {
        name: 'DIGITAL_CURRENCY_DAILY',
        description: 'Daily cryptocurrency data',
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        parameters: {
            function: 'DIGITAL_CURRENCY_DAILY',
            symbol: 'BTC',
            market: 'USD',
            apikey: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
        category: 'Cryptocurrency',
        provider: 'alphavantage'
    }
]

// Finnhub API Endpoints
export const finnhubEndpoints: ApiEndpoint[] = [
    {
        name: 'quote',
        description: 'Real-time stock quote',
        url: 'https://finnhub.io/api/v1/quote',
        method: 'GET',
        parameters: {
            symbol: 'AAPL',
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'Market Data',
        provider: 'finnhub'
    },
    {
        name: 'company-profile',
        description: 'Company profile information',
        url: 'https://finnhub.io/api/v1/stock/profile2',
        method: 'GET',
        parameters: {
            symbol: 'AAPL',
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'Company Data',
        provider: 'finnhub'
    },
    {
        name: 'company-news',
        description: 'Company news',
        url: 'https://finnhub.io/api/v1/company-news',
        method: 'GET',
        parameters: {
            symbol: 'AAPL',
            from: '2023-01-01',
            to: '2023-12-31',
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'News',
        provider: 'finnhub'
    },
    {
        name: 'market-news',
        description: 'General market news',
        url: 'https://finnhub.io/api/v1/news',
        method: 'GET',
        parameters: {
            category: 'general',
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'News',
        provider: 'finnhub'
    },
    {
        name: 'earnings',
        description: 'Company earnings calendar',
        url: 'https://finnhub.io/api/v1/calendar/earnings',
        method: 'GET',
        parameters: {
            from: '2023-01-01',
            to: '2023-12-31',
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'Earnings',
        provider: 'finnhub'
    },
    {
        name: 'recommendation-trends',
        description: 'Analyst recommendation trends',
        url: 'https://finnhub.io/api/v1/stock/recommendation',
        method: 'GET',
        parameters: {
            symbol: 'AAPL',
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'Analyst Data',
        provider: 'finnhub'
    },
    {
        name: 'price-target',
        description: 'Analyst price targets',
        url: 'https://finnhub.io/api/v1/stock/price-target',
        method: 'GET',
        parameters: {
            symbol: 'AAPL',
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'Analyst Data',
        provider: 'finnhub'
    },
    {
        name: 'candles',
        description: 'Stock candles (OHLCV data)',
        url: 'https://finnhub.io/api/v1/stock/candle',
        method: 'GET',
        parameters: {
            symbol: 'AAPL',
            resolution: 'D',
            from: 1609459200,
            to: 1640995200,
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'Market Data',
        provider: 'finnhub'
    },
    {
        name: 'insider-transactions',
        description: 'Insider trading transactions',
        url: 'https://finnhub.io/api/v1/stock/insider-transactions',
        method: 'GET',
        parameters: {
            symbol: 'AAPL',
            from: '2023-01-01',
            to: '2023-12-31',
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'Insider Trading',
        provider: 'finnhub'
    },
    {
        name: 'institutional-ownership',
        description: 'Institutional ownership data',
        url: 'https://finnhub.io/api/v1/stock/institutional-ownership',
        method: 'GET',
        parameters: {
            symbol: 'AAPL',
            from: '2023-01-01',
            to: '2023-12-31',
            token: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 1000 },
        category: 'Ownership',
        provider: 'finnhub'
    }
]

// Indian Stock API Endpoints (Generic structure - needs actual API documentation)
export const indianStockEndpoints: ApiEndpoint[] = [
    {
        name: 'nse-quote',
        description: 'NSE stock quote',
        url: 'https://api.indianstock.com/quote',
        method: 'GET',
        parameters: {
            symbol: 'RELIANCE',
            exchange: 'NSE',
            api_key: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 30, requestsPerDay: 500 },
        category: 'Market Data',
        provider: 'indianstock'
    },
    {
        name: 'bse-quote',
        description: 'BSE stock quote',
        url: 'https://api.indianstock.com/quote',
        method: 'GET',
        parameters: {
            symbol: 'RELIANCE',
            exchange: 'BSE',
            api_key: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 30, requestsPerDay: 500 },
        category: 'Market Data',
        provider: 'indianstock'
    },
    {
        name: 'indian-market-status',
        description: 'Indian market status',
        url: 'https://api.indianstock.com/market-status',
        method: 'GET',
        parameters: {
            api_key: 'YOUR_API_KEY'
        },
        responseFormat: 'json',
        rateLimit: { requestsPerMinute: 30, requestsPerDay: 500 },
        category: 'Market Data',
        provider: 'indianstock'
    }
]

export const apiProviders: Record<string, ApiProvider> = {
    alphavantage: {
        name: 'Alpha Vantage',
        baseUrl: 'https://www.alphavantage.co/query',
        apiKey: process.env.ALPHAVANTAGE_API_KEY || '',
        endpoints: alphaVantageEndpoints,
        rateLimits: {
            free: { requestsPerMinute: 5, requestsPerDay: 500 },
            premium: { requestsPerMinute: 75, requestsPerDay: -1 }
        }
    },
    finnhub: {
        name: 'Finnhub',
        baseUrl: 'https://finnhub.io/api/v1',
        apiKey: process.env.FINHUB_API || '',
        endpoints: finnhubEndpoints,
        rateLimits: {
            free: { requestsPerMinute: 60, requestsPerDay: 1000 }
        }
    },
    indianstock: {
        name: 'Indian Stock API',
        baseUrl: 'https://api.indianstock.com',
        apiKey: process.env.INDIAN_STOCK_API || '',
        endpoints: indianStockEndpoints,
        rateLimits: {
            free: { requestsPerMinute: 30, requestsPerDay: 500 }
        }
    }
}

export function getAllEndpoints(): ApiEndpoint[] {
    return [
        ...alphaVantageEndpoints,
        ...finnhubEndpoints,
        ...indianStockEndpoints
    ]
}

export function getEndpointsByProvider(provider: string): ApiEndpoint[] {
    return getAllEndpoints().filter(endpoint => endpoint.provider === provider)
}

export function getEndpointsByCategory(category: string): ApiEndpoint[] {
    return getAllEndpoints().filter(endpoint => endpoint.category === category)
}

export function getProviderInfo(provider: string): ApiProvider | undefined {
    return apiProviders[provider]
}
